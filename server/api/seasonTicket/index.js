'use strict';

let express = require('express');
let controller = require('./seasonTicket.controller.js');
import * as auth from '../../auth/auth.service.js';

let router = express.Router();

router.get('/', auth.hasRole('admin'), controller.index);
router.get('/:number', auth.hasRole('admin'), controller.view);
router.put('/:number', auth.hasRole('admin'), controller.saveSeasonTicket);
router.delete('/:number', auth.hasRole('admin'), controller.deleteSeasonTicket);


module.exports = router;
