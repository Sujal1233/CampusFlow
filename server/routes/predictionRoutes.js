const express = require("express");

const {
    predictDemand,
    predictETA
} = require("../controllers/predictionController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/demand", protect, predictDemand);

router.get("/eta", protect, predictETA);

module.exports = router;