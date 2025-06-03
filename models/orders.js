const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    products:[
        {
            productId: {type:mongoose.Schema.Types.ObjectId, ref:'Products'},
            name: String,
            section: String, 
            category: String, 
            quantity: Number,
            price: Number,
            variants: [
                {
                    color: String,
                    size: { 
                        type: [String], 
                        required: function () { return this.category === "Boots"; } 
                    }, 
                    buckleType: { 
                        type: String, 
                        required: function () { return this.category === "Belts"; } 
                    }
                }
            ],
        }
    ],
    totalAmount: {type:Number,require:true},
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
        country: String
        }
    },

    status: {
        type: String,
        enum: ['Pending', 'Paid', 'Failed', 'Cancelled', 'Shipped', 'Delivered'],
        default: 'Pending'
    },

    createdAt: { type: Date, default: Date.now }
})

module.exports = mongoose.model('Order', orderSchema);