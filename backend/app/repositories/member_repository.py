from sqlalchemy import text
from sqlalchemy.orm import Session


class MemberRepository:

    def __init__(self, db: Session):
        self.db = db

    def get_dashboard_counts(self, year: int | None = None):

        query = """
            SELECT
                COUNT(*) AS total_members,

                COUNT(*) FILTER (
                    WHERE classification_status = 'FLAGGED'
                ) AS flagged_members,

                COUNT(*) FILTER (
                    WHERE classification_status = 'UNFLAGGED'
                ) AS unflagged_members,

                COUNT(DISTINCT patient_id) FILTER (
                    WHERE review_status = 'REVIEWED'
                ) AS review_cases

            FROM members_2025
        """

        # Get accepted and rejected members from member_review_status table
        review_query = """
            SELECT
                COUNT(*) FILTER (
                    WHERE decision_status = 'ACCEPTED'
                ) AS accepted_members,

                COUNT(*) FILTER (
                    WHERE decision_status = 'REJECTED'
                ) AS rejected_members

            FROM member_review_status
        """

        params = {}

        if year is not None:
            query += """
                WHERE year = :year
            """
            params["year"] = year

        result = self.db.execute(
            text(query),
            params
        ).mappings().one()

        review_result = self.db.execute(
            text(review_query)
        ).mappings().one()

        return {
            "total_members": result["total_members"],
            "flagged_members": result["flagged_members"],
            "unflagged_members": result["unflagged_members"],
            "review_cases": result["review_cases"],
            "accepted_members": review_result["accepted_members"],
            "rejected_members": review_result["rejected_members"],
        }

    def mark_for_review(self, patient_id: str):
        query = """
            UPDATE members_2025
            SET review_status = 'REVIEWED', updated_at = CURRENT_TIMESTAMP
            WHERE patient_id = :patient_id
            RETURNING patient_id
        """
        result = self.db.execute(text(query), {"patient_id": patient_id}).fetchone()
        if result is None:
            raise ValueError(f"Patient {patient_id} not found")
        self.db.commit()

    def submit_decision(self, patient_id: str, decision: str, source: str):
        member = self.db.execute(text("""
            SELECT patient_id, age, sex, icd10_code, hcc_code, mapping_status
            FROM members_2025
            WHERE patient_id = :patient_id
            FOR UPDATE
        """), {"patient_id": patient_id}).mappings().first()
        if member is None:
            raise LookupError(f"Patient {patient_id} not found")

        existing = self.db.execute(text("""
            SELECT id
            FROM member_review_status
            WHERE patient_id = :patient_id
            FOR UPDATE
        """), {"patient_id": patient_id}).first()
        if existing is not None:
            raise FileExistsError(f"Decision already recorded for patient {patient_id}")

        self.db.execute(text("""
            INSERT INTO member_review_status
                (patient_id, age, sex, icd_code, hcc_code, mapping_status, decision_status, decision_source)
            VALUES
                (:patient_id, :age, :sex, :icd_code, :hcc_code, :mapping_status, :decision_status, :decision_source)
        """), {
            "patient_id": member["patient_id"],
            "age": member["age"],
            "sex": member["sex"],
            "icd_code": member["icd10_code"],
            "hcc_code": member["hcc_code"],
            "mapping_status": member["mapping_status"],
            "decision_status": decision,
            "decision_source": source,
        })

        deleted = self.db.execute(text("""
            DELETE FROM members_2025
            WHERE patient_id = :patient_id
        """), {"patient_id": patient_id}).rowcount
        if deleted != 1:
            raise LookupError(f"Patient {patient_id} could not be removed")

        self.db.commit()

    def get_members(
        self,
        page: int = 1,
        page_size: int = 20,
        patient_id: str | None = None,
        flag_status: str | None = None,
        sex: str | None = None,
        min_age: int | None = None,
        max_age: int | None = None,
        review_status: str | None = None,
    ):
        # For Members Directory, show ONE row per unique Patient_ID
        # Use DISTINCT ON to get the most recent record per patient
        
        # Count unique patients
        count_query = """
            SELECT COUNT(DISTINCT patient_id) as total
            FROM members_2025
            WHERE 1=1
        """
        
        # Main query - get one record per patient (most recent year/record)
        query = """
            SELECT * FROM (
                SELECT DISTINCT ON (patient_id)
                patient_id,
                age,
                sex,
                year,
                hcc_code AS calculated_hcc_codes,
                hcc_code,
                mapping_status AS hcc_mapping_status,
                classification_status AS flag_unflag_status,
                review_status,
                icd10_code,
                number_of_encounters,
                number_of_diagnoses,
                chronic_condition_count
            FROM members_2025
            WHERE 1=1
        """
        
        params = {}
        
        # Build WHERE clause
        if patient_id is not None:
            query += ' AND patient_id = :patient_id'
            count_query += ' AND patient_id = :patient_id'
            params["patient_id"] = patient_id
        
        if flag_status is not None:
            query += ' AND classification_status = :flag_status'
            # For count with flag filter, need subquery
            count_query = """
                SELECT COUNT(*) FROM (
                    SELECT DISTINCT patient_id
                    FROM members_2025
                    WHERE classification_status = :flag_status
                ) AS unique_patients
            """
            params["flag_status"] = flag_status

        if review_status is not None:
            query += ' AND review_status = :review_status'
            count_query += ' AND review_status = :review_status'
            params["review_status"] = review_status
        
        if sex is not None:
            query += ' AND sex = :sex'
            if 'SELECT COUNT(*)' in count_query:
                # Already using subquery, add to inner WHERE
                count_query = count_query.replace(
                    "WHERE classification_status",
                    f"WHERE sex = :sex AND classification_status"
                )
            else:
                count_query += ' AND sex = :sex'
            params["sex"] = sex
        
        if min_age is not None:
            query += ' AND age >= :min_age'
            if 'SELECT COUNT(*)' not in count_query or 'FROM (' not in count_query:
                count_query += ' AND age >= :min_age'
            params["min_age"] = min_age
        
        if max_age is not None:
            query += ' AND age <= :max_age'
            if 'SELECT COUNT(*)' not in count_query or 'FROM (' not in count_query:
                count_query += ' AND age <= :max_age'
            params["max_age"] = max_age
        
        # Get total unique patient count
        total = self.db.execute(
            text(count_query),
            params
        ).scalar()
        
        # Complete the DISTINCT ON query with ORDER BY
        query += """
                ORDER BY patient_id, year DESC
            ) AS unique_records
            ORDER BY patient_id ASC
        """
        
        # Add pagination
        offset = (page - 1) * page_size
        query += """
            LIMIT :limit OFFSET :offset
        """
        params["limit"] = page_size
        params["offset"] = offset
        
        # Execute query
        members = self.db.execute(
            text(query),
            params
        ).mappings().all()
        
        return {
            "total": total,
            "members": [dict(m) for m in members]
        }

    def get_member_history(self, patient_id: str):
        """
        Get complete history for a patient across all year tables (2020-2025)
        """
        query = """
            SELECT patient_id, age, sex, year,
                   calculated_hcc_codes, calculated_risk_score,
                   hcc_mapping_status, hcc_mapping_reason,
                   flag_unflag_status, flag_reason,
                   number_of_encounters, number_of_diagnoses,
                   chronic_condition_count, icd10_code, icd10_code_list,
                   disease_description, diagnosis_frequency,
                   diagnosis_recency_days, provider_count,
                   claim_count, claim_frequency,
                   encounter_type, CAST(hospitalization_history AS VARCHAR) AS hospitalization_history,
                   hcc_category_count, unique_icd10_count,
                   repeated_diagnosis_count, recent_encounter_count,
                   specialist_encounter_count
            FROM members_2021
            WHERE patient_id = :patient_id
            
            UNION ALL
            
            SELECT patient_id, age, sex, year,
                   calculated_hcc_codes, calculated_risk_score,
                   hcc_mapping_status, hcc_mapping_reason,
                   flag_unflag_status, flag_reason,
                   number_of_encounters, number_of_diagnoses,
                   chronic_condition_count, icd10_code, icd10_code_list,
                   disease_description, diagnosis_frequency,
                   diagnosis_recency_days, provider_count,
                   claim_count, claim_frequency,
                   encounter_type, CAST(hospitalization_history AS VARCHAR) AS hospitalization_history,
                   hcc_category_count, unique_icd10_count,
                   repeated_diagnosis_count, recent_encounter_count,
                   specialist_encounter_count
            FROM members_2022
            WHERE patient_id = :patient_id
            
            UNION ALL
            
            SELECT patient_id, age, sex, year,
                   calculated_hcc_codes, calculated_risk_score,
                   hcc_mapping_status, hcc_mapping_reason,
                   flag_unflag_status, flag_reason,
                   number_of_encounters, number_of_diagnoses,
                   chronic_condition_count, icd10_code, icd10_code_list,
                   disease_description, diagnosis_frequency,
                   diagnosis_recency_days, provider_count,
                   claim_count, claim_frequency,
                   encounter_type, CAST(hospitalization_history AS VARCHAR) AS hospitalization_history,
                   hcc_category_count, unique_icd10_count,
                   repeated_diagnosis_count, recent_encounter_count,
                   specialist_encounter_count
            FROM members_2023
            WHERE patient_id = :patient_id
            
            UNION ALL
            
            SELECT patient_id, age, sex, year,
                   calculated_hcc_codes, calculated_risk_score,
                   hcc_mapping_status, hcc_mapping_reason,
                   flag_unflag_status, flag_reason,
                   number_of_encounters, number_of_diagnoses,
                   chronic_condition_count, icd10_code, icd10_code_list,
                   disease_description, diagnosis_frequency,
                   diagnosis_recency_days, provider_count,
                   claim_count, claim_frequency,
                   encounter_type, CAST(hospitalization_history AS VARCHAR) AS hospitalization_history,
                   hcc_category_count, unique_icd10_count,
                   repeated_diagnosis_count, recent_encounter_count,
                   specialist_encounter_count
            FROM members_2024
            WHERE patient_id = :patient_id
            
            UNION ALL
            
            SELECT patient_id, age, sex, year,
                   hcc_code AS calculated_hcc_codes, CAST(NULL AS numeric) AS calculated_risk_score,
                   mapping_status AS hcc_mapping_status, CAST(NULL AS text) AS hcc_mapping_reason,
                   classification_status AS flag_unflag_status, CAST(NULL AS text) AS flag_reason,
                   number_of_encounters, number_of_diagnoses,
                   chronic_condition_count, icd10_code, CAST(NULL AS text) AS icd10_code_list,
                   disease_description, diagnosis_frequency,
                   diagnosis_recency_days, provider_count,
                   claim_count, claim_frequency,
                   encounter_type, hospitalization_history,
                   CAST(NULL AS integer) AS hcc_category_count, unique_icd10_count,
                   repeated_diagnosis_count, recent_encounter_count,
                   specialist_encounter_count
            FROM members_2025
            WHERE patient_id = :patient_id
            
            ORDER BY year DESC
        """
        
        result = self.db.execute(
            text(query),
            {"patient_id": patient_id}
        ).mappings().all()
        
        return [dict(row) for row in result]

    def get_accepted_members(self, page: int = 1, page_size: int = 20):
        """Get accepted members from member_review_status table"""
        count_query = """
            SELECT COUNT(*) as total
            FROM member_review_status
            WHERE decision_status = 'ACCEPTED'
        """

        query = """
            SELECT patient_id, age, sex, icd_code, hcc_code, 
                   mapping_status, decision_status, decision_source,
                   created_at, updated_at
            FROM member_review_status
            WHERE decision_status = 'ACCEPTED'
            ORDER BY updated_at DESC
            LIMIT :limit OFFSET :offset
        """

        total = self.db.execute(text(count_query)).scalar()
        
        offset = (page - 1) * page_size
        params = {"limit": page_size, "offset": offset}
        
        members = self.db.execute(text(query), params).mappings().all()
        
        return {
            "total": total,
            "members": [dict(m) for m in members]
        }

    def get_rejected_members(self, page: int = 1, page_size: int = 20):
        """Get rejected members from member_review_status table"""
        count_query = """
            SELECT COUNT(*) as total
            FROM member_review_status
            WHERE decision_status = 'REJECTED'
        """

        query = """
            SELECT patient_id, age, sex, icd_code, hcc_code, 
                   mapping_status, decision_status, decision_source,
                   created_at, updated_at
            FROM member_review_status
            WHERE decision_status = 'REJECTED'
            ORDER BY updated_at DESC
            LIMIT :limit OFFSET :offset
        """

        total = self.db.execute(text(count_query)).scalar()
        
        offset = (page - 1) * page_size
        params = {"limit": page_size, "offset": offset}
        
        members = self.db.execute(text(query), params).mappings().all()
        
        return {
            "total": total,
            "members": [dict(m) for m in members]
        }