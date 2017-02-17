'use strict';

var express = require('express');
var controller = require('./priceSchema.controller.js');

var router = express.Router();

router.get('/', controller.index);
router.get('/:id', controller.view);
router.post('/', controller.createPrice);
router.put('/:name', controller.savePriceSchema);
router.delete('/:id', controller.deletePrice);


module.exports = router;
