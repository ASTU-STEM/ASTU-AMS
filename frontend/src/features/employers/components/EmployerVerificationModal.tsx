import React, { useState } from 'react';
import { employerService } from '../services/employer.service';
import toast from 'react-hot-toast';

interface EmployerVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updatedProfile: any) => void;
  darkMode: boolean;
  companyName: string;
  initialTin?: string;
  verificationStatus?: string;
}

export const EmployerVerificationModal: React.FC<EmployerVerificationModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  darkMode,
  companyName,
  initialTin,
  verificationStatus
}) => {
  const [tinNumber, setTinNumber] = useState(initialTin || '');
  const [signatoryName, setSignatoryName] = useState('');
  const [signatoryTitle, setSignatoryTitle] = useState('HR Director / Managing Director');
  const [businessLicenseFile, setBusinessLicenseFile] = useState<File | null>(null);
  const [hrAuthFile, setHrAuthFile] = useState<File | null>(null);
  const [agreePrivacyPolicy, setAgreePrivacyPolicy] = useState(false);
  const [agreeNda, setAgreeNda] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreePrivacyPolicy || !agreeNda) {
      toast.error('Please read and check both ASTU Alumni Data Privacy and NDA compliance agreements.');
      return;
    }
    if (!tinNumber) {
      toast.error('Please enter your company Business Registration / TIN number.');
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('tinNumber', tinNumber);
      formData.append('signatoryName', signatoryName || 'Authorized Signatory');
      formData.append('signatoryTitle', signatoryTitle);
      formData.append('ndaSigned', 'true');
      if (businessLicenseFile) formData.append('businessLicense', businessLicenseFile);
      if (hrAuthFile) formData.append('hrAuthorization', hrAuthFile);

      const res = await employerService.uploadVerificationDocs(formData);
      onSuccess(res.profile);
      toast.success('🛡️ Verification dossier & Data Agreement submitted! ASTU Registrar review initiated.');
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to submit verification dossier.');
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
        <div className="bg-gradient-to-r from-red-700 via-rose-800 to-[#003366] p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-white/70 hover:text-white bg-black/20 hover:bg-black/40 rounded-full p-2 transition-all"
          >
            ✕
          </button>
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-3xl">verified_user</span>
            <div>
              <h3 className="text-xl font-extrabold tracking-tight">ASTU Employer Partner Verification</h3>
              <p className="text-xs text-rose-100 mt-0.5">Submit business registration, HR authority letter & sign ASTU Data-Sharing Agreement</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">

          {/* Business Credentials */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700 dark:text-slate-300">Registration / TIN Number *</label>
              <input
                type="text"
                value={tinNumber}
                onChange={e => setTinNumber(e.target.value)}
                placeholder="e.g. 123456781232"
                className="w-full text-xs p-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 outline-none font-mono font-bold"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700 dark:text-slate-300">Authorized Signatory Name *</label>
              <input
                type="text"
                value={signatoryName}
                onChange={e => setSignatoryName(e.target.value)}
                placeholder="e.g. Mr. Tolsa Badhasa"
                className="w-full text-xs p-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 outline-none"
                required
              />
            </div>
          </div>

          {/* Document Upload Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* License Upload */}
            <div className="space-y-1.5 p-3 rounded-2xl border border-dashed border-gray-300 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-800/40">
              <label className="block text-xs font-extrabold text-gray-800 dark:text-slate-200">1. Commercial License / Certificate</label>
              <input
                type="file"
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={e => setBusinessLicenseFile(e.target.files?.[0] || null)}
                className="w-full text-xs text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#003366] file:text-white cursor-pointer"
              />
              <span className="text-[10px] text-gray-400 block">{businessLicenseFile ? `Selected: ${businessLicenseFile.name}` : 'PDF, JPG, or PNG up to 10MB'}</span>
            </div>

            {/* HR Authorization */}
            <div className="space-y-1.5 p-3 rounded-2xl border border-dashed border-gray-300 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-800/40">
              <label className="block text-xs font-extrabold text-gray-800 dark:text-slate-200">2. HR Authorization Letter / ID</label>
              <input
                type="file"
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={e => setHrAuthFile(e.target.files?.[0] || null)}
                className="w-full text-xs text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#003366] file:text-white cursor-pointer"
              />
              <span className="text-[10px] text-gray-400 block">{hrAuthFile ? `Selected: ${hrAuthFile.name}` : 'Official company badge or HR letter'}</span>
            </div>
          </div>

          {/* ASTU Non-Disclosure & Data-Sharing Agreement */}
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-gray-700 dark:text-slate-200 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-rose-500 text-sm">gavel</span>
              ASTU Alumni Data-Sharing Agreement & Non-Disclosure (NDA)
            </h4>
            <p className="text-[11px] text-gray-500 dark:text-slate-400 leading-relaxed">
              By submitting this verification request, <strong>{companyName || 'your organization'}</strong> agrees to use ASTU graduate academic records, verified CGPA scores, and candidate contact details strictly for recruitment and internship onboarding purposes. Unauthorized third-party distribution is prohibited under Federal Ethiopian Data Protection standards.
            </p>

            <div className="space-y-2 pt-2 border-t border-gray-200 dark:border-slate-700">
              <label className="flex items-start gap-2.5 text-xs text-gray-800 dark:text-slate-200 font-semibold cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreePrivacyPolicy}
                  onChange={e => setAgreePrivacyPolicy(e.target.checked)}
                  className="mt-0.5 text-[#003366] accent-[#003366] h-4 w-4"
                  required
                />
                <span>I agree to ASTU Employer Recruitment Terms & Candidate Privacy Regulations.</span>
              </label>

              <label className="flex items-start gap-2.5 text-xs text-gray-800 dark:text-slate-200 font-semibold cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreeNda}
                  onChange={e => setAgreeNda(e.target.checked)}
                  className="mt-0.5 text-[#003366] accent-[#003366] h-4 w-4"
                  required
                />
                <span>I digitally sign the Non-Disclosure Agreement (NDA) on behalf of {companyName || 'Employer'}.</span>
              </label>
            </div>
          </div>

          {/* Buttons */}
          <div className="pt-3 border-t border-gray-150 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-bold text-gray-500 hover:text-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-gradient-to-r from-red-600 to-rose-700 text-white rounded-xl font-extrabold text-xs uppercase tracking-wider hover:scale-102 transition-all shadow-md disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting ? (
                <><span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> Submitting Verification...</>
              ) : (
                '🛡️ Submit Verification Dossier'
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
