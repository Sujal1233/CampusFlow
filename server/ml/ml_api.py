from fastapi import FastAPI
import joblib

app = FastAPI()

# Load trained models
demand_model = joblib.load("models/demand_model.pkl")
eta_model = joblib.load("models/eta_model.pkl")


@app.get("/")
def home():
    return {
        "message": "CampusFlow ML API is running 🚀"
    }


# Demand prediction
@app.get("/predict-demand")
def predict_demand(hour: int, day_of_week: int):

    prediction = demand_model.predict([
        [hour, day_of_week]
    ])

    return {
        "hour": hour,
        "day_of_week": day_of_week,
        "predicted_orders": round(float(prediction[0]))
    }


# ETA prediction
@app.get("/predict-eta")
def predict_eta(
    distance_km: float,
    preparation_time: int,
    order_load: int,
    hour: int
):

    prediction = eta_model.predict([
        [
            distance_km,
            preparation_time,
            order_load,
            hour
        ]
    ])

    return {
        "distance_km": distance_km,
        "preparation_time": preparation_time,
        "order_load": order_load,
        "hour": hour,
        "predicted_delivery_time": round(float(prediction[0]))
    }