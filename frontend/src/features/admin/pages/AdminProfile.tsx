import React, { useState, useEffect } from 'react';
import { 
  User, Shield, KeyRound, Mail, Phone, Building2, 
  BadgeCheck, Clock, CheckCircle2, ShieldCheck, 
  MapPin, Calendar, Lock, AlertCircle
} from 'lucide-react';
import AdminPageHeader from '../components/AdminPageHeader';
import AdminBadge from '../components/AdminBadge';
import toast from 'react-hot-toast';
import { useAuth } from '../../../contexts/AuthContext';
import { adminService } from '../services/admin.service';

type TabType = 'personal' | 'security' | 'permissions';

export default function AdminProfile() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('personal');
  
  // Personal Info Form State
  const [personalForm, setPersonalForm] = useState({
    firstName: user?.firstName || 'System',
    lastName: user?.lastName || 'Administrator',
    email: user?.email || 'admin@astu.edu.et',
    phone: '+251 911 234 567',
    department: 'ICT Directorate',
    employeeId: 'EMP-ASTU-001',
    bio: 'Overseeing the overall digital infrastructure, alumni tracking system, and API integrations for Adama Science and Technology University.',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

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
  }, []);

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
        subtitle="Manage your personal credentials, system permissions, and security settings."
        breadcrumbs={[{ label: 'Admin' }, { label: 'Profile' }]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Avatar & Summary Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="admin-card rounded-[12px] border border-slate-200 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)] dark:bg-[var(--bg-card)] text-center relative overflow-hidden">
            {/* Design accents */}
            <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-[#003366] via-[#E8A020] to-[#004080]" />
            
            <div className="relative mt-4 mb-4 inline-block">
              <div className="h-24 w-24 rounded-full bg-gradient-to-br from-[#003366] to-[#004080] flex items-center justify-center text-3xl font-bold text-white mx-auto ring-4 ring-slate-100 shadow-md">
                {personalForm.firstName[0]}{personalForm.lastName[0]}
              </div>
              <span className="absolute bottom-0 right-1 bg-emerald-500 border-2 border-white rounded-full h-4.5 w-4.5 animate-pulse" />
            </div>

            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              {personalForm.firstName} {personalForm.lastName}
            </h3>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mt-1">
              Super Admin
            </p>
            
            <div className="mt-4 flex justify-center gap-1.5">
              <AdminBadge variant="success" className="bg-emerald-500/10 text-emerald-700 border-emerald-500/20">
                Root Active
              </AdminBadge>
              <AdminBadge variant="neutral" className="bg-slate-100 text-slate-600 border-slate-200">
                System Staff
              </AdminBadge>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-100 text-left text-sm space-y-3.5 text-slate-600">
              <div className="flex items-center gap-2.5">
                <Mail className="h-4.5 w-4.5 text-slate-400 shrink-0" />
                <span className="truncate">{personalForm.email}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Building2 className="h-4.5 w-4.5 text-slate-400 shrink-0" />
                <span>{personalForm.department}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Calendar className="h-4.5 w-4.5 text-slate-400 shrink-0" />
                <span>Joined January 2025</span>
              </div>
            </div>
          </div>

          {/* Quick Stats Widget */}
          <div className="admin-card rounded-[12px] border border-slate-200 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)] dark:bg-[var(--bg-card)]">
            <h4 className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500 mb-4">Account Analytics</h4>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="p-3 bg-slate-50 rounded-xl">
                <p className="text-2xl font-bold text-[#003366]">100%</p>
                <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mt-1">Uptime SLA</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <p className="text-2xl font-bold text-[#003366]">6</p>
                <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mt-1">Permissions</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Tabs Panel */}
        <div className="lg:col-span-2 space-y-6">
          <div className="admin-card rounded-[12px] border border-slate-200 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)] dark:bg-[var(--bg-card)] overflow-hidden">
            
            {/* Tab selection header */}
            <div className="flex border-b border-slate-200 bg-slate-50/50 p-2 gap-1 overflow-x-auto">
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
                        ? 'bg-white text-[#003366] shadow-sm border border-slate-200' 
                        : 'text-slate-500 hover:text-slate-900 hover:bg-black/5'
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
                      <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">First Name</span>
                      <input 
                        type="text" 
                        value={personalForm.firstName}
                        onChange={(e) => setPersonalForm({...personalForm, firstName: e.target.value})}
                        className="w-full rounded-[8px] border border-slate-200 px-3.5 py-2 text-sm outline-none focus:border-[#003366] focus:ring-1 focus:ring-[#003366]/25" 
                      />
                    </label>
                    <label className="space-y-2">
                      <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Last Name</span>
                      <input 
                        type="text" 
                        value={personalForm.lastName}
                        onChange={(e) => setPersonalForm({...personalForm, lastName: e.target.value})}
                        className="w-full rounded-[8px] border border-slate-200 px-3.5 py-2 text-sm outline-none focus:border-[#003366] focus:ring-1 focus:ring-[#003366]/25" 
                      />
                    </label>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="space-y-2">
                      <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Email Address</span>
                      <input 
                        type="email" 
                        value={personalForm.email}
                        onChange={(e) => setPersonalForm({...personalForm, email: e.target.value})}
                        className="w-full rounded-[8px] border border-slate-200 px-3.5 py-2 text-sm outline-none focus:border-[#003366] focus:ring-1 focus:ring-[#003366]/25" 
                      />
                    </label>
                    <label className="space-y-2">
                      <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Phone Number</span>
                      <input 
                        type="text" 
                        value={personalForm.phone}
                        onChange={(e) => setPersonalForm({...personalForm, phone: e.target.value})}
                        className="w-full rounded-[8px] border border-slate-200 px-3.5 py-2 text-sm outline-none focus:border-[#003366] focus:ring-1 focus:ring-[#003366]/25" 
                      />
                    </label>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="space-y-2">
                      <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Department</span>
                      <input 
                        type="text" 
                        value={personalForm.department}
                        disabled
                        className="w-full rounded-[8px] border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm outline-none text-slate-500" 
                      />
                    </label>
                    <label className="space-y-2">
                      <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Employee ID</span>
                      <input 
                        type="text" 
                        value={personalForm.employeeId}
                        disabled
                        className="w-full rounded-[8px] border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm outline-none text-slate-500" 
                      />
                    </label>
                  </div>

                  <label className="space-y-2 block">
                    <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Professional Bio</span>
                    <textarea 
                      rows={4}
                      value={personalForm.bio}
                      onChange={(e) => setPersonalForm({...personalForm, bio: e.target.value})}
                      className="w-full rounded-[8px] border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-[#003366] focus:ring-1 focus:ring-[#003366]/25 resize-none leading-relaxed" 
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
                    <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Current Password</span>
                    <input 
                      type="password" 
                      value={securityForm.currentPassword}
                      onChange={(e) => setSecurityForm({...securityForm, currentPassword: e.target.value})}
                      className="w-full rounded-[8px] border border-slate-200 px-3.5 py-2 text-sm outline-none focus:border-[#003366]" 
                      placeholder="••••••••••••"
                    />
                  </label>

                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="space-y-2">
                      <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">New Password</span>
                      <input 
                        type="password" 
                        value={securityForm.newPassword}
                        onChange={(e) => setSecurityForm({...securityForm, newPassword: e.target.value})}
                        className="w-full rounded-[8px] border border-slate-200 px-3.5 py-2 text-sm outline-none focus:border-[#003366]" 
                        placeholder="••••••••••••"
                      />
                    </label>
                    <label className="space-y-2">
                      <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Confirm Password</span>
                      <input 
                        type="password" 
                        value={securityForm.confirmPassword}
                        onChange={(e) => setSecurityForm({...securityForm, confirmPassword: e.target.value})}
                        className="w-full rounded-[8px] border border-slate-200 px-3.5 py-2 text-sm outline-none focus:border-[#003366]" 
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
                </form>
              )}

              {/* Tab 3: RBAC & Identity Permissions */}
              {activeTab === 'permissions' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <ShieldCheck className="h-5 w-5 text-emerald-500" />
                    <span className="text-sm font-semibold text-slate-800">RBAC Level: Super System Administrator</span>
                  </div>
                  
                  <p className="text-sm text-slate-500 leading-relaxed">
                    Your role is bound to root access control. Below are the verified permissions assigned to your user account:
                  </p>

                  <div className="grid gap-3 sm:grid-cols-2 mt-4">
                    {adminPermissions.map((perm) => (
                      <div key={perm.name} className="flex gap-3 border border-slate-100 bg-slate-50/50 rounded-xl p-4 transition-all duration-200 hover:shadow-sm hover:border-slate-200">
                        <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-500 border border-emerald-100">
                          <BadgeCheck className="h-4.5 w-4.5" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-800">{perm.name}</p>
                          <p className="text-xs text-slate-500 mt-1 leading-relaxed">{perm.desc}</p>
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
