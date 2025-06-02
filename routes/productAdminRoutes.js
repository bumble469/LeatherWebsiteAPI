const express = require('express');
const router = express.Router();

const {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct
} = require('../controllers/productAdminController');

const upload = require('../services/upload');
const authenticate = require('../middleware/authenticate');

router.post(
  '/product/add',
  authenticate,
  upload.array('images', 3),
  createProduct
);

router.get('/adminproducts',authenticate,getAllProducts);

router.get('/adminproductsid/:id', authenticate, getProductById);

router.put(
  '/product/:id',
  authenticate,
  upload.array('images', 5),
  updateProduct
);

// Delete product by ID (authenticated)
router.delete('/product/:id', authenticate, deleteProduct);

module.exports = router;
