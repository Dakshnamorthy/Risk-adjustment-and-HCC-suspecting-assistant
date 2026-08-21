from typing import Dict, Any, List


class RiskService:
    def __init__(self):
        pass

    def _extract_avg_risk(self, strong: List[Dict], weak: List[Dict]) -> float:
        scores = []

        for r in strong + weak:
            if r.get("risk_score") is not None:
                scores.append(float(r.get("risk_score")))

        if not scores:
            return 0.0

        return round(sum(scores) / len(scores), 2)

    def _compute_risk_level(self, avg_risk: float, strong_count: int, weak_count: int) -> str:
        if avg_risk >= 0.75 or strong_count > 2:
            return "HIGH"
        if avg_risk >= 0.4 or weak_count > 0:
            return "MEDIUM"
        return "LOW"

    def _build_risk_reasoning(self, level: str, avg_risk: float, strong_count: int, weak_count: int) -> str:
        if level == "HIGH":
            return f"High risk due to strong clinical evidence and elevated risk score ({avg_risk})."
        if level == "MEDIUM":
            return f"Moderate risk with limited or inconsistent evidence (score: {avg_risk})."
        return f"Low risk due to minimal or no supporting evidence (score: {avg_risk})."

    def _process_item(self, item: Dict[str, Any]) -> Dict[str, Any]:
        strong = item.get("strong_evidence", [])
        weak = item.get("weak_evidence", [])

        strong_count = len(strong)
        weak_count = len(weak)

        avg_risk = self._extract_avg_risk(strong, weak)
        level = self._compute_risk_level(avg_risk, strong_count, weak_count)
        reasoning = self._build_risk_reasoning(level, avg_risk, strong_count, weak_count)

        return {
            **item,
            "risk_level": level,
            "risk_score": avg_risk,
            "risk_reasoning": reasoning
        }

    def run(self, citation_output: Dict[str, Any]) -> Dict[str, Any]:
        results = []

        for item in citation_output.get("analysis", []):
            results.append(self._process_item(item))

        return {
            "patient_id": citation_output["patient_id"],
            "analysis": results
        }