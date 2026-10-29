"""
SQLite database setup and query helpers for prediction history.
"""

import sqlite3
import json
from datetime import datetime
from typing import List, Dict, Any, Optional
from backend.config import DATABASE_PATH, DATABASE_DIR

def init_db():
    DATABASE_DIR.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS assessments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            assessment_id TEXT UNIQUE NOT NULL,
            applicant_name TEXT DEFAULT 'Applicant',
            applicant_ref TEXT NOT NULL,
            timestamp TEXT NOT NULL,
            loan_amount REAL NOT NULL,
            annual_income REAL NOT NULL,
            risk_probability REAL NOT NULL,
            risk_category TEXT NOT NULL,
            model_version TEXT NOT NULL,
            key_factors_json TEXT NOT NULL,
            human_review_status TEXT DEFAULT 'PENDING_REVIEW',
            review_notes TEXT DEFAULT ''
        )
    """)
    conn.commit()
    # Migration safeguard for existing tables without applicant_name
    try:
        cursor.execute("ALTER TABLE assessments ADD COLUMN applicant_name TEXT DEFAULT 'Applicant'")
        conn.commit()
    except Exception:
        pass
    conn.close()

def save_assessment(
    assessment_id: str,
    applicant_ref: str,
    loan_amount: float,
    annual_income: float,
    risk_probability: float,
    risk_category: str,
    model_version: str,
    key_factors: List[Dict[str, Any]],
    applicant_name: str = "Applicant",
    review_status: str = "PENDING_REVIEW"
) -> Dict[str, Any]:
    init_db()
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()
    now_iso = datetime.now().isoformat()
    cursor.execute("""
        INSERT INTO assessments (
            assessment_id, applicant_name, applicant_ref, timestamp, loan_amount, annual_income,
            risk_probability, risk_category, model_version, key_factors_json, human_review_status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        assessment_id,
        applicant_name,
        applicant_ref,
        now_iso,
        loan_amount,
        annual_income,
        risk_probability,
        risk_category,
        model_version,
        json.dumps(key_factors),
        review_status
    ))
    conn.commit()
    conn.close()
    return {
        "assessment_id": assessment_id,
        "applicant_name": applicant_name,
        "applicant_ref": applicant_ref,
        "timestamp": now_iso,
        "loan_amount": loan_amount,
        "annual_income": annual_income,
        "risk_probability": risk_probability,
        "risk_category": risk_category,
        "model_version": model_version,
        "human_review_status": review_status
    }

def get_assessments(
    limit: int = 50,
    offset: int = 0,
    risk_category: Optional[str] = None,
    min_prob: Optional[float] = None,
    max_prob: Optional[float] = None
) -> List[Dict[str, Any]]:
    init_db()
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    query = "SELECT * FROM assessments WHERE 1=1"
    params = []

    if risk_category:
        query += " AND risk_category = ?"
        params.append(risk_category)
    if min_prob is not None:
        query += " AND risk_probability >= ?"
        params.append(min_prob)
    if max_prob is not None:
        query += " AND risk_probability <= ?"
        params.append(max_prob)

    query += " ORDER BY timestamp DESC LIMIT ? OFFSET ?"
    params.extend([limit, offset])

    cursor.execute(query, params)
    rows = cursor.fetchall()
    
    results = []
    for r in rows:
        col_names = r.keys()
        app_name = r["applicant_name"] if "applicant_name" in col_names and r["applicant_name"] else r["applicant_ref"]
        results.append({
            "id": r["id"],
            "assessment_id": r["assessment_id"],
            "applicant_name": app_name,
            "applicant_ref": r["applicant_ref"],
            "timestamp": r["timestamp"],
            "loan_amount": r["loan_amount"],
            "annual_income": r["annual_income"],
            "risk_probability": r["risk_probability"],
            "risk_category": r["risk_category"],
            "model_version": r["model_version"],
            "key_factors": json.loads(r["key_factors_json"]) if r["key_factors_json"] else [],
            "human_review_status": r["human_review_status"],
            "review_notes": r["review_notes"]
        })
    conn.close()
    return results

def get_assessment_by_id(assessment_id: str) -> Optional[Dict[str, Any]]:
    init_db()
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM assessments WHERE assessment_id = ?", (assessment_id,))
    row = cursor.fetchone()
    conn.close()
    if not row:
        return None
    col_names = row.keys()
    app_name = row["applicant_name"] if "applicant_name" in col_names and row["applicant_name"] else row["applicant_ref"]
    return {
        "id": row["id"],
        "assessment_id": row["assessment_id"],
        "applicant_name": app_name,
        "applicant_ref": row["applicant_ref"],
        "timestamp": row["timestamp"],
        "loan_amount": row["loan_amount"],
        "annual_income": row["annual_income"],
        "risk_probability": row["risk_probability"],
        "risk_category": row["risk_category"],
        "model_version": row["model_version"],
        "key_factors": json.loads(row["key_factors_json"]) if row["key_factors_json"] else [],
        "human_review_status": row["human_review_status"],
        "review_notes": row["review_notes"]
    }
