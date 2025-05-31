const Product = require('../models/product');

// ✅ Get Sizes for a Product
exports.getSizesByProduct = async (req, res) => {
    try {
        const { productId } = req.params;
        const product = await Product.findById(productId).select('variants');

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const sizes = [...new Set(product.variants.flatMap(variant => variant.size || []))];

        if (sizes.length === 0) {
            return res.status(404).json({ message: 'No sizes found for this product' });
        }

        res.status(200).json({ sizes });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getColorsByProduct = async (req, res) => {
    try {
        const { productId } = req.params;
        const product = await Product.findById(productId).select('variants');

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const colors = [...new Set(product.variants.map(variant => variant.color).filter(Boolean))];

        if (colors.length === 0) {
            return res.status(404).json({ message: 'No colors found for this product' });
        }

        res.status(200).json({ colors });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
