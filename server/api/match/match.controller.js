'use strict';

import * as matchService from './match.service';
import * as log4js from 'log4js';

let logger = log4js.getLogger('Match');

export function getMatches(req, res) {
  return matchService.getMatches()
    .then(respondWithResult(res))
    .catch(handleError(res));
}

export function getMatchById(req, res) {
  return matchService.findById(req.params.id)
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

export function createMatch(req, res) {
  let newMatch = req.body;

  return matchService.createMatch(newMatch)
    .then(respondWithResult(res))
    .catch(handleError(res))
}


export function deleteMatch(req, res) {
  return matchService.removeById(req.params.id)
    .then(function () {
      res.status(204).end();
    })
    .catch(handleError(res));
}

export function updateMatch(req, res) {
  let modifiedMatch = req.body;

  return matchService.findById(req.params.id)
    .then(handleEntityNotFound(res))
    .then(match => {
      if (match) {
        return matchService.updateMatch(match, modifiedMatch);
      }
    })
    .then(respondWithResult(res))
    .catch(handleError(res))
  ;
}

//private functions

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
