# 🏦 Intelligent Loan Risk Assessment & Default Prediction System
### *Production-Grade Machine Learning Platform for Credit Risk Underwriting & Decision Support*

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://loanriskprediction-ml.vercel.app)
[![API Status](https://img.shields.io/badge/Backend%20API-Render-46E3B7?style=for-the-badge&logo=render&logoColor=white)](https://loan-risk-prediction-1.onrender.com/docs)
[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Scikit-Learn](https://img.shields.io/badge/scikit--learn-1.4+-F7931E?style=for-the-badge&logo=scikitlearn&logoColor=white)](https://scikit-learn.org)
[![React](https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://typescriptlang.org)

---

## 🌐 Live Deployments

| Component | Platform | URL | Status |
| :--- | :--- | :--- | :---: |
| **Frontend Web Application** | **Vercel** | [https://loanriskprediction-ml.vercel.app](https://loanriskprediction-ml.vercel.app) | 🟢 **Live** |
| **Backend REST API** | **Render** | [https://loan-risk-prediction-1.onrender.com](https://loan-risk-prediction-1.onrender.com) | 🟢 **Live** |
| **Interactive API Documentation** | **Swagger UI** | [https://loan-risk-prediction-1.onrender.com/docs](https://loan-risk-prediction-1.onrender.com/docs) | 🟢 **Live** |
| **API Health Check** | **Render** | [https://loan-risk-prediction-1.onrender.com/api/health](https://loan-risk-prediction-1.onrender.com/api/health) | 🟢 **Healthy** |

---

## 📌 Table of Contents
1. [Project Overview](#1-project-overview)
2. [Key Problem Solved & Class Imbalance](#2-key-problem-solved--class-imbalance)
3. [Dataset Architecture](#3-dataset-architecture)
4. [Data Preprocessing & Feature Engineering](#4-data-preprocessing--feature-engineering)
5. [Ensemble Model Benchmarking & Selection](#5-ensemble-model-benchmarking--selection)
6. [Champion Model: Random Forest Classifier](#6-champion-model-random-forest-classifier)
7. [Holdout Evaluation Metrics & Confusion Matrix](#7-holdout-evaluation-metrics--confusion-matrix)
8. [Explainable AI (XAI) & Feature Importance](#8-explainable-ai-xai--feature-importance)
9. [System Architecture](#9-system-architecture)
10. [Key Application Modules](#10-key-application-modules)
11. [Regulatory Governance & Responsible AI](#11-regulatory-governance--responsible-ai)
12. [Project Directory Layout](#12-project-directory-layout)
13. [Local Setup & Execution Guide](#13-local-setup--execution-guide)
14. [API Endpoints Reference](#14-api-endpoints-reference)

---

## 1. Project Overview

Commercial retail banks process tens of thousands of consumer and SME loan applications daily. Traditional credit underwriting suffers from significant operational friction:
- **Time-Consuming & Error-Prone:** Manual auditing of extensive debt statements, multi-bureau lines, and income payslips leads to high turnaround times.
- **Inconsistent Decision Boundaries:** Individual underwriters apply disparate risk thresholds, leading to portfolio volatility.
- **Inability to Model Non-Linear Interactions:** Scorecards fail to capture high-order non-linear relationships across financial leverage, payment delays, and household dependencies.

The **Intelligent Loan Risk Assessment System** is an end-to-end Machine Learning decision-support platform designed to solve these challenges. Combining multi-source applicant profiles with an optimized **Class-Balanced Random Forest Classifier (100 Decision Trees)**, the system calculates calibrated default probabilities $P(\text{Default})$, groups applicants into transparent operational risk tiers, and highlights local contributing risk drivers.

> [!IMPORTANT]
> **Human-in-the-Loop Philosophy (Advisory Decision Support):**  
> Under the Equal Credit Opportunity Act (ECOA) and the Fair Credit Reporting Act (FCRA), the system does **not** autonomously approve or deny loan applications. It provides objective, empirical default probabilities to support **authorized credit underwriters and committees**, who retain final discretionary authority.

---

## 2. Key Problem Solved & Class Imbalance

### The Accuracy Paradox in Credit Risk
In retail banking datasets, class distribution is inherently skewed:
- **Non-Default (Class 0):** $\approx 93.33\%$ (Solvent borrowers who repay on schedule).
- **Default (Class 1):** $\approx 6.67\%$ (Borrowers who default with $\ge 90$ days delinquency).

A naive machine learning model that predicts "No Default" for 100% of applicants achieves an apparent accuracy of **93.33%**, but catches **0% of actual loan defaults**. In a lending institution, missing defaulters leads to Non-Performing Assets (NPAs) and millions in capital losses.

### How We Solved It: Cost-Sensitive Learning
Rather than downsampling (discarding valuable training data) or synthetically hallucinating minority samples, we implement cost-sensitive learning via **`class_weight='balanced'`**:

$$w_j = \frac{N}{k \times N_j}$$

Where:
- $N = 4,800$ (Training samples)
- $k = 2$ (Classes)
- $N_0 \approx 4,480$ (Non-defaults) $\rightarrow w_0 \approx 0.536$
- $N_1 \approx 320$ (Defaults) $\rightarrow w_1 = 7.500$

$$\text{Penalty Ratio} = \frac{w_1}{w_0} \approx 14.0\times$$

During tree node partitioning, misclassifying a rare default incurs **14 times greater Gini impurity penalty** than misclassifying a non-default. This forces the decision trees to construct partition boundaries specifically isolating delinquent behavior, directly overcoming the accuracy paradox.

---

## 3. Dataset Architecture

- **Total Sample Volume:** 6,000 applicant credit records.
- **Dataset Partitioning:** 80% Training Set (4,800 records) / 20% Blind Holdout Test Set (1,200 records).
- **Raw Input Variables:** 30 features spanning demographics, declared financials, and external credit bureau credit histories.
- **Transformed Feature Space:** 49 preprocessed and scaled numerical dimensions.

### Feature Grouping:
1. **Demographic Indicators:** Age (`DAYS_BIRTH`), Gender (`CODE_GENDER`), Academic Level (`NAME_EDUCATION_TYPE`), Marital Status (`NAME_FAMILY_STATUS`), Family Size (`CNT_FAM_MEMBERS`), Asset Ownership (`FLAG_OWN_CAR`, `FLAG_OWN_REALTY`).
2. **Financial Capacity:** Declared Annual Gross Income (`AMT_INCOME_TOTAL`), Requested Credit Principal (`AMT_CREDIT`), Scheduled Repayment Annuity (`AMT_ANNUITY`), Employment Tenure (`DAYS_EMPLOYED`), Income Source (`NAME_INCOME_TYPE`), Occupation (`OCCUPATION_TYPE`).
3. **Credit Bureau History:** Total Prior Loan Count (`PREV_LOAN_COUNT`), Active Credit Accounts (`ACTIVE_LOAN_COUNT`), Total Bureau Credit Limit (`TOTAL_BUREAU_CREDIT`), Average Credit Limit (`AVG_BUREAU_CREDIT`), Total Outstanding Debt (`TOTAL_BUREAU_DEBT`), Total Delinquent Amount (`TOTAL_OVERDUE_AMOUNT`), Peak Overdue Balance (`MAX_OVERDUE_AMOUNT`), Average Days Overdue (`AVG_CREDIT_DAY_OVERDUE`).
4. **Target Variable (`TARGET`):** Binary integer indicator (`0` = Repaid On Time, `1` = Default / Delinquent $\ge 90$ Days).

---

## 4. Data Preprocessing & Feature Engineering

All transformations are encapsulated into a strict Scikit-Learn **`ColumnTransformer`** pipeline (`loan_risk_pipeline.joblib`) to prevent data leakage between training and evaluation splits:

1. **Numerical Imputation (`SimpleImputer`):** Missing continuous values imputed using the **Median** to prevent multi-crore income outliers from skewing distribution parameters.
2. **Robust Feature Scaling (`RobustScaler`):** Centers variables by their median and scales via the Interquartile Range ($IQR = Q_3 - Q_1$). This bounds extreme financial outliers without distorting tree thresholds.
3. **Categorical Encoding (`OneHotEncoder`):** Categorical attributes encoded with `handle_unknown='ignore', sparse_output=False` to safely handle unseen production classes.

### The 7 Domain Financial Ratios (Engineered Indicators)
To model solvency and debt burden, 7 non-linear mathematical indicators are computed before pipeline ingestion:

| # | Indicator Name | Mathematical Formulation | Underwriting Purpose |
|---|---|---|---|
| 1 | **Loan-to-Income Ratio (LTI)** | $\frac{\text{AMT\_CREDIT}}{\text{AMT\_INCOME\_TOTAL}}$ | Multiples $>4.0\times$ flag severe leverage and high default risk. |
| 2 | **Credit-to-Annuity Ratio** | $\frac{\text{AMT\_CREDIT}}{\text{AMT\_ANNUITY}}$ | Approximates amortization horizon and installment cash strain. |
| 3 | **Income Per Family Member** | $\frac{\text{AMT\_INCOME\_TOTAL}}{\max(\text{CNT\_FAM\_MEMBERS}, 1)}$ | Normalizes household cash flow per dependent member. |
| 4 | **Debt-to-Income Ratio (DTI)** | $\frac{\text{TOTAL\_BUREAU\_DEBT}}{\text{AMT\_INCOME\_TOTAL}}$ | Total external credit obligations relative to annual earnings. |
| 5 | **Overdue-to-Income Ratio** | $\frac{\text{TOTAL\_OVERDUE\_AMOUNT}}{\text{AMT\_INCOME\_TOTAL}}$ | Direct measure of acute past-due delinquency strain. |
| 6 | **Age in Years** | $\frac{\text{DAYS\_BIRTH}}{-365.25}$ | Converts Home Credit negative day counts into calendar years. |
| 7 | **Employment Tenure (Years)** | $\frac{\text{DAYS\_EMPLOYED}}{-365.25}$ | Quantifies career stability and income continuity. |

*(All formulas include division-by-zero safeguards and fallback defaults).*

---

## 5. Ensemble Model Benchmarking & Selection

To objectively choose the best production algorithm, **6 machine learning algorithms** representing single trees, bagging ensembles, boosting ensembles, and linear models were benchmarked on the identical 1,200 holdout test set:

| Rank | Model Architecture | Accuracy (%) | ROC-AUC | F1-Score | Recall (%) | Precision (%) | Brier Loss | Status |
| :---: | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| 🥇 **#1** | **Random Forest (Balanced)** | **91.00%** | **0.7665** | **0.3333** | **33.75%** | **32.93%** | **0.0896** | **WINNER / DEPLOYED** |
| #2 | Logistic Regression (Balanced) | 78.25% | 0.7763 | 0.2888 | 66.25% | 18.47% | 0.1744 | Excessive false alarms (22% good rejected) |
| #3 | XGBoost Classifier | 85.33% | 0.7537 | 0.3071 | 48.75% | 22.41% | 0.1161 | Lower precision on minority class |
| #4 | Extra Trees (Balanced) | 91.67% | 0.7371 | 0.3151 | 28.75% | 34.85% | 0.1098 | Suboptimal ROC-AUC separation |
| #5 | LightGBM Classifier | 87.33% | 0.7215 | 0.2762 | 36.25% | 22.31% | 0.1046 | Lower separation on categorical splits |
| #6 | Gradient Boosting (GBDT) | 93.50% | 0.7612 | 0.2500 | 16.25% | 54.17% | 0.0567 | **Severely under-detects defaults** (Misses 84%) |

### Why Random Forest Was Finalized Over Others:
1. **Defeats the Accuracy Paradox:** Unweighted gradient boosting scored high accuracy (93.5%), but caught only 16% of defaults. Random Forest with balanced weights balances high accuracy (91.0%) with solid default detection.
2. **Variance Reduction via Bootstrap Bagging:** Aggregating 100 decorrelated decision trees reduces individual tree variance and prevents overfitting.
3. **Probability Calibration:** Achieves a low **0.0896 Brier Calibration Loss**, meaning output probabilities reflect genuine empirical default frequencies.
4. **Native Explainability:** Computes Mean Decrease in Impurity (Gini Feature Importance), satisfying regulatory transparency mandates.

---

## 6. Champion Model: Random Forest Classifier

- **Pipeline Artifact:** `model/loan_risk_pipeline.joblib`
- **Algorithm:** `sklearn.ensemble.RandomForestClassifier`
- **Ensemble Estimators (`n_estimators`):** `100` Decision Trees
- **Max Tree Depth (`max_depth`):** `12` Levels (Constrains individual tree complexity)
- **Split Criterion (`criterion`):** `gini` (Node impurity reduction)
- **Class Balancing (`class_weight`):** `balanced` (Inverse proportional weighting)
- **Minimum Samples per Split (`min_samples_split`):** `10`
- **Random State:** `42` (Deterministic reproducibility)

---

## 7. Holdout Evaluation Metrics & Confusion Matrix

Evaluated on **1,200 held-out applicant profiles**:

| Metric | Score | Underwriting Significance |
| :--- | :---: | :--- |
| **Accuracy** | **91.00%** | Overall correct classification rate across holdout applicants. |
| **ROC-AUC** | **0.7665** | Strong separation between default and non-default distributions. |
| **F1-Score** | **0.3333** | Harmonic balance between Precision and Recall on the 6.7% default class. |
| **Recall (Sensitivity)** | **33.75%** | Percentage of genuine delinquent borrowers caught by the model. |
| **Precision** | **32.93%** | Probability that an applicant flagged as high-risk is genuinely delinquent. |
| **Brier Loss** | **0.0896** | Mean squared difference between predicted probabilities and outcomes (< 0.10 is well-calibrated). |

### Confusion Matrix Breakdown (1,200 Holdout Test Samples)

$$\begin{array}{c|c|c}
 & \textbf{Predicted Non-Default (0)} & \textbf{Predicted Default (1)} \\
\hline
\textbf{Actual Non-Default (0)} & \textbf{True Negatives (TN) = 1,065} & \text{False Positives (FP) = 55} \\
\hline
\textbf{Actual Default (1)} & \text{False Negatives (FN) = 53} & \textbf{True Positives (TP) = 27} \\
\end{array}$$

- **True Negatives ($1,065$):** Qualified applicants approved without friction.
- **False Positives ($55$):** Solvent applicants routed for secondary document verification (safe false alarm).
- **False Negatives ($53$):** Delinquent loans not caught by the statistical threshold alone (safeguarded by mandatory human review).
- **True Positives ($27$):** Defaulters intercepted before loan origination.

---

## 8. Explainable AI (XAI) & Feature Importance

The model computes the **Mean Decrease in Impurity (Gini Feature Importance)** across all 100 decision trees:

| Rank | Feature Name | Relative Importance (%) | Underwriting Mechanism |
|---|---|:---:|---|
| 1 | **Loan-to-Income Ratio (LTI)** | **14.2%** | Disproportionate requested loan size relative to annual income. |
| 2 | **Requested Credit (`AMT_CREDIT`)** | **11.8%** | Absolute scale of principal exposure. |
| 3 | **Annual Annuity (`AMT_ANNUITY`)** | **9.7%** | Monthly repayment strain on borrower cash flow. |
| 4 | **Total Bureau Debt (`TOTAL_BUREAU_DEBT`)** | **8.9%** | Total outstanding debt carried across other lending institutions. |
| 5 | **Annual Income (`AMT_INCOME_TOTAL`)** | **8.1%** | Primary liquid cash flow cushion. |
| 6 | **Average Days Overdue (`AVG_CREDIT_DAY_OVERDUE`)** | **7.4%** | Historical delinquency habit. |
| 7 | **Credit-to-Annuity Ratio** | **6.8%** | Amortization structure and loan duration. |
| 8 | **Applicant Age (`AGE_YEARS`)** | **5.9%** | Demographic life stage and financial maturity. |
| 9 | **Employment Tenure (`EMPLOYMENT_YEARS`)** | **5.1%** | Career stability and income continuity. |
| 10 | **Active Loan Count (`ACTIVE_LOAN_COUNT`)** | **4.6%** | Number of open credit lines currently being serviced. |

---

## 9. System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                 TIER 1: FRONTEND APPLICATION                │
│  React 18 + TypeScript + Vite + Tailwind CSS (Hosted on Vercel)
│  - Dashboard: Real-time telemetry, model readiness metrics  │
│  - 4-Step Interactive Underwriting Form                     │
│  - Audited Results View with Risk Gauge & Factor Waterfall  │
│  - CSV Bulk Batch Assessment Engine                         │
│  - SQLite Audit History Explorer                            │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTPS REST (JSON)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 TIER 2: BACKEND API SERVICE                 │
│  FastAPI + Uvicorn + Pydantic (Hosted on Render)            │
│  - POST /api/predict: Single applicant real-time scoring    │
│  - POST /api/batch-predict: Asynchronous CSV batch analysis │
│  - GET /api/metrics: Model holdout evaluation telemetry     │
│  - GET /api/model-comparison: Multi-algorithm leaderboard   │
│  - GET /api/history: Audited historical assessment ledger   │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│             TIER 3: MACHINE LEARNING ENGINE                 │
│  Scikit-Learn Pipeline (loan_risk_pipeline.joblib)          │
│  - Automated Feature Engineering Service (7 Ratios)         │
│  - ColumnTransformer (Imputer + RobustScaler + OneHotEncoder)
│  - Deployed Random Forest Classifier (100 Trees)            │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 TIER 4: PERSISTENCE LAYER                   │
│  SQLite Database (database/loan_assessments.db)             │
│  - Stores every assessment with unique UUID (ASM-XXXX)      │
│  - Timestamps, applicant metadata, calculated probabilities │
└──────────────────────────────┘
```

---

## 10. Key Application Modules

1. **Executive Dashboard (`DashboardPage.tsx`):**
   - Real-time engine readiness telemetry (Active Random Forest v1.0, 100 Trees).
   - High-level KPIs: Holdout Accuracy (91.0%), ROC-AUC (0.7665), Class F1-Score (0.3333).
   - Historical portfolio risk spectrum donut chart.
2. **Interactive 4-Step Underwriting Portal (`AssessmentPage.tsx`):**
   - Step 1: Personal Demographics & Household attributes.
   - Step 2: Financial Terms & Income declarations.
   - Step 3: Credit Bureau Delinquency History.
   - Step 4: Pre-flight Summary & Underwriter Confirmation.
   - Includes preset test profiles (**Prime**, **Near-Prime**, **Sub-Prime**).
3. **Audited Risk Report (`ResultPage.tsx`):**
   - Dark Navy Risk Gauge displaying calibrated probability $P(\text{Default})$ and risk tier.
   - Local Feature Impact Waterfall explaining the exact financial drivers.
   - Print-ready reporting view for credit committees.
4. **Batch Processing Module (`BatchAssessmentPage.tsx`):**
   - Bulk upload of CSV applicant spreadsheets.
   - Concurrent vectorized feature engineering and scoring.
   - Downloadable CSV template and exportable scored audit reports.
5. **Model Insights & Benchmarking (`ModelInsightsPage.tsx`):**
   - Interactive algorithm leaderboard comparing all 6 models with the `WINNER / DEPLOYED` tag.
   - 2x2 Confusion Matrix and Gini feature importance bar chart.
6. **Audit History Explorer (`HistoryPage.tsx`):**
   - Searchable, filterable audit ledger stored in SQLite with full pagination and date filtering.

---

## 11. Regulatory Governance & Responsible AI

To comply with global fair lending standards (such as ECOA and FCRA), the system implements a strict three-tier operational taxonomy:

```
0.0%                    35.0%                   60.0%                   100.0%
 │                        │                       │                        │
 ├────────────────────────┼───────────────────────┼────────────────────────┤
 │      LOWER RISK        │     MODERATE RISK     │      HIGHER RISK       │
 │   Standard Approval    │  Secondary Verification│ Senior Committee Review│
 └────────────────────────┴───────────────────────┴────────────────────────┘
```

- **Lower Risk ($P < 0.35$):** Low predicted default probability with strong debt-service coverage. Recommended for standard expedited underwriter sign-off.
- **Moderate Risk ($0.35 \le P < 0.60$):** Balanced debt capacity with factors warranting secondary verification (e.g., verifying documented employment tenure or collateral values).
- **Higher Risk ($P \ge 0.60$):** Elevated default indicators (high LTI or past-due delinquency). Routed to senior credit committees for structured mitigation (e.g., lower loan principal, higher collateral, or additional guarantor) rather than blanket auto-rejection.

---

## 12. Project Directory Layout

```
Loan-Risk-Prediction/
├── Dockerfile                   # Docker container specification for Render deployment
├── README.md                    # Project documentation
├── run_project.bat              # One-click Windows launcher (Starts Backend, Frontend & Browser)
├── run_comparison.bat           # One-click launcher: Runs multi-model comparison script
├── run_evaluation.bat           # One-click launcher: Runs accuracy & confusion matrix evaluation
├── stop_project.bat             # One-click script: Terminates running background services
│
├── backend/                     # FastAPI Backend Application
│   ├── main.py                  # App entry point, CORS, and route registration
│   ├── config.py                # Global configurations and path management
│   ├── database.py              # SQLite connection and CRUD operations
│   ├── requirements.txt         # Backend Python dependencies
│   ├── api/                     # REST API Route Controllers
│   │   ├── routes_prediction.py # /predict and /batch-predict endpoints
│   │   ├── routes_model.py      # /metrics and /model-comparison endpoints
│   │   ├── routes_history.py    # /history audit log endpoints
│   │   └── routes_health.py     # System health check endpoint
│   ├── services/                # Business Logic Services
│   │   ├── feature_service.py   # Mathematical formulas for 7 financial ratios
│   │   ├── prediction_service.py# Model inference and risk tiering
│   │   └── explanation_service.py # Feature importance and explainability
│   └── schemas/                 # Pydantic Request/Response validation schemas
│
├── ml/                          # Machine Learning Pipelines
│   ├── train_model.py           # Core training script for Random Forest pipeline
│   ├── evaluate_model.py        # Single-model evaluation (Accuracy, Confusion Matrix)
│   └── compare_models.py        # 6-Algorithm comparison script & leaderboard generator
│
├── model/                       # Serialized Model Artifacts
│   ├── loan_risk_pipeline.joblib# Serialized Preprocessor + Random Forest Pipeline
│   ├── metrics.json             # Model evaluation metrics and confusion matrix
│   ├── model_comparison.json   # Multi-model benchmarking leaderboard data
│   └── feature_importance.json # Pre-computed Gini importance weights
│
├── data/                        # Datasets & Templates
│   ├── preprocessed_features_scaled.csv # 49-feature preprocessed dataset
│   └── loan_risk_batch_template.csv     # Sample CSV template for batch assessments
│
└── frontend/                    # React 18 + TypeScript + Vite Single-Page Application
    ├── src/
    │   ├── pages/               # Application Views (Dashboard, Assessment, Batch, etc.)
    │   ├── components/          # Reusable UI Components (RiskGauge, Navbar, etc.)
    │   ├── services/api.ts      # API client for backend communication
    │   └── types/               # TypeScript interfaces and type definitions
    ├── package.json             # Frontend Node.js dependencies
    └── vite.config.ts           # Vite build configuration
```

---

## 13. Local Setup & Execution Guide

### Prerequisites
- Python 3.10 or higher
- Node.js 18 or higher with npm

### Quick One-Click Launch (Windows)
Double-click **`run_project.bat`** in the root directory. It will automatically:
1. Verify Python and Node.js environments.
2. Verify the trained model artifact.
3. Start the FastAPI backend on `http://127.0.0.1:8000`.
4. Start the Vite React frontend on `http://127.0.0.1:5173`.
5. Automatically open the application in your default browser.

### Manual Terminal Execution
```bash
# 1. Clone the repository
git clone https://github.com/nikhilappari/Loan-Risk-Prediction.git
cd Loan-Risk-Prediction

# 2. Setup and run Backend
pip install -r backend/requirements.txt
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload

# 3. Setup and run Frontend (In a second terminal)
cd frontend
npm install
npm run dev
```

### Running Machine Learning Scripts
```bash
# Run 6-algorithm comparison leaderboard:
python ml/compare_models.py

# Run single-model accuracy & confusion matrix evaluation:
python ml/evaluate_model.py
```

---

## 14. API Endpoints Reference

| Method | Endpoint | Description |
| :---: | :--- | :--- |
| `GET` | `/api/health` | Service health status, database connection, and model loading state. |
| `GET` | `/api/metrics` | Model performance metrics, holdout accuracy, and confusion matrix. |
| `GET` | `/api/model-comparison` | Benchmark metrics comparing all 6 candidate ML algorithms. |
| `GET` | `/api/feature-importance`| Ranked list of top Gini importance features. |
| `POST`| `/api/predict` | Real-time risk scoring for a single loan applicant. |
| `POST`| `/api/batch-predict` | Vectorized bulk assessment from an uploaded CSV file. |
| `GET` | `/api/history` | Paginated SQLite audit ledger of past assessments. |
| `GET` | `/docs` | Interactive Swagger UI API documentation. |

---

## 15. Authors & License
- **Developed by:** Nikhil Appari ([@nikhilappari](https://github.com/nikhilappari))
- **Live Frontend:** [loanriskprediction-ml.vercel.app](https://loanriskprediction-ml.vercel.app)
- **Live Backend:** [loan-risk-prediction-1.onrender.com](https://loan-risk-prediction-1.onrender.com)
- **License:** Open Source for academic and educational evaluation.
