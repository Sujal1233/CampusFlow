const express = require("express");

const {
    createMenuItem,
    getVendorMenu,
    updateMenuAvailability
} = require("../controllers/menuController");

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();

// Add food item
router.post("/", protect, createMenuItem);

// Get vendor menu
router.get("/vendor/:vendorId", protect, getVendorMenu);

// Update food availability
router.put(
    "/:id/availability",
    protect,
    authorize("vendor"),
    updateMenuAvailability
);

module.exports = router;