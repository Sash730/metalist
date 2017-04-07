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
    amount: {
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
});

export let Order = mongoose.model('Order', OrderSchema);

