'use strict';

import mongoose from 'mongoose';
mongoose.Promise = require('bluebird');
import {Schema} from 'mongoose';

const SeasonTicketSchema = new Schema({
  seatId: {type: String, requried: true},
  sector: {type: String, requried: true},
  row: {type: String, requried: true},
  seat: {type: Number, requried: true},
  valid: {type: Date, required: true},
  type: {type: String, enum: ['ticket', 'block'], requried: true}
}, {
  toObject: { virtuals: true },
  toJSON: { virtuals: true }
});

export default mongoose.model('SeasonTicket', SeasonTicketSchema);

