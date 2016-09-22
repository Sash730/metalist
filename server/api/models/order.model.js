'use strict';

import mongoose from 'mongoose';
mongoose.Promise = require('bluebird');
import {Schema} from 'mongoose';
import {formatMoney} from '../../util';

var OrderItemSchema = new Schema({
    seatId: String,
    matchId: String,
    amount: {
        type: Number,
        required: true
    }
}, {
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
});
OrderItemSchema
    .virtual('formattedAmount')
    .get(function() {
        return formatMoney(this.amount);
    })
;

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
        default: 0,
    },
    status: {
        type: String,
        enum: [ 'new', 'paid' ],
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
    items: [ OrderItemSchema ],
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
    })
;
export var Order = mongoose.model('Order', OrderSchema);
export var OrderItem = mongoose.model('OrderItem', OrderItemSchema);

