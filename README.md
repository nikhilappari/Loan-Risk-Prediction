# INTELLIGENT LOAN RISK ASSESSMENT SYSTEM
### Machine-Learning-Powered Credit Risk Analysis and Decision Support

[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=flat-square&logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.141+-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Scikit-Learn](https://img.shields.io/badge/scikit--learn-1.4+-F7931E?style=flat-square&logo=scikitlearn&logoColor=white)](https://scikit-learn.org)
[![React](https://img.shields.io/badge/React-18.x-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4+-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)

---

## 1. Project Overview & Problem Statement

Financial institutions process thousands of loan applications daily. Manual credit evaluation presents multiple systemic challenges:
- **Time-Consuming & Cost-Intensive**: Extensive hours spent verifying disparate credit history reports and bank records.
- **Difficult to Scale**: Underwriting capacity bottlenecks during peak borrowing periods.
- **Inconsistency & Human Bias**: Differing risk perceptions across individual loan officers.

The **Intelligent Loan Risk Assessment System** is an end-to-end, machine-learning-driven decision-support application. It combines applicant demographic profiles, requested loan terms, and historical credit bureau debt metrics with a trained Scikit-Learn **Random Forest Classifier** to estimate default probability and illuminate primary risk drivers.

> [!IMPORTANT]
> **Decision-Support Philosophy (Human-in-the-Loop)**:
> This system is strictly a decision-support tool. It does **not** automatically approve or reject loans. All outputs provide empirical default risk probabilities, risk tiers, and contributing factor weights to support **human financial officers and credit committees**, who retain final lending authority.

---

## 2. System Architecture

```
                                  USER INTERFACE (React + Vite + TypeScript + Tailwind CSS)
                                    [Dashboard | New Assessment | Batch CSV | History | Insights]
                                                                │
                                                    HTTP / JSON (REST API)
                                                                ▼
                                                FASTAPI BACKEND (Python 3.11)
                                                                │
                                      ┌─────────────────────────┴────────────────────────┐
                                      ▼                                                  ▼
                        Data Sanitization & Validation                    Model Registry Singleton
                          (Pydantic & Epsilon Guards)                   (Joblib Serialized Pipeline)
                                      │                                                  │
                                      ▼                                                  ▼
                         Feature Engineering Engine                          Holdout Telemetry Store
                       (Exact Ratios & Safe Division)                         (metrics.json / weights)
                                      │                                                  │
                                      └─────────────────────────┬────────────────────────┘
                                                                ▼
                                                   Scikit-Learn Pipeline
                                           ColumnTransformer ──► Balanced RandomForest
                                                                │
                                                                ▼
                                                  Decision Output Service
                                       [Probability | Tier | Factors | Review Notice]
                                                                │
                                                                ▼
                                                    SQLite Decision Ledger
                                                 (database/loan_assessments.db)
```

---

## 3. Technology Stack

- **Machine Learning & Core Analytics**:
  - Python 3.11+
  - Scikit-Learn (ColumnTransformer, Pipeline, RobustScaler, OneHotEncoder, RandomForestClassifier)
  - Pandas & NumPy (Vectorized aggregations, safe division arithmetic)
  - Joblib (Model and pipeline serialization)
- **Backend Service**:
  - FastAPI (High-performance asynchronous REST API)
  - Pydantic v2 (Strict schema validation and type coercion)
  - Uvicorn (ASGI web server)
  - SQLite3 (Audited assessment ledger)
- **Frontend Dashboard**:
  - React 18 & TypeScript
  - Vite (Build tooling and hot-module replacement)
  - Tailwind CSS (Fintech design system with slate/zinc neutral tones)
  - Lucide React (Financial & risk iconography)
  - Recharts (Interactive SVG data visualizations)

---

## 4. Machine Learning Pipeline & Feature Engineering

### Mathematical Feature Engineering
The pipeline uses exact, zero-guarded formulas for financial feature derivation:

$$\text{LOAN\_INCOME\_RATIO} = \frac{\text{AMT\_CREDIT}}{\text{AMT\_INCOME\_TOTAL}}$$

$$\text{CREDIT\_ANNUITY\_RATIO} = \frac{\text{AMT\_CREDIT}}{\text{AMT\_ANNUITY}}$$

$$\text{INCOME\_PER\_PERSON} = \frac{\text{AMT\_INCOME\_TOTAL}}{\text{CNT\_FAM\_MEMBERS}}$$

$$\text{AGE\_YEARS} = \frac{|\text{DAYS\_BIRTH}|}{365.25}$$

$$\text{EMPLOYMENT\_YEARS} = \frac{|\text{DAYS\_EMPLOYED}|}{365.25} \quad (\text{handling code } 365243 \text{ as } 0.0)$$

$$\text{DEBT\_TO\_INCOME\_RATIO} = \frac{\text{TOTAL\_BUREAU\_DEBT}}{\text{AMT\_INCOME\_TOTAL}}$$

$$\text{OVERDUE\_TO\_INCOME\_RATIO} = \frac{\text{TOTAL\_OVERDUE\_AMOUNT}}{\text{AMT\_INCOME\_TOTAL}}$$

### Bureau Credit Aggregations (per `SK_ID_CURR`)
- `PREV_LOAN_COUNT`: Count of prior loan accounts
- `ACTIVE_LOAN_COUNT`: Number of accounts where `CREDIT_ACTIVE == 'Active'`
- `TOTAL_BUREAU_CREDIT`: Sum of historical credit lines (`AMT_CREDIT_SUM`)
- `AVG_BUREAU_CREDIT`: Mean credit limit across historical accounts
- `TOTAL_OVERDUE_AMOUNT`: Sum of outstanding overdue balances (`AMT_CREDIT_SUM_OVERDUE`)
- `MAX_OVERDUE_AMOUNT`: Peak single overdue delinquency recorded
- `AVG_CREDIT_DAY_OVERDUE`: Average days past due across credit records
- `TOTAL_BUREAU_DEBT`: Sum of active unpaid balances (`AMT_CREDIT_SUM_DEBT`)

### Preprocessing & Model Specification
- **Numerical Features (21 variables)**: Handled via `SimpleImputer(strategy='median')` followed by `RobustScaler()` to resist outlier distortion.
- **Categorical Features (7 variables)**: Handled via `SimpleImputer(strategy='most_frequent')` followed by `OneHotEncoder(handle_unknown='ignore', sparse_output=False)`.
- **Target Imbalance**: Managed using `class_weight='balanced'` in `RandomForestClassifier(n_estimators=150, max_depth=12, min_samples_split=10, min_samples_leaf=4, random_state=42)`.
- **Leakage Prevention**: `TARGET` and applicant identifiers (`SK_ID_CURR`) are strictly decoupled prior to data splitting.

---

## 5. Dataset Setup Instructions

Place your Kaggle Home Credit datasets in the `data/` directory:

```
data/
├── application_train.csv
└── bureau.csv
```

### Automatic Setup & Synthetic Data Transparency
If real Kaggle CSV files are not placed in `data/`, the training pipeline automatically detects their absence and invokes `ml/generate_sample_data.py`. This generates a verified, realistic Home Credit schema dataset (6,000 applicants and ~21,000 bureau entries with a realistic 6.7% default base rate). 

All generated artifacts explicitly record:
```json
{
  "dataset_source": "synthetic_demo",
  "is_synthetic": true
}
```
When real Kaggle datasets are placed in `data/`, simply re-run `python ml/train_model.py` to train and evaluate on the real data, updating the badge to `"real_home_credit"`.

---

## 6. Installation & Execution Guide

### Prerequisites
- Python 3.11+
- Node.js 18+ and npm

### Step 1: Install Python Dependencies & Train Model

```bash
# Clone or navigate to the project directory
cd "ML Project"

# Install backend dependencies
pip install -r backend/requirements.txt

# Execute ML training pipeline (generates model/loan_risk_pipeline.joblib, metrics.json, feature_importance.json)
python ml/train_model.py
```

### Step 2: Start the FastAPI Backend

```bash
# Launch ASGI server on http://127.0.0.1:8000
python -m uvicorn backend.main:app --reload --port 8000
```

Verify backend health at: [http://localhost:8000/docs](http://localhost:8000/docs) or [http://localhost:8000/api/health](http://localhost:8000/api/health).

### Step 3: Install & Start Frontend

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
```

The frontend dashboard will be available at: [http://localhost:5173](http://localhost:5173).

---

## 7. API Documentation

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | Root system metadata, status, and human-review flag |
| `GET` | `/api/health` | Service health, model loaded status, database connectivity |
| `GET` | `/api/model-info` | Complete model architecture, hyperparameters, and dataset source |
| `GET` | `/api/metrics` | Holdout accuracy, precision, recall, F1, ROC-AUC, confusion matrix |
| `GET` | `/api/feature-importance` | Global Gini importance ranking for top features |
| `POST` | `/api/predict` | Single applicant evaluation; returns probability, tier, factors, review notice |
| `POST` | `/api/batch-predict` | Multipart CSV upload for portfolio assessment |
| `GET` | `/api/history` | Paginated assessment ledger with risk tier and score filters |
| `GET` | `/api/history/{id}` | Detailed single assessment audit record |

### Example Prediction Request (`POST /api/predict`)

```json
{
  "applicant_ref": "APP-2026-0819",
  "age_years": 45,
  "code_gender": "F",
  "cnt_fam_members": 2,
  "name_family_status": "Married",
  "name_education_type": "Higher education",
  "name_income_type": "Commercial associate",
  "occupation_type": "Managers",
  "amt_income_total": 280000.0,
  "amt_credit": 350000.0,
  "amt_annuity": 22000.0,
  "employment_years": 12.0,
  "flag_own_car": "Y",
  "flag_own_realty": "Y",
  "prev_loan_count": 4,
  "active_loan_count": 1,
  "total_bureau_credit": 400000.0,
  "avg_bureau_credit": 100000.0,
  "total_bureau_debt": 35000.0,
  "total_overdue_amount": 0.0,
  "max_overdue_amount": 0.0,
  "avg_credit_day_overdue": 0.0
}
```

### Example Prediction Response

```json
{
  "assessment_id": "ASM-798EA769",
  "applicant_ref": "APP-2026-0819",
  "risk_probability": 0.1456,
  "risk_percentage": 14.6,
  "risk_category": "LOWER RISK",
  "confidence_level": "High Model Certainty",
  "assessment": "Applicant demonstrates relatively lower predicted default risk based on supplied financial and bureau credit history indicators.",
  "human_review_required": true,
  "human_review_notice": "This assessment is intended to support financial review. It does not automatically approve or reject a loan application. A qualified human financial officer must consider all supplementary applicant circumstances before making any lending commitment.",
  "recommendation": "Recommended for standard expedited underwriter review. Confirm documented employment and income verification prior to loan origination.",
  "key_factors": [
    {
      "feature": "DEBT_TO_INCOME_RATIO",
      "display_name": "Bureau Debt to Income Ratio",
      "value": "12.5%",
      "impact": "Favorable Indicator",
      "importance_weight": 0.1108,
      "description": "Total outstanding debt from all credit bureau accounts relative to annual income."
    },
    {
      "feature": "LOAN_INCOME_RATIO",
      "display_name": "Loan to Income Ratio",
      "value": "1.25x",
      "impact": "Favorable Indicator",
      "importance_weight": 0.0698,
      "description": "Ratio of requested credit amount relative to annual declared income."
    }
  ],
  "derived_indicators": {
    "loan_income_ratio": 1.25,
    "credit_annuity_ratio": 15.91,
    "income_per_person": 140000.0,
    "debt_to_income_ratio": 0.125,
    "overdue_to_income_ratio": 0.0,
    "age_years": 45.0,
    "employment_years": 12.0
  },
  "timestamp": "2026-09-28T20:42:32.458291",
  "model_version": "RandomForest_LoanRiskClassifier"
}
```

---

## 8. Frontend Interface & Screens

1. **Portfolio Risk Dashboard**: Key performance indicators (ROC-AUC, F1, Accuracy, Active Model), Recent Risk Distribution bar chart, Top Influential Model Variables, and Recent Assessments audit ledger.
2. **New Risk Assessment**: Multi-section applicant form with Demographic Background, Loan Terms, Bureau Credit History, and **Real-Time Auto-Calculated Derived Ratios** (Loan/Income, Credit/Annuity, Income/Person, Debt/Income, Overdue/Income). Includes 1-click test profile presets for Low, Moderate, and High risk.
3. **Assessment Result Screen**: 0%–100% Probability Gauge, Risk Category Tier, Model Assessment Summary, Derived Ratios Breakdown, Key Contributing Factors with weights, and the **Mandatory Human Review Compliance Notice**.
4. **Batch Portfolio Assessment**: Drag-and-drop CSV upload, live processing, searchable results table, filterable by risk tier, and 1-click export of assessed results CSV.
5. **Prediction Audit History**: Full SQLite-backed historical log with search, category filtering, and modal factor inspector.
6. **Model Insights & Telemetry**: Full statistical telemetry, test set Confusion Matrix (TN, FP, FN, TP), horizontal Feature Importance chart, and detailed Model Limitations.
7. **Methodology & Ethics**: Mathematical formula documentation, architecture pipeline breakdown, and Responsible AI guidelines.

---

## 9. Evaluation Metrics & Imbalance Analysis

In loan default prediction, positive defaults represent a small fraction of total loans (typically 6–10%). 

- **Holdout Test Set Results**:
  - **ROC-AUC**: ~0.7719 (Strong discriminative ability across decision thresholds)
  - **Holdout Accuracy**: ~89.9%
  - **F1 Score**: ~0.324
  - **Recall**: ~36.3%
- **Why Accuracy Alone Is Misleading**: A naive model predicting that 100% of applicants repay achieves 93% accuracy but catches 0% of defaults, causing catastrophic credit losses. The balanced Random Forest prioritizes ROC-AUC and Recall to ensure risky applicants are flagged for human examination.

---

## 10. Limitations & Responsible AI

- **Statistical Correlation vs. Causality**: Feature importance reflects historical split correlations across training cohorts. It does not imply that altering a specific variable guarantees repayment.
- **Unverified Self-Reporting**: The model assumes inputs represent verified documentation. Financial officers must confirm income and employment via official records.
- **Protected Demographics**: Attributes such as gender or age are analyzed solely for historical calibration and must never be used in isolation for adverse credit actions.
- **Human Oversight**: In compliance with Fair Lending regulations, all algorithmic assessments require human-in-the-loop validation.

---

## 11. Project Directory Structure

```
c:/Users/nikhi/Desktop/ML Project/
│
├── data/
│   ├── application_train.csv         # Application records (Kaggle or generated)
│   ├── bureau.csv                    # Bureau credit records (Kaggle or generated)
│   └── DATASET_SOURCE.txt            # Provenance tracking (SYNTHETIC_DEMO or REAL)
│
├── model/
│   ├── loan_risk_pipeline.joblib     # Serialized Scikit-Learn Pipeline
│   ├── metrics.json                  # Real evaluated holdout metrics & confusion matrix
│   └── feature_importance.json       # Extracted Gini importance weights
│
├── database/
│   └── loan_assessments.db           # SQLite assessment audit ledger
│
├── ml/
│   ├── __init__.py
│   ├── feature_engineering.py        # Exact ratio formulas & bureau aggregations
│   ├── generate_sample_data.py       # Realistic Home Credit schema generator
│   ├── evaluate_model.py             # ROC-AUC, F1, and confusion matrix calculation
│   ├── train_model.py                # Full training, validation & serialization pipeline
│   └── test_backend.py               # Synchronous API test suite
│
├── backend/
│   ├── __init__.py
│   ├── main.py                       # FastAPI application entrypoint & CORS
│   ├── config.py                     # Configuration constants & file paths
│   ├── database.py                   # SQLite schema & query methods
│   ├── requirements.txt              # Backend dependencies
│   ├── api/
│   │   ├── routes_health.py          # GET /api/health
│   │   ├── routes_model.py           # GET /api/model-info, /api/metrics, /api/feature-importance
│   │   ├── routes_prediction.py      # POST /api/predict, POST /api/batch-predict
│   │   └── routes_history.py         # GET /api/history, GET /api/history/{id}
│   ├── schemas/
│   │   ├── applicant_schema.py       # Pydantic input validation models
│   │   └── response_schema.py        # Standardized prediction & metric responses
│   ├── services/
│   │   ├── feature_service.py        # Inference DataFrame generation & ratio derivations
│   │   ├── prediction_service.py     # Probability classification & review recommendations
│   │   └── explanation_service.py    # Local factor contributions & weight assignments
│   ├── ml/
│   │   └── model_loader.py           # Model artifact singleton & lazy loader
│   └── utils/
│       └── validation.py             # Financial input boundary validators
│
├── frontend/
│   ├── index.html                    # Root HTML document
│   ├── package.json                  # Dependencies: React 18, Vite, Tailwind, Recharts, Lucide
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   ├── tsconfig.app.json
│   └── src/
│       ├── main.tsx                  # React entrypoint
│       ├── App.tsx                   # Main layout & router state
│       ├── index.css                 # Tailwind base styles & scrollbar themes
│       ├── types/
│       │   └── index.ts              # TypeScript interfaces
│       ├── services/
│       │   └── api.ts                # REST API client
│       ├── utils/
│       │   └── formatters.ts         # Currency, ratio, and date formatters
│       ├── components/
│       │   ├── Navbar.tsx            # Header with health status & dataset badge
│       │   ├── Sidebar.tsx           # Navigation sidebar
│       │   ├── MetricCard.tsx        # Financial KPI card
│       │   ├── RiskGauge.tsx         # 0%-100% Probability visualization & tier marker
│       │   ├── HumanReviewNotice.tsx # Mandatory human review compliance callout
│       │   ├── FeatureImpactChart.tsx# Contributing factors breakdown
│       │   ├── ConfusionMatrixChart.tsx # 2x2 Test set confusion matrix display
│       │   └── LoadingOverlay.tsx    # Multi-stage progressive loader
│       └── pages/
│           ├── DashboardPage.tsx     # Overview dashboard with risk charts
│           ├── AssessmentPage.tsx    # Multi-section applicant form with live ratios
│           ├── ResultPage.tsx        # High-impact decision support report
│           ├── BatchAssessmentPage.tsx # CSV batch upload & export
│           ├── HistoryPage.tsx       # SQLite history table with filters & modal
│           ├── ModelInsightsPage.tsx # Telemetry, confusion matrix & limitations
│           └── MethodologyPage.tsx   # Responsible AI & mathematical specifications
│
├── Dockerfile.backend
├── docker-compose.yml
├── .env.example
├── .gitignore
└── README.md
```
