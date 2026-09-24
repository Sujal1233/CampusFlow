const express = require("express");

const {
    createOrder,
    getMyOrders,
    getOrder,
    updateOrderStatus,
    getVendorOrders
} = require("../controllers/orderController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

// Place order
router.post("/", protect, createOrder);

// Get my orders
router.get("/my-orders", protect, getMyOrders);

// Get vendor orders
router.get("/vendor-orders", protect, getVendorOrders);

// Get single order
router.get("/:id", protect, getOrder);

// Update order status
router.put("/:id/status", protect, updateOrderStatus);

module.exports = router;