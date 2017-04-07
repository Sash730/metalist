'use strict';

import {SEASON_TICKET, BLOCK} from '../seat/seat.constants';
import Seat from '../seat/seat.model';

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

export function getSeatBySlug(slug) {
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

export function reserveSeatAsSeasonTicket(seat, reserveDate) {
  seat.reservedUntil = reserveDate;
  seat.reservationType = SEASON_TICKET;
  return seat.save();
}

export function clearReservation(seat) {
  seat.reservedUntil = new Date();

  return seat.save();
}

// private function

function reserveSeatAsBlock(seat, reserveDate) {
  seat.reservedUntil = reserveDate;
  seat.reservationType = BLOCK;
  return seat.save();
}
