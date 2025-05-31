require('dotenv').config();
const express = require('express');
const router = express.Router();
const {checkAdminAccess} = require('../controllers/adminAccessController');

router.post('/admin-access', checkAdminAccess);

module.exports = router
