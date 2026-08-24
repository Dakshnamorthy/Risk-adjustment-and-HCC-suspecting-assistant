from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.schemas.member import MemberDecisionRequest, MemberListResponse
from app.services.member_service import MemberService


router = APIRouter(
    prefix="/members",
    tags=["Members"]
)


@router.get(
    "",
    response_model=MemberListResponse
)
def get_members(
    page: int = Query(default=1, ge=1, description="Page number"),
    page_size: int = Query(default=20, ge=1, le=100, description="Items per page"),
    patient_id: str | None = Query(default=None, description="Filter by Patient ID"),
    flag_status: str | None = Query(default=None, description="Filter by flag status (FLAGGED/UNFLAGGED)"),
    sex: str | None = Query(default=None, description="Filter by sex (M/F)"),
    min_age: int | None = Query(default=None, ge=0, description="Minimum age"),
    max_age: int | None = Query(default=None, ge=0, description="Maximum age"),
    review_status: str | None = Query(default=None, description="Filter by review status"),
    db: Session = Depends(get_db),
):
    service = MemberService(db)
    return service.get_members(
        page=page,
        page_size=page_size,
        patient_id=patient_id,
        flag_status=flag_status,
        sex=sex,
        min_age=min_age,
        max_age=max_age,
        review_status=review_status,
    )


@router.get("/{patient_id}")
def get_member_history(
    patient_id: str,
    db: Session = Depends(get_db),
):
    """
    Get complete patient history across all year tables (2020-2025)
    """
    service = MemberService(db)
    result = service.get_member_history(patient_id)
    
    if result is None:
        raise HTTPException(
            status_code=404,
            detail=f"Patient {patient_id} not found"
        )
    
    return result


@router.post("/{patient_id}/mark-for-review")
def mark_for_review(
    patient_id: str,
    db: Session = Depends(get_db),
):
    """
    Mark a patient for review without changing classification_status.
    """
    service = MemberService(db)
    try:
        service.mark_for_review(patient_id)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc))
    return {
        "success": True,
        "patient_id": patient_id,
        "review_status": "REVIEWED",
        "message": f"Patient {patient_id} marked for review"
    }


@router.post("/{patient_id}/decision")
def submit_decision(
    patient_id: str,
    decision: MemberDecisionRequest,
    db: Session = Depends(get_db),
):
    service = MemberService(db)
    try:
        service.submit_decision(patient_id, decision.status, decision.source)
    except LookupError as exc:
        db.rollback()
        raise HTTPException(status_code=404, detail=str(exc))
    except FileExistsError:
        db.rollback()
        raise HTTPException(status_code=409, detail="Decision already recorded for this patient.")
    except Exception as exc:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Decision could not be saved: {exc}")

    return {
        "success": True,
        "patient_id": patient_id,
        "status": decision.status,
        "source": decision.source,
        "message": f"Patient {patient_id} decision recorded as {decision.status}"
    }
