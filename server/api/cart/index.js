'use strict';

let express = require('express');
let controller = require('./cart.controller');

let router = express.Router();

router.post('/', controller.createCart);
router.get('/my-cart', controller.getCart);

router.post('/addSeat', controller.addSeatToCart);
router.delete('/match/:matchId/seat/:slug', controller.deleteSeatFromCart);

module.exports = router;
