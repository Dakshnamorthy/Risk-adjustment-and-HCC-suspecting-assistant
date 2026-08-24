import joblib

# Load old model
model = joblib.load("/Users/vishal/Desktop/agentic_system/app/ML_model/risk_model.pkl")

# Save again using current environment
joblib.dump(model, "app/ML_model/risk_model_fixed.pkl")

print("✅ Model re-saved successfully!")