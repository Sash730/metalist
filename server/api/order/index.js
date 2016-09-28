'use strict';

var express = require('express');
var controller = require('./order.controller');

var router = express.Router();

router.post('/cart', controller.updateCart);
router.get('/cart', controller.getCart);
router.delete('/cart/items/:itemId', controller.deleteItemFromCart);
router.post('/cart/convert', controller.convertCartToOrder);
router.post('/liqpay-redirect', controller.liqpayRedirect);
router.post('/liqpay-callback', controller.liqpayCallback);
router.get('/my', controller.getMyOrders);
router.get('/by-number/:orderNumber', controller.getOrderByNumber);

module.exports = router;
