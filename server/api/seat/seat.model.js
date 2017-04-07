'use strict';

import mongoose from 'mongoose';
import { Schema } from 'mongoose';
import { BLOCK, PAID, RESERVE, SEASON_TICKET } from './seat.constants';
mongoose.Promise = require('bluebird');

const SeatSchema = new Schema({
  slug: { type: String, required: true },
  tribune: { type: String, requried: true },
  sector: { type: String, requried: true },
  row: { type: String, requried: true },
  seat: { type: Number, requried: true },
  reservedUntil: { type: Date },
  reservationType: { type: String, enum: [BLOCK, PAID, RESERVE, SEASON_TICKET] },
  reservedByCart: { type: String }
});

export default mongoose.model('Seat', SeatSchema);
