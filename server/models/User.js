const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },

        password: {
            type: String,
            required: true,
            minlength: 6
        },

        phone: {
            type: String,
            required: true
        },

        role: {
            type: String,
            enum: ["student", "delivery_partner", "vendor", "admin"],
            default: "student"
        },

        block: {
            type: String,
            default: ""
        },

        // Delivery partner availability
        isAvailable: {
            type: Boolean,
            default: true
        },

        // Number of currently active deliveries
        activeDeliveries: {
            type: Number,
            default: 0
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("User", userSchema);