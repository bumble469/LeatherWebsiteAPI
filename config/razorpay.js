const Razorpay = require('razorpay');
require('dotenv').config();

const instance = new Razorpay({
    key_id: process.env.RAZOR_API_KEY,
    key_secret: process.env.RAZOR_API_KEY_SECRET
});

module.exports = instance;