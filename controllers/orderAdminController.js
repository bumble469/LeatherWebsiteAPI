const Order = require('../models/orders');
const nodemailer = require("nodemailer");
require('dotenv').config();
const instance = require('../config/razorpay');

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

const refundPayment = async (req, res) => {
  const { paymentId, orderId } = req.body;

  try {
    if (!paymentId || !orderId) {
      return res.status(400).json({ message: "Payment ID and Order ID are required!" });
    }

    const order = await Order.findById(orderId); 
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const payment = await instance.payments.fetch(paymentId);
    const originalAmount = payment.amount; 

    let refundAmount = originalAmount;
    let refundType = "Full";

    if (order.status === "Delivered") {
      refundAmount = Math.floor(originalAmount * 0.95);
      refundType = "Partial";
    }

    const refund = await instance.payments.refund(paymentId, {
      amount: refundAmount,
    });

    await Order.findByIdAndUpdate(
      orderId,
      { status: 'Refunded' },
      { new: true }
    );

    await sendRefundUpdate(order, refundAmount / 100, refundType);

    res.status(200).json({
      success: true,
      message: `${refundType} refund successful`,
      refund,
    });
  } catch (err) {
    console.error("Error refunding payment:", err);
    res.status(500).json({ error: "Error refunding payment" });
  }
};

const sendRefundUpdate = async (order, refundAmountRupees, refundType) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASS
    }
  });

  const subject = `Refund Processed for Order ${order._id}`;
  const body = `
    <h2>Hi ${order.customer.name},</h2>
    <p>Your ${refundType.toLowerCase()} refund has been successfully processed for order <strong>${order._id}</strong>.</p>
    <h4>Order Summary:</h4>
    <ul>
      ${order.products.map(p => `
        <li>
          <strong>${p.name}</strong> - ${p.section} / ${p.category}<br/>
          Quantity: ${p.quantity} | Price: ₹${p.price}
        </li>
      `).join('')}
    </ul>
    <p><strong>Refund Amount:</strong> ₹${refundAmountRupees}</p>
    <p><strong>Refund Type:</strong> ${refundType}</p>
    <br/>
    <p>If you have any questions, feel free to contact our support team.</p>
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
  updateCancellationRequest,
  refundPayment
};
