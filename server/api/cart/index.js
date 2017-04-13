'use strict';

let express = require('express');
let controller = require('./cart.controller');

let router = express.Router();

router.post('/', controller.createCart);
router.get('/', controller.getCart);

router.post('/addSeat', controller.addSeatToCart);
router.delete('/seat/:slug', controller.deleteSeatFromCart);

module.exports = router;
