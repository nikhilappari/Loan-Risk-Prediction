import React, { useEffect, useState } from 'react';
import { CheckCircle2, Cpu } from 'lucide-react';

interface LoadingOverlayProps {
  isLoading: boolean;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ isLoading }) => {
  const [stage, setStage] = useState(0);

  const stages = [
    'Analyzing applicant parameters...',
    'Processing non-linear financial ratios...',
    'Running Random Forest ensemble (100 trees)...',
    'Generating risk assessment & factor weights...'
  ];

  useEffect(() => {
    if (!isLoading) {
      setStage(0);
      return;
    }

    const t1 = setTimeout(() => setStage(1), 250);
    const t2 = setTimeout(() => setStage(2), 550);
    const t3 = setTimeout(() => setStage(3), 850);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [isLoading]);

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200/90 rounded-2xl p-7 max-w-sm w-full shadow-2xl space-y-5 text-center">
        {/* Animated AI Processing Ring */}
        <div className="flex justify-center">
          <div className="relative flex items-center justify-center w-14 h-14">
            <div className="w-14 h-14 rounded-full border-2 border-slate-100 border-t-blue-600 border-r-cyan-400 animate-spin" />
            <Cpu className="w-6 h-6 text-blue-600 absolute" />
          </div>
        </div>

        <div className="space-y-1">
          <h3 className="text-base font-bold text-slate-900 tracking-tight">
            AI Underwriting Assessment
          </h3>
          <p className="text-xs text-slate-500">
            Real-time inference via FastAPI backend
          </p>
        </div>

        {/* Multi-stage Progress Flow */}
        <div className="space-y-2 text-left bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/70">
          {stages.map((text, idx) => {
            const isDone = stage > idx;
            const isCurrent = stage === idx;
            return (
              <div key={idx} className="flex items-center space-x-2.5 text-xs">
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : isCurrent ? (
                  <div className="w-3.5 h-3.5 rounded-full border-2 border-blue-600 border-t-transparent animate-spin shrink-0"></div>
                ) : (
                  <div className="w-3.5 h-3.5 rounded-full border border-slate-300 shrink-0"></div>
                )}
                <span
                  className={
                    isDone
                      ? 'text-slate-400'
                      : isCurrent
                      ? 'text-blue-700 font-semibold'
                      : 'text-slate-400'
                  }
                >
                  {text}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
