"""
Health check endpoints.
"""

from datetime import datetime
from fastapi import APIRouter
from backend.ml.model_loader import get_model
from backend.config import DATABASE_PATH

router = APIRouter(tags=["Health"])


@router.get("/health")
def get_health():
    model = get_model()
    db_connected = DATABASE_PATH.parent.exists()
    dataset_source = model.metrics.get("dataset_source", "unknown") if model.is_loaded else "uninitialized"
    
    return {
        "status": "healthy" if model.is_loaded else "degraded",
        "model_loaded": model.is_loaded,
        "database_connected": db_connected,
        "dataset_source": dataset_source,
        "timestamp": datetime.now().isoformat()
    }
