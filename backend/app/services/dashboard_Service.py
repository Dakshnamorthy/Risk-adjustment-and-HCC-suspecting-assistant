from sqlalchemy.orm import Session

from app.repositories.member_repository import MemberRepository


class DashboardService:

    def __init__(self, db: Session):
        self.member_repository = MemberRepository(db)

    def get_summary(self, year: int | None = None):

        member_counts = (
            self.member_repository
            .get_dashboard_counts(year)
        )

        review_cases = member_counts.get("review_cases", 0)
        follow_ups = member_counts.get("flagged_members", 0)

        return {
            "total_members": member_counts["total_members"],
            "flagged_members": member_counts["flagged_members"],
            "unflagged_members": member_counts["unflagged_members"],
            "review_cases": review_cases,
            "follow_ups": follow_ups,
            "accepted_members": member_counts["accepted_members"],
            "rejected_members": member_counts["rejected_members"],
        }
    def get_accepted_members(self, page: int = 1, page_size: int = 20):
        return self.member_repository.get_accepted_members(page, page_size)

    def get_rejected_members(self, page: int = 1, page_size: int = 20):
        return self.member_repository.get_rejected_members(page, page_size)