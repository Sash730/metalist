'use strict';

import Ticket from './../models/ticket.model';
import * as config from "../../config/environment"
import * as barcode from 'bwip-js';
import * as _ from 'lodash';
import liqpay from '../../liqpay';

function respondWithResult(res, statusCode) {
    statusCode = statusCode || 200;
    return function (entity) {
        if (entity) {
            return res.status(statusCode).json(entity);
        }
    };
}

function handleError(res, statusCode) {
    statusCode = statusCode || 500;
    return function (err) {
        res.status(statusCode).send(err);
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

export function index(req, res) {
    return Ticket.find().exec()
        .then(tickets => {
            var result = _.map(tickets, (ticket) => {

                var paymentParams = {
                    'action': 'pay',
                    'amount': '0.01',

                    'currency': 'UAH',
                    'description': ticket.text,
                    'order_id': ticket.id,
                    'sandbox': config.liqpay.sandboxMode,
                    'server_url': config.liqpay.callbackUrl,
                    'result_url': config.liqpay.redirectUrl,
                };


                return {
                    '_id': ticket.id,
                    'text': ticket.text,
                    'available': ticket.available,
                    'used': ticket.used,
                    'code': ticket.code,
                    'buyNowLink': ticket.available ? liqpay.generatePaymentLink(paymentParams) : null
                };
            });

            return res.status(200).json(result);
        })
        .catch(handleError(res));
}

export function print(req, res, next) {
    return Ticket.findOne({code: req.params.code, available: false}).exec()
        .then(handleEntityNotFound(res))
        .then((ticket) => {
            if(ticket) {

                barcode.toBuffer({
                    bcid:        'code128',       // Barcode type
                    text:        ticket.code,     // Text to encode
                    scale:       3,               // 3x scaling factor
                    height:      10,              // Bar height, in millimeters
                    includetext: true,            // Show human-readable text
                    textxalign:  'center',        // Always good to set this
                    textsize:    13               // Font size, in points
                }, function (err, png) {
                    // png is a Buffer. can be saved into file if needed  fs.writeFile(ticket._id + '.png', png)

                    if (err) {
                        return res.status(500).send('Could not generate ticket');
                    } else {

                        return res.render('ticket/print', {
                            ticket: ticket,
                            barcodeUri: png.toString('base64'),
                        })

                    }
                });
            }
        })
        .catch(handleError(res));
}

export function use(req, res, next) {
    return Ticket.findOne({code: req.params.code}).exec()
        .then(handleEntityNotFound(res))
        .then((ticket) => {
            if(ticket) {
                ticket.used = true;
                return ticket.save()
                    .then((updated) => {
                        return res
                            .status(200)
                            .json(ticket)
                        ;
                    });
            }
        })
        .catch(handleError(res));
}


