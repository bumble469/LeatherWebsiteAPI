const express = require('express');
const router = express.Router();
const {createOrder,verifyPayment} = require('../controllers/orderController');

router.post('/checkout', createOrder);

router.post('/verify-payment', verifyPayment);

module.exports = router;