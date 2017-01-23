'use strict';

import Match from './../models/match.model';
import Ticket from './../models/ticket.model';
import User from './../models/user.model';
import Seat from './../models/seat.model';
import {Order} from './../models/order.model';
import * as _ from 'lodash';
import * as config from "../../config/environment"
import * as crypto from "crypto";
import liqpay from '../../liqpay';
import * as Mailer from '../../mailer/mailer.js';
import * as uuid from 'node-uuid';
import * as barcode from 'bwip-js';
import * as log4js from 'log4js';

const logger = log4js.getLogger('Order'),
      moment = require('moment');

function respondWithResult(res, statusCode) {
    statusCode = statusCode || 200;
    return function (entity) {
        if (entity) {
          logger.info("respondWithResult "+entity._id);
            return res.status(statusCode).json(entity);
        }
    };
}

function handleEntityNotFound(res) {
      return function (entity) {
        logger.info("handleEntityNotFound "+ entity._id);
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
      logger.error('handleError '+err);
      //logger.error('handleError '+res.req.headers);
        res.status(err.statusCode || statusCode).send(err);
    };
}

let sendMessage = (order, ticket) => {
  Mailer.sendMail( ticket.user.email, order, ticket);
};

let createNewTicket = (cart, match, seat) => {
  let ticket = new Ticket({
    cartId: cart.id,
    accessCode: randomNumericString(16),
    match:  {
      id: match.id,
      headline: match.headline,
      round: match.round,
      date: match.date
    },
    seat: {
      id: seat.id,
      sector: seat.sector,
      row: seat.row,
      number: seat.number
    },
    amount: seat.price,
    reserveDate: moment(),
    status: 'new',
    valid: {
      from: ((d) => { var d1 = new Date(d); d1.setHours(0,0,0,0); return d1; })(match.date),
      to: ((d) => { var d1 = new Date(d); d1.setHours(23,59,59,0); return d1; })(match.date)
    },
    timesUsed: 0
  });

  return ticket.save();
};

let createOrUpdateTicket = (cart, match, seat, ticket) => {
  if (!ticket) {
    return createNewTicket(cart, match, seat);
  }

  ticket.cartId = cart._id;
  ticket.reserveDate = Date.now();

  return ticket.save();
};

let updateTicketsInCheckout = (order) => {
  order.tickets.map((ticket) => {
    Ticket.findOne({_id: ticket.id})
      .then(ticket => {
        ticket.reserveDate = moment();

        return ticket.save();
    });
  });
};

let addUserToGuestCard = (guestCart, user) => {
  guestCart.user = {
    id: user.id,
    email: user.email,
    name: user.name
  };

  return guestCart.save();
};

let updateSoldTickets = (order) => {
  return order.tickets.map((ticket) => {
    Ticket.findOne({_id: ticket.id})
      .then(ticket => {
        ticket.orderNumber = order.orderNumber;
        ticket.status = 'paid';
        ticket.user = {
                       email: order.user.email,
                       name: order.user.name
                      };
        ticket.save();
      })
      .then((order, ticket) => {
        sendMessage(order, ticket);

        return ticket;
      });
  });
};

let deleteTicketFromCart = (cart, ticketId) => {
  let ticket = _.filter(cart.tickets, function (ticket) {
    if (ticket.id === ticketId) {
      return ticket;
    }
  });

  if(!ticket) {
    throw new Error('Ticket not found in cart')
  }
  cart.amount -= ticket[0].amount;
  cart.tickets.splice(cart.tickets.indexOf(ticket[0]), 1);

  return cart.save();
};

let processLiqpayRequest = (request) => {
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

                ticketPromises = updateSoldTickets(order);

            } else {
                order.status = 'failed';
            }

            return Promise.all([order.save()].concat(ticketPromises));
        });
};

const createPaymentLink = (order) => {
    let orderDescription = _.reduce(order.tickets, (description, ticket) => {
        return `${description} ${ticket.match.headline} (sector #${ticket.seat.sector}, row #${ticket.seat.row}, number #${ticket.seat.number}) | `;
    }, '');

    let paymentParams = {
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

function randomNumericString(length) {
  let chars = '0123456789';
  let result = '';
  for (let i = length; i > 0; --i) result += chars[Math.round(Math.random() * (chars.length - 1))];
  return result;
}

export function getCountPaidOrders(req, res) {
  let date = new Date(req.params.date);

  let countOrdersPromise =  Order.aggregate([
      {$match: {status: 'paid'}},
      {$project: {orderNumber: 1, _id: 0, items: 1}},
      {$unwind: "$tickets"},
      {$match: {'tickets.match.date': date}},
      {$project: {sector: '$tickets.seat.sector'}},
      {$group: {_id: "$sector", number: {$sum: 1}}},
      {$sort: {_id: 1}}])
      .then(handleEntityNotFound(res))
    ;
  let totalPricePromise  =  Order.aggregate([
    {$match: {status: 'paid'}},
    {$project: {orderNumber: 1, _id: 0, items: 1}},
    {$unwind: "$tickets"},
    {$match: {'tickets.match.date': date}},
    {$group: {_id: "orderNumber", total: {$sum: '$tickets.amount'}}}
    ])
    .then(handleEntityNotFound(res));

  Promise
    .all([countOrdersPromise, totalPricePromise])
    .then(([count, total]) => {
      const arr = count.concat(total),
          stat = {};

      if(arr.length !== 0){

        for (let i = 0; i < arr.length; i++){

          if(arr[i]._id === 1) stat.west = arr[i].number;
          if(arr[i]._id === 2) stat.east = arr[i].number;
          if(arr[i]._id === 'orderNumber') stat.total = arr[i].total;
        }
      }

      return stat;
    })
    .then(respondWithResult(res))
    .catch(handleError(res))
  ;
}

export function updateCart(req, res) {
    let cartId = req.session.cart,
      timeEndTicketReserve = moment().subtract(30, 'minutes');

    Promise.all([
                 Order.findOne({_id: cartId, type: 'cart'})
                      .populate({path: 'tickets'}),
                 Match.findById(req.body.matchId),
                 Seat.findById(req.body.seatId),
                 Ticket.findOne(
                   { status: 'new',
                    'match.id': req.body.matchId,
                    'seat.id': req.body.seatId
                   }
                 )
                ])
        .then(([cart, match, seat, ticket]) => {
            if(!cart) {
                throw new Error('Cart not found');
            }
            if(!match) {
                throw new Error('Match not found');
            }
            if(!seat) {
                throw new Error('Seat not found');
            }
            if (ticket && ticket.reserveDate > timeEndTicketReserve) {
              return {
                      message: 'This ticket is already taken.'
                     };
            }

          return createOrUpdateTicket(cart, match, seat, ticket)
            .then(ticket => {
              cart.tickets.push(ticket._id);
              cart.amount += seat.price;

              return cart.save();
            })
            .then((cart) => {
              return Order.findOne({_id: cart.id})
                   .populate({path: 'tickets'});
            })
        })
        .then(respondWithResult(res))
        .catch(handleError(res))
    ;
}

export function deleteItemFromCart(req, res) {
  let cartId = req.session.cart,
      ticketId = req.params.ticketId;

    Order.findOne({_id: cartId, type: 'cart'})
        .populate({path: 'tickets'})
        .then(handleEntityNotFound(res))
        .then(cart => {
          return deleteTicketFromCart(cart, ticketId);
        })
        .then(cart => {
           Ticket.findOne({cartId: cart._id})
             .then(ticket => {
                ticket.cartId = '';
                ticket.reserveDate = null;

                ticket.save();
             });

          return cart;
        })
        .then(respondWithResult(res))
        .catch(handleError(res))
    ;
}

export function getCart(req, res) {
    let cartId = req.session.cart;

    Order.findOne({_id: cartId, type: 'cart'})
      .populate({path: 'tickets'})
        .then(handleEntityNotFound(res))
        .then(respondWithResult(res))
        .catch(handleError(res))
    ;
}

export function getUserCart(req, res) {
  var userId = req.user.id;
  var cartId = req.session.cart;

  Promise.all([
    Order.findOne({_id: cartId, type: 'cart'})
         .populate({path: 'tickets'}),
    Order.findOne({'user.id': userId, type: 'cart'})
         .populate({path: 'tickets'}),
    User.findById(userId)
  ])
    .then(([guestCart, userCart, user]) => {
      if(!userCart) {
        return addUserToGuestCard(guestCart, user);
      } else {

        if (!guestCart.tickets.length) {
          req.session.cart = userCart.id;
          guestCart.remove();

          return userCart;
        }
        userCart.remove();

        return addUserToGuestCard(guestCart, user);
      }
    })
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res))
  ;
}

export function convertCartToOrder(req, res) {
    let cartId = req.session.cart,
        requestUserId = req.body.user.id;

    let userPromise = new Promise((resolve, reject) => {
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
            if(!req.session.orderIds) {
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
        .populate({path: 'tickets'})
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

  Order.find({'user.id': req.user.id, type: 'order'}).sort({created: -1})
    .populate({path: 'tickets'})
    .then(respondWithResult(res))
  ;
}
