require('dotenv').config();
const express = require('express');
const router = express.Router();
const {checkAdminAccess,refreshAccessToken,loginAdmin} = require('../controllers/adminAccessController');

router.post('/admin-access', checkAdminAccess);

router.post('/refresh-access-token',refreshAccessToken);

router.post('/login', loginAdmin);

module.exports = router
