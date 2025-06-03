const Order = require('../models/orders');

const getAdminAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error.message);
    res.status(500).json({ error: 'Failed to retrieve orders' });
  }
};

module.exports = {
  getAdminAllOrders
};
