import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { CandidateApplication } from '../types/employer.types';

interface CandidateProfileModalProps {
  candidate: CandidateApplication;
  onClose: () => void;
  darkMode: boolean;
  onMessageCandidate?: (candidate: CandidateApplication) => void;
  onUpdateStatus?: (applicationId: number, status: CandidateApplication['status']) => void;
  showStatusControls?: boolean;
}

export const CandidateProfileModal: React.FC<CandidateProfileModalProps> = ({
  candidate,
  onClose,
  darkMode,
  onMessageCandidate,
  onUpdateStatus,
  showStatusControls = true,
}) => {
  const UPLOAD_BASE = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const getFullUrl = (url?: string) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    if (url.startsWith('/')) return `${UPLOAD_BASE}${url}`;
    return `${UPLOAD_BASE}/${url}`;
  };

  const handleDownloadCV = (alumnusName: string, fileName?: string, cvUrl?: string) => {
    if (cvUrl) {
      window.open(getFullUrl(cvUrl), '_blank');
      toast.success(`Opening CV for ${alumnusName}`);
    } else {
      toast.success(`Simulated CV Download: "${fileName || 'resume.pdf'}" saved for ${alumnusName}.`);
    }
  };

  const getStatusBadge = (status: CandidateApplication['status']) => {
    switch (status) {
      case 'Accepted':
      case 'Hired':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Rejected':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'Shortlisted':
      case 'Interviewed':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Reviewed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Pending':
      default:
        return 'bg-amber-100 text-amber-800 border-amber-200';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm lg:pl-64">
      <div className={`w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh] ${
        darkMode ? 'bg-slate-900 border border-slate-700 text-white' : 'bg-white text-gray-900'
      }`}>
        {/* Modal Header */}
        <div className="flex justify-between items-center p-4 sm:p-6 border-b border-gray-150/50">
          <div className="flex items-center gap-3 sm:gap-4">
            <img
              src={candidate.alumnusAvatar ? getFullUrl(candidate.alumnusAvatar) : `https://ui-avatars.com/api/?name=${encodeURIComponent(candidate.alumnusName)}&background=003366&color=ffffff&bold=true`}
              onError={(e) => {
                e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(candidate.alumnusName)}&background=003366&color=ffffff&bold=true`;
              }}
              alt={candidate.alumnusName}
              className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl object-cover border-2 border-[#003366]/20 shadow-md shrink-0"
            />
            <div>
              <h3 className="text-lg sm:text-2xl font-extrabold text-[#003366] flex flex-wrap items-center gap-1.5 sm:gap-2">
                {candidate.alumnusName}
                <span className="text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-[#003366] uppercase">
                  ID: {candidate.studentId || 'N/A'}
                </span>
              </h3>
              <p className={`text-xs sm:text-sm mt-0.5 font-medium ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                {candidate.jobTitle !== 'Unknown Position' ? (
                  <>Applying for <span className="text-[#1a5c3a] font-bold">{candidate.jobTitle}</span> • <span className="text-xs">{candidate.appliedDate}</span></>
                ) : (
                  <><span className="text-[#1a5c3a] font-bold">{candidate.department}</span> • Class of {candidate.graduationYear}</>
                )}
              </p>

              {/* Social Links Bar */}
              {candidate.socialLinks && (
                <div className="flex items-center gap-3 mt-2 text-xs">
                  {candidate.socialLinks.linkedin && (
                    <a href={getFullUrl(candidate.socialLinks.linkedin)} target="_blank" rel="noreferrer" className="text-blue-600 font-bold hover:underline flex items-center gap-0.5">
                      🔗 LinkedIn
                    </a>
                  )}
                  {candidate.socialLinks.github && (
                    <a href={getFullUrl(candidate.socialLinks.github)} target="_blank" rel="noreferrer" className="text-gray-700 dark:text-slate-300 font-bold hover:underline flex items-center gap-0.5">
                      💻 GitHub
                    </a>
                  )}
                  {candidate.socialLinks.website && (
                    <a href={getFullUrl(candidate.socialLinks.website)} target="_blank" rel="noreferrer" className="text-emerald-600 font-bold hover:underline flex items-center gap-0.5">
                      🌐 Portfolio
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
            <svg className="w-6 h-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        
        {/* Scrollable Content Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6">
          
          {/* Grid 1: Personal Info & Academic Record */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Personal Information */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#003366] flex items-center gap-1.5">
                <span>👤</span> Personal Information
              </h4>
              <div className={`p-4 rounded-xl border space-y-2.5 text-xs ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-gray-50 border-gray-100'}`}>
                <div className="flex justify-between border-b border-gray-200/40 pb-1.5">
                  <span className="text-gray-500 font-medium">Email Address</span>
                  <span className="font-bold text-gray-900 dark:text-white">{candidate.alumnusEmail}</span>
                </div>
                <div className="flex justify-between border-b border-gray-200/40 pb-1.5">
                  <span className="text-gray-500 font-medium">Phone Number</span>
                  <span className="font-bold text-gray-900 dark:text-white">{candidate.phone || 'N/A'}</span>
                </div>
                <div className="flex justify-between border-b border-gray-200/40 pb-1.5">
                  <span className="text-gray-500 font-medium">Student ID / Batch</span>
                  <span className="font-bold text-gray-900 dark:text-white">{candidate.studentId || 'N/A'}</span>
                </div>
                <div className="flex justify-between border-b border-gray-200/40 pb-1.5">
                  <span className="text-gray-500 font-medium">Nationality</span>
                  <span className="font-bold text-gray-900 dark:text-white">{candidate.nationality || 'Ethiopian'}</span>
                </div>
                <div className="flex justify-between border-b border-gray-200/40 pb-1.5">
                  <span className="text-gray-500 font-medium">Gender</span>
                  <span className="font-bold text-gray-900 dark:text-white">{candidate.gender || 'N/A'}</span>
                </div>
                <div className="flex justify-between border-b border-gray-200/40 pb-1.5">
                  <span className="text-gray-500 font-medium">Languages</span>
                  <span className="font-bold text-gray-900 dark:text-white">{candidate.languages?.join(', ') || 'English, Amharic'}</span>
                </div>
                <div className="flex justify-between border-b border-gray-200/40 pb-1.5">
                  <span className="text-gray-500 font-medium">Current Address</span>
                  <span className="font-bold text-gray-900 dark:text-white">{candidate.currentAddress && candidate.currentAddress !== 'N/A' ? candidate.currentAddress : 'Adama, Oromia, Ethiopia'}</span>
                </div>
                {candidate.volunteerWork && candidate.volunteerWork !== 'N/A' && (
                  <div className="pt-1">
                    <span className="text-gray-500 font-medium block mb-1">Volunteer & Community Work</span>
                    <p className="text-gray-700 dark:text-slate-300 italic bg-white dark:bg-slate-900 p-2 rounded-lg border border-gray-200/60">{candidate.volunteerWork}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Academic Record & Social Profiles */}
            <div className="space-y-6">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#003366] flex items-center gap-1.5 mb-3">
                  <span>🎓</span> Academic Record
                </h4>
                <div className={`p-4 rounded-xl border space-y-2.5 text-xs ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-gray-50 border-gray-100'}`}>
                  <div className="flex justify-between border-b border-gray-200/40 pb-1.5">
                    <span className="text-gray-500 font-medium">Department</span>
                    <span className="font-bold text-gray-900 dark:text-white">{candidate.department}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-200/40 pb-1.5">
                    <span className="text-gray-500 font-medium">Graduation Year</span>
                    <span className="font-bold text-gray-900 dark:text-white">{candidate.graduationYear}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-gray-200/40 pb-1.5">
                    <span className="text-gray-500 font-medium">Authenticated CGPA</span>
                    <span className={`font-extrabold ${candidate.cgpa.includes('Hidden') ? 'text-amber-600 bg-amber-50 px-2 py-0.5 rounded text-[11px] border border-amber-200' : 'text-sm text-[#1a5c3a]'}`}>
                      {candidate.cgpa.includes('Hidden') ? '🔒 Hidden (Privacy Setting)' : candidate.cgpa}
                    </span>
                  </div>
                  {candidate.honors && candidate.honors !== 'N/A' && (
                    <div className="flex justify-between">
                      <span className="text-gray-500 font-medium">Honors & Distinction</span>
                      <span className="font-bold text-amber-600">{candidate.honors}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Social & Professional Profiles */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#003366] flex items-center gap-1.5 mb-3">
                  <span>🌐</span> Social & Professional Profiles
                </h4>
                <div className={`p-4 rounded-xl border space-y-2 text-xs ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-gray-50 border-gray-100'}`}>
                  <div className="flex justify-between items-center border-b border-gray-200/40 pb-1.5">
                    <span className="text-gray-500 font-medium">LinkedIn</span>
                    {candidate.socialLinks?.linkedin ? (
                      <a href={getFullUrl(candidate.socialLinks.linkedin)} target="_blank" rel="noreferrer" className="text-blue-600 font-bold hover:underline truncate max-w-[200px]">
                        {candidate.socialLinks.linkedin}
                      </a>
                    ) : <span className="text-gray-400 italic">Not connected</span>}
                  </div>
                  <div className="flex justify-between items-center border-b border-gray-200/40 pb-1.5">
                    <span className="text-gray-500 font-medium">GitHub</span>
                    {candidate.socialLinks?.github ? (
                      <a href={getFullUrl(candidate.socialLinks.github)} target="_blank" rel="noreferrer" className="text-gray-800 dark:text-slate-200 font-bold hover:underline truncate max-w-[200px]">
                        {candidate.socialLinks.github}
                      </a>
                    ) : <span className="text-gray-400 italic">Not connected</span>}
                  </div>
                  <div className="flex justify-between items-center border-b border-gray-200/40 pb-1.5">
                    <span className="text-gray-500 font-medium">Portfolio Website</span>
                    {candidate.socialLinks?.website ? (
                      <a href={getFullUrl(candidate.socialLinks.website)} target="_blank" rel="noreferrer" className="text-emerald-600 font-bold hover:underline truncate max-w-[200px]">
                        {candidate.socialLinks.website}
                      </a>
                    ) : <span className="text-gray-400 italic">Not connected</span>}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#003366] flex items-center gap-1.5 mb-2">
                  <span>📝</span> Professional Bio
                </h4>
                <div className={`p-3 rounded-xl border text-xs leading-relaxed ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-gray-50 border-gray-100 text-gray-700'}`}>
                  {candidate.bio && candidate.bio !== 'N/A' ? candidate.bio : <span className="italic text-gray-400">No professional bio provided.</span>}
                </div>
              </div>
            </div>

          </div>

          {/* Grid 2: Work History & Experience */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#003366] flex items-center gap-1.5">
              <span>💼</span> Employment & Work Experience
            </h4>
            {candidate.experiences && candidate.experiences.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {candidate.experiences.map((exp, i) => (
                  <div key={i} className={`p-3.5 rounded-xl border space-y-1.5 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-gray-50 border-gray-200/80 shadow-xs'}`}>
                    <div className="flex items-center justify-between">
                      <h5 className="font-bold text-xs text-gray-900 dark:text-white">{exp.title}</h5>
                      {exp.current && <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-700 text-[9px] font-bold rounded">Present</span>}
                    </div>
                    <p className="text-[11px] font-semibold text-[#003366]">{exp.company} {exp.location ? `• ${exp.location}` : ''}</p>
                    <p className="text-[10px] text-gray-400 font-medium">{exp.startDate} - {exp.current ? 'Present' : (exp.endDate || 'N/A')}</p>
                    {exp.description && <p className="text-[11px] text-gray-600 dark:text-slate-300 mt-1 leading-relaxed">{exp.description}</p>}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-3.5 bg-gray-50 dark:bg-slate-800 rounded-xl border border-gray-200/60 text-xs text-gray-600 dark:text-slate-300">
                <span className="font-bold text-gray-900 dark:text-white">Current Placement:</span> Expranced AI Engineer @ INSA Corporation
              </div>
            )}
          </div>

          {/* Grid 3: Projects & Portfolio */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#003366] flex items-center gap-1.5">
              <span>🚀</span> Projects & Portfolio
            </h4>
            {candidate.projects && candidate.projects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {candidate.projects.map((proj, i) => (
                  <div key={i} className={`p-3 rounded-xl border space-y-1.5 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-gray-50 border-gray-100'}`}>
                    <div className="flex items-center justify-between">
                      <h5 className="font-bold text-xs text-gray-900 dark:text-white">{proj.title}</h5>
                      {proj.link && (
                        <a href={getFullUrl(proj.link)} target="_blank" rel="noreferrer" className="text-[10px] font-bold text-blue-600 hover:underline">
                          View Project &rarr;
                        </a>
                      )}
                    </div>
                    {proj.description && <p className="text-[11px] text-gray-600 dark:text-slate-300">{proj.description}</p>}
                    {proj.technologies && proj.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {proj.technologies.map((tech, tIdx) => (
                          <span key={tIdx} className="px-1.5 py-0.5 bg-blue-50 text-blue-700 text-[9px] font-bold rounded">{tech}</span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-3 bg-gray-50 dark:bg-slate-800 rounded-xl border text-xs text-gray-400 italic">No projects listed.</div>
            )}
          </div>

          {/* Grid 4: Skills, Certifications & Achievements */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Technical & Soft Skills */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#003366] flex items-center gap-1.5">
                <span>⚡</span> Technical & Soft Skills
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {candidate.skills && candidate.skills.length > 0 ? candidate.skills.map(skill => (
                  <span key={skill} className={`px-2.5 py-1 text-xs font-bold rounded-lg border ${
                    darkMode ? 'bg-slate-800 text-slate-300 border-slate-700' : 'bg-white text-[#003366] border-blue-200 shadow-2xs'
                  }`}>{skill}</span>
                )) : <span className="text-xs text-gray-400 italic">No skills listed.</span>}
              </div>
            </div>

            {/* Certifications & Achievements */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#003366] flex items-center gap-1.5">
                <span>📜</span> Certifications & Achievements
              </h4>
              {((candidate.certifications && candidate.certifications.length > 0) || (candidate.achievements && candidate.achievements.length > 0)) ? (
                <div className="space-y-2">
                  {candidate.certifications?.map((cert, cIdx) => (
                    <div key={cIdx} className="p-2 bg-gray-50 dark:bg-slate-800 rounded-lg border text-xs flex justify-between items-center">
                      <div>
                        <span className="font-bold text-gray-900 dark:text-white block">{cert.title}</span>
                        <span className="text-[10px] text-gray-500">{cert.issuer} {cert.issueDate ? `• ${cert.issueDate}` : ''}</span>
                      </div>
                      {cert.credentialUrl && (
                        <button
                          type="button"
                          onClick={() => setPreviewImage(getFullUrl(cert.credentialUrl))}
                          className="text-[10px] font-extrabold text-blue-600 bg-blue-50 dark:bg-slate-800 px-2 py-1 rounded hover:bg-blue-100 dark:hover:bg-slate-700 transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <span>🔍</span> Verify & View
                        </button>
                      )}
                    </div>
                  ))}
                  {candidate.achievements?.map((ach, aIdx) => (
                    <div key={aIdx} className="p-2 bg-amber-50/60 dark:bg-slate-800 rounded-lg border border-amber-200/60 text-xs">
                      <span className="font-bold text-amber-900 dark:text-amber-300 block">🏆 {ach.title}</span>
                      <span className="text-[10px] text-amber-700 dark:text-amber-400">{ach.issuer} {ach.description ? `• ${ach.description}` : ''}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3 bg-gray-50 dark:bg-slate-800 rounded-xl border text-xs text-gray-400 italic">No certifications or achievements listed.</div>
              )}
            </div>

          </div>

          {/* Grid 5: Application Materials & Cover Letter */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#003366] flex items-center gap-1.5 mb-2">
                <span>📄</span> Professional Resume / CV
              </h4>
              <button
                onClick={() => handleDownloadCV(candidate.alumnusName, candidate.cvFileName, candidate.resumeUrl)}
                className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${
                  darkMode ? 'bg-slate-800 hover:bg-slate-700 border-slate-700' : 'bg-white hover:bg-gray-50 border-gray-200 shadow-sm hover:shadow'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                    <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold">{candidate.cvFileName || `${candidate.alumnusName.replace(/\s+/g, '_')}_Resume.pdf`}</p>
                    <p className="text-xs text-gray-500">Official Curriculum Vitae</p>
                  </div>
                </div>
                <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              </button>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#003366] flex items-center gap-1.5 mb-2">
                <span>✉️</span> Cover Letter
              </h4>
              <div className={`p-4 rounded-xl border h-28 overflow-y-auto text-xs leading-relaxed ${
                darkMode ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-gray-50 border-gray-100 text-gray-700'
              }`}>
                {candidate.coverLetter ? candidate.coverLetter : <span className="italic text-gray-400">No cover letter provided.</span>}
              </div>
            </div>
          </div>

        </div>

        {/* Action Footer */}
        <div className={`p-4 sm:p-6 border-t flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 ${
          darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-gray-50 border-gray-100'
        }`}>
          <div className="flex items-center gap-3">
            {showStatusControls && (
              <>
                <span className="text-xs sm:text-sm font-medium text-gray-500">Current Status:</span>
                <span className={`px-3 py-1 border rounded-full text-xs font-bold ${getStatusBadge(candidate.status)}`}>
                  {candidate.status}
                </span>
              </>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                if (onMessageCandidate) onMessageCandidate(candidate);
                onClose();
              }}
              className="flex-1 sm:flex-initial px-4 py-2 bg-[#003366] text-white rounded-xl text-xs sm:text-sm font-bold hover:bg-[#002244] transition-colors flex items-center justify-center gap-1.5 shadow-sm"
            >
              💬 Message Candidate
            </button>

            {showStatusControls && onUpdateStatus && (
              <>
                <select 
                  className={`flex-1 sm:flex-initial text-xs sm:text-sm rounded-xl border px-3 py-2 font-semibold cursor-pointer outline-none ${
                    darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-gray-300 text-gray-800'
                  }`}
                  value=""
                  onChange={(e) => {
                    if (e.target.value) {
                      onUpdateStatus(candidate.id, e.target.value as CandidateApplication['status']);
                    }
                  }}
                >
                  <option value="" disabled>Update Status...</option>
                  <option value="Reviewed">Mark as Reviewed</option>
                  <option value="Shortlisted">Shortlist</option>
                  <option value="Interviewed">Schedule Interview</option>
                  <option value="Hired">Offer / Hire</option>
                  <option value="Rejected">Reject</option>
                </select>
                
                {candidate.status !== 'Hired' && (
                  <button
                    onClick={() => {
                      onUpdateStatus(candidate.id, 'Hired');
                    }}
                    className="flex-1 sm:flex-initial px-4 sm:px-5 py-2 bg-[#1a5c3a] hover:bg-[#134d2f] text-white rounded-xl text-xs sm:text-sm font-extrabold transition-colors shadow-md"
                  >
                    Hire Candidate
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Certificate Image Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md lg:pl-64" onClick={() => setPreviewImage(null)}>
          <div className="relative max-w-3xl max-h-[90vh] bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-2xl flex flex-col items-center gap-3 overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="w-full flex justify-between items-center pb-3 border-b border-gray-200 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <span className="text-lg">📜</span>
                <h4 className="text-sm font-extrabold text-[#003366] dark:text-blue-400">Verified Certificate Document</h4>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={previewImage}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1 bg-blue-50 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-blue-200"
                >
                  ↗ Open Full Image
                </a>
                <button
                  onClick={() => setPreviewImage(null)}
                  className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg text-gray-500 font-bold text-sm"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="w-full max-h-[75vh] overflow-auto flex items-center justify-center bg-gray-950/5 rounded-xl p-3">
              <img
                src={previewImage}
                alt="Certificate Preview"
                className="max-h-[70vh] max-w-full object-contain rounded-lg shadow-md border border-gray-200 dark:border-slate-800"
                onError={(e) => {
                  toast.error('Failed to load certificate image.');
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
