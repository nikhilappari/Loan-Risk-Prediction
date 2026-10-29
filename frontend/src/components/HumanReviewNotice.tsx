import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, CheckSquare } from 'lucide-react';

interface HumanReviewNoticeProps {
  recommendation?: string;
}

export const HumanReviewNotice: React.FC<HumanReviewNoticeProps> = ({ recommendation }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: 'easeOut' }}
      className="bg-blue-50/80 border border-blue-200/90 rounded-2xl p-5 sm:p-6 text-slate-800 space-y-3 shadow-2xs"
    >
      <div className="flex items-center space-x-2.5 text-blue-700">
        <div className="w-8 h-8 rounded-lg bg-blue-100/70 border border-blue-200 flex items-center justify-center shrink-0">
          <ShieldCheck className="w-4 h-4 text-blue-600" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-slate-900 tracking-tight">
            Human Review Required
          </h4>
          <span className="text-[11px] text-blue-700 font-medium">
            Augmented Intelligence Underwriting Protocol
          </span>
        </div>
      </div>

      <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-sans">
        This assessment is intended to support financial review. It does not automatically approve or reject
        a loan application. An authorized financial underwriting officer must verify applicant circumstances,
        documentation, and compliance criteria before making a lending commitment.
      </p>

      {recommendation && (
        <div className="pt-3 border-t border-blue-200/70 flex items-start space-x-2 text-xs text-blue-950 bg-white/70 p-3 rounded-xl border border-blue-100">
          <CheckSquare className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <div className="leading-snug">
            <span className="font-bold text-blue-900">Underwriting Recommendation: </span>
            <span className="text-slate-800 font-medium">{recommendation}</span>
          </div>
        </div>
      )}
    </motion.div>
  );
};
