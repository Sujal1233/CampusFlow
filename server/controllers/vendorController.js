const Vendor = require("../models/Vendor");

// Create vendor
const createVendor = async (req, res) => {
    try {
        const { name, description, location, phone, category } = req.body;

        if (!name || !location || !phone) {
            return res.status(400).json({
                message: "Name, location and phone are required"
            });
        }

        const vendor = await Vendor.create({
            name,
            description,
            location,
            phone,
            category: category || "food_stall",
            owner: req.user.id
        });

        res.status(201).json({
            message: "Vendor created successfully",
            vendor
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to create vendor",
            error: error.message
        });
    }
};


// Get all vendors
const getVendors = async (req, res) => {
    try {
        const vendors = await Vendor.find()
            .populate("owner", "name email");

        res.status(200).json({
            count: vendors.length,
            vendors
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch vendors",
            error: error.message
        });
    }
};


// Get single vendor
const getVendor = async (req, res) => {
    try {
        const vendor = await Vendor.findById(req.params.id)
            .populate("owner", "name email");

        if (!vendor) {
            return res.status(404).json({
                message: "Vendor not found"
            });
        }

        res.status(200).json({
            vendor
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch vendor",
            error: error.message
        });
    }
};


module.exports = {
    createVendor,
    getVendors,
    getVendor
};