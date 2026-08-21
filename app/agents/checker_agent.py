class CheckerAgent:

    # -------------------------------
    # GET LATEST RECORD
    # -------------------------------
    def _get_latest_record(self, patient):
        records = patient.records  # assuming list

        if not records:
            return None

        # Sort by year (latest first)
        records = sorted(records, key=lambda r: r.year, reverse=True)
        return records[0]

    # -------------------------------
    # CHECK STRONG DOCUMENT
    # -------------------------------
    def _has_strong_docs(self, record):
        encounters = getattr(record.encounters, "total", 0)
        frequency = getattr(record, "diagnosis_frequency", 0)

        # Strong evidence condition
        return encounters >= 1 or frequency >= 2

    # -------------------------------
    # MAIN RUN
    # -------------------------------
    def run(self, patient):

        latest = self._get_latest_record(patient)

        if not latest:
            print("[CHECKER] No records → Flow B")
            return {
                "route": "NO_HCC_PRESENT",
                "hcc_summary": []
            }

        # Extract HCC from ONLY latest record
        hcc_codes = latest.hcc_codes if hasattr(latest, "hcc_codes") else []

        print("\n=== CHECKER DEBUG ===")
        print("[LATEST YEAR]", latest.year)
        print("[HCCs]", hcc_codes)

        # -------------------------------
        # CASE 1: NO HCC
        # -------------------------------
        if not hcc_codes:
            print("[FINAL] → NO_HCC_PRESENT (Flow B)")
            return {
                "route": "NO_HCC_PRESENT",
                "hcc_summary": []
            }

        # -------------------------------
        # CASE 2: HCC EXISTS → CHECK DOCS
        # -------------------------------
        strong = self._has_strong_docs(latest)

        print("[Strong Docs]", strong)

        if strong:
            print("[FINAL] → VALID (ML FLOW)")
            return {
                "route": "VALID",
                "hcc_summary": hcc_codes
            }

        else:
            print("[FINAL] → UNSUPPORTED_HCC (Flow A)")
            return {
                "route": "UNSUPPORTED_HCC",
                "hcc_summary": hcc_codes
            }