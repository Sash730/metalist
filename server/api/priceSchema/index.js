'use strict';

const express = require('express'),
      controller = require('./priceSchema.controller.js');

const router = express.Router();

router.get('/', controller.index);
router.get('/:id', controller.view);
router.put('/:name', controller.savePriceSchema);
router.delete('/:id', controller.deletePrice);


module.exports = router;
