from pydantic import BaseModel


class DashboardSummary(BaseModel):
    total_members: int
    flagged_members: int
    unflagged_members: int
    review_cases: int
    follow_ups: int
    accepted_members: int
    rejected_members: int