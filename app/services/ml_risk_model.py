import joblib
import numpy as np
import pandas as pd

class MLRiskModel:
    def __init__(self, model_path):
        data = joblib.load(model_path)

        # 🔥 HANDLE BOTH CASES
        if isinstance(data, dict):
            self.model = data.get("model")
            self.scaler = data.get("scaler")
        else:
            self.model = data
            self.scaler = None


    def predict(self, features):
        columns = [
            'Age', 'Sex', 'Years_Observed', 'First_Year', 'Last_Year',
            'Average_HCC_Risk', 'Maximum_HCC_Risk', 'Latest_HCC_Risk',
            'Total_Mapped_HCCs', 'Total_No_HCC_Mappings', 'Total_Failed_Mappings',
            'Maximum_Diagnoses', 'Maximum_Chronic_Conditions', 'Maximum_HCC_Categories',
            'Total_Encounters', 'Total_Claims', 'Total_Diagnosis_Frequency',
            'Maximum_Specialist_Encounters', 'Ever_Hospitalized',
            'Maximum_Repeated_Diagnosis', 'Maximum_Recent_Encounters',
            'Best_Recency_Days', 'HCC_Risk_Change'
        ]

        X = pd.DataFrame([features], columns=columns)

        # 🔥 IMPORTANT FIX: enforce correct dtype
        X["Sex"] = X["Sex"].astype(str)

        score = float(self.model.predict(X)[0])

        if score >= 0.7:
            level = "HIGH"
        elif score >= 0.4:
            level = "MEDIUM"
        else:
            level = "LOW"

        return score, level