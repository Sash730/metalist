'use strict';

import Match from './../models/match.model';
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

function handleError(res, statusCode) {
    statusCode = statusCode || 500;
    return function (err) {
        res.status(statusCode).send(err);
    };
}

export function index(req, res) {
    return Match.find({
        $or: [
            {date: { $gt: Date.now() }},
            {date: null}
        ],
    }).sort({round: 1}).exec()
        // .then(matches => {
        //     var result = _.map(matches, (match) => {
        //
        //         return match;
        //
        //         // return {
        //         //     '_id': match.id,
        //         // };
        //     });
        //
        //     return res.status(200).json(result);
        // })
        .then(respondWithResult(res))
        .catch(handleError(res));
}
