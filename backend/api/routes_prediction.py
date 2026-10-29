"""
Prediction API routes for single applicant assessment and CSV batch assessment.
"""

import io
import csv
import pandas as pd
from typing import List, Optional
from fastapi import APIRouter, HTTPException, UploadFile, File, status
from backend.schemas.applicant_schema import ApplicantInput
from backend.schemas.response_schema import RiskAssessmentResponse, BatchPredictionResponse
from backend.services.prediction_service import predict_single_applicant, predict_batch_records
from backend.utils.validation import sanitize_applicant_input

router = APIRouter(tags=["Prediction"])


@router.post("/predict", response_model=RiskAssessmentResponse)
def predict_applicant(applicant: ApplicantInput):
    """
    Evaluates loan default risk for an applicant using trained Random Forest pipeline.
    Returns estimated default probability, risk tier, local feature weights, and human review recommendation.
    """
    try:
        sanitized = sanitize_applicant_input(applicant.model_dump())
        result = predict_single_applicant(sanitized)
        return result
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(ve))
    except RuntimeError as re:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(re))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Prediction evaluation failed: {str(e)}")


@router.post("/batch-predict", response_model=BatchPredictionResponse)
async def batch_predict_csv(file: UploadFile = File(...)):
    """
    Upload a CSV file containing applicant records to perform batch loan risk assessment.
    """
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are accepted.")

    try:
        content = await file.read()
        df = pd.read_csv(io.StringIO(content.decode("utf-8", errors="replace")))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to read CSV: {str(e)}")

    if df.empty:
        raise HTTPException(status_code=400, detail="Uploaded CSV file is empty.")

    # Normalize column names to lowercase
    col_map = {c: c.strip().lower() for c in df.columns}
    df = df.rename(columns=col_map)

    # Required baseline financial columns
    req_cols = ["amt_income_total", "amt_credit", "amt_annuity"]
    missing = [c for c in req_cols if c not in df.columns]
    if missing:
        raise HTTPException(
            status_code=400,
            detail=f"CSV is missing required financial columns: {', '.join(missing)}"
        )

    records = []
    for idx, row in df.iterrows():
        # Handle Days to Years if provided in raw Home Credit days format
        age_years = 35.0
        if "age_years" in row and pd.notna(row["age_years"]):
            age_years = float(row["age_years"])
        elif "days_birth" in row and pd.notna(row["days_birth"]):
            age_years = abs(float(row["days_birth"])) / 365.25

        emp_years = 3.0
        if "employment_years" in row and pd.notna(row["employment_years"]):
            emp_years = float(row["employment_years"])
        elif "days_employed" in row and pd.notna(row["days_employed"]):
            d_emp = float(row["days_employed"])
            emp_years = 0.0 if d_emp == 365243 or d_emp > 0 else abs(d_emp) / 365.25

        rec = {
            "sk_id_curr": int(row["sk_id_curr"]) if "sk_id_curr" in row and pd.notna(row["sk_id_curr"]) else (100000 + idx + 1),
            "applicant_ref": str(row.get("applicant_ref") or f"APP-{100000 + idx + 1}"),
            "age_years": age_years,
            "code_gender": str(row.get("code_gender", "M")),
            "cnt_fam_members": int(row.get("cnt_fam_members", 1)) if pd.notna(row.get("cnt_fam_members")) else 1,
            "name_family_status": str(row.get("name_family_status", "Married")),
            "name_education_type": str(row.get("name_education_type", "Secondary / secondary special")),
            "name_income_type": str(row.get("name_income_type", "Working")),
            "occupation_type": str(row.get("occupation_type", "Laborers")),
            "amt_income_total": float(row["amt_income_total"]),
            "amt_credit": float(row["amt_credit"]),
            "amt_annuity": float(row["amt_annuity"]),
            "employment_years": emp_years,
            "flag_own_car": str(row.get("flag_own_car", "N")),
            "flag_own_realty": str(row.get("flag_own_realty", "Y")),
            "prev_loan_count": int(row.get("prev_loan_count", 0)) if pd.notna(row.get("prev_loan_count")) else 0,
            "active_loan_count": int(row.get("active_loan_count", 0)) if pd.notna(row.get("active_loan_count")) else 0,
            "total_bureau_credit": float(row.get("total_bureau_credit", 0.0)) if pd.notna(row.get("total_bureau_credit")) else 0.0,
            "avg_bureau_credit": float(row.get("avg_bureau_credit", 0.0)) if pd.notna(row.get("avg_bureau_credit")) else 0.0,
            "total_bureau_debt": float(row.get("total_bureau_debt", 0.0)) if pd.notna(row.get("total_bureau_debt")) else 0.0,
            "total_overdue_amount": float(row.get("total_overdue_amount", 0.0)) if pd.notna(row.get("total_overdue_amount")) else 0.0,
            "max_overdue_amount": float(row.get("max_overdue_amount", 0.0)) if pd.notna(row.get("max_overdue_amount")) else 0.0,
            "avg_credit_day_overdue": float(row.get("avg_credit_day_overdue", 0.0)) if pd.notna(row.get("avg_credit_day_overdue")) else 0.0
        }
        records.append(rec)

    batch_response = predict_batch_records(records)
    return batch_response
