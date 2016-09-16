'use strict';

import mongoose from 'mongoose';

var TicketSchema = new mongoose.Schema({
    text: String,
    available: Boolean,
    code: String, /// generated when sold
    used: {
        type: String,
        default: false
    },
    orderDetails: mongoose.Schema.Types.Mixed
});

export default mongoose.model('Ticket', TicketSchema);
