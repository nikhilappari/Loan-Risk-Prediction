import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  colorVariant?: 'blue' | 'cyan' | 'indigo' | 'emerald' | 'amber';
  badge?: {
    text: string;
    variant: 'emerald' | 'amber' | 'rose' | 'indigo' | 'slate';
  };
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  colorVariant = 'blue',
  badge
}) => {
  const iconColors = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    cyan: 'bg-cyan-50 text-cyan-600 border-cyan-100',
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
  };

  const badgeStyles = {
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    rose: 'bg-rose-50 text-rose-700 border-rose-200',
    indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    slate: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs hover:border-slate-300 hover:-translate-y-1 hover:shadow-card-hover transition-all duration-200 flex flex-col justify-between group">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          {title}
        </span>
        <div
          className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-transform duration-200 group-hover:scale-105 ${
            iconColors[colorVariant]
          }`}
        >
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div>
        <div className="text-2xl font-bold text-slate-900 tracking-tight font-sans">
          {value}
        </div>
        <div className="flex items-center justify-between mt-2 pt-1.5 text-xs text-slate-500 border-t border-slate-50">
          <span className="truncate">{subtitle}</span>
          {badge && (
            <span
              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border shrink-0 ml-1.5 ${
                badgeStyles[badge.variant] || badgeStyles.slate
              }`}
            >
              {badge.text}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
