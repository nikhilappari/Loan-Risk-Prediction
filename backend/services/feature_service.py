"""
Feature Service for preparing inference DataFrames with exact required engineered ratios.
"""

from typing import Dict, Any, List, Tuple
import numpy as np
import pandas as pd


def safe_divide(numerator: float, denominator: float, default: float = 0.0) -> float:
    """Safely divide numerator by denominator with zero protection."""
    if denominator is not None and denominator > 0:
        return float(numerator / max(denominator, 1e-7))
    return float(default)



def build_inference_dataframe(applicant_data: Dict[str, Any]) -> Tuple[pd.DataFrame, Dict[str, float]]:
    """
    Transforms applicant payload into model input DataFrame with exact engineered ratios.
    
    Exact required formulas:
    - LOAN_INCOME_RATIO = AMT_CREDIT / AMT_INCOME_TOTAL
    - CREDIT_ANNUITY_RATIO = AMT_CREDIT / AMT_ANNUITY
    - INCOME_PER_PERSON = AMT_INCOME_TOTAL / CNT_FAM_MEMBERS
    - AGE_YEARS = abs(DAYS_BIRTH) / 365.25
    - EMPLOYMENT_YEARS = abs(DAYS_EMPLOYED) / 365.25
    - DEBT_TO_INCOME_RATIO = TOTAL_BUREAU_DEBT / AMT_INCOME_TOTAL
    - OVERDUE_TO_INCOME_RATIO = TOTAL_OVERDUE_AMOUNT / AMT_INCOME_TOTAL
    """
    # Raw values
    income = float(applicant_data["amt_income_total"])
    credit = float(applicant_data["amt_credit"])
    annuity = float(applicant_data["amt_annuity"])
    fam_members = max(1.0, float(applicant_data.get("cnt_fam_members", 1)))
    
    age_years = float(applicant_data.get("age_years", 35.0))
    days_birth = - (age_years * 365.25)
    
    emp_years = float(applicant_data.get("employment_years", 3.0))
    days_employed = - (emp_years * 365.25)
    
    total_debt = float(applicant_data.get("total_bureau_debt", 0.0))
    total_overdue = float(applicant_data.get("total_overdue_amount", 0.0))
    max_overdue = float(applicant_data.get("max_overdue_amount", 0.0))
    avg_days_overdue = float(applicant_data.get("avg_credit_day_overdue", 0.0))
    prev_loans = float(applicant_data.get("prev_loan_count", 0.0))
    active_loans = float(applicant_data.get("active_loan_count", 0.0))
    total_bureau_credit = float(applicant_data.get("total_bureau_credit", 0.0))
    avg_bureau_credit = float(applicant_data.get("avg_bureau_credit", 0.0))

    # Exact Feature Engineering with safe zero protection
    loan_income_ratio = safe_divide(credit, income)
    credit_annuity_ratio = safe_divide(credit, annuity)
    income_per_person = safe_divide(income, fam_members)
    debt_to_income_ratio = safe_divide(total_debt, income)
    overdue_to_income_ratio = safe_divide(total_overdue, income)

    derived_indicators = {
        "loan_income_ratio": round(float(loan_income_ratio), 4),
        "credit_annuity_ratio": round(float(credit_annuity_ratio), 4),
        "income_per_person": round(float(income_per_person), 2),
        "debt_to_income_ratio": round(float(debt_to_income_ratio), 4),
        "overdue_to_income_ratio": round(float(overdue_to_income_ratio), 4),
        "age_years": round(float(age_years), 1),
        "employment_years": round(float(emp_years), 1)
    }

    row_data = {
        "CODE_GENDER": str(applicant_data.get("code_gender", "M")),
        "FLAG_OWN_CAR": str(applicant_data.get("flag_own_car", "N")),
        "FLAG_OWN_REALTY": str(applicant_data.get("flag_own_realty", "Y")),
        "CNT_FAM_MEMBERS": fam_members,
        "AMT_INCOME_TOTAL": income,
        "AMT_CREDIT": credit,
        "AMT_ANNUITY": annuity,
        "NAME_INCOME_TYPE": str(applicant_data.get("name_income_type", "Working")),
        "NAME_EDUCATION_TYPE": str(applicant_data.get("name_education_type", "Secondary / secondary special")),
        "NAME_FAMILY_STATUS": str(applicant_data.get("name_family_status", "Married")),
        "DAYS_BIRTH": days_birth,
        "DAYS_EMPLOYED": days_employed,
        "OCCUPATION_TYPE": str(applicant_data.get("occupation_type", "Laborers")),
        "PREV_LOAN_COUNT": prev_loans,
        "ACTIVE_LOAN_COUNT": active_loans,
        "TOTAL_BUREAU_CREDIT": total_bureau_credit,
        "AVG_BUREAU_CREDIT": avg_bureau_credit,
        "TOTAL_OVERDUE_AMOUNT": total_overdue,
        "MAX_OVERDUE_AMOUNT": max_overdue,
        "AVG_CREDIT_DAY_OVERDUE": avg_days_overdue,
        "TOTAL_BUREAU_DEBT": total_debt,
        "LOAN_INCOME_RATIO": loan_income_ratio,
        "CREDIT_ANNUITY_RATIO": credit_annuity_ratio,
        "INCOME_PER_PERSON": income_per_person,
        "AGE_YEARS": age_years,
        "EMPLOYMENT_YEARS": emp_years,
        "DEBT_TO_INCOME_RATIO": debt_to_income_ratio,
        "OVERDUE_TO_INCOME_RATIO": overdue_to_income_ratio
    }

    df = pd.DataFrame([row_data])
    return df, derived_indicators


def build_batch_inference_dataframe(records: List[Dict[str, Any]]) -> pd.DataFrame:
    """
    Transforms multiple applicant dictionaries into a batch DataFrame.
    """
    rows = []
    for item in records:
        df, _ = build_inference_dataframe(item)
        rows.append(df.iloc[0])
    return pd.DataFrame(rows)
