'use strict';

import mongoose from 'mongoose';
mongoose.Promise = require('bluebird');
import { Schema } from 'mongoose';

const MatchSchema = new Schema({
  rival: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: null
  },
  priceSchema: {type: Schema.ObjectId, ref: 'PriceSchema'},
  info: String,
  poster: String,
}, {
  toObject: {virtuals: true},
  toJSON: {virtuals: true},
});

MatchSchema
  .virtual('headline')
  .get(function () {
    return 'Металлист 1925 - ' + this.rival;
  })
;

export default mongoose.model('Match', MatchSchema);
