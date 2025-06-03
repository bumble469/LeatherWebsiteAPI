require('dotenv').config();
const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate')
const {checkAdminAccess,refreshAccessToken,loginAdmin,logoutAdmin} = require('../controllers/adminAccessController');

router.post('/admin-access', checkAdminAccess);

router.post('/refresh-access-token', refreshAccessToken);

router.post('/login', loginAdmin);

router.post('/logout',authenticate,logoutAdmin);

module.exports = router
