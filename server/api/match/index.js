'use strict';

const express = require('express'),
      controller = require('./match.controller');

const router = express.Router();

router.get('/next', controller.getNextMatches);
router.get('/prev', controller.getPrevMatches);
router.get('/:id', controller.getMatchById);
router.post('/', controller.createMatch);
router.put('/:id', controller.updateMatch);
router.delete('/:id', controller.deleteMatch);


module.exports = router;
