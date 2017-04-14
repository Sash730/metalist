'use strict';

import Order from './order.model';
import User from '../user/user.model';
import * as crypto from 'crypto';
import * as priceSchemeService from '../priceSchema/priceSchema.service';
import * as seatService from '../seat/seat.service';
import * as ticketService from '../ticket/ticket.service';
import * as LiqPay from '../../liqpay';
import * as config from "../../config/environment";
import * as Mailer from '../../mailer/mailer.js';
import * as log4js from 'log4js';

const logger = log4js.getLogger('Order');


export function findCartByPublicId(publicId) {
  return Order.findOne({publicId: publicId})
    .populate('seats');
}

export function createOrderFromCart(cart, user) {
  return countPriceBySeats(cart.seats)
    .then(price => {
      let order = new Order({
        user: {
          id: user.id,
          name: user.name,
          email: user.email
        },
        seats: cart.seats,
        type: 'order',
        status: 'new',
        publicId: crypto.randomBytes(20).toString('hex'),
        created: new Date(),
        price: price
      });

      return order.save();
    })
}

export function createPaymentLink(order) {
  let orderDescription = order.seats.reduce((description, seat) => {
    return `${description} ${seat.sector} сектор, ${seat.row} ряд, ${seat.seat} место ${seat.price} грн | `;
  }, '');

  let paymentParams = {
    'action': 'pay',
    'amount': order.price,
    'currency': 'UAH',
    'description': orderDescription,
    'order_id': order.publicId,
    'sandbox': config.liqpay.sandboxMode,
    'server_url': config.liqpay.callbackUrl,
    'result_url': config.liqpay.redirectUrl
  };

  return LiqPay.generatePaymentLink(paymentParams);
}

export function processLiqpayRequest(request) {
  return getLiqPayParams(request)
    .then(params => {
      return Promise.all([
        findCartByPublicId(params.order_id),
        params
      ]);
    })
    .then(([order, params]) => {
      if (!order) {
        throw new Error('Order not found');
      }
      order.paymentDetails = params;
      if (params.status === 'success' || params.status === 'sandbox') {
        order.status = 'paid';
        logger.info('paid order: ' + order);
        return handleSuccessPayment(order);
      } else {
        order.status = 'failed';
        return order.save();
      }
    })
    .catch(error => {
      logger.error('liqpayCallback error: ' + error);
    });
}

export function getLiqPayParams(req) {
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


function handleSuccessPayment(order) {
  return Promise.all([
    User.findOne({_id: order.user.id}),
    createTicketsByOrder(order),
    seatService.reserveSeatsAsPaid(order.seats)
  ])
    .then(([user, tickets]) => {
      user.tickets = tickets;
      return user.save()
    })
    .then(user => {
      order.tickets = user.tickets;
      return order.save();
    })
    .then(() => {
      return Mailer.sendMailByOrder(order);
    })
    .catch(error => {
      logger.error('handleSuccessPayment error: ' + error);
    });
}

function createTicketsByOrder(order) {
  return Promise.all(order.seats.map(seat => {
    return ticketService.createTicket(seat);
  }));
}

function countPriceBySeats(seats) {
  return Promise.all(seats.map(seat => {
    return priceSchemeService.getSeatPrice(seat);
  })).then(prices => prices.reduce((sum, price) => {
    return sum + price;
  }, 0))
}

