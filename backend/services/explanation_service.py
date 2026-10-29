"""
Explanation Service for Intelligent Loan Risk Assessment.
Computes contextual feature contributions and maps model feature importances
without making unsubstantiated causal claims.
"""

from typing import List, Dict, Any
import numpy as np
from backend.ml.model_loader import get_model


FEATURE_METADATA = {
    "LOAN_INCOME_RATIO": {
        "display_name": "Loan to Income Ratio",
        "description": "Ratio of requested credit amount relative to annual declared income.",
        "high_risk_threshold": 3.5,
        "low_risk_threshold": 2.0,
        "format": lambda v: f"{v:.2f}x"
    },
    "DEBT_TO_INCOME_RATIO": {
        "display_name": "Bureau Debt to Income Ratio",
        "description": "Total outstanding debt from all credit bureau accounts relative to annual income.",
        "high_risk_threshold": 0.50,
        "low_risk_threshold": 0.20,
        "format": lambda v: f"{v*100:.1f}%"
    },
    "OVERDUE_TO_INCOME_RATIO": {
        "display_name": "Overdue to Income Ratio",
        "description": "Current overdue delinquency obligations relative to annual income.",
        "high_risk_threshold": 0.05,
        "low_risk_threshold": 0.0,
        "format": lambda v: f"{v*100:.2f}%"
    },
    "AVG_CREDIT_DAY_OVERDUE": {
        "display_name": "Average Days Overdue (Bureau)",
        "description": "Average duration of payment delays across historical credit lines.",
        "high_risk_threshold": 15.0,
        "low_risk_threshold": 0.0,
        "format": lambda v: f"{v:.1f} days"
    },
    "TOTAL_BUREAU_DEBT": {
        "display_name": "Total Outstanding Bureau Debt",
        "description": "Aggregate active unpaid balance across prior bank and financial credits.",
        "high_risk_threshold": 300000.0,
        "low_risk_threshold": 50000.0,
        "format": lambda v: f"₹{v:,.0f}"
    },
    "INCOME_PER_PERSON": {
        "display_name": "Income Per Family Member",
        "description": "Total annual income divided by family member count.",
        "high_risk_threshold": 40000.0,
        "low_risk_threshold": 100000.0,
        "higher_is_better": True,
        "format": lambda v: f"₹{v:,.0f}"
    },
    "EMPLOYMENT_YEARS": {
        "display_name": "Employment Duration",
        "description": "Continuous documented years at current or recent employment.",
        "high_risk_threshold": 1.0,
        "low_risk_threshold": 4.0,
        "higher_is_better": True,
        "format": lambda v: f"{v:.1f} yrs"
    },
    "ACTIVE_LOAN_COUNT": {
        "display_name": "Active Credit Lines",
        "description": "Number of currently active external credit accounts reported in bureau.",
        "high_risk_threshold": 4.0,
        "low_risk_threshold": 1.0,
        "format": lambda v: f"{int(v)} active"
    },
    "CREDIT_ANNUITY_RATIO": {
        "display_name": "Credit to Annuity Ratio",
        "description": "Total loan principal relative to scheduled annuity payment terms.",
        "high_risk_threshold": 22.0,
        "low_risk_threshold": 12.0,
        "format": lambda v: f"{v:.1f}"
    }
}


def explain_applicant_assessment(applicant_features: Dict[str, Any]) -> List[Dict[str, Any]]:
    """
    Produce an explainability breakdown for the specific applicant based on 
    the model's trained feature weights and the applicant's financial attributes.
    """
    model_registry = get_model()
    global_importance_map = {}
    
    if model_registry.feature_importance and "top_features" in model_registry.feature_importance:
        for item in model_registry.feature_importance["top_features"]:
            global_importance_map[item["feature"]] = item["importance"]

    key_factors = []

    for feat_key, meta in FEATURE_METADATA.items():
        val = applicant_features.get(feat_key)
        if val is None:
            continue
        try:
            val_float = float(val)
        except (ValueError, TypeError):
            continue

        weight = global_importance_map.get(feat_key, 0.05)
        higher_is_better = meta.get("higher_is_better", False)
        high_th = meta["high_risk_threshold"]
        low_th = meta["low_risk_threshold"]

        if higher_is_better:
            if val_float <= high_th:
                impact = "Elevated Risk"
            elif val_float >= low_th:
                impact = "Favorable Indicator"
            else:
                impact = "Moderate Risk"
        else:
            if val_float >= high_th and high_th > 0:
                impact = "Elevated Risk"
            elif val_float <= low_th:
                impact = "Favorable Indicator"
            else:
                impact = "Moderate Risk"

        formatted_val = meta["format"](val_float) if "format" in meta else str(val_float)

        key_factors.append({
            "feature": feat_key,
            "display_name": meta["display_name"],
            "value": formatted_val,
            "raw_value": val_float,
            "impact": impact,
            "importance_weight": round(weight, 5),
            "description": meta["description"]
        })

    # Sort primarily by model importance weight descending
    key_factors.sort(key=lambda x: x["importance_weight"], reverse=True)
    return key_factors[:7]
