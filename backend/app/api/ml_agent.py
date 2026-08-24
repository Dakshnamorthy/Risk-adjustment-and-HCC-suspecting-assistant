from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.services.ml_agent_service import MLAgentService
from app.schemas.ml_agent import PatientIDList, MLAgentResponse, FlaggedMembersResponse, UnflaggedMembersResponse

router = APIRouter(
    prefix="/ml-agent",
    tags=["ML and Agent Processing"]
)


@router.get("/flagged-members", response_model=FlaggedMembersResponse)
def get_flagged_members(
    page: int = 1,
    limit: int = 10,
    db: Session = Depends(get_db)
):
    """Get flagged members for Agent Analysis (default 10)"""
    service = MLAgentService(db)
    result = service.get_flagged_members(page=page, limit=limit)
    return FlaggedMembersResponse(
        members=result["members"],
        total=result["total"]
    )


@router.get("/unflagged-members", response_model=UnflaggedMembersResponse)
def get_unflagged_members(
    page: int = 1,
    limit: int = 10,
    db: Session = Depends(get_db)
):
    """Get unflagged members for ML Prediction (default 10)"""
    service = MLAgentService(db)
    result = service.get_unflagged_members(page=page, limit=limit)
    return UnflaggedMembersResponse(
        members=result["members"],
        total=result["total"]
    )
