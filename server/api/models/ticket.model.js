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
    seat: {
        sector: {type: Number, requried: true},
        row: {type: Number, requried: true},
        number: {type: Number, requried: true},
    },
    match: {
        headline: {type: String, requried: true},
        round: {type: Number, requried: true},
        date: {type: Date, requried: true},
    },
    user: {
        email: {type: String, requried: true},
        name: {type: String, requried: true},
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
}, {
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
});

export default mongoose.model('Ticket', TicketSchema);
