from sqlalchemy.orm import Session

from app.repositories.member_repository import MemberRepository


class MemberService:

    def __init__(self, db: Session):
        self.member_repository = MemberRepository(db)

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
        result = self.member_repository.get_members(
            page=page,
            page_size=page_size,
            patient_id=patient_id,
            flag_status=flag_status,
            sex=sex,
            min_age=min_age,
            max_age=max_age,
            review_status=review_status,
        )

        return {
            "total": result["total"],
            "page": page,
            "page_size": page_size,
            "members": result["members"],
        }

    def get_member_history(self, patient_id: str):
        """
        Get complete patient history from all year tables (2020-2025)
        """
        history = self.member_repository.get_member_history(patient_id)
        
        if not history:
            return None
        
        # Group records by year for easier frontend consumption
        history_by_year = {}
        for record in history:
            year = record['year']
            if year not in history_by_year:
                history_by_year[year] = []
            history_by_year[year].append(record)
        
        # Get most recent record for summary info
        latest_record = history[0] if history else None
        
        return {
            "patient_id": patient_id,
            "summary": latest_record,
            "history": history,
            "history_by_year": history_by_year,
            "years": sorted(history_by_year.keys())
        }

    def mark_for_review(self, patient_id: str):
        self.member_repository.mark_for_review(patient_id)

    def submit_decision(self, patient_id: str, decision: str, source: str):
        self.member_repository.submit_decision(patient_id, decision, source)
