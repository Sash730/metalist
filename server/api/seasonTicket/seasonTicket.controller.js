'use strict';

import * as seasonTicketService from '../seasonTicket/seasonTicket.service';
import * as log4js from 'log4js';

let logger = log4js.getLogger('SeasonTicket');

export function getSeasonTickets(req, res) {
  return seasonTicketService.getActiveSeasonTickets()
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

export function getBlocks(req, res) {
  return seasonTicketService.getActiveBlockTickets()
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

export function createSeasonTicket(req, res) {
  let ticket = req.body.ticket,
      slug = req.params.slug;

  return seasonTicketService.findBySlug(slug)
    .then(seasonTicket => {
      if (seasonTicket && seasonTicket.reservedUntil > new Date()) {
        return res.status(409).end();
      }
      return seasonTicketService.createSeasonTicket(ticket, slug)
        .then(respondWithResult(res));
    })
    .catch(handleError(res));
}

export function deleteSeasonTicket(req, res) {
  return seasonTicketService.removeBySlug(req.params.slug)
    .then(() => {
      res.status(204).end();
    })
    .then(respondWithResult(res))
    .catch(handleError(res));
}

export function blockRow(req, res) {
  let blockRow = req.body.blockRow,
      sector = req.body.blockRow.sector,
      row = req.body.blockRow.row;

  return Promise.all([
    seasonTicketService.getBlockedRowSeats(sector, row),
    seasonTicketService.getRowSeats(sector, row)
  ])
    .then(([tickets, seats]) => {
      if (tickets.length) {
        tickets.forEach(ticket => {
          if (seats.includes(ticket.seat)) {
            seats.splice(seats.indexOf(ticket.seat), 1);
          }
        });
      }
      return seasonTicketService.createBlockRow(seats, blockRow);
    })
    .then( () => res.status(200).end() )
    .catch(handleError(res));

}

export function deleteBlockRow(req, res) {
  let sector = req.params.sector,
      row = req.params.row;

  return seasonTicketService.getBlockRow(sector, row)
    .then(seasonTicketService.removeBlockRow)
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
