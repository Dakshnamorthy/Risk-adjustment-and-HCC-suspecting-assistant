from typing import Dict, Any, List
from app.models.patient_model import Patient

class EvidenceService:
    def __init__(self):
        pass

    def _is_strong_evidence(self, record):
        if record.diagnosis_patterns.seen_repeated_12m:
            return True
        if record.diagnosis_patterns.seen_5_times:
            return True
        if record.encounters.total and record.encounters.total > 3:
            return True
        if record.diagnosis_frequency and record.diagnosis_frequency > 2:
            return True
        return False

    def _is_weak_evidence(self, record):
        if record.diagnosis_patterns.seen_once:
            return True
        if record.encounters.total and record.encounters.total <= 2:
            return True
        return False

    def _build_evidence_entry(self, record, strength: str) -> Dict[str, Any]:
        return {
            "year": record.year,
            "hcc_codes": record.hcc_codes,
            "disease": record.disease_description,
            "icd10_codes": record.icd10_codes,
            "risk_score": record.risk_score,
            "diagnosis_frequency": record.diagnosis_frequency,
            "encounters": record.encounters.total,
            "strength": strength
        }

    def _collect_for_hcc(self, patient: Patient, hcc_code: str) -> Dict[str, Any]:
        records = patient.get_records_by_hcc(hcc_code)

        strong: List[Dict[str, Any]] = []
        weak: List[Dict[str, Any]] = []

        for record in records:
            if self._is_strong_evidence(record):
                strong.append(self._build_evidence_entry(record, "strong"))
            elif self._is_weak_evidence(record):
                weak.append(self._build_evidence_entry(record, "weak"))

        return {
            "hcc_code": hcc_code,
            "strong_evidence": strong,
            "weak_evidence": weak,
            "total_records": len(records)
        }

    def run(self, patient: Patient) -> Dict[str, Any]:
        if not patient.has_hcc():
            return {"patient_id": patient.patient_id, "hcc_evidence": []}

        hcc_codes = patient.get_all_hcc_codes()

        result = []

        for hcc in hcc_codes:
            evidence = self._collect_for_hcc(patient, hcc)
            result.append(evidence)

        return {
            "patient_id": patient.patient_id,
            "hcc_evidence": result
        }