from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.schemas.dashboard import DashboardSummary
from app.services.dashboard_Service import DashboardService


router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"]
)


@router.get(
    "/summary",
    response_model=DashboardSummary
)
def get_dashboard_summary(
    year: int | None = Query(
        default=None,
        description="Filter dashboard data by year"
    ),
    db: Session = Depends(get_db),
):
    service = DashboardService(db)

    return service.get_summary(year)


@router.get("/accepted-members")
def get_accepted_members(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    service = DashboardService(db)
    return service.get_accepted_members(page, page_size)


@router.get("/rejected-members")
def get_rejected_members(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    service = DashboardService(db)
    return service.get_rejected_members(page, page_size)