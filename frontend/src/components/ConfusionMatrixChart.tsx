import React from 'react';

interface ConfusionMatrixProps {
  matrix: {
    true_negatives: number;
    false_positives: number;
    false_negatives: number;
    true_positives: number;
  };
  totalSamples?: number;
}

export const ConfusionMatrixChart: React.FC<ConfusionMatrixProps> = ({ matrix, totalSamples }) => {
  const tn = matrix.true_negatives;
  const fp = matrix.false_positives;
  const fn = matrix.false_negatives;
  const tp = matrix.true_positives;
  const total = totalSamples || (tn + fp + fn + tp);

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-5">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">
            Confusion Matrix (Test Evaluation)
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Holdout performance on {total.toLocaleString()} test applicants (Threshold: 0.50)
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 max-w-md mx-auto pt-1">
        {/* True Negatives */}
        <div className="p-4 rounded-xl bg-green-50 border border-green-200 text-center">
          <div className="text-xs font-semibold text-green-700 uppercase tracking-wider">
            True Negatives (TN)
          </div>
          <div className="text-2xl font-bold text-green-800 mt-1">
            {tn.toLocaleString()}
          </div>
          <div className="text-[11px] text-green-600 mt-0.5">
            Repaid & Predicted Repaid
          </div>
        </div>

        {/* False Positives */}
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-center">
          <div className="text-xs font-semibold text-amber-700 uppercase tracking-wider">
            False Positives (FP)
          </div>
          <div className="text-2xl font-bold text-amber-800 mt-1">
            {fp.toLocaleString()}
          </div>
          <div className="text-[11px] text-amber-600 mt-0.5">
            Repaid but Flagged Risky
          </div>
        </div>

        {/* False Negatives */}
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-center">
          <div className="text-xs font-semibold text-red-700 uppercase tracking-wider">
            False Negatives (FN)
          </div>
          <div className="text-2xl font-bold text-red-800 mt-1">
            {fn.toLocaleString()}
          </div>
          <div className="text-[11px] text-red-600 mt-0.5">
            Defaulted but Missed
          </div>
        </div>

        {/* True Positives */}
        <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-center">
          <div className="text-xs font-semibold text-blue-700 uppercase tracking-wider">
            True Positives (TP)
          </div>
          <div className="text-2xl font-bold text-blue-800 mt-1">
            {tp.toLocaleString()}
          </div>
          <div className="text-[11px] text-blue-600 mt-0.5">
            Defaulted & Flagged
          </div>
        </div>
      </div>

      <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600 leading-relaxed">
        <span className="font-semibold text-slate-800">Class Imbalance Context: </span>
        Default cases constitute ~7% of historical loans. Using balanced weighting ensures the Random Forest
        identifies high-risk borrowers while minimizing unnecessary rejections.
      </div>
    </div>
  );
};
