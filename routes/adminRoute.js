const express = require('express');
const router = express.Router();
const { loginAdmin, getAdminDetails } = require('../controllers/adminController');

router.post('/login', loginAdmin);

router.get('/details/:id', getAdminDetails);

router.get('/api/:username', (req, res) => {
    const username = req.params.username;
    res.redirect(`/login?admin=${username}`);
});

module.exports = router;
