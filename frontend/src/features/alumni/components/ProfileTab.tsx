import React, { useState } from 'react';
import { AlumniProfile } from '../types/alumni.types';
import toast from 'react-hot-toast';

interface ProfileTabProps {
  profile: AlumniProfile;
  onSave: (updatedProfile: AlumniProfile) => void;
}

export const ProfileTab: React.FC<ProfileTabProps> = ({ profile, onSave }) => {
  const [formData, setFormData] = useState<AlumniProfile>({ ...profile });
  const [newSkill, setNewSkill] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    const skillTrimmed = newSkill.trim();
    if (skillTrimmed && !formData.skills.includes(skillTrimmed)) {
      setFormData((prev) => ({
        ...prev,
        skills: [...prev.skills, skillTrimmed],
      }));
      setNewSkill('');
      toast.success(`Added skill: ${skillTrimmed}`);
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((skill) => skill !== skillToRemove),
    }));
    toast.success(`Removed skill: ${skillToRemove}`);
  };

  const handleMockResumeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      setTimeout(() => {
        setFormData((prev) => ({
          ...prev,
          resume: {
            fileName: file.name,
            fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
            uploadedAt: new Date().toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            }),
          },
        }));
        setIsUploading(false);
        toast.success('Resume uploaded successfully!');
      }, 1500);
    }
  };

  const handleRemoveResume = () => {
    setFormData((prev) => ({
      ...prev,
      resume: null,
    }));
    toast.success('Resume removed.');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    toast.success('Profile updated successfully!');
  };

  // Mock avatar upload
  const handleAvatarChange = () => {
    const mockAvatars = [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80',
      'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&h=150&q=80',
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80',
    ];
    const randomAvatar = mockAvatars[Math.floor(Math.random() * mockAvatars.length)];
    setFormData((prev) => ({
      ...prev,
      avatarUrl: randomAvatar,
    }));
    toast.success('Profile photo updated!');
  };

  return (
    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-200/60 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Manage Profile</h3>
          <p className="text-sm text-gray-600">Keep your academic and professional accomplishments updated</p>
        </div>
        <button
          onClick={handleSubmit}
          className="px-6 py-2.5 bg-astu-navy text-white font-semibold rounded-xl hover:bg-astu-navy/90 transition-all duration-300 shadow-md hover:scale-105"
        >
          Save All Changes
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Photo and Bio header section */}
        <div className="flex flex-col sm:flex-row items-center gap-6 p-6 bg-gradient-to-r from-gray-50 to-white rounded-2xl border border-gray-100">
          <div className="relative group cursor-pointer" onClick={handleAvatarChange}>
            <img
              src={formData.avatarUrl || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&h=150&q=80'}
              alt={formData.fullName}
              className="w-24 h-24 rounded-full border-4 border-white shadow-md object-cover transition-transform group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="material-symbols-outlined text-white text-xl">photo_camera</span>
            </div>
          </div>
          <div className="flex-1 w-full space-y-4">
            <div>
              <h4 className="text-lg font-bold text-gray-900">{formData.fullName || 'New Alumnus'}</h4>
              <p className="text-sm text-astu-navy font-semibold">{formData.currentRole} at {formData.company || 'ASTU'}</p>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Professional Bio</label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                className="w-full text-sm p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-astu-navy/20 focus:outline-none focus:border-astu-navy transition-all h-20 resize-none"
                placeholder="Share a short summary about your background, career interests, or tech stack..."
              />
            </div>
          </div>
        </div>

        {/* Personal details grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Full Name</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              className="w-full text-sm p-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-astu-navy/20 focus:outline-none focus:border-astu-navy focus:bg-white transition-all"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full text-sm p-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-astu-navy/20 focus:outline-none focus:border-astu-navy focus:bg-white transition-all"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Phone Number</label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className="w-full text-sm p-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-astu-navy/20 focus:outline-none focus:border-astu-navy focus:bg-white transition-all"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Student ID / Batch No.</label>
            <input
              type="text"
              name="studentId"
              value={formData.studentId}
              onChange={handleInputChange}
              className="w-full text-sm p-3 bg-gray-100 border border-gray-200 rounded-xl cursor-not-allowed opacity-75"
              readOnly
            />
          </div>
        </div>

        {/* Academic Details Section */}
        <div className="space-y-4 pt-4 border-t border-gray-100">
          <h4 className="text-md font-bold text-gray-900 flex items-center gap-2">
            <span className="material-symbols-outlined text-astu-navy">school</span>
            Academic Record (ASTU)
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-1 md:col-span-1">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Department</label>
              <select
                name="department"
                value={formData.department}
                onChange={handleInputChange}
                className="w-full text-sm p-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-astu-navy/20 focus:outline-none focus:border-astu-navy focus:bg-white transition-all"
              >
                <option value="Computer Science and Engineering">Computer Science and Engineering</option>
                <option value="Electrical and Computer Engineering">Electrical and Computer Engineering</option>
                <option value="Civil Engineering">Civil Engineering</option>
                <option value="Mechanical and Vehicle Engineering">Mechanical and Vehicle Engineering</option>
                <option value="Chemical Engineering">Chemical Engineering</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Graduation Batch</label>
              <input
                type="text"
                name="batch"
                value={formData.batch}
                onChange={handleInputChange}
                className="w-full text-sm p-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-astu-navy/20 focus:outline-none focus:border-astu-navy focus:bg-white transition-all"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Final CGPA</label>
              <input
                type="text"
                name="cgpa"
                value={formData.cgpa}
                onChange={handleInputChange}
                className="w-full text-sm p-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-astu-navy/20 focus:outline-none focus:border-astu-navy focus:bg-white transition-all"
                placeholder="e.g. 3.75"
              />
            </div>
          </div>
        </div>

        {/* Professional Placement & Salary Details Section */}
        <div className="space-y-4 pt-4 border-t border-gray-100">
          <h4 className="text-md font-bold text-gray-900 flex items-center gap-2">
            <span className="material-symbols-outlined text-astu-green">work</span>
            Current Employment Details
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Role / Title</label>
              <input
                type="text"
                name="currentRole"
                value={formData.currentRole}
                onChange={handleInputChange}
                className="w-full text-sm p-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-astu-navy/20 focus:outline-none focus:border-astu-navy focus:bg-white transition-all"
                placeholder="e.g. Junior Frontend Dev"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Company Name</label>
              <input
                type="text"
                name="company"
                value={formData.company}
                onChange={handleInputChange}
                className="w-full text-sm p-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-astu-navy/20 focus:outline-none focus:border-astu-navy focus:bg-white transition-all"
                placeholder="e.g. Chapa Financials"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Salary Range</label>
              <select
                name="salaryRange"
                value={formData.salaryRange}
                onChange={handleInputChange}
                className="w-full text-sm p-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-astu-navy/20 focus:outline-none focus:border-astu-navy focus:bg-white transition-all font-semibold text-gray-700"
              >
                <option value="Under 15,000 ETB">Under 15,000 ETB</option>
                <option value="15,000 - 30,000 ETB">15,000 - 30,000 ETB</option>
                <option value="30,001 - 60,000 ETB">30,001 - 60,000 ETB</option>
                <option value="60,001 - 100,000 ETB">60,001 - 100,000 ETB</option>
                <option value="Over 100,000 ETB">Over 100,000 ETB</option>
              </select>
            </div>
          </div>
        </div>

        {/* Social Links Section */}
        <div className="space-y-4 pt-4 border-t border-gray-100">
          <h4 className="text-md font-bold text-gray-900 flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-500">link</span>
            Social Profiles (LinkedIn & GitHub)
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">LinkedIn URL</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-blue-600">contact_page</span>
                <input
                  type="url"
                  name="linkedInUrl"
                  value={formData.linkedInUrl || ''}
                  onChange={handleInputChange}
                  placeholder="https://linkedin.com/in/your-handle"
                  className="w-full pl-10 pr-3 py-3 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">GitHub URL</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-800">terminal</span>
                <input
                  type="url"
                  name="gitHubUrl"
                  value={formData.gitHubUrl || ''}
                  onChange={handleInputChange}
                  placeholder="https://github.com/your-handle"
                  className="w-full pl-10 pr-3 py-3 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-slate-800/20 focus:outline-none focus:border-slate-800 focus:bg-white transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Skills Section */}
        <div className="space-y-4 pt-4 border-t border-gray-100">
          <h4 className="text-md font-bold text-gray-900 flex items-center gap-2">
            <span className="material-symbols-outlined text-astu-green">grade</span>
            Technical & Soft Skills
          </h4>

          <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 space-y-4">
            <div className="flex flex-wrap gap-2">
              {formData.skills.map((skill) => (
                <span
                  key={skill}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white border border-gray-200 rounded-full text-sm font-semibold text-gray-700 shadow-sm"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="w-4 h-4 rounded-full flex items-center justify-center text-xs text-gray-400 hover:bg-gray-100 hover:text-astu-red"
                  >
                    <span className="material-symbols-outlined text-xs">close</span>
                  </button>
                </span>
              ))}
              {formData.skills.length === 0 && (
                <p className="text-sm text-gray-500 italic">No skills added yet. Add skills to boost job recommendations.</p>
              )}
            </div>

            <div className="flex gap-2 max-w-md">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="e.g. React, Docker, Python, System Design"
                className="flex-1 text-sm p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-astu-navy/20 focus:outline-none focus:border-astu-navy transition-all"
              />
              <button
                type="button"
                onClick={handleAddSkill}
                className="px-5 bg-astu-navy hover:bg-astu-navy/90 text-white rounded-xl font-semibold flex items-center gap-1.5 transition-colors"
              >
                <span className="material-symbols-outlined text-lg">add</span> Add
              </button>
            </div>
          </div>
        </div>

        {/* Resume Section */}
        <div className="space-y-4 pt-4 border-t border-gray-100">
          <h4 className="text-md font-bold text-gray-900 flex items-center gap-2">
            <span className="material-symbols-outlined text-astu-red">description</span>
            Professional Resume / CV
          </h4>

          {formData.resume ? (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 bg-gradient-to-r from-red-50/40 via-white to-white border border-red-100 rounded-2xl">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-red-100 text-astu-red rounded-xl">
                  <span className="material-symbols-outlined text-3xl">picture_as_pdf</span>
                </div>
                <div>
                  <h5 className="font-bold text-gray-900">{formData.resume.fileName}</h5>
                  <p className="text-xs text-gray-500">Size: {formData.resume.fileSize} • Uploaded on {formData.resume.uploadedAt}</p>
                </div>
              </div>
              <div className="flex gap-3 mt-4 sm:mt-0 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => toast.success('Mock download started!')}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 border border-gray-200 hover:bg-gray-50 rounded-xl text-sm font-semibold text-gray-700 transition-colors"
                >
                  <span className="material-symbols-outlined text-lg">download</span> Download
                </button>
                <button
                  type="button"
                  onClick={handleRemoveResume}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 border border-red-200 hover:bg-red-50 rounded-xl text-sm font-semibold text-astu-red transition-colors"
                >
                  <span className="material-symbols-outlined text-lg">delete</span> Delete
                </button>
              </div>
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center hover:border-astu-navy/50 transition-colors relative cursor-pointer group">
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleMockResumeUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={isUploading}
              />
              <div className="space-y-3">
                <div className="mx-auto w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 group-hover:bg-astu-navy/10 group-hover:text-astu-navy transition-colors">
                  <span className="material-symbols-outlined text-3xl">upload_file</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">
                    {isUploading ? 'Uploading resume...' : 'Click or Drag file to upload resume'}
                  </p>
                  <p className="text-xs text-gray-500">PDF, DOC, or DOCX formats up to 5MB</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </form>
    </div>
  );
};
