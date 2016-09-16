'use strict';

var express = require('express');
var controller = require('./ticket.controller');
import * as auth from '../../auth/auth.service.js';

var router = express.Router();

router.get('/', auth.isAuthenticated(), controller.index);
router.get('/:code/print'/*, auth.isAuthenticated()*/, controller.print);
router.get/*.post*/('/:code/use'/*, auth.isAuthenticated()*/, controller.use);



module.exports = router;
