import pandas as pd
from sklearn.ensemble import RandomForestRegressor
import joblib

# Load ETA dataset
df = pd.read_csv("data/eta_data.csv")

# Features
X = df[
    [
        "distance_km",
        "preparation_time",
        "order_load",
        "hour"
    ]
]

# Target
y = df["delivery_time"]

# Train model
model = RandomForestRegressor(
    n_estimators=100,
    random_state=42
)

model.fit(X, y)

# Save model
joblib.dump(model, "models/eta_model.pkl")

print("ETA prediction model trained successfully!")
print("Model saved to models/eta_model.pkl")

# Example prediction
prediction = model.predict([
    [2.5, 20, 6, 13]
])

print(f"Predicted delivery time: {prediction[0]:.0f} minutes")