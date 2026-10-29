"""
Prediction history API routes.
"""

from typing import Optional, List
from fastapi import APIRouter, Query, HTTPException
from backend.database import get_assessments, get_assessment_by_id

router = APIRouter(tags=["History"])


@router.get("/history")
def list_history(
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    risk_category: Optional[str] = Query(None),
    min_prob: Optional[float] = Query(None, ge=0.0, le=1.0),
    max_prob: Optional[float] = Query(None, ge=0.0, le=1.0)
):
    """
    Query saved historical assessments with optional risk tier and probability range filters.
    """
    items = get_assessments(
        limit=limit,
        offset=offset,
        risk_category=risk_category,
        min_prob=min_prob,
        max_prob=max_prob
    )
    return {
        "total": len(items),
        "items": items
    }


@router.get("/history/{assessment_id}")
def get_single_history(assessment_id: str):
    """
    Retrieve single historical assessment report by assessment ID.
    """
    item = get_assessment_by_id(assessment_id)
    if not item:
        raise HTTPException(status_code=404, detail=f"Assessment '{assessment_id}' not found.")
    return item
