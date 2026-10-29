import React from 'react';
import { HealthStatus } from '../types';
import { UserCheck } from 'lucide-react';

interface NavbarProps {
  health: HealthStatus | null;
  pageTitle: string;
}

export const Navbar: React.FC<NavbarProps> = ({ health, pageTitle }) => {
  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-30 px-6 py-3.5 flex items-center justify-between shadow-2xs transition-colors">
      {/* Left: Dynamic Page Title & Breadcrumb */}
      <div className="flex items-center space-x-3">
        <h1 className="text-base sm:text-lg font-semibold text-slate-900 tracking-tight">
          {pageTitle}
        </h1>
      </div>

      {/* Right: Model Online & Financial Officer Badge */}
      <div className="flex items-center space-x-3.5">
        {/* Model Status Pill */}
        <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700 shadow-2xs">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="tracking-wide">
            {health?.model_loaded ? 'Model Online' : 'Connecting...'}
          </span>
        </div>

        {/* Financial Officer User Profile Pill */}
        <div className="flex items-center space-x-2.5 pl-3 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-500 text-white flex items-center justify-center text-xs font-bold shadow-xs">
            FO
          </div>
          <div className="hidden md:block text-left">
            <div className="text-xs font-semibold text-slate-900 leading-none">
              Financial Underwriter
            </div>
            <div className="text-[10px] text-slate-500 font-medium mt-0.5">
              Decision Officer
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
