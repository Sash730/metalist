'use strict';

import mongoose from 'mongoose';
import { Schema } from 'mongoose';
import { PAID, RESERVE} from './seat.constants';
mongoose.Promise = require('bluebird');

const SeatSchema = new Schema({
  slug: { type: String, required: true },
  match: { type: Schema.Types.ObjectId, ref: 'Match' },
  price: { type: Number, required: true, default: 0 },
  tribune: { type: String },
  sector: { type: String, requried: true },
  row: { type: String, requried: true },
  seat: { type: Number, requried: true },
  reservedUntil: { type: Date },
  reservationType: { type: String, enum: [PAID, RESERVE] },
  reservedByCart: { type: String }
},{
  toObject: { virtuals: true },
  toJSON: { virtuals: true },
});

SeatSchema
  .virtual('isReserved')
  .get(function() {
    return this.reservedUntil > new Date();
  });

export default mongoose.model('Seat', SeatSchema);
