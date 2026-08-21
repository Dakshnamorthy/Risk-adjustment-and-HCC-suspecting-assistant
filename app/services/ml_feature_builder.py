def build_ml_features(patient):
    records = patient.records

    if not records:
        return [0] * 23

    years = [r.year for r in records]

    # ---------------------------
    # BASIC FEATURES
    # ---------------------------
    age = getattr(patient, "age", 0)
    sex = getattr(patient, "sex", "M")  # KEEP AS STRING

    years_observed = len(set(years))
    first_year = min(years)
    last_year = max(years)

    # ---------------------------
    # HCC RISK FEATURES
    # ---------------------------
    risks = [r.risk_score for r in records if r.risk_score is not None]

    avg_risk = sum(risks) / len(risks) if risks else 0
    max_risk = max(risks) if risks else 0
    latest_risk = patient.get_latest_record().risk_score if patient.get_latest_record() else 0

    # ---------------------------
    # MAPPING COUNTS
    # ---------------------------
    total_mapped = sum(1 for r in records if r.hcc_codes)
    total_no_hcc = sum(1 for r in records if not r.hcc_codes)
    total_failed = 0  # if you have mapping failure flag, plug here

    # ---------------------------
    # DIAGNOSIS
    # ---------------------------
    max_diag = max([r.diagnosis_frequency for r in records], default=0)
    total_diag_freq = sum([r.diagnosis_frequency for r in records])

    max_chronic = 0  # optional if not available
    max_hcc_categories = len(patient.get_all_hcc_codes())

    # ---------------------------
    # ENCOUNTERS
    # ---------------------------
    total_encounters = sum([r.encounters.total for r in records])
    total_claims = len(records)

    max_specialist = 0  # if not available

    ever_hospitalized = 0  # set if inpatient exists

    max_repeated = max([
        1 if r.diagnosis_patterns.seen_repeated_12m else 0
        for r in records
    ], default=0)

    max_recent = max([
        r.diagnosis_recency_days or 0
        for r in records
    ], default=0)

    best_recency = min([
        r.diagnosis_recency_days or 9999
        for r in records
    ], default=9999)

    # ---------------------------
    # CHANGE FEATURE
    # ---------------------------
    hcc_risk_change = max_risk - avg_risk if risks else 0

    # ---------------------------
    # FINAL VECTOR (ORDER MUST MATCH MODEL)
    # ---------------------------
    return [
        age,
        sex,
        years_observed,
        first_year,
        last_year,
        avg_risk,
        max_risk,
        latest_risk,
        total_mapped,
        total_no_hcc,
        total_failed,
        max_diag,
        max_chronic,
        max_hcc_categories,
        total_encounters,
        total_claims,
        total_diag_freq,
        max_specialist,
        ever_hospitalized,
        max_repeated,
        max_recent,
        best_recency,
        hcc_risk_change
    ]