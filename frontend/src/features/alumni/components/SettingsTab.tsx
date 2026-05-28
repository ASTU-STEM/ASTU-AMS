import React, { useState } from 'react';
import { AlumniPreferences } from '../types/alumni.types';
import toast from 'react-hot-toast';

interface SettingsTabProps {
  preferences: AlumniPreferences;
  onSavePreferences: (updatedPrefs: AlumniPreferences) => void;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({ preferences, onSavePreferences }) => {
  const [prefs, setPrefs] = useState<AlumniPreferences>({ ...preferences });
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleToggleChange = (key: keyof AlumniPreferences) => {
    const updated = {
      ...prefs,
      [key]: !prefs[key]
    };
    setPrefs(updated);
    onSavePreferences(updated);
    toast.success('Preference updated successfully!');
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswords(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error('New password and confirm password do not match.');
      return;
    }
    if (passwords.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long.');
      return;
    }

    toast.success('Password changed successfully!');
    setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Overview Intro Banner */}
      <section className="bg-gradient-to-r from-slate-800 via-gray-900 to-slate-900 rounded-3xl p-8 text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 bottom-0 w-80 h-80 bg-white/5 rounded-full blur-3xl"></div>
        <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">Account Preferences & Settings ⚙️</h2>
        <p className="text-sm opacity-90 leading-relaxed mt-2">
          Manage your secure password, configure automated notification digests, and control visibility standards of your verified academic information to prospective partner employers.
        </p>
      </section>

      {/* Form cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Left: Preferences Card */}
        <div className="space-y-6">
          {/* Notification toggles */}
          <div className="bg-white rounded-3xl p-6 border border-gray-200/60 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <span className="material-symbols-outlined text-astu-navy">notifications</span>
              Notifications Preferences
            </h3>
            <p className="text-xs text-gray-600">Choose which updates you would like to receive in your registered email.</p>

            <div className="space-y-3 pt-2">
              {[
                { key: 'emailJobs' as const, label: 'Job & Placement Recommendations', desc: 'Alerts when emerging opportunities match your skill sets.' },
                { key: 'emailSurveys' as const, label: 'Tracer Survey Reminders', desc: 'Reminders when institutional tracer studies require submission.' },
                { key: 'emailMentorship' as const, label: 'Mentorship Session Updates', desc: 'Alerts when peers or students accept scheduled requests.' }
              ].map(opt => (
                <div key={opt.key} className="flex items-start justify-between gap-4 p-3 bg-gray-50 rounded-xl hover:bg-gray-100/50 transition-colors">
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-gray-900">{opt.label}</p>
                    <p className="text-[10px] text-gray-500">{opt.desc}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleToggleChange(opt.key)}
                    className={`w-10 h-5 rounded-full p-0.5 transition-colors duration-300 flex-shrink-0 ${
                      prefs[opt.key] ? 'bg-astu-green' : 'bg-gray-300'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-300 transform ${
                      prefs[opt.key] ? 'translate-x-5' : 'translate-x-0'
                    }`}></div>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Privacy controls */}
          <div className="bg-white rounded-3xl p-6 border border-gray-200/60 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <span className="material-symbols-outlined text-astu-red">shield</span>
              Privacy & Directory Visibility
            </h3>
            <p className="text-xs text-gray-600">Control who can view your professional profile details in the ASTU database.</p>

            <div className="space-y-3 pt-2">
              {[
                { key: 'profileVisibleToEmployers' as const, label: 'Visible to Partner Employers', desc: 'Allow companies to search your qualifications and CV.' },
                { key: 'profileVisibleToPeers' as const, label: 'Visible in Peer Network', desc: 'Appear in alumni directory for mentorship networking.' }
              ].map(opt => (
                <div key={opt.key} className="flex items-start justify-between gap-4 p-3 bg-gray-50 rounded-xl hover:bg-gray-100/50 transition-colors">
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-gray-900">{opt.label}</p>
                    <p className="text-[10px] text-gray-500">{opt.desc}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleToggleChange(opt.key)}
                    className={`w-10 h-5 rounded-full p-0.5 transition-colors duration-300 flex-shrink-0 ${
                      prefs[opt.key] ? 'bg-astu-green' : 'bg-gray-300'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-300 transform ${
                      prefs[opt.key] ? 'translate-x-5' : 'translate-x-0'
                    }`}></div>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Security & Password Management */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-3xl p-6 border border-gray-200/60 shadow-sm space-y-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-astu-navy">lock</span>
                Security Management
              </h3>
              <p className="text-xs text-gray-600">Update your security key regularly to keep your credentials protected.</p>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Current Password</label>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwords.currentPassword}
                  onChange={handlePasswordChange}
                  className="w-full text-sm p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-astu-navy/20 focus:outline-none focus:border-astu-navy focus:bg-white transition-all"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">New Password</label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwords.newPassword}
                  onChange={handlePasswordChange}
                  className="w-full text-sm p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-astu-navy/20 focus:outline-none focus:border-astu-navy focus:bg-white transition-all"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Confirm New Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwords.confirmPassword}
                  onChange={handlePasswordChange}
                  className="w-full text-sm p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-astu-navy/20 focus:outline-none focus:border-astu-navy focus:bg-white transition-all"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-astu-navy hover:bg-astu-navy/90 text-white rounded-xl text-xs font-extrabold tracking-wider uppercase transition-all shadow-md"
              >
                Change Password
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
};
