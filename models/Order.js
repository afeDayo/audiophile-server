const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  // Add this orderId field to match the existing index
  orderId: {
    type: String,
    unique: true,
    default: function () {
      return `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    },
  },

  customerInfo: {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    zipCode: { type: String, required: true },
    city: { type: String, required: true },
    country: { type: String, required: true },
    paymentMethod: {
      type: String,
      required: true,
      enum: ["e-Money", "Cash on Delivery"],
    },
    eMoneyNumber: { type: String, default: "" },
    eMoneyPIN: { type: String, default: "" },
  },
  cartItems: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
      },
      name: { type: String, required: true },
      price: { type: Number, required: true },
      quantity: { type: Number, required: true },
      image: { type: String, required: true },
    },
  ],
  orderSummary: {
    subtotal: { type: Number, required: true },
    shipping: { type: Number, required: true },
    vat: { type: Number, required: true },
    grandTotal: { type: Number, required: true },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Order", orderSchema);
