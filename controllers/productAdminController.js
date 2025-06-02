const Product = require('../models/product');

const createProduct = async (req, res) => {
  try {
    const { name, section, category, price, description, stock, variants } = req.body;

    if (!name || !category || !price || !description || !stock) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    let parsedVariants = [];
    if (variants) {
      try {
        parsedVariants = JSON.parse(variants);
      } catch {
        return res.status(400).json({ message: "Invalid variants format" });
      }
    }

    const imageArray = req.files ? req.files.map(file => file.path) : [];

    const validatedVariants = parsedVariants.map(variant => {
      const { color, size, buckleType } = variant;
      let newVariant = { color };
      if (category === "Boots" && size) newVariant.size = size;
      if (category === "Belts" && buckleType) newVariant.buckleType = buckleType;
      return newVariant;
    });

    const newProduct = new Product({
      name,
      section,
      category,
      price,
      description,
      images: imageArray,
      stock,
      variants: validatedVariants,
    });

    await newProduct.save();
    res.status(201).json({ message: "Product added successfully", product: newProduct });

  } catch (error) {
    console.error("Error adding product:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getAllProducts = async (req, res) => {
  try {
    const { section, category, color, size, buckleType, priceRange } = req.query;
    let filter = {};

    if (section) filter.section = section.trim();
    if (category) filter.category = category.trim();
    if (color) filter['variants.color'] = color.trim();
    if (size) filter['variants.size'] = size.trim();
    if (buckleType) filter['variants.buckleType'] = buckleType.trim();

    if (priceRange) {
      const [minPrice, maxPrice] = priceRange.split('-');
      filter.price = { $gte: minPrice, $lte: maxPrice };
    }

    const products = await Product.find(filter);

    if (products.length === 0) {
      return res.status(404).json({ message: "No products found" });
    }

    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

const getProductById = async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json(product);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching product', error: err.message });
  }
};

const updateProduct = async (req, res) => {
  try {
    const productId = req.params.id;

    let parsedVariants = [];
    if (req.body.variants) {
      try {
        parsedVariants = JSON.parse(req.body.variants);
      } catch {
        return res.status(400).json({ message: "Invalid variants format" });
      }
    }

    const uploadedImageUrls = req.files ? req.files.map(file => file.path) : [];

    const updateData = { ...req.body };

    if (parsedVariants.length > 0) {
      updateData.variants = parsedVariants.map(variant => {
        const { color, size, buckleType } = variant;
        let newVariant = { color };
        if (updateData.category === "Boots" && size) newVariant.size = size;
        if (updateData.category === "Belts" && buckleType) newVariant.buckleType = buckleType;
        return newVariant;
      });
    }

    if (uploadedImageUrls.length > 0) {
      updateData.images = uploadedImageUrls;
    }

    const updatedProduct = await Product.findByIdAndUpdate(productId, updateData, { new: true });

    if (!updatedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json({
      message: 'Product updated successfully',
      product: updatedProduct
    });

  } catch (err) {
    console.error("Error updating product:", err);
    res.status(500).json({ message: 'Error updating product', error: err.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const productId = req.params.id;

    const deletedProduct = await Product.findByIdAndDelete(productId);

    if (!deletedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json({
      message: 'Product deleted successfully',
      product: deletedProduct
    });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting product', error: err.message });
  }
};

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct
};
