import React, { useState } from 'react';
import { CompanyProfile } from '../types/employer.types';
import toast from 'react-hot-toast';

interface CompanyProfileTabProps {
  profile: CompanyProfile;
  onSave: (updatedProfile: CompanyProfile) => void;
  darkMode: boolean;
}

export const CompanyProfileTab: React.FC<CompanyProfileTabProps> = ({ profile, onSave, darkMode }) => {
  const [formData, setFormData] = useState<CompanyProfile>({ ...profile });
  const [premiumListing, setPremiumListing] = useState(false);
  const [partnerships, setPartnerships] = useState<string[]>(['Internship agreements']);
  const [verificationSubmitted, setVerificationSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    toast.success('Company profile updated successfully!');
  };

  const triggerMockLogoChange = () => {
    const randomLogos = [
      'https://images.unsplash.com/photo-1549923746-c502d488b3ea?auto=format&fit=crop&w=150&h=150&q=80',
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=150&h=150&q=80',
      'https://images.unsplash.com/photo-1572021335469-31706a17aaef?auto=format&fit=crop&w=150&h=150&q=80'
    ];
    const newLogo = randomLogos[Math.floor(Math.random() * randomLogos.length)];
    setFormData(prev => ({ ...prev, logoUrl: newLogo }));
    toast.success('Company logo updated!');
  };

  const togglePartnership = (item: string) => {
    setPartnerships(prev => prev.includes(item) ? prev.filter(value => value !== item) : [...prev, item]);
  };

  return (
    <div className={`rounded-[10px] border p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)] transition-all duration-300 ${
      darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-gray-200/60 text-gray-900'
    }`}>
      <div className="mb-4 flex flex-col justify-between gap-4 border-b border-gray-150 pb-4 sm:flex-row sm:items-center">
        <div>
          <h3 className="text-lg font-semibold">Company Profile</h3>
          <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>Manage your corporate credentials and recruiting contacts</p>
        </div>
        <button
          onClick={handleSubmit}
          className="whitespace-nowrap rounded-md bg-astu-navy px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-astu-navy/90"
        >
          Save Profile
        </button>
      </div>

      <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-4">
        {[
          { icon: 'verified', label: 'Employer Status', value: verificationSubmitted ? 'Under review' : 'Verified Partner', tone: 'text-astu-green' },
          { icon: 'workspace_premium', label: 'Premium Profile', value: premiumListing ? 'Sponsored listing' : 'Standard listing', tone: 'text-[#B87900]' },
          { icon: 'handshake', label: 'Partnerships', value: `${partnerships.length} active`, tone: 'text-astu-navy' },
          { icon: 'policy', label: 'Data Agreement', value: 'NDA ready', tone: 'text-astu-red' },
        ].map(item => (
          <div key={item.label} className={`rounded-[10px] border p-4 ${darkMode ? 'border-slate-800 bg-slate-950/40' : 'border-gray-200 bg-gray-50'}`}>
            <div className="flex items-center gap-2">
              <span className={`material-symbols-outlined ${item.tone}`}>{item.icon}</span>
              <p className="text-[11px] font-bold uppercase tracking-wide text-gray-500">{item.label}</p>
            </div>
            <p className="mt-2 text-sm font-bold">{item.value}</p>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Logo and registration block */}
        <div className={`flex flex-col items-center gap-4 rounded-[10px] border p-4 transition-all sm:flex-row ${
          darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-gray-50 border-gray-100'
        }`}>
          <div className="relative group cursor-pointer" onClick={triggerMockLogoChange}>
            <img 
              src={formData.logoUrl} 
              alt="Logo" 
              className="w-24 h-24 rounded-2xl object-cover border border-gray-200 shadow-sm"
            />
            <div className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="material-symbols-outlined text-white text-xl">upload_file</span>
            </div>
          </div>
          <div className="flex-1 w-full space-y-2">
            <h4 className="text-lg font-bold">{formData.name}</h4>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className={`text-[10px] font-bold uppercase tracking-wider block ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>Registration Number</label>
                <input 
                  type="text" 
                  name="registrationNumber"
                  value={formData.registrationNumber}
                  onChange={handleChange}
                  className={`w-full text-xs p-2.5 rounded-xl border mt-1 focus:outline-none ${
                    darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-gray-200 text-gray-800'
                  }`}
                  required
                />
              </div>
              <div>
                <label className={`text-[10px] font-bold uppercase tracking-wider block ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>Industry Classification</label>
                <input 
                  type="text" 
                  name="industry"
                  value={formData.industry}
                  onChange={handleChange}
                  className={`w-full text-xs p-2.5 rounded-xl border mt-1 focus:outline-none ${
                    darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-gray-200 text-gray-800'
                  }`}
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* Company Bio */}
        <div className="space-y-1">
          <label className={`text-xs font-bold uppercase tracking-wider ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>Company Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className={`w-full text-sm p-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-astu-navy/20 h-28 resize-none ${
              darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-800'
            }`}
            placeholder="Tell us about your company and what type of candidates you hire..."
          />
        </div>

        {/* Physical Address and Site links */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-1">
            <label className={`text-xs font-bold uppercase tracking-wider ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>Location / Address</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className={`w-full text-sm p-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-astu-navy/20 ${
                darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-800'
              }`}
              required
            />
          </div>
          <div className="space-y-1">
            <label className={`text-xs font-bold uppercase tracking-wider ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>Corporate Website</label>
            <input
              type="url"
              name="website"
              value={formData.website}
              onChange={handleChange}
              className={`w-full text-sm p-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-astu-navy/20 ${
                darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-800'
              }`}
              placeholder="e.g. https://company.com"
              required
            />
          </div>
        </div>

        {/* HR Contact Details */}
        <div className="space-y-4 pt-4 border-t border-gray-150">
          <h4 className="text-md font-bold flex items-center gap-2">
            <span className="material-symbols-outlined text-astu-green">contact_phone</span>
            Primary HR Recruiter Contact
          </h4>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="space-y-1">
              <label className={`text-xs font-bold uppercase tracking-wider ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>HR Manager Name</label>
              <input
                type="text"
                name="hrName"
                value={formData.hrName}
                onChange={handleChange}
                className={`w-full text-sm p-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-astu-navy/20 ${
                  darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-800'
                }`}
                required
              />
            </div>
            <div className="space-y-1">
              <label className={`text-xs font-bold uppercase tracking-wider ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>HR Email Address</label>
              <input
                type="email"
                name="hrEmail"
                value={formData.hrEmail}
                onChange={handleChange}
                className={`w-full text-sm p-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-astu-navy/20 ${
                  darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-800'
                }`}
                required
              />
            </div>
            <div className="space-y-1">
              <label className={`text-xs font-bold uppercase tracking-wider ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>HR Contact Phone</label>
              <input
                type="text"
                name="hrPhone"
                value={formData.hrPhone}
                onChange={handleChange}
                className={`w-full text-sm p-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-astu-navy/20 ${
                  darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-800'
                }`}
                required
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 border-t border-gray-150 pt-4 lg:grid-cols-2">
          <div className={`rounded-[10px] border p-4 ${darkMode ? 'border-slate-800 bg-slate-950/40' : 'border-gray-200 bg-gray-50'}`}>
            <h4 className="flex items-center gap-2 text-sm font-bold">
              <span className="material-symbols-outlined text-[#B87900]">campaign</span>
              Sponsorship & Premium Employer Profile
            </h4>
            <p className="mt-2 text-xs text-gray-500">Promote priority vacancies, career fairs, scholarships, or department events.</p>
            <button
              type="button"
              onClick={() => {
                setPremiumListing(value => !value);
                toast.success(!premiumListing ? 'Premium employer listing activated.' : 'Premium employer listing paused.');
              }}
              className={`mt-4 rounded-md px-4 py-2 text-xs font-bold text-white ${premiumListing ? 'bg-astu-green' : 'bg-astu-navy'}`}
            >
              {premiumListing ? 'Premium Active' : 'Activate Premium Listing'}
            </button>
          </div>

          <div className={`rounded-[10px] border p-4 ${darkMode ? 'border-slate-800 bg-slate-950/40' : 'border-gray-200 bg-gray-50'}`}>
            <h4 className="flex items-center gap-2 text-sm font-bold">
              <span className="material-symbols-outlined text-astu-green">handshake</span>
              Partnership Interests
            </h4>
            <div className="mt-3 flex flex-wrap gap-2">
              {['Internship agreements', 'Sponsorship of events', 'Research collaboration', 'Curriculum advisory'].map(item => (
                <button
                  type="button"
                  key={item}
                  onClick={() => togglePartnership(item)}
                  className={`rounded-md border px-3 py-1.5 text-[11px] font-bold ${partnerships.includes(item) ? 'border-astu-green bg-astu-green/10 text-astu-green' : 'border-gray-200 bg-white text-gray-600'}`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className={`rounded-[10px] border p-4 ${darkMode ? 'border-slate-800 bg-slate-950/40' : 'border-gray-200 bg-gray-50'}`}>
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h4 className="flex items-center gap-2 text-sm font-bold">
                <span className="material-symbols-outlined text-astu-red">fact_check</span>
                Employer Verification Packet
              </h4>
              <p className="mt-1 text-xs text-gray-500">Submit business license, HR contact proof, and data-sharing agreement for verified access to alumni records.</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setVerificationSubmitted(true);
                toast.success('Verification packet submitted to ASTU admin.');
              }}
              className="rounded-md bg-astu-red px-4 py-2 text-xs font-bold text-white hover:bg-astu-red/90"
            >
              {verificationSubmitted ? 'Packet Submitted' : 'Submit Verification Packet'}
            </button>
          </div>
        </div>

      </form>
    </div>
  );
};
