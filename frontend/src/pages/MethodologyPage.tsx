import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FileSpreadsheet,
  Database,
  Sliders,
  Calculator,
  Cpu,
  TrendingUp,
  UserCheck,
  ShieldCheck,
  CheckCircle2,
  Code2,
  HelpCircle,
  ArrowDown,
  Info
} from 'lucide-react';

export const MethodologyPage: React.FC = () => {
  const [activeStage, setActiveStage] = useState<number>(0);

  const pipelineStages = [
    {
      id: '01',
      title: 'Application Data',
      badge: 'Client Input',
      icon: FileSpreadsheet,
      summary: 'Collects gross income, loan amount requested, annuity terms, demographic attributes, and household size.',
      technicalDetails: 'Extracts 12 primary application attributes directly from applicant declaration. Applies strict type casting and range validation.'
    },
    {
      id: '02',
      title: 'Bureau Data',
      badge: 'Credit History',
      icon: Database,
      summary: 'Ingests credit bureau records: prior loan count, active accounts, aggregate debt balance, and days overdue.',
      technicalDetails: 'Vectorized aggregation across historical credit lines keyed by SK_ID_CURR. Calculates total debt outstanding and maximum delinquency delays.'
    },
    {
      id: '03',
      title: 'Data Cleaning & Preprocessing',
      badge: 'Scikit-Learn',
      icon: Sliders,
      summary: 'Handles missing values using median imputation; applies RobustScaler to numerical features and OneHotEncoder to categoricals.',
      technicalDetails: 'ColumnTransformer pipeline: SimpleImputer(strategy="median") + RobustScaler(quantile_range=(25.0, 75.0)) for numbers; OneHotEncoder(handle_unknown="ignore") for categoricals.'
    },
    {
      id: '04',
      title: 'Feature Engineering',
      badge: 'Domain Math',
      icon: Calculator,
      summary: 'Computes 7 domain-specific financial leverage and burden ratios with zero-division protection safeguards.',
      technicalDetails: 'Transforms raw numbers into non-linear leverage indicators including Loan-to-Income, Credit-to-Annuity, and Bureau Debt-to-Income ratios.'
    },
    {
      id: '05',
      title: 'Random Forest Inference',
      badge: '100 Trees',
      icon: Cpu,
      summary: 'Executes class-balanced ensemble of 100 decision trees with max depth 12 to mitigate default class scarcity.',
      technicalDetails: 'Calculates bootstrap probability averages across 100 trees. Class weights inversely proportioned to counter natural ~93/7 credit default imbalance.'
    },
    {
      id: '06',
      title: 'Risk Probability & Factors',
      badge: 'Explainability',
      icon: TrendingUp,
      summary: 'Calibrates empirical default probability P(TARGET = 1) and ranks features by Gini impurity reduction.',
      technicalDetails: 'Maps probability into calibrated risk tiers: Lower Risk (<35%), Moderate (35%-60%), Higher (≥60%). Ranks local contributing factors.'
    },
    {
      id: '07',
      title: 'Human Underwriting Review',
      badge: 'Governance',
      icon: UserCheck,
      summary: 'Generates decision-support dossier for authorized financial underwriter to verify and make final credit determination.',
      technicalDetails: 'Adheres to FCRA / ECOA regulations. Model output is strictly advisory — final lending commitment remains with a certified human officer.'
    }
  ];

  const formulas = [
    {
      name: 'LOAN_INCOME_RATIO',
      code: 'AMT_CREDIT / AMT_INCOME_TOTAL',
      explanation: 'Measures total requested credit principal relative to annual declared income. Ratios above 4.0x indicate severe debt loading.',
      safeguard: 'Guarded with AMT_INCOME_TOTAL > 0 (fallback to zero)',
      target: 'Benchmark: < 3.5x'
    },
    {
      name: 'CREDIT_ANNUITY_RATIO',
      code: 'AMT_CREDIT / AMT_ANNUITY',
      explanation: 'Reflects the scheduled amortization lifespan in annual repayment installments. Lower values indicate higher immediate cash obligations.',
      safeguard: 'Guarded with AMT_ANNUITY > 0 (fallback to zero)',
      target: 'Benchmark: 10.0x – 25.0x'
    },
    {
      name: 'INCOME_PER_PERSON',
      code: 'AMT_INCOME_TOTAL / CNT_FAM_MEMBERS',
      explanation: 'Normalizes gross declared income across dependent family members to quantify per-capita disposable cushion.',
      safeguard: 'Guarded with max(CNT_FAM_MEMBERS, 1)',
      target: 'Higher value indicates larger cushion'
    },
    {
      name: 'AGE_YEARS & EMPLOYMENT_YEARS',
      code: 'abs(DAYS_BIRTH) / 365.25 & abs(DAYS_EMPLOYED) / 365.25',
      explanation: 'Converts raw Home Credit negative calendar offsets into standard chronological years. Anomaly sentinel 365243 handled as 0.',
      safeguard: 'Special sentinel 365243 treated as 0 (retired / non-employed)',
      target: 'Normalized decimal years'
    },
    {
      name: 'DEBT_TO_INCOME_RATIO',
      code: 'TOTAL_BUREAU_DEBT / AMT_INCOME_TOTAL',
      explanation: 'Aggregates all active outstanding debt across external institutional lenders from bureau records relative to applicant annual earnings.',
      safeguard: 'Guarded with zero fill for missing bureau debt',
      target: 'Benchmark: Caution above 1.5x'
    },
    {
      name: 'OVERDUE_TO_INCOME_RATIO',
      code: 'TOTAL_OVERDUE_AMOUNT / AMT_INCOME_TOTAL',
      explanation: 'Computes total delinquent overdue debt across all historical and active credit lines relative to annual declared earnings.',
      safeguard: 'Guarded with zero fill for zero delinquencies',
      target: 'Target: 0.00% (delinquency free)'
    }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-10">
      {/* 13. TECHNICAL DOCUMENTATION HEADER */}
      <div className="border-b border-slate-200/90 pb-6">
        <span className="text-[11px] font-mono font-bold text-blue-600 uppercase tracking-widest">
          Technical Architecture & Documentation
        </span>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
          How LoanRisk AI Works
        </h1>
        <p className="text-sm text-slate-500 mt-1 max-w-3xl">
          End-to-end specification of data ingestion, engineered financial burden formulas, Random Forest ensemble mechanics, and Responsible AI underwriting governance.
        </p>
      </div>

      {/* 13. INTERACTIVE VISUAL PIPELINE */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Inference Pipeline Workflow
            </h2>
            <p className="text-xs text-slate-500">
              Click or hover on any stage to inspect technical execution details
            </p>
          </div>
          <span className="text-xs text-slate-400 font-mono">7 Processing Stages</span>
        </div>

        {/* Pipeline Stages Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-3">
          {pipelineStages.map((stage, idx) => {
            const Icon = stage.icon;
            const isSelected = activeStage === idx;
            return (
              <div
                key={stage.id}
                onClick={() => setActiveStage(idx)}
                onMouseEnter={() => setActiveStage(idx)}
                className={`cursor-pointer rounded-2xl p-4 transition-all duration-200 flex flex-col justify-between border ${
                  isSelected
                    ? 'bg-blue-50/80 border-blue-400 shadow-xs ring-2 ring-blue-500/15'
                    : 'bg-white border-slate-200/90 hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] font-mono font-bold text-slate-400">
                      {stage.id}
                    </span>
                  </div>

                  <h3 className="text-xs font-bold text-slate-900 leading-snug">
                    {stage.title}
                  </h3>
                  <span className="inline-block mt-1 text-[10px] font-semibold text-blue-600">
                    {stage.badge}
                  </span>
                </div>

                <p className="text-[11px] text-slate-500 mt-2 line-clamp-3 leading-relaxed">
                  {stage.summary}
                </p>
              </div>
            );
          })}
        </div>

        {/* Selected Stage Detail Card */}
        <div className="p-5 rounded-2xl bg-slate-900 text-white border border-slate-800 space-y-2">
          <div className="flex items-center space-x-2 text-cyan-300 text-xs font-bold font-mono">
            <span>Stage {pipelineStages[activeStage].id}: {pipelineStages[activeStage].title}</span>
            <span>•</span>
            <span className="text-slate-400">{pipelineStages[activeStage].badge}</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans">
            {pipelineStages[activeStage].technicalDetails}
          </p>
        </div>
      </div>

      {/* 13. FEATURE ENGINEERING MATHEMATICAL FORMULAS */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-7 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Engineered Financial Indicator Formulas
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Exact mathematical representations with division-by-zero numerical protections
            </p>
          </div>

          <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Python Implemented</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {formulas.map((f) => (
            <div
              key={f.name}
              className="p-4 rounded-xl border border-slate-200/90 bg-slate-50/50 hover:bg-slate-50 transition-colors space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-xs text-blue-700">
                  {f.name}
                </span>
                <span className="text-[11px] font-semibold text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded">
                  {f.target}
                </span>
              </div>

              {/* Exact Formula Code Box */}
              <div className="font-mono text-xs text-slate-900 bg-white px-3.5 py-2.5 rounded-lg border border-slate-200 font-semibold shadow-2xs">
                {f.code}
              </div>

              <p className="text-xs text-slate-600 leading-relaxed font-sans">
                {f.explanation}
              </p>

              <div className="text-[11px] text-slate-500 font-mono flex items-center space-x-1 pt-1 border-t border-slate-200/70">
                <span className="text-emerald-600 font-bold">✓ Safeguard:</span>
                <span>{f.safeguard}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 13. RESPONSIBLE AI & REGULATORY COMPLIANCE FRAMEWORK */}
      <div className="p-6 rounded-2xl border border-blue-200 bg-blue-50/70 space-y-3 text-xs text-blue-950 shadow-2xs">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-5 h-5 text-blue-700 shrink-0" />
          <h3 className="font-bold text-slate-900 uppercase tracking-wider text-xs">
            Responsible AI & Fiduciary Compliance Policy
          </h3>
        </div>
        <p className="leading-relaxed text-slate-700 text-xs">
          The Intelligent Loan Risk Assessment System is intentionally engineered as an augmented intelligence decision-support platform,
          never an automated underwriting arbiter. Credit decisions involve nuanced socio-economic factors, qualitative character
          assessments, and institutional risk appetites that purely statistical algorithms cannot unilaterally adjudicate.
        </p>
        <p className="leading-relaxed text-slate-600 text-xs">
          The model predicts an empirical default probability P(TARGET = 1) and highlights the most statistically
          influential factors to accelerate underwriter preparation. The final fiduciary lending determination remains solely
          with the authorized human financial reviewer in accordance with FCRA and ECOA fair lending regulations.
        </p>
      </div>
    </div>
  );
};
