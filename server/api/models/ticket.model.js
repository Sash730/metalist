'use strict';

import mongoose from 'mongoose';

var TicketSchema = new mongoose.Schema({
    orderNumber: {
        type: String,
        required: true
    },
    accessCode: {
        type: String,
        required: true
    },
    match: {
        type: String,
        required: true
    },
    seat: {
        type: String,
        required: true
    },
    user: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: [ 'new', 'used' ],
        required: true
    },
    valid: {
        from: {type: Date, required: true},
        to: {type: Date, required: true},
    },
    timesUsed: {
        type: Number,
        default: 0
    }
});

export default mongoose.model('Ticket', TicketSchema);
