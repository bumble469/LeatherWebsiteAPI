const express = require('express');
const router = express.Router();
const {sendKey,createOrder,verifyPayment,requestCancellation} = require('../controllers/orderController');

router.get('/get-razorpay-key', sendKey)

router.post('/checkout', createOrder);

router.post('/verify-payment', verifyPayment);

router.post('/request-order-cancel',requestCancellation)

module.exports = router;