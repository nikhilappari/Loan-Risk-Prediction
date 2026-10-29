import React from 'react';
import {
  ArrowLeft,
  Printer,
  History,
  ShieldCheck,
  CheckSquare,
  FileSpreadsheet,
  AlertTriangle,
  RotateCcw,
  UserCheck
} from 'lucide-react';
import { RiskAssessmentResponse } from '../types';
import { RiskGauge } from '../components/RiskGauge';
import { FeatureImpactChart } from '../components/FeatureImpactChart';
import { formatCurrency, formatRatio, formatPercent, formatDate } from '../utils/formatters';

interface ResultPageProps {
  result: RiskAssessmentResponse;
  onNewAssessment: () => void;
  onViewHistory: () => void;
}

export const ResultPage: React.FC<ResultPageProps> = ({
  result,
  onNewAssessment,
  onViewHistory
}) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* 9. TOP REPORT HEADER (NOT A DASHBOARD) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/90 pb-5 print:hidden">
        <div>
          <button
            onClick={onNewAssessment}
            className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>← Back to Assessment</span>
          </button>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Risk Assessment Report
            </h1>
            <span className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-slate-100 text-slate-700 border border-slate-200">
              AUDITED
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 mt-1 font-mono">
            <span>ID: <strong className="text-slate-800">{result.assessment_id}</strong></span>
            <span>•</span>
            <span>Applicant: <strong className="text-slate-800">{result.applicant_name ? `${result.applicant_name} (${result.applicant_ref})` : result.applicant_ref}</strong></span>
            <span>•</span>
            <span>Date: <strong className="text-slate-800">{formatDate(result.timestamp)}</strong></span>
            <span>•</span>
            <span>Model: <strong className="text-slate-800">{result.model_version}</strong></span>
          </div>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={handlePrint}
            className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>

          <button
            onClick={onNewAssessment}
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>New Evaluation</span>
          </button>
        </div>
      </div>

      {/* 9. LARGE PREMIUM VISUAL RESULT SECTION (Dark Navy Card with Risk Gauge) */}
      <RiskGauge
        probability={result.risk_probability}
        category={result.risk_category}
        confidence={result.confidence_level}
      />

      {/* HUMAN REVIEW REQUIRED MANDATE */}
      <div className="bg-blue-50/80 border border-blue-200/90 rounded-2xl p-6 text-slate-800 space-y-3.5 shadow-2xs">
        <div className="flex items-center space-x-2.5 text-blue-800">
          <div className="w-8 h-8 rounded-lg bg-blue-100 border border-blue-200 flex items-center justify-center shrink-0 text-blue-700">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              Human Underwriter Review Required
            </h3>
            <span className="text-[11px] text-blue-700 font-medium">
              Augmented Decision Support Protocol
            </span>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-sans">
          This empirical evaluation is engineered to support financial review and does not automatically approve or reject a loan application. An authorized credit officer must independently verify physical applicant documentation, employment declarations, and organizational lending appetite before binding credit action.
        </p>

        {result.recommendation && (
          <div className="pt-3 border-t border-blue-200/70 flex items-start space-x-2.5 text-xs text-blue-950 bg-white/70 p-3.5 rounded-xl border border-blue-100">
            <CheckSquare className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div className="leading-snug">
              <span className="font-bold text-blue-900">Recommended Next Step: </span>
              <span className="text-slate-800 font-medium">{result.recommendation}</span>
            </div>
          </div>
        )}
      </div>

      {/* WHY THE MODEL PRODUCED THIS ASSESSMENT: Contributing Factor Weights */}
      <div className="space-y-2">
        <FeatureImpactChart factors={result.key_factors} />
      </div>

      {/* VERIFIED DERIVED FINANCIAL INDICATORS */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-7 shadow-xs space-y-4">
        <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Derived Financial Indicators & Burden Ratios
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Engineered non-linear ratios with numerical zero-division guards
            </p>
          </div>
          <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
            Validated
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          <div className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-100 text-center">
            <span className="text-[10px] text-slate-500 font-semibold uppercase block">Loan / Income</span>
            <span className="text-base font-bold text-slate-900 mt-1 block font-mono">
              {formatRatio(result.derived_indicators.loan_income_ratio)}
            </span>
            <span className="text-[10px] text-slate-400">Target &lt; 3.5x</span>
          </div>

          <div className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-100 text-center">
            <span className="text-[10px] text-slate-500 font-semibold uppercase block">Credit / Annuity</span>
            <span className="text-base font-bold text-slate-900 mt-1 block font-mono">
              {result.derived_indicators.credit_annuity_ratio.toFixed(1)}x
            </span>
            <span className="text-[10px] text-slate-400">Repayment term</span>
          </div>

          <div className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-100 text-center">
            <span className="text-[10px] text-slate-500 font-semibold uppercase block">Income / Person</span>
            <span className="text-base font-bold text-slate-900 mt-1 block font-mono">
              {formatCurrency(result.derived_indicators.income_per_person)}
            </span>
            <span className="text-[10px] text-slate-400">Per dependent</span>
          </div>

          <div className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-100 text-center">
            <span className="text-[10px] text-slate-500 font-semibold uppercase block">Debt / Income</span>
            <span className="text-base font-bold text-slate-900 mt-1 block font-mono">
              {formatPercent(result.derived_indicators.debt_to_income_ratio)}
            </span>
            <span className="text-[10px] text-slate-400">Bureau leverage</span>
          </div>

          <div className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-100 text-center col-span-2 sm:col-span-1">
            <span className="text-[10px] text-slate-500 font-semibold uppercase block">Overdue / Income</span>
            <span className={`text-base font-bold mt-1 block font-mono ${
              result.derived_indicators.overdue_to_income_ratio > 0 ? 'text-rose-600' : 'text-slate-900'
            }`}>
              {formatPercent(result.derived_indicators.overdue_to_income_ratio, 2)}
            </span>
            <span className="text-[10px] text-slate-400">Delinquency burden</span>
          </div>
        </div>
      </div>

      {/* UNDERWRITER SIGN-OFF & ATTESTATION BLOCK */}
      <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
        <div className="space-y-1">
          <div className="flex items-center space-x-1.5 font-bold text-slate-800">
            <UserCheck className="w-4 h-4 text-blue-600" />
            <span>Fiduciary Review Record</span>
          </div>
          <p className="text-slate-500 text-[11px]">
            This assessment has been logged to SQLite audit ledger ID {result.assessment_id}.
          </p>
        </div>

        <button
          onClick={onViewHistory}
          className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl font-semibold text-slate-700 transition self-start sm:self-auto shadow-2xs"
        >
          View Full Audit History Ledger →
        </button>
      </div>
    </div>
  );
};
