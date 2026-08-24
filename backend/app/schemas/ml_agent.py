from typing import List, Any, Dict
from pydantic import BaseModel


class PatientIDList(BaseModel):
    patient_ids: List[str]


class MLAgentResponse(BaseModel):
    success: bool
    data: Dict[str, Any]
    message: str = ""


class FlaggedMembersResponse(BaseModel):
    members: List[Dict[str, Any]]
    total: int


class UnflaggedMembersResponse(BaseModel):
    members: List[Dict[str, Any]]
    total: int