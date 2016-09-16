/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/things              ->  index
 * POST    /api/things              ->  create
 * GET     /api/things/:id          ->  show
 * PUT     /api/things/:id          ->  update
 * DELETE  /api/things/:id          ->  destroy
 */

'use strict';

import _ from 'lodash';
import Ticket from './../ticket/ticket.model';
import liqpay from '../../liqpay';
import * as crypto from 'crypto';

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
        res.status(statusCode).send(err);
    };
}

export function callback(req, res, next) {
    if(!req.body.data || !req.body.signature) {
        console.log('data or signature missing');
        console.log(req.body);
        return res.status(400).send();
    }

    if(liqpay.signString(req.body.data) !== req.body.signature) {
        console.log('signature is wrong');
        console.log(req.body);
        return res.status(400).send();
    }

    var params = JSON.parse(new Buffer(req.body.data, 'base64').toString('ascii'));
    console.log(params);

    return Ticket.findById(params.order_id).exec()
        .then(handleEntityNotFound(res))
        .then(ticket => {
            if(ticket) {
                console.log(ticket);
                ticket.available = false;
                ticket.code = crypto.randomBytes(16).toString('hex');
                ticket.orderDetails = params;

                console.log(ticket);

                var emailContent = 'Ticket is sold!';
                // mailer.sendMail('ruslan.polutsygan@gmail.com', 'Test subject', emailContent);

                return ticket.save()
                    .then((updated) => {
                        return updated;
                    });
            }

        })
        .then((ticket) => {
            if(ticket) {
                return res.status(200).send();
            }
        })
        .catch(handleError(res));
}
