'use strict';

let express = require('express');
let controller = require('./cart.controller');

let router = express.Router();

router.post('/', controller.createCart);
router.get('/cart/:cart', controller.getCart);

module.exports = router;
