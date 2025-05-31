const express = require('express');
const router = express.Router();
const productAdminController = require('../controllers/productAdminController');
const upload = require('../services/upload');

router.post('/product/add', upload.array('images', 3), productAdminController.createProduct);

router.get('/', productAdminController.getAllProducts);

router.get('/:id', productAdminController.getProductById);

router.put('/product/:id', upload.array('images', 5), productAdminController.updateProduct);

router.delete('/product/:id', productAdminController.deleteProduct);

module.exports = router;
