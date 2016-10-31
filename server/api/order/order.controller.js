'use strict';

import Match from './../models/match.model';
import Ticket from './../models/ticket.model';
import User from './../models/user.model';
import Seat from './../models/seat.model';
import {Order, OrderItem} from './../models/order.model';
import * as _ from 'lodash';
import * as config from "../../config/environment"
import * as crypto from "crypto";
import liqpay from '../../liqpay';
import * as uuid from 'node-uuid';
import * as barcode from 'bwip-js';

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

var createTickets = (order) => {
    return order.items.map( (item) => {
        var ticket = new Ticket({

            orderNumber: order.orderNumber,
            accessCode: uuid.v1(),
            match:  {
                headline: item.match.headline,
                round: item.match.round,
                date: item.match.date

            },
            seat: {
                sector: item.seat.sector,
                row: item.seat.row,
                number: item.seat.number
            },
            user: {
                email: order.user.email,
                name: order.user.name
            },
            status: 'new',
            valid: {
                from: ((d) => { var d1 = new Date(d); d1.setHours(0,0,0,0); return d1; })(item.match.date),
                to: ((d) => { var d1 = new Date(d); d1.setHours(23,59,59,0); return d1; })(item.match.date)
            },
            timesUsed: 0
        });

        return ticket.save();
    });
};

var processLiqpayRequest = (request) => {
    return new Promise((resolve, reject) => {
        if(!request.body.data || !request.body.signature) {
            return reject(new Error('data or signature missing'));
        }

        if(liqpay.signString(request.body.data) !== request.body.signature) {
            return reject(new Error('signature is wrong'));
        }

        return resolve(JSON.parse(new Buffer(request.body.data, 'base64').toString('utf-8')));
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
            order.paymentDetails = params;

            var ticketPromises = [];
            if(params.status === 'success' || params.status === 'sandbox') {
                order.status = 'paid';

                ticketPromises = createTickets(order);

            } else {
                order.status = 'failed';
            }

            return Promise.all([order.save()].concat(ticketPromises));
        });
};

var createPaymentLink = (order) => {
    var orderDescription = _.reduce(order.items, (description, item) => {
        return `${description} ${item.match.headline} (sector #${item.seat.sector}, row #${item.seat.row}, number #${item.seat.number}) | `;
    }, '');

    var paymentParams = {
        'action': 'pay',
        'amount': order.formattedAmount,
        'currency': 'UAH',
        'description': orderDescription,
        'order_id': order.orderNumber,
        'sandbox': config.liqpay.sandboxMode,
        'server_url': config.liqpay.callbackUrl,
        'result_url': config.liqpay.redirectUrl
    };

    return liqpay.generatePaymentLink(paymentParams);
};

export function getCountPaidOrders(req, res){
  var date = new Date(req.params.date);

  Order.aggregate([
    {$match: {status: 'paid'}}, {$project: {orderNumber: 1, _id: 0, items: 1}},
    {$unwind: "$items"}, {$match: {'items.match.date': date}},
    {$project: {sector: '$items.seat.sector'}},
    {$group: {_id: "$sector", number: {$sum: 1}}},
    {$sort: {_id: 1}}])
  .exec()
  .then(respondWithResult(res))
  .catch(handleError(res));
}

export function updateCart(req, res) {
    var cartId = req.session.cart;

    Promise.all([
        Order.findOne({_id: cartId, type: 'cart'}),
        Match.findById(req.body.matchId),
        Seat.findById(req.body.seatId)
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
                seat: {
                    id: seat.id,
                    sector: seat.sector,
                    row: seat.row,
                    number: seat.number
                },
                match: {
                    id: match.id,
                    headline: match.headline,
                    round: match.round,
                    date: match.date
                },
                amount: seat.price
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
            cart.created = new Date();

            return cart.save();
        })
        .then(order => {
            delete req.session.cart;
            if(!req.session.orderIds) {
                req.session.orderIds = [];
            }
            req.session.orderIds.push(order.id);

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
        .then(([order]) => {
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

export function getOrderedTickets(req, res) {
    Ticket.find({orderNumber: req.params.orderNumber})
        .then((tickets) => {
            return Promise.all(tickets.map(ticket => {
                ticket = ticket.toObject();

                return new Promise((resolve, reject) => {
                    barcode.toBuffer({
                        bcid:        'code128',       // Barcode type
                        text:        ticket.accessCode,     // Text to encode
                        scale:       3,               // 3x scaling factor
                        height:      10,              // Bar height, in millimeters
                        includetext: true,            // Show human-readable text
                        textxalign:  'center',        // Always good to set this
                        textsize:    13               // Font size, in points
                    }, function (err, png) {
                        // png is a Buffer. can be saved into file if needed  fs.writeFile(ticket._id + '.png', png)

                        if (err) {
                            reject(err);
                        } else {
                            ticket.barcodeUri =  'data:image/png;base64,' + png.toString('base64');
                            resolve(ticket);
                        }
                    })
                });
            }));
        })
        .then(respondWithResult(res))
        .catch(handleError(res))
    ;
}


export function getMyOrders(req, res) {
    if(req.user && req.user.id) {
        Order.find({'user.id': req.user.id}).sort({created: -1})
            .then(respondWithResult(res))
        ;
    } else {
        var sessionOrderIds = req.session.orderIds || [];
        Order.find({_id: { $in: sessionOrderIds }}).sort({created: -1})
            .then(respondWithResult(res))
        ;
    }
}
