'use strict';

let express = require('express');
let controller = require('./seat.controller.js');
import * as auth from '../../auth/auth.service';

let router = express.Router();

router.get('/reserved-on-match/:id/sector/:sector', controller.getReservedSeats);

module.exports = router;
