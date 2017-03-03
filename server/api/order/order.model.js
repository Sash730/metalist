'use strict';

import mongoose from 'mongoose';
mongoose.Promise = require('bluebird');
import {Schema} from 'mongoose';
import {formatMoney} from '../../util';
import  {Ticket} from '../ticket/ticket.model';


var OrderSchema = new Schema({
    orderNumber: {
        type: String,
        required: function(value) {
            return this.type === 'order';
        },
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
    context: {
        type: String,
        enum: [ 'website', 'cashbox' ],
        required: true,
        default: 'website',
    },
    paymentDetails: Schema.Types.Mixed,
    tickets: [ {type: Schema.Types.ObjectId, ref: 'Ticket'} ],
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
    .virtual('formattedAmount')
    .get(function() {
        return formatMoney(this.amount);
    });

OrderSchema
    .virtual('statusNew')
    .get(function() {
        return this.status === 'new';
    });
OrderSchema
    .virtual('statusPaid')
    .get(function() {
        return this.status === 'paid';
    });
OrderSchema
    .virtual('statusFailed')
    .get(function() {
        return this.status === 'failed';
    })
;
export let Order = mongoose.model('Order', OrderSchema);

