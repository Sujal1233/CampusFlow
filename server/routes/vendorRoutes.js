const express = require("express");

const {
    createVendor,
    getVendors,
    getVendor
} = require("../controllers/vendorController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

// Create vendor
router.post("/", protect, createVendor);

// Get all vendors
router.get("/", protect, getVendors);

// Get single vendor
router.get("/:id", protect, getVendor);

module.exports = router;