import React from 'react';
import { motion } from 'framer-motion';
import { KeyFactorItem } from '../types';
import { BarChart2, Info } from 'lucide-react';

interface FeatureImpactChartProps {
  factors: KeyFactorItem[];
}

export const FeatureImpactChart: React.FC<FeatureImpactChartProps> = ({ factors }) => {
  const getImpactBadge = (impact: string) => {
    switch (impact) {
      case 'Elevated Risk':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'Favorable Indicator':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Moderate Risk':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  // Find max weight for proportional normalization
  const maxWeight = Math.max(...factors.map(f => f.importance_weight), 0.05);

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-7 shadow-xs space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center">
            <BarChart2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Model Contributing Factors & Sensitivity
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Empirical decision factors ranked by statistical model importance.
            </p>
          </div>
        </div>

        <span className="text-[11px] font-semibold text-slate-500 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-full">
          Feature Weights
        </span>
      </div>

      <div className="space-y-4">
        {factors.map((factor, idx) => {
          const weightPct = factor.importance_weight * 100;
          const normalizedBarWidth = Math.min(100, Math.max(12, (factor.importance_weight / maxWeight) * 100));
          const badgeClass = getImpactBadge(factor.impact);

          return (
            <div key={idx} className="space-y-1.5 p-3 rounded-xl bg-slate-50/50 hover:bg-slate-50 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-1.5">
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-slate-900">{factor.display_name}</span>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${badgeClass}`}>
                    {factor.impact}
                  </span>
                </div>

                <div className="flex items-center space-x-3 text-slate-500">
                  <span className="font-medium text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200 text-[11px] font-mono">
                    Value: {factor.value}
                  </span>
                  <span className="text-blue-700 font-semibold font-mono text-[11px]">
                    Weight: {weightPct.toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* 18. Animated Horizontal Gradient Bar (Blue -> Cyan) */}
              <div className="h-2.5 w-full bg-slate-200/80 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full"
                  initial={{ width: 0 }}
                  whileInView={{ width: `${normalizedBarWidth}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.65, delay: idx * 0.05, ease: 'easeOut' }}
                />
              </div>

              <div className="text-[11px] text-slate-400 font-normal leading-tight pt-0.5">
                {factor.description}
              </div>
            </div>
          );
        })}
      </div>

      <div className="pt-3 text-[11px] text-slate-400 border-t border-slate-100 flex items-start space-x-2">
        <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Decision-Support Advisory:</strong> Model feature-importance values represent statistical sensitivity within the Random Forest ensemble and do not establish individual causality. Human underwriter verification is mandatory.
        </p>
      </div>
    </div>
  );
};
