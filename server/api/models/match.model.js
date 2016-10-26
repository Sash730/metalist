'use strict';

import mongoose from 'mongoose';
mongoose.Promise = require('bluebird');
import {Schema} from 'mongoose';

var MatchSchema = new Schema({
    rival: {
        type: String,
        required: true,
    },
    homeMatch: {
        type: Boolean,
        default: true,
    },
    date: {
        type: Date,
        default: null
    },
    dateApproximate: {
        type: String,
        default: null,
    },
    round: {
        type: Number,
        required: true,
    },
    info: String,
}, {
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
});
MatchSchema
    .virtual('awayMatch')
    .get(function() {
        return !this.homeMatch;
    })
    .set(function(value) {
        this.homeMatch = !value;
    })
;
MatchSchema
    .virtual('headline')
    .get(function() {
        return this.homeMatch ? 'Metalist vs ' + this.rival : this.rival + 'vs Metalist';
    })
;

export default mongoose.model('Match', MatchSchema);
