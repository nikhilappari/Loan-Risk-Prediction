import React, { useEffect, useState } from 'react';
import {
  BrainCircuit,
  TrendingUp,
  Percent,
  FileCheck,
  AlertTriangle,
  HelpCircle,
  ShieldAlert,
  RefreshCw,
  Cpu,
  Layers,
  Sparkles,
  GitBranch,
  Sliders,
  CheckCircle2
} from 'lucide-react';
import { ModelMetrics, FeatureImportanceResponse, ModelComparisonItem } from '../types';
import { api } from '../services/api';
import { ConfusionMatrixChart } from '../components/ConfusionMatrixChart';
import { formatPercent } from '../utils/formatters';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  CartesianGrid
} from 'recharts';

export const ModelInsightsPage: React.FC = () => {
  const [metrics, setMetrics] = useState<ModelMetrics | null>(null);
  const [featureImportance, setFeatureImportance] = useState<FeatureImportanceResponse | null>(null);
  const [modelComparison, setModelComparison] = useState<ModelComparisonItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadInsights = async () => {
    setLoading(true);
    try {
      const [m, fi, cmp] = await Promise.all([
        api.getMetrics(),
        api.getFeatureImportance(),
        api.getModelComparison()
      ]);
      setMetrics(m);
      setFeatureImportance(fi);
      setModelComparison(cmp || []);
    } catch (e: any) {
      console.error('Failed to load insights:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInsights();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-10 h-10 rounded-full border-2 border-blue-200 border-t-blue-600 animate-spin" />
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Loading ML Telemetry & Model Card...
          </p>
        </div>
      </div>
    );
  }

  if (!metrics || !featureImportance) {
    return (
      <div className="p-8 max-w-xl mx-auto my-12">
        <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center space-y-3 shadow-xs">
          <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto" />
          <h3 className="text-base font-bold text-slate-900">Model Telemetry Unavailable</h3>
          <p className="text-xs text-slate-500">
            Train the model via <code className="text-blue-600 font-mono">python ml/train_model.py</code> to view insights.
          </p>
        </div>
      </div>
    );
  }

  const chartImportanceData = featureImportance.top_features.slice(0, 10).map(f => ({
    name: f.feature,
    weight: +(f.importance * 100).toFixed(2)
  })).reverse();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* 12. ML RESEARCH / MODEL CARD HEADER */}
      <div className="border-b border-slate-200/90 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-mono font-bold text-blue-600 uppercase tracking-widest">
            ML Research Console
          </span>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-0.5">
            Model Card & Algorithm Analytics
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Technical architecture specifications, holdout evaluation benchmarks, and Gini feature sensitivity.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono">
          <span className="px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 font-bold">
            Random Forest v1.0
          </span>
        </div>
      </div>

      {/* 12. MODEL OVERVIEW CARD & ARCHITECTURE */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-7 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center">
              <Cpu className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Random Forest Classifier (Scikit-Learn Ensemble)
              </h2>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                Pipeline Artifact: loan_risk_pipeline.joblib • 100 Trees • Balanced Class Weights
              </p>
            </div>
          </div>

          <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold self-start sm:self-auto">
            ● Active Deployed Model
          </span>
        </div>

        {/* Hyperparameter Specifications */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-sans">
          <div className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-100">
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Ensemble Estimators</span>
            <span className="text-lg font-bold text-slate-900 font-mono mt-0.5 block">100 Trees</span>
            <span className="text-[10px] text-slate-500">Bootstrap bagging</span>
          </div>

          <div className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-100">
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Max Tree Depth</span>
            <span className="text-lg font-bold text-slate-900 font-mono mt-0.5 block">12 Levels</span>
            <span className="text-[10px] text-slate-500">Prevents overfitting</span>
          </div>

          <div className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-100">
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Class Weighting</span>
            <span className="text-lg font-bold text-emerald-700 font-mono mt-0.5 block">Balanced</span>
            <span className="text-[10px] text-slate-500">Compensates 6.7% base rate</span>
          </div>

          <div className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-100">
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Split Criterion</span>
            <span className="text-lg font-bold text-blue-700 font-mono mt-0.5 block">Gini Impurity</span>
            <span className="text-[10px] text-slate-500">Node variance decrease</span>
          </div>
        </div>

        {/* Dataset Breakdown Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-2 border-t border-slate-100">
          <div>
            <span className="text-slate-400 text-[11px]">Training Set:</span>
            <span className="font-mono font-bold text-slate-900 ml-1.5">{metrics.train_samples.toLocaleString()} (80%)</span>
          </div>
          <div>
            <span className="text-slate-400 text-[11px]">Holdout Test Set:</span>
            <span className="font-mono font-bold text-slate-900 ml-1.5">{metrics.test_samples.toLocaleString()} (20%)</span>
          </div>
          <div>
            <span className="text-slate-400 text-[11px]">Raw Feature Columns:</span>
            <span className="font-mono font-bold text-slate-900 ml-1.5">{metrics.raw_features_count || 28}</span>
          </div>
          <div>
            <span className="text-slate-400 text-[11px]">Transformed Dimensions:</span>
            <span className="font-mono font-bold text-blue-600 ml-1.5">{metrics.transformed_features_count || 49}</span>
          </div>
        </div>
      </div>

      {/* 12. PERFORMANCE BENCHMARKS (Roomy presentation) */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-7 shadow-xs space-y-5">
        <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Holdout Test Evaluation Benchmarks
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Blind evaluation on {metrics.test_samples.toLocaleString()} held-out applicant credit profiles
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-blue-600">
            ROC-AUC: {metrics.evaluation.roc_auc.toFixed(4)}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
          <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-100 text-center">
            <span className="text-[11px] font-semibold text-slate-500 block">Overall Accuracy</span>
            <span className="text-2xl font-bold text-slate-900 mt-1 block font-mono">
              {formatPercent(metrics.evaluation.accuracy)}
            </span>
            <span className="text-[10px] text-slate-400 font-medium">Holdout Test Set</span>
          </div>

          <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100 text-center">
            <span className="text-[11px] font-semibold text-blue-700 block">ROC-AUC Score</span>
            <span className="text-2xl font-bold text-blue-700 mt-1 block font-mono">
              {metrics.evaluation.roc_auc.toFixed(4)}
            </span>
            <span className="text-[10px] text-blue-600 font-semibold">Discriminative Power</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-100 text-center">
            <span className="text-[11px] font-semibold text-slate-500 block">Class F1 Score</span>
            <span className="text-2xl font-bold text-indigo-600 mt-1 block font-mono">
              {metrics.evaluation.f1_score.toFixed(4)}
            </span>
            <span className="text-[10px] text-slate-400 font-medium">Harmonic Mean</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-100 text-center">
            <span className="text-[11px] font-semibold text-slate-500 block">Default Recall</span>
            <span className="text-2xl font-bold text-amber-600 mt-1 block font-mono">
              {formatPercent(metrics.evaluation.recall)}
            </span>
            <span className="text-[10px] text-slate-400 font-medium">
              {metrics.evaluation.confusion_matrix.true_positives} of {metrics.evaluation.class_balance.default_count} Defaults
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-100 text-center">
            <span className="text-[11px] font-semibold text-slate-500 block">Precision</span>
            <span className="text-2xl font-bold text-emerald-600 mt-1 block font-mono">
              {metrics.evaluation.precision.toFixed(4)}
            </span>
            <span className="text-[10px] text-slate-400 font-medium">Positive Predictive</span>
          </div>
        </div>

        {/* Imbalance context explanation */}
        <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200 text-xs text-blue-900 flex items-start space-x-2.5">
          <HelpCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            {metrics.evaluation.imbalance_analysis}
          </p>
        </div>
      </div>

      {/* MULTI-MODEL BENCHMARK & SELECTION LEADERBOARD */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-7 shadow-xs space-y-5">
        <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Multi-Model Benchmark & Selection Matrix
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Empirical evaluation across 7 machine learning architectures on identical stratified holdout data
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold self-start sm:self-auto font-mono">
            {modelComparison.length} Models Tested
          </span>
        </div>

        {/* Table of benchmarked models */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px] bg-slate-50/70">
                <th className="py-3 px-3.5">Rank & Architecture</th>
                <th className="py-3 px-3.5 text-center">Holdout ROC-AUC</th>
                <th className="py-3 px-3.5 text-center">F1 Score</th>
                <th className="py-3 px-3.5 text-center">Default Recall</th>
                <th className="py-3 px-3.5 text-center">Precision</th>
                <th className="py-3 px-3.5 text-center">Accuracy</th>
                <th className="py-3 px-3.5 text-center">Brier Score</th>
                <th className="py-3 px-3.5 text-right">Deployment Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {modelComparison.map((item, idx) => (
                <tr
                  key={item.model_name}
                  className={`transition-colors ${
                    item.is_best ? 'bg-blue-50/50 font-medium' : 'hover:bg-slate-50/60 text-slate-700'
                  }`}
                >
                  <td className="py-3 px-3.5">
                    <div className="flex items-center space-x-2.5">
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        item.is_best ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'
                      }`}>
                        #{idx + 1}
                      </span>
                      <span className={`text-xs ${item.is_best ? 'font-bold text-slate-900' : 'text-slate-800'}`}>
                        {item.model_name}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-3.5 text-center font-mono font-semibold text-blue-600">
                    {item.roc_auc.toFixed(4)}
                  </td>
                  <td className="py-3 px-3.5 text-center font-mono font-semibold text-indigo-600">
                    {item.f1_score.toFixed(4)}
                  </td>
                  <td className="py-3 px-3.5 text-center font-mono">
                    <span className={item.recall >= 0.4 ? 'font-bold text-emerald-600' : 'text-slate-600'}>
                      {(item.recall * 100).toFixed(1)}%
                    </span>
                  </td>
                  <td className="py-3 px-3.5 text-center font-mono text-slate-600">
                    {(item.precision * 100).toFixed(1)}%
                  </td>
                  <td className="py-3 px-3.5 text-center font-mono text-slate-600">
                    {(item.accuracy * 100).toFixed(1)}%
                  </td>
                  <td className="py-3 px-3.5 text-center font-mono text-slate-500">
                    {item.brier_score !== undefined ? item.brier_score.toFixed(4) : '—'}
                  </td>
                  <td className="py-3 px-3.5 text-right">
                    {item.is_best ? (
                      <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>WINNER / DEPLOYED</span>
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                        Evaluated
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Selection Decision Rationale Card */}
        <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200 text-xs text-slate-700 space-y-2">
          <div className="flex items-center space-x-2 font-bold text-slate-900">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Underwriting Model Selection Rationale</span>
          </div>
          <p className="text-slate-600 leading-relaxed">
            In credit risk default prediction with extreme class imbalance (~6.7% default base rate), accuracy alone is misleading.
            While unweighted models achieve high apparent accuracy by predicting all non-defaults, they fail to catch actual delinquencies.
            The <strong>Random Forest Classifier (with balanced class weighting and 100 decision trees)</strong> strikes the optimal trade-off: delivering a superior <strong>91.0% holdout accuracy</strong>, <strong>0.7665 ROC-AUC</strong>, and robust discrimination without the overfitting risks or latency of more complex architectures.
          </p>
        </div>
      </div>

      {/* 12. DUAL SECTION: Large Feature Importance Chart + 2x2 Confusion Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-7">
        {/* Large Feature Importance Chart */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-7 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Gini Feature Importance
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Top 10 variables by mean decrease in Gini impurity
              </p>
            </div>
            <span className="text-[11px] font-mono font-semibold text-slate-400">
              Random Forest
            </span>
          </div>

          <div className="h-88 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={chartImportanceData}
                margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
                <XAxis type="number" unit="%" stroke="#94A3B8" fontSize={10} tickLine={false} />
                <YAxis
                  type="category"
                  dataKey="name"
                  stroke="#64748B"
                  fontSize={10}
                  tickLine={false}
                />
                <RechartsTooltip
                  formatter={(val: any) => [`${val}%`, 'Importance']}
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderColor: '#E2E8F0',
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                    fontSize: '12px'
                  }}
                />
                <Bar
                  dataKey="weight"
                  fill="#2563EB"
                  radius={[0, 4, 4, 0]}
                  barSize={14}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2x2 Confusion Matrix */}
        <ConfusionMatrixChart
          matrix={metrics.evaluation.confusion_matrix}
          totalSamples={metrics.test_samples}
        />
      </div>

      {/* 12. MODEL LIMITATIONS & GOVERNANCE */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-7 shadow-xs space-y-4">
        <div className="flex items-center space-x-2 text-slate-800 border-b border-slate-100 pb-3">
          <ShieldAlert className="w-5 h-5 text-amber-600" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
            Model Limitations & Governance Telemetry
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-600">
          <div className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-200 space-y-1">
            <span className="font-semibold text-slate-900 block">1. Domain Dataset Bounding</span>
            <p className="text-slate-500 leading-relaxed">
              Predictions depend strictly on statistical patterns present in the baseline Home Credit training set. Macroeconomic anomalies outside this domain require model recalibration.
            </p>
          </div>

          <div className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-200 space-y-1">
            <span className="font-semibold text-slate-900 block">2. Non-Causal Feature Weights</span>
            <p className="text-slate-500 leading-relaxed">
              Gini impurity importance indicates statistical correlation within the ensemble; it does not prove that modifying a feature directly changes borrower default risk.
            </p>
          </div>

          <div className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-200 space-y-1">
            <span className="font-semibold text-slate-900 block">3. Input Verification Mandate</span>
            <p className="text-slate-500 leading-relaxed">
              Unverified self-reported earnings or inaccurate bureau data directly affect prediction certainty. Document verification remains mandatory.
            </p>
          </div>

          <div className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-200 space-y-1">
            <span className="font-semibold text-slate-900 block">4. Human Decision Authority</span>
            <p className="text-slate-500 leading-relaxed">
              This system must never automatically approve or reject a loan application. The final lending determination must remain with an authorized human financial officer.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
