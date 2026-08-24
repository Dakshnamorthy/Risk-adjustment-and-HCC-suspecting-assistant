import os
import json
import httpx
from pathlib import Path
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import text
from dotenv import load_dotenv

# Load .env so NGROK_PIPELINE_URL is available regardless of import order
_ENV_FILE = Path(__file__).resolve().parents[2] / ".env"
load_dotenv(_ENV_FILE)


class MLAgentService:
    def __init__(self, db: Session):
        self.db = db
        self.ngrok_url = os.getenv("NGROK_PIPELINE_URL")

    def get_flagged_members(self, page: int = 1, limit: int = 10) -> Dict[str, Any]:
        """Get flagged members available for Agent Analysis with stored results"""
        offset = (page - 1) * limit
        
        # Query with LEFT JOIN to include risk scores from agent_results
        query = text("""
            SELECT 
                m.patient_id, m.age, m.sex, m.icd10_code, m.hcc_code,
                m.review_status,
                ar.risk_score, ar.risk_level, ar.status, ar.report_details
                        FROM agent_results ar
                        JOIN members_2025 m ON m.patient_id = ar.patient_id
                        ORDER BY COALESCE(ar.updated_at, ar.created_at) DESC, ar.patient_id DESC
            LIMIT :limit OFFSET :offset
        """)
        
        count_query = text("""
            SELECT COUNT(*) as total 
                        FROM agent_results
        """)
        
        # Get total count
        total_result = self.db.execute(count_query).fetchone()
        total = total_result.total if total_result else 0
        
        # Get paginated results
        results = self.db.execute(query, {"limit": limit, "offset": offset}).fetchall()
        
        members = []
        for row in results:
            report = None
            if row.report_details:
                try:
                    import json
                    report = json.loads(row.report_details) if isinstance(row.report_details, str) else row.report_details
                except (Exception) as e:
                    import logging
                    logging.getLogger(__name__).error(f"Malformed report data for patient {row.patient_id}: {e}")
                    report = {"error": "Malformed report data"}

            members.append({
                "patient_id": row.patient_id,
                "age": row.age,
                "sex": row.sex,
                "icd10_code": row.icd10_code,
                "hcc_code": row.hcc_code,
                "review_status": row.review_status,
                "risk_score": round(row.risk_score, 2) if row.risk_score else None,
                "risk_level": row.risk_level,
                "status": row.status,
                "report_details": report
            })
        
        return {
            "members": members,
            "total": total
        }

    def get_unflagged_members(self, page: int = 1, limit: int = 10) -> Dict[str, Any]:
        """Get unflagged members available for ML Prediction with stored results"""
        offset = (page - 1) * limit
        
        # Query with LEFT JOIN to include risk scores and report_details from ml_results
        query = text("""
            SELECT 
                m.patient_id, m.age, m.sex, m.icd10_code, m.hcc_code,
                m.review_status,
                m.number_of_encounters, m.number_of_diagnoses, m.chronic_condition_count,
                ml.risk_score, ml.risk_level, ml.model_version, ml.report_details
                        FROM ml_results ml
                        JOIN members_2025 m ON m.patient_id = ml.patient_id
                        ORDER BY COALESCE(ml.updated_at, ml.created_at) DESC, ml.patient_id DESC
            LIMIT :limit OFFSET :offset
        """)
        
        count_query = text("""
            SELECT COUNT(*) as total 
                        FROM ml_results
        """)
        
        # Get total count
        total_result = self.db.execute(count_query).fetchone()
        total = total_result.total if total_result else 0
        
        # Get paginated results
        results = self.db.execute(query, {"limit": limit, "offset": offset}).fetchall()
        
        members = []
        for row in results:
            risk_score = round(row.risk_score, 2) if row.risk_score is not None else None
            risk_level = row.risk_level
            report_details = None
            if row.report_details:
                try:
                    import json
                    report_details = json.loads(row.report_details) if isinstance(row.report_details, str) else row.report_details
                except (Exception) as e:
                    import logging
                    logging.getLogger(__name__).error(f"Malformed ML report data for patient {row.patient_id}: {e}")
                    report_details = {"error": "Malformed ML report data"}

            members.append({
                "patient_id": row.patient_id,
                "age": row.age,
                "sex": row.sex,
                "icd10_code": row.icd10_code,
                "hcc_code": row.hcc_code,
                "review_status": row.review_status,
                "risk_score": risk_score,
                "risk_level": risk_level,
                "model_version": row.model_version or "v1.0",
                "report_details": report_details
            })
        
        return {
            "members": members,
            "total": total
        }

