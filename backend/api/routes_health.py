"""
Health check endpoints.
"""

from datetime import datetime
from fastapi import APIRouter
from backend.ml.model_loader import get_model
from backend.config import DATABASE_PATH, PIPELINE_PATH

router = APIRouter(tags=["Health"])


@router.get("/health")
def get_health():
    model = get_model()
    # If not loaded, attempt a reload
    if not model.is_loaded:
        model.load()

    db_connected = DATABASE_PATH.parent.exists()
    dataset_source = model.metrics.get("dataset_source", "unknown") if model.is_loaded else "uninitialized"
    
    return {
        "status": "healthy" if model.is_loaded else "degraded",
        "model_loaded": model.is_loaded,
        "database_connected": db_connected,
        "dataset_source": dataset_source,
        "pipeline_path": str(PIPELINE_PATH),
        "pipeline_exists": PIPELINE_PATH.exists(),
        "load_error": getattr(model, "_last_error", None),
        "timestamp": datetime.now().isoformat()
    }
