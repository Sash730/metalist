'use strict';

let express = require('express');
let controller = require('./seasonTicket.controller.js');
import * as auth from '../../auth/auth.service.js';

let router = express.Router();

router.get('/season-tickets', auth.hasRole('admin'), controller.getSeasonTickets);
router.get('/block-row', auth.hasRole('admin'), controller.getBlocks);

router.post('/:slug', auth.hasRole('admin'), controller.createSeasonTicket);
router.delete('/:slug', auth.hasRole('admin'), controller.deleteSeasonTicket);

router.post('/addBlock/sector/:sector/row/:row', auth.hasRole('admin'), controller.blockRow);
router.delete('/deleteBlock/sector/:sector/row/:row', auth.hasRole('admin'), controller.deleteBlockRow);

module.exports = router;
