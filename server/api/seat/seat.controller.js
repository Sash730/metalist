'use strict';

import * as log4js from 'log4js';
import Seat from '../seat/seat.model';

const logger = log4js.getLogger('Seat');

export function getReservedSeats(req, res) {
  let sectorNumber = req.params.sector;

  return Seat.find({reservedUntil: {$gte: new Date()}, sector: sectorNumber})
    .select('slug -_id')
    .then(respondWithResult(res))
    .catch(handleError(res));
}

//private functions
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
    logger.error('Error: ' + err);
    res.status(err.statusCode || statusCode).send(err);
  };
}
