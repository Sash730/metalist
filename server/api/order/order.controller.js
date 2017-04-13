'use strict';

import Ticket from '../ticket/ticket.model';
import * as matchService from '../match/match.service';
import * as orderService from '../order/order.service';
import * as priceSchemaService from '../priceSchema/priceSchema.service';
import * as seatService from '../seat/seat.service';
import * as ticketService from '../ticket/ticket.service';
import User from '../user/user.model';
import Seat from '../seat/seat.model';
import {Order} from './order.model';
import PriceSchema from "../priceSchema/priceSchema.model";
import {Stadium} from '../../stadium';
import {PAID, RESERVE} from '../seat/seat.constants';
import * as crypto  from 'crypto';
import * as config from "../../config/environment";
import * as LiqPay from '../../liqpay';
import * as Mailer from '../../mailer/mailer.js';
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

function sendMessage(order) {
  Mailer.sendMail(order.user.email, order);
}

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
}

function processLiqpayRequest(request) {
  return getLiqPayParams(request)
    .then(params => {
      return Promise.all([
        orderService.findOrderByPublicId(params.order_id),
        params
      ]);
    })
    .then(([order, params]) => {
      if (!order) {
        throw new Error('Order not found');
      }
      order.paymentDetails = params;
      //let ticketPromises = [];
      if (params.status === 'success' || params.status === 'sandbox') {
        order.status = 'paid';
        return handlingSuccessfullOrder(order);
       // ticketPromises = createSoldTickets(order);
      } else {
        return handlingFailedOrder(order);
      }
    })
    .then((order) => {
      sendMessage(order);

      return order;
    });
}

function getOrderAfterLiqpayByEnvironment(req) {
  if (config.env === 'development') {
    return processLiqpayRequest(req);
  }
  if (config.env === 'production') {
    return getLiqPayParams(req)
      .then(params => {
        return Order.findOne({publicId: params.order_id, type: 'order'});
      });
  }
}

function createPaymentLink(order) {
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
}

function randomNumericString(length) {
  let chars = '0123456789';
  let result = '';
  for (let i = length; i > 0; --i) result += chars[Math.round(Math.random() * (chars.length - 1))];
  return result;
}
};

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
      if (reserveSeat.reservationType === PAID || reserveSeat.reservedUntil > moment()) {
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

export function createOrderForPay(req, res) {
  let cartId = req.session.cart;

  let userPromise = new Promise((resolve, reject) => {
    if (req.user) {
      resolve({
        id: req.user.id,
        name: req.user.name,
        email: req.user.email
      });
    } else {
      reject(new Error('cannot determine user on converting cart to order'));
    }
  });
  let cartPromise = Order.findOne({publicId: cartId, type: 'cart'})
      .populate({path: 'seats'})
      .then(handleEntityNotFound(res))
      .then(addAmountToCart);

  Promise
    .all([userPromise, cartPromise])
    .then(([user, cart]) => {
      updateSeatsInCheckout(cart);

      let newOrder = new Order({
        user: user,
        seats: cart.seats,
        type: 'order',
        status: 'new',
        publicId: crypto.randomBytes(20).toString('hex'),
        created: new Date(),
        amount: cart.amount
      });
console.log('newOrder', newOrder);
      return newOrder.save();
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
  cart.seats = cart.seats.filter(seat => seat.slug !== slug);

  return cart.save();
}

function createPaymentLink(order) {
  let orderDescription = order.seats.reduce((description, seat) => {
    return `${description} sector #${seat.sector}, row #${seat.row}, number #${seat.seat} | `;//${ticket.match.headline}
  }, '');

  let paymentParams = {
    'action': 'pay',
    'amount': order.amount,
    'currency': 'UAH',
    'description': orderDescription,
    'order_id': order.publicId,
    'sandbox': config.liqpay.sandboxMode,
    'server_url': config.liqpay.callbackUrl,
    'result_url': config.liqpay.redirectUrl
  };

  return LiqPay.generatePaymentLink(paymentParams);
}

function updateSeatsInCheckout(cart) {
  return Promise.all(cart.seats.map(seat => {
    return seatService.findSeatBySlug(seat.slug)
      .then(seat => {
        seat.reservedUntil = moment().add(30, 'minutes');

        return seat.save();
      });
  }));
}

function addAmountToCart(cart) {
  return getCartAmount(cart)
    .then(amount =>{
      cart.amount = amount;
      return cart;
    });
}

function getCartAmount(cart) {
  return Promise.all(getSeatsAmountPromises(cart))
    .then(amounts => {
        return amounts.reduce((sum, amount) => {
          return sum + parseInt(amount);
        }, 0);
      }
    );
}

function getSeatsAmountPromises(cart) {
  let promises = [];
  cart.seats.map(seat => {
    return promises.push(priceSchemaService.getSeatAmount(seat));
  });

  return promises;
}

function handlingFailedOrder(order) {
  return orderService.removeOrderById(order.id);
}

function handlingSuccessfullOrder(order) {
  return Promise.all([
    User.findOne({_id: order.user.id}),
    createTickets(order)
  ])
    .then(([user, tickets]))
  ;
}

function createTickets(order) {
  return order.seats.map(seat => {
    return ticketService.createTicket(seat);
  });
}
