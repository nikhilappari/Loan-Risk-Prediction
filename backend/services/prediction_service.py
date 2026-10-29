"""
Prediction Service for Intelligent Loan Risk Assessment.
Executes inference via the trained Random Forest pipeline, classifies risk tiers,
generates explainability factors, and records assessments.
"""

import uuid
from datetime import datetime
from typing import Dict, Any, List, Optional
import pandas as pd
import numpy as np

from backend.ml.model_loader import get_model
from backend.services.feature_service import build_inference_dataframe
from backend.services.explanation_service import explain_applicant_assessment
from backend.database import save_assessment


def classify_risk(prob: float) -> tuple[str, str, str]:
    """
    Map estimated default probability to risk category, assessment, and reviewer recommendation.
    """
    if prob < 0.35:
        category = "LOWER RISK"
        assessment = (
            "Applicant demonstrates relatively lower predicted default risk based on supplied financial "
            "and bureau credit history indicators."
        )
        recommendation = (
            "Recommended for standard expedited underwriter review. Confirm documented employment "
            "and income verification prior to loan origination."
        )
    elif prob < 0.60:
        category = "MODERATE RISK"
        assessment = (
            "Applicant demonstrates moderate predicted default risk. Balanced financial ratios but "
            "with factors that warrant secondary verification."
        )
        recommendation = (
            "Recommended for comprehensive underwriter review. Review historical bureau debt lines, "
            "collateral value, and debt-to-income limits."
        )
    else:
        category = "HIGHER RISK"
        assessment = (
            "Applicant exhibits elevated default risk indicators, influenced by debt burden, loan-to-income "
            "ratios, or historical credit payment patterns."
        )
        recommendation = (
            "Recommended for senior credit committee review or structured mitigation (e.g., lower loan principal, "
            "extended amortization, or additional guarantor/collateral)."
        )
        
    return category, assessment, recommendation


def predict_single_applicant(applicant_dict: Dict[str, Any]) -> Dict[str, Any]:
    """
    Perform single applicant risk inference through trained Random Forest pipeline.
    """
    model_registry = get_model()
    if not model_registry.is_loaded:
        raise RuntimeError("Model pipeline is not loaded. Train the model using 'python ml/train_model.py' first.")

    pipeline = model_registry.pipeline
    
    # 1. Feature Engineering & DataFrame building
    inference_df, derived_indicators = build_inference_dataframe(applicant_dict)

    # 2. Run Random Forest inference
    probabilities = pipeline.predict_proba(inference_df)
    # Binary classification: index 1 is probability of default (TARGET=1)
    risk_prob = float(probabilities[0][1])
    risk_pct = round(risk_prob * 100, 1)

    # 3. Categorization & Human Review recommendation
    risk_cat, assessment_text, recommendation = classify_risk(risk_prob)

    # Confidence calculation based on probability distance from decision boundary (0.50)
    certainty = abs(risk_prob - 0.50) * 2
    if certainty > 0.60:
        confidence = "High Model Certainty"
    elif certainty > 0.30:
        confidence = "Moderate Model Certainty"
    else:
        confidence = "Close to Decision Threshold"

    # 4. Feature factors explanation
    # Combine raw applicant data with derived indicators for factor evaluation
    eval_dict = dict(applicant_dict)
    eval_dict.update({
        "LOAN_INCOME_RATIO": derived_indicators["loan_income_ratio"],
        "CREDIT_ANNUITY_RATIO": derived_indicators["credit_annuity_ratio"],
        "INCOME_PER_PERSON": derived_indicators["income_per_person"],
        "DEBT_TO_INCOME_RATIO": derived_indicators["debt_to_income_ratio"],
        "OVERDUE_TO_INCOME_RATIO": derived_indicators["overdue_to_income_ratio"],
        "AGE_YEARS": derived_indicators["age_years"],
        "EMPLOYMENT_YEARS": derived_indicators["employment_years"],
        "TOTAL_BUREAU_DEBT": applicant_dict.get("total_bureau_debt", 0.0),
        "AVG_CREDIT_DAY_OVERDUE": applicant_dict.get("avg_credit_day_overdue", 0.0),
        "ACTIVE_LOAN_COUNT": applicant_dict.get("active_loan_count", 0.0)
    })
    key_factors = explain_applicant_assessment(eval_dict)

    # 5. Persist to SQLite
    assessment_id = f"ASM-{uuid.uuid4().hex[:8].upper()}"
    applicant_name = applicant_dict.get("applicant_name") or "Applicant"
    applicant_ref = applicant_dict.get("applicant_ref") or f"APP-{uuid.uuid4().hex[:6].upper()}"
    now_iso = datetime.now().isoformat()
    model_version = model_registry.metrics.get("model_name", "Random Forest Classifier")

    try:
        save_assessment(
            assessment_id=assessment_id,
            applicant_name=applicant_name,
            applicant_ref=applicant_ref,
            loan_amount=float(applicant_dict["amt_credit"]),
            annual_income=float(applicant_dict["amt_income_total"]),
            risk_probability=round(risk_prob, 4),
            risk_category=risk_cat,
            model_version=model_version,
            key_factors=key_factors
        )
    except Exception as e:
        # Database persistence failure should not block returning the decision support response
        pass

    return {
        "assessment_id": assessment_id,
        "applicant_name": applicant_name,
        "applicant_ref": applicant_ref,
        "risk_probability": round(risk_prob, 4),
        "risk_percentage": risk_pct,
        "risk_category": risk_cat,
        "confidence_level": confidence,
        "assessment": assessment_text,
        "human_review_required": True,
        "human_review_notice": (
            "This assessment is intended to support financial review. It does not automatically approve "
            "or reject a loan application. A qualified human financial officer must consider all "
            "supplementary applicant circumstances before making any lending commitment."
        ),
        "recommendation": recommendation,
        "key_factors": key_factors,
        "derived_indicators": derived_indicators,
        "timestamp": now_iso,
        "model_version": model_version
    }


def predict_batch_records(records: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Perform batch inference on a list of applicant dictionaries.
    """
    model_registry = get_model()
    if not model_registry.is_loaded:
        raise RuntimeError("Model pipeline is not loaded.")

    results = []
    lower_cnt = 0
    mod_cnt = 0
    high_cnt = 0

    for i, rec in enumerate(records):
        try:
            pred = predict_single_applicant(rec)
            cat = pred["risk_category"]
            if cat == "LOWER RISK":
                lower_cnt += 1
            elif cat == "MODERATE RISK":
                mod_cnt += 1
            else:
                high_cnt += 1

            top_factor_name = pred["key_factors"][0]["display_name"] if pred["key_factors"] else "N/A"

            results.append({
                "sk_id_curr": rec.get("sk_id_curr") or (100000 + i + 1),
                "applicant_name": pred.get("applicant_name", "Applicant"),
                "applicant_ref": pred["applicant_ref"],
                "risk_probability": pred["risk_probability"],
                "risk_percentage": pred["risk_percentage"],
                "risk_category": cat,
                "human_review_required": True,
                "top_factor": top_factor_name
            })
        except Exception as e:
            continue

    return {
        "total_processed": len(results),
        "lower_risk_count": lower_cnt,
        "moderate_risk_count": mod_cnt,
        "higher_risk_count": high_cnt,
        "results": results
    }
