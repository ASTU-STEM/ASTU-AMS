import React, { useState } from 'react';
import { employerService } from '../services/employer.service';
import toast from 'react-hot-toast';

interface PartnershipModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updatedProfile: any) => void;
  darkMode: boolean;
  companyName: string;
  initialPartnerships: string[];
}

export const PartnershipModal: React.FC<PartnershipModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  darkMode,
  companyName,
  initialPartnerships
}) => {
  const [selectedTypes, setSelectedTypes] = useState<string[]>(initialPartnerships || []);
  const [proposalTitle, setProposalTitle] = useState('');
  const [targetDepartments, setTargetDepartments] = useState<string[]>(['Computer Science and Engineering']);
  const [annualBudget, setAnnualBudget] = useState('500,000 ETB');
  const [scopeDetails, setScopeDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const partnershipOptions = [
    { title: 'Internship agreements', desc: 'Structured 3-6 month intern cohorts & direct recruitment pipelines.' },
    { title: 'Sponsorship of events', desc: 'Sponsor ASTU Hackathons, Annual Tech Fairs, and Senior Graduation Expos.' },
    { title: 'Research collaboration', desc: 'Joint R&D projects with ASTU Innovation Center & Department Labs.' },
    { title: 'Curriculum advisory', desc: 'Advise academic deans on emerging industry technologies & skills gap syllabus.' }
  ];

  const astuDepartments = [
    'Computer Science and Engineering',
    'Electrical and Computer Engineering',
    'Mechanical and Vehicle Engineering',
    'Civil and Environmental Engineering',
    'Applied Sciences & Bio-Engineering'
  ];

  const toggleType = (item: string) => {
    setSelectedTypes(prev =>
      prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
    );
  };

  const toggleDept = (dept: string) => {
    setTargetDepartments(prev =>
      prev.includes(dept) ? prev.filter(d => d !== dept) : [...prev, dept]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedTypes.length === 0) {
      toast.error('Please select at least one partnership collaboration type.');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await employerService.submitPartnershipProposal({
        partnerships: selectedTypes,
        proposalTitle,
        targetDepartments,
        annualBudget,
        scopeDetails
      });
      onSuccess(res.profile);
      toast.success('🤝 Partnership request submitted to ASTU Linkage Office!');
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to submit partnership request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className={`relative w-full max-w-2xl rounded-3xl border shadow-2xl overflow-hidden transition-all my-8 ${
        darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-gray-200 text-gray-900'
      }`}>
        
        {/* Header */}
        <div className="bg-gradient-to-r from-violet-700 via-purple-800 to-[#003366] p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-white/70 hover:text-white bg-black/20 hover:bg-black/40 rounded-full p-2 transition-all"
          >
            ✕
          </button>
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-3xl">handshake</span>
            <div>
              <h3 className="text-xl font-extrabold tracking-tight">ASTU Industry Linkage & Partnership</h3>
              <p className="text-xs text-purple-100 mt-0.5">Submit formal collaboration proposals for {companyName || 'your organization'}</p>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">

          {/* 1. Collaboration Types */}
          <div className="space-y-2">
            <label className="text-xs font-extrabold uppercase tracking-wider text-[var(--text-muted)]">1. Select Collaboration Types</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {partnershipOptions.map((opt) => {
                const isSelected = selectedTypes.includes(opt.title);
                return (
                  <div
                    key={opt.title}
                    onClick={() => toggleType(opt.title)}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-violet-600 bg-violet-600/10 text-violet-900 dark:text-violet-200 font-bold shadow-xs'
                        : darkMode
                          ? 'border-slate-800 bg-slate-800/40 text-slate-300 hover:border-slate-700'
                          : 'border-[var(--border-color)] bg-[var(--bg-page)] text-[var(--text-secondary)] hover:border-[var(--border-color)]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold">{opt.title}</span>
                      <span className={`text-sm font-bold ${isSelected ? 'text-violet-600' : 'text-[var(--text-muted)]'}`}>
                        {isSelected ? '✓' : '+'}
                      </span>
                    </div>
                    <p className="text-[10px] text-[var(--text-muted)] font-normal mt-1 leading-tight">{opt.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. Proposal Overview & Budget */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-[var(--text-secondary)] dark:text-slate-300">Proposal Title</label>
              <input
                type="text"
                value={proposalTitle}
                onChange={e => setProposalTitle(e.target.value)}
                placeholder="e.g. 2026 Software Intern Cohort & Lab Sponsorship"
                className="w-full text-xs p-2.5 rounded-xl border border-[var(--border-color)] dark:border-slate-700 bg-[var(--bg-page)] dark:bg-slate-800 outline-none"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-[var(--text-secondary)] dark:text-slate-300">Estimated Annual Budget / Value</label>
              <input
                type="text"
                value={annualBudget}
                onChange={e => setAnnualBudget(e.target.value)}
                placeholder="e.g. 250,000 ETB"
                className="w-full text-xs p-2.5 rounded-xl border border-[var(--border-color)] dark:border-slate-700 bg-[var(--bg-page)] dark:bg-slate-800 outline-none"
                required
              />
            </div>
          </div>

          {/* 3. Target ASTU Departments */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-[var(--text-secondary)] dark:text-slate-300">Target ASTU Departments</label>
            <div className="flex flex-wrap gap-2">
              {astuDepartments.map(dept => {
                const isSelected = targetDepartments.includes(dept);
                return (
                  <button
                    type="button"
                    key={dept}
                    onClick={() => toggleDept(dept)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                      isSelected
                        ? 'bg-[#003366] text-white border-[#003366] shadow-xs'
                        : 'bg-[var(--bg-page)] dark:bg-slate-800 border-[var(--border-color)] dark:border-slate-700 text-[var(--text-secondary)] dark:text-slate-300'
                    }`}
                  >
                    {isSelected && '✓ '} {dept}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Details / Scope */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-[var(--text-secondary)] dark:text-slate-300">Scope of Work & Objectives</label>
            <textarea
              value={scopeDetails}
              onChange={e => setScopeDetails(e.target.value)}
              placeholder="Outline specific expectations, student intake capacity, lab equipment support, or hackathon timeline..."
              className="w-full text-xs p-2.5 rounded-xl border border-[var(--border-color)] dark:border-slate-700 bg-[var(--bg-page)] dark:bg-slate-800 outline-none h-20 resize-none"
            />
          </div>

          {/* Buttons */}
          <div className="pt-4 border-t border-[var(--border-color)] flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-bold text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-gradient-to-r from-violet-600 to-[#003366] text-white rounded-xl font-extrabold text-xs uppercase tracking-wider hover:scale-102 transition-all shadow-md disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting ? (
                <><span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> Submitting Proposal...</>
              ) : (
                'Submit Partnership Proposal'
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
