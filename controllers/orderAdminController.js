const Order = require('../models/orders');
const nodemailer = require("nodemailer");
require('dotenv').config();

const getAdminAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error.message);
    res.status(500).json({ error: 'Failed to retrieve orders' });
  }
};

const updateCancellationRequest = async (req, res) => {
  try {
    const { orderid, status } = req.body;

    if (!orderid || !status) {
      return res.status(400).json({ message: "Order ID and status are required!" });
    }

    if (!['Cancellation Accepted', 'Cancellation Rejected'].includes(status)) {
      return res.status(400).json({ message: "Invalid status, cannot update" });
    }

    const orderToUpdate = await Order.findByIdAndUpdate(
      orderid,
      { status },
      { new: true }
    );

    if (!orderToUpdate) {
      return res.status(404).json({ message: "Order not found!" });
    }

    await sendUpdateEmail(orderToUpdate, status);

    return res.status(200).json({ message: "Order status updated and email sent!" });
  } catch (err) {
    console.error("Error updating cancellation request", err);
    return res.status(500).json({ error: "Failed to update cancellation request status" });
  }
};

const sendUpdateEmail = async (order, status) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASS
    }
  });

  const subject = `Order Cancellation ${status}`;
  const body = `
    <h2>Hi ${order.customer.name},</h2>
    <p>Your cancellation request for the order <strong>${order._id}</strong> has been <strong>${status === "Cancellation Accepted" ? 'cancelled on your request' : 'not been cancelled either because it has been shipped or some other reason'}</strong>.</p>
    <h4>Order Summary:</h4>
    <ul>
      ${order.products.map(p => `
        <li>
          <strong>${p.name}</strong> - ${p.section} / ${p.category}<br/>
          Quantity: ${p.quantity} | Price: ₹${p.price}
        </li>
      `).join('')}
    </ul>
    <p>Total Amount: ₹${order.totalAmount}</p>
    <br/>
    <p>If you have any questions, please contact our support team.</p>
  `;

  await transporter.sendMail({
    from: `"Jolly Leathers" <${process.env.EMAIL}>`,
    to: order.customer.email,
    subject,
    html: body
  });
};

module.exports = {
  getAdminAllOrders,
  updateCancellationRequest
};
