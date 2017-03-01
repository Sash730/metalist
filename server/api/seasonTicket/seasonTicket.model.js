'use strict';

import mongoose from 'mongoose';
mongoose.Promise = require('bluebird');
import {Schema} from 'mongoose';

const SeasonTicketSchema = new Schema({
  seatId: {type: String, requried: true},
  number: {type: String, requried: true},
  sector: {type: Number, requried: true},
  row: {type: Number, requried: true},
  seat: {type: Number, requried: true},
  valid: {type: Date, required: true}
}, {
  toObject: { virtuals: true },
  toJSON: { virtuals: true }
});

export default mongoose.model('SeasonTicket', SeasonTicketSchema);

