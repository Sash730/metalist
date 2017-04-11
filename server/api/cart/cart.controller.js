'use strict';

import {Order} from '../order/order.model';
import * as log4js from 'log4js';
import * as crypto  from 'crypto';

const logger = log4js.getLogger('Cart');

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

export function createCart(req, res) {
  let publicId = crypto.randomBytes(20).toString('hex');
  let cart = new Order({
    type: 'cart',
    publicId: publicId
  });

  return cart.save()
    .then(cart => {
      req.session.cart = cart.publicId;
      return cart;
    })
    .then(respondWithResult(res))
    .catch(handleError(res))
}

export function getCart(req, res) {
  let publicId = req.params.cart;

  Order.findOne({publicId: publicId})
    .populate({path: 'seats'})
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res))
  ;
}
