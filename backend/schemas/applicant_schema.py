"""
Pydantic schemas for applicant loan data validation.
"""

from typing import Optional, Literal
from pydantic import BaseModel, Field, field_validator


class ApplicantInput(BaseModel):
    applicant_name: Optional[str] = Field(default="Applicant", description="Applicant full legal name")
    applicant_ref: Optional[str] = Field(default="APP-REF-NEW", description="Applicant external reference or ID")

    # Personal Information
    age_years: float = Field(..., ge=18, le=100, description="Age in years (between 18 and 100)")
    code_gender: Literal["M", "F", "XNA"] = Field(..., description="Gender (M, F, XNA)")
    cnt_fam_members: int = Field(..., ge=1, le=20, description="Count of family members (at least 1)")
    name_family_status: str = Field(..., description="Family status")
    name_education_type: str = Field(..., description="Education level")
    name_income_type: str = Field(..., description="Income type")
    occupation_type: Optional[str] = Field(default="Laborers", description="Occupation category")

    # Financial Information
    amt_income_total: float = Field(..., gt=0, description="Total annual income (must be > 0)")
    amt_credit: float = Field(..., gt=0, description="Requested credit / loan amount (must be > 0)")
    amt_annuity: float = Field(..., gt=0, description="Loan annuity / regular payment (must be > 0)")
    employment_years: float = Field(..., ge=0, le=70, description="Duration of employment in years")
    flag_own_car: Literal["Y", "N"] = Field(default="N", description="Car ownership")
    flag_own_realty: Literal["Y", "N"] = Field(default="Y", description="Real estate / property ownership")

    # Bureau / Credit History (Defaults to 0 for applicants with no prior credit history)
    prev_loan_count: int = Field(default=0, ge=0, description="Total count of prior credit accounts")
    active_loan_count: int = Field(default=0, ge=0, description="Count of currently active loans")
    total_bureau_credit: float = Field(default=0.0, ge=0, description="Total previous credit amount across accounts")
    avg_bureau_credit: float = Field(default=0.0, ge=0, description="Average previous credit account amount")
    total_bureau_debt: float = Field(default=0.0, ge=0, description="Total outstanding debt across bureau records")
    total_overdue_amount: float = Field(default=0.0, ge=0, description="Total overdue amount on previous loans")
    max_overdue_amount: float = Field(default=0.0, ge=0, description="Maximum single overdue amount recorded")
    avg_credit_day_overdue: float = Field(default=0.0, ge=0, description="Average days overdue across bureau credits")

    @field_validator("amt_credit")
    @classmethod
    def validate_credit(cls, v):
        if v <= 0:
            raise ValueError("Loan amount must be strictly greater than 0.")
        return v

    @field_validator("amt_income_total")
    @classmethod
    def validate_income(cls, v):
        if v <= 0:
            raise ValueError("Annual income must be strictly greater than 0.")
        return v

    @field_validator("amt_annuity")
    @classmethod
    def validate_annuity(cls, v, values):
        if v <= 0:
            raise ValueError("Annuity must be strictly greater than 0.")
        return v


class BatchApplicantItem(BaseModel):
    sk_id_curr: Optional[int] = None
    applicant_name: Optional[str] = "Applicant"
    applicant_ref: Optional[str] = None
    age_years: float
    code_gender: str
    cnt_fam_members: int
    name_family_status: str
    name_education_type: str
    name_income_type: str
    occupation_type: Optional[str] = "Laborers"
    amt_income_total: float
    amt_credit: float
    amt_annuity: float
    employment_years: float
    flag_own_car: str = "N"
    flag_own_realty: str = "Y"
    prev_loan_count: int = 0
    active_loan_count: int = 0
    total_bureau_credit: float = 0.0
    avg_bureau_credit: float = 0.0
    total_bureau_debt: float = 0.0
    total_overdue_amount: float = 0.0
    max_overdue_amount: float = 0.0
    avg_credit_day_overdue: float = 0.0
