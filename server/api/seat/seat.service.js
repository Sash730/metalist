'use strict';

import {SEASON_TICKET, BLOCK, RESERVE, PAID} from '../seat/seat.constants';
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
      matchService.findMatchById(seat.matchId)
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

// private function

function reserveSeatAsBlock(seat, reserveDate) {
  seat.reservedUntil = reserveDate;
  seat.reservationType = BLOCK;
  return seat.save();
}

