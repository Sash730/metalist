'use strict';

import Match from '../match/match.model';
import Ticket from '../ticket/ticket.model';
import * as seatService from '../seat/seat.service';
import User from '../user/user.model';
import Seat from '../seat/seat.model';
import {Order} from './order.model';
import PriceSchema from "../priceSchema/priceSchema.model";
import {Stadium} from '../../stadium';
import { PAID, RESERVE } from '../seat/seat.constants';
import * as _ from 'lodash';
import * as config from "../../config/environment";
import * as LiqPay from '../../liqpay';
import * as Mailer from '../../mailer/mailer.js';
import * as uuid from 'node-uuid';
import * as barcode from 'bwip-js';
import * as log4js from 'log4js';

const logger = log4js.getLogger('Order'),
  moment = require('moment');

function respondWithResult(res, statusCode) {
  statusCode = statusCode || 200;
  return function (entity) {
    if (entity) {
      return res.status(statusCode).json(entity);
    }
  };
}

function handleEntityNotFound(res) {
  return function (entity) {
    if (!entity) {
      res.status(404).end();
      return null;
    }
    return entity;
  };
}

function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return function (err) {
    logger.error('Error: ' + err);
    res.status(err.statusCode || statusCode).send(err);
  };
}

let sendMessage = (order) => {
  Mailer.sendMail(order.user.email, order);
};

// let createNewTicket = (cart, match, price, seat) => {
//   let ticket = new Ticket({
//     cartId: cart.id,
//     accessCode: randomNumericString(16),
//     match: { //@TODO investigate if it's required to have all match info here
//       id: match.id,
//       headline: match.headline,
//       round: match.round,
//       date: match.date
//     },
//     seat: { //@TODO investigate if it's required to have all these fields here
//       id: seat.id,
//       tribune: seat.tribune,
//       sector: seat.sector,
//       row: seat.row,
//       number: seat.number
//     },
//     amount: parseInt(price) * 100,//money formatted(for liqpay)
//     reserveDate: moment().add(30, 'minutes'),
//     status: 'new', // @TODO make all statuses as constants
//     ticketNumber: uuid.v1(), //@TODO mostly this number should be created only after ticket is paid
//     valid: { //@TODO investigate if it's necessary
//       from: ((d) => {
//         let d1 = new Date(d);
//         d1.setHours(0, 0, 0, 0);
//         return d1;
//       })(match.date),
//       to: ((d) => {
//         let d1 = new Date(d);
//         d1.setHours(23, 59, 59, 0);
//         return d1;
//       })(match.date)
//     },
//     timesUsed: 0 //@TODO investigate if it's necessary
//   });
//
//   return ticket.save();
// };

let doTicketsSecure = (cart) => {
  cart.tickets = cart.tickets.map(ticket => {
    return {
      cartId: ticket.cartId,
      match: {
        id: ticket.match.id,
        headline: ticket.match.headline,
        round: ticket.match.round,
        date: ticket.match.date
      },
      seat: {
        id: ticket.seat.id,
        tribune: ticket.seat.tribune,
        sector: ticket.seat.sector,
        row: ticket.seat.row,
        number: ticket.seat.number
      },
      reserveDate: ticket.reserveDate,
      amount: ticket.amount,
      status: ticket.status
    };
  });
  return cart;
};

let updateTicketsInCheckout = (order) => {
  order.tickets.map((ticket) => {
    Ticket.findOne({_id: ticket.id})
      .then(ticket => {
        ticket.reserveDate = moment().add(30, 'minutes');

        return ticket.save();
      });
  });
};

let addUserToGuestCard = (guestCart, user) => {
  guestCart.user = {
    id: user.id,
    email: user.email,
    name: user.name
  };

  return guestCart.save();
};

let updateSoldTickets = (order) => {
  return order.tickets.map((ticket) => {
    Ticket.findOne({_id: ticket.id})
      .then(ticket => {
        ticket.orderNumber = order.orderNumber;
        ticket.status = 'paid';
        ticket.user = {
          email: order.user.email,
          name: order.user.name
        };
        return ticket.save();
      })
      .then((ticket) => {
        return ticket;
      });
  });
};

let getLiqPayParams = (req) => {
  return new Promise((resolve, reject) => {
    if (!req.body.data || !req.body.signature) {
      return reject(new Error('data or signature missing'));
    }

    if (LiqPay.signString(req.body.data) !== req.body.signature) {
      return reject(new Error('signature is wrong'));
    }

    return resolve(JSON.parse(new Buffer(req.body.data, 'base64').toString('utf-8')));
  })
};

let processLiqpayRequest = (request) => {
  return getLiqPayParams(request)
    .then(params => {
      return Promise.all([
        Order.findOne({orderNumber: params.order_id})
          .populate({path: 'tickets'}),
        params
      ]);
    })
    .then(([order, params]) => {
      if (!order) {
        throw new Error('Order not found');
      }
      order.paymentDetails = params;
      let ticketPromises = [];
      if (params.status === 'success' || params.status === 'sandbox') {
        order.status = 'paid';

        ticketPromises = updateSoldTickets(order);
      } else {
        order.status = 'failed';
      }
      return Promise.all([order.save()].concat(ticketPromises))
    })
    .then(([order]) => {
      sendMessage(order);

      return order;
    });
};

let getOrderAfterLiqpayByEnvironment = (req) => {
  if (config.env === 'development') {
    return processLiqpayRequest(req);
  }
  if (config.env === 'production') {
    return getLiqPayParams(req)
      .then(params => {
        return Order.findOne({orderNumber: params.order_id, type: 'order'});
      });
  }
};

const createPaymentLink = (order) => {
  let orderDescription = _.reduce(order.tickets, (description, ticket) => {
    return `${description} ${ticket.match.headline} (sector #${ticket.seat.sector}, row #${ticket.seat.row}, number #${ticket.seat.number}) | `;
  }, '');

  let paymentParams = {
    'action': 'pay',
    'amount': order.amount,
    'currency': 'UAH',
    'description': orderDescription,
    'order_id': order.orderNumber,
    'sandbox': config.liqpay.sandboxMode,
    'server_url': config.liqpay.callbackUrl,
    'result_url': config.liqpay.redirectUrl
  };

  return LiqPay.generatePaymentLink(paymentParams);
};

function randomNumericString(length) {
  let chars = '0123456789';
  let result = '';
  for (let i = length; i > 0; --i) result += chars[Math.round(Math.random() * (chars.length - 1))];
  return result;
}

export function updateCart(req, res) {
  let publicId = req.session.cart,
    seat = req.body.seat,
    tribuneName = req.body.tribuneName,
    sectorName = req.body.sectorName,
    rowName = req.body.rowName,
    slug = 's' + sectorName + 'r' + rowName + 'st' + seat,
    reserveDate = moment().add(30, 'minutes'),
    priceSchemaId = req.body.priceSchemaId;

  Promise.all([
    Order.findOne({publicId: publicId, type: 'cart'})
         .populate({path: 'seats'}),
    seatService.findSeatBySlug(slug),
    getPriceInPriceSchema(priceSchemaId, tribuneName, sectorName),
    checkSeatInStadium(tribuneName, sectorName, rowName, seat)
  ])
    .then(([cart, reserveSeat, price, seat]) => {
      if (!cart) {
        throw new Error('Cart not found');
      }
      // if (!match) {
      //   throw new Error('Match not found');
      // }
      if ( reserveSeat.reservationType === PAID || reserveSeat.reservedUntil > moment() ) {
        return {
          seats: cart.seats,
          message: 'Это место уже занято.'
        };
      }
      return seatService.reserveSeatAsReserve(reserveSeat, reserveDate, cart.publicId)
        .then(reserveSeat => {
          cart.seats.push(reserveSeat.id);
          return cart.save();
        })
        .then((cart) => {
          return Order.findOne({publicId: cart.publicId})
            .populate({path: 'seats'});
        })
    })
    .then(respondWithResult(res))
    .catch(handleError(res));
}

export function deleteItemFromCart(req, res) {
  let publicId = req.session.cart,
      slug = req.params.seatId;

  Order.findOne({publicId: publicId, type: 'cart'})
    .populate({path: 'seats'})
    .then(handleEntityNotFound(res))
    .then(cart => {
      return deleteReserveSeatFromCart(cart, slug);
    })
    .then(cart => {
      seatService.findSeatByCart(cart.publicId, slug)
        .then(seat => {
          if (seat) {
            seatService.clearReservation(seat);
          }
        });
      return cart;
    })
    .then(respondWithResult(res))
    .catch(handleError(res))
  ;
}

export function convertCartToOrder(req, res) {
  let cartId = req.session.cart,
    requestUserId = req.body.user.id;

  let userPromise = new Promise((resolve, reject) => {
    if (requestUserId && requestUserId === req.user.id) {
      resolve({
        id: requestUserId,
        name: req.user.name,
        email: req.user.email
      });
    } else if (req.body.user) {
      resolve({
        name: req.body.user.name,
        email: req.body.user.email
      });
    } else {
      reject(new Error('cannot determine user on converting cart to order'));
    }
  });
  let cartPromise = Order.findOne({_id: cartId, type: 'cart'})
      .populate({path: 'tickets'})
      .then(handleEntityNotFound(res))
    ;

  Promise
    .all([userPromise, cartPromise])
    .then(([user, cart]) => {
      cart.user = user;
      cart.type = 'order';
      cart.orderNumber = uuid.v1();
      cart.created = new Date();

      return cart.save();
    })
    .then(order => {
      delete req.session.cart;
      if (!req.session.orderIds) {
        req.session.orderIds = [];
      }
      req.session.orderIds.push(order.id);

      updateTicketsInCheckout(order);
      return order;
    })
    .then(order => {
      return {'paymentLink': createPaymentLink(order)};
    })
    .then(respondWithResult(res))
    .catch(handleError(res))
  ;
}

export function liqpayRedirect(req, res, next) {
  return getOrderAfterLiqpayByEnvironment(req)
    .then(order => {
      if (!order) {
        throw new Error('Order not found');
      }
      return res.redirect('/my/orders/' + order.orderNumber);
    })
    .catch(handleError(res))
    ;
}

export function liqpayCallback(req, res, next) {
  return processLiqpayRequest(req)
    .then(respondWithResult(res))
    .catch(handleError(res))
    ;
}

export function getOrderByNumber(req, res) {
  let userId = req.user.id;

  Order.findOne({orderNumber: req.params.orderNumber, type: 'order', 'user.id': userId})
    .populate({path: 'tickets'})
    .then((order) => {
      if (!order) {
        throw new Error('Order not found');
      }

      return order;
    })
    .then(order => {
      order = order.toObject();
      if (order.statusNew) {
        order.paymentLink = createPaymentLink(order);
        order.tickets = [];
      }

      return order;
    })
    .then(respondWithResult(res))
    .catch(handleError(res))
  ;
}

export function getOrderedTickets(req, res) {
  Ticket.find({orderNumber: req.params.orderNumber})
    .then((tickets) => {
      return Promise.all(tickets.map(ticket => {
        ticket = ticket.toObject();

        return new Promise((resolve, reject) => {
          barcode.toBuffer({
            bcid: 'code128',       // Barcode type
            text: ticket.accessCode,     // Text to encode
            scale: 3,               // 3x scaling factor
            height: 10,              // Bar height, in millimeters
            includetext: true,            // Show human-readable text
            textxalign: 'center',        // Always good to set this
            textsize: 13               // Font size, in points
          }, function (err, png) {
            // png is a Buffer. can be saved into file if needed  fs.writeFile(ticket._id + '.png', png)

            if (err) {
              reject(err);
            } else {
              ticket.barcodeUri = 'data:image/png;base64,' + png.toString('base64');
              resolve(ticket);
            }
          })
        });
      }));
    })
    .then(respondWithResult(res))
    .catch(handleError(res))
  ;
}

export function getMyOrders(req, res) {

  Order.find({'user.id': req.user.id, type: 'order'}).sort({created: -1})
    .then(respondWithResult(res))
  ;
}

function checkSeatInStadium(tribuneName, sectorName, rowName, seat) {
  return new Promise((resolve, reject) => {
    let row = Stadium['tribune_' + tribuneName]['sector_' + sectorName].rows.filter(row => row.name === rowName),
        slug = 's' + sectorName + 'r' + rowName + 'st' + seat;

    if (row.length && seat <= row[0].seats) {
      resolve({
        slug: slug,
        tribune: tribuneName,
        sector: sectorName,
        row: rowName,
        seat: seat
      });
    } else {
      reject(new Error('cannot find seat in the stadium'));
    }
  });
}

function getPriceInPriceSchema(priceSchemaId, tribuneName, sectorName, price) {
  return PriceSchema.findById(priceSchemaId)
    .then(priceSchema => {
      if (!priceSchema) {
        throw new Error('Price schema not found');
      }
      let schema = priceSchema.priceSchema;

      if (!schema['tribune_' + tribuneName]) {
        throw new Error('Tribune not found in price.');
      }
      if (schema['tribune_' + tribuneName]['sector_' + sectorName]) {
        let price = schema['tribune_' + tribuneName]['sector_' + sectorName].price;

        if (!price) {
          return schema['tribune_' + tribuneName].price;
        }
        return price;
      } else {
        return schema['tribune_' + tribuneName].price;
      }
    });
}

function deleteReserveSeatFromCart(cart, slug) {
  cart.seats = cart.seats.filter( seat => seat.slug !== slug );

  return cart.save();
}
