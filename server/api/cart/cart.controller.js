'use strict';

import Order from '../order/order.model';
import moment from 'moment';
import { RESERVE } from '../seat/seat.constants';
import * as seatService from '../seat/seat.service';
import * as orderService from '../order/order.service';
import * as log4js from 'log4js';
import * as crypto  from 'crypto';

const logger = log4js.getLogger('Cart');

export function createCart(req, res) {
  let publicId = crypto.randomBytes(20).toString('hex');
  let cart = new Order({
    type: 'cart',
    publicId: publicId
  });

  return cart.save()
    .then(cart => {
      // req.session.cart = cart.publicId;
      // logger.info('set cart to session: ' + req.session.cart);
      return cart;
    })
    .then(respondWithResult(res))
    .catch(handleError(res))
}

export function getCart(req, res) {
  res.setHeader('Last-Modified', (new Date()).toUTCString());
  let publicId = req.cookies.cart;
  logger.info('get cart form cookies: ' + req.cookies.cart);

  orderService.findCartByPublicId(publicId)
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res))
  ;
}

export function addSeatToCart(req, res) {
  let publicId = req.cookies.cart,
    slug = req.body.slug,
    reserveDate = moment().add(30, 'minutes');
  logger.info('add seat to cart: ' + req.cookies.cart);

  Promise.all([
    orderService.findCartByPublicId(publicId),
    seatService.findSeatBySlug(slug)
  ])
    .then(([cart, seat]) => {
      if (!cart) {
        throw new Error('Cart not found');
      }
      if (!seat) {
        throw new Error('Seat not found');
      }
      if (seat.isReserved) {
        return res.status(409).end();
      }
      return seatService.reserveSeatAsReserve(seat, reserveDate, cart.publicId)
        .then(seat => {
          cart.seats.push(seat.id);
          return cart.save();
        })
        .then(cart => {
          return orderService.findCartByPublicId(cart.publicId);
        })
        .then(respondWithResult(res))
    })
    .catch(handleError(res));
}

export function deleteSeatFromCart(req, res) {
  let publicId = req.cookies.cart,
      slug = req.params.slug;

  return orderService.findCartByPublicId(publicId)
    .then(handleEntityNotFound(res))
    .then(cart => {
      return deleteReserveSeatFromCart(cart, slug);
    })
    .then(cart => {
      return seatService.findSeatByCart(cart.publicId, slug)
        .then(seat => {
          if (seat && seat.reservationType === RESERVE) {
            seatService.clearReservation(seat);
          }
          return cart;
        });
    })
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

function deleteReserveSeatFromCart(cart, slug) {
  cart.seats = cart.seats.filter( seat => seat.slug !== slug );

  return cart.save();
}
