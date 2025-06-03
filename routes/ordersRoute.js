const express = require('express');
const router = express.Router();
const {sendKey,createOrder,verifyPayment} = require('../controllers/orderController');

router.get('/get-razorpay-key', sendKey)

router.post('/checkout', createOrder);

router.post('/verify-payment', verifyPayment);

module.exports = router;