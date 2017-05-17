'use strict';

import * as orderService from '../order/order.service';
import * as seatService from '../seat/seat.service';
import * as config from "../../config/environment";
import * as log4js from 'log4js';

const logger = log4js.getLogger('Order');


export function getPaymentStatus(req, res) {
  return orderService.getPendingPaymentByUser(req.user)
    .then(order => {
      if (order) {
        return {status: true};
      } else {
        return {status: false};
      }
    })
    .then(respondWithResult(res))
    .catch(handleError(res));
}

export function getOrderByPrivateId(req, res) {
  return orderService.getByPrivateId(req.params.privateId)
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

export function checkout(req, res) {
  let publicId = req.cookies.cart;

  return orderService.findCartByPublicId(publicId)
    .then(handleEntityNotFound(res))
    .then(cart => {
      logger.info('checkout cart: ' + cart);
      return Promise.all([
        seatService.extendReservationTime(cart.seats),
        Promise.resolve(cart)
      ]);
    })
    .then(([seats, cart]) => {
      return orderService.createOrderFromCart(cart, req.user);
    })
    .then(order => {
      logger.info('checkout order: ' + order);
      return {'paymentLink': orderService.createPaymentLink(order)};
    })
    .then(respondWithResult(res))
    .catch(handleError(res))
    ;
}

export function liqpayRedirect(req, res) {
  if (config.env === 'development') {
    orderService.processLiqpayRequest(req)
  }

  return orderService.getLiqPayParams(req)
    .then(params => {
      if (params.status === 'success' || params.status === 'sandbox') {
        req.cookies.cart = '';
        return res.redirect('/my/tickets');
      } else {
        return res.redirect('/checkout');
      }
    })
}

export function liqpayCallback(req, res) {
  return orderService.processLiqpayRequest(req)
    .then(respondWithResult(res))
    .catch(handleError(res));
}


// private functions ---------------------

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
