import React, { useState } from 'react';
import { HealthStatus } from '../types';
import {
  Activity,
  Menu,
  X,
  Plus,
  Cpu
} from 'lucide-react';

export type NavTab = 'dashboard' | 'new-assessment' | 'batch' | 'history' | 'insights' | 'methodology';

interface HeaderProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  health: HealthStatus | null;
}

export const Header: React.FC<HeaderProps> = ({ currentTab, onSelectTab, health }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks: { id: NavTab; label: string }[] = [
    { id: 'dashboard', label: 'Overview' },
    { id: 'new-assessment', label: 'Assessment' },
    { id: 'batch', label: 'Batch' },
    { id: 'history', label: 'History' },
    { id: 'insights', label: 'Insights' },
    { id: 'methodology', label: 'Methodology' }
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 h-14 transition-colors">
      <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 flex items-center justify-between">
        {/* Left: Brand Logo & Desktop Navigation */}
        <div className="flex items-center space-x-7">
          <button
            onClick={() => onSelectTab('dashboard')}
            className="flex items-center space-x-2.5 text-left focus:outline-hidden group"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 via-blue-500 to-cyan-400 flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
              <Activity className="w-4 h-4 stroke-[2.4]" />
            </div>
            <div className="flex items-baseline space-x-1.5">
              <span className="text-sm font-bold text-slate-900 tracking-tight">LoanRisk</span>
              <span className="text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 border border-blue-100">
                AI
              </span>
            </div>
          </button>

          {/* Desktop Horizontal Nav */}
          <nav className="hidden md:flex items-center space-x-1" aria-label="Main Navigation">
            {navLinks.map((link) => {
              const isActive = currentTab === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => onSelectTab(link.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right: Model Online status + Underwriter Profile */}
        <div className="flex items-center space-x-3">
          {/* Quick Action Button */}
          {currentTab !== 'new-assessment' && (
            <button
              onClick={() => onSelectTab('new-assessment')}
              className="hidden lg:inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Assessment</span>
            </button>
          )}

          {/* Status pill */}
          <div className="hidden sm:flex items-center space-x-2 px-2.5 py-1 rounded-full bg-slate-50 border border-slate-200 text-[11px] font-medium text-slate-700 shadow-2xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="tracking-wide">
              {health?.model_loaded ? 'Model Online' : 'Connecting...'}
            </span>
          </div>

          {/* Underwriter Profile Pill */}
          <div className="flex items-center space-x-2 pl-2 sm:border-l sm:border-slate-200">
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-slate-800 to-slate-950 text-white flex items-center justify-center text-[11px] font-bold shadow-2xs font-mono">
              FO
            </div>
            <div className="hidden xl:block text-left leading-none">
              <div className="text-xs font-semibold text-slate-800">Financial Officer</div>
              <div className="text-[10px] text-slate-400 font-medium">Underwriting Desk</div>
            </div>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 py-3 space-y-1 shadow-lg">
          {navLinks.map((link) => {
            const isActive = currentTab === link.id;
            return (
              <button
                key={link.id}
                onClick={() => {
                  onSelectTab(link.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {link.label}
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
