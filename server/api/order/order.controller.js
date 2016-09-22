'use strict';

import Match from './../models/match.model';
import Seat from './../models/seat.model';
import {Order, OrderItem} from './../models/order.model';
import * as _ from 'lodash';
import * as config from "../../config/environment"

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
        console.log(err);
        res.status(statusCode).send(err);
    };
}

export function updateCart(req, res) {
    var cartId = req.session.cart;

    Promise.all([
        Order.findOne({_id: cartId, type: 'cart'}),
        Match.findById(req.body.matchId),
        Seat.findById(req.body.seatId),
    ])
        .then(([cart, match, seat]) => {
            if(!cart) {
                throw new Error('Cart not found');
            }
            if(!match) {
                throw new Error('Match not found');
            }
            if(!seat) {
                throw new Error('Match not found');
            }

            cart.items.push(new OrderItem({
                seatId: seat.id,
                matchId: match.id,
                amount: seat.price,
            }));
            cart.amount += seat.price;

            return cart.save();
        })
        .then(respondWithResult(res))
        .catch(handleError(res))
    ;
}

export function deleteItemFromCart(req, res) {
    var cartId = req.session.cart;
    var itemId = req.params.itemId;

    Order.findOne({_id: cartId, type: 'cart'})
        .then(handleEntityNotFound(res))
        .then(cart => {
            var item =  cart.items.id(itemId);
            if(!item) {
                throw new Error('Item not found in cart')
            }
            cart.amount -= item.amount;
            item.remove();
            return cart.save();
        })
        .then(respondWithResult(res))
        .catch(handleError(res))
    ;
}

export function getCart(req, res) {
    var cartId = req.session.cart;

    Order.findOne({_id: cartId, type: 'cart'})
        .then(handleEntityNotFound(res))
        .then(respondWithResult(res))
        .catch(handleError(res))
    ;
}
