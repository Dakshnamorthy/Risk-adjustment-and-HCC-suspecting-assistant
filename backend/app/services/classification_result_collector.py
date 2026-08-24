"""Normalize and persist classification responses returned by the pipeline."""
import json
import logging
from typing import Any, Dict, Iterable, List

from sqlalchemy import text
from sqlalchemy.orm import Session

logger = logging.getLogger(__name__)


def normalize_response_items(payload: Any) -> List[Dict[str, Any]]:
    """Return one dictionary per patient from list, nested, or keyed responses."""
    if isinstance(payload, list):
        return [item for item in payload if isinstance(item, dict)]
    if not isinstance(payload, dict):
        return []

    for key in ("data", "results", "classifications", "predictions", "items"):
        value = payload.get(key)
        if isinstance(value, list):
            return [item for item in value if isinstance(item, dict)]
        if isinstance(value, dict):
            # A single result may itself be wrapped in data/results.
            if response_patient_id(value) or any(
                key_name in value for key_name in ("final", "output", "final_report", "valid", "no_hcc_present")
            ):
                return [value]
            keyed = normalize_response_items(value)
            if keyed:
                return keyed

    items = []
    for patient_id, value in payload.items():
        if patient_id in {"status", "message", "success", "error"}:
            continue
        if isinstance(value, dict):
            items.append({**value, "patient_id": str(patient_id)})
        elif isinstance(value, (str, bool, int, float)):
            items.append({"patient_id": str(patient_id), "result": value})
    return items


def response_patient_id(item: Dict[str, Any]) -> str | None:
    for field in ("patient_id", "Patient_ID", "member_id", "memberId", "patientId", "id"):
        if item.get(field) is not None:
            return str(item[field])
    for field in ("patient", "member", "patient_info", "member_info"):
        nested = item.get(field)
        if isinstance(nested, dict):
            patient_id = response_patient_id(nested)
            if patient_id:
                return patient_id
    return None


def _as_bool(value: Any) -> bool | None:
    if isinstance(value, bool):
        return value
    if isinstance(value, (int, float)) and value in (0, 1):
        return bool(value)
    if isinstance(value, str):
        value = value.strip().lower()
        if value in {"true", "1", "yes"}:
            return True
        if value in {"false", "0", "no"}:
            return False
    return None


def _final_objects(item: Dict[str, Any]) -> Iterable[Dict[str, Any]]:
    output = item.get("output") if isinstance(item.get("output"), dict) else item
    report = output.get("final_report") if isinstance(output.get("final_report"), dict) else output
    if isinstance(report, dict) and isinstance(report.get("final"), dict):
        yield report["final"]
    if isinstance(output, dict) and isinstance(output.get("final"), dict):
        yield output["final"]
    if isinstance(item.get("final"), dict):
        yield item["final"]
    if isinstance(report, dict):
        yield report


def classification_risk_score(item: Dict[str, Any]) -> float | None:
    """Extract the returned risk score used for destination routing."""
    for final in _final_objects(item):
        value = final.get("risk_score")
        if value is None:
            value = final.get("overall_risk_score")
        if value is not None:
            try:
                return float(value)
            except (TypeError, ValueError):
                pass

        risk_assessment = final.get("risk_assessment")
        if isinstance(risk_assessment, dict):
            risk_assessment = [risk_assessment]
        if isinstance(risk_assessment, list):
            scores = []
            for entry in risk_assessment:
                if not isinstance(entry, dict):
                    continue
                value = entry.get("risk_score")
                if value is None:
                    value = entry.get("Risk Score")
                if value is None:
                    value = entry.get("score")
                try:
                    if value is not None:
                        scores.append(float(value))
                except (TypeError, ValueError):
                    continue
            if scores:
                return scores[0]
    return None


def classification_destination(item: Dict[str, Any]) -> str:
    """Route scores above 1 to Agent and scores below 1 to ML."""
    risk_score = classification_risk_score(item)
    if risk_score is None:
        raise ValueError(f"Classification result has no usable risk score: {item}")
    if risk_score > 1:
        return "agent"
    if risk_score < 1:
        return "ml"
    raise ValueError(f"Risk score exactly 1 is not routable: {item}")


def persist_classification_results(db: Session, items: Iterable[Dict[str, Any]]) -> Dict[str, Any]:
    """Persist complete pipeline items and update member classification state."""
    counts = {"ml": 0, "agent": 0, "ml_patient_ids": [], "agent_patient_ids": []}
    for item in items:
        patient_id = response_patient_id(item)
        if not patient_id:
            logger.warning("Ignoring classification result without patient ID: %s", item)
            continue

        destination = classification_destination(item)
        report = next(iter(_final_objects(item)), item)
        risk_assessment = report.get("risk_assessment", []) if isinstance(report, dict) else []
        first_risk = risk_assessment[0] if isinstance(risk_assessment, list) and risk_assessment else {}
        risk_score = first_risk.get("risk_score") or first_risk.get("Risk Score") if isinstance(first_risk, dict) else None
        risk_level = first_risk.get("risk_level") or first_risk.get("Risk Level") if isinstance(first_risk, dict) else None
        try:
            risk_score = float(risk_score) if risk_score is not None else None
        except (TypeError, ValueError):
            risk_score = None

        if destination == "agent":
            db.execute(text("DELETE FROM ml_results WHERE patient_id = :patient_id"), {"patient_id": patient_id})
            db.execute(text("""
                INSERT INTO agent_results (patient_id, risk_score, risk_level, status, report_details)
                VALUES (:patient_id, :risk_score, :risk_level, 'FLAGGED', :report_details)
                ON CONFLICT (patient_id) DO UPDATE SET risk_score = EXCLUDED.risk_score,
                    risk_level = EXCLUDED.risk_level, status = EXCLUDED.status,
                    report_details = EXCLUDED.report_details, updated_at = clock_timestamp()
            """), {"patient_id": patient_id, "risk_score": risk_score, "risk_level": risk_level,
                    "report_details": json.dumps(item, default=str)})
            db.execute(text("""UPDATE members_2025 SET classification_status = 'FLAGGED'
                              WHERE patient_id = :patient_id AND is_current_upload = TRUE"""), {"patient_id": patient_id})
        else:
            db.execute(text("DELETE FROM agent_results WHERE patient_id = :patient_id"), {"patient_id": patient_id})
            db.execute(text("""
                INSERT INTO ml_results (patient_id, risk_score, risk_level, report_details, model_version)
                VALUES (:patient_id, :risk_score, :risk_level, :report_details, 'v1.0')
                ON CONFLICT (patient_id) DO UPDATE SET risk_score = EXCLUDED.risk_score,
                    risk_level = EXCLUDED.risk_level, report_details = EXCLUDED.report_details,
                    model_version = EXCLUDED.model_version, updated_at = clock_timestamp()
            """), {"patient_id": patient_id, "risk_score": risk_score, "risk_level": risk_level,
                    "report_details": json.dumps(item, default=str)})
            db.execute(text("""UPDATE members_2025 SET classification_status = 'UNFLAGGED'
                              WHERE patient_id = :patient_id AND is_current_upload = TRUE"""), {"patient_id": patient_id})
        counts[destination] += 1
        counts[f"{destination}_patient_ids"].append(patient_id)
    return counts
