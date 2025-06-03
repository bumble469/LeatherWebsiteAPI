const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const { getAdminAllOrders } = require('../controllers/orderAdminController');

router.get('/admin-orders', authenticate, getAdminAllOrders);

module.exports = router;
