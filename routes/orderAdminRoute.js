const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const { getAdminAllOrders, updateCancellationRequest } = require('../controllers/orderAdminController');

router.get('/admin-orders', authenticate, getAdminAllOrders);

router.post('/update-cancellation-request', authenticate, updateCancellationRequest);

module.exports = router;
