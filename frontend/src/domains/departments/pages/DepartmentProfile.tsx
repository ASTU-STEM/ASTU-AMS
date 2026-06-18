import React, { useState } from 'react';
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
  Building2,
} from 'lucide-react';
import { useAuth } from '../../../shared/contexts/AuthContext';
import toast, { Toaster } from 'react-hot-toast';

export const DepartmentProfile: React.FC = () => {
  const { user } = useAuth();
  
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    systemAlerts: true,
    weeklyDigest: false,
  });

  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || 'Department',
    lastName: user?.lastName || 'Head',
    email: user?.email || 'dept.head@astu.edu.et',
    phone: '+251-221-110000',
    location: 'Block 32, Room 101, ASTU',
    role: 'Department Head',
    department: 'Computer Science',
    faculty: 'School of Computing',
    joinDate: '2023-01-15',
    bio: 'Experienced academic leader focused on aligning curriculum with industry standards and maximizing graduate employability in the School of Computing.',
  });

  const handleSave = () => {
    setIsEditing(false);
    toast.success('Profile updated successfully');
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handlePasswordChange = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setShowPasswordModal(false);
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    toast.success('Password changed successfully');
  };

  const handleNotificationSave = () => {
    setShowNotificationModal(false);
    toast.success('Notification settings updated');
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setProfilePhoto(url);
      toast.success('Profile photo updated');
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-in fade-in duration-500">
      <Toaster position="top-right" />
      {/* Header */}
      <div className="bg-gradient-to-r from-[#003580] to-[#004499] rounded-xl p-6 shadow-md relative overflow-hidden" style={{ color: '#ffffff' }}>
        <div className="absolute right-0 top-0 w-64 h-64 bg-white/5 rounded-full blur-2xl transform translate-x-1/3 -translate-y-1/3 pointer-events-none" />
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 relative z-10 text-center sm:text-left">
          <div className="relative">
            {profilePhoto ? (
              <img
                src={profilePhoto}
                alt="Profile"
                className="h-24 w-24 rounded-full object-cover border-4 border-white/20"
              />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white/20 text-3xl font-bold text-white border-4 border-white/20">
                {profileData.firstName[0]}{profileData.lastName[0]}
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
              id="photo-upload"
            />
            <label
              htmlFor="photo-upload"
              className="absolute bottom-0 right-0 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-white text-[#003580] shadow-lg hover:bg-slate-100 transition-transform hover:scale-105"
            >
              <Camera className="h-4 w-4" />
            </label>
          </div>
          <div className="flex-1 mt-4 sm:mt-0">
            <h1 className="text-2xl font-bold">{profileData.firstName} {profileData.lastName}</h1>
            <p className="text-white/90 mt-1 font-medium">{profileData.role}</p>
            <div className="flex flex-col sm:flex-row items-center sm:justify-start gap-2 sm:gap-3 mt-2 sm:mt-1.5 text-sm text-white/70">
              <span className="flex items-center gap-1"><Building2 className="h-3.5 w-3.5" /> {profileData.faculty}</span>
              <span className="hidden sm:inline opacity-50">•</span>
              <span>{profileData.department}</span>
            </div>
          </div>
          <div className="mt-4 sm:mt-0 w-full sm:w-auto flex justify-center">
            {!isEditing ? (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/20 transition-colors w-full sm:w-auto justify-center"
              >
                <Edit3 className="h-4 w-4" />
                Edit Profile
              </button>
            ) : (
              <div className="flex gap-2 w-full sm:w-auto justify-center">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/20 transition-colors flex-1 sm:flex-none justify-center"
                >
                  <X className="h-4 w-4" />
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-[#003580] hover:bg-slate-50 shadow-sm transition-colors flex-1 sm:flex-none justify-center"
                >
                  <Save className="h-4 w-4" />
                  Save
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Personal Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Personal Information</h2>
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">First Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={profileData.firstName}
                    onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2 text-sm text-slate-900 dark:text-white focus:border-[#003580] focus:outline-none focus:ring-1 focus:ring-[#003580]"
                  />
                ) : (
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-200">{profileData.firstName}</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">Last Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={profileData.lastName}
                    onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2 text-sm text-slate-900 dark:text-white focus:border-[#003580] focus:outline-none focus:ring-1 focus:ring-[#003580]"
                  />
                ) : (
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-200">{profileData.lastName}</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">Email</label>
                {isEditing ? (
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2 text-sm text-slate-900 dark:text-white focus:border-[#003580] focus:outline-none focus:ring-1 focus:ring-[#003580]"
                  />
                ) : (
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-200 flex items-center gap-2">
                    <Mail className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                    {profileData.email}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">Phone</label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2 text-sm text-slate-900 dark:text-white focus:border-[#003580] focus:outline-none focus:ring-1 focus:ring-[#003580]"
                  />
                ) : (
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-200 flex items-center gap-2">
                    <Phone className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                    {profileData.phone}
                  </p>
                )}
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">Location</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={profileData.location}
                    onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2 text-sm text-slate-900 dark:text-white focus:border-[#003580] focus:outline-none focus:ring-1 focus:ring-[#003580]"
                  />
                ) : (
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-200 flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                    {profileData.location}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Bio */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Professional Bio</h2>
            {isEditing ? (
              <textarea
                value={profileData.bio}
                onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                rows={4}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2 text-sm text-slate-900 dark:text-white focus:border-[#003580] focus:outline-none focus:ring-1 focus:ring-[#003580] resize-none"
              />
            ) : (
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{profileData.bio}</p>
            )}
          </div>
        </div>

        {/* Right Column - Quick Info */}
        <div className="space-y-6">
          {/* Role & Department */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Role Information</h2>
            <div className="space-y-5">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#003580]/10 dark:bg-[#003580]/20 text-[#003580] dark:text-blue-400">
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Role</p>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{profileData.role}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#003580]/10 dark:bg-[#003580]/20 text-[#003580] dark:text-blue-400">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Department</p>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{profileData.department}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#003580]/10 dark:bg-[#003580]/20 text-[#003580] dark:text-blue-400">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Join Date</p>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{profileData.joinDate}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <button 
                type="button"
                onClick={() => setShowPasswordModal(true)}
                className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
              >
                <Lock className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                Change Password
              </button>
              <button 
                type="button"
                onClick={() => setShowNotificationModal(true)}
                className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
              >
                <Bell className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                Notification Settings
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Change Password</h3>
              <button
                type="button"
                onClick={() => setShowPasswordModal(false)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Current Password</label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2 pr-10 text-sm text-slate-900 dark:text-white focus:border-[#003580] focus:outline-none focus:ring-1 focus:ring-[#003580]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">New Password</label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2 pr-10 text-sm text-slate-900 dark:text-white focus:border-[#003580] focus:outline-none focus:ring-1 focus:ring-[#003580]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Confirm Password</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2 pr-10 text-sm text-slate-900 dark:text-white focus:border-[#003580] focus:outline-none focus:ring-1 focus:ring-[#003580]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={() => setShowPasswordModal(false)}
                className="flex-1 rounded-lg border border-slate-300 dark:border-slate-700 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handlePasswordChange}
                className="flex-1 rounded-lg bg-gradient-to-r from-[#003580] to-[#004499] px-4 py-2 text-sm font-medium hover:shadow-md transition-all" style={{ color: '#ffffff' }}
              >
                Change Password
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notification Settings Modal */}
      {showNotificationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Notification Settings</h3>
              <button
                type="button"
                onClick={() => setShowNotificationModal(false)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">Email Notifications</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Receive notifications via email</p>
                </div>
                <button
                  type="button"
                  onClick={() => setNotificationSettings({ ...notificationSettings, emailNotifications: !notificationSettings.emailNotifications })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    notificationSettings.emailNotifications ? 'bg-[#003580]' : 'bg-slate-200 dark:bg-slate-700'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      notificationSettings.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">Push Notifications</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Receive in-app notifications</p>
                </div>
                <button
                  type="button"
                  onClick={() => setNotificationSettings({ ...notificationSettings, pushNotifications: !notificationSettings.pushNotifications })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    notificationSettings.pushNotifications ? 'bg-[#003580]' : 'bg-slate-200 dark:bg-slate-700'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      notificationSettings.pushNotifications ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">System Alerts</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Critical system notifications</p>
                </div>
                <button
                  type="button"
                  onClick={() => setNotificationSettings({ ...notificationSettings, systemAlerts: !notificationSettings.systemAlerts })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    notificationSettings.systemAlerts ? 'bg-[#003580]' : 'bg-slate-200 dark:bg-slate-700'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      notificationSettings.systemAlerts ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">Weekly Digest</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Weekly summary of activities</p>
                </div>
                <button
                  type="button"
                  onClick={() => setNotificationSettings({ ...notificationSettings, weeklyDigest: !notificationSettings.weeklyDigest })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    notificationSettings.weeklyDigest ? 'bg-[#003580]' : 'bg-slate-200 dark:bg-slate-700'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      notificationSettings.weeklyDigest ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={() => setShowNotificationModal(false)}
                className="flex-1 rounded-lg border border-slate-300 dark:border-slate-700 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleNotificationSave}
                className="flex-1 rounded-lg bg-gradient-to-r from-[#003580] to-[#004499] px-4 py-2 text-sm font-medium hover:shadow-md transition-all" style={{ color: '#ffffff' }}
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
