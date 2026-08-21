import ast
import math


class DiagnosisPatterns:
    def __init__(self, row):
        self.seen_once = str(row.get("Diagnosis_Seen_Once", "")).lower() == "yes"
        self.seen_5_times = str(row.get("Diagnosis_Seen_5_Times", "")).lower() == "yes"
        self.seen_repeated_12m = str(
            row.get("Diagnosis_Seen_Repeatedly_Over_12_Months", "")
        ).lower() == "yes"


class Encounters:
    def __init__(self, row):
        self.total = int(row.get("Number_of_Encounters", 0) or 0)


class Record:
    def __init__(self, row):
        self.year = int(row.get("year", 0))
        self.icd10_code = row.get("primary_icd")
        self.primary_icd = row.get("primary_icd")
        self.icd10_codes = row.get("icd10_codes", [])
        self.mapping = row.get("mapping", {})
        self.disease_description = row.get("disease_description")
        self.diagnosis_recency_days = row.get("diagnosis_recency_days")
        self.diagnosis_frequency = row.get("diagnosis_frequency")
        # ✅ FIXED (USE JSON FIELD)
        raw_hcc = row.get("hcc_codes", [])

        # print("[DEBUG] Raw HCC:", raw_hcc)

        if isinstance(raw_hcc, list):
            self.hcc_codes = [str(x) for x in raw_hcc]
        else:
            self.hcc_codes = []

        print("[DEBUG] Parsed HCC:", self.hcc_codes)

        self.diagnosis_frequency = int(row.get("diagnosis_frequency", 0))
        self.risk_score = float(row.get("risk_score", 0))

        self.diagnosis_patterns = DiagnosisPatterns(row["diagnosis_patterns"])
        self.encounters = Encounters(row["encounters"])

class Patient:
    def __init__(self, patient_id, records):
        self.patient_id = patient_id
        self.records = [Record(r) for r in records]

    def get_latest_record(self):
        if not self.records:
            return None
        return sorted(self.records, key=lambda x: x.year)[-1]

    def get_records_by_hcc(self, hcc):
        hcc = str(hcc)
        result = []
        for r in self.records:
            if hcc in [str(code) for code in r.hcc_codes]:
                result.append(r)
        return result

    def has_hcc(self):
        for r in self.records:
            if r.hcc_codes:
                return True
        return False

    # ✅ NEW METHOD
    def get_all_hcc_codes(self):
        hcc_set = set()
        for r in self.records:
            for code in r.hcc_codes:
                hcc_set.add(str(code))
        return list(hcc_set)