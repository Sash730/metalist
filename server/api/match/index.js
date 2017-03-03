'use strict';

const express = require('express'),
      controller = require('./match.controller');

const router = express.Router();

router.get('/', controller.index);
router.get('/:id', controller.view);
router.post('/', controller.createMatch);
router.put('/:id', controller.updateMatch);
router.delete('/:id', controller.deleteMatch);


module.exports = router;
