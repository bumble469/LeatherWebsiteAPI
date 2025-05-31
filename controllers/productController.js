const Product = require('../models/product');

exports.getFilteredProducts = async (req, res) => {
    try {
      const { section, category, color, size, buckleType, priceRange } = req.query;
      let filter = {};
  
      if (section) {
        filter.section = section.trim(); 
      }
      if (category) {
        filter.category = category.trim();  
      }
      if (color) {
        filter['variants.color'] = color.trim();  
      }
      if (size) {
        filter['variants.size'] = size.trim();  
      }
      if (buckleType) {
        filter['variants.buckleType'] = buckleType.trim();  
      }
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
  
  
