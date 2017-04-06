'use strict';

import SeasonTicket from "./seasonTicket.model";
import { SEASON_TICKET } from '../seat/seat.constants';
import Seat from '../seat/seat.model';
import {Stadium} from '../../stadium';
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

let createTicket = (seasonTicket, seatId, type) => {
  let newSeasonTicket = new SeasonTicket({
    seatId: seatId,
    sector: seasonTicket.sector,
    row: seasonTicket.row,
    seat: seasonTicket.seat,
    valid: seasonTicket.valid,
    type: type
  });
  return newSeasonTicket.save();
};

let addBlockTickets = (seats, blockRow) => {
  return seats.forEach(seat => {
    let seatId = 's' + blockRow.sector + 'r' + blockRow.row + 'st' + seat,
        ticket = {
                  sector: blockRow.sector,
                  row: blockRow.row,
                  seat: seat,
                  valid: blockRow.valid,
        };
     return createTicket(ticket, seatId, 'block');
  })
};

let getRowSeats = (sectorName, rowName) => {
  return new Promise((resolve, reject) => {
    let tribuneName = getTribuneName(sectorName),
        [ stadiumRow ] = Stadium['tribune_'+tribuneName]['sector_'+sectorName].rows.filter(row => row.name === rowName),
        stadiumSeats = [...Array(parseInt(stadiumRow.seats) + 1).keys()].filter(Boolean);

    if(stadiumSeats.length) {
      resolve(stadiumSeats);
    } else {
      reject(new Error('stadiumSeats not found.'));
    }
  });
};

let deleteBlockTickets = (tickets) => {
  return tickets.forEach(ticket => {

    if (ticket.type === 'block') {
      return deleteBlockTicket(ticket.seatId);
    }
  });
};

let deleteBlockTicket = (seatId) => {
  return SeasonTicket.remove({seatId: seatId}).exec();
};

let getTribuneName = (sectorName) => {
  let tribuneName, tribune;

  for (tribune in Stadium) {
    if ( Stadium[tribune]['sector_'+sectorName] ) {
      tribuneName = Stadium[tribune].name;
    }
  }
  return tribuneName;
};

export function index(req, res) {
  return SeasonTicket.find({type: 'ticket', valid: {$gte: new Date()}}).sort({valid: 1}).exec()
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

export function view(req, res) {
  return SeasonTicket.findOne({seatId: req.params.seatId, type: 'ticket'}).exec()
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

export function createSeasonTicket(req, res) {
  let seasonTicket = req.body.ticket,
      slug = 's' + seasonTicket.sector + 'r' + seasonTicket.row + 'st' + seasonTicket.seat;

  let newTicket = new Seat({
    slug: slug,
    sector: seasonTicket.sector,
    row: seasonTicket.row,
    seat: seasonTicket.seat,
    reservedUntil: seasonTicket.valid,
    reservationType: SEASON_TICKET
  });

  newTicket.save()
    .then(respondWithResult(res))
    .catch(handleError(res));
}

export function saveSeasonTicket(req, res) {
  let seasonTicket = req.body.ticket,
      seatId = 's' + seasonTicket.sector + 'r' + seasonTicket.row + 'st' + seasonTicket.seat;

    SeasonTicket.findOne({seatId: seatId})
    .then(ticket  => {
      if (!ticket) {
        return createTicket(seasonTicket, seatId, 'ticket');
      }
      ticket.seatId = seatId;
      ticket.sector = seasonTicket.sector;
      ticket.row = seasonTicket.row;
      ticket.seat = seasonTicket.seat;
      ticket.valid = seasonTicket.valid;
      ticket.type =  'ticket';

      return ticket.save();
    })
    .then(respondWithResult(res))
    .catch(handleError(res))
  ;
}

export function addBlockTicketInRow(req, res) {
  let blockRow = req.body.blockRow,
      sectorName = req.body.blockRow.sector,
      rowName = req.body.blockRow.row;

  return Promise.all([
    SeasonTicket.find({sector: sectorName, row: rowName}),
    getRowSeats(sectorName, rowName)
  ])
  .then(([tickets, seats]) => {
    if (tickets) {
      tickets.forEach(ticket => {
        if (seats.includes(ticket.seat)) {
          seats.splice(seats.indexOf(ticket.seat), 1);
        }
      });
    }
    return addBlockTickets(seats, blockRow);
  })
  .then( () => res.status(200).end() )
  .catch(handleError(res));
}

export function deleteSeasonTicket(req, res) {
  return SeasonTicket.remove({seatId: req.params.seatId, type: 'ticket'}).exec()
    .then(function () {
      return res.status(204).end();
    })
    .catch(handleError(res));
}

export function deleteBlockTicketInRow(req, res) {
  let blockRow = req.body.blockRow;

  return SeasonTicket.find({sector: blockRow.sector, row: blockRow.row}).exec()
    .then(tickets => {
      return deleteBlockTickets(tickets);
    })
    .then(function () {
      return res.status(204).end();
    })
    .catch(handleError(res));
}
