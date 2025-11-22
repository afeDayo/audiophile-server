const express = require("express");
const router = express.Router();

// @desc    Get cart from localStorage (frontend handles cart)
// @route   POST /api/cart/validate
// @access  Public
router.post("/validate", (req, res) => {
  try {
    const { cart } = req.body;

    if (!cart || !Array.isArray(cart)) {
      return res.status(400).json({ message: "Invalid cart data" });
    }

    // Calculate totals
    const subtotal = cart.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );
    const shipping = 50;
    const vat = Math.round(subtotal * 0.2); // 20% VAT
    const grandTotal = subtotal + shipping + vat;

    res.json({
      valid: true,
      totals: {
        subtotal,
        shipping,
        vat,
        grandTotal,
      },
    });
  } catch (error) {
    console.error("Cart validation error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
