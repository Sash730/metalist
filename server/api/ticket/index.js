'use strict';

let express = require('express'),
    controller = require('./ticket.controller');
import * as auth from '../../auth/auth.service.js';

let router = express.Router();

router.get('/', auth.isAuthenticated(), controller.index);
router.get('/reserved-on-match/:id/sector/:sector', controller.getReservedtickets);
router.get('/:code/print'/*, auth.isAuthenticated()*/, controller.print);
router.get('/:code/check', auth.isAuthenticated(), controller.use);
router.get('/sold-tickets', auth.isAuthenticated(), controller.getTicketsForCheckMobile);


module.exports = router;
