'use strict';

import * as seatService from '../seat/seat.service';
import * as log4js from 'log4js';

let logger = log4js.getLogger('SeasonTicket');

export function getSeasonTickets(req, res) {
  return seatService.getActiveSeasonTickets()
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

export function getBlocks(req, res) {
  return seatService.getActiveBlockSeats()
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

export function deleteSeasonTicket(req, res) {
  return seatService.getSeatBySlug(req.params.slug)
    .then(seatService.clearReservation)
    .then(respondWithResult(res))
    .catch(handleError(res));
}

export function createSeasonTicket(req, res) {
  let reservationDate = req.body.ticket.reservedUntil;

  return seatService.getSeatBySlug(req.params.slug)
    .then(seat => {
      if (seat.isActive) {
        return res.status(409).end();
      }
      return seatService.reserveSeatAsSeasonTicket(seat, reservationDate)
        .then(respondWithResult(res));
    })
    .catch(handleError(res));
}

export function blockRow(req, res) {
  let sector = req.body.blockRow.sector,
      row = req.body.blockRow.row,
      reservationDate = req.body.blockRow.reservedUntil;

  return seatService.getNotActiveSeats(sector, row)
    .then(seats => {
      if ( isEmpty(seats) ) {
        return res.status(409).end();
      }
      return seatService.reserveSeatsAsBlock(seats, reservationDate)
        .then(respondWithResult(res));
    })
    .catch(handleError(res));
}

export function unblockRow(req, res) {
  let sector = req.params.sector,
      row = req.params.row;

  return seatService.getBlockRowSeats(sector, row)
    .then(seatService.clearReservations)
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// private functions ---------------------------------------

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
    logger.error('handleError ' + err);
    res.status(statusCode).send(err);
  };
}

function isEmpty(seats) {
  return !seats.length;
}
