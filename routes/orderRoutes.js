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
  ],
  async (req, res) => {
    try {
      console.log("Received order request:", req.body);

      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log("Validation errors:", errors.array());
        return res.status(400).json({
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const { customerInfo, cartItems, orderSummary } = req.body;

      // Validate required fields
      if (!customerInfo || !cartItems || !orderSummary) {
        console.log("Missing required fields");
        return res.status(400).json({
          message:
            "Missing required fields: customerInfo, cartItems, or orderSummary",
        });
      }

      // Validate cart items
      if (!Array.isArray(cartItems) || cartItems.length === 0) {
        console.log("Invalid cart items");
        return res.status(400).json({
          message: "Cart must have at least one item",
        });
      }

      // Validate cart item structure
      for (const item of cartItems) {
        if (
          !item._id ||
          !item.name ||
          !item.price ||
          !item.quantity ||
          !item.image
        ) {
          return res.status(400).json({
            message: "Invalid cart item structure",
          });
        }

        // Validate price and quantity are numbers
        if (
          typeof item.price !== "number" ||
          typeof item.quantity !== "number"
        ) {
          return res.status(400).json({
            message: "Price and quantity must be numbers",
          });
        }
      }

      // Create order with proper data structure
      const order = new Order({
        customerInfo: {
          name: customerInfo.name,
          email: customerInfo.email,
          phone: customerInfo.phone,
          address: customerInfo.address,
          zipCode: customerInfo.zipCode,
          city: customerInfo.city,
          country: customerInfo.country,
          paymentMethod: customerInfo.paymentMethod,
          eMoneyNumber: customerInfo.eMoneyNumber || "",
          eMoneyPIN: customerInfo.eMoneyPIN || "",
        },
        cartItems: cartItems.map((item) => ({
          productId: item._id
            ? new mongoose.Types.ObjectId(item._id)
            : new mongoose.Types.ObjectId(),
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
        })),
        orderSummary: {
          subtotal: orderSummary.subtotal,
          shipping: orderSummary.shipping,
          vat: orderSummary.vat,
          grandTotal: orderSummary.grandTotal,
        },
      });

      console.log("Attempting to save order...");

      const createdOrder = await order.save();
      console.log("Order created successfully:", createdOrder._id);

      res.status(201).json(createdOrder);
    } catch (error) {
      console.error("Order creation error:", error);

      // More specific error handling
      if (error.name === "ValidationError") {
        return res.status(400).json({
          message: "Validation error",
          error: error.message,
        });
      }

      if (error.name === "CastError") {
        return res.status(400).json({
          message: "Invalid data format",
          error: error.message,
        });
      }

      res.status(500).json({
        message: "Server error while creating order",
        error: error.message,
        stack: process.env.NODE_ENV === "production" ? null : error.stack,
      });
    }
  }
);

// ... rest of your orderRoutes.js code remains the same

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
