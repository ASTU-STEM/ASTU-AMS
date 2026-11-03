import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  SlidersHorizontal,
  X,
  Zap,
  GraduationCap,
  Briefcase,
  ShieldCheck,
  CalendarRange,
  School,
  RotateCcw,
  Check,
  Info,
} from 'lucide-react';
import {
  AdvancedFilterState,
  DEFAULT_FILTERS,
  academicYears,
  DepartmentFilter,
} from './types';

export interface AdvancedFiltersModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: AdvancedFilterState;
  onApply: (newFilters: AdvancedFilterState) => void;
  onReset: () => void;
  departments: string[];
}

export default function AdvancedFiltersModal({
  isOpen,
  onClose,
  filters,
  onApply,
  onReset,
  departments,
}: AdvancedFiltersModalProps) {
  const [draft, setDraft] = useState<AdvancedFilterState>(filters);
  const [activeTab, setActiveTab] = useState<'academic' | 'career' | 'profile'>('academic');

  React.useEffect(() => {
    setDraft(filters);
  }, [filters, isOpen]);

  if (!isOpen) return null;

  const activeCount = Object.entries(draft).filter(([k, v]) => {
    if (k === 'academicYear') return v !== 'All Time';
    if (k === 'department') return v !== 'All';
    if (typeof v === 'boolean') return v === true;
    return v !== 'All';
  }).length;

  const applyPreset = (preset: 'all' | 'tech' | 'fresh' | 'verified' | 'high_salary') => {
    if (preset === 'all') {
      setDraft(DEFAULT_FILTERS);
    } else if (preset === 'tech') {
      setDraft({
        ...DEFAULT_FILTERS,
        department: 'Computer Science',
        industrySector: 'Software & Technology',
        degreeLevel: 'BSc',
      });
    } else if (preset === 'fresh') {
      setDraft({
        ...DEFAULT_FILTERS,
        academicYear: '2024-25',
        employmentStatus: 'Employed Full-Time',
      });
    } else if (preset === 'verified') {
      setDraft({
        ...DEFAULT_FILTERS,
        verificationStatus: 'Verified Only',
      });
    } else if (preset === 'high_salary') {
      setDraft({
        ...DEFAULT_FILTERS,
        salaryTier: '> 50,000 ETB',
      });
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative flex flex-col w-full max-w-4xl max-h-[90vh] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-600 text-white shadow-xs">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Advanced Analytics Filter Matrix</h3>
                {activeCount > 0 && (
                  <span className="px-2 py-0.5 text-xs font-bold bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 rounded-full">
                    {activeCount} Active
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Refine institutional outcomes by academic, career, and verification parameters</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Info Banner for Scope Distinction */}
        <div className="px-6 py-2.5 bg-blue-50/60 dark:bg-blue-950/20 border-b border-blue-100 dark:border-blue-900/30 flex items-center gap-2 text-xs text-blue-800 dark:text-blue-300">
          <Info className="w-4 h-4 shrink-0 text-blue-600 dark:text-blue-400" />
          <span>
            <strong>Live Server Warehouse:</strong> Batch year and department queries re-aggregate institutional server records. Additional dimensions refine active matrices.
          </span>
        </div>

        {/* Quick Presets Toolbar */}
        <div className="flex flex-wrap items-center gap-2 px-6 py-3 bg-slate-100/70 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800 text-xs">
          <span className="font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[11px] flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-amber-500" /> Presets:
          </span>
          <button
            type="button"
            onClick={() => applyPreset('all')}
            className="px-2.5 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
          >
            All Data
          </button>
          <button
            type="button"
            onClick={() => applyPreset('tech')}
            className="px-2.5 py-1 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg text-blue-700 dark:text-blue-300 font-medium hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-all"
          >
            💻 Tech &amp; Software
          </button>
          <button
            type="button"
            onClick={() => applyPreset('fresh')}
            className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 rounded-lg text-emerald-700 dark:text-emerald-300 font-medium hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-all"
          >
            🎓 Fresh Graduates (2024)
          </button>
          <button
            type="button"
            onClick={() => applyPreset('verified')}
            className="px-2.5 py-1 bg-violet-50 dark:bg-violet-900/30 border border-violet-200 dark:border-violet-800 rounded-lg text-violet-700 dark:text-violet-300 font-medium hover:bg-violet-100 dark:hover:bg-violet-900/50 transition-all"
          >
            🛡️ Verified Alumni Only
          </button>
          <button
            type="button"
            onClick={() => applyPreset('high_salary')}
            className="px-2.5 py-1 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-lg text-amber-800 dark:text-amber-300 font-medium hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-all"
          >
            💰 High Earners (&gt;50k ETB)
          </button>
        </div>

        {/* Category Navigation Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6">
          <button
            type="button"
            onClick={() => setActiveTab('academic')}
            className={`flex items-center gap-2 py-3 px-4 border-b-2 font-semibold text-xs transition-all ${
              activeTab === 'academic'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/20'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <GraduationCap className="w-4 h-4" /> Academic &amp; Graduation
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('career')}
            className={`flex items-center gap-2 py-3 px-4 border-b-2 font-semibold text-xs transition-all ${
              activeTab === 'career'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/20'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Briefcase className="w-4 h-4" /> Career &amp; Employment
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-2 py-3 px-4 border-b-2 font-semibold text-xs transition-all ${
              activeTab === 'profile'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/20'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4" /> Verification &amp; Profile
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'academic' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                  <CalendarRange className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /> Academic Batch / Year (Server)
                </label>
                <select
                  value={draft.academicYear}
                  onChange={(e) => setDraft({ ...draft, academicYear: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs font-medium text-slate-800 dark:text-slate-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  {academicYears.map((year) => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                  <School className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /> Department / Specialization (Server)
                </label>
                <select
                  value={draft.department}
                  onChange={(e) => setDraft({ ...draft, department: e.target.value as DepartmentFilter })}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs font-medium text-slate-800 dark:text-slate-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="All">All Departments</option>
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">Degree Level</label>
                <div className="grid grid-cols-2 gap-2">
                  {['All', 'BSc', 'MSc', 'PhD'].map((deg) => (
                    <button
                      key={deg}
                      type="button"
                      onClick={() => setDraft({ ...draft, degreeLevel: deg })}
                      className={`p-2 text-xs font-semibold rounded-lg border transition-all text-center ${
                        draft.degreeLevel === deg
                          ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 shadow-xs'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                      }`}
                    >
                      {deg === 'All' ? 'All Degrees' : `${deg} Degree`}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">Graduation Distinction / CGPA Tier</label>
                <select
                  value={draft.cgpaTier}
                  onChange={(e) => setDraft({ ...draft, cgpaTier: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs font-medium text-slate-800 dark:text-slate-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="All">All GPA Categories</option>
                  <option value="High (>=3.5)">Distinction / High Honors (&gt;= 3.50 CGPA)</option>
                  <option value="Medium (3.0-3.49)">Upper Division (3.00 - 3.49 CGPA)</option>
                  <option value="Standard (<3.0)">Standard Pass (&lt; 3.00 CGPA)</option>
                </select>
              </div>
            </div>
          )}

          {activeTab === 'career' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">Employment Status</label>
                <select
                  value={draft.employmentStatus}
                  onChange={(e) => setDraft({ ...draft, employmentStatus: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs font-medium text-slate-800 dark:text-slate-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="All">All Employment Statuses</option>
                  <option value="Employed Full-Time">Employed Full-Time</option>
                  <option value="Employed Part-Time">Employed Part-Time</option>
                  <option value="Self-Employed / Founder">Self-Employed / Founder</option>
                  <option value="Unemployed / Job Seeking">Unemployed / Job Seeking</option>
                  <option value="Pursuing Higher Education">Pursuing Higher Education</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">Industry / Economic Sector</label>
                <select
                  value={draft.industrySector}
                  onChange={(e) => setDraft({ ...draft, industrySector: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs font-medium text-slate-800 dark:text-slate-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="All">All Industry Sectors</option>
                  <option value="Software & Technology">Software &amp; Technology</option>
                  <option value="Telecommunications">Telecommunications</option>
                  <option value="Construction & Civil">Construction &amp; Civil Engineering</option>
                  <option value="Banking & Financial Services">Banking &amp; Financial Services</option>
                  <option value="Government & Public Sector">Government &amp; Public Sector</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">Monthly Compensation Bracket</label>
                <select
                  value={draft.salaryTier}
                  onChange={(e) => setDraft({ ...draft, salaryTier: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs font-medium text-slate-800 dark:text-slate-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="All">All Salary Brackets</option>
                  <option value="< 15,000 ETB">&lt; 15,000 ETB / month</option>
                  <option value="15k - 30k ETB">15,000 - 30,000 ETB / month</option>
                  <option value="30k - 50k ETB">30,000 - 50,000 ETB / month</option>
                  <option value="> 50,000 ETB">&gt; 50,000 ETB / month</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">Primary Work Location</label>
                <select
                  value={draft.workLocation}
                  onChange={(e) => setDraft({ ...draft, workLocation: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs font-medium text-slate-800 dark:text-slate-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="All">All Geographical Locations</option>
                  <option value="Addis Ababa">Addis Ababa Metropolitan</option>
                  <option value="Adama">Adama / Oromia Region</option>
                  <option value="Regional">Regional Cities (Hawassa, Bahir Dar, Mekelle)</option>
                  <option value="International / Remote">International &amp; Remote Work</option>
                </select>
              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">Alumni Verification Status</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'All', label: 'All Alumni' },
                    { id: 'Verified Only', label: 'Verified Only' },
                    { id: 'Pending / Unverified', label: 'Pending' },
                  ].map((v) => (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setDraft({ ...draft, verificationStatus: v.id })}
                      className={`p-2 text-xs font-semibold rounded-lg border transition-all text-center ${
                        draft.verificationStatus === v.id
                          ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 shadow-xs'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                      }`}
                    >
                      {v.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 block">Digital Profile Artifacts</label>
                <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                  <input
                    type="checkbox"
                    checked={draft.hasResume}
                    onChange={(e) => setDraft({ ...draft, hasResume: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded-sm focus:ring-blue-500"
                  />
                  <div>
                    <div className="text-xs font-bold text-slate-800 dark:text-white">Has Uploaded Resume / CV</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">Filter profiles with active PDF resume attachments</div>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                  <input
                    type="checkbox"
                    checked={draft.hasLinkedIn}
                    onChange={(e) => setDraft({ ...draft, hasLinkedIn: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded-sm focus:ring-blue-500"
                  />
                  <div>
                    <div className="text-xs font-bold text-slate-800 dark:text-white">Has LinkedIn Profile URL</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">Filter alumni with verified LinkedIn network links</div>
                  </div>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850">
          <button
            type="button"
            onClick={() => {
              setDraft(DEFAULT_FILTERS);
              onReset();
            }}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset All Filters
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-xl transition-all"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                onApply(draft);
                onClose();
              }}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/20 transition-all flex items-center gap-2"
            >
              <Check className="w-4 h-4" /> Apply Filter Matrix
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
