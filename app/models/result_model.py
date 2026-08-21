from typing import List, Dict, Any


class Result:
    def __init__(
        self,
        patient_id: str,
        status: str,
        hcc_code: str = None,
        evidence: List[Dict[str, Any]] = None,
        reasoning: str = "",
        risk_level: str = "",
        confidence_score: float = 0.0,
        citations: List[str] = None
    ):
        self.patient_id = patient_id
        self.status = status
        self.hcc_code = hcc_code
        self.evidence = evidence or []
        self.reasoning = reasoning
        self.risk_level = risk_level
        self.confidence_score = confidence_score
        self.citations = citations or []

    def to_dict(self):
        return {
            "patient_id": self.patient_id,
            "status": self.status,
            "hcc_code": self.hcc_code,
            "evidence": self.evidence,
            "reasoning": self.reasoning,
            "risk_level": self.risk_level,
            "confidence_score": self.confidence_score,
            "citations": self.citations
        }