import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Download, Handshake, ShieldCheck, TrendingUp, Activity, ArrowRight } from "lucide-react";

interface ManagementHubProps {
  darkMode?: boolean;
}

const MANAGEMENT_ACTIONS = [
  { title: 'Graduate Outcome Analytics', desc: 'Cohort comparison: employment, salary, location, and study continuation.', path: '/department/employment-analytics', icon: TrendingUp, color: 'text-[#003580]', bg: 'bg-[#003580]/10', border: 'border-[#003580]/20' },
  { title: 'Curriculum Review Dashboard', desc: 'Manage feedback evidence, course updates, competency gaps, and review cycles.', path: '/department/curriculum', icon: BookOpen, color: 'text-[#1D9E75]', bg: 'bg-[#1D9E75]/10', border: 'border-[#1D9E75]/20' },
  { title: 'Department KPI Dashboard', desc: 'Track accreditation KPIs, tracer response, research collaboration, and engagement.', path: '/department/accreditation', icon: ShieldCheck, color: 'text-purple-600', bg: 'bg-purple-600/10', border: 'border-purple-600/20' },
  { title: 'Skill Gap Reports', desc: 'Department skill-gap reports from employer demand and alumni career data.', path: '/department/skill-gap', icon: Activity, color: 'text-[#E8A020]', bg: 'bg-[#E8A020]/10', border: 'border-[#E8A020]/20' },
  { title: 'Industry Partnership Reports', desc: 'Manage employer feedback, partnership evidence, and collaboration requests.', path: '/department/employer-feedback', icon: Handshake, color: 'text-[#E24B4A]', bg: 'bg-[#E24B4A]/10', border: 'border-[#E24B4A]/20' },
  { title: 'Graduate Employability Reports', desc: 'Export accreditation-ready reports by batch, program, geography, and sector.', path: '/department/export', icon: Download, color: 'text-[#0a4fa6]', bg: 'bg-[#0a4fa6]/10', border: 'border-[#0a4fa6]/20' },
];

export const ManagementHub: React.FC<ManagementHubProps> = ({ darkMode = false }) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto">
      {/* Header */}
      <div className={`relative overflow-hidden rounded-2xl p-5 lg:p-6 border shadow-lg transition-all duration-300 ${darkMode ? 'bg-slate-900/80 border-slate-800 text-white shadow-slate-900/50' : 'bg-white border-slate-200/60 shadow-slate-200/50'}`}>
        <div className="absolute right-0 top-0 w-64 h-64 bg-gradient-to-br from-[#003580]/5 to-[#0a4fa6]/5 rounded-full blur-3xl pointer-events-none transform translate-x-1/3 -translate-y-1/3" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#003580]/5 dark:bg-[#003580]/20 border border-[#003580]/10 dark:border-[#003580]/30 mb-3">
              <Activity className="w-3.5 h-3.5 text-[#003580] dark:text-blue-400" />
              <span className="text-[10px] font-bold text-[#003580] dark:text-blue-400 uppercase tracking-widest">Department Operations</span>
            </div>
            <h1 className="text-xl lg:text-2xl font-extrabold tracking-tight mb-2 text-slate-900 dark:text-white">Management Hub</h1>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
              Central command for department operations. Access key analytics, manage curriculum alignment, review employer feedback, and monitor accreditation readiness all from one place.
            </p>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
        {MANAGEMENT_ACTIONS.map((action, idx) => {
          const Icon = action.icon;
          return (
            <button
              key={idx}
              onClick={() => navigate(action.path)}
              className={`group flex flex-col text-left h-full p-5 lg:p-6 rounded-2xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${darkMode ? 'bg-slate-800/40 hover:bg-slate-800 border-slate-700 hover:border-slate-600' : 'bg-white hover:bg-slate-50 border-slate-200 hover:border-slate-300 shadow-sm hover:shadow-slate-200/50'}`}
            >
              <div className="flex items-start justify-between w-full mb-5">
                <div className={`p-3 rounded-xl border transition-colors duration-300 ${action.bg} ${action.color} ${action.border} group-hover:bg-opacity-20`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className={`p-1.5 rounded-full transition-transform duration-300 group-hover:translate-x-1 ${darkMode ? 'text-slate-500 group-hover:text-white group-hover:bg-slate-700' : 'text-slate-400 group-hover:text-slate-900 group-hover:bg-slate-100'}`}>
                  <ArrowRight className="h-4 w-4" />
                </div>
              </div>
              <h3 className={`text-lg font-bold tracking-tight mb-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                {action.title}
              </h3>
              <p className={`text-xs leading-relaxed font-medium ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                {action.desc}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
};
