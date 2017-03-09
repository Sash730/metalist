'use strict';

import SeasonTicket from "./seasonTicket.model";
import * as log4js from 'log4js';

let logger = log4js.getLogger('SeasonTicket');

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

let createSeasonTicket = (seasonTicket, seatId) => {
  let newSeasonTicket = new SeasonTicket({
    seatId: seatId,
    number: seasonTicket.number,
    sector: seasonTicket.sector,
    row: seasonTicket.row,
    seat: seasonTicket.seat,
    valid: seasonTicket.valid
  });
  return newSeasonTicket.save();
};

export function index(req, res) {
  //console.log('price');
  return SeasonTicket.find({valid: {$gte: new Date()}}).sort({valid: 1}).exec()
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

export function saveSeasonTicket(req, res) {
  let seasonTicket = req.body.ticket,
      seatId = 's' + seasonTicket.sector + 'r' + seasonTicket.row + 'st' + seasonTicket.seat;

  return Promise.all([
    SeasonTicket.findOne({number: seasonTicket.number}),
    SeasonTicket.findOne({seatId: seatId, valid: {$gte: new Date()}})
  ])
    .then(([ticket, checkTicket])  => {
      if (!ticket && checkTicket) {
        return { message: 'Это место уже занято. № абонемента - ' + checkTicket.number };
      }
      if (!ticket) {
        return createSeasonTicket(seasonTicket, seatId);
      }

      ticket.seatId = seatId;
      ticket.number = seasonTicket.number;
      ticket.sector = seasonTicket.sector;
      ticket.row = seasonTicket.row;
      ticket.seat = seasonTicket.seat;
      ticket.valid = seasonTicket.valid;

      return ticket.save();
    })
    .then(respondWithResult(res))
    .catch(handleError(res))
  ;
}

export function view(req, res) {
  return SeasonTicket.findOne({number: req.params.number}).exec()
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

export function deleteSeasonTicket(req, res) {
  return SeasonTicket.remove({number: req.params.number}).exec()
    .then(function () {
      return res.status(204).end();
    })
    .catch(handleError(res));
}
