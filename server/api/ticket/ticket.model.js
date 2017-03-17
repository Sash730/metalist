'use strict';

import mongoose from 'mongoose';
import {formatMoney} from '../../util';

const TicketSchema = new mongoose.Schema({
    cartId: {
      type: String
    },
    orderNumber: {
        type: String
    },
    accessCode: {
        type: String,
        required: true
    },
    seat: {
        id: {type: String, requried: true},
        tribune: {type: String, requried: true},
        sector: {type: String, requried: true},
        row: {type: String, requried: true},
        number: {type: Number, requried: true},
    },
    match: {
        id: {type: String, requried: true},
        headline: {type: String, requried: true},
        round: {type: Number, requried: true},
        date: {type: Date, requried: true},
    },
    user: {
        email: {type: String, requried: true},
        name: {type: String, requried: true},
    },
    amount: {
      type: Number,
      required: true,
      default: 0
    },
    reserveDate: {
      type: Date
    },
    status: {
        type: String,
        enum: [ 'new','paid', 'used' ],
        required: true
    },
    valid: {
        from: {type: Date, required: true},
        to: {type: Date, required: true},
    },
    timesUsed: {
        type: Number,
        default: 0
    },
    ticketNumber: {
      type: String,
      required: true
    },
}, {
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
});
TicketSchema
  .virtual('formattedAmount')
  .get(function() {
    return formatMoney(this.amount);
  });

export default mongoose.model('Ticket', TicketSchema);
