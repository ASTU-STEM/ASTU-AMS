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
  const [activeSection, setActiveSection] = useState<string>('notifications');
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
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

  const sections = [
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
    { id: 'privacy', label: 'Privacy', icon: '🛡️' },
    { id: 'preferences', label: 'Preferences', icon: '⚙️' },
    { id: 'security', label: 'Security', icon: '🔒' },
  ];

  const ToggleSwitch: React.FC<{ enabled: boolean; onToggle: () => void; color?: string }> = ({ enabled, onToggle, color = '#003366' }) => (
    <button
      type="button"
      onClick={onToggle}
      className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#003366]/20 focus:ring-offset-2"
      style={{ backgroundColor: enabled ? color : 'var(--border-color)' }}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition-all duration-300 ease-in-out ${
          enabled ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );

  return (
    <div className="space-y-6">
      {/* Enhanced Hero Banner */}
      <section className="relative overflow-hidden rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] p-6 shadow-sm">
        <div className="absolute inset-0 bg-gradient-to-br from-[#003366] via-[#004080] to-[#1a5c3a] opacity-95"></div>
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full -translate-y-1/3 translate-x-1/3"></div>
          <div className="absolute bottom-0 left-0 w-56 h-56 bg-[#FFD700]/8 rounded-full translate-y-1/3 -translate-x-1/4"></div>
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <span className="px-2.5 py-1 bg-white/15 text-[#FFD700] text-[10px] font-extrabold uppercase tracking-[0.2em] rounded-full backdrop-blur-sm">
              Account Settings
            </span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight leading-tight">
              Settings & Preferences
            </h2>
            <p className="text-sm text-white/80 leading-relaxed max-w-xl">
              Configure notification preferences, manage privacy controls, update security credentials, and personalize your alumni experience.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center border border-white/10">
              <span className="text-xl block">📧</span>
              <p className="text-[10px] text-white/70 font-bold uppercase tracking-wider mt-1">
                {Object.values(prefs).filter(Boolean).length} Active
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center border border-white/10">
              <span className="text-xl block">🔐</span>
              <p className="text-[10px] text-white/70 font-bold uppercase tracking-wider mt-1">Secured</p>
            </div>
          </div>
        </div>
      </section>

      {/* Section Navigation Tabs */}
      <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)] shadow-sm overflow-hidden">
        <div className="flex overflow-x-auto border-b border-[var(--border-color)]">
          {sections.map(section => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`flex items-center gap-2 px-5 py-3.5 text-xs font-bold whitespace-nowrap transition-all duration-200 border-b-2 ${
                activeSection === section.id
                  ? 'border-[#003366] text-[#003366] bg-[#003366]/5'
                  : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-page)]'
              }`}
            >
              <span className="text-base">{section.icon}</span>
              {section.label}
            </button>
          ))}
        </div>

        <div className="p-5">
          {/* Notifications Section */}
          {activeSection === 'notifications' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-extrabold text-[var(--text-primary)] tracking-tight">Notification Preferences</h3>
                <p className="text-[11px] text-[var(--text-secondary)] mt-1">Choose which updates you receive via email and in-app notifications.</p>
              </div>

              <div className="space-y-3">
                {[
                  { key: 'emailJobs' as const, label: 'Job & Placement Recommendations', desc: 'Get alerted when emerging opportunities match your skill sets.', icon: '💼', color: '#003366' },
                  { key: 'emailSurveys' as const, label: 'Tracer Survey Reminders', desc: 'Receive reminders when institutional tracer studies require submission.', icon: '📋', color: '#003366' },
                  { key: 'emailMentorship' as const, label: 'Mentorship Session Updates', desc: 'Get alerts when peers or mentors accept or reschedule requests.', icon: '🤝', color: '#003366' },
                ].map(opt => (
                  <div key={opt.key} className="flex items-center justify-between gap-4 p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-page)] hover:border-[#003366]/20 transition-all duration-200 group">
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] flex items-center justify-center text-lg shadow-sm group-hover:shadow-md transition-shadow">
                        {opt.icon}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[var(--text-primary)]">{opt.label}</p>
                        <p className="text-[10px] text-[var(--text-secondary)] mt-0.5">{opt.desc}</p>
                      </div>
                    </div>
                    <ToggleSwitch
                      enabled={prefs[opt.key]}
                      onToggle={() => handleToggleChange(opt.key)}
                      color={opt.color}
                    />
                  </div>
                ))}
              </div>

              {/* Email Digest Frequency */}
              <div className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-page)]">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] flex items-center justify-center text-lg shadow-sm">
                    ⏰
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[var(--text-primary)]">Email Digest Frequency</p>
                    <p className="text-[10px] text-[var(--text-secondary)]">How often to receive notification summaries</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 mt-3">
                  {['instant', 'weekly', 'monthly'].map(option => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => {
                        setDigest(option);
                        toast.success(`Digest frequency set to ${option}.`);
                      }}
                      className={`rounded-xl border px-4 py-2.5 text-xs font-bold capitalize transition-all duration-200 ${
                        digest === option
                          ? 'border-[#003366] bg-[#003366] text-white shadow-md'
                          : 'border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:border-[#003366]/30'
                      }`}
                    >
                      {option === 'instant' && '⚡ '}{option === 'weekly' && '📅 '}{option === 'monthly' && '📆 '}
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Privacy Section */}
          {activeSection === 'privacy' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-extrabold text-[var(--text-primary)] tracking-tight">Privacy & Directory Visibility</h3>
                <p className="text-[11px] text-[var(--text-secondary)] mt-1">Control who can view your professional profile details in the ASTU alumni database.</p>
              </div>

              <div className="space-y-3">
                {[
                  { key: 'profileVisibleToEmployers' as const, label: 'Visible to Partner Employers', desc: 'Allow companies to search your qualifications and CV for recruitment.', icon: '🏢', badge: 'Recommended' },
                  { key: 'profileVisibleToPeers' as const, label: 'Visible in Peer Network', desc: 'Appear in alumni directory for mentorship networking and connections.', icon: '👥', badge: null },
                ].map(opt => (
                  <div key={opt.key} className="flex items-center justify-between gap-4 p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-page)] hover:border-[#003366]/20 transition-all duration-200 group">
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] flex items-center justify-center text-lg shadow-sm group-hover:shadow-md transition-shadow">
                        {opt.icon}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-bold text-[var(--text-primary)]">{opt.label}</p>
                          {opt.badge && (
                            <span className="px-1.5 py-0.5 bg-[#003366]/10 text-[#003366] text-[9px] font-extrabold rounded uppercase tracking-wider">
                              {opt.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-[var(--text-secondary)] mt-0.5">{opt.desc}</p>
                      </div>
                    </div>
                    <ToggleSwitch
                      enabled={prefs[opt.key]}
                      onToggle={() => handleToggleChange(opt.key)}
                    />
                  </div>
                ))}
              </div>

              {/* Data Retention Info */}
              <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/50 flex items-start gap-3">
                <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-xs font-bold text-blue-800">Data Retention Policy</p>
                  <p className="text-[10px] text-blue-700 mt-0.5 leading-relaxed">
                    Your profile data is retained for 5 years after graduation. You may request deletion at any time by contacting the registrar office.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Preferences Section */}
          {activeSection === 'preferences' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-extrabold text-[var(--text-primary)] tracking-tight">Alumni Preferences</h3>
                <p className="text-[11px] text-[var(--text-secondary)] mt-1">Customize your experience and manage alumni engagement options.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Tracer Reminder Engine */}
                <div className="p-5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] hover:shadow-md transition-all duration-200">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-md">
                      <span className="text-lg">📊</span>
                    </div>
                    <div>
                      <h4 className="text-xs font-extrabold text-[var(--text-primary)]">Tracer Reminder Engine</h4>
                      <p className="text-[10px] text-[var(--text-secondary)]">Survey notification frequency</p>
                    </div>
                  </div>
                  <div className="space-y-2 mt-4">
                    {['instant', 'weekly', 'monthly'].map(option => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => {
                          setDigest(option);
                          toast.success(`Tracer digest set to ${option}.`);
                        }}
                        className={`w-full flex items-center justify-between p-2.5 rounded-lg border text-left transition-all duration-200 ${
                          digest === option
                            ? 'border-[#003366] bg-[#003366]/5'
                            : 'border-[var(--border-color)] hover:border-[#003366]/20'
                        }`}
                      >
                        <span className="text-xs font-bold capitalize text-[var(--text-primary)]">{option}</span>
                        {digest === option && (
                          <svg className="w-4 h-4 text-[#003366]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Donation & Support */}
                <div className="p-5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] hover:shadow-md transition-all duration-200">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-md">
                      <span className="text-lg">💝</span>
                    </div>
                    <div>
                      <h4 className="text-xs font-extrabold text-[var(--text-primary)]">Alumni Giving</h4>
                      <p className="text-[10px] text-[var(--text-secondary)]">Scholarship & department support</p>
                    </div>
                  </div>
                  <p className="text-[10px] text-[var(--text-secondary)] mt-3 leading-relaxed">
                    Enable Telebirr-ready prompts for scholarship fund contributions and department development support initiatives.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setDonationEnabled((value) => !value);
                      toast.success(!donationEnabled ? 'Donation prompts enabled.' : 'Donation prompts paused.');
                    }}
                    className={`mt-4 w-full flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-extrabold transition-all duration-300 ${
                      donationEnabled
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md'
                        : 'bg-gradient-to-r from-[#003366] to-[#004d99] text-white shadow-md hover:shadow-lg'
                    }`}
                  >
                    {donationEnabled ? '✅ Giving Prompts Active' : '💝 Enable Giving Prompts'}
                  </button>
                </div>
              </div>

              {/* Theme Preference */}
              <div className="p-5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)]">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white shadow-md">
                    <span className="text-lg">🎨</span>
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-[var(--text-primary)]">Display Preferences</h4>
                    <p className="text-[10px] text-[var(--text-secondary)]">Customize visual appearance</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 rounded-xl border-2 border-[#003366] bg-[#003366]/5 text-center cursor-pointer">
                    <div className="w-8 h-8 rounded-lg bg-white border border-gray-200 mx-auto mb-2 flex items-center justify-center shadow-sm">
                      <span className="text-sm">☀️</span>
                    </div>
                    <p className="text-xs font-bold text-[#003366]">Light Mode</p>
                    <p className="text-[9px] text-[var(--text-secondary)] mt-0.5">Active</p>
                  </div>
                  <div className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-page)] text-center cursor-pointer hover:border-[#003366]/30 transition-all">
                    <div className="w-8 h-8 rounded-lg bg-gray-800 mx-auto mb-2 flex items-center justify-center shadow-sm">
                      <span className="text-sm">🌙</span>
                    </div>
                    <p className="text-xs font-bold text-[var(--text-primary)]">Dark Mode</p>
                    <p className="text-[9px] text-[var(--text-secondary)] mt-0.5">Available</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Security Section */}
          {activeSection === 'security' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-extrabold text-[var(--text-primary)] tracking-tight">Security Management</h3>
                <p className="text-[11px] text-[var(--text-secondary)] mt-1">Update your security credentials and manage account protection.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Password Change Form */}
                <div className="p-5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)]">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center text-white shadow-md">
                      <span className="text-lg">🔑</span>
                    </div>
                    <div>
                      <h4 className="text-xs font-extrabold text-[var(--text-primary)]">Change Password</h4>
                      <p className="text-[10px] text-[var(--text-secondary)]">Update your account password</p>
                    </div>
                  </div>

                  <form onSubmit={handlePasswordSubmit} className="space-y-4">
                    {[
                      { name: 'currentPassword', label: 'Current Password', key: 'current' as const },
                      { name: 'newPassword', label: 'New Password', key: 'new' as const },
                      { name: 'confirmPassword', label: 'Confirm New Password', key: 'confirm' as const },
                    ].map(field => (
                      <div key={field.name} className="space-y-1.5">
                        <label className="text-[10px] font-extrabold text-[var(--text-secondary)] uppercase tracking-[0.15em]">
                          {field.label}
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword[field.key] ? 'text' : 'password'}
                            name={field.name}
                            value={passwords[field.name as keyof typeof passwords]}
                            onChange={handlePasswordChange}
                            className="w-full text-xs p-3 pr-10 bg-[var(--bg-page)] border border-[var(--border-color)] rounded-xl focus:ring-2 focus:ring-[#003366]/20 focus:outline-none focus:border-[#003366] focus:bg-[var(--bg-card)] transition-all duration-200 text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
                            placeholder={`Enter ${field.label.toLowerCase()}`}
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(prev => ({ ...prev, [field.key]: !prev[field.key] }))}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              {showPassword[field.key] ? (
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                              ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              )}
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}

                    <button
                      type="submit"
                      className="w-full py-3 bg-gradient-to-r from-[#003366] to-[#004d99] hover:from-[#00264d] hover:to-[#003366] text-white rounded-xl text-xs font-extrabold tracking-wider uppercase transition-all duration-300 shadow-md hover:shadow-lg hover:scale-[1.01] active:scale-[0.99]"
                    >
                      Update Password
                    </button>
                  </form>
                </div>

                {/* Account Security Info */}
                <div className="space-y-4">
                  <div className="p-5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)]">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-md">
                        <span className="text-lg">🛡️</span>
                      </div>
                      <div>
                        <h4 className="text-xs font-extrabold text-[var(--text-primary)]">Security Status</h4>
                        <p className="text-[10px] text-[var(--text-secondary)]">Account protection overview</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {[
                        { label: 'Password', status: 'Strong', color: 'emerald', icon: '✅' },
                        { label: 'Two-Factor Auth', status: 'Not enabled', color: 'amber', icon: '⚠️' },
                        { label: 'Last Login', status: 'Today, 09:15 AM', color: 'blue', icon: '🕐' },
                        { label: 'Session', status: 'Active (1 device)', color: 'emerald', icon: '💻' },
                      ].map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2.5 rounded-lg bg-[var(--bg-page)]">
                          <div className="flex items-center gap-2">
                            <span className="text-sm">{item.icon}</span>
                            <span className="text-xs font-bold text-[var(--text-primary)]">{item.label}</span>
                          </div>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            item.color === 'emerald' ? 'bg-emerald-50 text-emerald-700' :
                            item.color === 'amber' ? 'bg-amber-50 text-amber-700' :
                            'bg-blue-50 text-blue-700'
                          }`}>
                            {item.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="p-5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)]">
                    <h4 className="text-xs font-extrabold text-[var(--text-primary)] mb-3">Quick Actions</h4>
                    <div className="space-y-2">
                      {[
                        { label: 'Enable Two-Factor Authentication', icon: '🔐', color: 'from-blue-500 to-indigo-600' },
                        { label: 'Download Account Data', icon: '📥', color: 'from-emerald-500 to-teal-600' },
                        { label: 'View Login History', icon: '📋', color: 'from-violet-500 to-purple-600' },
                      ].map((action, idx) => (
                        <button
                          key={idx}
                          className="w-full flex items-center gap-3 p-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-page)] hover:border-[#003366]/20 hover:shadow-sm transition-all duration-200 text-left group"
                        >
                          <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${action.color} flex items-center justify-center text-white text-sm shadow-sm group-hover:shadow-md transition-shadow`}>
                            {action.icon}
                          </div>
                          <span className="text-xs font-bold text-[var(--text-primary)]">{action.label}</span>
                          <svg className="w-3.5 h-3.5 text-[var(--text-muted)] ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Danger Zone */}
                  <div className="p-5 rounded-xl border border-red-200 bg-red-50/50">
                    <h4 className="text-xs font-extrabold text-red-700 mb-2">⚠️ Danger Zone</h4>
                    <p className="text-[10px] text-red-600 mb-3">Permanently delete your account and all associated data.</p>
                    <button className="px-4 py-2 rounded-xl border border-red-300 bg-white text-red-600 text-xs font-bold hover:bg-red-50 transition-all duration-200">
                      Delete Account
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};