'use strict';

import mongoose from 'mongoose';
mongoose.Promise = require('bluebird');
import {Schema} from 'mongoose';

const PriceSchema = new Schema({
  availabilityRows: {
    required: true,
    type: Object
  },
  price: {
    required: true,
    type: Object
  }
}, {
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
});

export default mongoose.model('PriceSchema', PriceSchema);
