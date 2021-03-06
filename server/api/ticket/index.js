'use strict';

let express = require('express'),
    controller = require('./ticket.controller');
import * as auth from '../../auth/auth.service.js';

let router = express.Router();

router.get('/', auth.isAuthenticated(), controller.index);
router.get('/reserved-on-match/:id/sector/:sector', controller.getReservedTickets);
router.get('/:code/print'/*, auth.isAuthenticated()*/, controller.print);
router.get('/:code/check', auth.hasRole('admin'), controller.use);
router.get('/sold-tickets', auth.hasRole('admin'), controller.getTicketsForCheckMobile);
router.get('/events-statistics', auth.hasRole('admin'), controller.getEventsStatistics);
router.get('/days-statistics', auth.hasRole('admin'), controller.getDaysStatistics);
router.get('/ticket/:ticketNumber', controller.getTicketPdfById);

module.exports = router;
