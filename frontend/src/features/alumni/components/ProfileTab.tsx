import React, { useState, useEffect } from 'react';
import { AlumniProfile, Certification, Project, Achievement } from '../types/alumni.types';
import { alumniService } from '../services/alumni.service';
import toast from 'react-hot-toast';

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
  const [newCertification, setNewCertification] = useState<Partial<Certification>>({});
  const [newProject, setNewProject] = useState<Partial<Project>>({});
  const [newTechnology, setNewTechnology] = useState('');
  const [showCertForm, setShowCertForm] = useState(false);
  const [showProjectForm, setShowProjectForm] = useState(false);
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
        resume: resumeObj
      }));
    }
  }, [profile]);

  const profileScore = Math.min(100, 
    30 + 
    formData.skills.length * 3 + 
    (formData.resume || formData.resumeUrl ? 10 : 0) + 
    (formData.linkedInUrl ? 5 : 0) + 
    (formData.gitHubUrl ? 5 : 0) + 
    (formData.portfolioUrl ? 5 : 0) +
    (formData.certifications?.length ? Math.min(formData.certifications.length * 5, 15) : 0) +
    (formData.projects?.length ? Math.min(formData.projects.length * 5, 15) : 0) +
    (formData.achievements?.length ? Math.min(formData.achievements.length * 3, 10) : 0) +
    (formData.languages?.length ? 5 : 0)
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    const skillTrimmed = newSkill.trim();
    if (skillTrimmed && !formData.skills.includes(skillTrimmed)) {
      setFormData((prev) => ({ ...prev, skills: [...prev.skills, skillTrimmed] }));
      setNewSkill('');
      toast.success(`Added skill: ${skillTrimmed}`);
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setFormData((prev) => ({ ...prev, skills: prev.skills.filter((skill) => skill !== skillToRemove) }));
    toast.success(`Removed skill: ${skillToRemove}`);
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
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center border border-white/10">
                <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${getScoreColor()} flex items-center justify-center mx-auto`}>
                  <span className="text-sm font-extrabold text-white">{profileScore}%</span>
                </div>
                <p className="text-[9px] text-white/60 font-bold uppercase tracking-wider mt-1.5">Profile Score</p>
              </div>
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
          { icon: 'verified', label: 'Identity', value: 'Verified', color: 'emerald' },
          { icon: 'analytics', label: 'Completeness', value: `${profileScore}%`, color: 'blue' },
          { icon: 'work', label: 'Resume', value: (formData.resume || formData.resumeUrl) ? 'Uploaded' : 'Missing', color: (formData.resume || formData.resumeUrl) ? 'emerald' : 'amber' },
          { icon: 'link', label: 'LinkedIn', value: formData.linkedInUrl ? 'Connected' : 'Not set', color: formData.linkedInUrl ? 'emerald' : 'amber' },
        ].map((stat, idx) => (
          <div key={idx} className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)] p-3.5 shadow-sm hover:shadow-md transition-all duration-200">
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
                  <label className={labelClass}>Full Name</label>
                  <input type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} className={inputClass} required />
                </div>
                <div className="space-y-1.5">
                  <label className={labelClass}>Email Address</label>
                  <input type="email" name="email" value={formData.email} onChange={handleInputChange} className={inputClass} required />
                </div>
                <div className="space-y-1.5">
                  <label className={labelClass}>Phone Number</label>
                  <input type="text" name="phone" value={formData.phone} onChange={handleInputChange} className={inputClass} />
                </div>
                <div className="space-y-1.5">
                  <label className={labelClass}>Student ID / Batch No.</label>
                  <input type="text" name="studentId" value={formData.studentId} onChange={handleInputChange} className={`${inputClass} opacity-60 cursor-not-allowed`} readOnly />
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
                      <label className={labelClass}>Date of Birth</label>
                      <input type="date" name="dateOfBirth" value={formData.dateOfBirth?.split('T')[0] || ''} onChange={(e) => setFormData(p => ({ ...p, dateOfBirth: e.target.value }))} className={inputClass} />
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
                <p className="text-[11px] text-[var(--text-secondary)] mt-1">Your ASTU academic information synced from the student information system.</p>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="space-y-1.5">
                  <label className={labelClass}>Department</label>
                  <select name="department" value={typeof formData.department === 'object' ? (formData.department as any)?.name : formData.department} onChange={handleInputChange} className={inputClass}>
                    <option value="Computer Science and Engineering">Computer Science and Engineering</option>
                    <option value="Electrical and Computer Engineering">Electrical and Computer Engineering</option>
                    <option value="Civil Engineering">Civil Engineering</option>
                    <option value="Mechanical and Vehicle Engineering">Mechanical and Vehicle Engineering</option>
                    <option value="Chemical Engineering">Chemical Engineering</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className={labelClass}>Graduation Batch</label>
                  <input type="text" name="batch" value={formData.batch} onChange={handleInputChange} className={inputClass} />
                </div>
                <div className="space-y-1.5">
                  <label className={labelClass}>Final CGPA</label>
                  <input type="text" name="cgpa" value={formData.cgpa} onChange={handleInputChange} className={inputClass} placeholder="e.g. 3.75" />
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
                  <select name="salaryRange" value={formData.salaryRange} onChange={handleInputChange} className={inputClass}>
                    <option value="Under 15,000 ETB">Under 15,000 ETB</option>
                    <option value="15,000 - 30,000 ETB">15,000 - 30,000 ETB</option>
                    <option value="30,001 - 60,000 ETB">30,001 - 60,000 ETB</option>
                    <option value="60,001 - 100,000 ETB">60,001 - 100,000 ETB</option>
                    <option value="Over 100,000 ETB">Over 100,000 ETB</option>
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
                  <p className="text-[11px] text-[var(--text-secondary)] mt-1">Showcase your verified credentials and certificates.</p>
                </div>
                <button onClick={() => setShowCertForm(!showCertForm)} className="px-3 py-2 bg-gradient-to-r from-[#003366] to-[#004d99] text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 hover:shadow-lg transition-all">
                  <span>{showCertForm ? '✕' : '+'}</span> {showCertForm ? 'Cancel' : 'Add Certification'}
                </button>
              </div>

              {showCertForm && (
                <div className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-page)] space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className={labelClass}>Certification Name</label>
                      <input type="text" value={newCertification.name || ''} onChange={(e) => setNewCertification(p => ({ ...p, name: e.target.value }))} className={inputClass} placeholder="e.g. AWS Certified Cloud Practitioner" />
                    </div>
                    <div className="space-y-1.5">
                      <label className={labelClass}>Issuing Organization</label>
                      <input type="text" value={newCertification.issuer || ''} onChange={(e) => setNewCertification(p => ({ ...p, issuer: e.target.value }))} className={inputClass} placeholder="e.g. Amazon Web Services" />
                    </div>
                    <div className="space-y-1.5">
                      <label className={labelClass}>Issue Date</label>
                      <input type="text" value={newCertification.issueDate || ''} onChange={(e) => setNewCertification(p => ({ ...p, issueDate: e.target.value }))} className={inputClass} placeholder="e.g. Jan 2025" />
                    </div>
                    <div className="space-y-1.5">
                      <label className={labelClass}>Credential URL</label>
                      <input type="url" value={newCertification.credentialUrl || ''} onChange={(e) => setNewCertification(p => ({ ...p, credentialUrl: e.target.value }))} className={inputClass} placeholder="https://example.com/verify" />
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      if (!newCertification.name || !newCertification.issuer) { toast.error('Name and issuer required.'); return; }
                      const cert: Certification = { id: Date.now(), name: newCertification.name!, issuer: newCertification.issuer!, issueDate: newCertification.issueDate || 'Present', credentialUrl: newCertification.credentialUrl };
                      setFormData(p => ({ ...p, certifications: [...(p.certifications || []), cert] }));
                      setNewCertification({});
                      setShowCertForm(false);
                      toast.success('Certification added!');
                    }}
                    className="px-4 py-2 bg-[#003366] text-white rounded-xl text-xs font-bold hover:bg-[#002244] transition-all"
                  >
                    Save Certification
                  </button>
                </div>
              )}

              {formData.certifications && formData.certifications.length > 0 ? (
                <div className="space-y-3">
                  {formData.certifications.map((cert) => (
                    <div key={cert.id} className="flex items-start justify-between p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-page)] hover:border-[#003366]/20 transition-all">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-sm flex-shrink-0">
                          <span className="material-symbols-outlined text-lg">verified</span>
                        </div>
                        <div>
                          <h4 className="text-xs font-extrabold text-[var(--text-primary)]">{cert.name}</h4>
                          <p className="text-[10px] text-[var(--text-secondary)] font-bold mt-0.5">{cert.issuer}</p>
                          <p className="text-[9px] text-[var(--text-muted)] mt-0.5">Issued: {cert.issueDate}{cert.expiryDate ? ` · Expires: ${cert.expiryDate}` : ''}</p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        {cert.credentialUrl && (
                          <a href={cert.credentialUrl} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg hover:bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[#003366] transition-all">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                          </a>
                        )}
                        <button
                          onClick={() => {
                            setFormData(p => ({ ...p, certifications: p.certifications?.filter(c => c.id !== cert.id) }));
                            toast.success('Certification removed.');
                          }}
                          className="p-2 rounded-lg hover:bg-red-50 text-[var(--text-muted)] hover:text-red-500 transition-all"
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
                  <p className="text-[11px] text-[var(--text-secondary)] mt-1">Showcase your technical projects and open source contributions.</p>
                </div>
                <button onClick={() => setShowProjectForm(!showProjectForm)} className="px-3 py-2 bg-gradient-to-r from-[#003366] to-[#004d99] text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 hover:shadow-lg transition-all">
                  <span>{showProjectForm ? '✕' : '+'}</span> {showProjectForm ? 'Cancel' : 'Add Project'}
                </button>
              </div>

              {showProjectForm && (
                <div className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-page)] space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className={labelClass}>Project Title</label>
                      <input type="text" value={newProject.title || ''} onChange={(e) => setNewProject(p => ({ ...p, title: e.target.value }))} className={inputClass} placeholder="e.g. E-commerce Platform" />
                    </div>
                    <div className="space-y-1.5">
                      <label className={labelClass}>Role</label>
                      <input type="text" value={newProject.role || ''} onChange={(e) => setNewProject(p => ({ ...p, role: e.target.value }))} className={inputClass} placeholder="e.g. Lead Developer" />
                    </div>
                    <div className="space-y-1.5 md:col-span-2">
                      <label className={labelClass}>Description</label>
                      <textarea value={newProject.description || ''} onChange={(e) => setNewProject(p => ({ ...p, description: e.target.value }))} className={`${inputClass} h-20 resize-none`} placeholder="Brief description of the project..." />
                    </div>
                    <div className="space-y-1.5">
                      <label className={labelClass}>Project URL</label>
                      <input type="url" value={newProject.url || ''} onChange={(e) => setNewProject(p => ({ ...p, url: e.target.value }))} className={inputClass} placeholder="https://github.com/..." />
                    </div>
                    <div className="space-y-1.5">
                      <label className={labelClass}>Technologies Used</label>
                      <div className="flex gap-2">
                        <input type="text" value={newTechnology} onChange={(e) => setNewTechnology(e.target.value)} className={inputClass} placeholder="e.g. React" />
                        <button
                          onClick={() => {
                            if (newTechnology.trim() && !(newProject.technologies || []).includes(newTechnology.trim())) {
                              setNewProject(p => ({ ...p, technologies: [...(p.technologies || []), newTechnology.trim()] }));
                              setNewTechnology('');
                            }
                          }}
                          className="px-3 py-2 bg-gray-200 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-300"
                        >
                          +
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {newProject.technologies?.map((tech, i) => (
                          <span key={i} className="px-2 py-0.5 bg-[#003366]/5 text-[#003366] text-[9px] font-bold rounded-full flex items-center gap-1">
                            {tech}
                            <button onClick={() => setNewProject(p => ({ ...p, technologies: p.technologies?.filter((_, j) => j !== i) }))} className="hover:text-red-500">x</button>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      if (!newProject.title) { toast.error('Project title is required.'); return; }
                      const project: Project = { id: Date.now(), title: newProject.title!, description: newProject.description || '', technologies: newProject.technologies || [], role: newProject.role || '', startDate: '', url: newProject.url };
                      setFormData(p => ({ ...p, projects: [...(p.projects || []), project] }));
                      setNewProject({});
                      setNewTechnology('');
                      setShowProjectForm(false);
                      toast.success('Project added!');
                    }}
                    className="px-4 py-2 bg-[#003366] text-white rounded-xl text-xs font-bold hover:bg-[#002244] transition-all"
                  >
                    Save Project
                  </button>
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
                            <p className="text-[9px] text-[var(--text-muted)] font-bold mt-0.5">Role: {proj.role}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setFormData(p => ({ ...p, projects: p.projects?.filter(pr => pr.id !== proj.id) }));
                            toast.success('Project removed.');
                          }}
                          className="p-2 rounded-lg hover:bg-red-50 text-[var(--text-muted)] hover:text-red-500 transition-all"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                      <p className="text-[10px] text-[var(--text-secondary)] mt-2 leading-relaxed">{proj.description}</p>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {proj.technologies.map((tech, i) => (
                          <span key={i} className="px-2 py-0.5 bg-[#003366]/5 text-[#003366] text-[9px] font-bold rounded-md">{tech}</span>
                        ))}
                      </div>
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
              <div>
                <h3 className="text-sm font-extrabold text-[var(--text-primary)] tracking-tight">Achievements & Recognition</h3>
                <p className="text-[11px] text-[var(--text-secondary)] mt-1">Awards, publications, and professional recognitions.</p>
              </div>
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
                          <button
                            onClick={() => {
                              setFormData(p => ({ ...p, achievements: p.achievements?.filter(a => a.id !== ach.id) }));
                              toast.success('Achievement removed.');
                            }}
                            className="p-1 rounded hover:bg-red-50 text-[var(--text-muted)] hover:text-red-500"
                          >
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                          </button>
                        </div>
                        <p className="text-[10px] text-[var(--text-secondary)] mt-1 leading-relaxed">{ach.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-[var(--text-muted)]">
                  <span className="text-3xl block mb-2">🏆</span>
                  <p className="text-xs font-bold">No achievements added yet.</p>
                  <p className="text-[10px] mt-1">Share your awards and recognitions.</p>
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
    </div>
  );
};