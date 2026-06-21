import React, { useState, useEffect } from 'react';
import { CompanyProfile } from '../types/employer.types';
import { employerService } from '../services/employer.service';
import toast from 'react-hot-toast';

interface CompanyProfileTabProps {
  profile: CompanyProfile;
  onSave: (updatedProfile: CompanyProfile) => void;
  darkMode: boolean;
}

export const CompanyProfileTab: React.FC<CompanyProfileTabProps> = ({ profile, onSave, darkMode }) => {
  const UPLOAD_BASE = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
  const [formData, setFormData] = useState<CompanyProfile>({ ...profile });
  const [isSaving, setIsSaving] = useState(false);

  // Sync formData when parent profile prop changes (e.g. after initial fetch)
  useEffect(() => {
    setFormData({ ...profile });
  }, [profile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    try {
      await employerService.saveProfile(formData);
      onSave(formData);
      toast.success('Company profile updated successfully!');
    } catch (err) {
      toast.error('Failed to save profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const triggerLogoUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e: any) => {
      const file = e.target.files[0];
      if (file) {
        try {
          const newLogoUrl = await employerService.uploadLogo(file);
          setFormData(prev => ({ ...prev, logoUrl: newLogoUrl }));
          // Auto-save logo change
          const updatedProfile = { ...formData, logoUrl: newLogoUrl };
          await employerService.saveProfile(updatedProfile);
          onSave(updatedProfile);
          toast.success('Company logo updated successfully!');
        } catch (err) {
          toast.error('Failed to upload logo.');
        }
      }
    };
    input.click();
  };

  const togglePremium = async () => {
    const newVal = !formData.isPremium;
    const updated = { ...formData, isPremium: newVal };
    setFormData(updated);
    try {
      await employerService.saveProfile(updated);
      onSave(updated);
      toast.success(newVal ? 'Premium activated!' : 'Premium deactivated.');
    } catch {
      setFormData(prev => ({ ...prev, isPremium: !newVal }));
      toast.error('Failed to update premium status.');
    }
  };

  const togglePartnership = async (item: string) => {
    const current = formData.partnerships || [];
    const newPartnerships = current.includes(item)
      ? current.filter(v => v !== item)
      : [...current, item];
    const updated = { ...formData, partnerships: newPartnerships };
    setFormData(updated);
    try {
      await employerService.saveProfile(updated);
      onSave(updated);
    } catch {
      setFormData(prev => ({ ...prev, partnerships: current }));
      toast.error('Failed to update partnerships.');
    }
  };

  const submitVerification = async () => {
    if (formData.verificationStatus === 'PENDING' || formData.verificationStatus === 'VERIFIED') return;
    const updated = { ...formData, verificationStatus: 'PENDING' };
    setFormData(updated);
    try {
      await employerService.saveProfile(updated);
      onSave(updated);
      toast.success('Verification request submitted! Our team will review it.');
    } catch {
      setFormData(prev => ({ ...prev, verificationStatus: 'NOT_VERIFIED' }));
      toast.error('Failed to submit verification request.');
    }
  };

  // Derived display values
  const isPremium = formData.isPremium || false;
  const partnerships = formData.partnerships || [];
  const verificationStatus = formData.verificationStatus || 'NOT_VERIFIED';
  const isVerified = verificationStatus === 'VERIFIED';
  const isPendingVerification = verificationStatus === 'PENDING';

  const verificationLabel = isVerified ? 'Verified Partner' : isPendingVerification ? 'Under Review' : 'Not Verified';
  const premiumLabel = isPremium ? 'Sponsored' : 'Standard';
  const ndaLabel = formData.ndaSigned ? 'NDA signed' : 'NDA not signed';

  const inputClass = "w-full text-sm p-3 bg-[var(--bg-page)] border border-[var(--border-color)] rounded-xl focus:ring-2 focus:ring-[#003366]/20 focus:outline-none focus:border-[#003366] focus:bg-[var(--bg-card)] transition-all duration-200 text-[var(--text-primary)] placeholder:text-[var(--text-muted)]";
  const labelClass = "text-xs font-extrabold text-[var(--text-secondary)] uppercase tracking-[0.12em]";

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <section className="relative overflow-hidden rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] p-6 shadow-sm">
        <div className="absolute inset-0 bg-gradient-to-br from-[#003366] via-[#004080] to-[#1a5c3a] opacity-95"></div>
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full -translate-y-1/3 translate-x-1/3"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#FFD700]/8 rounded-full translate-y-1/3 -translate-x-1/4"></div>
        </div>
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="relative group cursor-pointer" onClick={triggerLogoUpload}>
              <img src={formData.logoUrl ? (formData.logoUrl.startsWith('http') ? formData.logoUrl : `${UPLOAD_BASE}${formData.logoUrl}`) : '/default-logo.png'} alt="Logo" className="w-20 h-20 rounded-2xl border-3 border-white/20 shadow-xl object-cover transition-transform group-hover:scale-105 bg-white" />
              <div className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              </div>
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-white tracking-tight">{formData.name || 'Your Company'}</h2>
              <p className="text-sm text-white/70 font-medium mt-0.5">{formData.industry || 'Set your industry'}</p>
              <p className="text-xs text-white/50 font-semibold mt-1">{formData.location || 'Set your location'}</p>
            </div>
          </div>
          <button
            onClick={handleSubmit}
            disabled={isSaving}
            className="px-5 py-2.5 bg-white/15 hover:bg-white/25 backdrop-blur-sm text-white rounded-xl text-sm font-extrabold tracking-wider uppercase transition-all duration-300 border border-white/15 shadow-lg disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </section>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Employer Status', value: verificationLabel, color: 'emerald', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg> },
          { label: 'Premium Profile', value: premiumLabel, color: 'amber', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg> },
          { label: 'Partnerships', value: `${partnerships.length} active`, color: 'blue', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg> },
          { label: 'Data Agreement', value: ndaLabel, color: 'red', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg> },
        ].map((item, idx) => (
          <div key={idx} className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)] p-4 shadow-sm hover:shadow-md transition-all duration-200">
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-${item.color}-500`}>{item.icon}</span>
              <span className={`text-[10px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                item.color === 'emerald' ? 'bg-emerald-50 text-emerald-700' :
                item.color === 'amber' ? 'bg-amber-50 text-amber-700' :
                item.color === 'blue' ? 'bg-blue-50 text-blue-700' :
                'bg-red-50 text-red-700'
              }`}>{item.label}</span>
            </div>
            <p className="text-sm font-extrabold text-[var(--text-primary)]">{item.value}</p>
          </div>
        ))}
      </div>

      {/* Form */}
      <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)] shadow-sm overflow-hidden">
        <form onSubmit={handleSubmit} className="space-y-0">
          {/* Company Info Section */}
          <div className="p-5 border-b border-[var(--border-color)]">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
              </div>
              <div>
                <h3 className="text-base font-extrabold text-[var(--text-primary)] tracking-tight">Company Information</h3>
                <p className="text-xs text-[var(--text-secondary)]">Basic company details and registration</p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <label className={labelClass}>Registration Number (TIN)</label>
                <input type="text" name="tin" value={formData.tin || ''} onChange={handleChange} className={inputClass} placeholder="Enter your TIN/Registration number" />
              </div>
              <div className="space-y-1.5">
                <label className={labelClass}>Industry Classification</label>
                <input type="text" name="industry" value={formData.industry} onChange={handleChange} className={inputClass} required />
              </div>
            </div>
            <div className="mt-4 space-y-1.5">
              <label className={labelClass}>Company Description</label>
              <textarea name="description" value={formData.description} onChange={handleChange} className={`${inputClass} h-28 resize-none`} placeholder="Tell us about your company and what type of candidates you hire..." />
            </div>
            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <label className={labelClass}>Location / Address</label>
                <input type="text" name="location" value={formData.location} onChange={handleChange} className={inputClass} required />
              </div>
              <div className="space-y-1.5">
                <label className={labelClass}>Corporate Website</label>
                <input type="url" name="website" value={formData.website} onChange={handleChange} className={inputClass} placeholder="https://company.com" />
              </div>
            </div>
          </div>

          {/* HR Contact Section */}
          <div className="p-5 border-b border-[var(--border-color)]">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-md">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
              </div>
              <div>
                <h3 className="text-base font-extrabold text-[var(--text-primary)] tracking-tight">HR Recruiter Contact</h3>
                <p className="text-xs text-[var(--text-secondary)]">Primary contact for candidate communications</p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="space-y-1.5">
                <label className={labelClass}>HR Manager Name</label>
                <input type="text" name="hrContact" value={formData.hrContact || ''} onChange={handleChange} className={inputClass} required />
              </div>
              <div className="space-y-1.5">
                <label className={labelClass}>HR Email Address</label>
                <input type="email" name="contactEmail" value={formData.contactEmail || ''} onChange={handleChange} className={inputClass} required />
              </div>
              <div className="space-y-1.5">
                <label className={labelClass}>HR Contact Phone</label>
                <input type="text" name="phone" value={formData.phone || ''} onChange={handleChange} className={inputClass} required />
              </div>
            </div>
          </div>

          {/* Premium & Partnership Section */}
          <div className="p-5">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {/* Premium */}
              <div className="p-5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-page)]">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-md">
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-[var(--text-primary)]">Premium Listing</h4>
                    <p className="text-xs text-[var(--text-secondary)]">Promote priority vacancies and events</p>
                  </div>
                </div>
                <p className="text-xs text-[var(--text-secondary)] mb-3">Promote priority vacancies, career fairs, scholarships, or department events to top graduates.</p>
                <button type="button" onClick={togglePremium}
                  className={`w-full flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-extrabold transition-all duration-300 ${
                    isPremium ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md' : 'bg-gradient-to-r from-[#003366] to-[#004d99] text-white shadow-md hover:shadow-lg'
                  }`}>
                  {isPremium ? (
                    <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg> Premium Active</>
                  ) : (
                    <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg> Activate Premium</>
                  )}
                </button>
              </div>

              {/* Partnership */}
              <div className="p-5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-page)]">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-md">
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-[var(--text-primary)]">Partnership Interests</h4>
                    <p className="text-xs text-[var(--text-secondary)]">Collaboration types with ASTU</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {['Internship agreements', 'Sponsorship of events', 'Research collaboration', 'Curriculum advisory'].map(item => (
                    <button type="button" key={item} onClick={() => togglePartnership(item)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all duration-200 ${
                        partnerships.includes(item) ? 'border-[#003366] bg-[#003366]/10 text-[#003366]' : 'border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:border-[#003366]/30'
                      }`}>
                      {partnerships.includes(item) && <span className="mr-1">&#10003;</span>}
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Verification */}
            <div className="mt-4 p-5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-page)]">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-md flex-shrink-0">
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-[var(--text-primary)]">Employer Verification</h4>
                    <p className="text-xs text-[var(--text-secondary)] mt-0.5">Submit business license, HR contact proof, and data-sharing agreement for verified access to alumni records.</p>
                  </div>
                </div>
                <button type="button" onClick={submitVerification}
                  disabled={isPendingVerification || isVerified}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-extrabold transition-all duration-300 whitespace-nowrap ${
                    isVerified
                      ? 'bg-emerald-500 text-white shadow-md cursor-default'
                      : isPendingVerification
                        ? 'bg-amber-500 text-white shadow-md cursor-default'
                        : 'bg-gradient-to-r from-[#CC0033] to-red-600 text-white shadow-md hover:shadow-lg'
                  }`}>
                  {isVerified ? (
                    <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg> Verified</>
                  ) : isPendingVerification ? (
                    <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg> Under Review</>
                  ) : (
                    <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg> Submit Verification</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};