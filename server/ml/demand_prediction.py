import pandas as pd
from sklearn.ensemble import RandomForestRegressor
import joblib

# Load dataset
df = pd.read_csv("data/orders.csv")

# Features
X = df[["hour", "day_of_week"]]

# Target
y = df["orders"]

# Train model
model = RandomForestRegressor(
    n_estimators=100,
    random_state=42
)

model.fit(X, y)

# Save model
joblib.dump(model, "models/demand_model.pkl")

print("Demand prediction model trained successfully!")
print("Model saved to models/demand_model.pkl")

# Example prediction
prediction = model.predict([[13, 3]])

print(f"Predicted orders at 1 PM: {prediction[0]:.0f}")