import React, { useState } from 'react';
import { X, ArrowRight, ArrowLeft, Check, Briefcase, DollarSign, Calendar, Building2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface VacancyPostingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitVacancy: (vacancy: any) => void;
}

export const VacancyPostingModal: React.FC<VacancyPostingModalProps> = ({
  isOpen,
  onClose,
  onSubmitVacancy,
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [formData, setFormData] = useState({
    title: '',
    department: 'Computer Science and Engineering',
    jobType: 'Full-time',
    location: 'Adama / Hybrid',
    salaryMin: '25000',
    salaryMax: '45000',
    experienceYears: '2',
    description: '',
    deadline: '',
    requirements: '',
  });

  if (!isOpen) return null;

  const handleNext = () => {
    if (step === 1 && !formData.title.trim()) {
      toast.error('Job Title is required.');
      return;
    }
    if (step === 2 && !formData.description.trim()) {
      toast.error('Job Description is required.');
      return;
    }
    setStep((prev) => (prev < 3 ? ((prev + 1) as any) : prev));
  };

  const handleBack = () => {
    setStep((prev) => (prev > 1 ? ((prev - 1) as any) : prev));
  };

  const handleFinalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitVacancy(formData);
    toast.success('Vacancy published to ASTU Alumni Job Board!');
    onClose();
    setStep(1);
  };

  return (
    <div
      data-testid="vacancy-posting-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
    >
      <div className="relative w-full max-w-xl rounded-3xl border border-[var(--border-color)] bg-[var(--bg-card)] p-6 text-[var(--text-primary)] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500/10 text-sky-400">
              <Briefcase className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[var(--text-primary)]">Post Graduate Career Vacancy</h3>
              <p className="text-xs text-[var(--text-secondary)]">Step {step} of 3: {step === 1 ? 'Role Basics' : step === 2 ? 'Details & Salary' : 'Review & Publish'}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)]">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="mt-4 flex gap-2">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                s <= step ? 'bg-sky-500' : 'bg-[var(--border-color)]'
              }`}
            />
          ))}
        </div>

        {/* Form Body */}
        <div className="mt-5 space-y-4 text-xs">
          {step === 1 && (
            <div className="space-y-3">
              <div>
                <label className="font-semibold text-[var(--text-secondary)]">Job Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Junior Embedded Systems Engineer"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] px-3 py-2.5 text-[var(--text-primary)] focus:border-sky-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-[var(--text-secondary)]">Target Engineering Dept</label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] px-3 py-2.5 text-[var(--text-primary)] focus:border-sky-500 focus:outline-none"
                  >
                    <option value="Computer Science and Engineering">CSE / Software</option>
                    <option value="Electrical & Electronics Engineering">Electrical & Electronics</option>
                    <option value="Mechanical Engineering">Mechanical Engineering</option>
                    <option value="Civil Engineering">Civil Engineering</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-[var(--text-secondary)]">Employment Format</label>
                  <select
                    value={formData.jobType}
                    onChange={(e) => setFormData({ ...formData, jobType: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] px-3 py-2.5 text-[var(--text-primary)] focus:border-sky-500 focus:outline-none"
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Internship">Internship</option>
                    <option value="Contract">Contract</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-[var(--text-secondary)]">Min Salary (ETB)</label>
                  <input
                    type="number"
                    value={formData.salaryMin}
                    onChange={(e) => setFormData({ ...formData, salaryMin: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] px-3 py-2.5 text-[var(--text-primary)] focus:border-sky-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-semibold text-[var(--text-secondary)]">Max Salary (ETB)</label>
                  <input
                    type="number"
                    value={formData.salaryMax}
                    onChange={(e) => setFormData({ ...formData, salaryMax: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] px-3 py-2.5 text-[var(--text-primary)] focus:border-sky-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-[var(--text-secondary)]">Role Description *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Detail responsibilities, tech stacks, and team projects..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] p-3 text-[var(--text-primary)] focus:border-sky-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-3 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-input)] p-4">
              <h4 className="font-bold text-[var(--text-primary)]">Vacancy Summary Preview</h4>
              <div className="space-y-1.5 text-xs">
                <div><span className="text-[var(--text-muted)]">Position:</span> <span className="font-bold text-[var(--text-primary)]">{formData.title}</span></div>
                <div><span className="text-[var(--text-muted)]">Target Faculty:</span> <span className="text-sky-400">{formData.department}</span></div>
                <div><span className="text-[var(--text-muted)]">Salary Range:</span> <span className="font-mono text-emerald-400">{formData.salaryMin} - {formData.salaryMax} ETB</span></div>
                <div><span className="text-[var(--text-muted)]">Format:</span> <span className="text-[var(--text-secondary)]">{formData.jobType} · {formData.location}</span></div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div className="mt-6 flex items-center justify-between border-t border-[var(--border-color)] pt-4">
          {step > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card-secondary)] px-4 py-2 text-xs font-semibold text-[var(--text-secondary)]"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <button
              type="button"
              onClick={handleNext}
              className="inline-flex items-center gap-1.5 rounded-xl bg-sky-600 px-4 py-2 text-xs font-bold text-white shadow hover:bg-sky-500"
            >
              Continue <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinalSubmit}
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white shadow hover:bg-emerald-500"
            >
              <Check className="h-4 w-4" /> Publish Listing
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
