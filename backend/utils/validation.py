"""
Validation and sanitization utilities for applicant financial data.
"""

from typing import Dict, Any, List

def sanitize_applicant_input(data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Sanitize and validate raw dictionary fields before feature engineering.
    """
    cleaned = dict(data)
    
    # Financial fields must be float and non-negative
    numeric_positive = ["amt_income_total", "amt_credit", "amt_annuity"]
    for field in numeric_positive:
        val = cleaned.get(field)
        if val is None or float(val) <= 0:
            raise ValueError(f"Field '{field}' must be strictly greater than 0.")
        cleaned[field] = float(val)

    numeric_nonneg = [
        "employment_years", "prev_loan_count", "active_loan_count",
        "total_bureau_credit", "avg_bureau_credit", "total_bureau_debt",
        "total_overdue_amount", "max_overdue_amount", "avg_credit_day_overdue"
    ]
    for field in numeric_nonneg:
        val = cleaned.get(field, 0.0)
        cleaned[field] = max(0.0, float(val) if val is not None else 0.0)

    # Demographic bounds
    age = float(cleaned.get("age_years", 30))
    if age < 18 or age > 100:
        raise ValueError(f"Age {age} is outside reasonable applicant bounds (18 - 100).")
    cleaned["age_years"] = age

    fam = int(cleaned.get("cnt_fam_members", 1))
    cleaned["cnt_fam_members"] = max(1, fam)

    # Categorical standards
    cleaned["code_gender"] = str(cleaned.get("code_gender", "M")).upper()
    cleaned["flag_own_car"] = str(cleaned.get("flag_own_car", "N")).upper()
    cleaned["flag_own_realty"] = str(cleaned.get("flag_own_realty", "Y")).upper()

    return cleaned
