'use strict';

var express = require('express');
var controller = require('./order.controller');
import * as auth from '../../auth/auth.service';

var router = express.Router();

router.post('/checkout', auth.isAuthenticated(), controller.checkout);
router.get('/order/:privateId', auth.hasRole('admin'), controller.getOrderByPrivateId);
router.get('/payment-status', auth.isAuthenticated(), controller.getPaymentStatus);
router.post('/liqpay-redirect', controller.liqpayRedirect);
router.post('/liqpay-callback', controller.liqpayCallback);

module.exports = router;
