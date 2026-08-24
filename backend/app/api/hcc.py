import io
import os
import logging
import json
import httpx
import pandas as pd
from typing import Dict, Any, List
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import text

from app.database.connection import get_db
from app.services.hcc_service import hcc_service
from app.services.classification_result_collector import (
    normalize_response_items,
    persist_classification_results,
)
from app.database.init_db import init_members_2025_table

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/hcc-mapping",
    tags=["HCC Mapping"]
)

hcc_map_router = APIRouter(
    prefix="/hcc-map",
    tags=["HCC Mapping"]
)

REQUIRED_COLUMNS = [
    "Patient_ID", "Age", "Sex", "Year", "Number_of_Encounters",
    "Number_of_Diagnoses", "Chronic_Condition_Count", "Unique_ICD10_Count",
    "Repeated_Diagnosis_Count", "Recent_Encounter_Count", "Specialist_Encounter_Count",
    "Hospitalization_History", "Encounter_Type", "Claim_Frequency",
    "Disease_Description", "Diagnosis_Frequency", "Diagnosis_Recency_Days",
    "Provider_Count", "Claim_Count", "ICD10_Code",
    "Diagnosis_Seen_Repeatedly_Over_12_Months", "Claim_Type", "Provider_ID",
    "Number_of_Encounters_Associated_With_Diagnosis", "Diagnosis_Seen_Once",
    "Diagnosis_Seen_5_Times"
]

async def _send_classified_members(db: Session, destination: str) -> Dict[str, Any]:
    """Send classified current-upload records and persist only successful results."""
    is_agent = destination == "agent"
    classification_status = "FLAGGED" if is_agent else "UNFLAGGED"
    result_table = "agent_results" if is_agent else "ml_results"
    availability_column = "available_for_agent" if is_agent else "available_for_ml"

    try:
        rows = db.execute(text(f"""
            SELECT m.*
            FROM members_2025 m
            WHERE m.is_current_upload = TRUE
              AND m.classification_status = :classification_status
              AND NOT EXISTS (
                                    SELECT 1 FROM {result_table} r
                                    WHERE r.patient_id = m.patient_id
                                        AND {"r.status <> 'CLASSIFIED'" if is_agent else "r.model_version <> 'classification'"}
              )
            ORDER BY m.patient_id
        """), {"classification_status": classification_status}).fetchall()

        sent_count = len(rows)
        if not rows:
            return {
                f"sent_to_{destination}": 0,
                "successful": 0,
                "failed": 0,
                "message": f"No new classified members to send to {destination}"
            }

        records = []
        patient_ids = []
        for row in rows:
            record = dict(row._mapping)
            patient_id = str(record["patient_id"])
            patient_ids.append(patient_id)
            for key, value in record.items():
                if hasattr(value, "isoformat"):
                    record[key] = value.isoformat()
            records.append(record)

        pipeline_url = os.getenv("NGROK_PIPELINE_URL", "").strip()
        if not pipeline_url:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                                detail="NGROK_PIPELINE_URL is not configured")

        payload = {
            "patient_ids": patient_ids,
            "records": records,
            "destination": destination
        }
        logger.info("Sending %d classified members to %s workflow", sent_count, destination)
        async with httpx.AsyncClient(timeout=120.0) as client:
            response = await client.post(
                pipeline_url,
                json=payload,
                headers={"Content-Type": "application/json", "ngrok-skip-browser-warning": "true"}
            )
        response.raise_for_status()
        raw_response = response.json()

        if isinstance(raw_response, dict) and str(raw_response.get("status", "")).lower() == "error":
            raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY,
                                detail=f"{destination.title()} pipeline failed: {raw_response.get('message', 'unknown error')}")

        response_items = raw_response if isinstance(raw_response, list) else (
            raw_response.get("data") or raw_response.get("results") or raw_response.get("predictions")
            if isinstance(raw_response, dict) else []
        )
        if isinstance(raw_response, dict) and not response_items:
            response_items = [
                {**value, "patient_id": key} if isinstance(value, dict)
                else {"patient_id": key, "result": value}
                for key, value in raw_response.items()
                if key in patient_ids
            ]
        if not isinstance(response_items, list):
            response_items = []

        def item_patient_id(item: Dict[str, Any]) -> str | None:
            for key in ("patient_id", "Patient_ID", "member_id", "memberId", "patientId", "id"):
                if item.get(key) is not None:
                    return str(item[key])
            return None

        returned_by_id = {
            item_patient_id(item): item
            for item in response_items
            if isinstance(item, dict) and item_patient_id(item) in patient_ids
        }
        successful_ids = set(returned_by_id)
        failed_count = sent_count - len(successful_ids)
        if not successful_ids:
            raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY,
                                detail=f"{destination.title()} pipeline returned no usable member results")

        for patient_id, item in returned_by_id.items():
            output = item.get("output") if isinstance(item.get("output"), dict) else item
            report = output.get("final_report") if isinstance(output, dict) else item
            if not isinstance(report, dict):
                report = item
            risk_assessment = report.get("risk_assessment", [])
            first_risk = risk_assessment[0] if isinstance(risk_assessment, list) and risk_assessment else {}
            risk_score = first_risk.get("risk_score") or first_risk.get("Risk Score") if isinstance(first_risk, dict) else None
            risk_level = first_risk.get("risk_level") or first_risk.get("Risk Level") if isinstance(first_risk, dict) else None
            try:
                risk_score = float(risk_score) if risk_score is not None else None
            except (TypeError, ValueError):
                risk_score = None
            report_json = json.dumps(item, default=str)
            if is_agent:
                db.execute(text("""
                    INSERT INTO agent_results (patient_id, risk_score, risk_level, status, report_details)
                    VALUES (:patient_id, :risk_score, :risk_level, 'SUCCESS', :report_details)
                    ON CONFLICT (patient_id) DO UPDATE SET
                        risk_score = EXCLUDED.risk_score, risk_level = EXCLUDED.risk_level,
                        status = EXCLUDED.status, report_details = EXCLUDED.report_details,
                        updated_at = CURRENT_TIMESTAMP
                """), {"patient_id": patient_id, "risk_score": risk_score,
                        "risk_level": risk_level, "report_details": report_json})
            else:
                db.execute(text("""
                    INSERT INTO ml_results (patient_id, risk_score, risk_level, report_details, model_version)
                    VALUES (:patient_id, :risk_score, :risk_level, :report_details, 'v1.0')
                    ON CONFLICT (patient_id) DO UPDATE SET
                        risk_score = EXCLUDED.risk_score, risk_level = EXCLUDED.risk_level,
                        report_details = EXCLUDED.report_details, model_version = EXCLUDED.model_version,
                        updated_at = CURRENT_TIMESTAMP
                """), {"patient_id": patient_id, "risk_score": risk_score,
                        "risk_level": risk_level, "report_details": report_json})
            db.execute(text(f"""
                UPDATE members_2025 SET {availability_column} = TRUE
                WHERE patient_id = :patient_id AND is_current_upload = TRUE
            """), {"patient_id": patient_id})

        db.commit()
        return {
            f"sent_to_{destination}": sent_count,
            "successful": len(successful_ids),
            "failed": failed_count,
            "message": f"{destination.title()} processing completed"
        }
    except HTTPException:
        db.rollback()
        raise
    except (httpx.TimeoutException, httpx.ConnectError) as exc:
        db.rollback()
        logger.error("%s pipeline request failed: %s", destination.title(), exc)
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY,
                            detail=f"{destination.title()} pipeline request failed: {exc}")
    except httpx.HTTPStatusError as exc:
        db.rollback()
        logger.error("%s pipeline returned HTTP %s", destination.title(), exc.response.status_code)
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY,
                            detail=f"{destination.title()} pipeline returned status {exc.response.status_code}")
    except Exception as exc:
        db.rollback()
        logger.error("%s persistence failed: %s", destination.title(), exc)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                            detail=f"{destination.title()} processing failed: {exc}")


@router.post(
    "/upload",
    summary="Upload CSV file and map ICD-10 codes to HCC",
    description="Uploads a 2025 clinical CSV file, maps ICD-10 codes to HCC using hccinfhir, stores the records in members_2025, and returns the mapped results.",
    tags=["HCC Mapping"]
)
@hcc_map_router.post(
    "/upload",
    summary="Upload CSV file and map ICD-10 codes to HCC",
    description="Uploads a 2025 clinical CSV file, maps ICD-10 codes to HCC using hccinfhir, stores the records in members_2025, and returns the mapped results.",
    tags=["HCC Mapping"]
)
@router.post("/upload-csv", include_in_schema=False)
@hcc_map_router.post("/upload-csv", include_in_schema=False)
async def upload_hcc_mapping(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    # 1. Check file extension
    if not file.filename or not file.filename.lower().endswith('.csv'):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file type. Only CSV files are accepted."
        )

    # 2. Read file content & check if empty
    contents = await file.read()
    if not contents or len(contents.strip()) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded CSV file is empty."
        )

    # 3. Parse CSV with pandas
    try:
        df = pd.read_csv(io.BytesIO(contents))
    except Exception as e:
        logger.error(f"Failed to parse CSV: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to parse CSV file: {str(e)}"
        )

    if df.empty:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded CSV file contains no data rows."
        )

    # 4. Case-insensitive column validation
    col_map = {str(c).strip().lower(): c for c in df.columns}

    # Check specifically for ICD10_Code
    if "icd10_code" not in col_map:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded CSV is missing the required 'ICD10_Code' column."
        )

    # Check for all required columns
    missing = [req for req in REQUIRED_COLUMNS if req.strip().lower() not in col_map]
    if missing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Missing required CSV columns: {', '.join(missing)}"
        )

    # 5. Ensure members_2025 table exists
    try:
        init_members_2025_table()
    except Exception as e:
        logger.error(f"Database error initializing members_2025: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database setup failure: {str(e)}"
        )

    total_records = len(df)
    mapped_count = 0
    unmapped_count = 0

    records_to_insert = []
    response_records = []

    # 6. Process rows and map ICD10 -> HCC via hccinfhir
    for idx, row in df.iterrows():
        raw_patient_id = row[col_map["patient_id"]]
        patient_id = str(raw_patient_id).strip() if pd.notna(raw_patient_id) else f"PT{idx+1:06d}"

        raw_age = row[col_map["age"]]
        try:
            age = int(float(raw_age)) if pd.notna(raw_age) else 65
        except (ValueError, TypeError):
            age = 65

        raw_sex = row[col_map["sex"]]
        sex = str(raw_sex).strip().upper() if pd.notna(raw_sex) else "M"
        if sex not in ["M", "F"]:
            sex = "F" if sex.startswith("F") else "M"

        raw_year = row[col_map["year"]]
        try:
            year = int(float(raw_year)) if pd.notna(raw_year) else 2025
        except (ValueError, TypeError):
            year = 2025

        raw_icd10 = row[col_map["icd10_code"]]
        icd10_code = str(raw_icd10).strip() if pd.notna(raw_icd10) else ""

        # Map using hcc_service / hccinfhir
        try:
            mapping_res = hcc_service.map_icd10_to_hcc(icd10_code, age=age, sex=sex)
            hcc_code = mapping_res.get("hcc_code")
            mapping_status = mapping_res.get("hcc_mapping_status", "UNMAPPED")
        except Exception as e:
            logger.warning(f"Error mapping ICD10 '{icd10_code}' for patient {patient_id}: {e}")
            hcc_code = None
            mapping_status = "UNMAPPED"

        if mapping_status == "MAPPED":
            mapped_count += 1
        else:
            unmapped_count += 1

        def safe_int(val, default=0):
            if pd.isna(val):
                return default
            try:
                return int(float(val))
            except:
                return default

        def safe_str(val, default=""):
            if pd.isna(val):
                return default
            return str(val).strip()

        record = {
            "patient_id": patient_id,
            "age": age,
            "sex": sex,
            "year": year,
            "number_of_encounters": safe_int(row[col_map["number_of_encounters"]]),
            "number_of_diagnoses": safe_int(row[col_map["number_of_diagnoses"]]),
            "chronic_condition_count": safe_int(row[col_map["chronic_condition_count"]]),
            "unique_icd10_count": safe_int(row[col_map["unique_icd10_count"]]),
            "repeated_diagnosis_count": safe_int(row[col_map["repeated_diagnosis_count"]]),
            "recent_encounter_count": safe_int(row[col_map["recent_encounter_count"]]),
            "specialist_encounter_count": safe_int(row[col_map["specialist_encounter_count"]]),
            "hospitalization_history": safe_str(row[col_map["hospitalization_history"]], "No"),
            "encounter_type": safe_str(row[col_map["encounter_type"]], "Outpatient"),
            "claim_frequency": safe_int(row[col_map["claim_frequency"]]),
            "disease_description": safe_str(row[col_map["disease_description"]]),
            "diagnosis_frequency": safe_int(row[col_map["diagnosis_frequency"]]),
            "diagnosis_recency_days": safe_int(row[col_map["diagnosis_recency_days"]]),
            "provider_count": safe_int(row[col_map["provider_count"]]),
            "claim_count": safe_int(row[col_map["claim_count"]]),
            "icd10_code": icd10_code,
            "diagnosis_seen_repeatedly_over_12_months": safe_str(row[col_map["diagnosis_seen_repeatedly_over_12_months"]], "No"),
            "claim_type": safe_str(row[col_map["claim_type"]], "Professional"),
            "provider_id": safe_str(row[col_map["provider_id"]]),
            "number_of_encounters_associated_with_diagnosis": safe_int(row[col_map["number_of_encounters_associated_with_diagnosis"]]),
            "diagnosis_seen_once": safe_str(row[col_map["diagnosis_seen_once"]], "No"),
            "diagnosis_seen_5_times": safe_str(row[col_map["diagnosis_seen_5_times"]], "No"),
            "hcc_code": hcc_code,
            "mapping_status": mapping_status,
            "classification_status": None,
            "is_current_upload": True
        }

        records_to_insert.append(record)

        # Include mapped fields in response
        response_records.append({
            "Patient_ID": patient_id,
            "Age": age,
            "Sex": sex,
            "ICD10_Code": icd10_code,
            "HCC_Code": hcc_code or "—",
            "hcc_mapping_status": mapping_status,
            "patient_id": patient_id,
            "age": age,
            "sex": sex,
            "icd10_code": icd10_code,
            "hcc_code": hcc_code
        })

    # Reset is_current_upload for all existing records
    try:
        db.execute(text("UPDATE members_2025 SET is_current_upload = FALSE"))
        db.commit()
    except Exception as e:
        db.rollback()
        logger.error(f"Failed to reset is_current_upload: {e}")

    # 7. Bulk insert into members_2025 table
    insert_sql = text("""
        INSERT INTO members_2025 (
            patient_id, age, sex, year, number_of_encounters, number_of_diagnoses,
            chronic_condition_count, unique_icd10_count, repeated_diagnosis_count,
            recent_encounter_count, specialist_encounter_count, hospitalization_history,
            encounter_type, claim_frequency, disease_description, diagnosis_frequency,
            diagnosis_recency_days, provider_count, claim_count, icd10_code,
            diagnosis_seen_repeatedly_over_12_months, claim_type, provider_id,
            number_of_encounters_associated_with_diagnosis, diagnosis_seen_once,
            diagnosis_seen_5_times, hcc_code, mapping_status, classification_status,
            is_current_upload
        ) VALUES (
            :patient_id, :age, :sex, :year, :number_of_encounters, :number_of_diagnoses,
            :chronic_condition_count, :unique_icd10_count, :repeated_diagnosis_count,
            :recent_encounter_count, :specialist_encounter_count, :hospitalization_history,
            :encounter_type, :claim_frequency, :disease_description, :diagnosis_frequency,
            :diagnosis_recency_days, :provider_count, :claim_count, :icd10_code,
            :diagnosis_seen_repeatedly_over_12_months, :claim_type, :provider_id,
            :number_of_encounters_associated_with_diagnosis, :diagnosis_seen_once,
            :diagnosis_seen_5_times, :hcc_code, :mapping_status, :classification_status,
            :is_current_upload
        ) ON CONFLICT (patient_id) DO UPDATE SET
            age = EXCLUDED.age,
            sex = EXCLUDED.sex,
            year = EXCLUDED.year,
            number_of_encounters = EXCLUDED.number_of_encounters,
            number_of_diagnoses = EXCLUDED.number_of_diagnoses,
            chronic_condition_count = EXCLUDED.chronic_condition_count,
            unique_icd10_count = EXCLUDED.unique_icd10_count,
            repeated_diagnosis_count = EXCLUDED.repeated_diagnosis_count,
            recent_encounter_count = EXCLUDED.recent_encounter_count,
            specialist_encounter_count = EXCLUDED.specialist_encounter_count,
            hospitalization_history = EXCLUDED.hospitalization_history,
            encounter_type = EXCLUDED.encounter_type,
            claim_frequency = EXCLUDED.claim_frequency,
            disease_description = EXCLUDED.disease_description,
            diagnosis_frequency = EXCLUDED.diagnosis_frequency,
            diagnosis_recency_days = EXCLUDED.diagnosis_recency_days,
            provider_count = EXCLUDED.provider_count,
            claim_count = EXCLUDED.claim_count,
            icd10_code = EXCLUDED.icd10_code,
            diagnosis_seen_repeatedly_over_12_months = EXCLUDED.diagnosis_seen_repeatedly_over_12_months,
            claim_type = EXCLUDED.claim_type,
            provider_id = EXCLUDED.provider_id,
            number_of_encounters_associated_with_diagnosis = EXCLUDED.number_of_encounters_associated_with_diagnosis,
            diagnosis_seen_once = EXCLUDED.diagnosis_seen_once,
            diagnosis_seen_5_times = EXCLUDED.diagnosis_seen_5_times,
            hcc_code = EXCLUDED.hcc_code,
            mapping_status = EXCLUDED.mapping_status,
            classification_status = EXCLUDED.classification_status,
            is_current_upload = EXCLUDED.is_current_upload,
            updated_at = CURRENT_TIMESTAMP
    """)

    try:
        db.execute(insert_sql, records_to_insert)
        db.commit()
    except Exception as e:
        db.rollback()
        logger.error(f"Database insertion failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database insertion failure: {str(e)}"
        )

    return {
        "message": "CSV data successfully mapped and saved to members_2025",
        "total_records": total_records,
        "mapped_records": mapped_count,
        "unmapped_records": unmapped_count,
        "records": response_records,
        "preview": response_records
    }

@router.get(
    "/results",
    summary="Get HCC mapping results",
    description="Retrieve HCC mapping results from the members_2025 table with optional filtering",
    tags=["HCC Mapping"]
)
@hcc_map_router.get(
    "/results",
    summary="Get HCC mapping results",
    description="Retrieve HCC mapping results from the members_2025 table with optional filtering",
    tags=["HCC Mapping"]
)
async def get_hcc_results(
    page: int = 1,
    page_size: int = 50,
    mapping_status: str = None,
    patient_id: str = None,
    db: Session = Depends(get_db)
):
    """
    Get HCC mapping results with pagination and optional filtering.

    Args:
        page: Page number (starting from 1)
        page_size: Number of records per page (max 100)
        mapping_status: Filter by mapping status (MAPPED/UNMAPPED)
        patient_id: Filter by specific patient ID
    """
    if page_size > 100:
        page_size = 100

    offset = (page - 1) * page_size

    # Build the query
    base_query = """
        SELECT
            patient_id, age, sex, year, icd10_code, hcc_code, mapping_status,
            disease_description, diagnosis_frequency, number_of_encounters,
            created_at
        FROM members_2025
    """

    count_query = "SELECT COUNT(*) as total FROM members_2025"

    where_conditions = []
    params = {}

    if mapping_status:
        where_conditions.append("mapping_status = :mapping_status")
        params["mapping_status"] = mapping_status.upper()

    if patient_id:
        where_conditions.append("patient_id = :patient_id")
        params["patient_id"] = patient_id

    if where_conditions:
        where_clause = " WHERE " + " AND ".join(where_conditions)
        base_query += where_clause
        count_query += where_clause

    # Add pagination
    base_query += " ORDER BY created_at DESC LIMIT :limit OFFSET :offset"
    params["limit"] = page_size
    params["offset"] = offset

    try:
        # Get total count
        count_result = db.execute(text(count_query), params).fetchone()
        total = count_result.total if count_result else 0

        # Get paginated results
        results = db.execute(text(base_query), params).fetchall()

        records = []
        for row in results:
            records.append({
                "patient_id": row.patient_id,
                "age": row.age,
                "sex": row.sex,
                "year": row.year,
                "icd10_code": row.icd10_code,
                "hcc_code": row.hcc_code or "—",
                "mapping_status": row.mapping_status,
                "disease_description": row.disease_description,
                "diagnosis_frequency": row.diagnosis_frequency,
                "number_of_encounters": row.number_of_encounters,
                "created_at": row.created_at
            })

        return {
            "total": total,
            "page": page,
            "page_size": page_size,
            "records": records,
            "summary": {
                "total_records": total,
                "mapped_count": len([r for r in records if r["mapping_status"] == "MAPPED"]),
                "unmapped_count": len([r for r in records if r["mapping_status"] == "UNMAPPED"])
            }
        }

    except Exception as e:
        logger.error(f"Database query error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database query failed: {str(e)}"
        )


@router.get(
    "/stats",
    summary="Get HCC mapping statistics",
    description="Get overall statistics for HCC mapping results",
    tags=["HCC Mapping"]
)
@hcc_map_router.get(
    "/stats",
    summary="Get HCC mapping statistics",
    description="Get overall statistics for HCC mapping results",
    tags=["HCC Mapping"]
)
async def get_hcc_stats(db: Session = Depends(get_db)):
    """
    Get statistics about HCC mapping results.
    """
    try:
        stats_query = text("""
            SELECT
                COUNT(*) as total_records,
                COUNT(*) FILTER (WHERE mapping_status = 'MAPPED') as mapped_count,
                COUNT(*) FILTER (WHERE mapping_status = 'UNMAPPED') as unmapped_count,
                COUNT(DISTINCT patient_id) as unique_patients,
                COUNT(DISTINCT icd10_code) as unique_icd_codes,
                COUNT(DISTINCT hcc_code) as unique_hcc_codes,
                COUNT(*) FILTER (WHERE classification_status = 'FLAGGED') as flagged_count,
                COUNT(*) FILTER (WHERE classification_status = 'UNFLAGGED') as unflagged_count,
                MIN(created_at) as oldest_record,
                MAX(created_at) as newest_record
            FROM members_2025
        """)

        result = db.execute(stats_query).fetchone()

        if not result:
            return {
                "total_records": 0,
                "mapped_count": 0,
                "unmapped_count": 0,
                "unique_patients": 0,
                "unique_icd_codes": 0,
                "unique_hcc_codes": 0,
                "mapping_rate": 0.0,
                "flagged_count": 0,
                "unflagged_count": 0,
                "oldest_record": None,
                "newest_record": None
            }

        mapping_rate = (result.mapped_count / result.total_records * 100) if result.total_records > 0 else 0.0

        return {
            "total_records": result.total_records,
            "mapped_count": result.mapped_count,
            "unmapped_count": result.unmapped_count,
            "unique_patients": result.unique_patients,
            "unique_icd_codes": result.unique_icd_codes,
            "unique_hcc_codes": result.unique_hcc_codes,
            "mapping_rate": round(mapping_rate, 2),
            "flagged_count": result.flagged_count,
            "unflagged_count": result.unflagged_count,
            "oldest_record": result.oldest_record,
            "newest_record": result.newest_record
        }

    except Exception as e:
        logger.error(f"Database stats query error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database stats query failed: {str(e)}"
        )


@router.post(
    "/classify-members",
    summary="Classify members as FLAGGED or UNFLAGGED",
    description="Fetch patient IDs from members_2025 and send to classification pipeline",
    tags=["HCC Mapping"]
)
@hcc_map_router.post(
    "/classify-members",
    summary="Classify members as FLAGGED or UNFLAGGED",
    description="Fetch patient IDs from members_2025 and send to classification pipeline",
    tags=["HCC Mapping"]
)
async def classify_members(db: Session = Depends(get_db)):
    """
    Classify only the records from the current CSV upload in one pipeline request.
    """
    from dotenv import load_dotenv
    from pathlib import Path
    import json

    load_dotenv(Path(__file__).resolve().parents[2] / ".env", override=True)
    pipeline_url = os.getenv(
        "NGROK_PIPELINE_URL",
        "https://lorene-uncombatant-dancingly.ngrok-free.dev/run-pipeline"
    ).strip()

    def response_patient_id(item: Dict[str, Any]) -> str | None:
        for field_name in ("patient_id", "Patient_ID", "member_id", "memberId", "patientId", "id"):
            value = item.get(field_name)
            if value is not None:
                return str(value)
        for nested_name in ("patient", "member", "patient_info", "member_info"):
            nested = item.get(nested_name)
            if isinstance(nested, dict):
                nested_id = response_patient_id(nested)
                if nested_id:
                    return nested_id
        return None

    def classify_response_item(item: Dict[str, Any]) -> str:
        output = item.get("output") if isinstance(item.get("output"), dict) else item
        report = output.get("final_report") if isinstance(output, dict) else {}
        if not isinstance(report, dict):
            report = output if isinstance(output, dict) else item

        # The classifier's final decision takes precedence over legacy status
        # fields. A valid final result/no HCC belongs in the ML workflow.
        final_candidates = [
            report.get("final") if isinstance(report.get("final"), dict) else None,
            output.get("final") if isinstance(output, dict) and isinstance(output.get("final"), dict) else None,
            item.get("final") if isinstance(item.get("final"), dict) else None,
            report,
        ]
        final = next((candidate for candidate in final_candidates if candidate is not None), report)

        def as_bool(value: Any) -> bool | None:
            if isinstance(value, bool):
                return value
            if isinstance(value, (int, float)) and value in (0, 1):
                return bool(value)
            if isinstance(value, str):
                normalized = value.strip().lower()
                if normalized in {"true", "1", "yes"}:
                    return True
                if normalized in {"false", "0", "no"}:
                    return False
            return None

        valid = as_bool(final.get("valid")) if isinstance(final, dict) else None
        if valid is not None:
            return "UNFLAGGED" if valid else "FLAGGED"

        no_hcc_present = final.get("no_hcc_present") if isinstance(final, dict) else None
        if no_hcc_present is None and isinstance(output, dict):
            no_hcc_present = output.get("no_hcc_present")
        no_hcc_present = as_bool(no_hcc_present)
        if no_hcc_present is not None:
            return "UNFLAGGED" if no_hcc_present else "FLAGGED"

        raw_status = item.get("status") or item.get("classification") or item.get("classification_status")
        if raw_status:
            status_value = str(raw_status).strip().upper()
            if status_value in {"FLAGGED", "FLAG", "HIGH", "HIGH_RISK", "MEDIUM", "MEDIUM_RISK"}:
                return "FLAGGED"
            if status_value in {"UNFLAGGED", "UNFLAG", "LOW", "LOW_RISK", "NORMAL", "OK"}:
                return "UNFLAGGED"

        risk_assessment = report.get("risk_assessment", []) if isinstance(report, dict) else []
        if isinstance(risk_assessment, dict):
            risk_assessment = [risk_assessment]
        risk_levels = {
            str(entry.get("Risk Level") or entry.get("risk_level") or "").strip().upper()
            for entry in risk_assessment
            if isinstance(entry, dict)
        }
        return "FLAGGED" if risk_levels & {"HIGH", "MEDIUM", "HIGH_RISK", "MEDIUM_RISK"} else "UNFLAGGED"

    try:
        current_rows = db.execute(text(
            "SELECT DISTINCT patient_id FROM members_2025 WHERE is_current_upload = TRUE"
        )).fetchall()
        patient_ids = [row.patient_id for row in current_rows]
        if not patient_ids:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No current upload found for classification. Please upload a CSV first."
            )

        logger.info("Sending one classification request for %d current-batch patients", len(patient_ids))
        async with httpx.AsyncClient(timeout=120.0) as client:
            response = await client.post(
                pipeline_url,
                json={"patient_ids": patient_ids},
                headers={"Content-Type": "application/json"}
            )
        if response.status_code != 200:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"Classification pipeline returned status {response.status_code}"
            )

        pipeline_response = response.json()
        logger.info("CURRENT BATCH IDS: %s", patient_ids)
        logger.info("NGROK REQUEST: POST /run-pipeline %s", {"patient_ids": patient_ids})
        logger.info("RAW AWS RESPONSE: %s", pipeline_response)
        if isinstance(pipeline_response, dict) and pipeline_response.get("status") == "error":
            returned_items = normalize_response_items(pipeline_response)
            returned_ids = [response_patient_id(item) for item in returned_items if response_patient_id(item)]
            logger.info("NORMALIZED RESULTS: %s", returned_items)
            logger.error(
                "AWS classification failed. REQUESTED IDS: %s RETURNED IDS: %s MISSING IDS: %s MESSAGE: %s",
                patient_ids,
                returned_ids,
                patient_ids,
                pipeline_response.get("message")
            )
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"AWS classification failed: {pipeline_response.get('message', 'unknown error')}"
            )

        returned_items = normalize_response_items(pipeline_response)
        returned_by_id = {
            response_patient_id(item): item
            for item in returned_items
            if response_patient_id(item)
        }
        returned_ids = list(returned_by_id)
        missing_ids = [patient_id for patient_id in patient_ids if patient_id not in returned_by_id]
        logger.info("NORMALIZED RESULTS: %s", returned_items)
        logger.info("RETURNED IDS: %s", returned_ids)
        logger.info("MISSING IDS: %s", missing_ids)
        if missing_ids:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=(
                    "Classification pipeline did not return all current-batch patients. "
                    f"Requested IDs: {patient_ids}; Returned IDs: {returned_ids}; Missing IDs: {missing_ids}"
                )
            )

        # Clear prior workflow availability when a current batch is reclassified.
        db.execute(text("""
            UPDATE members_2025
            SET classification_status = NULL,
                available_for_agent = FALSE,
                available_for_ml = FALSE
            WHERE is_current_upload = TRUE
        """))

        counts = persist_classification_results(db, returned_items)

        db.commit()
        flagged_count = counts["agent"]
        logger.info(
            "CLASSIFICATION COMMITTED: ML=%s (%s), AGENT=%s (%s)",
            counts["ml"], counts["ml_patient_ids"],
            counts["agent"], counts["agent_patient_ids"]
        )
        logger.info("FINAL CLASSIFICATION: FLAGGED = %d UNFLAGGED = %d", flagged_count, len(patient_ids) - flagged_count)
        return {
            "message": "Classification completed successfully",
            "total_classified": len(patient_ids),
            "flagged_count": flagged_count,
            "unflagged_count": counts["ml"],
            "ml_patient_ids": counts["ml_patient_ids"],
            "agent_patient_ids": counts["agent_patient_ids"],
            "pipeline_response": pipeline_response
        }
    except (httpx.TimeoutException, httpx.ConnectError) as exc:
        db.rollback()
        logger.error("Classification pipeline request failed: %s", exc)
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=f"Classification pipeline request failed: {exc}")
    except HTTPException:
        db.rollback()
        raise
    except Exception as exc:
        db.rollback()
        logger.error("Classification error: %s", exc)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Classification failed: {exc}")

    from dotenv import load_dotenv
    from pathlib import Path
    load_dotenv(Path(__file__).resolve().parents[2] / ".env", override=True)

    pipeline_url = os.getenv(
        "NGROK_PIPELINE_URL",
        "https://lorene-uncombatant-dancingly.ngrok-free.dev/run-pipeline"
    ).strip()

    try:
        # Fetch distinct patient_id for newly uploaded members in members_2025
        query = text("SELECT DISTINCT patient_id FROM members_2025 WHERE is_current_upload = TRUE AND classification_status IS NULL")
        rows = db.execute(query).fetchall()

        if not rows:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No members found in members_2025 for classification. Please upload a CSV first."
            )

        unclassified_ids = []

        for row in rows:
            unclassified_ids.append(row.patient_id)

        classification_result = None

        # Call ngrok pipeline ONLY if there are unclassified members
        if unclassified_ids:
            headers = {
                "Content-Type": "application/json",
                "ngrok-skip-browser-warning": "true"
            }

            logger.info(f"Sending {len(unclassified_ids)} unclassified patient IDs to classification pipeline in batches: {pipeline_url}")

            BATCH_SIZE = 5
            classified_ids = set()
            last_classification_result = None

            async with httpx.AsyncClient(timeout=120.0) as client:
                for i in range(0, len(unclassified_ids), BATCH_SIZE):
                    batch_ids = unclassified_ids[i:i + BATCH_SIZE]
                    
                    # Fetch complete clinical records from members_2025 for this batch
                    records_query = text("""
                        SELECT *
                        FROM members_2025
                        WHERE patient_id = ANY(:batch_ids)
                    """)
                    batch_records = [dict(r._mapping) for r in db.execute(records_query, {"batch_ids": batch_ids}).fetchall()]
                    # Remove non-serializable fields if any (like datetime)
                    for rec in batch_records:
                        for k, v in list(rec.items()):
                            if hasattr(v, 'isoformat'):
                                rec[k] = v.isoformat()

                    payload = {
                        "patient_ids": batch_ids,
                        "records": batch_records
                    }

                    try:
                        logger.info(f"Processing classification batch {i//BATCH_SIZE + 1} ({len(batch_ids)} members with full clinical records)...")
                        response = await client.post(pipeline_url, json=payload, headers=headers)
                        if response.status_code == 200:
                            try:
                                batch_result = response.json()
                                last_classification_result = batch_result
                            except Exception as parse_err:
                                logger.error(f"Non-JSON response from pipeline for batch {batch_ids}: {parse_err}")
                                continue

                            items_list = []
                            if isinstance(batch_result, dict):
                                items_list = (
                                    batch_result.get("data")
                                    or batch_result.get("classifications")
                                    or batch_result.get("results")
                                    or batch_result.get("predictions")
                                    or []
                                )
                                if not items_list:
                                    first_key = next(iter(batch_result), None)
                                    if first_key and first_key in batch_ids:
                                        for pid_key, raw_val in batch_result.items():
                                            if isinstance(raw_val, dict):
                                                raw_val["patient_id"] = pid_key
                                                items_list.append(raw_val)
                                            else:
                                                items_list.append({"patient_id": pid_key, "status": raw_val})
                            elif isinstance(batch_result, list):
                                items_list = batch_result

                            for item in items_list:
                                if not isinstance(item, dict):
                                    continue
                                pid = item.get("patient_id") or item.get("Patient_ID") or item.get("id")
                                if not pid:
                                    continue

                                if pid not in batch_ids:
                                    logger.warning(f"Project Agent returned unrequested patient_id {pid}, ignoring to preserve database integrity.")
                                    continue

                                raw_status = (
                                    item.get("status")
                                    or item.get("classification")
                                    or item.get("classification_status")
                                    or item.get("flag")
                                    or item.get("result")
                                )

                                risk_score_val = item.get("risk_score") or item.get("Risk Score")
                                risk_level_val = item.get("risk_level") or item.get("Risk Level")
                                final_report = None

                                output_obj = item.get("output")
                                if isinstance(output_obj, dict):
                                    final_report = output_obj.get("final_report") or output_obj
                                    if isinstance(final_report, dict):
                                        if not raw_status or str(raw_status).lower() in ["success", "ok"]:
                                            raw_status = final_report.get("status") or final_report.get("risk_level")
                                        if risk_score_val is None:
                                            risk_score_val = final_report.get("risk_score") or final_report.get("Risk Score") or final_report.get("overall_risk_score")
                                        if not risk_level_val:
                                            risk_level_val = final_report.get("risk_level") or final_report.get("Risk Level")
                                            
                                        risk_assess = final_report.get("risk_assessment")
                                        if isinstance(risk_assess, list) and len(risk_assess) > 0:
                                            first_ra = risk_assess[0]
                                            if isinstance(first_ra, dict):
                                                if not raw_status:
                                                    raw_status = first_ra.get("status") or first_ra.get("risk_level")
                                                if risk_score_val is None:
                                                    risk_score_val = first_ra.get("risk_score") or first_ra.get("score")
                                                if not risk_level_val:
                                                    risk_level_val = first_ra.get("risk_level") or first_ra.get("Risk Level")

                                if not raw_status:
                                    # Fallback if status is missing but risk_level exists
                                    raw_status = risk_level_val
                                
                                if not raw_status:
                                    # Do not fabricate an UNFLAGGED result for failures
                                    continue # Skip this patient
                                    
                                status_str = str(raw_status).strip().upper()
                                if status_str in ["FLAGGED", "FLAG", "HIGH", "HIGH_RISK", "HIGH RISK", "MEDIUM", "MEDIUM_RISK", "PRESENT", "TRUE", "1", "YES"]:
                                    final_status = "FLAGGED"
                                elif status_str in ["UNFLAGGED", "LOW", "LOW_RISK", "LOW RISK", "FALSE", "0", "NO", "NORMAL", "OK", "SUCCESS", "UNFLAG"]:
                                    final_status = "UNFLAGGED"
                                else:
                                    # Unrecognized status, do not silently mark as UNFLAGGED
                                    continue
                                
                                # Convert risk_score to float if possible
                                if risk_score_val is not None:
                                    try:
                                        risk_score_val = float(risk_score_val)
                                    except (ValueError, TypeError):
                                        risk_score_val = None
                                
                                # Update members_2025
                                update_query = text("""
                                    UPDATE members_2025
                                    SET classification_status = :status
                                    WHERE patient_id = :patient_id
                                """)
                                db.execute(update_query, {"status": final_status, "patient_id": pid})
                                classified_ids.add(pid)

                                # Use exact JSON object from pipeline
                                import json
                                report_details_json = json.dumps(final_report if final_report else item, default=str)

                                if final_status == "FLAGGED":
                                    upsert_query = text("""
                                        INSERT INTO agent_results (patient_id, risk_score, risk_level, status, report_details)
                                        VALUES (:pid, :score, :level, :status, :report)
                                        ON CONFLICT (patient_id) DO UPDATE
                                        SET risk_score = EXCLUDED.risk_score,
                                            risk_level = EXCLUDED.risk_level,
                                            status = EXCLUDED.status,
                                            report_details = EXCLUDED.report_details,
                                            updated_at = CURRENT_TIMESTAMP
                                    """)
                                    db.execute(upsert_query, {
                                        "pid": pid,
                                        "score": risk_score_val,
                                        "level": risk_level_val,
                                        "status": final_status,
                                        "report": report_details_json
                                    })
                                else:
                                    # final_status == "UNFLAGGED"
                                    upsert_query = text("""
                                        INSERT INTO ml_results (patient_id, risk_score, risk_level, report_details, model_version)
                                        VALUES (:pid, :score, :level, :report, :model_version)
                                        ON CONFLICT (patient_id) DO UPDATE
                                        SET risk_score = EXCLUDED.risk_score,
                                            risk_level = EXCLUDED.risk_level,
                                            report_details = EXCLUDED.report_details,
                                            model_version = EXCLUDED.model_version,
                                            updated_at = CURRENT_TIMESTAMP
                                    """)
                                    db.execute(upsert_query, {
                                        "pid": pid,
                                        "score": risk_score_val,
                                        "level": risk_level_val,
                                        "report": report_details_json,
                                        "model_version": "v1.0"
                                    })

                            db.commit()
                        else:
                            logger.error(f"Classification pipeline returned status {response.status_code} for batch {batch_ids}")
                    except Exception as err:
                        logger.error(f"Error calling pipeline for batch {batch_ids}: {err}")

            unhandled = set(unclassified_ids) - classified_ids
            if unhandled:
                logger.warning(f"{len(unhandled)} members were unhandled by pipeline due to error/timeout. Leaving status as NULL for retry.")

            classification_result = last_classification_result
        else:
            logger.info("All members already have stored classification results in DB. Skipping ngrok call.")

        # Read total classification statistics from members_2025 DB table
        stats_query = text("""
            SELECT
                COUNT(*) as total_classified,
                COUNT(*) FILTER (WHERE classification_status = 'FLAGGED') as flagged_count,
                COUNT(*) FILTER (WHERE classification_status = 'UNFLAGGED') as unflagged_count
            FROM members_2025
            WHERE is_current_upload = TRUE AND classification_status IS NOT NULL
        """)
        stats_result = db.execute(stats_query).fetchone()

        total_classified = stats_result.total_classified if stats_result else 0
        flagged_count = stats_result.flagged_count if stats_result else 0
        unflagged_count = stats_result.unflagged_count if stats_result else 0

        return {
            "message": "Classification completed successfully",
            "total_classified": total_classified,
            "flagged_count": flagged_count,
            "unflagged_count": unflagged_count,
            "from_db": len(unclassified_ids) == 0,
            "pipeline_response": classification_result
        }

    except httpx.TimeoutException:
        logger.error("Classification pipeline timed out after 120 seconds")
        raise HTTPException(
            status_code=status.HTTP_504_GATEWAY_TIMEOUT,
            detail="Classification pipeline timed out after 120 seconds"
        )
    except httpx.ConnectError as e:
        logger.error(f"Cannot connect to classification pipeline: {e}")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Cannot connect to classification pipeline (ngrok may be offline): {str(e)}"
        )
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Classification error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Classification failed: {str(e)}"
        )


@router.post(
    "/assign-for-agent",
    summary="Assign flagged members for agent verification",
    description="Make flagged members available on the Agent page",
    tags=["HCC Mapping"]
)
@hcc_map_router.post(
    "/assign-for-agent",
    summary="Assign flagged members for agent verification",
    description="Make flagged members available on the Agent page",
    tags=["HCC Mapping"]
)
async def assign_for_agent(db: Session = Depends(get_db)):
    """
    Assign flagged members for agent verification workflow.
    """
    try:
        db.execute(text("""
            UPDATE members_2025
            SET available_for_agent = TRUE, updated_at = CURRENT_TIMESTAMP
            WHERE is_current_upload = TRUE AND classification_status = 'FLAGGED'
        """))
        db.commit()
        assigned_count = db.execute(text("""
            SELECT COUNT(*) FROM members_2025
            WHERE is_current_upload = TRUE AND classification_status = 'FLAGGED'
              AND available_for_agent = TRUE
        """)).scalar() or 0
        patient_ids = [row[0] for row in db.execute(text("""
            SELECT patient_id FROM members_2025
            WHERE is_current_upload = TRUE AND classification_status = 'FLAGGED'
              AND available_for_agent = TRUE ORDER BY updated_at DESC, patient_id
        """)).fetchall()]
        return {"message": "Flagged members assigned for agent verification",
                "assigned_count": assigned_count, "sent_to_agent": assigned_count,
            "successful": assigned_count, "failed": 0, "patient_ids": patient_ids}
    except Exception as exc:
        db.rollback()
        logger.error("Agent assignment error: %s", exc)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                            detail=f"Failed to assign members for agent: {exc}")


@router.post(
    "/assign-for-ml",
    summary="Assign unflagged members for ML prediction",
    description="Make unflagged members available on the ML page",
    tags=["HCC Mapping"]
)
@hcc_map_router.post(
    "/assign-for-ml",
    summary="Assign unflagged members for ML prediction",
    description="Make unflagged members available on the ML page",
    tags=["HCC Mapping"]
)
async def assign_for_ml(db: Session = Depends(get_db)):
    """
    Assign unflagged members for ML prediction workflow.
    """
    try:
        db.execute(text("""
            UPDATE members_2025
            SET available_for_ml = TRUE, updated_at = CURRENT_TIMESTAMP
            WHERE is_current_upload = TRUE AND classification_status = 'UNFLAGGED'
        """))
        db.commit()
        assigned_count = db.execute(text("""
            SELECT COUNT(*) FROM members_2025
            WHERE is_current_upload = TRUE AND classification_status = 'UNFLAGGED'
              AND available_for_ml = TRUE
        """)).scalar() or 0
        patient_ids = [row[0] for row in db.execute(text("""
            SELECT patient_id FROM members_2025
            WHERE is_current_upload = TRUE AND classification_status = 'UNFLAGGED'
              AND available_for_ml = TRUE ORDER BY updated_at DESC, patient_id
        """)).fetchall()]
        return {"message": "Unflagged members assigned for ML prediction",
                "assigned_count": assigned_count, "sent_to_ml": assigned_count,
            "successful": assigned_count, "failed": 0, "patient_ids": patient_ids}
    except Exception as exc:
        db.rollback()
        logger.error("ML assignment error: %s", exc)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                            detail=f"Failed to assign members for ML: {exc}")

