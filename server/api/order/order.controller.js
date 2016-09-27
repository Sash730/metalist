'use strict';

import Match from './../models/match.model';
import Seat from './../models/seat.model';
import {Order, OrderItem} from './../models/order.model';
import * as _ from 'lodash';
import * as config from "../../config/environment"
import * as crypto from "crypto";
import liqpay from '../../liqpay';
import * as uuid from 'node-uuid';

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
        res.status(err.statusCode || statusCode).send(err);
    };
}

var processLiqpayRequest = (request) => {
    return new Promise((resolve, reject) => {
        if(!request.body.data || !request.body.signature) {
            return reject(new Error('data or signature missing'));
        }

        if(liqpay.signString(request.body.data) !== request.body.signature) {
            return reject(new Error('signature is wrong'));
        }

        return resolve(JSON.parse(new Buffer(request.body.data, 'base64').toString('ascii')));
    })
        .then(params => {
            return Promise.all([
                Order.findOne({orderNumber: params.order_id, type: 'order', status: 'new'}),
                params
            ]);
        })
        .then(([order, params]) => {
            if(!order) {
                throw new Error('Order not found');
            }
            if(params.status === 'success' || params.status === 'sandbox') {
                order.status = 'paid';
            } else {
                order.status = 'failed';
            }
            order.paymentDetails = params;

            return order.save();
        })
        ;
};

var createPaymentLink = (order) => {
    var orderDescription = _.reduce(order.items, (description, item) => {
        return description + 'Match: ' + item.matchId + '; seatId: ' + item.seatId + '';
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

    return liqpay.generatePaymentLink(paymentParams);
};

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
            cart.orderNumber = uuid.v1();

            return cart.save();
        })
        .then(order => {
            delete req.session.cart;

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
    return processLiqpayRequest(req)
        .then(order => {
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
            }

            return order;
        })
        .then(respondWithResult(res))
        .catch(handleError(res))
    ;
}
