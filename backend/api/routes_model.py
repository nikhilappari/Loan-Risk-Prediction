"""
Model metadata, performance metrics, and feature importance endpoints.
"""

from fastapi import APIRouter, HTTPException
from backend.ml.model_loader import get_model

router = APIRouter(tags=["Model"])


@router.get("/model-info")
def get_model_info():
    model = get_model()
    if not model.is_loaded:
        raise HTTPException(
            status_code=503,
            detail="Model is not trained or loaded. Run 'python ml/train_model.py' to generate artifacts."
        )
    return model.metrics


@router.get("/metrics")
def get_metrics():
    model = get_model()
    if not model.is_loaded:
        raise HTTPException(
            status_code=503,
            detail="Model is not trained or loaded. Run 'python ml/train_model.py' to generate artifacts."
        )
    return {
        "model_name": model.metrics.get("model_name"),
        "model_type": model.metrics.get("model_type"),
        "dataset_source": model.metrics.get("dataset_source"),
        "is_synthetic": model.metrics.get("is_synthetic", False),
        "evaluation": model.metrics.get("evaluation", {}),
        "train_samples": model.metrics.get("train_samples", 0),
        "test_samples": model.metrics.get("test_samples", 0),
        "training_timestamp": model.metrics.get("training_timestamp")
    }


@router.get("/feature-importance")
def get_feature_importance():
    model = get_model()
    if not model.is_loaded:
        raise HTTPException(
            status_code=503,
            detail="Model is not trained or loaded."
        )
    return model.feature_importance


@router.get("/model-comparison")
def get_model_comparison():
    import json
    import os
    comp_path = os.path.join("model", "model_comparison.json")
    if os.path.exists(comp_path):
        try:
            with open(comp_path, "r") as f:
                return json.load(f)
        except Exception:
            pass
    return []


@router.get("/download/preprocessed-data")
def download_preprocessed_data():
    import os
    from fastapi.responses import FileResponse
    path = os.path.join("data", "preprocessed_loan_data.csv")
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail="preprocessed_loan_data.csv not found.")
    return FileResponse(
        path,
        media_type="text/csv",
        filename="preprocessed_loan_data.csv"
    )


@router.get("/download/preprocessed-scaled")
def download_preprocessed_scaled():
    import os
    from fastapi.responses import FileResponse
    path = os.path.join("data", "preprocessed_features_scaled.csv")
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail="preprocessed_features_scaled.csv not found.")
    return FileResponse(
        path,
        media_type="text/csv",
        filename="preprocessed_features_scaled.csv"
    )


@router.get("/download/batch-template")
def download_batch_template():
    import os
    from fastapi.responses import FileResponse
    path = os.path.join("data", "loan_risk_batch_template.csv")
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail="loan_risk_batch_template.csv not found.")
    return FileResponse(
        path,
        media_type="text/csv",
        filename="loan_risk_batch_template.csv"
    )

