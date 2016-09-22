'use strict';

import Match from './../models/match.model';
import Seat from './../models/seat.model';
import {Order, OrderItem} from './../models/order.model';
import * as _ from 'lodash';
import * as config from "../../config/environment"
import * as crypto from "crypto";
import liqpay from '../../liqpay';

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

export function convertCartToOrder(req, res) {
    var cartId = req.session.cart;
    var requestUserId = req.body.user.id;
console.log('req user ===========> ', req.user);
console.log('session ===========> ', req.session);

    var userPromise = new Promise((resolve, reject) => {
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
        .then(handleEntityNotFound(res))
    ;

    Promise
        .all([userPromise, cartPromise])
        .then(([user, cart]) => {
            cart.user = user;
            cart.type = 'order';
            cart.orderNumber = crypto.randomBytes(16).toString('hex');

            return cart.save();
        })
        .then(order => {
            console.log('order converted', order);
            delete req.session.cart;

            return order;
        })
        .then(order => {
            console.log('payment link');

            var orderDescription = _.reduce(order.items, (description, item) => {
                orderDescription += 'Match: ' + item.matchId + '; seatId: ' + item.seatId + "\n";
            }, '');

            var paymentParams = {
                'action': 'pay',
                'amount': order.formattedAmount,
                'currency': 'UAH',
                'description': orderDescription,
                'order_id': order.orderNumber,
                'sandbox': config.liqpay.sandboxMode,
                'server_url': config.liqpay.callbackUrl,
                'result_url': config.liqpay.redirectUrl,
            };

            return {'paymentLink': liqpay.generatePaymentLink(paymentParams)};
        })
        .then(respondWithResult(res))
        .catch(handleError(res))
    ;
}
