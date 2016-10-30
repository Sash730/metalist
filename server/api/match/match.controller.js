'use strict';

import Match from './../models/match.model';
import Seat from './../models/seat.model';
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

export function view(req, res) {
    return Match.findById(req.params.id).exec()
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
        .then(handleEntityNotFound(res))
        .then(respondWithResult(res))
        .catch(handleError(res));
}

export function seats(req, res) {
    // return res.status(400).json({});
    return Seat.find().exec()
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
        // .then((result) => {
        //     console.log(result);
        //     // console.log(result[0].price);
        //     // console.log(result[0].formattedPrice);
        //
        //     return result;
        // })
        .then(respondWithResult(res))
        .catch(handleError(res));
}

export function creatMatch(req, res) {
  var newMatch = new Match({
      rival: req.body.rival,
      round: req.body.round,
      info: req.body.info,
      date: req.body.date
    });
  return newMatch.save()
    .then(respondWithResult(res))
    .catch(handleError(res))
}


export function deleteMatch(req, res) {
  return Match.findByIdAndRemove(req.params.id).exec()
    .then(function () {
      res.status(204).end();
    })
    .catch(handleError(res));
}

export function updateMatch(req, res) {
  var matchId = req.body._id;
  Match.findOne({_id: matchId})
    .then((curentMatch) => {
      if(!curentMatch) {
      throw new Error('not found');
      }
    return curentMatch;
    })
    .then((match)  => {
      match.round = req.body.round;
      match.rival = req.body.rival;
      match.date = req.body.date;
      return match.save()
    })
    .then(respondWithResult(res))
    .catch(handleError(res))
  ;
}
