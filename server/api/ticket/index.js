'use strict';

let express = require('express'),
    controller = require('./ticket.controller');
import * as auth from '../../auth/auth.service.js';

let router = express.Router();

router.get('/ticket/:ticketNumber', controller.getTicketPdfById);

router.get('/events-statistics', auth.hasRole('admin'), controller.getEventsStatistics);
router.get('/days-statistics', auth.hasRole('admin'), controller.getDaysStatistics);

router.get('/tribune/:tribune/code/:code', auth.hasRole('steward'), controller.use);
router.get('/sold-tickets', auth.hasRole('steward'), controller.getTicketsForCheckMobile);
router.get('/count/:tribune', auth.hasRole('steward'), controller.getCountValidTicketsByTribune);

module.exports = router;
