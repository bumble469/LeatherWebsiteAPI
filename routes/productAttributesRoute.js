const express = require('express');
const router = express.Router();
const productController = require('../controllers/productAttributesController');

router.get('/products/:productId/sizes', productController.getSizesByProduct);
router.get("/products/:productId/colors", productController.getColorsByProduct);

module.exports = router;
