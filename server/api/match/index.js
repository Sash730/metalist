'use strict';

var express = require('express');
var controller = require('./match.controller');

var router = express.Router();

router.get('/', controller.index);
router.get('/:id', controller.view);
router.get('/:id/seats', controller.seats);


module.exports = router;
