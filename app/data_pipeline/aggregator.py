import os
import json
import pandas as pd


class DataAggregator:
    def __init__(self, raw_data_path="data/raw", output_path="data/processed/patient_history.json"):
        self.raw_data_path = raw_data_path
        self.output_path = output_path

    def _load_files(self):
        files = sorted([f for f in os.listdir(self.raw_data_path) if f.endswith(".csv")])
        dfs = []

        for file in files:
            year = int(file.split(".")[0])
            df = pd.read_csv(os.path.join(self.raw_data_path, file))
            df["Year"] = year
            dfs.append(df)

        return pd.concat(dfs, ignore_index=True)

    def _parse_list(self, value):
        if pd.isna(value):
            return []
        return [v.strip() for v in str(value).split(",") if v.strip()]

    def _build_record(self, row):
        return {
            "year": int(row["Year"]),
            "age": row.get("Age"),
            "sex": row.get("Sex"),

            "hcc_codes": self._parse_list(row.get("Calculated_HCC_Codes")),
            "hcc_count": row.get("HCC_Category_Count"),
            "risk_score": row.get("Calculated_Risk_Score"),

            "icd10_codes": self._parse_list(row.get("ICD10_Code_List")),
            "primary_icd": row.get("ICD10_Code"),

            "disease_description": row.get("Disease_Description"),
            "diagnosis_frequency": row.get("Diagnosis_Frequency"),
            "diagnosis_recency_days": row.get("Diagnosis_Recency_Days"),

            "encounters": {
                "total": row.get("Number_of_Encounters"),
                "recent": row.get("Recent_Encounter_Count"),
                "specialist": row.get("Specialist_Encounter_Count"),
                "type": row.get("Encounter_Type")
            },

            "claims": {
                "count": row.get("Claim_Count"),
                "frequency": row.get("Claim_Frequency"),
                "type": row.get("Claim_Type")
            },

            "providers": {
                "count": row.get("Provider_Count"),
                "id": row.get("Provider_ID")
            },

            "chronic_condition_count": row.get("Chronic_Condition_Count"),
            "hospitalization_history": row.get("Hospitalization_History"),

            "diagnosis_patterns": {
                "repeated_count": row.get("Repeated_Diagnosis_Count"),
                "seen_once": row.get("Diagnosis_Seen_Once"),
                "seen_5_times": row.get("Diagnosis_Seen_5_Times"),
                "seen_repeated_12m": row.get("Diagnosis_Seen_Repeatedly_Over_12_Months"),
                "encounters_with_diag": row.get("Number_of_Encounters_Associated_With_Diagnosis")
            },

            "mapping": {
                "status": row.get("HCC_Mapping_Status"),
                "reason": row.get("HCC_Mapping_Reason")
            }
        }

    def _group_by_patient(self, df):
        patient_history = {}

        for _, row in df.iterrows():
            pid = str(row["Patient_ID"])

            record = self._build_record(row)

            if pid not in patient_history:
                patient_history[pid] = []

            patient_history[pid].append(record)

        for pid in patient_history:
            patient_history[pid] = sorted(patient_history[pid], key=lambda x: x["year"])

        return patient_history

    def run(self):
        df = self._load_files()
        patient_history = self._group_by_patient(df)

        os.makedirs(os.path.dirname(self.output_path), exist_ok=True)

        with open(self.output_path, "w") as f:
            json.dump(patient_history, f, indent=2)

        return patient_history


if __name__ == "__main__":
    aggregator = DataAggregator()
    result = aggregator.run()
    print(f"Processed {len(result)} patients")