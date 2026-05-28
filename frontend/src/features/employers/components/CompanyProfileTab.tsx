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

  return (
    <div className={`max-w-4xl mx-auto rounded-3xl p-8 border shadow-sm transition-all duration-300 ${
      darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-gray-200/60 text-gray-900'
    }`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-gray-150 mb-8 gap-4">
        <div>
          <h3 className="text-2xl font-bold">Company Profile</h3>
          <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>Manage your corporate credentials and recruiting contacts</p>
        </div>
        <button
          onClick={handleSubmit}
          className="px-6 py-2.5 bg-astu-navy hover:bg-astu-navy/90 text-white font-semibold rounded-xl transition-all hover:scale-105 shadow-md whitespace-nowrap"
        >
          Save Profile
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Logo and registration block */}
        <div className={`flex flex-col sm:flex-row items-center gap-6 p-6 rounded-2xl border transition-all ${
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

      </form>
    </div>
  );
};
