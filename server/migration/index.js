'use strict';

let express = require('express');
let controller = require('./migration.controller');
import * as auth from '../auth/auth.service.js';

let router = express.Router();

router.post('/', auth.hasRole('admin'), controller.addStadiumSeats);

module.exports = router;
