const MenuItem = require("../models/MenuItem");
const Vendor = require("../models/Vendor");

// Add menu item
const createMenuItem = async (req, res) => {
    try {
        const {
            vendor,
            name,
            description,
            price,
            category,
            image
        } = req.body;

        if (!vendor || !name || price === undefined) {
            return res.status(400).json({
                message: "Vendor, name and price are required"
            });
        }

        const vendorExists = await Vendor.findById(vendor);

        if (!vendorExists) {
            return res.status(404).json({
                message: "Vendor not found"
            });
        }

        const menuItem = await MenuItem.create({
            vendor,
            name,
            description,
            price,
            category,
            image
        });

        res.status(201).json({
            message: "Menu item created successfully",
            menuItem
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to create menu item",
            error: error.message
        });
    }
};


// Get menu items of a vendor
const getVendorMenu = async (req, res) => {
    try {
        const menuItems = await MenuItem.find({
            vendor: req.params.vendorId
        });

        res.status(200).json({
            count: menuItems.length,
            menuItems
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch menu",
            error: error.message
        });
    }
};

// Update menu item availability
const updateMenuAvailability = async (req, res) => {
    try {
        const { isAvailable } = req.body;

        if (typeof isAvailable !== "boolean") {
            return res.status(400).json({
                message: "isAvailable must be true or false"
            });
        }

        const menuItem = await MenuItem.findById(req.params.id);

        if (!menuItem) {
            return res.status(404).json({
                message: "Menu item not found"
            });
        }

        // Find the vendor that owns this menu item
        const vendor = await Vendor.findById(menuItem.vendor);

        if (!vendor) {
            return res.status(404).json({
                message: "Vendor not found"
            });
        }

        // Only the vendor owner can modify the menu
        if (vendor.owner.toString() !== req.user.id) {
            return res.status(403).json({
                message: "You can only manage your own menu"
            });
        }

        menuItem.isAvailable = isAvailable;

        await menuItem.save();

        res.status(200).json({
            message: "Menu availability updated successfully",
            menuItem
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to update menu availability",
            error: error.message
        });
    }
};

module.exports = {
    createMenuItem,
    getVendorMenu,
    updateMenuAvailability
};