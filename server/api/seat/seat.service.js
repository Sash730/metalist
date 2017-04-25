'use strict';

import {SEASON_TICKET, BLOCK, RESERVE, PAID} from '../seat/seat.constants';
import Promise from 'bluebird';
import {Stadium} from '../../stadium';
import Seat from '../seat/seat.model';
import * as matchService from '../match/match.service';
import * as priceSchemaService from '../priceSchema/priceSchema.service';
import moment from 'moment';

export function getActiveSeasonTickets() {
  return Seat.find({reservedUntil: {$gte: new Date()}, reservationType: SEASON_TICKET});
}

export function getActiveBlockSeats() {
  return Seat.find({reservedUntil: {$gte: new Date()}, reservationType: BLOCK});
}

export function getNotActiveSeats(sector, row) {
  return Seat.find({sector: sector, row: row, reservedUntil: {$lte: new Date()}});
}

export function getBlockRowSeats(sector, row) {
  return Seat.find({sector: sector, row: row, reservationType: BLOCK});
}

export function findSeatBySlug(slug) {
  return Seat.findOne({slug: slug});
}

export function reserveSeatsAsBlock(seats, reserveDate) {
  return Promise.all(
    seats.map(seat => {
      return reserveSeatAsBlock(seat, reserveDate);
    })
  );
}

export function clearReservations(seats) {
  return Promise.all(seats.map(seat => {
      return clearReservation(seat);
    })
  );
}

export function extendReservationTime(seats) {
  return Promise.all(seats.map(seat => {
    return findSeatBySlug(seat.slug)
      .then(seat => {
        seat.reservedUntil = moment().add(30, 'minutes');
        return seat.save();
      });
  }));
}

export function reserveSeatsAsPaid(seats) {
  return Promise.all(seats.map(seat => {
    return Promise.all([
      findSeatBySlug(seat.slug),
      matchService.findById(seat.matchId)
    ])
      .then(([seat, match]) => {
        seat.reservedUntil = moment(match.date).add(1, 'days');
        seat.reservationType = PAID;
        return seat.save();
      });
  }));
}

export function reserveSeatAsSeasonTicket(seat, reserveDate) {
  seat.reservedUntil = reserveDate;
  seat.reservationType = SEASON_TICKET;
  return seat.save();
}

export function clearReservation(seat) {
  seat.reservedByCart = '';
  seat.reservedUntil = moment().subtract(10, 'minutes');

  return seat.save();
}

export function findSeatByCart(publicId, slug) {
  return Seat.findOne({reservedByCart: publicId, slug: slug});
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

export function createSeatsForMatch(matchId) {
  console.log("-----------------------/// add seats for match: ", matchId);

  return getReserveAndPaidSeats()
    .then(removeReserveAndPaidSeats)
    .then(() => {
      return createStadiumSeatsForMatch(matchId);
    })
    .catch(err => {
      if (err) {
        throw new Error(err);
      }
    });
}
// private function

function reserveSeatAsBlock(seat, reserveDate) {
  seat.reservedUntil = reserveDate;
  seat.reservationType = BLOCK;
  return seat.save();
}


function createStadiumSeatsForMatch(matchId) {
  let parameters = [];
  for (let tribune in Stadium) {
    for (let sector in Stadium[tribune]) {
      if (Stadium[tribune][sector].rows) {
        Stadium[tribune][sector].rows.forEach(row => {
          parameters.push({tribune: Stadium[tribune].name, sector: Stadium[tribune][sector].name, row: row, matchId: matchId});
        })
      }
    }
  }
  return Promise.map(parameters, function({tribune, sector, row, matchId}) {
    return createRowSeats(tribune, sector, row, matchId);
  }, {concurrency: 1}).then(function() {
    console.log("-----------------------/// add seats for match have done: ", matchId);
    return "done";
  });
}

function getRowSeats(seats) {
  return new Promise((resolve) => {
    resolve([...Array(parseInt(seats) + 1).keys()].filter(Boolean));
  });
}

function createRowSeats(tribuneName, sectorName, row, matchId) {
  return getRowSeats(row.seats)
    .then(seats => {
      let parameters = [];
      seats.forEach(seat => {
        parameters.push({tribune: tribuneName, sector: sectorName, row: row, seat: seat, matchId: matchId})
      });
      return Promise.map(parameters, function({tribune, sector, row, seat, matchId}) {
        return createSeat(tribune, sector, row, seat, matchId);
      }, {concurrency: 1}).then(function() {
        console.log("-----------------------/// add row seats have done: ", row.name);
        return "done";
      });
     });
}

function createSeat(tribuneName, sectorName, row, seat, matchId) {
  let slug = 's' + sectorName + 'r' + row.name + 'st' + seat;
  return findSeatBySlug(slug)
    .then(seat => {
      if(!seat) {
        let newSeat = new Seat({
          slug: slug,
          matchId: matchId,
          tribune: tribuneName,
          sector: sectorName,
          row: row.name,
          seat: seat,
          reservedUntil: new Date(),
          reservedByCart: ''
        });
        return newSeat.save();
      }
      return Promise.resolve(seat);
    });
}

function getReserveAndPaidSeats() {
  return Seat.find({reservationType: { $nin: [ SEASON_TICKET, BLOCK ]}});
}

function removeReserveAndPaidSeats(seats) {
  return Promise.map(seats, function(seat) {
    return removeSeatById(seat.id);
  }, {concurrency: 1}).then(function() {
    console.log("-----------------------/// remove reserve and paid seats have done:");
    return "done";
  })
}

function removeSeatById(id) {
  return Seat.findByIdAndRemove(id);
}

