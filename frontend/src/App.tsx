import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Header, NavTab } from './components/Header';
import { LoadingOverlay } from './components/LoadingOverlay';
import { DashboardPage } from './pages/DashboardPage';
import { AssessmentPage } from './pages/AssessmentPage';
import { ResultPage } from './pages/ResultPage';
import { BatchAssessmentPage } from './pages/BatchAssessmentPage';
import { HistoryPage } from './pages/HistoryPage';
import { ModelInsightsPage } from './pages/ModelInsightsPage';
import { MethodologyPage } from './pages/MethodologyPage';
import { ApplicantFormData, RiskAssessmentResponse, HealthStatus, AssessmentHistoryItem } from './types';
import { api } from './services/api';
import { AlertCircle, X } from 'lucide-react';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [assessmentResult, setAssessmentResult] = useState<RiskAssessmentResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Initial Health check & polling
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const h = await api.getHealth();
        setHealth(h);
      } catch (e: any) {
        console.warn('Backend not yet reachable:', e.message);
      }
    };
    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleRunAssessment = async (data: ApplicantFormData) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const response = await api.predict(data);
      setAssessmentResult(response);
      setCurrentTab('new-assessment');
    } catch (err: any) {
      setErrorMessage(err.message || 'Error occurred during risk evaluation.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectHistoryItem = (item: AssessmentHistoryItem) => {
    const transformed: RiskAssessmentResponse = {
      assessment_id: item.assessment_id,
      applicant_name: item.applicant_name || 'Applicant',
      applicant_ref: item.applicant_ref,
      risk_probability: item.risk_probability,
      risk_percentage: +(item.risk_probability * 100).toFixed(1),
      risk_category: item.risk_category as any,
      confidence_level: 'Audited Record',
      assessment: 'Historical assessment report loaded from SQLite audit ledger.',
      human_review_required: true,
      human_review_notice:
        'This assessment is intended to support financial review. It does not automatically approve or reject a loan application.',
      recommendation: 'Historical assessment record. Review original underwriting documentation.',
      key_factors: item.key_factors,
      derived_indicators: {
        loan_income_ratio: item.loan_amount / Math.max(item.annual_income, 1),
        credit_annuity_ratio: 0,
        income_per_person: 0,
        debt_to_income_ratio: 0,
        overdue_to_income_ratio: 0,
        age_years: 0,
        employment_years: 0
      },
      timestamp: item.timestamp,
      model_version: item.model_version
    };
    setAssessmentResult(transformed);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans text-[#0F172A] relative">
      {/* Ambient background glows */}
      <div className="fixed top-0 right-1/4 w-[480px] h-[480px] bg-blue-200/20 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="fixed bottom-10 left-1/3 w-[560px] h-[560px] bg-cyan-200/20 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* 1 & 2. LIGHTWEIGHT TOP NAVIGATION HEADER (NO PERMANENT SIDEBAR) */}
      <Header
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          if (tab !== 'new-assessment') {
            setAssessmentResult(null);
          }
        }}
        health={health}
      />

      {/* FULL-WIDTH PURPOSE-BUILT WORKSPACE */}
      <main className="flex-1 overflow-y-auto fintech-bg-pattern relative">
        {errorMessage && (
          <div className="max-w-4xl mx-auto my-4 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between shadow-2xs">
            <div className="flex items-center space-x-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span className="font-semibold">{errorMessage}</span>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="p-1 hover:bg-rose-100 rounded text-rose-600 transition-colors"
              title="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Render Purpose-Built Active View */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentTab + (assessmentResult ? '-result' : '-form')}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.16, ease: 'easeOut' }}
          >
            {/* 4. AI Command Center Home */}
            {currentTab === 'dashboard' && (
              <DashboardPage
                onStartAssessment={() => {
                  setAssessmentResult(null);
                  setCurrentTab('new-assessment');
                }}
                onViewHistoryItem={(item) => {
                  handleSelectHistoryItem(item);
                  setCurrentTab('new-assessment');
                }}
                onNavigateToInsights={() => setCurrentTab('insights')}
                onNavigateToHistory={() => setCurrentTab('history')}
              />
            )}

            {/* 5 - 9. Financial Application Form / Risk Assessment Report */}
            {currentTab === 'new-assessment' && (
              assessmentResult ? (
                <ResultPage
                  result={assessmentResult}
                  onNewAssessment={() => setAssessmentResult(null)}
                  onViewHistory={() => setCurrentTab('history')}
                />
              ) : (
                <AssessmentPage
                  onSubmit={handleRunAssessment}
                  isLoading={isLoading}
                  onBack={() => setCurrentTab('dashboard')}
                />
              )
            )}

            {/* 10. Data Processing Workspace */}
            {currentTab === 'batch' && <BatchAssessmentPage />}

            {/* 11. Records Management Ledger */}
            {currentTab === 'history' && (
              <HistoryPage
                onSelectAssessment={(item) => {
                  handleSelectHistoryItem(item);
                  setCurrentTab('new-assessment');
                }}
              />
            )}

            {/* 12. ML Model Research Console */}
            {currentTab === 'insights' && <ModelInsightsPage />}

            {/* 13. Interactive Technical Documentation */}
            {currentTab === 'methodology' && <MethodologyPage />}
          </motion.div>
        </AnimatePresence>
      </main>

      <LoadingOverlay isLoading={isLoading} />
    </div>
  );
};

export default App;
