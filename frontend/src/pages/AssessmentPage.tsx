import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  User,
  IndianRupee,
  History,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  AlertCircle,
  FileCheck,
  ChevronDown,
  ChevronUp,
  Calendar,
  Clock,
  Layers
} from 'lucide-react';
import { ApplicantFormData } from '../types';
import { formatCurrency, formatRatio, formatPercent } from '../utils/formatters';

interface AssessmentPageProps {
  onSubmit: (data: ApplicantFormData) => void;
  isLoading: boolean;
  onBack?: () => void;
}

const PRESET_PRIME: ApplicantFormData = {
  applicant_name: 'Priya Sharma',
  applicant_ref: 'APP-PRIME-01',
  age_years: 45,
  code_gender: 'F',
  cnt_fam_members: 2,
  name_family_status: 'Married',
  name_education_type: 'Higher education',
  name_income_type: 'Commercial associate',
  occupation_type: 'Managers',
  amt_income_total: 280000,
  amt_credit: 350000,
  amt_annuity: 24000,
  employment_years: 12.0,
  flag_own_car: 'Y',
  flag_own_realty: 'Y',
  prev_loan_count: 5,
  active_loan_count: 1,
  total_bureau_credit: 500000,
  avg_bureau_credit: 100000,
  total_bureau_debt: 35000,
  total_overdue_amount: 0,
  max_overdue_amount: 0,
  avg_credit_day_overdue: 0
};

const PRESET_NEAR_PRIME: ApplicantFormData = {
  applicant_name: 'Vikram Patel',
  applicant_ref: 'APP-NEARPRIME-02',
  age_years: 32,
  code_gender: 'M',
  cnt_fam_members: 3,
  name_family_status: 'Married',
  name_education_type: 'Secondary / secondary special',
  name_income_type: 'Working',
  occupation_type: 'Core staff',
  amt_income_total: 140000,
  amt_credit: 420000,
  amt_annuity: 30000,
  employment_years: 4.5,
  flag_own_car: 'N',
  flag_own_realty: 'Y',
  prev_loan_count: 3,
  active_loan_count: 2,
  total_bureau_credit: 290000,
  avg_bureau_credit: 96600,
  total_bureau_debt: 95000,
  total_overdue_amount: 0,
  max_overdue_amount: 0,
  avg_credit_day_overdue: 0
};

const PRESET_SUBPRIME: ApplicantFormData = {
  applicant_name: 'Amit Verma',
  applicant_ref: 'APP-SUBPRIME-03',
  age_years: 23,
  code_gender: 'M',
  cnt_fam_members: 4,
  name_family_status: 'Single / not married',
  name_education_type: 'Lower secondary',
  name_income_type: 'Working',
  occupation_type: 'Laborers',
  amt_income_total: 45000,
  amt_credit: 380000,
  amt_annuity: 35000,
  employment_years: 0.8,
  flag_own_car: 'N',
  flag_own_realty: 'N',
  prev_loan_count: 6,
  active_loan_count: 4,
  total_bureau_credit: 420000,
  avg_bureau_credit: 70000,
  total_bureau_debt: 240000,
  total_overdue_amount: 24000,
  max_overdue_amount: 14000,
  avg_credit_day_overdue: 38
};

// Helper to safely coerce number or empty string
const toNum = (val: any, fallback = 0): number => {
  if (val === '' || val === null || val === undefined) return fallback;
  const n = Number(val);
  return isNaN(n) ? fallback : n;
};

export const AssessmentPage: React.FC<AssessmentPageProps> = ({ onSubmit, isLoading, onBack }) => {
  const [formData, setFormData] = useState<Record<string, any>>(PRESET_PRIME);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [reviewAccordions, setReviewAccordions] = useState({
    personal: true,
    financial: true,
    credit: true
  });

  const handleInputChange = (field: keyof ApplicantFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    if (formErrors[field]) {
      setFormErrors(prev => {
        const copy = { ...prev };
        delete copy[field];
        return copy;
      });
    }
  };

  const handleNumberChange = (field: keyof ApplicantFormData, rawVal: string) => {
    if (rawVal === '') {
      handleInputChange(field, '');
      return;
    }
    // Strip leading zero if user typed a number into a zero field (e.g. "05" -> "5")
    let cleaned = rawVal;
    if (cleaned.length > 1 && cleaned.startsWith('0') && cleaned[1] !== '.') {
      cleaned = cleaned.replace(/^0+/, '');
      if (cleaned === '') cleaned = '0';
    }
    handleInputChange(field, cleaned);
  };

  // Real-time calculation of derived financial indicators
  const snapshot = useMemo(() => {
    const income = Math.max(0, toNum(formData.amt_income_total, 0));
    const credit = Math.max(0, toNum(formData.amt_credit, 0));
    const annuity = Math.max(0, toNum(formData.amt_annuity, 0));
    const fam = Math.max(1, toNum(formData.cnt_fam_members, 1));
    const debt = Math.max(0, toNum(formData.total_bureau_debt, 0));
    const overdue = Math.max(0, toNum(formData.total_overdue_amount, 0));

    const loanIncomeRatio = income > 0 ? credit / Math.max(income, 1e-7) : 0;
    const creditAnnuityRatio = annuity > 0 ? credit / Math.max(annuity, 1e-7) : 0;
    const incomePerPerson = fam > 0 ? income / fam : 0;
    const debtToIncomeRatio = income > 0 ? debt / Math.max(income, 1e-7) : 0;
    const overdueToIncomeRatio = income > 0 ? overdue / Math.max(income, 1e-7) : 0;

    return {
      loanIncomeRatio,
      creditAnnuityRatio,
      incomePerPerson,
      debtToIncomeRatio,
      overdueToIncomeRatio
    };
  }, [formData]);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    const name = (formData.applicant_name || '').trim();
    const income = toNum(formData.amt_income_total, 0);
    const credit = toNum(formData.amt_credit, 0);
    const annuity = toNum(formData.amt_annuity, 0);
    const age = toNum(formData.age_years, 0);
    const fam = toNum(formData.cnt_fam_members, 0);
    const emp = toNum(formData.employment_years, 0);

    if (!name) errs.applicant_name = 'Applicant full name is required';
    if (income <= 0) errs.amt_income_total = 'Annual income must be greater than 0';
    if (credit <= 0) errs.amt_credit = 'Loan amount must be greater than 0';
    if (annuity <= 0) errs.amt_annuity = 'Annuity must be greater than 0';
    if (age < 18 || age > 100) errs.age_years = 'Age must be 18–100';
    if (fam < 1) errs.cnt_fam_members = 'Min 1 member';
    if (emp < 0) errs.employment_years = 'Cannot be negative';

    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      const sanitized: ApplicantFormData = {
        applicant_name: (formData.applicant_name || 'Applicant').trim(),
        applicant_ref: formData.applicant_ref || 'APP-NEW-01',
        age_years: toNum(formData.age_years, 30),
        code_gender: formData.code_gender || 'M',
        cnt_fam_members: toNum(formData.cnt_fam_members, 1),
        name_family_status: formData.name_family_status || 'Single / not married',
        name_education_type: formData.name_education_type || 'Higher education',
        name_income_type: formData.name_income_type || 'Working',
        occupation_type: formData.occupation_type || 'Core staff',
        amt_income_total: toNum(formData.amt_income_total, 0),
        amt_credit: toNum(formData.amt_credit, 0),
        amt_annuity: toNum(formData.amt_annuity, 0),
        employment_years: toNum(formData.employment_years, 0),
        flag_own_car: formData.flag_own_car || 'N',
        flag_own_realty: formData.flag_own_realty || 'N',
        prev_loan_count: toNum(formData.prev_loan_count, 0),
        active_loan_count: toNum(formData.active_loan_count, 0),
        total_bureau_credit: toNum(formData.total_bureau_credit, 0),
        avg_bureau_credit: toNum(formData.avg_bureau_credit, 0),
        total_bureau_debt: toNum(formData.total_bureau_debt, 0),
        total_overdue_amount: toNum(formData.total_overdue_amount, 0),
        max_overdue_amount: toNum(formData.max_overdue_amount, 0),
        avg_credit_day_overdue: toNum(formData.avg_credit_day_overdue, 0)
      };
      onSubmit(sanitized);
    }
  };

  const steps = [
    { num: 1, title: 'Personal', icon: User },
    { num: 2, title: 'Financial', icon: IndianRupee },
    { num: 3, title: 'Credit History', icon: History },
    { num: 4, title: 'Review & Run', icon: CheckCircle2 }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-7">
      {/* 5. TOP WORKSPACE HEADER (NOT A DASHBOARD) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/90 pb-5">
        <div>
          {onBack && (
            <button
              onClick={onBack}
              className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition mb-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Overview</span>
            </button>
          )}
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            New Loan Risk Assessment
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Enter applicant information to generate a model-based risk assessment.
          </p>
        </div>

        {/* 1-Click Institutional Borrower Presets */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-400 font-semibold flex items-center space-x-1">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Preset Profile:</span>
          </span>
          <button
            type="button"
            onClick={() => setFormData(PRESET_PRIME)}
            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition shadow-2xs"
          >
            Tier 1: Prime
          </button>
          <button
            type="button"
            onClick={() => setFormData(PRESET_NEAR_PRIME)}
            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 transition shadow-2xs"
          >
            Tier 2: Near-Prime
          </button>
          <button
            type="button"
            onClick={() => setFormData(PRESET_SUBPRIME)}
            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 transition shadow-2xs"
          >
            Tier 3: Subprime
          </button>
          <button
            type="button"
            onClick={() => setFormData({
              applicant_name: '',
              applicant_ref: `APP-${Date.now().toString().slice(-4)}`,
              age_years: '' as any,
              code_gender: 'M',
              cnt_fam_members: '' as any,
              name_family_status: 'Single / not married',
              name_education_type: 'Higher education',
              name_income_type: 'Working',
              occupation_type: 'Core staff',
              amt_income_total: '' as any,
              amt_credit: '' as any,
              amt_annuity: '' as any,
              employment_years: '' as any,
              flag_own_car: 'N',
              flag_own_realty: 'N',
              prev_loan_count: '' as any,
              active_loan_count: '' as any,
              total_bureau_credit: '' as any,
              avg_bureau_credit: 0,
              total_bureau_debt: '' as any,
              total_overdue_amount: '' as any,
              max_overdue_amount: 0,
              avg_credit_day_overdue: '' as any
            })}
            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 text-slate-700 border border-slate-300 hover:bg-slate-200 transition shadow-2xs"
          >
            Clear / Blank
          </button>
        </div>
      </div>

      {/* Modern Stepper Indicator */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-2.5 shadow-xs">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {steps.map((s) => {
            const isActive = currentStep === s.num;
            const isDone = currentStep > s.num;
            const Icon = s.icon;
            return (
              <button
                key={s.num}
                type="button"
                onClick={() => setCurrentStep(s.num)}
                className={`flex items-center justify-center space-x-2.5 py-2.5 px-3 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs'
                    : isDone
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/80'
                    : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono shrink-0 ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : isDone
                      ? 'bg-emerald-200 text-emerald-800'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {isDone ? '✓' : s.num}
                </div>
                <span>{s.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2-COLUMN WORKSPACE: Main Form Workspace (Left) + Financial Snapshot (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
        {/* Main Form Workspace (Span 8) */}
        <div className="lg:col-span-8">
          <form onSubmit={handleSubmit}>
            <AnimatePresence mode="wait">
              {/* STEP 1: PERSONAL INFORMATION */}
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.22 }}
                  className="bg-white border border-slate-200/90 rounded-2xl p-7 shadow-xs space-y-6"
                >
                  <div className="border-b border-slate-100 pb-3">
                    <span className="text-[11px] font-mono font-bold text-blue-600 uppercase tracking-widest">
                      Section 01 of 04
                    </span>
                    <h2 className="text-lg font-bold text-slate-900 tracking-tight mt-0.5">
                      Personal & Household Information
                    </h2>
                    <p className="text-xs text-slate-500">
                      Applicant identity, demographic indicators, and family dependency load.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Applicant Full Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.applicant_name ?? ''}
                        onChange={e => handleInputChange('applicant_name', e.target.value)}
                        className="w-full light-input font-medium"
                        placeholder="e.g. Rahul Sharma"
                      />
                      {formErrors.applicant_name && (
                        <span className="text-xs text-rose-600 mt-1 block">{formErrors.applicant_name}</span>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Applicant Reference Code
                      </label>
                      <input
                        type="text"
                        value={formData.applicant_ref}
                        onChange={e => handleInputChange('applicant_ref', e.target.value)}
                        className="w-full light-input font-mono"
                        placeholder="APP-REF-001"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Age in Years
                      </label>
                      <input
                        type="number"
                        min={18}
                        max={100}
                        value={formData.age_years ?? ''}
                        onFocus={e => e.target.select()}
                        onChange={e => handleNumberChange('age_years', e.target.value)}
                        className="w-full light-input"
                        placeholder="e.g. 35"
                      />
                      {formErrors.age_years && (
                        <span className="text-xs text-rose-600 mt-1 block">{formErrors.age_years}</span>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Gender
                      </label>
                      <select
                        value={formData.code_gender}
                        onChange={e => handleInputChange('code_gender', e.target.value as any)}
                        className="w-full light-input"
                      >
                        <option value="M">Male (M)</option>
                        <option value="F">Female (F)</option>
                        <option value="XNA">Non-disclosed (XNA)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Family Members in Household
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={20}
                        value={formData.cnt_fam_members ?? ''}
                        onFocus={e => e.target.select()}
                        onChange={e => handleNumberChange('cnt_fam_members', e.target.value)}
                        className="w-full light-input"
                        placeholder="e.g. 2"
                      />
                      {formErrors.cnt_fam_members && (
                        <span className="text-xs text-rose-600 mt-1 block">{formErrors.cnt_fam_members}</span>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Marital Status
                      </label>
                      <select
                        value={formData.name_family_status}
                        onChange={e => handleInputChange('name_family_status', e.target.value)}
                        className="w-full light-input"
                      >
                        <option value="Married">Married</option>
                        <option value="Single / not married">Single / not married</option>
                        <option value="Civil marriage">Civil marriage</option>
                        <option value="Separated">Separated</option>
                        <option value="Widow">Widow</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Completed Education
                      </label>
                      <select
                        value={formData.name_education_type}
                        onChange={e => handleInputChange('name_education_type', e.target.value)}
                        className="w-full light-input"
                      >
                        <option value="Higher education">Higher education (Degree)</option>
                        <option value="Secondary / secondary special">Secondary / Technical school</option>
                        <option value="Incomplete higher">Incomplete higher</option>
                        <option value="Lower secondary">Lower secondary</option>
                        <option value="Academic degree">Academic degree (Postgraduate)</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition"
                    >
                      <span>Continue to Financial →</span>
                    </button>
                  </div>
                </motion.div>
              )}

              {/* STEP 2: FINANCIAL ANALYSIS WORKSPACE */}
              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.22 }}
                  className="bg-white border border-slate-200/90 rounded-2xl p-7 shadow-xs space-y-6"
                >
                  <div className="border-b border-slate-100 pb-3">
                    <span className="text-[11px] font-mono font-bold text-blue-600 uppercase tracking-widest">
                      Section 02 of 04
                    </span>
                    <h2 className="text-lg font-bold text-slate-900 tracking-tight mt-0.5">
                      Financial Capacity & Employment
                    </h2>
                    <p className="text-xs text-slate-500">
                      Declared earnings, requested loan obligations, and tenure stability.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Gross Annual Salary / Income (₹) <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="number"
                        step={1000}
                        min={0}
                        value={formData.amt_income_total ?? ''}
                        onFocus={e => e.target.select()}
                        onChange={e => handleNumberChange('amt_income_total', e.target.value)}
                        className="w-full light-input font-medium font-mono"
                        placeholder="e.g. 600000"
                      />
                      <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                        <span>Monthly equivalent:</span>
                        <span className="font-mono font-semibold text-blue-600">
                          {toNum(formData.amt_income_total) > 0 ? `${formatCurrency(Math.round(toNum(formData.amt_income_total) / 12))}/mo` : '₹0/mo'}
                        </span>
                      </div>
                      {formErrors.amt_income_total && (
                        <span className="text-xs text-rose-600 mt-1 block">{formErrors.amt_income_total}</span>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Monthly Salary Converter (₹/month)
                      </label>
                      <input
                        type="number"
                        step={500}
                        min={0}
                        value={formData.amt_income_total ? Math.round(toNum(formData.amt_income_total) / 12) : ''}
                        onFocus={e => e.target.select()}
                        onChange={e => {
                          const monthly = toNum(e.target.value, 0);
                          handleInputChange('amt_income_total', monthly > 0 ? (monthly * 12).toString() : '');
                        }}
                        className="w-full light-input font-medium font-mono bg-blue-50/40 border-blue-200/80 focus:bg-white"
                        placeholder="e.g. 50000"
                      />
                      <span className="text-[11px] text-slate-400 mt-1 block">
                        Calculates Annual Income automatically (Monthly × 12).
                      </span>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Requested Loan Amount (₹) <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="number"
                        step={5000}
                        min={0}
                        value={formData.amt_credit ?? ''}
                        onFocus={e => e.target.select()}
                        onChange={e => handleNumberChange('amt_credit', e.target.value)}
                        className="w-full light-input font-medium font-mono"
                        placeholder="e.g. 250000"
                      />
                      {formErrors.amt_credit && (
                        <span className="text-xs text-rose-600 mt-1 block">{formErrors.amt_credit}</span>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Scheduled Annuity (₹/year) <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="number"
                        step={500}
                        min={0}
                        value={formData.amt_annuity ?? ''}
                        onFocus={e => e.target.select()}
                        onChange={e => handleNumberChange('amt_annuity', e.target.value)}
                        className="w-full light-input font-medium font-mono"
                        placeholder="e.g. 36000"
                      />
                      <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                        <span>Estimated Monthly EMI:</span>
                        <span className="font-mono font-semibold text-slate-700">
                          {toNum(formData.amt_annuity) > 0 ? `${formatCurrency(Math.round(toNum(formData.amt_annuity) / 12))}/mo` : '₹0/mo'}
                        </span>
                      </div>
                      {formErrors.amt_annuity && (
                        <span className="text-xs text-rose-600 mt-1 block">{formErrors.amt_annuity}</span>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Employment Duration (Years)
                      </label>
                      <input
                        type="number"
                        step={0.5}
                        min={0}
                        max={70}
                        value={formData.employment_years ?? ''}
                        onFocus={e => e.target.select()}
                        onChange={e => handleNumberChange('employment_years', e.target.value)}
                        className="w-full light-input"
                        placeholder="e.g. 5"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Income Type
                      </label>
                      <select
                        value={formData.name_income_type}
                        onChange={e => handleInputChange('name_income_type', e.target.value)}
                        className="w-full light-input"
                      >
                        <option value="Commercial associate">Commercial associate</option>
                        <option value="Working">Working</option>
                        <option value="State servant">State servant</option>
                        <option value="Pensioner">Pensioner</option>
                        <option value="Student">Student</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Occupation Category
                      </label>
                      <select
                        value={formData.occupation_type}
                        onChange={e => handleInputChange('occupation_type', e.target.value)}
                        className="w-full light-input"
                      >
                        <option value="Managers">Managers</option>
                        <option value="Core staff">Core staff</option>
                        <option value="Laborers">Laborers</option>
                        <option value="Drivers">Drivers</option>
                        <option value="Sales staff">Sales staff</option>
                        <option value="Accountants">Accountants</option>
                        <option value="High skill tech staff">High skill tech staff</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Car Ownership</label>
                      <select
                        value={formData.flag_own_car}
                        onChange={e => handleInputChange('flag_own_car', e.target.value as any)}
                        className="w-full light-input"
                      >
                        <option value="Y">Yes (Owned)</option>
                        <option value="N">No (Not Owned)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Real Estate Ownership</label>
                      <select
                        value={formData.flag_own_realty}
                        onChange={e => handleInputChange('flag_own_realty', e.target.value as any)}
                        className="w-full light-input"
                      >
                        <option value="Y">Yes (Property Owned)</option>
                        <option value="N">No (Renting / No Property)</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-between pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold transition"
                    >
                      ← Back to Personal
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(3)}
                      className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition"
                    >
                      <span>Continue to Credit History →</span>
                    </button>
                  </div>
                </motion.div>
              )}

              {/* STEP 3: CREDIT PROFILE & TIMELINE */}
              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.22 }}
                  className="bg-white border border-slate-200/90 rounded-2xl p-7 shadow-xs space-y-6"
                >
                  <div className="border-b border-slate-100 pb-3">
                    <span className="text-[11px] font-mono font-bold text-blue-600 uppercase tracking-widest">
                      Section 03 of 04
                    </span>
                    <h2 className="text-lg font-bold text-slate-900 tracking-tight mt-0.5">
                      Credit History & Bureau Exposure
                    </h2>
                    <p className="text-xs text-slate-500">
                      Historical institutional borrowing lines, active debt sum, and delinquency durations.
                    </p>
                  </div>

                  {/* 7. Visual Credit Timeline Summary */}
                  <div className="bg-slate-50/70 border border-slate-200/70 rounded-xl p-4 space-y-3">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                      Credit Record Timeline
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div className="p-3 bg-white rounded-lg border border-slate-200/80 space-y-1">
                        <div className="flex items-center space-x-1.5 text-slate-500">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span className="font-semibold text-slate-700">Historical Accounts</span>
                        </div>
                        <div className="text-lg font-bold text-slate-900 font-mono">
                          {toNum(formData.prev_loan_count)} Total Loans
                        </div>
                        <span className="text-[10px] text-slate-400">Past Bureau Lines</span>
                      </div>

                      <div className="p-3 bg-white rounded-lg border border-slate-200/80 space-y-1">
                        <div className="flex items-center space-x-1.5 text-blue-600">
                          <Layers className="w-3.5 h-3.5" />
                          <span className="font-semibold text-blue-900">Current Borrowings</span>
                        </div>
                        <div className="text-lg font-bold text-blue-700 font-mono">
                          {toNum(formData.active_loan_count)} Active
                        </div>
                        <span className="text-[10px] text-slate-400">Currently Open Obligations</span>
                      </div>

                      <div className={`p-3 bg-white rounded-lg border space-y-1 ${
                        toNum(formData.total_overdue_amount) > 0 ? 'border-rose-200 bg-rose-50/30' : 'border-slate-200/80'
                      }`}>
                        <div className="flex items-center space-x-1.5">
                          <AlertCircle className={`w-3.5 h-3.5 ${toNum(formData.total_overdue_amount) > 0 ? 'text-rose-600' : 'text-emerald-500'}`} />
                          <span className="font-semibold text-slate-700">Delinquency Status</span>
                        </div>
                        <div className={`text-lg font-bold font-mono ${toNum(formData.total_overdue_amount) > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                          {toNum(formData.total_overdue_amount) > 0 ? formatCurrency(toNum(formData.total_overdue_amount)) : 'Zero Overdue'}
                        </div>
                        <span className="text-[10px] text-slate-400">
                          {toNum(formData.avg_credit_day_overdue) > 0 ? `${toNum(formData.avg_credit_day_overdue)} days delay` : 'No delinquency recorded'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Historical Bureau Loans Count
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={formData.prev_loan_count ?? ''}
                        onFocus={e => e.target.select()}
                        onChange={e => handleNumberChange('prev_loan_count', e.target.value)}
                        className="w-full light-input"
                        placeholder="e.g. 3"
                      />
                      <p className="text-[11px] text-slate-400 mt-1">Total credit lines previously opened.</p>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Active Loans Count
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={formData.active_loan_count ?? ''}
                        onFocus={e => e.target.select()}
                        onChange={e => handleNumberChange('active_loan_count', e.target.value)}
                        className="w-full light-input"
                        placeholder="e.g. 1"
                      />
                      <p className="text-[11px] text-slate-400 mt-1">Currently open obligations.</p>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Total Bureau Debt (₹)
                      </label>
                      <input
                        type="number"
                        step={5000}
                        min={0}
                        value={formData.total_bureau_debt ?? ''}
                        onFocus={e => e.target.select()}
                        onChange={e => handleNumberChange('total_bureau_debt', e.target.value)}
                        className="w-full light-input font-medium font-mono"
                        placeholder="0"
                      />
                      <p className="text-[11px] text-slate-400 mt-1">Outstanding debt across all bureau accounts.</p>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Total Overdue Delinquent (₹)
                      </label>
                      <input
                        type="number"
                        step={1000}
                        min={0}
                        value={formData.total_overdue_amount ?? ''}
                        onFocus={e => e.target.select()}
                        onChange={e => handleNumberChange('total_overdue_amount', e.target.value)}
                        className="w-full light-input font-medium font-mono text-rose-600"
                        placeholder="0"
                      />
                      <p className="text-[11px] text-slate-400 mt-1">Unpaid payments past due date.</p>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Total Bureau Historical Credit (₹)
                      </label>
                      <input
                        type="number"
                        step={10000}
                        min={0}
                        value={formData.total_bureau_credit ?? ''}
                        onFocus={e => e.target.select()}
                        onChange={e => handleNumberChange('total_bureau_credit', e.target.value)}
                        className="w-full light-input font-medium font-mono"
                        placeholder="0"
                      />
                      <p className="text-[11px] text-slate-400 mt-1">Aggregated credit limit across accounts.</p>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Average Days Overdue
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={formData.avg_credit_day_overdue ?? ''}
                        onFocus={e => e.target.select()}
                        onChange={e => handleNumberChange('avg_credit_day_overdue', e.target.value)}
                        className="w-full light-input"
                        placeholder="0"
                      />
                      <p className="text-[11px] text-slate-400 mt-1">Mean payment delay in calendar days.</p>
                    </div>
                  </div>

                  <div className="flex justify-between pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold transition"
                    >
                      ← Back to Financial
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(4)}
                      className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition"
                    >
                      <span>Continue to Review & Run →</span>
                    </button>
                  </div>
                </motion.div>
              )}

              {/* STEP 4: REVIEW & CONFIRMATION */}
              {currentStep === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.22 }}
                  className="bg-white border border-slate-200/90 rounded-2xl p-7 shadow-xs space-y-6"
                >
                  <div className="border-b border-slate-100 pb-3">
                    <span className="text-[11px] font-mono font-bold text-blue-600 uppercase tracking-widest">
                      Section 04 of 04
                    </span>
                    <h2 className="text-lg font-bold text-slate-900 tracking-tight mt-0.5">
                      Underwriter Review & Confirmation
                    </h2>
                    <p className="text-xs text-slate-500">
                      Verify applicant parameters before dispatching input to the Random Forest Classifier.
                    </p>
                  </div>

                  {/* 8. Expandable Sections */}
                  <div className="space-y-3 text-xs">
                    {/* Applicant Profile Accordion */}
                    <div className="rounded-xl border border-slate-200 overflow-hidden">
                      <button
                        type="button"
                        onClick={() => setReviewAccordions(prev => ({ ...prev, personal: !prev.personal }))}
                        className="w-full flex items-center justify-between p-3.5 bg-slate-50/80 font-bold text-slate-800 hover:bg-slate-100/70 transition"
                      >
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4 text-blue-600" />
                          <span>Applicant Profile: {formData.applicant_name || 'Applicant'} ({formData.applicant_ref})</span>
                        </div>
                        {reviewAccordions.personal ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                      {reviewAccordions.personal && (
                        <div className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white">
                          <div>
                            <span className="text-slate-400 block text-[10px]">Full Name</span>
                            <span className="font-semibold text-slate-800 truncate block">{formData.applicant_name || '—'}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[10px]">Age</span>
                            <span className="font-semibold text-slate-800">{toNum(formData.age_years)} yrs</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[10px]">Gender</span>
                            <span className="font-semibold text-slate-800">{formData.code_gender}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[10px]">Education</span>
                            <span className="font-semibold text-slate-800 truncate block">{formData.name_education_type}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Financial Profile Accordion */}
                    <div className="rounded-xl border border-slate-200 overflow-hidden">
                      <button
                        type="button"
                        onClick={() => setReviewAccordions(prev => ({ ...prev, financial: !prev.financial }))}
                        className="w-full flex items-center justify-between p-3.5 bg-slate-50/80 font-bold text-slate-800 hover:bg-slate-100/70 transition"
                      >
                        <div className="flex items-center space-x-2">
                          <IndianRupee className="w-4 h-4 text-emerald-600" />
                          <span>Financial Capacity & Requested Loan</span>
                        </div>
                        {reviewAccordions.financial ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                      {reviewAccordions.financial && (
                        <div className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white">
                          <div>
                            <span className="text-slate-400 block text-[10px]">Annual Income</span>
                            <span className="font-semibold text-slate-800 font-mono">{formatCurrency(toNum(formData.amt_income_total))}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[10px]">Requested Credit</span>
                            <span className="font-semibold text-slate-800 font-mono">{formatCurrency(toNum(formData.amt_credit))}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[10px]">Annuity/yr</span>
                            <span className="font-semibold text-slate-800 font-mono">{formatCurrency(toNum(formData.amt_annuity))}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[10px]">Employment Tenure</span>
                            <span className="font-semibold text-slate-800">{toNum(formData.employment_years)} yrs</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Credit Profile Accordion */}
                    <div className="rounded-xl border border-slate-200 overflow-hidden">
                      <button
                        type="button"
                        onClick={() => setReviewAccordions(prev => ({ ...prev, credit: !prev.credit }))}
                        className="w-full flex items-center justify-between p-3.5 bg-slate-50/80 font-bold text-slate-800 hover:bg-slate-100/70 transition"
                      >
                        <div className="flex items-center space-x-2">
                          <History className="w-4 h-4 text-indigo-600" />
                          <span>Credit Bureau Record</span>
                        </div>
                        {reviewAccordions.credit ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                      {reviewAccordions.credit && (
                        <div className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white">
                          <div>
                            <span className="text-slate-400 block text-[10px]">Active Loans</span>
                            <span className="font-semibold text-slate-800">{toNum(formData.active_loan_count)} of {toNum(formData.prev_loan_count)}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[10px]">Outstanding Debt</span>
                            <span className="font-semibold text-slate-800 font-mono">{formatCurrency(toNum(formData.total_bureau_debt))}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[10px]">Overdue Delinquency</span>
                            <span className={`font-semibold font-mono ${toNum(formData.total_overdue_amount) > 0 ? 'text-rose-600' : 'text-slate-800'}`}>
                              {formatCurrency(toNum(formData.total_overdue_amount))}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[10px]">Average Delay</span>
                            <span className="font-semibold text-slate-800">{toNum(formData.avg_credit_day_overdue)} days</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Fiduciary Notice */}
                  <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 text-xs text-blue-900 flex items-start space-x-2.5">
                    <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <p className="leading-relaxed">
                      Executing inference will calculate all 7 non-linear ratios and evaluate default probability via the trained Random Forest Classifier (100 Decision Trees, Balanced Class Weights). The result serves as decision-support guidance for underwriting officers.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(3)}
                      className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold transition"
                    >
                      ← Back to Credit History
                    </button>

                    {/* 8. Large Primary "Run Risk Assessment" CTA */}
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full sm:w-auto px-8 py-3.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 shadow-md shadow-blue-500/25 active:scale-98 transition-all flex items-center justify-center space-x-2"
                    >
                      <span>{isLoading ? 'Running Risk Assessment...' : 'Run Risk Assessment →'}</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </div>

        {/* 6. Sticky Financial Snapshot Panel (Right, Span 4) */}
        <div className="lg:col-span-4 sticky top-20 space-y-4">
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                  Financial Snapshot
                </h3>
                <p className="text-[11px] text-slate-500">Live indicators computed from input</p>
              </div>
              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Live Sync
              </span>
            </div>

            {/* Calculated Metric Visualizations */}
            <div className="space-y-3.5 text-xs">
              {/* Ratio 1: Loan / Income */}
              <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-100 space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 font-medium">Loan / Income</span>
                  <span className={`font-mono font-bold text-sm ${
                    snapshot.loanIncomeRatio > 4.0 ? 'text-rose-600' : snapshot.loanIncomeRatio > 3.0 ? 'text-amber-600' : 'text-slate-900'
                  }`}>
                    {formatRatio(snapshot.loanIncomeRatio)}
                  </span>
                </div>
                <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      snapshot.loanIncomeRatio > 4.0 ? 'bg-rose-500' : snapshot.loanIncomeRatio > 3.0 ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, Math.max(8, snapshot.loanIncomeRatio * 18))}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>Target: &lt; 3.5x</span>
                  <span>Leverage burden</span>
                </div>
              </div>

              {/* Ratio 2: Debt / Income */}
              <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-100 space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 font-medium">Bureau Debt / Income</span>
                  <span className={`font-mono font-bold text-sm ${
                    snapshot.debtToIncomeRatio > 1.0 ? 'text-rose-600' : snapshot.debtToIncomeRatio > 0.5 ? 'text-amber-600' : 'text-slate-900'
                  }`}>
                    {formatPercent(snapshot.debtToIncomeRatio)}
                  </span>
                </div>
                <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      snapshot.debtToIncomeRatio > 1.0 ? 'bg-rose-500' : snapshot.debtToIncomeRatio > 0.5 ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, Math.max(8, snapshot.debtToIncomeRatio * 60))}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>Total bureau exposure</span>
                </div>
              </div>

              {/* Ratio 3: Income / Person */}
              <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-100 space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 font-medium">Income Per Person</span>
                  <span className="font-mono font-bold text-sm text-slate-900">
                    {formatCurrency(snapshot.incomePerPerson)}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400">Divided by {toNum(formData.cnt_fam_members, 1)} family member(s)</span>
              </div>

              {/* Ratio 4: Credit / Annuity */}
              <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-100 space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 font-medium">Credit / Annuity</span>
                  <span className="font-mono font-bold text-sm text-slate-900">
                    {snapshot.creditAnnuityRatio.toFixed(1)}x
                  </span>
                </div>
                <span className="text-[10px] text-slate-400">Amortization installments factor</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-400">
              Indicators compute with numerical zero-division guards.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
