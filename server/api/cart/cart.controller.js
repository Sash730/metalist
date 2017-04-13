'use strict';

import { Order } from '../order/order.model';
import { PAID } from '../seat/seat.constants';
import moment from 'moment';
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
      req.session.cart = cart.publicId;
      return cart;
    })
    .then(respondWithResult(res))
    .catch(handleError(res))
}

export function getCart(req, res) {
  let publicId = req.session.cart;

  orderService.findCartByPublicId(publicId)
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res))
  ;
}

export function addSeatToCart(req, res) {
  let publicId = req.session.cart,
    slug = req.body.slug,
    reserveDate = moment().add(30, 'minutes');

  Promise.all([
    orderService.findCartByPublicId(publicId),
    seatService.findSeatBySlug(slug)
  ])
    .then(([cart, reserveSeat]) => {
      if (!cart) {
        throw new Error('Cart not found');
      }
      if (!reserveSeat) {
        throw new Error('Seat not found');
      }
      if ( isReserved(reserveSeat) ) {
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

export function deleteSeatFromCart(req, res) {
  let publicId = req.session.cart,
      slug = req.params.slug;

  return orderService.findCartByPublicId(publicId)
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

function isReserved(reserveSeat) {
   return reserveSeat.reservationType === PAID || reserveSeat.reservedUntil > moment();
}
