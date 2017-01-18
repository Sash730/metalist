'use strict';

var express = require('express');
var controller = require('./order.controller');
import * as auth from '../../auth/auth.service';

var router = express.Router();

router.post('/cart', controller.updateCart);
router.get('/cart', controller.getCart);
router.get('/user-cart', auth.isAuthenticated(), controller.getUserCart);
router.delete('/cart/tickets/:ticketId', controller.deleteItemFromCart);
router.post('/cart/convert', auth.isAuthenticated(), controller.convertCartToOrder);
router.post('/liqpay-redirect', controller.liqpayRedirect);
router.post('/liqpay-callback', controller.liqpayCallback);
router.get('/my', auth.isAuthenticated(), controller.getMyOrders);
router.get('/by-number/:orderNumber', controller.getOrderByNumber);
router.get('/by-number/:orderNumber/tickets', controller.getOrderedTickets);
router.get('/:date', controller.getCountPaidOrders);

module.exports = router;
