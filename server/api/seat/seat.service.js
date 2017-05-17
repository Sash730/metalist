'use strict';

import {RESERVE, PAID} from '../seat/seat.constants';
import Promise from 'bluebird';
import {Stadium} from '../../stadium';
import Seat from '../seat/seat.model';
import * as matchService from '../match/match.service';
import * as priceSchemaService from '../priceSchema/priceSchema.service';
import moment from 'moment';

export function getReservedSeats(matchId, sector) {
  return Seat.find({reservedUntil: {$gte: new Date()}, match: matchId, sector: sector});
}

export function getByMatchId(matchId) {
  return Seat.find({match: matchId});
}

export function findForMatchBySlug(slug, matchId) {
  return Seat.findOne({slug: slug, match: matchId})
    .populate('match');
}

export function extendReservationTime(seats) {
  return Promise.all(seats.map(seat => {
    return findForMatchBySlug(seat.slug, seat.match.id)
      .then(seat => {
        seat.reservedUntil = moment().add(30, 'minutes');
        return seat.save();
      });
  }));
}

export function reserveSeatsAsPaid(seats) {
  return Promise.all(seats.map(seat => {
    return Promise.all([
      findForMatchBySlug(seat.slug, seat.match),
      matchService.findById(seat.match)
    ])
      .then(([seat, match]) => {
        seat.reservedUntil = moment(match.date).add(1, 'days');
        seat.reservationType = PAID;
        return seat.save();
      });
  }));
}

export function clearReservation(seat) {
  seat.reservedByCart = '';
  seat.reservedUntil = moment().subtract(10, 'minutes');

  return seat.save();
}

export function findByCartAndMatchId(publicId, slug, matchId) {
  return Seat.findOne({reservedByCart: publicId, slug: slug, match: matchId});
}

export function reserveSeatAsReserve(seat, reserveDate, publicId) {
  return priceSchemaService.getSeatPrice(seat)
    .then(price => {
      if ( !price ) {
        throw new Error("price not found");
      }
      seat.reservedByCart = publicId;
      seat.reservedUntil = reserveDate;
      seat.reservationType = RESERVE;
      seat.price = price;

      return seat.save();
    })
}

export function createSeatsForMatch(match) {
  console.log("-----------------------/// add seats for match: ", match.id);

  return createStadiumSeatsForMatch(match)
    .catch(err => {
      if (err) {
        throw new Error(err);
      }
    });
}

export function deletePrevMatchSeats(seats, matchId) {
  console.log("-----------------------/// delete seats for previous match: ", matchId);

  let parameters = [];
  seats.forEach(seat => {
    parameters.push({matchId: seat.match})
  });
  return Promise.map(parameters, function({matchId}) {
    return removeSeatByMatchId(matchId);
  }, {concurrency: 1}).then(function() {
    return "done";
  });

}
// private function
function createStadiumSeatsForMatch(match) {
  let parameters = [];
  for (let tribune in Stadium) {
    for (let sector in Stadium[tribune]) {
      if (Stadium[tribune][sector].rows) {
        Stadium[tribune][sector].rows.forEach(row => {
          parameters.push({tribune: Stadium[tribune].name, sector: Stadium[tribune][sector].name, row: row, match: match});
        })
      }
    }
  }
  return Promise.map(parameters, function({tribune, sector, row, match}) {
    return createRowSeats(tribune, sector, row, match);
  }, {concurrency: 1}).then(function() {
    console.log("-----------------------/// add seats for match have done: ", match.id);
    return "done";
  });
}

function getRowSeats(seats) {
  return new Promise((resolve) => {
    resolve([...Array(parseInt(seats) + 1).keys()].filter(Boolean));
  });
}

function createRowSeats(tribuneName, sectorName, row, match) {
  return getRowSeats(row.seats)
    .then(seats => {
      let parameters = [];
      seats.forEach(seat => {
        parameters.push({tribune: tribuneName, sector: sectorName, row: row, seat: seat, match: match})
      });
      return Promise.map(parameters, function({tribune, sector, row, seat, match}) {
        return createSeat(tribune, sector, row, seat, match);
      }, {concurrency: 1}).then(function() {
        console.log("-----------------------/// add row seats have done: sector - " + sectorName + ' ,row - ' + row.name);
        return "done";
      });
     });
}

function createSeat(tribuneName, sectorName, row, seat, match) {
  let slug = 's' + sectorName + 'r' + row.name + 'st' + seat;
  let newSeat = new Seat({
    slug: slug,
    match: match.id,
    tribune: tribuneName,
    sector: sectorName,
    row: row.name,
    seat: seat,
    reservedUntil: new Date(),
    reservedByCart: ''
  });

  return newSeat.save();
}

function removeSeatByMatchId(matchId) {
  return Seat.remove({match: matchId});
}
