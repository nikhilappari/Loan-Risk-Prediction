"""
Model Loader Singleton for Intelligent Loan Risk Assessment.
Handles loading, caching, and introspection of the trained scikit-learn pipeline.
"""

import os
import json
import logging
from typing import Optional, Dict, Any, Tuple
import joblib

from backend.config import PIPELINE_PATH, METRICS_PATH, IMPORTANCE_PATH

logger = logging.getLogger(__name__)


class ModelRegistry:
    _instance = None
    _pipeline = None
    _metrics = None
    _feature_importance = None
    _is_loaded = False
    _last_error = None

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = cls()
            cls._instance.load()
        return cls._instance

    def load(self):
        try:
            if not os.path.exists(PIPELINE_PATH):
                logger.warning(f"Pipeline artifact not found at {PIPELINE_PATH}")
                self._is_loaded = False
                return

            logger.info(f"Loading pipeline from {PIPELINE_PATH}...")
            self._pipeline = joblib.load(PIPELINE_PATH)
            
            if os.path.exists(METRICS_PATH):
                with open(METRICS_PATH, "r") as f:
                    self._metrics = json.load(f)
            else:
                self._metrics = {}

            if os.path.exists(IMPORTANCE_PATH):
                with open(IMPORTANCE_PATH, "r") as f:
                    self._feature_importance = json.load(f)
            else:
                self._feature_importance = {}

            self._is_loaded = True
            logger.info("Pipeline and metrics loaded successfully.")
        except Exception as e:
            self._last_error = f"{type(e).__name__}: {str(e)}"
            logger.error(f"Error loading model artifacts: {e}", exc_info=True)
            self._is_loaded = False

    @property
    def is_loaded(self) -> bool:
        return self._is_loaded and self._pipeline is not None

    @property
    def pipeline(self):
        return self._pipeline

    @property
    def metrics(self) -> Dict[str, Any]:
        if os.path.exists(METRICS_PATH):
            try:
                with open(METRICS_PATH, "r") as f:
                    self._metrics = json.load(f)
            except Exception:
                pass
        return self._metrics or {}

    @property
    def feature_importance(self) -> Dict[str, Any]:
        if os.path.exists(IMPORTANCE_PATH):
            try:
                with open(IMPORTANCE_PATH, "r") as f:
                    self._feature_importance = json.load(f)
            except Exception:
                pass
        return self._feature_importance or {}


def get_model():
    return ModelRegistry.get_instance()
