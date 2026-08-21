from typing import TypedDict, Any, Dict

class GraphState(TypedDict,total=False):
    patient_id: str
    patient: Any
    route: str

    evidence_output: Dict
    analysis_output: Dict
    citation_output: Dict
    risk_output: Dict
    final_output: Dict