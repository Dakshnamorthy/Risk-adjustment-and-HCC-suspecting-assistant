from typing import Dict, Any, List
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage
from app.config.settings import NVIDIA_API_KEY, NVIDIA_BASE_URL, NVIDIA_MODEL


class AnalysisService:
    def __init__(self):
        self.llm = ChatOpenAI(
            api_key=NVIDIA_API_KEY,
            base_url=NVIDIA_BASE_URL,
            model=NVIDIA_MODEL,
            temperature=0
        )

    def _compute_confidence(self, strong_count: int, weak_count: int, total: int) -> float:
        if total == 0:
            return 0.9
        score = (strong_count * 0.7 + weak_count * 0.3) / total
        return round(min(score, 0.99), 2)

    def _classify(self, strong_count: int, weak_count: int) -> str:
        if strong_count > 0:
            return "VALID"
        if weak_count > 0:
            return "SUSPECT"
        return "SUSPECT_UNSUPPORTED"

    def _format_records(self, records: List[Dict]) -> str:
        formatted = []
        for r in records:
            formatted.append(
                f"Year: {r.get('year')}, "
                f"Disease: {r.get('disease')}, "
                f"Encounters: {r.get('encounters')}, "
                f"Diagnosis Frequency: {r.get('diagnosis_frequency')}, "
                f"Risk Score: {r.get('risk_score')}, "
                f"Strength: {r.get('strength')}"
            )
        return "\n".join(formatted)

    def _llm_reasoning(self, hcc: str, strong: List[Dict], weak: List[Dict]) -> str:
        strong = strong[:3]
        weak = weak[:3]

        strong_text = self._format_records(strong)
        weak_text = self._format_records(weak)

        prompt = f"""
You are a medical coding auditor.

HCC Code: {hcc}

Strong Evidence:
{strong_text if strong_text else "None"}

Weak Evidence:
{weak_text if weak_text else "None"}

Classify this HCC as one of:
- VALID
- SUSPECT
- UNSUPPORTED

Provide a short clinical reasoning based on the evidence.
"""

        response = self.llm.invoke([HumanMessage(content=prompt)])
        return response.content

    def _analyze_hcc(self, hcc_data: Dict[str, Any]) -> Dict[str, Any]:
        strong = hcc_data.get("strong_evidence", [])
        weak = hcc_data.get("weak_evidence", [])
        total = hcc_data.get("total_records", 0)

        strong_count = len(strong)
        weak_count = len(weak)

        status = self._classify(strong_count, weak_count)
        confidence = self._compute_confidence(strong_count, weak_count, total)
        reasoning = self._llm_reasoning(hcc_data["hcc_code"], strong, weak)

        return {
            "hcc_code": hcc_data["hcc_code"],
            "status": status,
            "confidence_score": confidence,
            "reasoning": reasoning,
            "strong_evidence": strong,
            "weak_evidence": weak
        }

    def run(self, evidence_output: Dict[str, Any]) -> Dict[str, Any]:
        results = []

        for hcc_data in evidence_output.get("hcc_evidence", []):
            results.append(self._analyze_hcc(hcc_data))

        return {
            "patient_id": evidence_output["patient_id"],
            "analysis": results
        }