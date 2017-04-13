'use strict';

var express = require('express');
var controller = require('./order.controller');
import * as auth from '../../auth/auth.service';

var router = express.Router();

router.post('/cart', controller.updateCart);
router.delete('/cart/tickets/:seatId', controller.deleteItemFromCart);
router.post('/create-order', auth.isAuthenticated(), controller.createOrderForPay);
router.post('/liqpay-redirect', controller.liqpayRedirect);
router.post('/liqpay-callback', controller.liqpayCallback);

module.exports = router;
