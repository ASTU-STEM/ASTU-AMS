import React, { useState } from 'react';
import { AlumniPreferences } from '../types/alumni.types';
import toast from 'react-hot-toast';

interface SettingsTabProps {
  preferences: AlumniPreferences;
  onSavePreferences: (updatedPrefs: AlumniPreferences) => void;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({ preferences, onSavePreferences }) => {
  const [prefs, setPrefs] = useState<AlumniPreferences>({ ...preferences });
  const [digest, setDigest] = useState('weekly');
  const [donationEnabled, setDonationEnabled] = useState(false);
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
    <div className="space-y-6">
      {/* Overview Intro Banner */}
      <section className="rounded-[20px] border border-[var(--border-color)] bg-[linear-gradient(135deg,#003580,#0f4f86,#1D9E75)] p-5 text-white shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/70">Alumni settings</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight">Account Preferences & Settings</h2>
        <p className="mt-2 text-sm leading-relaxed text-white/85">
          Manage your secure password, configure automated notification digests, and control visibility standards of your verified academic information to prospective partner employers.
        </p>
      </section>

      {/* Form cards grid */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        
        {/* Left: Preferences Card */}
        <div className="space-y-4 xl:col-span-2">
          {/* Notification toggles */}
          <div className="space-y-4 rounded-[10px] border border-gray-200/60 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
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
                <div key={opt.key} className="flex items-start justify-between gap-4 rounded-[10px] bg-gray-50 p-3 transition-colors hover:bg-gray-100/50">
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
          <div className="space-y-4 rounded-[10px] border border-gray-200/60 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
              <span className="material-symbols-outlined text-astu-red">shield</span>
              Privacy & Directory Visibility
            </h3>
            <p className="text-xs text-gray-600">Control who can view your professional profile details in the ASTU database.</p>

            <div className="space-y-3 pt-2">
              {[
                { key: 'profileVisibleToEmployers' as const, label: 'Visible to Partner Employers', desc: 'Allow companies to search your qualifications and CV.' },
                { key: 'profileVisibleToPeers' as const, label: 'Visible in Peer Network', desc: 'Appear in alumni directory for mentorship networking.' }
              ].map(opt => (
                <div key={opt.key} className="flex items-start justify-between gap-4 rounded-[10px] bg-gray-50 p-3 transition-colors hover:bg-gray-100/50">
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

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-[10px] border border-gray-200/60 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                <span className="material-symbols-outlined text-astu-green">schedule_send</span>
                Tracer Reminder Engine
              </h3>
              <p className="mt-2 text-xs text-gray-600">Choose how often ASTU can remind you about 6, 12, and 24-month surveys.</p>
              <div className="mt-4 grid grid-cols-3 gap-2">
                {['instant', 'weekly', 'monthly'].map(option => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => {
                      setDigest(option);
                      toast.success(`Tracer digest set to ${option}.`);
                    }}
                    className={`rounded-md border px-3 py-2 text-xs font-bold capitalize ${digest === option ? 'border-astu-green bg-astu-green/10 text-astu-green' : 'border-gray-200 bg-gray-50 text-gray-600'}`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-[10px] border border-gray-200/60 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                <span className="material-symbols-outlined text-[#B87900]">volunteer_activism</span>
                Donation & Alumni Support
              </h3>
              <p className="mt-2 text-xs text-gray-600">Enable Telebirr-ready scholarship and department support prompts.</p>
              <button
                type="button"
                onClick={() => {
                  setDonationEnabled((value) => !value);
                  toast.success(!donationEnabled ? 'Donation prompts enabled.' : 'Donation prompts paused.');
                }}
                className={`mt-4 rounded-md px-4 py-2 text-xs font-bold text-white ${donationEnabled ? 'bg-astu-green' : 'bg-astu-navy'}`}
              >
                {donationEnabled ? 'Support Prompts Enabled' : 'Enable Donation Prompts'}
              </button>
            </div>
          </div>
        </div>

        {/* Right: Security & Password Management */}
        <div className="lg:col-span-1">
          <div className="space-y-5 rounded-[10px] border border-gray-200/60 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <div>
              <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
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
