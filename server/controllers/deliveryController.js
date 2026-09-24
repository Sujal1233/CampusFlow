const Order = require("../models/Order");

// Get orders available for delivery
const getAvailableOrders = async (req, res) => {
    try {
        if (req.user.role !== "delivery_partner") {
            return res.status(403).json({
                message: "Only delivery partners can access this"
            });
        }

        const orders = await Order.find({
            status: "placed",
            deliveryPartner: null
        })
            .populate("student", "name phone block")
            .populate("vendor", "name location")
            .sort({ createdAt: 1 });

        res.status(200).json({
            count: orders.length,
            orders
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch available orders",
            error: error.message
        });
    }
};


// Accept an order manually
const acceptOrder = async (req, res) => {
    try {
        if (req.user.role !== "delivery_partner") {
            return res.status(403).json({
                message: "Only delivery partners can accept orders"
            });
        }

        const order = await Order.findOneAndUpdate(
            {
                _id: req.params.id,
                status: "placed",
                deliveryPartner: null
            },
            {
                deliveryPartner: req.user.id,
                status: "confirmed"
            },
            { new: true }
        )
            .populate("student", "name phone block")
            .populate("vendor", "name location");

        if (!order) {
            return res.status(404).json({
                message: "Order is not available or already assigned"
            });
        }

        res.status(200).json({
            message: "Order accepted successfully",
            order
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to accept order",
            error: error.message
        });
    }
};


// Get my assigned deliveries
const getMyDeliveries = async (req, res) => {
    try {
        if (req.user.role !== "delivery_partner") {
            return res.status(403).json({
                message: "Only delivery partners can access this"
            });
        }

        const orders = await Order.find({
            deliveryPartner: req.user.id
        })
            .populate("student", "name phone block")
            .populate("vendor", "name location")
            .sort({ createdAt: -1 });

        res.status(200).json({
            count: orders.length,
            orders
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch my deliveries",
            error: error.message
        });
    }
};


// Update delivery status
const updateDeliveryStatus = async (req, res) => {
    try {
        if (req.user.role !== "delivery_partner") {
            return res.status(403).json({
                message: "Only delivery partners can update delivery status"
            });
        }

        const { status } = req.body;

        const allowedStatuses = [
            "confirmed",
            "preparing",
            "ready",
            "out_for_delivery",
            "delivered"
        ];

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                message: "Invalid delivery status"
            });
        }

        const order = await Order.findOne({
            _id: req.params.id,
            deliveryPartner: req.user.id
        });

        if (!order) {
            return res.status(404).json({
                message: "Delivery not found or not assigned to you"
            });
        }

        order.status = status;

        await order.save();

        res.status(200).json({
            message: "Delivery status updated successfully",
            order
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to update delivery status",
            error: error.message
        });
    }
};


// Find the best available delivery partner
const findBestDeliveryPartner = async (req, res) => {
    try {
        const User = require("../models/User");

        const partners = await User.find({
            role: "delivery_partner",
            isAvailable: true
        }).sort({
            activeDeliveries: 1
        });

        if (partners.length === 0) {
            return res.status(404).json({
                message: "No available delivery partners"
            });
        }

        const bestPartner = partners[0];

        res.status(200).json({
            message: "Best delivery partner found",
            partner: {
                id: bestPartner._id,
                name: bestPartner.name,
                block: bestPartner.block,
                activeDeliveries: bestPartner.activeDeliveries
            }
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to find delivery partner",
            error: error.message
        });
    }
};


// Automatically assign an order to the best available delivery partner
const autoAssignOrder = async (req, res) => {
    try {
        const User = require("../models/User");

        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                message: "Order not found"
            });
        }

        // Don't assign an already assigned order
        if (order.deliveryPartner) {
            return res.status(400).json({
                message: "Order is already assigned"
            });
        }

        // Find available delivery partners
        const partners = await User.find({
            role: "delivery_partner",
            isAvailable: true
        }).sort({
            activeDeliveries: 1
        });

        if (partners.length === 0) {
            return res.status(404).json({
                message: "No available delivery partners"
            });
        }

        // Select partner with lowest active workload
        const bestPartner = partners[0];

        // Assign order
        order.deliveryPartner = bestPartner._id;
        order.status = "confirmed";

        await order.save();

        // Increase active delivery count
        bestPartner.activeDeliveries += 1;

        await bestPartner.save();

        res.status(200).json({
            message: "Order automatically assigned successfully",
            order: {
                id: order._id,
                status: order.status,
                deliveryPartner: {
                    id: bestPartner._id,
                    name: bestPartner.name,
                    block: bestPartner.block,
                    activeDeliveries: bestPartner.activeDeliveries
                }
            }
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to automatically assign order",
            error: error.message
        });
    }
};


// Export controller functions
module.exports = {
    getAvailableOrders,
    acceptOrder,
    getMyDeliveries,
    updateDeliveryStatus,
    findBestDeliveryPartner,
    autoAssignOrder
};