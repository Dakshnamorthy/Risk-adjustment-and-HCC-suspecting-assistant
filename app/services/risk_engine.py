from typing import Dict, Any, List


class RiskEngine:
    def __init__(self):
        pass

    # -----------------------------
    # SCORE CALCULATION
    # -----------------------------
    def compute_risk_score(self, record) -> float:
        score = 0.0

        # 1. Base ML risk score (already in your data)
        score += record.risk_score * 0.4

        # 2. Diagnosis frequency
        if record.diagnosis_frequency:
            score += min(record.diagnosis_frequency / 10, 1.0) * 0.2

        # 3. Encounters (FIXED)
        total_encounters = record.encounters.total if record.encounters else 0
        score += min(total_encounters / 10, 1.0) * 0.15

        # 4. Recency (SAFE)
        if record.diagnosis_recency_days is not None:
            if record.diagnosis_recency_days < 30:
                score += 0.15
            elif record.diagnosis_recency_days < 90:
                score += 0.1
            else:
                score += 0.05

        # 5. Pattern signals
        patterns = record.diagnosis_patterns

        if patterns.seen_5_times:
            score += 0.15
        elif patterns.seen_repeated_12m:
            score += 0.1
        elif patterns.seen_once:
            score += 0.05

        return round(min(score, 1.0), 2)

    # -----------------------------
    # CATEGORY
    # -----------------------------
    def categorize_risk(self, score: float) -> str:
        if score >= 0.75:
            return "HIGH"
        elif score >= 0.4:
            return "MEDIUM"
        else:
            return "LOW"

    # -----------------------------
    # BUILD OUTPUT FOR EACH RECORD
    # -----------------------------
    def build_record_output(self, record) -> Dict[str, Any]:
        score = self.compute_risk_score(record)
        level = self.categorize_risk(score)

        return {
            "disease": record.disease_description,
            "icd10": record.primary_icd,
            "status": "NO_HCC_PRESENT",
            "risk_level": level,
            "risk_score": score,
            "reasoning": "Risk computed using hybrid model (ML + frequency + encounters + recency + patterns)",
            "citations": [
                f"{record.year} | {record.disease_description} | ICD: {record.primary_icd}"
            ]
        }

    # -----------------------------
    # MAIN RUN
    # -----------------------------
    def run(self, patient) -> Dict[str, Any]:
        results = []

        for record in patient.records:
            results.append(self.build_record_output(record))

        return {
            "patient_id": patient.patient_id,
            "analysis": results
        }