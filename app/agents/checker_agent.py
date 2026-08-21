from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage
from app.config.settings import NVIDIA_API_KEY, NVIDIA_BASE_URL, NVIDIA_MODEL


class CheckerAgent:
    def __init__(self):
        self.llm = ChatOpenAI(
            api_key=NVIDIA_API_KEY,
            base_url=NVIDIA_BASE_URL,
            model=NVIDIA_MODEL,
            temperature=0
        )

    def _aggregate_features(self, records):
        features = {
            "repeated_12m": False,
            "seen_5_times": False,
            "max_frequency": 0,
            "total_encounters": 0,
            "seen_once": False
        }

        for r in records:
            if r.diagnosis_patterns.seen_repeated_12m:
                features["repeated_12m"] = True

            if r.diagnosis_patterns.seen_5_times:
                features["seen_5_times"] = True

            if r.diagnosis_frequency:
                features["max_frequency"] = max(
                    features["max_frequency"],
                    r.diagnosis_frequency
                )

            if r.encounters.total:
                features["total_encounters"] += r.encounters.total

            if r.diagnosis_patterns.seen_once:
                features["seen_once"] = True

        return features

    def _score_hcc(self, features):
        score = 0

        if features["repeated_12m"]:
            score += 4

        if features["seen_5_times"]:
            score += 3

        if features["max_frequency"] > 2:
            score += 3

        if features["seen_once"]:
            score += 1

        if features["total_encounters"] > 5:
            score += 1

        return score

    def _llm_validate(self, hcc, score, features):
        prompt = f"""
You are a clinical audit validator.

HCC: {hcc}
Score: {score}

Features:
{features}

Rules:
- Repeated OR frequency >= 3 → VALID
- Encounters >= 4 → VALID
- Only one occurrence with low frequency → UNSUPPORTED_HCC

Respond ONLY:
VALID or UNSUPPORTED_HCC
"""

        response = self.llm.invoke([HumanMessage(content=prompt)])
        return response.content.strip()

    def run(self, patient):
        all_hccs = patient.get_all_hcc_codes()

        if not all_hccs:
            return "NO_HCC_PRESENT"

        final_decisions = []

        for hcc in all_hccs:
            records = patient.get_records_by_hcc(hcc)

            features = self._aggregate_features(records)
            score = self._score_hcc(features)

            print("=== CHECKER DEBUG ===")
            print("[HCC]", hcc)
            print("[Features]", features)
            print("[Score]", score)

            if (
                features["repeated_12m"] or
                features["seen_5_times"] or
                features["max_frequency"] >= 3 or
                features["total_encounters"] >= 4
            ):
                base = "VALID"
            else:
                base = "UNSUPPORTED_HCC"

            final_decisions.append(base)

        if "VALID" in final_decisions:
            return "VALID"
        else:
            return "UNSUPPORTED_HCC"