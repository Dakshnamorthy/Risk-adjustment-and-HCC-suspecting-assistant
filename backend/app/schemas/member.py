from pydantic import BaseModel, field_validator
from typing import Literal, Optional, Union


class MemberBase(BaseModel):
    patient_id: str  # Changed to string (e.g., "PT000001")
    age: int
    sex: str
    year: int
    calculated_hcc_codes: Optional[str] = None  # Can be float or string in DB
    calculated_risk_score: Optional[float] = None
    hcc_mapping_status: Optional[str] = None
    hcc_mapping_reason: Optional[str] = None
    flag_unflag_status: Optional[str] = None
    flag_reason: Optional[str] = None
    number_of_encounters: Optional[int] = None
    number_of_diagnoses: Optional[int] = None
    chronic_condition_count: Optional[int] = None

    @field_validator('calculated_hcc_codes', mode='before')
    @classmethod
    def convert_hcc_codes(cls, v):
        """Convert HCC codes to string if it's a number"""
        if v is None:
            return None
        if isinstance(v, (int, float)):
            return str(int(v))
        return str(v)


class MemberListResponse(BaseModel):
    total: int
    page: int
    page_size: int
    members: list[MemberBase]


class MemberDecisionRequest(BaseModel):
    status: Literal["ACCEPTED", "REJECTED"]
    source: Literal["AGENT", "ML"]
