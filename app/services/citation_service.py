from typing import Dict, Any, List


class CitationService:
    def __init__(self):
        pass

    def _build_citation(self, record):
        disease = (
        record.get("disease")
        or record.get("disease_description")
        or "Unknown Disease"
    )

        encounters = record.get("encounters")
        if isinstance(encounters, dict):
            encounters = encounters.get("total", 0)

        return (
            f"Year {record.get('year')} | "
            f"{disease} | "
            f"Frequency: {record.get('diagnosis_frequency')} | "
            f"Risk: {record.get('risk_score')}"
        )

    def _extract_citations(self, strong, weak, status):
        if status == "VALID":
            source = strong
        elif status == "SUSPECT":
            source = weak if weak else strong
        else:
            source = weak or strong

        # ✅ keep only dict records
        source = [r for r in source if isinstance(r, dict)]

        citations = [self._build_citation(r) for r in source[:3]]

        return citations if citations else ["No valid evidence found"]


    def _attach_citations(self, analysis_item: Dict[str, Any]) -> Dict[str, Any]:
        strong = analysis_item.get("strong_evidence", [])
        weak = analysis_item.get("weak_evidence", [])
        status = analysis_item.get("status")

        citations = self._extract_citations(strong, weak, status)

        return {
            **analysis_item,
            "citations": citations
        }

    def run(self, analysis_output: Dict[str, Any]) -> Dict[str, Any]:
        updated_results = []

        for item in analysis_output.get("analysis", []):
            updated_results.append(self._attach_citations(item))

        return {
            "patient_id": analysis_output["patient_id"],
            "analysis": updated_results
        }