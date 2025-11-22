const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const Order = require("../models/Order");
const mongoose = require("mongoose");

// @desc    Create new order
// @route   POST /api/orders
// @access  Public
router.post(
  "/",
  [
    // Validation middleware
    body("customerInfo.name").notEmpty().withMessage("Name is required"),
    body("customerInfo.email").isEmail().withMessage("Valid email is required"),
    body("customerInfo.phone")
      .notEmpty()
      .withMessage("Phone number is required"),
    body("customerInfo.address").notEmpty().withMessage("Address is required"),
    body("customerInfo.zipCode").notEmpty().withMessage("ZIP code is required"),
    body("customerInfo.city").notEmpty().withMessage("City is required"),
    body("customerInfo.country").notEmpty().withMessage("Country is required"),
    body("customerInfo.paymentMethod")
      .isIn(["e-Money", "Cash on Delivery"])
      .withMessage("Invalid payment method"),
    body("cartItems")
      .isArray({ min: 1 })
      .withMessage("Cart must have at least one item"),
    body("orderSummary").isObject().withMessage("Order summary is required"),
  ],
  async (req, res) => {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { customerInfo, cartItems, orderSummary } = req.body;

      // Validate cart items have required fields
      for (let item of cartItems) {
        if (!item.name || !item.price || !item.quantity || !item.image) {
          return res.status(400).json({ message: "Invalid cart item data" });
        }
      }

      // Create order
      const order = new Order({
        customerInfo,
        cartItems: cartItems.map((item) => ({
          productId: item._id
            ? new mongoose.Types.ObjectId(item._id)
            : new mongoose.Types.ObjectId(),
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
        })),
        orderSummary,
      });

      const createdOrder = await order.save();

      res.status(201).json(createdOrder);
    } catch (error) {
      console.error("Order creation error:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
);

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Public
router.get("/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid order ID" });
    }

    const order = await Order.findById(req.params.id);
    if (order) {
      res.json(order);
    } else {
      res.status(404).json({ message: "Order not found" });
    }
  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
