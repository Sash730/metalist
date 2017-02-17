'use strict';

import Match from './../models/match.model';
import Seat from './../models/seat.model';
import * as _ from 'lodash';
import * as config from "../../config/environment"
import * as log4js from 'log4js';

var logger = log4js.getLogger('Match');

function respondWithResult(res, statusCode) {
    statusCode = statusCode || 200;
    return function (entity) {
        if (entity) {
          logger.info('respondWithResult '+entity._id);
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
        res.status(statusCode).send(err);
    };
}

export function index(req, res) {
    return Match.find({
        $or: [
            {date: { $gt: Date.now() }},
            {date: null}
        ]
    }).populate("priceSchema").sort({round: 1}).exec()
        // .then(matches => {
        //     var result = _.map(matches, (match) => {
        //
        //         return match;
        //
        //         // return {
        //         //     '_id': match.id,
        //         // };
        //     });
        //     return res.status(200).json(result);
        // })
        .then(respondWithResult(res))
        .catch(handleError(res));
}

export function view(req, res) {
    return Match.findById(req.params.id).populate("priceSchema").exec()
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

export function createMatch(req, res) {
  console.log('createMatch', req.body.priceSchema);
  let newMatch = new Match({
      rival: req.body.rival,
      round: req.body.round,
      info: req.body.info,
      date: req.body.date,
      priceSchema: req.body.priceSchema.id
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
  let matchId = req.body._id;

  Match.findOne({_id: matchId})
    .then(currentMatch => {
      if(!currentMatch) {
      throw new Error('not found');
      }

    return currentMatch;
    })
    .then((match)  => {
      console.log('updateMatch', req.body);
      match.round = req.body.round;
      match.rival = req.body.rival;
      match.date = req.body.date;
      match.poster = req.body.poster;
      match.info = req.body.info;
      match.priceSchema = req.body.priceSchema.id;

      return match.save()
    })
    .then(respondWithResult(res))
    .catch(handleError(res))
  ;
}
