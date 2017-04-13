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

//private functions
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

// function createNewTicket(cart, match, price, seat) {
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
// }

function doTicketsSecure(cart) {
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
}

function updateTicketsInCheckout(order) {
  order.tickets.map((ticket) => {
    Ticket.findOne({_id: ticket.id})
      .then(ticket => {
        ticket.reserveDate = moment().add(30, 'minutes');

        return ticket.save();
      });
  });
}

let addUserToGuestCard = (guestCart, user) => {
  guestCart.user = {
    id: user.id,
    email: user.email,
    name: user.name
  };

  return guestCart.save();
}

function updateSoldTickets(order) {
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
}

function getLiqPayParams(req) {
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
}

function getOrderAfterLiqpayByEnvironment(req) {
  if (config.env === 'development') {
    return processLiqpayRequest(req);
  }
  if (config.env === 'production') {
    return getLiqPayParams(req)
      .then(params => {
        return Order.findOne({orderNumber: params.order_id, type: 'order'});
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
