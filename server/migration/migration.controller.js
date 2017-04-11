'use strict';

import { Stadium } from '../stadium';
import Seat from '../api/seat/seat.model';
import * as seatService from '../api/seat/seat.service'
import * as log4js from 'log4js';

const logger = log4js.getLogger('Ticket');

export function addStadiumSeats(req, res) {
  return createStadiumSeats()
    .then(respondWithResult(res))
    .catch(handleError(res));
}

//private function-----------------------------------------
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
    logger.error('handleError ' + err);
    res.status(statusCode).send(err);
  };
}

function createStadiumSeats() {
  let promises = [];
  for (let tribune in Stadium) {
    for (let sector in Stadium[tribune]) {
      if (Stadium[tribune][sector].rows) {
        Stadium[tribune][sector].rows.forEach(row => {
          promises.push(createRowSeats(Stadium[tribune].name, Stadium[tribune][sector].name, row));
        })
      }
    }
  }
  return Promise.all(promises);
}

function getRowSeats(seats) {
  return new Promise((resolve) => {
    resolve([...Array(parseInt(seats) + 1).keys()].filter(Boolean));
  });
}

function createRowSeats(tribuneName, sectorName, row) {
  return getRowSeats(row.seats)
    .then(seats => {
      return Promise.all(seats.map(seat => {
        let slug = 's' + sectorName + 'r' + row.name + 'st' + seat;

        return seatService.findSeatBySlug(slug)
          .then(seat => {
            if (!seat) {
              return createSeat(tribuneName, sectorName, row.name, seat, slug);
            }
            return Promise.resolve(seat);
          });
      }));
    });
}

function createSeat(tribuneName, sectorName, rowName, seat, slug) {
  let newSeat = new Seat({
    slug: slug,
    tribune: tribuneName,
    sector: sectorName,
    row: rowName,
    seat: seat,
    reservedUntil: new Date(),
    reservedByCart: ''
  });
  return newSeat.save();
}
