'use strict';

import Match from '../match/match.model';
import Ticket from '../ticket/ticket.model';
import User from '../user/user.model';
import {Order} from './order.model';
import PriceSchema from "../priceSchema/priceSchema.model";
import {Stadium} from '../../stadium';
import * as _ from 'lodash';
import * as config from "../../config/environment";
import * as crypto from "crypto";
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
          logger.info("respondWithResult "+entity._id);
            return res.status(statusCode).json(entity);
        }
    };
}

function handleEntityNotFound(res) {
      return function (entity) {
        logger.info("handleEntityNotFound "+ entity._id);
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
      logger.error('handleError '+err);
      //logger.error('handleError '+res.req.headers);
        res.status(err.statusCode || statusCode).send(err);
    };
}

let sendMessage = (ticket) => {
  Mailer.sendMail( ticket.user.email, ticket);
};

let createNewTicket = (cart, match, price, seat) => {
  let ticket = new Ticket({
    cartId: cart.id,
    accessCode: randomNumericString(16),
    match:  {
      id: match.id,
      headline: match.headline,
      round: match.round,
      date: match.date
    },
    seat: {
      id: seat.id,
      tribune: seat.tribune,
      sector: seat.sector,
      row: seat.row,
      number: seat.number
    },
    amount: parseInt(price) * 100,//money formatted(for liqpay)
    reserveDate: moment(),
    status: 'new',
    valid: {
      from: ((d) => { let d1 = new Date(d); d1.setHours(0,0,0,0); return d1; })(match.date),
      to: ((d) => { let d1 = new Date(d); d1.setHours(23,59,59,0); return d1; })(match.date)
    },
    timesUsed: 0
  });

  return ticket.save();
};

let createOrUpdateTicket = (cart, match, ticket,  price, seat) => {
  if (!ticket) {
    return createNewTicket(cart, match, price, seat);
  }

  ticket.cartId = cart._id;
  ticket.reserveDate = Date.now();

  return ticket.save();
};

let doTicketsSecure = (cart) => {
  cart.tickets =  cart.tickets.map(ticket => {
    return {
      cartId: ticket.cartId,
      match:  {
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
        ticket.reserveDate = moment();

        return ticket.save();
    });
  });
};

let getPriceInPriceSchema = (priceSchema, tribuneName, sectorName) => {
  let schema = priceSchema.priceSchema;

  if (!schema['tribune_'+tribuneName]) {
    return false;
  }
  if (schema['tribune_'+tribuneName]['sector_'+sectorName]) {
    let price  = schema['tribune_'+tribuneName]['sector_'+sectorName].price;

    if (!price) {
      return schema['tribune_'+tribuneName].price;
    }
    return price;
  } else {
    return schema['tribune_'+tribuneName].price;
  }
};

let checkPriceInPriceSchema = (priceSchemaId, tribuneName, sectorName, price) => {
  return PriceSchema.findById(priceSchemaId)
    .then(priceSchema => {
      if(!priceSchema) {
        throw new Error('Price schema not found');
      }
      let priceInPriceSchema = getPriceInPriceSchema(priceSchema, tribuneName, sectorName);

      if(!priceInPriceSchema) {
        throw new Error('Price in price schema not found');
      }

      if (priceInPriceSchema !== price) {
        throw new Error('Стоимость билета и прайс схемы не совпадает');
      } else {
        return price;
      }
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
        sendMessage(ticket);

        return ticket;
      });
  });
};

let getLiqPayParams = (req) => {
  return new Promise((resolve, reject) => {
    if(!req.body.data || !req.body.signature) {
      return reject(new Error('data or signature missing'));
    }

    if(LiqPay.signString(req.body.data) !== req.body.signature) {
      return reject(new Error('signature is wrong'));
    }

    return resolve(JSON.parse(new Buffer(req.body.data, 'base64').toString('utf-8')));
  })
};

let deleteTicketFromCart = (cart, seatId) => {
  let [ ticket ] = _.filter(cart.tickets, function (ticket) {

    if (ticket.seat.id === seatId) {
      return ticket;
    }
  });

  if(!ticket) {
    throw new Error('Ticket not found in cart')
  }
  cart.amount -= ticket.amount;
  cart.tickets.splice(cart.tickets.indexOf(ticket), 1);

  return cart.save();
};

let processLiqpayRequest = (request) => {

  return getLiqPayParams(request)
        .then(params => {
            return Promise.all([
                Order.findOne({orderNumber: params.order_id, type: 'order', status: 'new'})
                  .populate({path: 'tickets'}),
                params
            ]);
        })
        .then(([order, params]) => {
            if(!order) {
                throw new Error('Order not found');
            }
            order.paymentDetails = params;

            let ticketPromises = [];
            if(params.status === 'success' || params.status === 'sandbox') {
                order.status = 'paid';

                ticketPromises = updateSoldTickets(order);

            } else {
                order.status = 'failed';
            }

            return Promise.all([order.save()].concat(ticketPromises));
        });
};

const createPaymentLink = (order) => {
    let orderDescription = _.reduce(order.tickets, (description, ticket) => {
        return `${description} ${ticket.match.headline} (sector #${ticket.seat.sector}, row #${ticket.seat.row}, number #${ticket.seat.number}) | `;
    }, '');

    let paymentParams = {
        'action': 'pay',
        'amount': order.formattedAmount,
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
    let cartId = req.session.cart,
        seat = req.body.seat,
        tribuneName = req.body.tribuneName,
        sectorName = req.body.sectorName,
        rowName = req.body.rowName,
        seatId = 's' + sectorName + 'r' + rowName + 'st' + seat,
        priceSchemaId = req.body.match.priceSchema.id,
        timeEndTicketReserve = moment().subtract(30, 'minutes'),
        price = req.body.price;

  let checkSeatInStadium = new Promise((resolve, reject) => {
    let row = Stadium['tribune_'+tribuneName]['sector_'+sectorName]
      .rows.filter(row => row.name === rowName);

    if(row.length && seat <= row[0].seats) {
      resolve({
        id: seatId,
        tribune: tribuneName,
        sector: sectorName,
        row: rowName,
        number: seat
      });
    } else {
      reject(new Error('cannot find seat in the stadium'));
    }
  });

  Promise.all([
               Order.findOne({_id: cartId, type: 'cart'})
                    .populate({path: 'tickets'}),
               Match.findById(req.body.match.id),
               Ticket.findOne({ 'match.id': req.body.match.id, 'seat.id': seatId }),
               checkPriceInPriceSchema(priceSchemaId, tribuneName, sectorName, price),
               checkSeatInStadium
              ])
      .then(([cart, match, ticket, price, seat]) => {
          if(!cart) {
              throw new Error('Cart not found');
          }
          if(!match) {
              throw new Error('Match not found');
          }
          if (ticket && ( ticket.status === 'paid' || ticket.reserveDate > timeEndTicketReserve )) {
            return {
                    tickets: cart.tickets,
                    message: 'This ticket is already taken.'
                   };
          }
         return createOrUpdateTicket(cart, match, ticket,  price, seat)
          .then(ticket => {
            cart.tickets.push(ticket._id);
            cart.amount += ticket.amount;
             return cart.save();
          })
          .then((cart) => {
            return Order.findOne({_id: cart.id})
                 .populate({path: 'tickets'});
          })
           .then(cart => {
             return doTicketsSecure(cart);
           })
      })
      .then(respondWithResult(res))
      .catch(handleError(res));
}

export function deleteItemFromCart(req, res) {
  let cartId = req.session.cart,
    seatId = req.params.seatId;

    Order.findOne({_id: cartId, type: 'cart'})
        .populate({path: 'tickets'})
        .then(handleEntityNotFound(res))
        .then(cart => {
          return deleteTicketFromCart(cart, seatId);
        })
        .then(cart => {
           Ticket.findOne({cartId: cart._id, 'seat.id': seatId})
             .then(ticket => {
                ticket.cartId = '';
                ticket.reserveDate = null;

                ticket.save();
             });

          return doTicketsSecure(cart);
        })
        .then(respondWithResult(res))
        .catch(handleError(res))
    ;
}

export function getCart(req, res) {
    let cartId = req.session.cart;

    Order.findOne({_id: cartId, type: 'cart'})
      .populate({path: 'tickets'})
      .then(cart => {
        return doTicketsSecure(cart);
      })
        .then(handleEntityNotFound(res))
        .then(respondWithResult(res))
        .catch(handleError(res))
    ;
}

export function getUserCart(req, res) {
  let userId = req.user.id,
      cartId = req.session.cart;

  Promise.all([
    Order.findOne({_id: cartId, type: 'cart'})
         .populate({path: 'tickets'}),
    Order.findOne({'user.id': userId, type: 'cart'})
         .populate({path: 'tickets'}),
    User.findById(userId)
  ])
    .then(([guestCart, userCart, user]) => {
      if(!userCart) {
        return addUserToGuestCard(guestCart, user);
      } else {

        if (!guestCart.tickets.length) {
          req.session.cart = userCart.id;

          return userCart;
        }

        return addUserToGuestCard(guestCart, user);
      }
    })
    .then(cart => {
      return doTicketsSecure(cart);
    })
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res))
  ;
}

export function convertCartToOrder(req, res) {
    let cartId = req.session.cart,
        requestUserId = req.body.user.id;

    let userPromise = new Promise((resolve, reject) => {
        if(requestUserId && requestUserId === req.user.id) {
            resolve({
                id: requestUserId,
                name: req.user.name,
                email: req.user.email
            });
        } else if(req.body.user) {
            resolve({
                name: req.body.user.name,
                email: req.body.user.email
            });
        } else {
            reject(new Error('cannot determine user on converting cart to order'));
        }
    });
    var cartPromise = Order.findOne({_id: cartId, type: 'cart'})
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
            if(!req.session.orderIds) {
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
  return getLiqPayParams(req)
    .then(params =>{
      return Order.findOne({orderNumber: params.order_id, type: 'order'});
    })
    .then(order => {
      if(!order) {
        throw new Error('Order not found');
      }
      return res.redirect('/my/orders/'+order.orderNumber);
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
    Order.findOne({orderNumber: req.params.orderNumber, type: 'order'})
      .populate({path: 'tickets'})
        .then((order) => {
            if(!order) {
                throw new Error('Order not found');
            }

            return order;
        })
        .then(order => {
            order = order.toObject();
            if(order.statusNew) {
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
                        bcid:        'code128',       // Barcode type
                        text:        ticket.accessCode,     // Text to encode
                        scale:       3,               // 3x scaling factor
                        height:      10,              // Bar height, in millimeters
                        includetext: true,            // Show human-readable text
                        textxalign:  'center',        // Always good to set this
                        textsize:    13               // Font size, in points
                    }, function (err, png) {
                        // png is a Buffer. can be saved into file if needed  fs.writeFile(ticket._id + '.png', png)

                        if (err) {
                            reject(err);
                        } else {
                            ticket.barcodeUri =  'data:image/png;base64,' + png.toString('base64');
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

export function getAllOrders(req, res) {

  Order.find().sort({created: -1})
    .populate({path: 'tickets'})
    .then(respondWithResult(res))
  ;
}
