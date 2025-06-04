const instance = require('../config/razorpay');
require('dotenv').config();
const Order = require('../models/orders');
const nodemailer = require('nodemailer');

const DOMAIN_URL = process.env.ALLOWED_ORIGINS;

const sendKey = async(req,res) => {
  try{
    return res.status(200).json({key:process.env.RAZOR_API_KEY})
  }catch(err){
    console.error("Problem sending razorpay key: ", err);
    res.status(500).json({ error: 'Failed to create Razorpay order' });
  }
}

const createOrder = async (req, res) => {
  try {
    const options = {
      amount: req.body.amount * 100,
      currency: 'INR',
      receipt: `receipt_order_${Date.now()}`
    };

    const order = await instance.orders.create(options);
    return res.status(200).json({order});
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create Razorpay order' });
  }
};

const verifyPayment = async(req,res) => {
    try{
      //5267 3181 8797 5449 test card
      const {razorpay_order_id,razorpay_payment_id,razorpay_signature,totalAmount,cartItems,...userData} = req.body;
      const products = cartItems.map(item=>({
        productId: item._id,
        name: item.name,
        section: item.section,
        category: item.category,
        quantity: item.quantity,
        price: item.price,
        variants: item.variants.map(v => new Map(Object.entries(v)))
      }));

      const customerAddress = {
        line1: userData.address || "",
        line2: "",
        city: userData.city || "",
        state: userData.state || "",
        zip: userData.zipCode || "",
      };

      const newOrder = new Order({
        products,
        totalAmount,
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        paymentVerified: true,
        customer:{
          name: userData.fullName || "",
          email: userData.email || "",
          phone: userData.phone || "",
          address: customerAddress
        },
        status: 'Paid'
      });
      await newOrder.save();
      sendOrderReceipt(newOrder,userData.email);
      return res.status(200).json({ success: true });
    }catch(err){
        console.log(err);
        res.status(500).json({ error: 'Failed to verify payment! '})
    }
}

const sendOrderReceipt = async (order, clientEmail) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASS
    }
  });

  const { razorpayPaymentId, products, totalAmount, customer, _id } = order;
  const productDetails = products.map((p, i) => {
    const variantMap = p.variants?.[0];
    const variant = variantMap instanceof Map
      ? Object.fromEntries(variantMap.entries())
      : variantMap || {};

    return `
      <tr>
        <td style="padding: 8px; border: 1px solid #ddd;">${i + 1}</td>
        <td style="padding: 8px; border: 1px solid #ddd;">${p.name}</td>
        <td style="padding: 8px; border: 1px solid #ddd;">${p.category}</td>
        <td style="padding: 8px; border: 1px solid #ddd;">${p.quantity}</td>
        <td style="padding: 8px; border: 1px solid #ddd;">₹${p.price}</td>
        <td style="padding: 8px; border: 1px solid #ddd;">
          ${variant.section ? `<p>Section: ${variant.section}</p>` : ''}
          ${variant.buckleType ? `<p>Buckle Type: ${variant.buckleType}</p>` : ''}
          ${variant.color ? `<p>Color: ${variant.color}</p>` : ''}
          ${variant.size ? `<p>Size: ${variant.size}</p>` : ''}
        </td>
      </tr>
    `;
  }).join('');

  const mailOptions = {
    from: `"Jolly Leathers" <${process.env.EMAIL}>`,
    to: clientEmail,
    subject: `🛒 Order Confirmation - Order ID: ${_id}`,
    html: `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <h2>🧾 Order Confirmation</h2>

        <h3>💳 Payment Details</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td><strong>Order ID:</strong></td><td>${_id}</td></tr>
          <tr><td><strong>Payment ID:</strong></td><td>${razorpayPaymentId}</td></tr>
          <tr><td><strong>Amount Paid:</strong></td><td>₹${totalAmount}</td></tr>
          <tr><td><strong>Status:</strong></td><td>Paid</td></tr>
        </table>

        <h3 style="margin-top: 30px;">📦 Products Ordered</h3>
        <table style="width: 100%; border-collapse: collapse; border: 1px solid #ddd;">
          <thead>
            <tr style="background-color: #f2f2f2;">
              <th style="padding: 8px; border: 1px solid #ddd;">#</th>
              <th style="padding: 8px; border: 1px solid #ddd;">Name</th>
              <th style="padding: 8px; border: 1px solid #ddd;">Category</th>
              <th style="padding: 8px; border: 1px solid #ddd;">Qty</th>
              <th style="padding: 8px; border: 1px solid #ddd;">Price</th>
              <th style="padding: 8px; border: 1px solid #ddd;">Variants</th>
            </tr>
          </thead>
          <tbody>
            ${productDetails}
          </tbody>
        </table>

        <h3 style="margin-top: 30px;">👤 Customer Details</h3>
        <p>
          Name: ${customer?.name || 'N/A'}<br/>
          Email: ${customer?.email || 'N/A'}<br/>
          Phone: ${customer?.phone || 'N/A'}<br/>
          Address: ${customer?.address?.line1 || ''}, ${customer?.address?.city || ''}, ${customer?.address?.state || ''} - ${customer?.address?.zip || ''}
        </p>
        <a href="${DOMAIN_URL}/request-cancellation?id=${_id}"
          style="display:inline-block;padding:10px 20px;background:#dc3545;color:white;
                  text-decoration:none;border-radius:5px;font-weight:bold;margin-top:20px;">
          🚫 Request Cancellation
        </a>
        <hr/>
        <p style="font-size: 0.9em;"><em>This is an automated email from Jolly Leathers. For any queries or cancellations, please contact us via our website or this email.</em></p>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};

const requestCancellation = async (req, res) => {
  try {
    const { orderid } = req.body;

    const order = await Order.findById(orderid);
    if (!order) {
      return res.status(404).json({ message: "Order not found!" });
    }

    if (order.status === "Requested Cancellation") {
      return res.status(400).json({ message: "Cancellation already requested" });
    }

    order.status = "Requested Cancellation";
    await order.save();

    res.status(200).json({ message: "Requested Cancellation" });
  } catch (err) {
    console.error("Error requesting cancellation:", err);
    res.status(500).json({ message: "Error requesting cancellation" });
  }
};


module.exports = { sendKey, createOrder, verifyPayment, requestCancellation };
