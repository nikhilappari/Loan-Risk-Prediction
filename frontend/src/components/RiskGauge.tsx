import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, AlertTriangle, CheckCircle, Info, Sparkles } from 'lucide-react';

interface RiskGaugeProps {
  probability: number; // 0.00 to 1.00
  category: 'LOWER RISK' | 'MODERATE RISK' | 'HIGHER RISK' | string;
  confidence?: string;
}

export const RiskGauge: React.FC<RiskGaugeProps> = ({ probability, category, confidence }) => {
  const targetPct = Math.min(100, Math.max(0, probability * 100));
  const [displayPct, setDisplayPct] = useState(0);

  // Smooth count-up animation from 0 to actual percentage
  useEffect(() => {
    let startTimestamp: number | null = null;
    const duration = 850; // ms

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // Ease out cubic
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setDisplayPct(+(targetPct * easeOut).toFixed(1));

      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setDisplayPct(+targetPct.toFixed(1));
      }
    };

    const animFrame = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(animFrame);
  }, [targetPct]);

  // Color theming based on risk level
  const getTheme = () => {
    switch (category) {
      case 'LOWER RISK':
        return {
          textColor: 'text-emerald-400',
          gradientText: 'from-emerald-300 via-teal-200 to-cyan-300',
          badgeBg: 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40 shadow-emerald-500/20',
          indicatorColor: 'bg-emerald-400',
          barGradient: 'from-emerald-500 to-cyan-400',
          icon: CheckCircle
        };
      case 'MODERATE RISK':
        return {
          textColor: 'text-amber-400',
          gradientText: 'from-amber-300 via-yellow-200 to-orange-300',
          badgeBg: 'bg-amber-950/80 text-amber-300 border-amber-500/40 shadow-amber-500/20',
          indicatorColor: 'bg-amber-400',
          barGradient: 'from-amber-500 to-orange-400',
          icon: Info
        };
      case 'HIGHER RISK':
      default:
        return {
          textColor: 'text-rose-400',
          gradientText: 'from-rose-300 via-red-200 to-pink-300',
          badgeBg: 'bg-rose-950/80 text-rose-300 border-rose-500/40 shadow-rose-500/20',
          indicatorColor: 'bg-rose-400',
          barGradient: 'from-rose-500 to-red-400',
          icon: AlertTriangle
        };
    }
  };

  const theme = getTheme();
  const CategoryIcon = theme.icon;

  return (
    /* 16. DARK RESULT ACCENT CARD (linear-gradient(135deg, #0F172A, #172554)) */
    <div className="relative rounded-2xl bg-gradient-to-br from-[#0F172A] via-[#111C44] to-[#172554] border border-slate-800 text-white p-7 sm:p-9 shadow-xl overflow-hidden space-y-7">
      {/* Soft glowing radial background elements */}
      <div className="absolute -top-16 -right-16 w-80 h-80 rounded-full bg-cyan-500/15 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-80 h-80 rounded-full bg-blue-600/15 blur-3xl pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none opacity-40" />

      {/* Top Header Row */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-xs font-semibold tracking-wider uppercase text-cyan-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Predicted Default Risk Assessment</span>
          </div>
          <p className="text-xs text-slate-300">
            Ensemble inference produced by class-balanced Random Forest classifier.
          </p>
        </div>

        {confidence && (
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs text-slate-300 self-start sm:self-auto">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span>{confidence}</span>
          </div>
        )}
      </div>

      {/* Central Risk Highlight Display */}
      <div className="relative z-10 flex flex-col items-center text-center space-y-3 py-2">
        <span className="text-xs font-mono font-semibold uppercase tracking-widest text-slate-400">
          Empirical Probability of Default P(TARGET = 1)
        </span>

        {/* Animated Percentage */}
        <div className="text-5xl sm:text-7xl font-extrabold tracking-tight font-mono text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-300 drop-shadow-sm">
          {displayPct.toFixed(1)}%
        </div>

        {/* Category Pill with Glowing Border */}
        <div className={`inline-flex items-center space-x-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border shadow-sm ${theme.badgeBg}`}>
          <CategoryIcon className="w-4 h-4" />
          <span>{category}</span>
        </div>
      </div>

      {/* Polished Slider Track & Visual Calibration Marker */}
      <div className="relative z-10 space-y-3 pt-2">
        <div className="relative pt-6 pb-2">
          {/* Calibrated Tri-color Track */}
          <div className="h-3 w-full bg-slate-800/90 rounded-full flex overflow-hidden border border-white/15 shadow-inner">
            <div className="w-[35%] bg-gradient-to-r from-emerald-500 to-teal-400 h-full border-r border-slate-900/50" />
            <div className="w-[25%] bg-gradient-to-r from-amber-500 to-yellow-400 h-full border-r border-slate-900/50" />
            <div className="w-[40%] bg-gradient-to-r from-rose-500 to-red-600 h-full" />
          </div>

          {/* Smooth Sliding Needle Marker */}
          <motion.div
            className="absolute top-0 transform -translate-x-1/2 flex flex-col items-center pointer-events-none"
            initial={{ left: '0%' }}
            animate={{ left: `${targetPct}%` }}
            transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="px-2 py-0.5 rounded-md bg-white text-slate-900 text-[11px] font-mono font-bold shadow-lg border border-slate-200">
              {targetPct.toFixed(1)}%
            </div>
            <div className="w-0.5 h-4 bg-white shadow-xs"></div>
            <div className="w-3 h-3 bg-cyan-400 rounded-full -mt-1 shadow-md ring-2 ring-white"></div>
          </motion.div>
        </div>

        {/* Threshold Markers */}
        <div className="flex justify-between text-[11px] font-medium text-slate-400 pt-1">
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Lower Risk (0% – 35%)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            <span>Moderate (35% – 60%)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-400"></span>
            <span>Higher Risk (60% – 100%)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
