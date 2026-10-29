import React from 'react';
import {
  LayoutDashboard,
  UserPlus,
  Layers,
  History,
  BrainCircuit,
  FileText,
  Activity,
  Cpu
} from 'lucide-react';

export type NavTab = 'dashboard' | 'new-assessment' | 'batch' | 'history' | 'insights' | 'methodology';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onSelectTab }) => {
  const navItems = [
    { id: 'dashboard' as NavTab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'new-assessment' as NavTab, label: 'New Assessment', icon: UserPlus },
    { id: 'batch' as NavTab, label: 'Batch Assessment', icon: Layers },
    { id: 'history' as NavTab, label: 'Assessment History', icon: History },
    { id: 'insights' as NavTab, label: 'Model Insights', icon: BrainCircuit },
    { id: 'methodology' as NavTab, label: 'Methodology', icon: FileText },
  ];

  return (
    <aside className="w-[248px] bg-white border-r border-slate-200/90 flex flex-col justify-between shrink-0 min-h-[calc(100vh-61px)] select-none z-20">
      <div className="p-4 space-y-6">
        {/* LoanRisk AI Logo */}
        <div className="flex items-center space-x-3 px-2 py-1">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-blue-500 to-cyan-400 flex items-center justify-center text-white shadow-sm shadow-blue-500/20">
            <Activity className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <div className="text-[15px] font-bold text-slate-900 tracking-tight leading-none flex items-center gap-1.5">
              <span>LoanRisk</span>
              <span className="text-xs font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 border border-blue-100">
                AI
              </span>
            </div>
            <div className="text-[11px] text-slate-400 font-medium mt-1">
              Risk Decision Engine
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1.5" aria-label="Main Navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full group flex items-center px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 text-left ${
                  isActive
                    ? 'bg-[#EFF6FF] text-[#2563EB] font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 hover:translate-x-1'
                }`}
              >
                {/* Active indicator bar */}
                <div
                  className={`w-1 h-5 rounded-full mr-2.5 transition-all duration-200 ${
                    isActive ? 'bg-blue-600 opacity-100' : 'bg-transparent opacity-0'
                  }`}
                />
                <Icon
                  className={`w-4 h-4 shrink-0 mr-3 transition-colors ${
                    isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Mini Card: Dark Accent Status Card */}
      <div className="p-3.5 border-t border-slate-100">
        <div className="rounded-xl bg-gradient-to-br from-[#0F172A] to-[#172554] p-3.5 text-white border border-slate-800 shadow-sm space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[11px] font-semibold tracking-wide text-slate-200">
                AI Model Online
              </span>
            </div>
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-[11px] font-mono text-slate-300 flex items-center justify-between pt-1 border-t border-white/10">
            <span>Random Forest v1.0</span>
            <span className="text-[10px] text-cyan-300 font-sans">150 Trees</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
