import React, { useState, useEffect } from 'react';
import { AlumniProfile, Certification, Project, Achievement } from '../types/alumni.types';
import { alumniService } from '../services/alumni.service';
import toast from 'react-hot-toast';

import { calculateProfileCompletion, getProfileCompletionBreakdown } from '../utils/profileCompletion';

interface ProfileTabProps {
  profile: AlumniProfile;
  onSave: (updatedProfile: AlumniProfile) => void;
}

export const ProfileTab: React.FC<ProfileTabProps> = ({ profile, onSave }) => {
  const UPLOAD_BASE = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
  const [formData, setFormData] = useState<AlumniProfile>({ ...profile });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [newSkill, setNewSkill] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [activeSection, setActiveSection] = useState('personal');
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [newCertification, setNewCertification] = useState<Partial<Certification>>({});
  const [newProject, setNewProject] = useState<Partial<Project>>({});
  const [newTechnology, setNewTechnology] = useState('');
  const [showCertForm, setShowCertForm] = useState(false);
  const [editingCertId, setEditingCertId] = useState<string | number | null>(null);
  const [certUploading, setCertUploading] = useState(false);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<string | number | null>(null);
  const [newAchievement, setNewAchievement] = useState<Partial<Achievement>>({});
  const [showAchievementForm, setShowAchievementForm] = useState(false);
  const [editingAchievementId, setEditingAchievementId] = useState<string | number | null>(null);
  const [savedCoverLetter, setSavedCoverLetter] = useState(() => localStorage.getItem('astu_saved_cover_letter') || profile.bio || '');

  useEffect(() => {
    if (profile) {
      const resumeObj = profile.resumeUrl ? {
        fileName: profile.resumeUrl.split('/').pop() || 'Professional_Resume.pdf',
        fileSize: '0.5 MB',
        uploadedAt: 'Uploaded'
      } : (profile as any).resume || null;

      setFormData(prev => ({
        ...prev,
        ...profile,
        linkedInUrl: profile.linkedInUrl || profile.linkedIn || (profile as any).linkedIn || prev.linkedInUrl || '',
        gitHubUrl: profile.gitHubUrl || profile.gitHub || (profile as any).gitHub || prev.gitHubUrl || '',
        portfolioUrl: profile.portfolioUrl || profile.portfolio || (profile as any).portfolio || prev.portfolioUrl || '',
        twitterUrl: profile.twitterUrl || (profile as any).twitterUrl || prev.twitterUrl || '',
        resume: resumeObj
      }));
    }
  }, [profile]);

  const profileScore = calculateProfileCompletion(formData);
  const breakdown = getProfileCompletionBreakdown(formData);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    const skillTrimmed = newSkill.trim();
    if (skillTrimmed && !formData.skills.includes(skillTrimmed)) {
      const updatedSkills = [...formData.skills, skillTrimmed];
      const updatedProfile = { ...formData, skills: updatedSkills };
      setFormData(updatedProfile);
      setNewSkill('');
      toast.loading('Saving skill...', { id: 'save-skill' });
      try {
        await alumniService.updateProfile({ skills: updatedSkills });
        if (onSave) onSave(updatedProfile);
        toast.success(`Added & saved skill: ${skillTrimmed}`, { id: 'save-skill' });
      } catch (err) {
        toast.error('Failed to save skill.', { id: 'save-skill' });
      }
    }
  };

  const handleRemoveSkill = async (skillToRemove: string) => {
    const updatedSkills = formData.skills.filter((skill) => skill !== skillToRemove);
    const updatedProfile = { ...formData, skills: updatedSkills };
    setFormData(updatedProfile);
    toast.loading('Updating skills...', { id: 'save-skill' });
    try {
      await alumniService.updateProfile({ skills: updatedSkills });
      if (onSave) onSave(updatedProfile);
      toast.success(`Removed skill: ${skillToRemove}`, { id: 'save-skill' });
    } catch (err) {
      toast.error('Failed to update skills.', { id: 'save-skill' });
    }
  };

  const handleCertImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCertUploading(true);
    toast.loading('Uploading certificate file...', { id: 'cert-upload' });
    try {
      const res = await alumniService.uploadCertificate(file);
      setNewCertification(p => ({ ...p, imageUrl: res.imageUrl }));
      toast.success('Certificate file attached!', { id: 'cert-upload' });
    } catch (err) {
      toast.error('Failed to upload certificate file.', { id: 'cert-upload' });
    } finally {
      setCertUploading(false);
    }
  };

  const handleEditCertification = (cert: Certification) => {
    setEditingCertId(cert.id);
    setNewCertification({ ...cert });
    setShowCertForm(true);
  };

  const handleSaveCertification = async () => {
    if (!newCertification.name || !newCertification.issuer) {
      toast.error('Certification name and issuer are required.');
      return;
    }

    const certId = editingCertId !== null ? editingCertId : (newCertification.id || Date.now());

    const cert: Certification = {
      id: certId as any,
      name: newCertification.name!,
      issuer: newCertification.issuer!,
      issueDate: newCertification.issueDate || 'Present',
      expiryDate: newCertification.expiryDate || '',
      credentialUrl: newCertification.credentialUrl || '',
      imageUrl: newCertification.imageUrl || '',
      description: newCertification.description || '',
    };

    let updatedCerts: Certification[];
    if (editingCertId !== null) {
      updatedCerts = (formData.certifications || []).map(c => String(c.id) === String(editingCertId) ? cert : c);
    } else {
      updatedCerts = [...(formData.certifications || []), cert];
    }

    const updatedProfile = { ...formData, certifications: updatedCerts };
    setFormData(updatedProfile);
    setNewCertification({});
    setEditingCertId(null);
    setShowCertForm(false);

    toast.loading('Saving certification...', { id: 'save-cert' });
    try {
      await alumniService.updateProfile({ certifications: updatedCerts });
      if (onSave) onSave(updatedProfile);
      toast.success(editingCertId !== null ? 'Certification updated in database!' : 'Certification saved to database!', { id: 'save-cert' });
    } catch (err) {
      toast.error('Failed to save certification.', { id: 'save-cert' });
    }
  };

  const handleDeleteCertification = async (certId: any) => {
    const updatedCerts = formData.certifications?.filter(c => String(c.id) !== String(certId)) || [];
    const updatedProfile = { ...formData, certifications: updatedCerts };
    setFormData(updatedProfile);

    toast.loading('Removing certification...', { id: 'delete-cert' });
    try {
      await alumniService.updateProfile({ certifications: updatedCerts });
      if (onSave) onSave(updatedProfile);
      toast.success('Certification removed from database.', { id: 'delete-cert' });
    } catch (err) {
      toast.error('Failed to remove certification.', { id: 'delete-cert' });
    }
  };

  const handleEditProject = (proj: Project) => {
    setEditingProjectId(proj.id);
    setNewProject({ ...proj });
    setShowProjectForm(true);
  };

  const handleSaveProject = async () => {
    if (!newProject.title) {
      toast.error('Project title is required.');
      return;
    }

    const projId = editingProjectId !== null ? editingProjectId : (newProject.id || Date.now());

    const project: Project = {
      id: projId as any,
      title: newProject.title!,
      description: newProject.description || '',
      technologies: newProject.technologies || [],
      role: newProject.role || '',
      startDate: newProject.startDate || '',
      endDate: newProject.endDate || '',
      url: newProject.url || '',
      imageUrl: newProject.imageUrl || '',
    };

    let updatedProjects: Project[];
    if (editingProjectId !== null) {
      updatedProjects = (formData.projects || []).map(p => String(p.id) === String(editingProjectId) ? project : p);
    } else {
      updatedProjects = [...(formData.projects || []), project];
    }

    const updatedProfile = { ...formData, projects: updatedProjects };
    setFormData(updatedProfile);
    setNewProject({});
    setNewTechnology('');
    setEditingProjectId(null);
    setShowProjectForm(false);

    toast.loading('Saving project...', { id: 'save-proj' });
    try {
      await alumniService.updateProfile({ projects: updatedProjects });
      if (onSave) onSave(updatedProfile);
      toast.success(editingProjectId !== null ? 'Project updated in database!' : 'Project saved to database!', { id: 'save-proj' });
    } catch (err) {
      toast.error('Failed to save project.', { id: 'save-proj' });
    }
  };

  const handleDeleteProject = async (projId: any) => {
    const updatedProjects = formData.projects?.filter(p => String(p.id) !== String(projId)) || [];
    const updatedProfile = { ...formData, projects: updatedProjects };
    setFormData(updatedProfile);

    toast.loading('Removing project...', { id: 'delete-proj' });
    try {
      await alumniService.updateProfile({ projects: updatedProjects });
      if (onSave) onSave(updatedProfile);
      toast.success('Project removed from database.', { id: 'delete-proj' });
    } catch (err) {
      toast.error('Failed to remove project.', { id: 'delete-proj' });
    }
  };

  const handleEditAchievement = (ach: Achievement) => {
    setEditingAchievementId(ach.id);
    setNewAchievement({ ...ach });
    setShowAchievementForm(true);
  };

  const handleSaveAchievement = async () => {
    if (!newAchievement.title) {
      toast.error('Achievement title is required.');
      return;
    }

    const achId = editingAchievementId !== null ? editingAchievementId : (newAchievement.id || Date.now());

    const achievement: Achievement = {
      id: achId as any,
      title: newAchievement.title!,
      description: newAchievement.description || '',
      date: newAchievement.date || new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      type: (newAchievement.type || 'recognition') as any,
    };

    let updatedAchievements: Achievement[];
    if (editingAchievementId !== null) {
      updatedAchievements = (formData.achievements || []).map(a => String(a.id) === String(editingAchievementId) ? achievement : a);
    } else {
      updatedAchievements = [...(formData.achievements || []), achievement];
    }

    const updatedProfile = { ...formData, achievements: updatedAchievements };
    setFormData(updatedProfile);
    setNewAchievement({});
    setEditingAchievementId(null);
    setShowAchievementForm(false);

    toast.loading('Saving achievement...', { id: 'save-ach' });
    try {
      await alumniService.updateProfile({ achievements: updatedAchievements });
      if (onSave) onSave(updatedProfile);
      toast.success(editingAchievementId !== null ? 'Achievement updated in database!' : 'Achievement saved to database!', { id: 'save-ach' });
    } catch (err) {
      toast.error('Failed to save achievement.', { id: 'save-ach' });
    }
  };

  const handleDeleteAchievement = async (achId: any) => {
    const updatedAchievements = formData.achievements?.filter(a => String(a.id) !== String(achId)) || [];
    const updatedProfile = { ...formData, achievements: updatedAchievements };
    setFormData(updatedProfile);

    toast.loading('Removing achievement...', { id: 'delete-ach' });
    try {
      await alumniService.updateProfile({ achievements: updatedAchievements });
      if (onSave) onSave(updatedProfile);
      toast.success('Achievement removed from database.', { id: 'delete-ach' });
    } catch (err) {
      toast.error('Failed to remove achievement.', { id: 'delete-ach' });
    }
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setResumeFile(file);
    setIsUploading(true);
    try {
      const data = new FormData();
      data.append('resume', file);
      data.append('profileData', JSON.stringify(formData));
      
      const updatedProfile: any = await alumniService.updateProfile(data);
      const newResumeUrl = updatedProfile?.resumeUrl || `/uploads/resumes/${file.name}`;
      
      const newResumeObj = {
        fileName: file.name,
        fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        uploadedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      };

      setFormData((prev) => ({
        ...prev,
        resumeUrl: newResumeUrl,
        resume: newResumeObj,
      }));
      toast.success('Resume uploaded and saved to profile!');
      if (onSave) onSave({ ...formData, resumeUrl: newResumeUrl, resume: newResumeObj } as any);
    } catch (err) {
      console.error('Failed to upload resume', err);
      toast.error('Failed to upload resume. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveResume = async () => {
    setIsUploading(true);
    try {
      await alumniService.updateProfile({ resumeUrl: null });
      setResumeFile(null);
      setFormData((prev) => ({ ...prev, resumeUrl: undefined, resume: null }));
      toast.success('Resume removed successfully!');
      if (onSave) onSave({ ...formData, resumeUrl: undefined, resume: null } as any);
    } catch (err) {
      toast.error('Failed to remove resume.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (avatarFile || resumeFile) {
      const data = new FormData();
      data.append('profileData', JSON.stringify(formData));
      if (avatarFile) data.append('avatar', avatarFile);
      if (resumeFile) data.append('resume', resumeFile);
      onSave(data as any);
    } else {
      onSave(formData);
    }
    toast.success('Profile saving...');
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const tempUrl = URL.createObjectURL(file);
      setFormData((prev) => ({ ...prev, avatarUrl: tempUrl }));
      toast.success('Profile photo selected for upload!');
    }
  };

  const getScoreColor = () => {
    if (profileScore >= 80) return 'from-emerald-500 to-teal-600';
    if (profileScore >= 60) return 'from-blue-500 to-indigo-600';
    if (profileScore >= 40) return 'from-amber-500 to-orange-600';
    return 'from-red-500 to-pink-600';
  };

  const sections = [
    { id: 'personal', label: 'Personal', icon: 'person' },
    { id: 'academic', label: 'Academic', icon: 'school' },
    { id: 'employment', label: 'Employment', icon: 'work' },
    { id: 'social', label: 'Social Links', icon: 'link' },
    { id: 'skills', label: 'Skills', icon: 'bolt' },
    { id: 'certifications', label: 'Certifications', icon: 'verified' },
    { id: 'projects', label: 'Projects', icon: 'code' },
    { id: 'achievements', label: 'Achievements', icon: 'emoji_events' },
    { id: 'resume', label: 'Resume', icon: 'description' },
  ];

  const inputClass = "w-full text-xs p-3 bg-[var(--bg-page)] border border-[var(--border-color)] rounded-xl focus:ring-2 focus:ring-[#003366]/20 focus:outline-none focus:border-[#003366] focus:bg-[var(--bg-card)] transition-all duration-200 text-[var(--text-primary)] placeholder:text-[var(--text-muted)]";
  const labelClass = "text-[10px] font-extrabold text-[var(--text-secondary)] uppercase tracking-[0.15em]";

  return (
    <div className="space-y-6">
      {/* Profile Hero Banner */}
      <section className="relative overflow-hidden rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] shadow-sm">
        <div className="absolute inset-0 bg-gradient-to-br from-[#003366] via-[#004080] to-[#1a5c3a] opacity-95"></div>
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full -translate-y-1/3 translate-x-1/3"></div>
          <div className="absolute bottom-0 left-0 w-56 h-56 bg-[#FFD700]/8 rounded-full translate-y-1/3 -translate-x-1/4"></div>
        </div>
        <div className="relative z-10 p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="relative group cursor-pointer" onClick={() => document.getElementById('avatar-upload')?.click()}>
                <img
                  src={(formData.profilePicture || formData.avatarUrl)?.startsWith('/uploads') ? `${UPLOAD_BASE}${formData.profilePicture || formData.avatarUrl}` : (formData.profilePicture || formData.avatarUrl || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&h=150&q=80')}
                  alt={formData.fullName}
                  className="w-20 h-20 rounded-2xl border-3 border-white/20 shadow-xl object-cover transition-transform group-hover:scale-105"
                />
                <input type="file" id="avatar-upload" className="hidden" accept="image/*" onChange={handleAvatarChange} />
                <div className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-white text-lg">📷</span>
                </div>
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-white tracking-tight">{formData.fullName || 'New Alumnus'}</h2>
                <p className="text-sm text-white/70 font-medium mt-0.5">{formData.currentRole} {formData.company ? `at ${formData.company}` : ''}</p>
                <p className="text-[10px] text-white/50 font-semibold mt-1">{typeof formData.department === 'object' ? (formData.department as any)?.name : formData.department} • {formData.batch}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setShowScoreModal(true)}
                className="bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl p-3 text-center border border-white/10 transition-all cursor-pointer group"
                title="Click to view profile completeness breakdown"
              >
                <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${getScoreColor()} flex items-center justify-center mx-auto group-hover:scale-105 transition-transform`}>
                  <span className="text-sm font-extrabold text-white">{profileScore}%</span>
                </div>
                <p className="text-[9px] text-white/80 font-bold uppercase tracking-wider mt-1.5 flex items-center justify-center gap-1">
                  Profile Score <span>🔍</span>
                </p>
              </button>
              <button
                onClick={handleSubmit}
                className="px-5 py-2.5 bg-white/15 hover:bg-white/25 backdrop-blur-sm text-white rounded-xl text-xs font-extrabold tracking-wider uppercase transition-all duration-300 border border-white/15 shadow-lg hover:shadow-xl"
              >
                💾 Save Changes
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Profile Completion Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: 'verified', label: 'Identity', value: 'Verified', color: 'emerald', isClickable: false },
          { icon: 'analytics', label: 'Completeness', value: `${profileScore}% (Click to view)`, color: 'blue', isClickable: true },
          { icon: 'work', label: 'Resume', value: (formData.resume || formData.resumeUrl) ? 'Uploaded' : 'Missing', color: (formData.resume || formData.resumeUrl) ? 'emerald' : 'amber', isClickable: false },
          { icon: 'link', label: 'LinkedIn', value: formData.linkedInUrl ? 'Connected' : 'Not set', color: formData.linkedInUrl ? 'emerald' : 'amber', isClickable: false },
        ].map((stat, idx) => (
          <div
            key={idx}
            onClick={() => stat.isClickable && setShowScoreModal(true)}
            className={`bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)] p-3.5 shadow-sm hover:shadow-md transition-all duration-200 ${
              stat.isClickable ? 'cursor-pointer hover:border-[#003366]/40 ring-1 ring-blue-500/20' : ''
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-base">{stat.icon}</span>
              <span className={`text-[9px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                stat.color === 'emerald' ? 'bg-emerald-50 text-emerald-700' :
                stat.color === 'blue' ? 'bg-blue-50 text-blue-700' :
                'bg-amber-50 text-amber-700'
              }`}>{stat.label}</span>
            </div>
            <p className="text-xs font-extrabold text-[var(--text-primary)]">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Section Tabs */}
      <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)] shadow-sm overflow-hidden">
        <div className="flex overflow-x-auto border-b border-[var(--border-color)]">
          {sections.map(section => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`flex items-center gap-1.5 px-4 py-3 text-[11px] font-bold whitespace-nowrap transition-all duration-200 border-b-2 ${
                activeSection === section.id
                  ? 'border-[#003366] text-[#003366] bg-[#003366]/5'
                  : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-page)]'
              }`}
            >
              <span className="text-sm">{section.icon}</span>
              {section.label}
            </button>
          ))}
        </div>

        <div className="p-5">
          {/* Personal Info Section */}
          {activeSection === 'personal' && (
            <div className="space-y-5">
              <div>
                <h3 className="text-sm font-extrabold text-[var(--text-primary)] tracking-tight">Personal Information</h3>
                <p className="text-[11px] text-[var(--text-secondary)] mt-1">Manage your contact details and personal information.</p>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className={labelClass}>Full Name</label>
                    <span className="text-[9px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">🔒 Registrar Verified</span>
                  </div>
                  <input type="text" name="fullName" value={formData.fullName} className={`${inputClass} opacity-70 cursor-not-allowed bg-slate-100 dark:bg-slate-800/60`} readOnly disabled title="Full Name is synced from ASTU Registrar and cannot be edited in portal" />
                </div>
                <div className="space-y-1.5">
                  <label className={labelClass}>Email Address</label>
                  <input type="email" name="email" value={formData.email} onChange={handleInputChange} className={inputClass} required />
                </div>
                <div className="space-y-1.5">
                  <label className={labelClass}>Phone Number</label>
                  <input type="text" name="phone" value={formData.phone} onChange={handleInputChange} className={inputClass} placeholder="+251 9..." />
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className={labelClass}>Student ID / Batch No.</label>
                    <span className="text-[9px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">🔒 Registrar Verified</span>
                  </div>
                  <input type="text" name="studentId" value={formData.studentId} className={`${inputClass} opacity-70 cursor-not-allowed bg-slate-100 dark:bg-slate-800/60`} readOnly disabled title="Student ID is synced from ASTU Registrar and cannot be edited in portal" />
                </div>
              </div>
                  <div className="space-y-1.5">
                    <label className={labelClass}>Professional Bio</label>
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleInputChange}
                      className={`${inputClass} h-24 resize-none`}
                      placeholder="Share a short summary about your background, career interests, or tech stack..."
                    />
                  </div>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div className="space-y-1.5">
                      <label className={labelClass}>Nationality</label>
                      <input type="text" name="nationality" value={formData.nationality || ''} onChange={handleInputChange} className={inputClass} placeholder="e.g. Ethiopian" />
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className={labelClass}>Date of Birth</label>
                        <span className="text-[9px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">🔒 Registrar Verified</span>
                      </div>
                      <input
                        type="date"
                        name="dateOfBirth"
                        value={
                          formData.dateOfBirth
                            ? new Date(formData.dateOfBirth).toISOString().split('T')[0]
                            : ''
                        }
                        className={`${inputClass} opacity-70 cursor-not-allowed bg-slate-100 dark:bg-slate-800/60`}
                        readOnly
                        disabled
                        title="Date of Birth is synced from ASTU Registrar record and cannot be edited in portal"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className={labelClass}>Gender</label>
                      <select name="gender" value={formData.gender || ''} onChange={handleInputChange} className={inputClass}>
                        <option value="">Select</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Prefer not to say">Prefer not to say</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className={labelClass}>Languages Spoken</label>
                      <input type="text" name="languages" value={Array.isArray(formData.languages) ? formData.languages.join(', ') : ''} onChange={(e) => setFormData(p => ({ ...p, languages: e.target.value.split(',').map(l => l.trim()).filter(Boolean) }))} className={inputClass} placeholder="e.g. English, Amharic, Afan Oromo" />
                      <p className="text-[8px] text-[var(--text-muted)]">Separate multiple languages with commas</p>
                    </div>
                    <div className="space-y-1.5">
                      <label className={labelClass}>Marital Status</label>
                      <select name="maritalStatus" value={formData.maritalStatus || ''} onChange={handleInputChange} className={inputClass}>
                        <option value="">Select</option>
                        <option value="Single">Single</option>
                        <option value="Married">Married</option>
                        <option value="Divorced">Divorced</option>
                        <option value="Widowed">Widowed</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className={labelClass}>Volunteer / Community Work</label>
                    <textarea name="volunteerWork" value={formData.volunteerWork || ''} onChange={handleInputChange} className={`${inputClass} h-20 resize-none`} placeholder="Describe any volunteer or community service work..." />
                  </div>
                  <div className="space-y-1.5">
                    <label className={labelClass}>Current Address</label>
                    <input type="text" name="address" value={formData.address || ''} onChange={handleInputChange} className={inputClass} placeholder="City, Region, Country" />
                  </div>
                </div>
              )}


          {/* Academic Section */}
          {activeSection === 'academic' && (
            <div className="space-y-5">
              <div>
                <h3 className="text-sm font-extrabold text-[var(--text-primary)] tracking-tight">Academic Record</h3>
                <p className="text-[11px] text-[var(--text-secondary)] mt-1">Your ASTU official academic information synced from the Registrar Student Information System.</p>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className={labelClass}>Department</label>
                    <span className="text-[9px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">🔒 Registrar Verified</span>
                  </div>
                  <input
                    type="text"
                    name="department"
                    value={typeof formData.department === 'object' ? (formData.department as any)?.name : formData.department}
                    className={`${inputClass} opacity-70 cursor-not-allowed bg-slate-100 dark:bg-slate-800/60`}
                    readOnly
                    disabled
                    title="Department is synced from ASTU Registrar and cannot be edited in portal"
                  />
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className={labelClass}>Graduation Batch</label>
                    <span className="text-[9px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">🔒 Registrar Verified</span>
                  </div>
                  <input
                    type="text"
                    name="batch"
                    value={formData.batch || (formData.graduationYear ? `${formData.graduationYear}` : '')}
                    className={`${inputClass} opacity-70 cursor-not-allowed bg-slate-100 dark:bg-slate-800/60`}
                    readOnly
                    disabled
                    title="Graduation Batch is synced from ASTU Registrar and cannot be edited in portal"
                  />
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className={labelClass}>Final CGPA</label>
                    <span className="text-[9px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">🔒 Registrar Verified</span>
                  </div>
                  <input
                    type="text"
                    name="cgpa"
                    value={formData.cgpa}
                    className={`${inputClass} opacity-70 cursor-not-allowed bg-slate-100 dark:bg-slate-800/60`}
                    readOnly
                    disabled
                    title="Final CGPA is synced from ASTU Registrar and cannot be edited in portal"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Employment Section */}
          {activeSection === 'employment' && (
            <div className="space-y-5">
              <div>
                <h3 className="text-sm font-extrabold text-[var(--text-primary)] tracking-tight">Employment Details</h3>
                <p className="text-[11px] text-[var(--text-secondary)] mt-1">Update your current professional role and compensation details.</p>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="space-y-1.5">
                  <label className={labelClass}>Role / Title</label>
                  <input type="text" name="currentRole" value={formData.currentRole} onChange={handleInputChange} className={inputClass} placeholder="e.g. Junior Frontend Dev" />
                </div>
                <div className="space-y-1.5">
                  <label className={labelClass}>Company Name</label>
                  <input type="text" name="company" value={formData.company} onChange={handleInputChange} className={inputClass} placeholder="e.g. Chapa Financials" />
                </div>
                <div className="space-y-1.5">
                  <label className={labelClass}>Salary Range</label>
                  <select name="salaryRange" value={formData.salaryRange || 'Competitive Salary'} onChange={handleInputChange} className={inputClass}>
                    <option value="Under 15,000 ETB">Under 15,000 ETB</option>
                    <option value="15,000 - 30,000 ETB">15,000 - 30,000 ETB</option>
                    <option value="30,001 - 60,000 ETB">30,001 - 60,000 ETB</option>
                    <option value="60,001 - 100,000 ETB">60,001 - 100,000 ETB</option>
                    <option value="Over 100,000 ETB">Over 100,000 ETB</option>
                    <option value="Competitive Salary">Competitive Salary</option>
                    <option value="Seeking Opportunities">Seeking Opportunities</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Social Links Section - ENHANCED */}
          {activeSection === 'social' && (
            <div className="space-y-5">
              <div>
                <h3 className="text-sm font-extrabold text-[var(--text-primary)] tracking-tight">Social & Professional Profiles</h3>
                <p className="text-[11px] text-[var(--text-secondary)] mt-1">Connect your professional profiles to boost visibility to recruiters and mentors.</p>
              </div>

              {/* LinkedIn Profile Card */}
              <div className={`rounded-xl border-2 overflow-hidden transition-all duration-300 ${
                formData.linkedInUrl ? 'border-blue-200 bg-blue-50/30' : 'border-[var(--border-color)] bg-[var(--bg-card)] hover:border-blue-200'
              }`}>
                <div className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0A66C2] to-[#004182] flex items-center justify-center shadow-lg">
                        <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                        </svg>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-extrabold text-[var(--text-primary)]">LinkedIn Profile</h4>
                          {formData.linkedInUrl && (
                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[9px] font-extrabold rounded-full uppercase tracking-wider">Connected</span>
                          )}
                        </div>
                        <p className="text-[10px] text-[var(--text-secondary)]">Showcase your professional experience, endorsements, and recommendations.</p>
                      </div>
                    </div>
                    {formData.linkedInUrl && (
                      <a
                        href={formData.linkedInUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0A66C2] text-white rounded-lg text-[10px] font-bold hover:bg-[#004182] transition-colors shadow-md"
                      >
                        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                        Visit
                      </a>
                    )}
                  </div>
                  <div className="mt-4">
                    <label className={labelClass}>LinkedIn Profile URL</label>
                    <div className="relative mt-1.5">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0A66C2]">
                        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                      </span>
                      <input
                        type="url"
                        name="linkedInUrl"
                        value={formData.linkedInUrl || ''}
                        onChange={handleInputChange}
                        placeholder="https://linkedin.com/in/your-handle"
                        className={`${inputClass} pl-10`}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* GitHub Profile Card */}
              <div className={`rounded-xl border-2 overflow-hidden transition-all duration-300 ${
                formData.gitHubUrl ? 'border-gray-300 bg-gray-50/30' : 'border-[var(--border-color)] bg-[var(--bg-card)] hover:border-gray-300'
              }`}>
                <div className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gray-800 to-black flex items-center justify-center shadow-lg">
                        <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                        </svg>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-extrabold text-[var(--text-primary)]">GitHub Profile</h4>
                          {formData.gitHubUrl && (
                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[9px] font-extrabold rounded-full uppercase tracking-wider">Connected</span>
                          )}
                        </div>
                        <p className="text-[10px] text-[var(--text-secondary)]">Display your open-source contributions, repositories, and code portfolio.</p>
                      </div>
                    </div>
                    {formData.gitHubUrl && (
                      <a
                        href={formData.gitHubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 text-white rounded-lg text-[10px] font-bold hover:bg-black transition-colors shadow-md"
                      >
                        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                        Visit
                      </a>
                    )}
                  </div>
                  <div className="mt-4">
                    <label className={labelClass}>GitHub Profile URL</label>
                    <div className="relative mt-1.5">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                      </span>
                      <input
                        type="url"
                        name="gitHubUrl"
                        value={formData.gitHubUrl || ''}
                        onChange={handleInputChange}
                        placeholder="https://github.com/your-handle"
                        className={`${inputClass} pl-10`}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Portfolio URL */}
              <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-md">
                    <span className="material-symbols-outlined text-white text-lg">language</span>
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-[var(--text-primary)]">Portfolio / Personal Website</h4>
                    <p className="text-[10px] text-[var(--text-secondary)]">Link your personal website or portfolio.</p>
                  </div>
                </div>
                <input type="url" name="portfolioUrl" value={formData.portfolioUrl || ''} onChange={handleInputChange} placeholder="https://your-portfolio.com" className={inputClass} />
              </div>

              {/* Twitter/X URL */}
              <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center shadow-md">
                    <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-[var(--text-primary)]">X (Twitter) Profile</h4>
                    <p className="text-[10px] text-[var(--text-secondary)]">Connect your X/Twitter for professional networking.</p>
                  </div>
                </div>
                <input type="url" name="twitterUrl" value={formData.twitterUrl || ''} onChange={handleInputChange} placeholder="https://x.com/your-handle" className={inputClass} />
              </div>

              {/* Social Profiles Tip */}
              <div className="bg-[#003366]/5 border border-[#003366]/10 rounded-xl p-4 flex items-start gap-3">
                <span className="text-lg">💡</span>
                <div>
                  <p className="text-xs font-bold text-[#003366]">Pro Tip: Connect Your Profiles</p>
                  <p className="text-[10px] text-[var(--text-secondary)] mt-0.5 leading-relaxed">
                    Alumni with connected LinkedIn and GitHub profiles receive 3x more recruiter views and 2x more mentorship opportunities. Keep your profiles updated for maximum visibility.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Skills Section */}
          {activeSection === 'skills' && (
            <div className="space-y-5">
              <div>
                <h3 className="text-sm font-extrabold text-[var(--text-primary)] tracking-tight">Technical & Soft Skills</h3>
                <p className="text-[11px] text-[var(--text-secondary)] mt-1">Add skills to improve job matching and recommendations.</p>
              </div>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {formData.skills.map((skill) => (
                    <span key={skill} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[var(--bg-page)] border border-[var(--border-color)] rounded-full text-[11px] font-bold text-[var(--text-primary)] shadow-sm hover:shadow-md transition-all group">
                      {skill}
                      <button type="button" onClick={() => handleRemoveSkill(skill)} className="w-4 h-4 rounded-full flex items-center justify-center text-[var(--text-muted)] hover:bg-red-100 hover:text-red-500 transition-colors">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </span>
                  ))}
                  {formData.skills.length === 0 && <p className="text-xs text-[var(--text-muted)] italic">No skills added yet.</p>}
                </div>
                <div className="flex gap-2 max-w-md">
                  <input type="text" value={newSkill} onChange={(e) => setNewSkill(e.target.value)} placeholder="e.g. React, Docker, Python, System Design" className={`${inputClass} flex-1`} />
                  <button type="button" onClick={handleAddSkill} className="px-4 bg-gradient-to-r from-[#003366] to-[#004d99] text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 hover:shadow-lg transition-all">
                    <span>➕</span> Add
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Certifications Section */}
          {activeSection === 'certifications' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-extrabold text-[var(--text-primary)] tracking-tight">Professional Certifications</h3>
                  <p className="text-[11px] text-[var(--text-secondary)] mt-1">Showcase your verified credentials, upload certificate files, and link credential URLs.</p>
                </div>
                <button onClick={() => setShowCertForm(!showCertForm)} className="px-3 py-2 bg-gradient-to-r from-[#003366] to-[#004d99] text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 hover:shadow-lg transition-all">
                  <span>{showCertForm ? '✕' : '+'}</span> {showCertForm ? 'Cancel' : 'Add Certification'}
                </button>
              </div>

              {showCertForm && (
                <div className="p-5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-page)] space-y-4 shadow-sm">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className={labelClass}>Certification Name *</label>
                      <input type="text" value={newCertification.name || ''} onChange={(e) => setNewCertification(p => ({ ...p, name: e.target.value }))} className={inputClass} placeholder="e.g. AWS Certified Solutions Architect" />
                    </div>
                    <div className="space-y-1.5">
                      <label className={labelClass}>Issuing Organization *</label>
                      <input type="text" value={newCertification.issuer || ''} onChange={(e) => setNewCertification(p => ({ ...p, issuer: e.target.value }))} className={inputClass} placeholder="e.g. Amazon Web Services" />
                    </div>
                    <div className="space-y-1.5">
                      <label className={labelClass}>Issue Date</label>
                      <input type="text" value={newCertification.issueDate || ''} onChange={(e) => setNewCertification(p => ({ ...p, issueDate: e.target.value }))} className={inputClass} placeholder="e.g. Jan 2025" />
                    </div>
                    <div className="space-y-1.5">
                      <label className={labelClass}>Expiry Date</label>
                      <input type="text" value={newCertification.expiryDate || ''} onChange={(e) => setNewCertification(p => ({ ...p, expiryDate: e.target.value }))} className={inputClass} placeholder="e.g. Jan 2028 (Optional)" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className={labelClass}>Credential URL</label>
                      <input type="url" value={newCertification.credentialUrl || ''} onChange={(e) => setNewCertification(p => ({ ...p, credentialUrl: e.target.value }))} className={inputClass} placeholder="https://credly.com/badges/your-badge" />
                    </div>

                    <div className="space-y-1.5">
                      <label className={labelClass}>Upload Certificate File / Image</label>
                      <div className="flex items-center gap-3">
                        <input
                          type="file"
                          id="cert-file-input"
                          accept="image/*,.pdf"
                          onChange={handleCertImageUpload}
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => document.getElementById('cert-file-input')?.click()}
                          disabled={certUploading}
                          className="px-4 py-2.5 bg-white dark:bg-gray-800 border border-[var(--border-color)] rounded-xl text-xs font-bold text-[var(--text-primary)] hover:border-[#003366] transition-all flex items-center gap-2"
                        >
                          <span className="material-symbols-outlined text-base text-[#003366]">upload_file</span>
                          {certUploading ? 'Uploading...' : 'Choose Certificate File'}
                        </button>
                        {newCertification.imageUrl && (
                          <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-xl text-[10px] font-extrabold">
                            <span>✅ Attached</span>
                            <a
                              href={newCertification.imageUrl.startsWith('/uploads') ? `${UPLOAD_BASE}${newCertification.imageUrl}` : newCertification.imageUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="underline text-emerald-800"
                            >
                              Preview
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className={labelClass}>Description / Notes</label>
                    <textarea
                      value={newCertification.description || ''}
                      onChange={(e) => setNewCertification(p => ({ ...p, description: e.target.value }))}
                      className={`${inputClass} h-20 resize-none`}
                      placeholder="Optional notes or details about skills covered..."
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowCertForm(false)}
                      className="px-4 py-2 text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveCertification}
                      className="px-5 py-2 bg-gradient-to-r from-[#003366] to-[#004d99] text-white rounded-xl text-xs font-extrabold shadow-md hover:shadow-lg transition-all"
                    >
                      💾 Save & Persist Certification
                    </button>
                  </div>
                </div>
              )}

              {formData.certifications && formData.certifications.length > 0 ? (
                <div className="space-y-3">
                  {formData.certifications.map((cert) => (
                    <div key={cert.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-page)] hover:border-[#003366]/20 transition-all gap-4">
                      <div className="flex items-start gap-3">
                        {cert.imageUrl ? (
                          <img
                            src={cert.imageUrl.startsWith('/uploads') ? `${UPLOAD_BASE}${cert.imageUrl}` : cert.imageUrl}
                            alt={cert.name}
                            className="w-12 h-12 rounded-xl object-cover border border-[var(--border-color)] shadow-sm flex-shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-sm flex-shrink-0">
                            <span className="material-symbols-outlined text-xl">verified</span>
                          </div>
                        )}
                        <div>
                          <h4 className="text-xs font-extrabold text-[var(--text-primary)]">{cert.name}</h4>
                          <p className="text-[10px] text-[var(--text-secondary)] font-bold mt-0.5">{cert.issuer}</p>
                          <p className="text-[9px] text-[var(--text-muted)] mt-0.5">Issued: {cert.issueDate}{cert.expiryDate ? ` · Expires: ${cert.expiryDate}` : ''}</p>
                          {cert.description && <p className="text-[10px] text-[var(--text-secondary)] mt-1">{cert.description}</p>}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        {cert.imageUrl && (
                          <a
                            href={cert.imageUrl.startsWith('/uploads') ? `${UPLOAD_BASE}${cert.imageUrl}` : cert.imageUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-[10px] font-extrabold hover:bg-emerald-100 transition-all"
                          >
                            <span className="material-symbols-outlined text-xs">visibility</span>
                            View File
                          </a>
                        )}
                        {cert.credentialUrl && (
                          <a
                            href={cert.credentialUrl.startsWith('http') ? cert.credentialUrl : (cert.credentialUrl.startsWith('/') ? `${UPLOAD_BASE}${cert.credentialUrl}` : `${UPLOAD_BASE}/${cert.credentialUrl}`)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg text-[10px] font-extrabold hover:bg-blue-100 transition-all"
                          >
                            <span className="material-symbols-outlined text-xs">open_in_new</span>
                            Credential Link
                          </a>
                        )}
                        <button
                          type="button"
                          onClick={() => handleEditCertification(cert)}
                          className="flex items-center gap-1 px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 border border-gray-200 text-gray-700 rounded-lg text-[10px] font-extrabold transition-all"
                          title="Edit certification"
                        >
                          <span className="material-symbols-outlined text-xs">edit</span>
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteCertification(cert.id)}
                          className="p-2 rounded-lg hover:bg-red-50 text-[var(--text-muted)] hover:text-red-500 transition-all"
                          title="Remove certification"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-[var(--text-muted)]">
                  <span className="text-3xl block mb-2">🏅</span>
                  <p className="text-xs font-bold">No certifications added yet.</p>
                  <p className="text-[10px] mt-1">Add professional certifications to boost your profile credibility.</p>
                </div>
              )}
            </div>
          )}

          {/* Projects Section */}
          {activeSection === 'projects' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-extrabold text-[var(--text-primary)] tracking-tight">Projects & Portfolio</h3>
                  <p className="text-[11px] text-[var(--text-secondary)] mt-1">Showcase your technical projects, portfolio items, and open source contributions.</p>
                </div>
                <button
                  onClick={() => {
                    if (showProjectForm) {
                      setShowProjectForm(false);
                      setEditingProjectId(null);
                      setNewProject({});
                    } else {
                      setShowProjectForm(true);
                    }
                  }}
                  className="px-3 py-2 bg-gradient-to-r from-[#003366] to-[#004d99] text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 hover:shadow-lg transition-all"
                >
                  <span>{showProjectForm ? '✕' : '+'}</span> {showProjectForm ? 'Cancel' : 'Add Project'}
                </button>
              </div>

              {showProjectForm && (
                <div className="p-5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-page)] space-y-4 shadow-sm">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className={labelClass}>Project Title *</label>
                      <input type="text" value={newProject.title || ''} onChange={(e) => setNewProject(p => ({ ...p, title: e.target.value }))} className={inputClass} placeholder="e.g. E-commerce Platform" />
                    </div>
                    <div className="space-y-1.5">
                      <label className={labelClass}>Role / Contribution</label>
                      <input type="text" value={newProject.role || ''} onChange={(e) => setNewProject(p => ({ ...p, role: e.target.value }))} className={inputClass} placeholder="e.g. Lead Full-Stack Developer" />
                    </div>
                    <div className="space-y-1.5 md:col-span-2">
                      <label className={labelClass}>Description</label>
                      <textarea value={newProject.description || ''} onChange={(e) => setNewProject(p => ({ ...p, description: e.target.value }))} className={`${inputClass} h-24 resize-none`} placeholder="Describe project goals, features, and key achievements..." />
                    </div>
                    <div className="space-y-1.5">
                      <label className={labelClass}>Project URL / Live Demo</label>
                      <input type="url" value={newProject.url || ''} onChange={(e) => setNewProject(p => ({ ...p, url: e.target.value }))} className={inputClass} placeholder="https://github.com/username/project" />
                    </div>
                    <div className="space-y-1.5">
                      <label className={labelClass}>Technologies Used</label>
                      <div className="flex gap-2">
                        <input type="text" value={newTechnology} onChange={(e) => setNewTechnology(e.target.value)} className={inputClass} placeholder="e.g. React, Node.js, PostgreSQL" />
                        <button
                          type="button"
                          onClick={() => {
                            if (newTechnology.trim() && !(newProject.technologies || []).includes(newTechnology.trim())) {
                              setNewProject(p => ({ ...p, technologies: [...(p.technologies || []), newTechnology.trim()] }));
                              setNewTechnology('');
                            }
                          }}
                          className="px-4 py-2 bg-[#003366]/10 text-[#003366] rounded-xl text-xs font-bold hover:bg-[#003366]/20 transition-all"
                        >
                          + Add
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {newProject.technologies?.map((tech, i) => (
                          <span key={i} className="px-2.5 py-1 bg-[#003366]/10 text-[#003366] text-[10px] font-bold rounded-lg flex items-center gap-1.5">
                            {tech}
                            <button type="button" onClick={() => setNewProject(p => ({ ...p, technologies: p.technologies?.filter((_, j) => j !== i) }))} className="hover:text-red-500 font-extrabold">✕</button>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowProjectForm(false);
                        setEditingProjectId(null);
                        setNewProject({});
                      }}
                      className="px-4 py-2 text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveProject}
                      className="px-5 py-2 bg-gradient-to-r from-[#003366] to-[#004d99] text-white rounded-xl text-xs font-extrabold shadow-md hover:shadow-lg transition-all"
                    >
                      💾 Save & Persist Project
                    </button>
                  </div>
                </div>
              )}

              {formData.projects && formData.projects.length > 0 ? (
                <div className="space-y-3">
                  {formData.projects.map((proj) => (
                    <div key={proj.id} className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-page)] hover:border-[#003366]/20 transition-all">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white shadow-sm flex-shrink-0">
                            <span className="material-symbols-outlined text-lg">code</span>
                          </div>
                          <div>
                            <h4 className="text-xs font-extrabold text-[var(--text-primary)]">{proj.title}</h4>
                            {proj.role && <p className="text-[9px] text-[var(--text-muted)] font-bold mt-0.5">Role: {proj.role}</p>}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleEditProject(proj)}
                            className="flex items-center gap-1 px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 border border-gray-200 text-gray-700 rounded-lg text-[10px] font-extrabold transition-all"
                            title="Edit project"
                          >
                            <span className="material-symbols-outlined text-xs">edit</span>
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteProject(proj.id)}
                            className="p-2 rounded-lg hover:bg-red-50 text-[var(--text-muted)] hover:text-red-500 transition-all"
                            title="Remove project"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        </div>
                      </div>
                      {proj.description && <p className="text-[10px] text-[var(--text-secondary)] mt-2 leading-relaxed">{proj.description}</p>}
                      {proj.technologies && proj.technologies.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {proj.technologies.map((tech, i) => (
                            <span key={i} className="px-2 py-0.5 bg-[#003366]/5 text-[#003366] text-[9px] font-bold rounded-md">{tech}</span>
                          ))}
                        </div>
                      )}
                      {proj.url && (
                        <a href={proj.url} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold text-[#003366] hover:underline">
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                          View Project
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-[var(--text-muted)]">
                  <span className="text-3xl block mb-2">💻</span>
                  <p className="text-xs font-bold">No projects added yet.</p>
                  <p className="text-[10px] mt-1">Showcase your work to attract recruiters.</p>
                </div>
              )}
            </div>
          )}

          {/* Achievements Section */}
          {activeSection === 'achievements' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-extrabold text-[var(--text-primary)] tracking-tight">Achievements & Recognition</h3>
                  <p className="text-[11px] text-[var(--text-secondary)] mt-1">Awards, research publications, patents, and professional honors.</p>
                </div>
                <button
                  onClick={() => {
                    if (showAchievementForm) {
                      setShowAchievementForm(false);
                      setEditingAchievementId(null);
                      setNewAchievement({});
                    } else {
                      setShowAchievementForm(true);
                    }
                  }}
                  className="px-3 py-2 bg-gradient-to-r from-[#003366] to-[#004d99] text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 hover:shadow-lg transition-all"
                >
                  <span>{showAchievementForm ? '✕' : '+'}</span> {showAchievementForm ? 'Cancel' : 'Add Achievement'}
                </button>
              </div>

              {showAchievementForm && (
                <div className="p-5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-page)] space-y-4 shadow-sm">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1.5 md:col-span-2">
                      <label className={labelClass}>Achievement Title *</label>
                      <input type="text" value={newAchievement.title || ''} onChange={(e) => setNewAchievement(a => ({ ...a, title: e.target.value }))} className={inputClass} placeholder="e.g. National AI Research Excellence Award" />
                    </div>
                    <div className="space-y-1.5">
                      <label className={labelClass}>Category Type</label>
                      <select value={newAchievement.type || 'award'} onChange={(e) => setNewAchievement(a => ({ ...a, type: e.target.value as any }))} className={inputClass}>
                        <option value="award">🏆 Award / Honor</option>
                        <option value="publication">📖 Research Publication</option>
                        <option value="patent">📜 Patent / Innovation</option>
                        <option value="recognition">🌟 Professional Recognition</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className={labelClass}>Date Received / Published</label>
                      <input type="text" value={newAchievement.date || ''} onChange={(e) => setNewAchievement(a => ({ ...a, date: e.target.value }))} className={inputClass} placeholder="e.g. Feb 2025" />
                    </div>
                    <div className="space-y-1.5 md:col-span-2">
                      <label className={labelClass}>Description / Links</label>
                      <input type="text" value={newAchievement.description || ''} onChange={(e) => setNewAchievement(a => ({ ...a, description: e.target.value }))} className={inputClass} placeholder="Brief summary, journal link, or award presenter details..." />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAchievementForm(false);
                        setEditingAchievementId(null);
                        setNewAchievement({});
                      }}
                      className="px-4 py-2 text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveAchievement}
                      className="px-5 py-2 bg-gradient-to-r from-[#003366] to-[#004d99] text-white rounded-xl text-xs font-extrabold shadow-md hover:shadow-lg transition-all"
                    >
                      💾 Save & Persist Achievement
                    </button>
                  </div>
                </div>
              )}

              {formData.achievements && formData.achievements.length > 0 ? (
                <div className="space-y-3">
                  {formData.achievements.map((ach) => (
                    <div key={ach.id} className="flex items-start gap-3 p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-page)] hover:border-[#003366]/20 transition-all">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm flex-shrink-0 ${
                        ach.type === 'award' ? 'bg-gradient-to-br from-amber-500 to-orange-600' :
                        ach.type === 'publication' ? 'bg-gradient-to-br from-blue-500 to-indigo-600' :
                        ach.type === 'patent' ? 'bg-gradient-to-br from-rose-500 to-pink-600' :
                        'bg-gradient-to-br from-emerald-500 to-teal-600'
                      }`}>
                        <span className="material-symbols-outlined text-lg">
                          {ach.type === 'award' ? 'emoji_events' : ach.type === 'publication' ? 'menu_book' : ach.type === 'patent' ? 'toll' : 'stars'}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="text-xs font-extrabold text-[var(--text-primary)]">{ach.title}</h4>
                            <p className="text-[9px] text-[var(--text-muted)] font-bold uppercase mt-0.5">{ach.type} · {ach.date}</p>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleEditAchievement(ach)}
                              className="px-2 py-1 bg-gray-100 hover:bg-gray-200 border border-gray-200 text-gray-700 rounded-md text-[10px] font-extrabold transition-all flex items-center gap-1"
                              title="Edit achievement"
                            >
                              <span className="material-symbols-outlined text-[12px]">edit</span>
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteAchievement(ach.id)}
                              className="p-1 rounded hover:bg-red-50 text-[var(--text-muted)] hover:text-red-500 transition-all"
                              title="Remove achievement"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                          </div>
                        </div>
                        {ach.description && <p className="text-[10px] text-[var(--text-secondary)] mt-1 leading-relaxed">{ach.description}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-[var(--text-muted)]">
                  <span className="text-3xl block mb-2">🏆</span>
                  <p className="text-xs font-bold">No achievements added yet.</p>
                  <p className="text-[10px] mt-1">Share your awards, publications, and recognitions to build prestige.</p>
                </div>
              )}
            </div>
          )}

          {/* Resume Section */}
          {activeSection === 'resume' && (
            <div className="space-y-5">
              <div>
                <h3 className="text-sm font-extrabold text-[var(--text-primary)] tracking-tight">Professional Resume / CV</h3>
                <p className="text-[11px] text-[var(--text-secondary)] mt-1">Upload your resume to make it visible to partner employers.</p>
              </div>
              {formData.resume || formData.resumeUrl ? (
                <div className="p-5 rounded-xl border border-emerald-200 bg-emerald-50/30">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center text-white shadow-lg">
                        <span className="text-2xl">📄</span>
                      </div>
                      <div>
                        <h5 className="text-sm font-extrabold text-[var(--text-primary)]">
                          {formData.resume?.fileName || (formData.resumeUrl ? formData.resumeUrl.split('/').pop() : 'Professional_Resume.pdf')}
                        </h5>
                        <p className="text-[10px] text-[var(--text-secondary)]">
                          Size: {formData.resume?.fileSize || 'Verified File'} • Uploaded {formData.resume?.uploadedAt || 'Uploaded'}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {formData.resumeUrl && (
                        <a
                          href={formData.resumeUrl.startsWith('http') ? formData.resumeUrl : `${UPLOAD_BASE}${formData.resumeUrl}`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1.5 px-4 py-2 border border-[var(--border-color)] rounded-xl text-[11px] font-bold text-[var(--text-primary)] hover:bg-[var(--bg-page)] transition-all shadow-xs"
                        >
                          ⬇️ Download
                        </a>
                      )}
                      <button onClick={handleRemoveResume} className="flex items-center gap-1.5 px-4 py-2 border border-red-200 rounded-xl text-[11px] font-bold text-red-600 hover:bg-red-50 transition-all">
                        🗑️ Remove
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <label className="block border-2 border-dashed border-[var(--border-color)] rounded-xl p-10 text-center hover:border-[#003366]/30 hover:bg-[#003366]/5 transition-all cursor-pointer group">
                  <input type="file" accept=".pdf,.doc,.docx" onChange={handleResumeUpload} className="hidden" disabled={isUploading} />
                  <div className="space-y-3">
                    <span className="text-4xl block group-hover:scale-110 transition-transform">{isUploading ? '⏳' : '📁'}</span>
                    <div>
                      <p className="text-xs font-bold text-[var(--text-primary)]">{isUploading ? 'Uploading...' : 'Click or drag to upload resume'}</p>
                      <p className="text-[10px] text-[var(--text-secondary)] mt-0.5">PDF, DOC, or DOCX formats up to 5MB</p>
                    </div>
                  </div>
                </label>
              )}

              {/* Default Cover Letter Template */}
              <div className="pt-6 border-t border-[var(--border-color)] space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-extrabold text-[var(--text-primary)] uppercase tracking-wider">Default Cover Letter Template</h4>
                    <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">Write a reusable cover letter to auto-fill when applying to jobs.</p>
                  </div>
                </div>
                <textarea
                  value={savedCoverLetter}
                  onChange={(e) => setSavedCoverLetter(e.target.value)}
                  placeholder="Dear Hiring Manager,&#10;&#10;I am writing to express my strong interest in the open position at your organization..."
                  className="w-full text-xs p-3.5 bg-[var(--bg-page)] border border-[var(--border-color)] rounded-xl focus:ring-2 focus:ring-[#003366]/20 focus:outline-none focus:border-[#003366] transition-all h-32 resize-none"
                />
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      localStorage.setItem('astu_saved_cover_letter', savedCoverLetter);
                      onSave({ ...formData, bio: savedCoverLetter } as any);
                      toast.success('Default cover letter template saved!');
                    }}
                    className="px-4 py-2 bg-gradient-to-r from-[#003366] to-[#004d99] text-white text-xs font-bold rounded-xl hover:shadow-md transition-all flex items-center gap-1.5"
                  >
                    💾 Save Cover Letter Template
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Profile Score Breakdown Modal */}
      {showScoreModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-[var(--border-color)] max-w-lg w-full p-6 shadow-2xl space-y-5 relative overflow-hidden">
            <div className="flex items-start justify-between border-b border-[var(--border-color)] pb-4">
              <div className="flex items-center gap-3">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${getScoreColor()} flex items-center justify-center text-white font-extrabold text-lg shadow-md`}>
                  {breakdown.score}%
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-[var(--text-primary)]">Profile Completeness Breakdown</h3>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                    {breakdown.missing.length === 0
                      ? '🎉 Congratulations! Your profile is 100% complete.'
                      : `Complete ${breakdown.missing.length} missing item(s) to reach 100%!`}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowScoreModal(false)}
                className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 hover:text-gray-800 transition-colors font-bold text-sm"
              >
                ✕
              </button>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold text-[var(--text-secondary)]">
                <span>Completion Score</span>
                <span className="text-[#003366] font-extrabold">{breakdown.score}% Complete</span>
              </div>
              <div className="w-full h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden p-0.5 border border-gray-200 dark:border-gray-700">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${getScoreColor()} transition-all duration-500`}
                  style={{ width: `${breakdown.score}%` }}
                />
              </div>
            </div>

            {/* Missing Items Section */}
            {breakdown.missing.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-base">warning</span>
                  Missing Profile Items ({breakdown.missing.length})
                </h4>
                <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                  {breakdown.missing.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/60 dark:bg-amber-950/20"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0" />
                        <div>
                          <p className="text-xs font-bold text-gray-900 dark:text-gray-100">{item.title}</p>
                          <p className="text-[10px] text-amber-700 dark:text-amber-400 font-semibold">+{item.weight.toFixed(1)}% score boost</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setShowScoreModal(false);
                          setActiveSection(item.sectionId);
                          toast.success(`Switched tab to complete: ${item.title}`);
                        }}
                        className="px-3 py-1.5 bg-[#003366] text-white rounded-lg text-[10px] font-extrabold hover:bg-[#002244] transition-all shadow-xs flex items-center gap-1"
                      >
                        {item.actionText} ➔
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Completed Items Section */}
            <div className="space-y-2">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-base">check_circle</span>
                Completed Sections ({breakdown.completed.length})
              </h4>
              <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto">
                {breakdown.completed.map((item) => (
                  <span
                    key={item.id}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 text-emerald-700 dark:text-emerald-300 rounded-lg text-[10px] font-bold"
                  >
                    ✓ {item.title} (+{item.weight.toFixed(1)}%)
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setShowScoreModal(false)}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl text-xs font-bold hover:bg-gray-200 transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};