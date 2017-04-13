'use strict';

import { Stadium } from '../stadium';
import Seat from '../api/seat/seat.model';
import PriceSchema from "../api/priceSchema/priceSchema.model";
import * as seatService from '../api/seat/seat.service';
import * as matchService from '../api/match/match.service';
import * as log4js from 'log4js';

const logger = log4js.getLogger('Migration');

export function addStadiumSeats(req, res) {
  let matchId = req.body.matchId,
    priceId = req.body.priceId;

  return seatService.deletePrevMatchStadiumSeats()
    .then(() => {
    return Promise.all([
      matchService.findMatchById(matchId),
      PriceSchema.findById(priceId)
    ]);
    })
    .then(([match, priceSchema]) => {
      if (!match || !priceSchema) {
        throw new Error("Params not found");
      }
      return createStadiumSeatsForMatch(matchId, priceSchema)
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

function createStadiumSeatsForMatch(matchId, priceSchema) {
  let promises = [];
  for (let tribune in Stadium) {
    for (let sector in Stadium[tribune]) {
      if (Stadium[tribune][sector].rows) {
        Stadium[tribune][sector].rows.forEach(row => {
          promises.push(createRowSeats(Stadium[tribune].name, Stadium[tribune][sector].name, row, matchId, priceSchema));
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

function createRowSeats(tribuneName, sectorName, row, matchId, priceSchema) {
  return Promise.all([
    getRowSeats(row.seats),
    getPrice(tribuneName, sectorName, priceSchema)
  ])
    .then(([seats, price]) => {
      return Promise.all(seats.map(stadiumSeat => {
        let slug = 's' + sectorName + 'r' + row.name + 'st' + stadiumSeat;

        return seatService.findSeatBySlug(slug)
          .then(seat => {
            if (!seat) {
              return createSeat(tribuneName, sectorName, row.name, stadiumSeat, slug, matchId, price);
            }
            return Promise.resolve(seat);
          });
      }));
    });
}

function createSeat(tribuneName, sectorName, rowName, seat, slug, matchId, price) {
  let newSeat = new Seat({
    slug: slug,
    matchId: matchId,
    amount: price,
    tribune: tribuneName,
    sector: sectorName,
    row: rowName,
    seat: seat,
    reservedUntil: new Date(),
    reservedByCart: ''
  });
  return newSeat.save();
}

function getPrice(tribuneName, sectorName, priceSchema) {
  return new Promise((resolve) => {
    let price = getPriceInPriceSchema(priceSchema, tribuneName, sectorName);
    console.log('price', price);
    resolve(price);
  });
}

function getPriceInPriceSchema(priceSchema, tribuneName, sectorName) {
  let schema = priceSchema.priceSchema;

  if (!schema['tribune_'+tribuneName]) {
    return 0;
  }
  if (schema['tribune_'+tribuneName]['sector_'+sectorName]) {
    let price  = schema['tribune_'+tribuneName]['sector_'+sectorName].price;

    if (!price) {
      return schema['tribune_'+tribuneName].price || 0;
    }
    return price;
  } else {
    return schema['tribune_'+tribuneName].price || 0;
  }
}
