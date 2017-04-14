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
    seat: {type: Number, requried: true},
  },
  match: {
    id: {type: String, requried: true},
    headline: {type: String, requried: true},
    date: {type: Date, requried: true},
  },
  userId: {
    type: String
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
    enum: ['paid', 'used'],
    required: true
  },
  timesUsed: {
    type: Number,
    default: 0
  },
  ticketNumber: {
    type: String,
    required: true
  },
});

export default mongoose.model('Ticket', TicketSchema);
