"""
Configuration settings for Loan Risk Assessment Backend.
"""

import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

DATA_DIR = Path(os.getenv("DATA_DIR", BASE_DIR / "data"))
MODEL_DIR = Path(os.getenv("MODEL_DIR", BASE_DIR / "model"))
DATABASE_DIR = Path(os.getenv("DATABASE_DIR", BASE_DIR / "database"))

PIPELINE_PATH = MODEL_DIR / "loan_risk_pipeline.joblib"
METRICS_PATH = MODEL_DIR / "metrics.json"
IMPORTANCE_PATH = MODEL_DIR / "feature_importance.json"
DATABASE_PATH = DATABASE_DIR / "loan_assessments.db"

CORS_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "*"
]
