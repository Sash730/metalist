'use strict';

import Ticket from './ticket.model';
import * as priceSchemaService from '../priceSchema/priceSchema.service';
import * as matchService from '../match/match.service';

export function createTicket(seat) {
  return Promise.all([
    priceSchemaService.getSeatAmount(seat),
    matchService.findMatchById(seat.matchId)
  ])
    .then(() => {
      let ticket = new Ticket({
        cartId: cart.id,
        accessCode: randomNumericString(16),
        match: { //@TODO investigate if it's required to have all match info here
          id: match.id,
          headline: match.headline,
          round: match.round,
          date: match.date
        },
        seat: { //@TODO investigate if it's required to have all these fields here
          id: seat.id,
          tribune: seat.tribune,
          sector: seat.sector,
          row: seat.row,
          number: seat.number
        },
        amount: parseInt(price) * 100,//money formatted(for liqpay)
        //status: 'new', // @TODO make all statuses as constants
        ticketNumber: uuid.v1(), //@TODO mostly this number should be created only after ticket is paid
        // valid: { //@TODO investigate if it's necessary
        //   from: ((d) => {
        //     let d1 = new Date(d);
        //     d1.setHours(0, 0, 0, 0);
        //     return d1;
        //   })(match.date),
        //   to: ((d) => {
        //     let d1 = new Date(d);
        //     d1.setHours(23, 59, 59, 0);
        //     return d1;
        //   })(match.date)
        // },
        // timesUsed: 0 //@TODO investigate if it's necessary
      });

      return ticket.save();
    });
}

function randomNumericString(length) {
  let chars = '0123456789';
  let result = '';
  for (let i = length; i > 0; --i) result += chars[Math.round(Math.random() * (chars.length - 1))];
  return result;
}
