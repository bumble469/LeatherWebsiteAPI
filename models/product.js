const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    name: String,
    section: String, 
    category: String, 
    price: Number,
    description: String,
    images: [String], 
    stock: Number,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
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
});

module.exports = mongoose.model("products", productSchema);
