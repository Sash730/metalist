'use strict';

let express = require('express');
let controller = require('./seasonTicket.controller.js');
import * as auth from '../../auth/auth.service.js';

let router = express.Router();

router.get('/', auth.hasRole('admin'), controller.index);
router.get('/:seatId', auth.hasRole('admin'), controller.view);
router.post('/', auth.hasRole('admin'), controller.createSeasonTicket);
router.put('/save', auth.hasRole('admin'), controller.saveSeasonTicket);
router.put('/addBlock/:sector/:row', auth.hasRole('admin'), controller.addBlockTicketInRow);
router.put('/deleteBlock/:sector/:row', auth.hasRole('admin'), controller.deleteBlockTicketInRow);
router.delete('/:seatId', auth.hasRole('admin'), controller.deleteSeasonTicket);


module.exports = router;
