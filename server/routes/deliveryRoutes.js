const express = require("express");

const {
    getAvailableOrders,
    acceptOrder,
    getMyDeliveries,
    updateDeliveryStatus,
    findBestDeliveryPartner,
    autoAssignOrder
} = require("../controllers/deliveryController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

// Find best delivery partner
router.get(
    "/best-partner",
    protect,
    findBestDeliveryPartner
);

// Automatically assign order
router.put(
    "/auto-assign/:id",
    protect,
    autoAssignOrder
);

// Available orders
router.get(
    "/available",
    protect,
    getAvailableOrders
);

// Accept order
router.put(
    "/accept/:id",
    protect,
    acceptOrder
);

// My deliveries
router.get(
    "/my-deliveries",
    protect,
    getMyDeliveries
);

// Update delivery status
router.put(
    "/status/:id",
    protect,
    updateDeliveryStatus
);

module.exports = router;