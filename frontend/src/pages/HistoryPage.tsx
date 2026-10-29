import React, { useEffect, useState, useMemo } from 'react';
import {
  Search,
  Filter,
  RefreshCw,
  X,
  ShieldCheck,
  Calendar,
  FileText,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ExternalLink
} from 'lucide-react';
import { AssessmentHistoryItem } from '../types';
import { api } from '../services/api';
import { formatCurrency, formatDate, formatPercent } from '../utils/formatters';

interface HistoryPageProps {
  onSelectAssessment: (item: AssessmentHistoryItem) => void;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({ onSelectAssessment }) => {
  const [items, setItems] = useState<AssessmentHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCat, setFilterCat] = useState<string>('ALL');
  const [search, setSearch] = useState<string>('');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'risk-desc' | 'risk-asc'>('date-desc');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 12;

  // Selected item for the side-drawer inspection
  const [drawerItem, setDrawerItem] = useState<AssessmentHistoryItem | null>(null);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await api.getHistory({
        risk_category: filterCat !== 'ALL' ? filterCat : undefined,
        limit: 200
      });
      setItems(res.items);
    } catch (e: any) {
      console.error('Failed to retrieve history records:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [filterCat]);

  // Filter & Sort
  const processedItems = useMemo(() => {
    let result = items.filter(i => {
      if (!search) return true;
      const term = search.toLowerCase();
      return (
        i.assessment_id.toLowerCase().includes(term) ||
        i.applicant_ref.toLowerCase().includes(term) ||
        (Boolean(i.applicant_name) && i.applicant_name!.toLowerCase().includes(term))
      );
    });

    result.sort((a, b) => {
      if (sortBy === 'date-desc') return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      if (sortBy === 'date-asc') return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
      if (sortBy === 'risk-desc') return b.risk_probability - a.risk_probability;
      if (sortBy === 'risk-asc') return a.risk_probability - b.risk_probability;
      return 0;
    });

    return result;
  }, [items, search, sortBy]);

  const totalPages = Math.ceil(processedItems.length / pageSize) || 1;
  const paginatedItems = processedItems.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* 11. RECORDS MANAGEMENT HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/90 pb-5">
        <div>
          <span className="text-[11px] font-mono font-bold text-blue-600 uppercase tracking-widest">
            Fiduciary Records
          </span>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-0.5">
            Assessment History & Audit Trail
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Immutable SQLite records of all underwriter queries, model predictions, and factor contributions.
          </p>
        </div>

        <button
          onClick={fetchHistory}
          disabled={loading}
          className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-600' : ''}`} />
          <span>Refresh Ledger</span>
        </button>
      </div>

      {/* 11. Professional Toolbar: Search, Risk Filters, Sorting */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search box */}
          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search assessment ID or ref..."
              value={search}
              onChange={e => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="light-input pl-9 pr-3 py-1.5 text-xs w-full"
            />
          </div>

          {/* Risk Tier Category Pills */}
          <div className="flex items-center space-x-1 text-xs">
            {['ALL', 'LOWER RISK', 'MODERATE RISK', 'HIGHER RISK'].map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setFilterCat(cat);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  filterCat === cat
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat === 'ALL' ? 'All Records' : cat.replace(' RISK', '')}
              </button>
            ))}
          </div>
        </div>

        {/* Sort Selector & Count */}
        <div className="flex items-center space-x-3 text-xs">
          <div className="flex items-center space-x-1.5 text-slate-500">
            <ArrowUpDown className="w-3.5 h-3.5" />
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="light-input py-1 px-2.5 text-xs text-slate-700 bg-white"
            >
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="risk-desc">Highest Risk First</option>
              <option value="risk-asc">Lowest Risk First</option>
            </select>
          </div>

          <span className="text-slate-400 font-mono text-[11px]">
            {processedItems.length} records
          </span>
        </div>
      </div>

      {/* 11. Full-Width Records Table */}
      <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-16 text-center text-slate-400 text-xs space-y-2">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-blue-600" />
            <p className="font-semibold text-slate-600">Retrieving audit database ledger...</p>
          </div>
        ) : processedItems.length === 0 ? (
          <div className="p-16 text-center text-slate-500 text-xs space-y-2">
            <FileText className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="font-bold text-slate-700">No records found</p>
            <p className="text-slate-400">Try adjusting your search criteria or risk tier filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">Assessment ID</th>
                  <th className="py-3.5 px-4">Applicant Ref</th>
                  <th className="py-3.5 px-4">Requested Loan</th>
                  <th className="py-3.5 px-4">Annual Income</th>
                  <th className="py-3.5 px-4">Risk Probability</th>
                  <th className="py-3.5 px-4">Risk Category</th>
                  <th className="py-3.5 px-4">Model Version</th>
                  <th className="py-3.5 px-4">Timestamp</th>
                  <th className="py-3.5 px-4 text-right">Audit Detail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {paginatedItems.map(item => {
                  const isLow = item.risk_category === 'LOWER RISK';
                  const isMod = item.risk_category === 'MODERATE RISK';
                  return (
                    <tr
                      key={item.id}
                      onClick={() => setDrawerItem(item)}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        {item.assessment_id}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-800">
                        <div>{item.applicant_name || item.applicant_ref}</div>
                        {item.applicant_name && (
                          <div className="text-[11px] font-mono text-slate-400">{item.applicant_ref}</div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-medium text-slate-900">
                        {formatCurrency(item.loan_amount)}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-500">
                        {formatCurrency(item.annual_income)}
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
                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400">
                        {item.model_version}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                        {formatDate(item.timestamp)}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDrawerItem(item);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
                        >
                          Inspect →
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {processedItems.length > pageSize && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <div>
              Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, processedItems.length)} of {processedItems.length} entries
            </div>

            <div className="flex items-center space-x-1.5">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-3 py-1 font-mono font-semibold text-slate-800">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 11. DETAIL SLIDE-OVER DRAWER FOR AUDIT INSPECTION */}
      {drawerItem && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex justify-end">
          <div className="bg-white w-full max-w-lg h-full shadow-2xl p-6 sm:p-7 space-y-6 overflow-y-auto border-l border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-mono font-bold text-blue-600 uppercase tracking-widest">
                  Audit Ledger Record
                </span>
                <h3 className="text-lg font-bold text-slate-900 tracking-tight mt-0.5">
                  {drawerItem.assessment_id}
                </h3>
                <p className="text-xs text-slate-500">Applicant: <strong className="text-slate-800">{drawerItem.applicant_name ? `${drawerItem.applicant_name} (${drawerItem.applicant_ref})` : drawerItem.applicant_ref}</strong></p>
              </div>

              <button
                onClick={() => setDrawerItem(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Risk Category Summary */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-slate-500 text-xs block">Predicted Default Probability</span>
                <span className="text-2xl font-bold font-mono text-slate-900 mt-0.5 block">
                  {(drawerItem.risk_probability * 100).toFixed(1)}%
                </span>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wider ${
                drawerItem.risk_category === 'LOWER RISK'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : drawerItem.risk_category === 'MODERATE RISK'
                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : 'bg-rose-50 text-rose-700 border-rose-200'
              }`}>
                {drawerItem.risk_category}
              </span>
            </div>

            {/* Financial Parameters */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Financial Baseline
              </h4>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-white rounded-lg border border-slate-200">
                  <span className="text-slate-400 text-[10px] block">Loan Amount</span>
                  <span className="font-mono font-bold text-slate-900">{formatCurrency(drawerItem.loan_amount)}</span>
                </div>
                <div className="p-3 bg-white rounded-lg border border-slate-200">
                  <span className="text-slate-400 text-[10px] block">Annual Income</span>
                  <span className="font-mono font-bold text-slate-900">{formatCurrency(drawerItem.annual_income)}</span>
                </div>
              </div>
            </div>

            {/* Contributing Factor Weights */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Ranked Model Factor Weights
              </h4>
              <div className="space-y-2">
                {drawerItem.key_factors.map((f, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-50/80 border border-slate-200/80 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-semibold text-slate-900">{f.display_name}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{f.description}</div>
                    </div>
                    <div className="text-right shrink-0 ml-3">
                      <div className="font-mono font-bold text-slate-900">{f.value}</div>
                      <div className="text-[10px] text-blue-600 font-semibold">{f.impact}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Bar */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
              <button
                onClick={() => setDrawerItem(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition"
              >
                Close Drawer
              </button>

              <button
                onClick={() => {
                  onSelectAssessment(drawerItem);
                  setDrawerItem(null);
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition flex items-center space-x-1.5"
              >
                <span>Open Full Report</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
