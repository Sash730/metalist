'use strict';

var express = require('express');
var controller = require('./match.controller');

var router = express.Router();

router.get('/', controller.index);
router.get('/:id', controller.view);
router.get('/:id/seats', controller.seats);
router.post('/', controller.createMatch);
router.put('/:id', controller.updateMatch);
router.delete('/:id', controller.deleteMatch);


module.exports = router;
