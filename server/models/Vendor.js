const mongoose = require("mongoose");

const vendorSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        description: {
            type: String,
            default: ""
        },

        location: {
            type: String,
            required: true
        },

        phone: {
            type: String,
            required: true
        },

        category: {
            type: String,
            enum: [
                "canteen",
                "food_stall",
                "restaurant",
                "cafe",
                "snacks",
                "beverages"
            ],
            default: "food_stall"
        },

        isOpen: {
            type: Boolean,
            default: true
        },

        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Vendor", vendorSchema);