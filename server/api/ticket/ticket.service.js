'use strict';

import Ticket from './ticket.model';
import * as priceSchemaService from '../priceSchema/priceSchema.service';
import * as matchService from '../match/match.service';
import * as crypto from 'crypto';
import Request from "request";

let couchbase = require('couchbase');
let cluster = new couchbase.Cluster('couchbase://127.0.0.1');
let bucket = cluster.openBucket('metal');

export function createTicket(seat) {
  return Promise.all([
    priceSchemaService.getSeatPrice(seat),
    matchService.findById(seat.matchId)
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
    })
    .then(createTicketInCoachDb);
}

export function getUserTickets(tickets) {
  return Promise.all(tickets.map(ticketId => {
    return getTicketById(ticketId);
  }));
}

export function getByTicketNumber(ticketNumber) {
  return Ticket.findOne({ticketNumber: ticketNumber});
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

function createTicketInCoachDb(ticket){
  let shortTicket = {
    'code': ticket.accessCode,
    'status': ticket.status,
    'tribune': ticket.seat.tribune,
    'sector': ticket.seat.sector,
    'row': ticket.seat.row,
    'seat': ticket.seat.seat,
    'headline': ticket.match.headline
  };

  return makePostRequest("http://localhost:4984/" + bucket._name + "/", {type: 'ticket', ticket: shortTicket})
      .then(result => {
        console.log(result);
        return ticket;
      })
      .catch(error => {
        console.log(error);
      });
}

function makePostRequest(url, body) {
  return new Promise((resolve, reject) => {
    Request.post(url, {json: body},
      function (error, response, body) {
        if (!error && response.statusCode == 200) {
          resolve(body);
        } else {
          reject(error);
        }
      }
    );
  });
}
