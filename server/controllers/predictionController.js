const axios = require("axios");

// Demand prediction
const predictDemand = async (req, res) => {
    try {
        const { hour, day_of_week } = req.query;

        if (hour === undefined || day_of_week === undefined) {
            return res.status(400).json({
                message: "hour and day_of_week are required"
            });
        }

        const response = await axios.get(
            "http://127.0.0.1:8000/predict-demand",
            {
                params: {
                    hour,
                    day_of_week
                }
            }
        );

        res.status(200).json({
            message: "Demand predicted successfully",
            prediction: response.data
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to get demand prediction",
            error: error.message
        });
    }
};


// ETA prediction
const predictETA = async (req, res) => {
    try {
        const {
            distance_km,
            preparation_time,
            order_load,
            hour
        } = req.query;

        if (
            distance_km === undefined ||
            preparation_time === undefined ||
            order_load === undefined ||
            hour === undefined
        ) {
            return res.status(400).json({
                message: "distance_km, preparation_time, order_load and hour are required"
            });
        }

        const response = await axios.get(
            "http://127.0.0.1:8000/predict-eta",
            {
                params: {
                    distance_km,
                    preparation_time,
                    order_load,
                    hour
                }
            }
        );

        res.status(200).json({
            message: "ETA predicted successfully",
            prediction: response.data
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to get ETA prediction",
            error: error.message
        });
    }
};


module.exports = {
    predictDemand,
    predictETA
};