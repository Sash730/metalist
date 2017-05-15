'use strict';

import * as log4js from 'log4js';
import * as seatService from './seat.service';
import * as seasonTicketService from '../seasonTicket/seasonTicket.service';

const logger = log4js.getLogger('Seat');

export function getReservedSeats(req, res) {
  let sector = req.params.sector,
      matchId = req.params.id;

  return Promise.all([
      seatService.getReservedSeats(matchId, sector),
      seasonTicketService.getActiveBlocksBySector(sector)
    ])
    .then(([seats, tickets]) => {
      let reservedTickets = seats.concat(tickets);
      return reservedTickets.map(ticket => ticket.slug);
    })
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
