'use strict';

import Ticket from './ticket.model';
import * as priceSchemaService from '../priceSchema/priceSchema.service';
import * as matchService from '../match/match.service';
import * as crypto from 'crypto';

export function createTicket(seat) {
  return Promise.all([
    priceSchemaService.getSeatPrice(seat),
    matchService.findMatchById(seat.matchId)
  ])
    .then(([price, match]) => {
      let ticket = new Ticket({
        accessCode: randomNumericString(16),
        match: {
          id: match.id,
          headline: match.headline,
          date: match.date
        },
        seat: {
          id: seat.id,
          tribune: seat.tribune,
          sector: seat.sector,
          row: seat.row,
          seat: seat.seat
        },
        amount: price,
        status: 'paid',
        ticketNumber: crypto.randomBytes(20).toString('hex'),
        reserveDate: new Date()
      });

      return ticket.save();
    });
}

export function getUserTickets(tickets) {
  return Promise.all(tickets.map(ticketId => {
    return getTicketById(ticketId);
  }));
}

function getTicketById(ticketId) {
  return Ticket.findById(ticketId);
}

function randomNumericString(length) {
  let chars = '0123456789';
  let result = '';
  for (let i = length; i > 0; --i) result += chars[Math.round(Math.random() * (chars.length - 1))];
  return result;
}
