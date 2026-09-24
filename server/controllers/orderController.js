const Order = require("../models/Order");
const MenuItem = require("../models/MenuItem");

// Create order
const createOrder = async (req, res) => {
    try {
        const {
            vendor,
            items,
            deliveryBlock
        } = req.body;

        if (!vendor || !items || items.length === 0 || !deliveryBlock) {
            return res.status(400).json({
                message: "Vendor, items and delivery block are required"
            });
        }

        let totalAmount = 0;
        const orderItems = [];

        for (const item of items) {
            const menuItem = await MenuItem.findById(item.menuItem);

            if (!menuItem) {
                return res.status(404).json({
                    message: `Menu item not found: ${item.menuItem}`
                });
            }

            if (!menuItem.isAvailable) {
                return res.status(400).json({
                    message: `${menuItem.name} is currently unavailable`
                });
            }

            const quantity = item.quantity || 1;

            const itemTotal = menuItem.price * quantity;

            totalAmount += itemTotal;

            orderItems.push({
                menuItem: menuItem._id,
                name: menuItem.name,
                quantity,
                price: menuItem.price
            });
        }

        const order = await Order.create({
            student: req.user.id,
            vendor,
            items: orderItems,
            totalAmount,
            deliveryBlock
        });

        res.status(201).json({
            message: "Order placed successfully",
            order
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to create order",
            error: error.message
        });
    }
};


// Get student's orders
const getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({
            student: req.user.id
        })
            .populate("vendor", "name location")
            .populate("deliveryPartner", "name phone")
            .sort({ createdAt: -1 });

        res.status(200).json({
            count: orders.length,
            orders
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch orders",
            error: error.message
        });
    }
};


// Get single order
const getOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate("student", "name email phone")
            .populate("vendor", "name location")
            .populate("deliveryPartner", "name phone");

        if (!order) {
            return res.status(404).json({
                message: "Order not found"
            });
        }

        res.status(200).json({
            order
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch order",
            error: error.message
        });
    }
};


// Update order status
const updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;

        const allowedStatuses = [
            "placed",
            "confirmed",
            "preparing",
            "ready",
            "out_for_delivery",
            "delivered",
            "cancelled"
        ];

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                message: "Invalid order status"
            });
        }

        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                message: "Order not found"
            });
        }

        order.status = status;

        await order.save();

        res.status(200).json({
            message: "Order status updated successfully",
            order
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to update order status",
            error: error.message
        });
    }
};

const getVendorOrders = async (req, res) => {
    try {
        const Vendor = require("../models/Vendor");

        const vendor = await Vendor.findOne({
            owner: req.user.id
        });

        if (!vendor) {
            return res.status(404).json({
                message: "Vendor not found for this account"
            });
        }

        const orders = await Order.find({
            vendor: vendor._id
        })
            .populate("student", "name email phone block")
            .populate("deliveryPartner", "name phone")
            .populate("vendor", "name location")
            .sort({ createdAt: -1 });

        res.status(200).json({
            count: orders.length,
            orders
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch vendor orders",
            error: error.message
        });
    }
};

module.exports = {
    createOrder,
    getMyOrders,
    getOrder,
    updateOrderStatus,
    getVendorOrders
};