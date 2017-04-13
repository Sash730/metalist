'use strict';

import {Stadium} from '../stadium';
import Seat from '../api/seat/seat.model';
import * as seatService from '../api/seat/seat.service';
import * as matchService from '../api/match/match.service';
import * as log4js from 'log4js';

const logger = log4js.getLogger('Migration');

export function addStadiumSeats(req, res) {
  let matchId = req.body.matchId;

  return deletePrevMatchStadiumSeats()
    .then(() => {
      return matchService.findMatchById(matchId)
    })
    .then(match => {
      if (!match) {
        throw new Error("Params not found");
      }
      return createStadiumSeatsForMatch(matchId)
    })
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

function createStadiumSeatsForMatch(matchId) {
  let promises = [];
  for (let tribune in Stadium) {
    for (let sector in Stadium[tribune]) {
      if (Stadium[tribune][sector].rows) {
        Stadium[tribune][sector].rows.forEach(row => {
          promises.push(createRowSeats(Stadium[tribune].name, Stadium[tribune][sector].name, row, matchId));
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

function createRowSeats(tribuneName, sectorName, row, matchId) {
  return getRowSeats(row.seats)
    .then(seats => {
      return Promise.all(seats.map(stadiumSeat => {
        let slug = 's' + sectorName + 'r' + row.name + 'st' + stadiumSeat;

        return seatService.findSeatBySlug(slug)
          .then(seat => {
            if (!seat) {
              return createSeat(tribuneName, sectorName, row.name, stadiumSeat, slug, matchId);
            }
            return Promise.resolve(seat);
          });
      }));
    });
}

function createSeat(tribuneName, sectorName, rowName, seat, slug, matchId) {
  let newSeat = new Seat({
    slug: slug,
    matchId: matchId,
    tribune: tribuneName,
    sector: sectorName,
    row: rowName,
    seat: seat,
    reservedUntil: new Date(),
    reservedByCart: ''
  });
  return newSeat.save();
}
