import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Plus,
  History,
  Cpu,
  ShieldCheck,
  TrendingUp,
  FileCheck,
  ArrowRight,
  AlertTriangle,
  RefreshCw,
  Sparkles,
  Layers,
  Clock,
  ChevronRight
} from 'lucide-react';
import { ModelMetrics, FeatureImportanceResponse, AssessmentHistoryItem } from '../types';
import { api } from '../services/api';
import { formatPercent, formatCurrency, formatDate } from '../utils/formatters';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip
} from 'recharts';

interface DashboardPageProps {
  onStartAssessment: () => void;
  onViewHistoryItem: (item: AssessmentHistoryItem) => void;
  onNavigateToInsights: () => void;
  onNavigateToHistory: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onStartAssessment,
  onViewHistoryItem,
  onNavigateToInsights,
  onNavigateToHistory
}) => {
  const [metrics, setMetrics] = useState<ModelMetrics | null>(null);
  const [featureImportance, setFeatureImportance] = useState<FeatureImportanceResponse | null>(null);
  const [history, setHistory] = useState<AssessmentHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [m, fi, h] = await Promise.all([
        api.getMetrics().catch(() => null),
        api.getFeatureImportance().catch(() => null),
        api.getHistory({ limit: 8 }).catch(() => ({ total: 0, items: [] }))
      ]);
      setMetrics(m);
      setFeatureImportance(fi);
      setHistory(h.items);
    } catch (e: any) {
      console.error('Failed to load command center data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-10 h-10 rounded-full border-2 border-blue-200 border-t-blue-600 animate-spin" />
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Connecting to Decision Support Engine...
          </p>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="p-8 max-w-xl mx-auto my-12">
        <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center space-y-4 shadow-xs">
          <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto" />
          <h2 className="text-lg font-bold text-slate-900">Model Pipeline Offline</h2>
          <p className="text-xs text-slate-500">
            Could not retrieve evaluation telemetry from the backend service. Ensure FastAPI is running on port 8000.
          </p>
          <button
            onClick={loadData}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  const riskCounts = {
    lower: history.filter(h => h.risk_category === 'LOWER RISK').length,
    moderate: history.filter(h => h.risk_category === 'MODERATE RISK').length,
    higher: history.filter(h => h.risk_category === 'HIGHER RISK').length
  };

  const donutData = [
    { name: 'Lower Risk', value: Math.max(riskCounts.lower, history.length === 0 ? 1 : 0), color: '#10B981' },
    { name: 'Moderate Risk', value: Math.max(riskCounts.moderate, history.length === 0 ? 0 : 0), color: '#F59E0B' },
    { name: 'Higher Risk', value: Math.max(riskCounts.higher, history.length === 0 ? 0 : 0), color: '#EF4444' }
  ].filter(d => d.value > 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* 4. AI COMMAND CENTER HERO */}
      <div className="relative rounded-3xl bg-gradient-to-br from-[#0F172A] via-[#111C44] to-[#172554] text-white p-8 sm:p-12 overflow-hidden shadow-md border border-slate-800">
        <div className="absolute -right-16 -top-16 w-96 h-96 rounded-full bg-cyan-500/15 blur-3xl pointer-events-none" />
        <div className="absolute right-1/3 -bottom-16 w-80 h-80 rounded-full bg-blue-500/10 blur-2xl pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none opacity-40" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="space-y-4 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold text-cyan-300">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Augmented Underwriting Intelligence • Human Oversight</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Intelligent Loan Risk Assessment
            </h1>

            <p className="text-sm sm:text-base text-slate-300 font-normal leading-relaxed">
              AI-powered decision support for financial risk evaluation.
            </p>

            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              <button
                onClick={onStartAssessment}
                className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 shadow-md shadow-blue-900/40 hover:-translate-y-0.5 active:scale-98 transition-all"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Start New Assessment</span>
              </button>

              <button
                onClick={onNavigateToHistory}
                className="inline-flex items-center space-x-2 px-5 py-3 rounded-xl text-sm font-semibold text-slate-200 bg-white/10 hover:bg-white/15 border border-white/15 backdrop-blur-sm transition"
              >
                <History className="w-4 h-4" />
                <span>View Assessment History</span>
              </button>
            </div>
          </div>

          {/* Quick Engine Telemetry Pillar inside Hero */}
          <div className="lg:w-72 bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-md space-y-3.5 shrink-0">
            <div className="flex items-center justify-between text-xs text-slate-300 border-b border-white/10 pb-2.5">
              <span className="font-semibold uppercase tracking-wider text-[11px] text-cyan-300">Engine Readiness</span>
              <span className="flex items-center space-x-1.5 font-mono text-[11px] text-emerald-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Active</span>
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Classifier:</span>
                <span className="font-mono text-white font-medium">Random Forest</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Base Estimators:</span>
                <span className="font-mono text-cyan-300 font-medium">100 Trees (Balanced)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Holdout ROC-AUC:</span>
                <span className="font-mono text-emerald-400 font-bold">{metrics.evaluation.roc_auc.toFixed(4)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Audit Protocol:</span>
                <span className="text-slate-300">Mandatory Human Review</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ASYMMETRIC COMPOSITION (Different card sizes, no 4 equal generic KPI boxes) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Large Model Intelligence & Architecture Card (Span 7) */}
        <div className="lg:col-span-7 bg-white border border-slate-200/90 rounded-2xl p-7 shadow-xs flex flex-col justify-between space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                <Cpu className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 tracking-tight">
                  Model Intelligence & Architecture
                </h3>
                <p className="text-xs text-slate-500">
                  Class-Balanced Random Forest (100 Decision Trees with Gini Impurity)
                </p>
              </div>
            </div>

            <button
              onClick={onNavigateToInsights}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center space-x-1"
            >
              <span>Explore Analytics</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Telemetry Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 text-xs font-sans">
            <div className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-100 space-y-1">
              <span className="text-[11px] text-slate-500 font-medium">Holdout Accuracy</span>
              <div className="text-xl font-bold text-slate-900 font-mono">
                {formatPercent(metrics.evaluation.accuracy)}
              </div>
              <span className="text-[10px] text-slate-400">1,200 test cases</span>
            </div>

            <div className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-100 space-y-1">
              <span className="text-[11px] text-slate-500 font-medium">ROC-AUC Discriminator</span>
              <div className="text-xl font-bold text-blue-600 font-mono">
                {metrics.evaluation.roc_auc.toFixed(4)}
              </div>
              <span className="text-[10px] text-blue-600 font-medium font-semibold">High separation</span>
            </div>

            <div className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-100 space-y-1">
              <span className="text-[11px] text-slate-500 font-medium">Class F1 Score</span>
              <div className="text-xl font-bold text-indigo-600 font-mono">
                {metrics.evaluation.f1_score.toFixed(4)}
              </div>
              <span className="text-[10px] text-slate-400">Balanced harmonic</span>
            </div>

            <div className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-100 space-y-1">
              <span className="text-[11px] text-slate-500 font-medium">Pipeline Features</span>
              <div className="text-xl font-bold text-slate-900 font-mono">
                49 Scaled
              </div>
              <span className="text-[10px] text-slate-400">ColumnTransformer</span>
            </div>

            <div className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-100 space-y-1">
              <span className="text-[11px] text-slate-500 font-medium">Class Imbalance</span>
              <div className="text-xl font-bold text-slate-900 font-mono">
                ~93% / 7%
              </div>
              <span className="text-[10px] text-emerald-600 font-medium">Class balanced</span>
            </div>

            <div className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-100 space-y-1">
              <span className="text-[11px] text-slate-500 font-medium">Total Audited Runs</span>
              <div className="text-xl font-bold text-slate-900 font-mono">
                {history.length}
              </div>
              <span className="text-[10px] text-slate-400">Logged in SQLite</span>
            </div>
          </div>

          <div className="text-xs text-slate-500 pt-2 border-t border-slate-100 flex items-center justify-between">
            <span className="flex items-center space-x-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>Augmented intelligence decision support — final underwriting action reserved for human reviewer.</span>
            </span>
          </div>
        </div>

        {/* Right: Portfolio Risk Distribution (Span 5) */}
        <div className="lg:col-span-5 bg-white border border-slate-200/90 rounded-2xl p-7 shadow-xs flex flex-col justify-between space-y-5">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Portfolio Risk Spectrum
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Breakdown across historical borrower evaluations
              </p>
            </div>
            <span className="text-[11px] font-semibold text-slate-600 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-200">
              Audited Ledger
            </span>
          </div>

          <div className="h-52 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={donutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {donutData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={2} stroke="#FFFFFF" />
                  ))}
                </Pie>
                <RechartsTooltip
                  formatter={(val: any) => [val, 'Applications']}
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderColor: '#E2E8F0',
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                    fontSize: '12px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-xs pt-3 border-t border-slate-100">
            <div className="p-2 rounded-xl bg-emerald-50/70 border border-emerald-100">
              <span className="text-[10px] font-bold text-emerald-800 uppercase block">Lower Risk</span>
              <span className="text-base font-bold text-emerald-700 font-mono mt-0.5 block">{riskCounts.lower}</span>
            </div>
            <div className="p-2 rounded-xl bg-amber-50/70 border border-amber-100">
              <span className="text-[10px] font-bold text-amber-800 uppercase block">Moderate</span>
              <span className="text-base font-bold text-amber-700 font-mono mt-0.5 block">{riskCounts.moderate}</span>
            </div>
            <div className="p-2 rounded-xl bg-rose-50/70 border border-rose-100">
              <span className="text-[10px] font-bold text-rose-800 uppercase block">Higher Risk</span>
              <span className="text-base font-bold text-rose-700 font-mono mt-0.5 block">{riskCounts.higher}</span>
            </div>
          </div>
        </div>
      </div>

      {/* RECENT ACTIVITY STREAM (Clean Underwriting Feed) */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-7 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Recent Underwriting Assessments
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Live audit stream of recent applicant queries and calibrated risk scores
            </p>
          </div>

          <button
            onClick={onNavigateToHistory}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center space-x-1"
          >
            <span>Full History Ledger</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {history.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center mx-auto">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div className="text-sm font-semibold text-slate-800">No assessments logged yet</div>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Click Start New Assessment above to process an applicant evaluation.
            </p>
            <button
              onClick={onStartAssessment}
              className="inline-flex items-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Start First Assessment</span>
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {history.slice(0, 6).map((item) => {
              const isLow = item.risk_category === 'LOWER RISK';
              const isMod = item.risk_category === 'MODERATE RISK';
              return (
                <div
                  key={item.id}
                  className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 px-2 rounded-xl transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 font-mono font-bold text-xs shrink-0">
                      ID
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-semibold text-slate-900 text-xs">{item.assessment_id}</span>
                        <span className="text-slate-300">•</span>
                        <span className="text-xs text-slate-700 font-medium">
                          {item.applicant_name ? `${item.applicant_name} (${item.applicant_ref})` : item.applicant_ref}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Loan: <span className="font-mono text-slate-600">{formatCurrency(item.loan_amount)}</span> • Income: <span className="font-mono text-slate-600">{formatCurrency(item.annual_income)}</span> • {formatDate(item.timestamp)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 self-end sm:self-auto">
                    <div className="text-right">
                      <div className="font-mono font-bold text-sm">
                        <span className={isLow ? 'text-emerald-600' : isMod ? 'text-amber-600' : 'text-rose-600'}>
                          {(item.risk_probability * 100).toFixed(1)}%
                        </span>
                      </div>
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                        isLow ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : isMod ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}>
                        {item.risk_category}
                      </span>
                    </div>

                    <button
                      onClick={() => onViewHistoryItem(item)}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition"
                    >
                      Review
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
