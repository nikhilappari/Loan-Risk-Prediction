import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  UploadCloud,
  FileSpreadsheet,
  Download,
  AlertCircle,
  Filter,
  RefreshCw,
  Search,
  CheckCircle2,
  FileText,
  ArrowUp,
  FileCheck,
  RotateCcw
} from 'lucide-react';
import { api } from '../services/api';
import { BatchPredictionResponse, BatchPredictionItem } from '../types';

export const BatchAssessmentPage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [fileStats, setFileStats] = useState<{ rows: number; cols: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [batchResponse, setBatchResponse] = useState<BatchPredictionResponse | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);

  const processFileInspection = (selectedFile: File) => {
    setFile(selectedFile);
    setError(null);
    setBatchResponse(null);

    // Read first few lines to inspect row and column count
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (text) {
        const lines = text.split('\n').filter(l => l.trim().length > 0);
        const headers = lines[0] ? lines[0].split(',') : [];
        setFileStats({
          rows: Math.max(0, lines.length - 1),
          cols: headers.length
        });
      }
    };
    reader.readAsText(selectedFile.slice(0, 100000));
  };

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const selected = e.dataTransfer.files[0];
      if (selected.name.endsWith('.csv')) {
        processFileInspection(selected);
      } else {
        setError('Only CSV files are supported for batch ingestion.');
      }
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      if (selected.name.endsWith('.csv')) {
        processFileInspection(selected);
      } else {
        setError('Only CSV files are supported for batch ingestion.');
      }
    }
  };

  const handleProcessBatch = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.batchPredict(file);
      setBatchResponse(res);
    } catch (e: any) {
      setError(e.message || 'Batch prediction failed. Verify CSV format matches required headers.');
    } finally {
      setLoading(false);
    }
  };

  const downloadSampleTemplate = () => {
    const headers = [
      'sk_id_curr',
      'applicant_ref',
      'amt_income_total',
      'amt_credit',
      'amt_annuity',
      'age_years',
      'employment_years',
      'code_gender',
      'cnt_fam_members',
      'name_education_type',
      'name_income_type',
      'name_family_status',
      'occupation_type',
      'flag_own_car',
      'flag_own_realty',
      'prev_loan_count',
      'active_loan_count',
      'total_bureau_credit',
      'avg_bureau_credit',
      'total_bureau_debt',
      'total_overdue_amount',
      'max_overdue_amount',
      'avg_credit_day_overdue'
    ].join(',');

    const rows = [
      '100001,BATCH-A,260000,320000,22000,45,12.0,F,2,Higher education,Commercial associate,Married,Managers,Y,Y,4,1,450000,112500,25000,0,0,0',
      '100002,BATCH-B,130000,420000,31000,34,4.2,M,3,Secondary / secondary special,Working,Married,Core staff,N,Y,3,2,280000,93300,85000,0,0,0',
      '100003,BATCH-C,48000,390000,34000,23,0.6,M,4,Lower secondary,Working,Single / not married,Laborers,N,N,6,4,450000,75000,230000,28000,18000,42'
    ].join('\n');

    const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent(headers + '\n' + rows);
    const link = document.createElement('a');
    link.setAttribute('href', csvContent);
    link.setAttribute('download', 'loan_risk_batch_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadResultsCSV = () => {
    if (!batchResponse) return;
    const headers = 'SK_ID_CURR,APPLICANT_REF,RISK_PROBABILITY,RISK_CATEGORY,HUMAN_REVIEW_REQUIRED,PRIMARY_FACTOR';
    const rows = batchResponse.results.map(r =>
      `${r.sk_id_curr || ''},"${r.applicant_ref}",${r.risk_probability},"${r.risk_category}",${r.human_review_required},"${r.top_factor}"`
    ).join('\n');

    const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent(headers + '\n' + rows);
    const link = document.createElement('a');
    link.setAttribute('href', csvContent);
    link.setAttribute('download', `batch_scored_results_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredResults = (batchResponse?.results || []).filter(item => {
    const matchesCategory = filterCategory === 'ALL' || item.risk_category === filterCategory;
    const matchesSearch =
      item.applicant_ref.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.sk_id_curr && item.sk_id_curr.toString().includes(searchTerm));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-7">
      {/* 10. BATCH DATA PROCESSING WORKSPACE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/90 pb-5">
        <div>
          <span className="text-[11px] font-mono font-bold text-blue-600 uppercase tracking-widest">
            Data Processing Workspace
          </span>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-0.5">
            Batch Portfolio Risk Assessment
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Ingest and score multiple applicant files concurrently via Scikit-Learn vectorized inference.
          </p>
        </div>

        <button
          onClick={downloadSampleTemplate}
          className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5 text-blue-600" />
          <span>Download CSV Template</span>
        </button>
      </div>

      {/* 10. LARGE FILE-PROCESSING UPLOAD AREA */}
      {!batchResponse && (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-10 shadow-xs space-y-6">
          <div
            onDragOver={e => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleFileDrop}
            className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all duration-200 flex flex-col items-center justify-center space-y-4 ${
              isDragging
                ? 'border-blue-500 bg-blue-50/40 scale-[1.01]'
                : 'border-slate-300 hover:border-blue-400 bg-slate-50/50'
            }`}
          >
            <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 text-blue-600 flex items-center justify-center shadow-xs">
              <UploadCloud className="w-7 h-7 stroke-[2.2]" />
            </div>

            <div className="space-y-1 max-w-sm">
              <h2 className="text-base font-bold text-slate-900">
                Upload Applicant Data
              </h2>
              <p className="text-xs text-slate-500">
                Drag & drop CSV file here, or click Browse to choose from your computer
              </p>
            </div>

            <label className="cursor-pointer px-5 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-800 transition shadow-2xs">
              Browse Files
              <input
                type="file"
                accept=".csv"
                onChange={handleFileInput}
                className="hidden"
              />
            </label>
          </div>

          {/* Uploaded File Preview Banner */}
          {file && (
            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900">{file.name}</div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {(file.size / 1024).toFixed(1)} KB • {fileStats?.rows || '—'} rows detected • {fileStats?.cols || '—'} columns
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Validated Ready</span>
                  </span>

                  <button
                    onClick={handleProcessBatch}
                    disabled={loading}
                    className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold shadow-xs transition flex items-center space-x-2"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Running Vector Pipeline...</span>
                      </>
                    ) : (
                      <span>Run Batch Assessment →</span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-center space-x-2 text-rose-700 text-xs bg-rose-50 p-4 rounded-xl border border-rose-200">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}
        </div>
      )}

      {/* 10. POST-PROCESSING DATA ANALYSIS WORKSPACE */}
      {batchResponse && (
        <div className="space-y-6">
          {/* Portfolio Summary Strip (NOT KPI CARDS — A clean horizontal distribution bar) */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                  Portfolio Scoring Summary: {batchResponse.total_processed} Applications Evaluated
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Vectorized Random Forest inference complete • Results logged to audit ledger
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setBatchResponse(null)}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Upload New Batch</span>
                </button>
                <button
                  onClick={downloadResultsCSV}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export Scored CSV</span>
                </button>
              </div>
            </div>

            {/* Visual Risk Distribution Strip */}
            <div className="space-y-2">
              <div className="h-3 w-full bg-slate-100 rounded-full flex overflow-hidden border border-slate-200">
                <div
                  style={{ width: `${(batchResponse.lower_risk_count / Math.max(1, batchResponse.total_processed)) * 100}%` }}
                  className="bg-emerald-500 h-full"
                  title="Lower Risk"
                />
                <div
                  style={{ width: `${(batchResponse.moderate_risk_count / Math.max(1, batchResponse.total_processed)) * 100}%` }}
                  className="bg-amber-500 h-full"
                  title="Moderate Risk"
                />
                <div
                  style={{ width: `${(batchResponse.higher_risk_count / Math.max(1, batchResponse.total_processed)) * 100}%` }}
                  className="bg-rose-500 h-full"
                  title="Higher Risk"
                />
              </div>

              <div className="flex justify-between text-xs text-slate-600 pt-1">
                <span className="flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  <strong className="text-slate-900">{batchResponse.lower_risk_count}</strong>
                  <span>Lower Risk ({((batchResponse.lower_risk_count / Math.max(1, batchResponse.total_processed)) * 100).toFixed(0)}%)</span>
                </span>
                <span className="flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                  <strong className="text-slate-900">{batchResponse.moderate_risk_count}</strong>
                  <span>Moderate ({((batchResponse.moderate_risk_count / Math.max(1, batchResponse.total_processed)) * 100).toFixed(0)}%)</span>
                </span>
                <span className="flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                  <strong className="text-slate-900">{batchResponse.higher_risk_count}</strong>
                  <span>Higher Risk ({((batchResponse.higher_risk_count / Math.max(1, batchResponse.total_processed)) * 100).toFixed(0)}%)</span>
                </span>
              </div>
            </div>
          </div>

          {/* Data Table Workspace with Search & Filter Tabs */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search applicant ref or ID..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="light-input pl-9 pr-3 py-1.5 text-xs w-60"
                  />
                </div>

                <div className="flex items-center space-x-1 text-xs">
                  {['ALL', 'LOWER RISK', 'MODERATE RISK', 'HIGHER RISK'].map((tier) => (
                    <button
                      key={tier}
                      onClick={() => setFilterCategory(tier)}
                      className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                        filterCategory === tier
                          ? 'bg-slate-900 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {tier === 'ALL' ? 'All' : tier.replace(' RISK', '')}
                    </button>
                  ))}
                </div>
              </div>

              <div className="text-xs text-slate-400 font-mono">
                Showing {filteredResults.length} of {batchResponse.total_processed} items
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-100">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">SK_ID_CURR</th>
                    <th className="py-3 px-4">Applicant Ref</th>
                    <th className="py-3 px-4">Risk Probability</th>
                    <th className="py-3 px-4">Risk Tier</th>
                    <th className="py-3 px-4">Primary Contributing Factor</th>
                    <th className="py-3 px-4 text-right">Review Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredResults.map((item, idx) => {
                    const isLow = item.risk_category === 'LOWER RISK';
                    const isMod = item.risk_category === 'MODERATE RISK';
                    return (
                      <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-medium text-slate-500">
                          {item.sk_id_curr || '—'}
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                          {item.applicant_ref}
                        </td>
                        <td className="py-3.5 px-4 font-semibold font-mono">
                          <span
                            className={
                              isLow
                                ? 'text-emerald-600'
                                : isMod
                                ? 'text-amber-600'
                                : 'text-rose-600'
                            }
                          >
                            {(item.risk_probability * 100).toFixed(1)}%
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border uppercase tracking-wider ${
                              isLow
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : isMod
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : 'bg-rose-50 text-rose-700 border-rose-200'
                            }`}
                          >
                            {item.risk_category}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600">
                          {item.top_factor || 'N/A'}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                            Review Required
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
