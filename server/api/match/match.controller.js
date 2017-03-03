'use strict';

import Match from './match.model';
import * as log4js from 'log4js';

let logger = log4js.getLogger('Match');

function respondWithResult(res, statusCode) {
  statusCode = statusCode || 200;
  return function (entity) {
    if (entity) {
      logger.info('respondWithResult ' + entity._id);
      return res.status(statusCode).json(entity);
    }
  };
}

function handleEntityNotFound(res) {
  return function (entity) {
    logger.info("handleEntityNotFound " + entity._id);
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
    logger.error('handleError ' + err);
    res.status(statusCode).send(err);
  };
}

export function index(req, res) {
  return Match.find({
    $or: [
      {date: {$gt: Date.now()}},
      {date: null}
    ]
  }).populate("priceSchema").sort({round: 1}).exec()
    .then(respondWithResult(res))
    .catch(handleError(res));
}

export function view(req, res) {
  return Match.findById(req.params.id).populate("priceSchema").exec()
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

export function createMatch(req, res) {
  let newMatch = new Match({
    rival: req.body.rival,
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
      if (!currentMatch) {
        throw new Error('not found');
      }

      return currentMatch;
    })
    .then((match) => {
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
