const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  products: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Products' },
      name: String,
      section: String,
      category: String,
      quantity: Number,
      price: Number,
      variants: [
        {
          type: Map,
          of: String,
        },
      ],
    },
  ],
  totalAmount: { type: Number, required: true },
  razorpayOrderId: String,
  razorpayPaymentId: String,
  razorpaySignature: String,
  paymentVerified: { type: Boolean, default: false },

  customer: {
    name: String,
    email: String,
    phone: String,
    address: {
      line1: String,
      line2: String,
      city: String,
      state: String,
      zip: String,
    },
  },

  status: {
    type: String,
    enum: ['Paid','Requested Cancellation','Cancellation Accepted','Cancellation Rejected','Refunded'],
    default: 'Paid',
  },

  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Order', orderSchema);
