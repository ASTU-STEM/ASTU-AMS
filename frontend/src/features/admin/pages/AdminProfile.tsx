import React, { useState, useEffect, useMemo } from 'react';
import { 
  User, Shield, KeyRound, Mail, Phone, Building2, 
  BadgeCheck, Clock, CheckCircle2, ShieldCheck, 
  MapPin, Calendar, Lock, AlertCircle, Sparkles
} from 'lucide-react';
import AdminPageHeader from '../components/AdminPageHeader';
import AdminBadge from '../components/AdminBadge';
import toast from 'react-hot-toast';
import { useAuth } from '../../../contexts/AuthContext';
import { adminService } from '../services/admin.service';
import { authService } from '../../auth/services/auth.service';

type TabType = 'personal' | 'security' | 'permissions';

export default function AdminProfile() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('personal');
  
  const userRole = user?.role || 'CMS_MANAGER';

  // Role metadata derived strictly from ASTU-AMS SRS specification
  const roleMeta = useMemo(() => {
    switch (userRole) {
      case 'CMS_MANAGER':
        return {
          roleTitle: 'Content Management Specialist',
          roleBadge: 'CMS Manager',
          department: 'Corporate Communications & Public Relations Directorate',
          employeeId: user?.id ? `ASTU-CMS-${String(user.id).slice(-4)}` : 'ASTU-CMS-042',
          bio: 'Authorizes, moderates, and manages public portal content, announcements, dynamic hero sections, and university digital assets for ASTU.',
          scope: 'Public Portal, News & Media Assets',
          permissions: [
            { name: 'Homepage Content Architecture', desc: 'Deploy and order dynamic hero banners, partner showcases, campus highlights, and impact statistics.' },
            { name: 'Public Announcements & News', desc: 'Author, edit, schedule, and publish official university news releases and student bulletins.' },
            { name: 'Media Library Governance', desc: 'Manage institutional photography albums, campus event media, PDFs, and high-resolution assets.' },
            { name: 'Editorial Review & Moderation', desc: 'Review pending draft submissions, approve official publications, and enforce portal guidelines.' },
            { name: 'Event & Workshop Calendars', desc: 'Publish academic ceremonies, hackathons, conferences, and career fairs to the public portal.' },
            { name: 'SEO & Canonical Metadata', desc: 'Configure search indexing parameters, institutional keywords, open graph tags, and sitemaps.' },
          ],
        };
      case 'ALUMNI_OFFICE':
        return {
          roleTitle: 'Alumni Relations & Career Development Officer',
          roleBadge: 'Alumni Office',
          department: 'Alumni Relations & Career Guidance Center',
          employeeId: user?.id ? `ASTU-ALO-${String(user.id).slice(-4)}` : 'ASTU-ALO-018',
          bio: 'Oversees alumni directory verification, annual tracer study campaigns, graduate spotlights, and corporate career development partnerships.',
          scope: 'Alumni Relations & Tracer Studies',
          permissions: [
            { name: 'Alumni Directory & Verification', desc: 'Validate graduation batch records, national IDs, and account credentials for verified alumni.' },
            { name: 'Tracer Study Campaign Monitoring', desc: 'Distribute tracer study survey waves, track employment status KPIs, and analyze market trends.' },
            { name: 'Success Story & Spotlight Curation', desc: 'Publish distinguished alumni career spotlights, entrepreneurship awards, and faculty interviews.' },
            { name: 'Alumni Chapters & Reunions', desc: 'Organize regional homecoming events, mentorship circles, and networking conferences.' },
            { name: 'Institutional Communications', desc: 'Broadcast career opportunities, fellowship openings, and campus developments to alumni.' },
            { name: 'Donations & Project Giving', desc: 'Monitor alumni donations, scholarship funds, and student innovation sponsorship campaigns.' },
          ],
        };
      default: // ADMIN / SUPER_ADMIN
        return {
          roleTitle: 'System Administrator',
          roleBadge: 'Super Admin',
          department: 'ICT Directorate & Systems Administration',
          employeeId: user?.id ? `ASTU-ADM-${String(user.id).slice(-4)}` : 'ASTU-ADM-001',
          bio: 'Oversees overarching digital infrastructure, identity access management (IAM), data security, and audit trails for ASTU-AMS.',
          scope: 'Ecosystem-Wide Administration',
          permissions: [
            { name: 'User & Identity Management', desc: 'Provision, activate, suspend, and audit user accounts across all university roles.' },
            { name: 'Role-Based Access Control (RBAC)', desc: 'Define operational privileges, permission boundaries, and access tiers per institutional policy.' },
            { name: 'System Auditing & Security Logs', desc: 'Monitor real-time access logs, authentication attempts, API activity, and audit trails.' },
            { name: 'Database & Backup Governance', desc: 'Trigger automated database backups, verify replication states, and manage disaster recovery.' },
            { name: 'System Integrations & API Control', desc: 'Configure SMS/email gateways, national ID verification APIs, and core endpoints.' },
            { name: 'Module Architecture Configuration', desc: 'Enable and configure ecosystem subsystems and institutional service workflows.' },
          ],
        };
    }
  }, [userRole, user?.id]);

  // Personal Info Form State
  const [personalForm, setPersonalForm] = useState({
    firstName: user?.firstName || (userRole === 'ALUMNI_OFFICE' ? 'Alumni' : userRole === 'CMS_MANAGER' ? 'Content' : 'System'),
    lastName: user?.lastName || (userRole === 'ALUMNI_OFFICE' ? 'Office' : userRole === 'CMS_MANAGER' ? 'Manager' : 'Admin'),
    email: user?.email || (userRole === 'ALUMNI_OFFICE' ? 'alumnioffice@astu.edu.et' : userRole === 'CMS_MANAGER' ? 'cms@astu.edu.et' : 'admin@astu.edu.et'),
    phone: (user as any)?.phone || '+251 221 110 400',
    department: roleMeta.department,
    employeeId: roleMeta.employeeId,
    bio: roleMeta.bio,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // 2FA State for Admin Profile with 3-tier fallback
  const [isAdmin2FAEnabled, setIsAdmin2FAEnabled] = useState(() => {
    return localStorage.getItem('admin_2fa_enabled') === 'true';
  });
  const [adminOtpCode, setAdminOtpCode] = useState('');
  const [isSendingAdminOTP, setIsSendingAdminOTP] = useState(false);
  const [isVerifyingAdmin2FA, setIsVerifyingAdmin2FA] = useState(false);
  const [adminOtpSent, setAdminOtpSent] = useState(false);

  const getAdmin2FAEmail = () => {
    return authService.resolveTarget2FAEmail(personalForm.email, user?.email);
  };

  const handleSendAdmin2FAOTP = async () => {
    const email = getAdmin2FAEmail();
    if (!email) {
      toast.error('No account or admin email found for 2FA OTP verification.');
      return;
    }
    setIsSendingAdminOTP(true);
    try {
      const res = await authService.send2FAOTP(email);
      if (res.ok) {
        setAdminOtpSent(true);
        toast.success(`Verification code sent to ${email}`);
        if (res.data?.devCode) {
          toast(`DEV CODE: ${res.data.devCode}`, { icon: '🔑', duration: 8000 });
        }
      } else {
        toast.error(res.message || 'Failed to send OTP code');
      }
    } catch {
      toast.error('Failed to send OTP code');
    } finally {
      setIsSendingAdminOTP(false);
    }
  };

  const handleVerifyAdmin2FACode = async () => {
    const email = getAdmin2FAEmail();
    if (!adminOtpCode || adminOtpCode.length < 6) {
      toast.error('Please enter 6-digit verification code');
      return;
    }
    setIsVerifyingAdmin2FA(true);
    try {
      const res = await authService.verify2FACode(adminOtpCode, email);
      if (res.ok) {
        const nextState = !isAdmin2FAEnabled;
        setIsAdmin2FAEnabled(nextState);
        localStorage.setItem('admin_2fa_enabled', String(nextState));
        toast.success(nextState ? 'Admin 2FA Protection enabled!' : 'Admin 2FA Protection disabled.');
        setAdminOtpSent(false);
        setAdminOtpCode('');
      } else {
        toast.error(res.message || 'Invalid 2FA code');
      }
    } catch {
      toast.error('Verification failed');
    } finally {
      setIsVerifyingAdmin2FA(false);
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      const result = await adminService.getAdminProfile();
      if (result.ok && result.data) {
        const fetchedFirst = result.data.firstName || 'System';
        const fetchedLast = result.data.lastName || 'Administrator';
        setPersonalForm({
          firstName: fetchedFirst,
          lastName: fetchedLast,
          email: result.data.email || user?.email || 'admin@astu.edu.et',
          phone: result.data.phone || '+251 911 234 567',
          department: result.data.department || 'ICT Directorate',
          employeeId: result.data.employeeId || 'EMP-ASTU-001',
          bio: result.data.bio || 'Overseeing the overall digital infrastructure, alumni tracking system, and API integrations for Adama Science and Technology University.',
        });

        // Sync real name into localStorage so AuthContext reflects the real profile name
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          try {
            const parsed = JSON.parse(storedUser);
            if (parsed.firstName !== fetchedFirst || parsed.lastName !== fetchedLast) {
              parsed.firstName = fetchedFirst;
              parsed.lastName = fetchedLast;
              localStorage.setItem('user', JSON.stringify(parsed));
              window.dispatchEvent(new Event('astu-auth-changed'));
            }
          } catch (e) {
            console.error(e);
          }
        }
      }
      setIsLoading(false);
    };
    fetchProfile();
  }, [user?.email]);

  // Security Form State
  const [securityForm, setSecurityForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Permissions Data
  const adminPermissions = [
    { name: 'User Management', desc: 'Create, update, activate, and suspend user accounts.' },
    { name: 'Role Management', desc: 'Define roles, access control levels, and scope boundaries.' },
    { name: 'Survey Configurations', desc: 'Design, distribute, and collect feedback on tracer studies.' },
    { name: 'System Auditing & Logs', desc: 'Access full system events, logs, and security tracking.' },
    { name: 'Backup & Restore', desc: 'Trigger manual database backups and ecosystem rollback routines.' },
    { name: 'Branding & Configuration', desc: 'Configure system settings, active color tokens, and metadata.' },
  ];

  const handleSavePersonal = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const result = await adminService.updateAdminProfile(personalForm);
    setIsSaving(false);
    
    if (result.ok) {
      toast.success('Profile information updated successfully!');
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          parsed.firstName = personalForm.firstName;
          parsed.lastName = personalForm.lastName;
          localStorage.setItem('user', JSON.stringify(parsed));
          window.dispatchEvent(new Event('astu-auth-changed'));
        } catch (e) {
          console.error(e);
        }
      }
    } else {
      toast.error(result.message || 'Failed to update profile');
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!securityForm.currentPassword || !securityForm.newPassword || !securityForm.confirmPassword) {
      toast.error('All fields are required.');
      return;
    }
    if (securityForm.newPassword !== securityForm.confirmPassword) {
      toast.error('New passwords do not match.');
      return;
    }
    
    setIsSaving(true);
    const result = await adminService.updateAdminSecurity({
      currentPassword: securityForm.currentPassword,
      newPassword: securityForm.newPassword
    });
    setIsSaving(false);
    
    if (result.ok) {
      toast.success('Security password updated successfully!');
      setSecurityForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } else {
      toast.error(result.message || 'Failed to update password');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <AdminPageHeader
        title="My Profile"
        subtitle="Manage your personal credentials, SRS operational permissions, and security settings."
        breadcrumbs={[{ label: userRole === 'ADMIN' ? 'Admin' : 'CMS' }, { label: 'Profile' }]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Avatar & Summary Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="admin-card rounded-[12px] border border-[var(--border-color)] bg-[var(--bg-card)] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)] dark:bg-[var(--bg-card)] text-center relative overflow-hidden">
            {/* Design accents */}
            <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-[#003366] via-[#E8A020] to-[#004080]" />
            
            <div className="relative mt-4 mb-4 inline-block">
              <div className="h-24 w-24 rounded-full bg-gradient-to-br from-[#003366] to-[#004080] flex items-center justify-center text-3xl font-bold text-white mx-auto ring-4 ring-[var(--border-color)] shadow-md">
                {(personalForm.firstName[0] || 'U')}{(personalForm.lastName[0] || 'M')}
              </div>
              <span className="absolute bottom-0 right-1 bg-emerald-500 border-2 border-white rounded-full h-4.5 w-4.5 animate-pulse" />
            </div>

            <h3 className="text-lg font-semibold text-[var(--text-primary)] dark:text-white">
              {personalForm.firstName} {personalForm.lastName}
            </h3>
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mt-1">
              {roleMeta.roleTitle}
            </p>
            
            <div className="mt-4 flex justify-center gap-1.5 flex-wrap">
              <AdminBadge variant="info" className="bg-[#003366]/10 text-[#003366] border-[#003366]/20">
                {roleMeta.roleBadge}
              </AdminBadge>
              <AdminBadge variant="success" className="bg-emerald-500/10 text-emerald-700 border-emerald-500/20">
                Active Verified
              </AdminBadge>
            </div>

            <div className="mt-6 pt-6 border-t border-[var(--border-color)] text-left text-sm space-y-3.5 text-[var(--text-secondary)]">
              <div className="flex items-center gap-2.5">
                <Mail className="h-4.5 w-4.5 text-[var(--text-muted)] shrink-0" />
                <span className="truncate">{personalForm.email}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Building2 className="h-4.5 w-4.5 text-[var(--text-muted)] shrink-0" />
                <span className="truncate">{personalForm.department || roleMeta.department}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <BadgeCheck className="h-4.5 w-4.5 text-[var(--text-muted)] shrink-0" />
                <span className="font-mono text-xs font-semibold text-[var(--text-secondary)]">{personalForm.employeeId || roleMeta.employeeId}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Calendar className="h-4.5 w-4.5 text-[var(--text-muted)] shrink-0" />
                <span>Academic Year 2025/2026</span>
              </div>
            </div>
          </div>

          {/* Quick Stats Widget */}
          <div className="admin-card rounded-[12px] border border-[var(--border-color)] bg-[var(--bg-card)] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)] dark:bg-[var(--bg-card)]">
            <h4 className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--text-muted)] mb-4">Identity & Access Summary</h4>
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-[var(--bg-page)]">
                <span className="text-[var(--text-muted)] font-medium">Assigned Role</span>
                <span className="font-bold text-[var(--text-primary)]">{roleMeta.roleBadge}</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-[var(--bg-page)]">
                <span className="text-[var(--text-muted)] font-medium">Verified SRS Grants</span>
                <span className="font-bold text-[#003366]">{roleMeta.permissions.length} Privileges</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-[var(--bg-page)]">
                <span className="text-[var(--text-muted)] font-medium">2FA Protection</span>
                <span className={`font-bold ${isAdmin2FAEnabled ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {isAdmin2FAEnabled ? 'Active' : 'Unconfigured'}
                </span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-[var(--bg-page)]">
                <span className="text-[var(--text-muted)] font-medium">Operational Scope</span>
                <span className="font-semibold text-[var(--text-secondary)] truncate max-w-[130px]">{roleMeta.scope}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Tabs Panel */}
        <div className="lg:col-span-2 space-y-6">
          <div className="admin-card rounded-[12px] border border-[var(--border-color)] bg-[var(--bg-card)] shadow-[0_1px_3px_rgba(0,0,0,0.06)] dark:bg-[var(--bg-card)] overflow-hidden">
            
            {/* Tab selection header */}
            <div className="flex border-b border-[var(--border-color)] bg-[var(--bg-page)] p-2 gap-1 overflow-x-auto">
              {[
                { id: 'personal', label: 'Personal Information', icon: User },
                { id: 'security', label: 'Security & Access', icon: KeyRound },
                { id: 'permissions', label: 'Identity & Permissions', icon: Shield },
              ].map((tab) => {
                const TabIcon = tab.icon;
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id as TabType)}
                    className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all whitespace-nowrap ${
                      active 
                        ? 'bg-white text-[#003366] shadow-sm border border-[var(--border-color)]' 
                        : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-black/5'
                    }`}
                  >
                    <TabIcon className="h-4 w-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Tab content area */}
            <div className="p-6">
              
              {/* Tab 1: Personal Details */}
              {activeTab === 'personal' && (
                <form onSubmit={handleSavePersonal} className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="space-y-2">
                      <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">First Name</span>
                      <input 
                        type="text" 
                        value={personalForm.firstName}
                        onChange={(e) => setPersonalForm({...personalForm, firstName: e.target.value})}
                        className="w-full rounded-[8px] border border-[var(--border-color)] px-3.5 py-2 text-sm outline-none focus:border-[#003366] focus:ring-1 focus:ring-[#003366]/25" 
                      />
                    </label>
                    <label className="space-y-2">
                      <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">Last Name</span>
                      <input 
                        type="text" 
                        value={personalForm.lastName}
                        onChange={(e) => setPersonalForm({...personalForm, lastName: e.target.value})}
                        className="w-full rounded-[8px] border border-[var(--border-color)] px-3.5 py-2 text-sm outline-none focus:border-[#003366] focus:ring-1 focus:ring-[#003366]/25" 
                      />
                    </label>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="space-y-2">
                      <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">Email Address</span>
                      <input 
                        type="email" 
                        value={personalForm.email}
                        onChange={(e) => setPersonalForm({...personalForm, email: e.target.value})}
                        className="w-full rounded-[8px] border border-[var(--border-color)] px-3.5 py-2 text-sm outline-none focus:border-[#003366] focus:ring-1 focus:ring-[#003366]/25" 
                      />
                    </label>
                    <label className="space-y-2">
                      <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">Phone Number</span>
                      <input 
                        type="text" 
                        value={personalForm.phone}
                        onChange={(e) => setPersonalForm({...personalForm, phone: e.target.value})}
                        className="w-full rounded-[8px] border border-[var(--border-color)] px-3.5 py-2 text-sm outline-none focus:border-[#003366] focus:ring-1 focus:ring-[#003366]/25" 
                      />
                    </label>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="space-y-2">
                      <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">Department</span>
                      <input 
                        type="text" 
                        value={personalForm.department}
                        disabled
                        className="w-full rounded-[8px] border border-[var(--border-color)] bg-[var(--bg-page)] px-3.5 py-2 text-sm outline-none text-[var(--text-muted)]" 
                      />
                    </label>
                    <label className="space-y-2">
                      <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">Employee ID</span>
                      <input 
                        type="text" 
                        value={personalForm.employeeId}
                        disabled
                        className="w-full rounded-[8px] border border-[var(--border-color)] bg-[var(--bg-page)] px-3.5 py-2 text-sm outline-none text-[var(--text-muted)]" 
                      />
                    </label>
                  </div>

                  <label className="space-y-2 block">
                    <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">Professional Bio</span>
                    <textarea 
                      rows={4}
                      value={personalForm.bio}
                      onChange={(e) => setPersonalForm({...personalForm, bio: e.target.value})}
                      className="w-full rounded-[8px] border border-[var(--border-color)] px-3.5 py-2.5 text-sm outline-none focus:border-[#003366] focus:ring-1 focus:ring-[#003366]/25 resize-none leading-relaxed" 
                    />
                  </label>

                  <div className="pt-2 flex justify-end">
                    <button 
                      type="submit"
                      disabled={isSaving || isLoading}
                      className="rounded-[8px] bg-[#003366] hover:bg-[#002244] text-white px-5 py-2.5 text-sm font-semibold transition-all shadow-[0_1px_3px_rgba(0,0,0,0.06)] disabled:opacity-50"
                    >
                      {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              )}

              {/* Tab 2: Security & Password */}
              {activeTab === 'security' && (
                <form onSubmit={handleUpdatePassword} className="space-y-4">
                  <div className="rounded-[10px] border border-amber-500/20 bg-amber-50 p-4 flex gap-3 text-sm text-amber-800">
                    <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold">Security Advice:</span> Ensure your password is at least 12 characters, including capital letters, numbers, and symbols.
                    </div>
                  </div>

                  <label className="space-y-2 block">
                    <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">Current Password</span>
                    <input 
                      type="password" 
                      value={securityForm.currentPassword}
                      onChange={(e) => setSecurityForm({...securityForm, currentPassword: e.target.value})}
                      className="w-full rounded-[8px] border border-[var(--border-color)] px-3.5 py-2 text-sm outline-none focus:border-[#003366]" 
                      placeholder="••••••••••••"
                    />
                  </label>

                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="space-y-2">
                      <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">New Password</span>
                      <input 
                        type="password" 
                        value={securityForm.newPassword}
                        onChange={(e) => setSecurityForm({...securityForm, newPassword: e.target.value})}
                        className="w-full rounded-[8px] border border-[var(--border-color)] px-3.5 py-2 text-sm outline-none focus:border-[#003366]" 
                        placeholder="••••••••••••"
                      />
                    </label>
                    <label className="space-y-2">
                      <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">Confirm Password</span>
                      <input 
                        type="password" 
                        value={securityForm.confirmPassword}
                        onChange={(e) => setSecurityForm({...securityForm, confirmPassword: e.target.value})}
                        className="w-full rounded-[8px] border border-[var(--border-color)] px-3.5 py-2 text-sm outline-none focus:border-[#003366]" 
                        placeholder="••••••••••••"
                      />
                    </label>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button 
                      type="submit"
                      disabled={isSaving || isLoading}
                      className="rounded-[8px] bg-[#003366] hover:bg-[#002244] text-white px-5 py-2.5 text-sm font-semibold transition-all shadow-[0_1px_3px_rgba(0,0,0,0.06)] disabled:opacity-50"
                    >
                      {isSaving ? 'Updating...' : 'Update Password'}
                    </button>
                  </div>

                  {/* Admin 2FA Section */}
                  <div className="mt-8 pt-6 border-t border-[var(--border-color)] space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-emerald-600" />
                        <h4 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider">Two-Factor Authentication (2FA)</h4>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        isAdmin2FAEnabled ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {isAdmin2FAEnabled ? '🛡️ 2FA Protected' : '⚠️ 2FA Disabled'}
                      </span>
                    </div>

                    <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                      Enforce secondary email OTP verification codes whenever logging in as an administrator. 
                      OTP codes are sent to your resolved email: <span className="font-mono font-bold text-[var(--text-secondary)]">{getAdmin2FAEmail() || 'Not Configured'}</span>.
                    </p>

                    {!adminOtpSent ? (
                      <button
                        type="button"
                        onClick={handleSendAdmin2FAOTP}
                        disabled={isSendingAdminOTP}
                        className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white transition-all ${
                          isAdmin2FAEnabled ? 'bg-rose-600 hover:bg-rose-700' : 'bg-emerald-600 hover:bg-emerald-700'
                        }`}
                      >
                        {isSendingAdminOTP ? 'Sending Code...' : isAdmin2FAEnabled ? 'Disable Admin 2FA' : 'Send 2FA Verification Code'}
                      </button>
                    ) : (
                      <div className="space-y-3 p-4 bg-[var(--bg-page)] rounded-xl border border-[var(--border-color)]">
                        <label className="block text-xs font-bold text-[var(--text-secondary)]">Enter 6-Digit Verification Code</label>
                        <input
                          type="text"
                          maxLength={6}
                          placeholder="e.g. 849201"
                          value={adminOtpCode}
                          onChange={(e) => setAdminOtpCode(e.target.value)}
                          className="w-full text-center tracking-widest font-mono text-lg py-2 border rounded-xl"
                        />
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setAdminOtpSent(false)}
                            className="flex-1 py-2 text-xs font-bold text-[var(--text-secondary)] border rounded-xl"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={handleVerifyAdmin2FACode}
                            disabled={isVerifyingAdmin2FA || adminOtpCode.length < 6}
                            className="flex-2 py-2 text-xs font-bold text-white bg-emerald-600 rounded-xl disabled:opacity-50"
                          >
                            {isVerifyingAdmin2FA ? 'Verifying...' : 'Confirm 2FA'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </form>
              )}

              {/* Tab 3: RBAC & Identity Permissions */}
              {activeTab === 'permissions' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <ShieldCheck className="h-5 w-5 text-emerald-500" />
                    <span className="text-sm font-semibold text-[var(--text-primary)]">SRS RBAC Tier: {roleMeta.roleTitle}</span>
                  </div>
                  
                  <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                    Operational privileges established by the ASTU-AMS Software Requirements Specification (SRS). Below are the verified operational capabilities assigned to your account:
                  </p>

                  <div className="grid gap-3 sm:grid-cols-2 mt-4">
                    {roleMeta.permissions.map((perm) => (
                      <div key={perm.name} className="flex gap-3 border border-[var(--border-color)] bg-[var(--bg-page)] rounded-xl p-4 transition-all duration-200 hover:shadow-sm hover:border-[var(--border-color)]">
                        <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-500 border border-emerald-100">
                          <BadgeCheck className="h-4.5 w-4.5" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-[var(--text-primary)]">{perm.name}</p>
                          <p className="text-xs text-[var(--text-muted)] mt-1 leading-relaxed">{perm.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
