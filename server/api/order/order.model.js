'use strict';

import mongoose from 'mongoose';
mongoose.Promise = require('bluebird');
import { Schema } from 'mongoose';
import { Ticket } from '../ticket/ticket.model';
import { Seat } from '../seat/seat.model';


let OrderSchema = new Schema({
    publicId: {
      type: String,
      required: true
    },
    price: {
        type: Number,
        required: true,
        default: 0
    },
    status: {
        type: String,
        enum: [ 'new', 'paid', 'failed' ],
        required: true,
        default: 'new',
    },
    type: {
        type: String,
        enum: [ 'order', 'cart' ],
        required: true,
        default: 'cart',
    },
    paymentDetails: Schema.Types.Mixed,
    tickets: [ {type: Schema.Types.ObjectId, ref: 'Ticket'} ],
    seats: [ {type: Schema.Types.ObjectId, ref: 'Seat'} ],
    user: {
        id: String,
        email: String,
        name: String,
    },
    created: {
        type: Date,
        default: Date.now
    },
}, {
  toObject: { virtuals: true },
  toJSON: { virtuals: true },
});

OrderSchema
  .virtual('size')
  .get(function() {
    return this.seats.length;
  });

export default mongoose.model('Order', OrderSchema);

