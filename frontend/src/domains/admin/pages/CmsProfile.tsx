import React, { useState, useEffect, useCallback } from 'react';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  Bell,
  Lock,
  Camera,
  Edit3,
  Save,
  X,
  Eye,
  EyeOff,
  Check,
  FileText,
  Globe,
  TrendingUp,
  Activity,
  Star,
  Layers3,
  ChevronRight,
  Settings,
  Key,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Info,
} from 'lucide-react';
import { profileService } from '../api/adminApi';
import toast from 'react-hot-toast';

// ── Types ──────────────────────────────────────────────────────────────────────
interface ProfileData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: string;
  role: string;
  department: string;
  joinDate: string;
  bio: string;
  photo?: string;
}

interface PasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  systemAlerts: boolean;
  weeklyDigest: boolean;
  contentPublished: boolean;
  approvalRequired: boolean;
}

const DEFAULT_PROFILE: ProfileData = {
  firstName: 'Content',
  lastName: 'Manager',
  email: 'cms@astu.edu.et',
  phone: '+251-221-110000',
  location: 'Adama, Ethiopia',
  role: 'CMS Manager',
  department: 'Communications & PR',
  joinDate: '2024-03-01',
  bio: 'Responsible for managing the ASTU public website content, announcements, events, and media library.',
};

// ── Section card wrapper ──────────────────────────────────────────────────────
function SectionCard({
  title,
  subtitle,
  icon: Icon,
  children,
  action,
  accent = '#003580',
}: {
  title: string;
  subtitle?: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  action?: React.ReactNode;
  accent?: string;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#1a1d27]/90 shadow-[0_4px_20px_rgba(0,0,0,0.05)] dark:shadow-none transition-all hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 duration-300">
      <div className="flex items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800/60 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ backgroundColor: `${accent}12`, color: accent }}>
            <Icon className="h-4.5 w-4.5 h-[18px] w-[18px]" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">{title}</h3>
            {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>}
          </div>
        </div>
        {action}
      </div>
      <div className="p-6">{children}</div>
    </section>
  );
}

// ── Toggle switch ─────────────────────────────────────────────────────────────
function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#003580]/40 ${checked ? 'bg-[#003580]' : 'bg-slate-200 dark:bg-slate-700'}`}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  );
}

// ── Password input ────────────────────────────────────────────────────────────
function PasswordInput({ label, value, onChange, show, onToggleShow }: {
  label: string; value: string; onChange: (v: string) => void; show: boolean; onToggleShow: () => void;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300">{label}</label>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 px-4 py-2.5 pr-10 text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-[#003580] dark:focus:border-blue-500 transition-colors"
        />
        <button type="button" onClick={onToggleShow} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function CmsProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>(DEFAULT_PROFILE);
  const [editData, setEditData] = useState<ProfileData>(DEFAULT_PROFILE);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Password state
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [passwordData, setPasswordData] = useState<PasswordData>({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showPw, setShowPw] = useState({ current: false, new: false, confirm: false });
  const [savingPassword, setSavingPassword] = useState(false);

  // Notification state
  const [notifications, setNotifications] = useState<NotificationSettings>({
    emailNotifications: true,
    pushNotifications: true,
    systemAlerts: true,
    weeklyDigest: false,
    contentPublished: true,
    approvalRequired: true,
  });
  const [savingNotif, setSavingNotif] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await profileService.getProfile();
        const merged = { ...DEFAULT_PROFILE, ...data };
        setProfileData(merged);
        setEditData(merged);
        if (data.photo) setProfilePhoto(data.photo);
      } catch {
        // fallback to defaults
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleEdit = () => {
    setEditData({ ...profileData });
    setIsEditing(true);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await profileService.updateProfile({
        firstName: editData.firstName,
        lastName: editData.lastName,
        email: editData.email,
        phone: editData.phone,
        location: editData.location,
        bio: editData.bio,
      });
      setProfileData({ ...editData });
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditData({ ...profileData });
    setIsEditing(false);
  };

  const handlePasswordSave = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword) {
      toast.error('All password fields are required');
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (passwordData.newPassword.length < 8) {
      toast.error('New password must be at least 8 characters');
      return;
    }
    setSavingPassword(true);
    try {
      await profileService.changePassword({ currentPassword: passwordData.currentPassword, newPassword: passwordData.newPassword });
      toast.success('Password changed successfully');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowPasswordSection(false);
    } catch {
      toast.error('Failed to change password');
    } finally {
      setSavingPassword(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    try {
      const result = await profileService.uploadPhoto(file);
      setProfilePhoto(result.photoUrl);
      toast.success('Photo updated');
    } catch {
      toast.error('Failed to upload photo');
    } finally {
      setLoading(false);
    }
  };

  const handleNotifSave = async () => {
    setSavingNotif(true);
    try {
      await profileService.updateNotificationSettings(notifications);
      toast.success('Notification preferences saved');
    } catch {
      toast.error('Failed to save preferences');
    } finally {
      setSavingNotif(false);
    }
  };

  const initials = `${profileData.firstName[0] ?? ''}${profileData.lastName[0] ?? ''}`.toUpperCase();

  const activityStats = [
    { label: 'Articles Published', value: 42, icon: FileText, color: '#003580' },
    { label: 'Media Uploaded', value: 128, icon: Layers3, color: '#1D9E75' },
    { label: 'Edits This Month', value: 17, icon: Edit3, color: '#E8A020' },
    { label: 'Avg SEO Score', value: '88%', icon: TrendingUp, color: '#7c3aed' },
  ];

  return (
    <div className="space-y-7">
      <style>{`
        @keyframes prof-in { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        .prof-anim { animation: prof-in 0.4s ease-out both; }
        .prof-anim:nth-child(2) { animation-delay: 0.06s; }
        .prof-anim:nth-child(3) { animation-delay: 0.12s; }
        .prof-anim:nth-child(4) { animation-delay: 0.18s; }
        .prof-anim:nth-child(5) { animation-delay: 0.22s; }
      `}</style>

      {/* Hero Banner */}
      <div className="prof-anim relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#00245c] via-[#003580] to-[#005a9e] p-8 shadow-[0_12px_48px_rgba(0,53,128,0.35)]">
        {/* Decorative */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_80%_-10%,rgba(29,158,117,0.25),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_80%_at_-10%_60%,rgba(232,160,32,0.12),transparent)]" />
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-[#1D9E75]/15 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-1/3 h-32 w-32 rounded-full bg-[#E8A020]/10 blur-2xl" />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-6">
            {/* Avatar */}
            <div className="relative shrink-0">
              {profilePhoto ? (
                <img src={profilePhoto} alt="Profile" className="h-24 w-24 rounded-2xl object-cover border-2 border-white/30 shadow-lg" />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-white/20 to-white/10 border-2 border-white/20 backdrop-blur-sm shadow-lg text-3xl font-extrabold text-white">
                  {initials}
                </div>
              )}
              {/* Camera overlay */}
              <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" id="cms-photo-upload" />
              <label
                htmlFor="cms-photo-upload"
                className="absolute -bottom-2 -right-2 flex h-8 w-8 cursor-pointer items-center justify-center rounded-xl bg-[#E8A020] text-white shadow-lg hover:brightness-110 transition-all"
                title="Upload photo"
              >
                <Camera className="h-4 w-4" />
              </label>
              {/* Online dot */}
              <span className="absolute top-1 right-1 flex h-3.5 w-3.5">
                <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
                <span className="relative inline-flex h-3.5 w-3.5 rounded-full bg-emerald-400 border-2 border-[#003580]" />
              </span>
            </div>

            {/* Identity */}
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 backdrop-blur-sm px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white mb-2">
                <Sparkles className="h-3 w-3 text-[#E8A020]" /> CMS Manager
              </span>
              <h1 className="text-2xl font-extrabold text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.3)] leading-tight">
                {profileData.firstName} {profileData.lastName}
              </h1>
              <p className="mt-1 text-white/65 text-sm font-medium">{profileData.role} · {profileData.department}</p>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-white/50">
                <span className="flex items-center gap-1"><Mail className="h-3.5 w-3.5" />{profileData.email}</span>
                <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{profileData.location}</span>
              </div>
            </div>
          </div>

          {/* Edit button */}
          {!isEditing ? (
            <button
              onClick={handleEdit}
              className="inline-flex items-center gap-2 rounded-xl bg-white/10 border border-white/20 backdrop-blur-sm px-5 py-2.5 text-sm font-bold text-white hover:bg-white/20 transition-all shrink-0"
            >
              <Edit3 className="h-4 w-4" /> Edit Profile
            </button>
          ) : (
            <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
              <button onClick={handleCancel} className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 backdrop-blur-sm px-4 py-2.5 text-sm font-bold text-white hover:bg-white/20 transition-all">
                <X className="h-4 w-4" /> Cancel
              </button>
              <button onClick={handleSave} disabled={loading} className="inline-flex items-center gap-2 rounded-xl bg-[#E8A020] px-4 py-2.5 text-sm font-bold text-white shadow-lg hover:brightness-110 transition-all disabled:opacity-60">
                {loading ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> : <Save className="h-4 w-4" />}
                Save Changes
              </button>
            </div>
          )}
        </div>

        {/* Activity stats strip */}
        <div className="relative mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 border-t border-white/10 pt-6">
          {activityStats.map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="flex items-center gap-3 rounded-xl bg-white/5 border border-white/10 px-4 py-3 backdrop-blur-sm">
              <Icon className="h-5 w-5 shrink-0" style={{ color }} />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-white/50">{label}</p>
                <p className="text-lg font-extrabold text-white">{value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main 2-col layout */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left col: personal info + bio */}
        <div className="lg:col-span-2 space-y-6">

          {/* Personal Information */}
          <div className="prof-anim">
            <SectionCard title="Personal Information" subtitle="Update your personal details" icon={User}>
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  { key: 'firstName', label: 'First Name', type: 'text' },
                  { key: 'lastName', label: 'Last Name', type: 'text' },
                  { key: 'email', label: 'Email Address', type: 'email', icon: Mail },
                  { key: 'phone', label: 'Phone Number', type: 'tel', icon: Phone },
                ] .map(({ key, label, type, icon: FieldIcon }) => (
                  <div key={key}>
                    <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300">{label}</label>
                    {isEditing ? (
                      <input
                        type={type}
                        value={(editData as any)[key]}
                        onChange={e => setEditData(d => ({ ...d, [key]: e.target.value }))}
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-[#003580] dark:focus:border-blue-500 transition-colors"
                      />
                    ) : (
                      <div className="flex items-center gap-2.5 rounded-xl border border-slate-100 dark:border-slate-800/60 bg-slate-50/60 dark:bg-slate-800/30 px-4 py-2.5">
                        {FieldIcon && <FieldIcon className="h-4 w-4 text-slate-400 dark:text-slate-500 shrink-0" />}
                        <p className="text-sm text-slate-800 dark:text-slate-200 font-medium">{(profileData as any)[key]}</p>
                      </div>
                    )}
                  </div>
                ))}
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300">Location</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editData.location}
                      onChange={e => setEditData(d => ({ ...d, location: e.target.value }))}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-[#003580] dark:focus:border-blue-500 transition-colors"
                    />
                  ) : (
                    <div className="flex items-center gap-2.5 rounded-xl border border-slate-100 dark:border-slate-800/60 bg-slate-50/60 dark:bg-slate-800/30 px-4 py-2.5">
                      <MapPin className="h-4 w-4 text-slate-400 dark:text-slate-500 shrink-0" />
                      <p className="text-sm text-slate-800 dark:text-slate-200 font-medium">{profileData.location}</p>
                    </div>
                  )}
                </div>
              </div>
            </SectionCard>
          </div>

          {/* Bio */}
          <div className="prof-anim">
            <SectionCard title="About Me" subtitle="A short bio visible to your team" icon={AlignLeft}>
              {isEditing ? (
                <textarea
                  value={editData.bio}
                  onChange={e => setEditData(d => ({ ...d, bio: e.target.value }))}
                  rows={4}
                  className="w-full resize-none rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-[#003580] dark:focus:border-blue-500 transition-colors"
                />
              ) : (
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{profileData.bio}</p>
              )}
            </SectionCard>
          </div>

          {/* Password Change */}
          <div className="prof-anim">
            <SectionCard
              title="Security"
              subtitle="Change your login credentials"
              icon={Lock}
              accent="#e24b4a"
              action={
                <button
                  onClick={() => setShowPasswordSection(v => !v)}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${showPasswordSection ? 'bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                >
                  <Key className="h-3.5 w-3.5" />
                  {showPasswordSection ? 'Cancel' : 'Change Password'}
                </button>
              }
            >
              {showPasswordSection ? (
                <div className="space-y-4">
                  <div className="flex items-start gap-3 rounded-xl border border-amber-200 dark:border-amber-800/50 bg-amber-50 dark:bg-amber-950/20 p-4">
                    <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
                      Choose a strong password with at least 8 characters, including uppercase, numbers, and symbols.
                    </p>
                  </div>
                  <PasswordInput
                    label="Current Password"
                    value={passwordData.currentPassword}
                    onChange={v => setPasswordData(d => ({ ...d, currentPassword: v }))}
                    show={showPw.current}
                    onToggleShow={() => setShowPw(s => ({ ...s, current: !s.current }))}
                  />
                  <PasswordInput
                    label="New Password"
                    value={passwordData.newPassword}
                    onChange={v => setPasswordData(d => ({ ...d, newPassword: v }))}
                    show={showPw.new}
                    onToggleShow={() => setShowPw(s => ({ ...s, new: !s.new }))}
                  />
                  <PasswordInput
                    label="Confirm New Password"
                    value={passwordData.confirmPassword}
                    onChange={v => setPasswordData(d => ({ ...d, confirmPassword: v }))}
                    show={showPw.confirm}
                    onToggleShow={() => setShowPw(s => ({ ...s, confirm: !s.confirm }))}
                  />
                  {passwordData.newPassword && passwordData.confirmPassword && (
                    <div className={`flex items-center gap-2 text-xs font-medium ${passwordData.newPassword === passwordData.confirmPassword ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                      {passwordData.newPassword === passwordData.confirmPassword
                        ? <><CheckCircle2 className="h-3.5 w-3.5" /> Passwords match</>
                        : <><X className="h-3.5 w-3.5" /> Passwords do not match</>}
                    </div>
                  )}
                  <button
                    onClick={handlePasswordSave}
                    disabled={savingPassword}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-rose-700 transition-all shadow-md disabled:opacity-60"
                  >
                    {savingPassword ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> : <Lock className="h-4 w-4" />}
                    Update Password
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3 rounded-xl border border-slate-100 dark:border-slate-800/60 bg-slate-50/60 dark:bg-slate-800/30 p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400">
                    <Shield className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Password protected</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Click "Change Password" to update your credentials</p>
                  </div>
                </div>
              )}
            </SectionCard>
          </div>
        </div>

        {/* Right col: role info + notifications */}
        <div className="space-y-6">

          {/* Role & Account Info */}
          <div className="prof-anim">
            <SectionCard title="Role & Account" subtitle="Your system access level" icon={Shield} accent="#7c3aed">
              <div className="space-y-4">
                {[
                  { label: 'Role', value: profileData.role, icon: Shield, color: '#003580' },
                  { label: 'Department', value: profileData.department, icon: User, color: '#1D9E75' },
                  { label: 'Member Since', value: new Date(profileData.joinDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }), icon: Calendar, color: '#E8A020' },
                  { label: 'Access Level', value: 'CMS Full Access', icon: Globe, color: '#7c3aed' },
                ].map(({ label, value, icon: Icon, color }) => (
                  <div key={label} className="flex items-center gap-3 rounded-xl border border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-800/20 px-4 py-3 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: `${color}15`, color }}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">{label}</p>
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>

          {/* Notification Preferences */}
          <div className="prof-anim">
            <SectionCard
              title="Notifications"
              subtitle="Manage alert preferences"
              icon={Bell}
              accent="#E8A020"
              action={
                <button
                  onClick={handleNotifSave}
                  disabled={savingNotif}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#003580] px-3 py-1.5 text-xs font-bold text-white hover:brightness-110 transition-all disabled:opacity-60"
                >
                  {savingNotif ? <span className="h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white" /> : <Save className="h-3.5 w-3.5" />}
                  Save
                </button>
              }
            >
              <div className="space-y-1">
                {[
                  { key: 'emailNotifications', label: 'Email Notifications', sub: 'Receive updates via email' },
                  { key: 'pushNotifications', label: 'Push Notifications', sub: 'In-app notifications' },
                  { key: 'systemAlerts', label: 'System Alerts', sub: 'Critical system messages' },
                  { key: 'contentPublished', label: 'Content Published', sub: 'When your content goes live' },
                  { key: 'approvalRequired', label: 'Approval Required', sub: 'Awaiting review alerts' },
                  { key: 'weeklyDigest', label: 'Weekly Digest', sub: 'Summary every Monday' },
                ].map(({ key, label, sub }) => (
                  <div key={key} className="flex items-center justify-between gap-4 rounded-xl px-3 py-3 hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors">
                    <div>
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{label}</p>
                      <p className="text-xs text-slate-400 dark:text-slate-500">{sub}</p>
                    </div>
                    <Toggle
                      checked={(notifications as any)[key]}
                      onChange={() => setNotifications(n => ({ ...n, [key]: !(n as any)[key] }))}
                    />
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>

          {/* Quick Links */}
          <div className="prof-anim">
            <SectionCard title="Quick Access" subtitle="Jump to CMS sections" icon={Activity} accent="#1D9E75">
              <div className="space-y-1">
                {[
                  { label: 'Content Pipeline', path: '/cms/content', icon: Layers3 },
                  { label: 'Media Library', path: '/cms/media', icon: Star },
                  { label: 'SEO Dashboard', path: '/cms/seo', icon: Globe },
                  { label: 'CMS Settings', path: '/cms/settings', icon: Settings },
                ].map(({ label, path, icon: Icon }) => (
                  <a
                    key={path}
                    href={path}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40 hover:text-[#003580] dark:hover:text-blue-400 transition-colors group"
                  >
                    <Icon className="h-4 w-4 text-slate-400 dark:text-slate-500 group-hover:text-[#003580] dark:group-hover:text-blue-400 transition-colors" />
                    <span className="flex-1">{label}</span>
                    <ChevronRight className="h-4 w-4 text-slate-300 dark:text-slate-600 group-hover:text-[#003580] dark:group-hover:text-blue-400 transition-colors" />
                  </a>
                ))}
              </div>
            </SectionCard>
          </div>
        </div>
      </div>
    </div>
  );
}

// Local import fix
function AlignLeft({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="21" y1="10" x2="3" y2="10" />
      <line x1="17" y1="6" x2="3" y2="6" />
      <line x1="21" y1="14" x2="3" y2="14" />
      <line x1="17" y1="18" x2="3" y2="18" />
    </svg>
  );
}
