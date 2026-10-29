"""
Response schemas for loan risk prediction, metrics, and health status.
"""

from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field


class KeyFactorItem(BaseModel):
    feature: str
    display_name: str
    value: Any
    impact: str  # "Elevated Risk", "Moderate Risk", "Favorable Indicator", "Neutral"
    importance_weight: float
    description: str


class DerivedIndicators(BaseModel):
    loan_income_ratio: float
    credit_annuity_ratio: float
    income_per_person: float
    debt_to_income_ratio: float
    overdue_to_income_ratio: float
    age_years: float
    employment_years: float


class RiskAssessmentResponse(BaseModel):
    assessment_id: str
    applicant_name: Optional[str] = "Applicant"
    applicant_ref: str
    risk_probability: float = Field(..., description="Estimated probability of default (0.00 to 1.00)")
    risk_percentage: float = Field(..., description="Estimated default risk percentage (0% to 100%)")
    risk_category: str = Field(..., description="Risk category: LOWER RISK, MODERATE RISK, or HIGHER RISK")
    confidence_level: str = Field(..., description="Confidence tier based on model certainty")
    assessment: str
    human_review_required: bool = True
    human_review_notice: str
    recommendation: str
    key_factors: List[KeyFactorItem]
    derived_indicators: DerivedIndicators
    timestamp: str
    model_version: str


class BatchPredictionItem(BaseModel):
    sk_id_curr: Optional[int] = None
    applicant_name: Optional[str] = "Applicant"
    applicant_ref: str
    risk_probability: float
    risk_category: str
    human_review_required: bool = True
    top_factor: str


class BatchPredictionResponse(BaseModel):
    total_processed: int
    lower_risk_count: int
    moderate_risk_count: int
    higher_risk_count: int
    results: List[BatchPredictionItem]


class HealthResponse(BaseModel):
    status: str
    model_loaded: bool
    database_connected: bool
    dataset_source: str
    timestamp: str


class ModelInfoResponse(BaseModel):
    model_name: str
    model_type: str
    dataset_source: str
    is_synthetic: bool
    training_timestamp: str
    train_samples: int
    test_samples: int
    total_samples: int
    raw_features_count: int
    transformed_features_count: int
    hyperparameters: Dict[str, Any]
    evaluation: Dict[str, Any]
