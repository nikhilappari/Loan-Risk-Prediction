"""
Main FastAPI Application for Intelligent Loan Risk Assessment System.
"""

import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.config import CORS_ORIGINS
from backend.database import init_db
from backend.ml.model_loader import ModelRegistry
from backend.api.routes_health import router as health_router
from backend.api.routes_model import router as model_router
from backend.api.routes_prediction import router as prediction_router
from backend.api.routes_history import router as history_router

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("loan_risk_system")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup actions
    logger.info("Initializing database...")
    init_db()
    logger.info("Loading machine learning model pipeline...")
    registry = ModelRegistry.get_instance()
    if registry.is_loaded:
        logger.info(f"Model successfully loaded. Source: {registry.metrics.get('dataset_source', 'N/A')}")
    else:
        logger.warning("Model not found or failed to load. Run 'python ml/train_model.py' to generate artifacts.")
    yield
    # Shutdown actions
    logger.info("Shutting down Intelligent Loan Risk Assessment backend.")


app = FastAPI(
    title="INTELLIGENT LOAN RISK ASSESSMENT SYSTEM",
    description="Machine-learning-based loan default risk assessment and decision-support system.",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers
app.include_router(health_router, prefix="/api")
app.include_router(model_router, prefix="/api")
app.include_router(prediction_router, prefix="/api")
app.include_router(history_router, prefix="/api")


@app.get("/")
def root():
    registry = ModelRegistry.get_instance()
    return {
        "system": "INTELLIGENT LOAN RISK ASSESSMENT SYSTEM",
        "purpose": "Decision-support credit risk prediction for human financial officers",
        "status": "online",
        "model_loaded": registry.is_loaded,
        "docs_url": "/docs",
        "human_review_required": True
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="127.0.0.1", port=8000, reload=True)
