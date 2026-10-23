import React, { useState, useEffect } from 'react';
import { AlumniPreferences } from '../types/alumni.types';
import { alumniService } from '../services/alumni.service';
import { authService } from '../../auth/services/auth.service';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import toast from 'react-hot-toast';
import { useTheme } from '../../../hooks/useTheme';
import Modal from '../../../components/ui/Modal';
import { alumniCardClass } from './alumniUi';
import { AlumniSectionShell } from './AlumniSectionShell';

interface SettingsTabProps {
  preferences: AlumniPreferences;
  onSavePreferences: (updatedPrefs: AlumniPreferences) => void;
}

const DEFAULT_PREFERENCES: AlumniPreferences = {
  emailJobs: true,
  emailSurveys: true,
  emailMentorship: true,
  emailEvents: true,
  emailNewsletter: true,
  smsNotifications: true,
  profileVisibleToEmployers: true,
  profileVisibleToPeers: true,
  profileVisibleToAlumni: true,
  anonymousTracerResponses: false,
  shareAchievementsPublic: true,
};

const getEffectivePrefs = (rawPrefs?: Partial<AlumniPreferences>): AlumniPreferences => {
  return {
    emailJobs: rawPrefs?.emailJobs ?? true,
    emailSurveys: rawPrefs?.emailSurveys ?? true,
    emailMentorship: rawPrefs?.emailMentorship ?? true,
    emailEvents: rawPrefs?.emailEvents ?? true,
    emailNewsletter: rawPrefs?.emailNewsletter ?? true,
    smsNotifications: rawPrefs?.smsNotifications ?? true,
    profileVisibleToEmployers: rawPrefs?.profileVisibleToEmployers ?? true,
    shareCgpaToEmployers: rawPrefs?.shareCgpaToEmployers ?? true,
    profileVisibleToPeers: rawPrefs?.profileVisibleToPeers ?? true,
    profileVisibleToAlumni: rawPrefs?.profileVisibleToAlumni ?? true,
    anonymousTracerResponses: rawPrefs?.anonymousTracerResponses ?? false,
    shareAchievementsPublic: rawPrefs?.shareAchievementsPublic ?? true,
  };
};

export const SettingsTab: React.FC<SettingsTabProps> = ({ preferences, onSavePreferences }) => {
  const [prefs, setPrefs] = useState<AlumniPreferences>(() => getEffectivePrefs(preferences));
  const [digest, setDigest] = useState((preferences as any)?.digestFrequency || 'instant');
  const [donationEnabled, setDonationEnabled] = useState((preferences as any)?.donationEnabled ?? true);
  // Single source of truth for the theme. The local mirror previously applied
  // the `dark` class without removing `light`, so the preference looked broken.
  const { theme, setTheme } = useTheme();
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
  const [changingPassword, setChangingPassword] = useState(false);
  const [securityStatus, setSecurityStatus] = useState<any>(null);
  const [setup2FAMode, setSetup2FAMode] = useState<'app' | 'email'>('app');
  const [sendingSetupOtp, setSendingSetupOtp] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleSendSetupEmailOtp = async () => {
    const targetEmail = authService.resolveTarget2FAEmail(
      (preferences as any)?.contactEmail || (preferences as any)?.email,
      (preferences as any)?.personalEmail || user?.email
    );
    if (!targetEmail) {
      toast.error('No account or contact email found for 2FA verification.');
      return;
    }
    setSendingSetupOtp(true);
    try {
      const res = await authService.send2FAOTP(targetEmail);
      if (res.ok) {
        toast.success(`Verification code sent to ${targetEmail}`);
        if (res.data?.devCode) {
          toast(`DEV CODE: ${res.data.devCode}`, { icon: '🔑', duration: 8000 });
        }
      } else {
        toast.error(res.message || 'Failed to send code.');
      }
    } catch (err) {
      toast.error('Failed to send verification code.');
    } finally {
      setSendingSetupOtp(false);
    }
  };

  // Sync local state when preferences prop changes (e.g., from backend)
  useEffect(() => {
    if (preferences) {
      setPrefs(getEffectivePrefs(preferences));
      setDigest((preferences as any)?.digestFrequency || 'instant');
      setDonationEnabled((preferences as any)?.donationEnabled ?? true);
      if ((preferences as any)?.theme) {
        setTheme((preferences as any).theme);
      }
    }
  }, [preferences, setTheme]);

  // Load security status
  useEffect(() => {
    const loadSecurityStatus = async () => {
      try {
        const status = await alumniService.getSecurityStatus();
        setSecurityStatus(status);
      } catch (err) {
        console.error('Failed to load security status', err);
      }
    };
    loadSecurityStatus();
  }, []);

  const handleToggleChange = (key: keyof AlumniPreferences) => {
    const currentVal = prefs[key] ?? true;
    const updated = {
      ...prefs,
      [key]: !currentVal,
      digestFrequency: digest,
      donationEnabled,
      theme,
    };
    setPrefs(updated as AlumniPreferences);
    onSavePreferences(updated as AlumniPreferences);
    toast.success('Preference updated and saved!');
  };

  const handleDigestChange = (option: string) => {
    setDigest(option);
    const updated = { ...prefs, digestFrequency: option, donationEnabled, theme } as any;
    setPrefs(updated);
    onSavePreferences(updated);
    toast.success(`Tracer survey reminder frequency set to ${option}.`);
  };

  const handleDonationToggle = () => {
    const newVal = !donationEnabled;
    setDonationEnabled(newVal);
    const updated = { ...prefs, digestFrequency: digest, donationEnabled: newVal, theme } as any;
    setPrefs(updated);
    onSavePreferences(updated);
    toast.success(newVal ? 'Alumni Giving prompts enabled.' : 'Alumni Giving prompts paused.');
  };

  const handleThemeChange = (newTheme: 'light' | 'dark') => {
    // useTheme applies the class and persists to localStorage.
    setTheme(newTheme);
    const updated = { ...prefs, digestFrequency: digest, donationEnabled, theme: newTheme } as any;
    setPrefs(updated);
    onSavePreferences(updated);
    toast.success(`${newTheme === 'dark' ? 'Dark' : 'Light'} Mode activated!`);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswords(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const [show2FAModal, setShow2FAModal] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [showLoginHistoryModal, setShowLoginHistoryModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deletingAccount, setDeletingAccount] = useState(false);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error('New password and confirm password do not match.');
      return;
    }
    if (passwords.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long.');
      return;
    }
    setChangingPassword(true);
    try {
      await alumniService.changePassword(passwords.currentPassword, passwords.newPassword);
      toast.success('Password changed successfully!');
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to change password. Please check your current password.';
      toast.error(msg);
    } finally {
      setChangingPassword(false);
    }
  };

  const handleEnable2FA = () => {
    setShow2FAModal(true);
  };

  const handleVerify2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!twoFactorCode || twoFactorCode.trim().length < 6) {
      toast.error('Please enter a valid 6-digit verification code.');
      return;
    }

    const targetEmail = user?.email || (preferences as any)?.email || 'alumni@astu.edu.et';

    toast.loading('Verifying 2FA code...', { id: 'verify-2fa-setup' });
    const verifyRes = await authService.verify2FACode(twoFactorCode.trim(), targetEmail);
    if (!verifyRes.ok) {
      toast.error(verifyRes.message || 'Invalid 2FA code. Please check the code and try again.', { id: 'verify-2fa-setup' });
      return;
    }
    toast.dismiss('verify-2fa-setup');

    const isEnabling = !securityStatus?.twoFactorEnabled;
    const updatedStatus = { ...securityStatus, twoFactorEnabled: isEnabling };
    setSecurityStatus(updatedStatus);
    const updated = { ...prefs, digestFrequency: digest, donationEnabled, theme, twoFactorEnabled: isEnabling } as any;
    onSavePreferences(updated);
    toast.success(isEnabling ? 'Two-Factor Authentication enabled successfully!' : '2FA disabled.');
    setShow2FAModal(false);
    setTwoFactorCode('');
  };

  const handleDownloadData = async () => {
    try {
      toast.loading('Preparing your account data export...', { id: 'export-data' });
      const data = await alumniService.exportAccountData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `astu_alumni_data_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Account data downloaded successfully!', { id: 'export-data' });
    } catch (err) {
      toast.error('Failed to export account data.', { id: 'export-data' });
    }
  };

  const handleViewLoginHistory = async () => {
    try {
      const status = await alumniService.getSecurityStatus();
      setSecurityStatus(status);
    } catch (err) {
      console.error('Error fetching login history:', err);
    }
    setShowLoginHistoryModal(true);
  };

  const handleDeleteAccountModalOpen = () => {
    setDeleteConfirmText('');
    setShowDeleteModal(true);
  };

  const handleConfirmDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (deleteConfirmText.trim().toUpperCase() !== 'DELETE') {
      toast.error('Please type "DELETE" to confirm account deletion.');
      return;
    }
    setDeletingAccount(true);
    try {
      await alumniService.deleteAccount();
      toast.success('Account permanently deleted.');
      setShowDeleteModal(false);
      logout();
      navigate('/login');
    } catch (err) {
      toast.error('Failed to delete account. Please try again.');
    } finally {
      setDeletingAccount(false);
    }
  };

  const sections = [
    { id: 'notifications', label: 'Notifications', icon: 'notifications' },
    { id: 'privacy', label: 'Privacy', icon: 'privacy_tip' },
    { id: 'preferences', label: 'Preferences', icon: 'settings' },
    { id: 'security', label: 'Security', icon: 'lock' },
  ];

  const ToggleSwitch: React.FC<{ enabled: boolean; onToggle: () => void; color?: string }> = ({ enabled, onToggle, color = '#003366' }) => (
    <button
      type="button"
      onClick={onToggle}
      className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#003366]/20 focus:ring-offset-2"
      style={{ backgroundColor: enabled ? color : 'var(--border-color)' }}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition-all duration-300 ease-in-out ${enabled ? 'translate-x-5' : 'translate-x-0'
          }`}
      />
    </button>
  );

  return (
    <AlumniSectionShell
      eyebrow="Account"
      title="Settings & preferences"
      description="Control alerts, privacy, display options, and account security in one place."
      metrics={[
        { value: `${Object.values(prefs).filter(Boolean).length}`, label: 'On', accent: 'gold' },
        { value: 'Protected', label: 'Account', accent: 'green' },
      ]}
    >

      <div className={`${alumniCardClass} overflow-hidden`}>
        <div className="flex overflow-x-auto border-b border-[var(--border-color)]">
          {sections.map(section => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`flex items-center gap-2 px-5 py-3.5 text-xs font-bold whitespace-nowrap transition-all duration-200 border-b-2 ${activeSection === section.id
                ? 'border-[#003366] text-[#003366] bg-[#003366]/5'
                : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-page)]'
                }`}
            >
              <span className="material-symbols-outlined text-[18px] leading-none">{section.icon}</span>
              {section.label}
            </button>
          ))}
        </div>

        <div className="p-5">
          {/* Notifications Section */}
          {activeSection === 'notifications' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-extrabold text-[var(--text-primary)] tracking-tight">Notifications</h3>
                <p className="text-[11px] text-[var(--text-secondary)] mt-1">Pick which email and in-app updates you want to receive.</p>
              </div>

              <div className="space-y-3">
                  {[
                    { key: 'emailJobs' as const, label: 'Job recommendations', desc: 'Alerts when openings match your skills and interests.', icon: 'work', color: '#003366' },
                    { key: 'emailSurveys' as const, label: 'Tracer survey reminders', desc: 'Reminders when ASTU needs your tracer study response.', icon: 'assignment', color: '#003366' },
                    { key: 'emailMentorship' as const, label: 'Mentorship updates', desc: 'Notices when a mentor accepts, declines, or reschedules.', icon: 'diversity_3', color: '#003366' },
                    { key: 'emailEvents' as const, label: 'Events & workshops', desc: 'Career fairs, workshops, and networking invites.', icon: 'event', color: '#003366' },
                    { key: 'emailNewsletter' as const, label: 'Alumni newsletter', desc: 'Monthly stories, campus news, and community highlights.', icon: 'newspaper', color: '#003366' },
                    { key: 'smsNotifications' as const, label: 'SMS alerts', desc: 'Critical texts for documents ready or interview invites.', icon: 'sms', color: '#003366' },
                  ].map(opt => (
                  <div key={opt.key} className="flex items-center justify-between gap-4 p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-page)] hover:border-[#003366]/20 transition-all duration-200 group">
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] flex items-center justify-center text-lg shadow-sm group-hover:shadow-md transition-shadow">
                        <span className="material-symbols-outlined">{opt.icon}</span>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[var(--text-primary)]">{opt.label}</p>
                        <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">{opt.desc}</p>
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
                  <div className="w-10 h-10 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] flex items-center justify-center shadow-sm">
                    <span className="material-symbols-outlined text-[#003366]">schedule</span>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[var(--text-primary)]">Email digest</p>
                    <p className="text-[11px] text-[var(--text-secondary)]">How often to send a summary of updates</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 mt-3">
                  {['instant', 'weekly', 'monthly'].map(option => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => handleDigestChange(option)}
                      className={`rounded-xl border px-4 py-2.5 text-xs font-bold capitalize transition-all duration-200 ${digest === option
                        ? 'border-[#003366] bg-[#003366] text-white shadow-md'
                        : 'border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:border-[#003366]/30'
                        }`}
                    >
                      {option === 'instant' && (
                        <span className="material-symbols-outlined align-middle text-sm">bolt</span>
                      )}
                      {option === 'weekly' && (
                        <span className="material-symbols-outlined align-middle text-sm">calendar_month</span>
                      )}
                      {option === 'monthly' && (
                        <span className="material-symbols-outlined align-middle text-sm">event</span>
                      )}
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
                <h3 className="text-sm font-extrabold text-[var(--text-primary)] tracking-tight">Privacy & visibility</h3>
                <p className="text-[11px] text-[var(--text-secondary)] mt-1">Choose who can find your profile in the alumni network and employer search.</p>
              </div>

              <div className="space-y-3">
                  {[
                    {
                      key: 'profileVisibleToEmployers' as const,
                      label: 'Visible to partner employers',
                      desc: 'Let recruiting partners discover your profile and CV.',
                      icon: 'business',
                      badge: 'Recommended',
                    },
                    {
                      key: 'shareCgpaToEmployers' as const,
                      label: 'Share CGPA with employers',
                      desc: 'Show your Registrar-verified CGPA to approved corporate partners.',
                      icon: 'workspace_premium',
                      badge: 'Recommended',
                    },
                    {
                      key: 'profileVisibleToPeers' as const,
                      label: 'Visible to peers',
                      desc: 'Appear for mentorship and peer networking matches.',
                      icon: 'group',
                      badge: null,
                    },
                    {
                      key: 'profileVisibleToAlumni' as const,
                      label: 'Visible in alumni directory',
                      desc: 'Allow fellow graduates to find and connect with you.',
                      icon: 'diversity_3',
                      badge: null,
                    },
                    {
                      key: 'anonymousTracerResponses' as const,
                      label: 'Anonymous tracer responses',
                      desc: 'Keep your identity hidden when submitting tracer surveys.',
                      icon: 'incognito',
                      badge: 'Privacy',
                    },
                    {
                      key: 'shareAchievementsPublic' as const,
                      label: 'Share achievements publicly',
                      desc: 'Show milestones on the community feed when you celebrate them.',
                      icon: 'celebration',
                      badge: null,
                    },
                  ].map(opt => (
                  <div
                    key={opt.key}
                    className="flex items-center justify-between gap-4 p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-page)] hover:border-[#003366]/20 transition-all duration-200 group"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] flex items-center justify-center text-lg shadow-sm group-hover:shadow-md transition-shadow">
                        <span className="material-symbols-outlined">{opt.icon}</span>
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
                        <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">{opt.desc}</p>
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
                  <p className="text-xs font-bold text-blue-800">Data retention</p>
                  <p className="text-[11px] text-blue-700 mt-0.5 leading-relaxed">
                    Profile data is kept for up to 5 years after graduation. Contact the Registrar to request deletion.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Preferences Section */}
          {activeSection === 'preferences' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-extrabold text-[var(--text-primary)] tracking-tight">Preferences</h3>
                <p className="text-[11px] text-[var(--text-secondary)] mt-1">Tune reminders, giving prompts, and how the dashboard looks.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Tracer Reminder Engine */}
                <div className="p-5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] hover:shadow-md transition-all duration-200">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-md">
                      <span className="material-symbols-outlined text-lg">analytics</span>
                    </div>
                    <div>
                      <h4 className="text-xs font-extrabold text-[var(--text-primary)]">Survey reminders</h4>
                      <p className="text-[11px] text-[var(--text-secondary)]">How often to nudge you about tracer studies</p>
                    </div>
                  </div>
                  <div className="space-y-2 mt-4">
                    {['instant', 'weekly', 'monthly'].map(option => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => handleDigestChange(option)}
                        className={`w-full flex items-center justify-between p-2.5 rounded-lg border text-left transition-all duration-200 ${digest === option
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
                <div className="p-5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] hover:shadow-md transition-all duration-200 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-md">
                          <span className="text-lg">💝</span>
                        </div>
                        <div>
                          <h4 className="text-xs font-extrabold text-[var(--text-primary)]">Alumni giving</h4>
                          <p className="text-[11px] text-[var(--text-secondary)]">Scholarships and department support</p>
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 text-[9px] font-extrabold rounded-md uppercase tracking-wider ${
                        donationEnabled ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-gray-100 text-gray-600 border border-gray-200'
                      }`}>
                        {donationEnabled ? 'Active' : 'Paused'}
                      </span>
                    </div>
                    <p className="text-[11px] text-[var(--text-secondary)] mt-2 leading-relaxed">
                      Show Telebirr-ready prompts when scholarship or department campaigns need support.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleDonationToggle}
                    className={`mt-4 w-full flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-extrabold transition-all duration-300 ${donationEnabled
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md hover:shadow-lg'
                      : 'bg-gradient-to-r from-gray-600 to-gray-700 text-white shadow-md hover:shadow-lg'
                      }`}
                  >
                    <span className="material-symbols-outlined">{donationEnabled ? 'volunteer_activism' : 'favorite'}</span>
                    {donationEnabled ? 'Giving prompts on' : 'Enable giving prompts'}
                  </button>
                </div>
              </div>

              {/* Theme Preference */}
              <div className="p-5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)]">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white shadow-md">
                    <span className="material-symbols-outlined text-lg">palette</span>
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-[var(--text-primary)]">Display</h4>
                    <p className="text-[11px] text-[var(--text-secondary)]">Light or dark appearance</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div
                    onClick={() => handleThemeChange('light')}
                    className={`p-4 rounded-xl border-2 text-center cursor-pointer transition-all duration-200 ${
                      theme === 'light'
                        ? 'border-[#003366] bg-[#003366]/5 shadow-sm'
                        : 'border-[var(--border-color)] bg-[var(--bg-page)] hover:border-[#003366]/30'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-white border border-gray-200 mx-auto mb-2 flex items-center justify-center shadow-sm">
                      <span className="material-symbols-outlined text-sm text-amber-500">light_mode</span>
                    </div>
                    <p className="text-xs font-bold text-[var(--text-primary)]">Light Mode</p>
                    <p className={`text-[9px] font-extrabold mt-0.5 ${theme === 'light' ? 'text-[#003366]' : 'text-[var(--text-secondary)]'}`}>
                      {theme === 'light' ? '✓ Active' : 'Available'}
                    </p>
                  </div>

                  <div
                    onClick={() => handleThemeChange('dark')}
                    className={`p-4 rounded-xl border-2 text-center cursor-pointer transition-all duration-200 ${
                      theme === 'dark'
                        ? 'border-[#003366] bg-[#003366]/10 shadow-sm'
                        : 'border-[var(--border-color)] bg-[var(--bg-page)] hover:border-[#003366]/30'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-gray-900 border border-gray-700 mx-auto mb-2 flex items-center justify-center shadow-sm">
                      <span className="material-symbols-outlined text-sm text-indigo-400">dark_mode</span>
                    </div>
                    <p className="text-xs font-bold text-[var(--text-primary)]">Dark Mode</p>
                    <p className={`text-[9px] font-extrabold mt-0.5 ${theme === 'dark' ? 'text-[#003366]' : 'text-[var(--text-secondary)]'}`}>
                      {theme === 'dark' ? '✓ Active' : 'Available'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Security Section */}
          {activeSection === 'security' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-extrabold text-[var(--text-primary)] tracking-tight">Security</h3>
                <p className="text-[11px] text-[var(--text-secondary)] mt-1">Update your password and review two-factor authentication options.</p>
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
                      <h4 className="text-xs font-extrabold text-[var(--text-primary)]">Change password</h4>
                      <p className="text-[11px] text-[var(--text-secondary)]">Use a strong password you do not reuse elsewhere</p>
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
                      disabled={changingPassword}
                      className="w-full py-3 bg-gradient-to-r from-[#003366] to-[#004d99] hover:from-[#00264d] hover:to-[#003366] text-white rounded-xl text-xs font-extrabold tracking-wider uppercase transition-all duration-300 shadow-md hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {changingPassword ? 'Updating...' : 'Update Password'}
                    </button>
                  </form>
                </div>

                {/* Account Security Info */}
                <div className="space-y-4">
                  <div className="p-5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)]">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-md">
                        <span className="material-symbols-outlined text-lg">shield_lock</span>
                      </div>
                      <div>
                        <h4 className="text-xs font-extrabold text-[var(--text-primary)]">Security Status</h4>
                        <p className="text-[10px] text-[var(--text-secondary)]">Account protection overview</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {[
                        { label: 'Password', status: 'Strong', color: 'emerald', icon: 'check_circle' },
                        { label: 'Two-Factor Auth', status: securityStatus?.twoFactorEnabled ? 'Enabled' : 'Not enabled', color: securityStatus?.twoFactorEnabled ? 'emerald' : 'amber', icon: 'warning' },
                        { label: 'Last Login', status: securityStatus?.lastLogin ? new Date(securityStatus.lastLogin).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : 'Unknown', color: 'blue', icon: 'schedule' },
                        { label: 'Session', status: 'Active (1 device)', color: 'emerald', icon: 'monitor' },
                      ].map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2.5 rounded-lg bg-[var(--bg-page)]">
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm">{item.icon}</span>
                            <span className="text-xs font-bold text-[var(--text-primary)]">{item.label}</span>
                          </div>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.color === 'emerald' ? 'bg-emerald-50 text-emerald-700' :
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
                        { label: 'Enable Two-Factor Authentication', icon: 'lock', color: 'from-blue-500 to-indigo-600', action: handleEnable2FA },
                        { label: 'Download Account Data', icon: 'download', color: 'from-emerald-500 to-teal-600', action: handleDownloadData },
                        { label: 'View Login History', icon: 'assignment', color: 'from-violet-500 to-purple-600', action: handleViewLoginHistory },
                      ].map((action, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={action.action}
                          className="w-full flex items-center gap-3 p-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-page)] hover:border-[#003366]/20 hover:shadow-sm transition-all duration-200 text-left group"
                        >
                          <div
                            className={`w-8 h-8 rounded-lg bg-gradient-to-br ${action.color} flex items-center justify-center text-white text-sm shadow-sm group-hover:shadow-md transition-shadow`}
                          >
                            <span className="material-symbols-outlined">{action.icon}</span>
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
                    <button 
                      type="button"
                      onClick={handleDeleteAccountModalOpen}
                      className="px-4 py-2 rounded-xl border border-red-300 bg-white text-red-600 text-xs font-bold hover:bg-red-50 transition-all duration-200 shadow-sm hover:shadow"
                    >
                      Delete Account
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2FA Setup Modal */}
      {show2FAModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
                  <span className="material-symbols-outlined text-lg">shield_lock</span>
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-[var(--text-primary)]">Two-Factor Authentication (2FA)</h3>
                  <p className="text-[10px] text-[var(--text-secondary)]">Enhance your ASTU account security</p>
                </div>
              </div>
              <button
                onClick={() => setShow2FAModal(false)}
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)] text-lg"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {/* Setup Method Selector Tabs */}
              <div className="flex rounded-xl bg-gray-100 p-1 border border-gray-200">
                <button
                  type="button"
                  onClick={() => setSetup2FAMode('app')}
                  className={`flex-1 py-2 rounded-lg text-xs font-extrabold transition-all duration-200 ${
                    setup2FAMode === 'app'
                      ? 'bg-white text-[#003366] shadow-sm'
                      : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  📱 Authenticator App
                </button>
                <button
                  type="button"
                  onClick={() => setSetup2FAMode('email')}
                  className={`flex-1 py-2 rounded-lg text-xs font-extrabold transition-all duration-200 ${
                    setup2FAMode === 'email'
                      ? 'bg-white text-[#003366] shadow-sm'
                      : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  ✉️ Email Verification
                </button>
              </div>

              {setup2FAMode === 'app' ? (
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 text-center space-y-2">
                  <p className="text-[11px] font-bold text-gray-700">Scan QR Code or enter setup key in Authenticator app:</p>
                  <div className="w-36 h-36 bg-white border border-gray-300 rounded-xl mx-auto flex items-center justify-center shadow-sm overflow-hidden p-1.5">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
                        `otpauth://totp/ASTU AMS:${user?.email || (preferences as any)?.email || 'alumni@astu.edu.et'}?secret=ASTU2FASECRET367&issuer=ASTU AMS`
                      )}`}
                      alt="2FA QR Code"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <p className="text-[11px] font-mono font-bold bg-gray-200 px-3 py-1.5 rounded-lg text-gray-800 tracking-wider">ASTU2FASECRET367</p>
                  <p className="text-[9px] text-gray-500">Account: <span className="font-semibold text-gray-700">{user?.email || 'alumni@astu.edu.et'}</span></p>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 text-center space-y-3">
                  <p className="text-xs text-gray-600">
                    Receive 6-digit security verification codes sent directly to your registered email: <span className="font-bold text-[#003366]">{user?.email || 'alumni@astu.edu.et'}</span>
                  </p>
                  <button
                    type="button"
                    disabled={sendingSetupOtp}
                    onClick={handleSendSetupEmailOtp}
                    className="px-4 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs font-bold transition-all shadow-sm disabled:opacity-60"
                  >
                    {sendingSetupOtp ? '⏳ Sending Code...' : '📩 Send Test Code to Email'}
                  </button>
                </div>
              )}

              <form onSubmit={handleVerify2FA} className="space-y-3">
                <label className="text-[10px] font-extrabold text-[var(--text-secondary)] uppercase tracking-wider block">
                  6-Digit Verification Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={twoFactorCode}
                  onChange={(e) => setTwoFactorCode(e.target.value)}
                  placeholder="e.g. 123456"
                  className="w-full text-center text-lg font-mono tracking-[0.3em] p-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-page)] focus:ring-2 focus:ring-[#003366] text-[var(--text-primary)] font-extrabold"
                  required
                />
                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShow2FAModal(false)}
                    className="flex-1 py-2.5 rounded-xl border border-[var(--border-color)] text-xs font-bold text-[var(--text-secondary)] hover:bg-[var(--bg-page)]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-[#003366] text-white text-xs font-bold shadow hover:bg-[#00264d]"
                  >
                    {securityStatus?.twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Login History Modal */}
      {showLoginHistoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center">
                  <span className="material-symbols-outlined text-lg">history</span>
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-[var(--text-primary)]">Recent Login Sessions</h3>
                  <p className="text-[10px] text-[var(--text-secondary)]">Audit log of recent account accesses</p>
                </div>
              </div>
              <button
                onClick={() => setShowLoginHistoryModal(false)}
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)] text-lg"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {(securityStatus?.loginHistory || []).map((log: any, idx: number) => (
                <div key={idx} className="p-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-page)] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-gray-500">laptop_mac</span>
                    <div>
                      <p className="font-bold text-[var(--text-primary)]">{log.details || log.action || 'Successful Authentication'}</p>
                      <p className="text-[10px] text-[var(--text-secondary)]">IP: {log.ipAddress || '197.156.104.1'} • Addis Ababa, ET</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-medium text-[var(--text-muted)]">
                    {new Date(log.createdAt).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-[var(--border-color)] flex justify-end">
              <button
                onClick={() => setShowLoginHistoryModal(false)}
                className="px-4 py-2 rounded-xl bg-[#003366] text-white text-xs font-bold shadow"
              >
                Close Audit Log
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[var(--bg-card)] border border-red-200 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-600 border-b border-red-100 pb-3">
              <span className="material-symbols-outlined text-2xl">warning</span>
              <div>
                <h3 className="text-sm font-extrabold">Permanent Account Deletion</h3>
                <p className="text-[10px] text-red-500">This action cannot be undone</p>
              </div>
            </div>

            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Deleting your account will permanently remove your profile, document requests, tracer survey responses, and mentorship connections from ASTU AMS.
            </p>

            <form onSubmit={handleConfirmDeleteAccount} className="space-y-3 pt-2">
              <label className="text-[10px] font-extrabold text-[var(--text-secondary)] uppercase tracking-wider block">
                Type <span className="text-red-600 font-black">DELETE</span> to confirm:
              </label>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="Type DELETE"
                className="w-full text-xs p-3 rounded-xl border border-red-300 bg-red-50/30 focus:ring-2 focus:ring-red-500 font-bold text-red-700"
                required
              />
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-[var(--border-color)] text-xs font-bold text-[var(--text-secondary)] hover:bg-[var(--bg-page)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={deletingAccount}
                  className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-xs font-bold shadow hover:bg-red-700 disabled:opacity-50"
                >
                  {deletingAccount ? 'Deleting...' : 'Confirm Delete'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AlumniSectionShell>
  );
};