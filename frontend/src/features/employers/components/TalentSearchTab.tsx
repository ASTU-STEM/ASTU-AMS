import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { employerService } from '../services/employer.service';
import { CandidateApplication } from '../types';
import { CandidateProfileModal } from './CandidateProfileModal';

interface TalentSearchTabProps {
  darkMode: boolean;
  onSelectChatTarget?: (target: { userId?: string; alumniId?: string; name: string }) => void;
}

export const TalentSearchTab: React.FC<TalentSearchTabProps> = ({ darkMode, onSelectChatTarget }) => {
  const UPLOAD_BASE = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedYear, setSelectedYear] = useState('All');
  const [minCgpa, setMinCgpa] = useState('0.0');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(12);
  const [totalCount, setTotalCount] = useState(0);
  
  const [alumniData, setAlumniData] = useState<CandidateApplication[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedProfileAlumni, setSelectedProfileAlumni] = useState<CandidateApplication | null>(null);

  // Message Modal State
  const [messageModalOpen, setMessageModalOpen] = useState(false);
  const [selectedAlumniForMessage, setSelectedAlumniForMessage] = useState<CandidateApplication | null>(null);
  const [messageContent, setMessageContent] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  const departments = ['All', 'Computer Science and Engineering', 'Electrical and Computer Engineering', 'Mechanical and Vehicle Engineering'];
  const years = ['All', '2024', '2023', '2022', '2021'];

  useEffect(() => {
    const fetchTalent = async () => {
      setIsLoading(true);
      try {
        const filters = {
          query: searchQuery,
          department: selectedDept === 'All' ? '' : selectedDept,
          graduationYear: selectedYear === 'All' ? '' : selectedYear,
          minimumCgpa: parseFloat(minCgpa),
          skills: [],
          page,
          limit: pageSize,
        };
        const results = await employerService.searchTalent(filters);
        setAlumniData(results);
        setTotalCount((results as any).totalCount || results.length);
      } catch (error: any) {
        toast.error('Failed to load talent data');
      } finally {
        setIsLoading(false);
      }
    };
    
    const timeoutId = setTimeout(() => {
      fetchTalent();
    }, 400);
    
    return () => clearTimeout(timeoutId);
  }, [searchQuery, selectedDept, selectedYear, minCgpa, page, pageSize]);

  const handleRequestCv = async (alumni: CandidateApplication) => {
    try {
      await employerService.requestCvFromAlumni(alumni.id.toString());
      toast.success(`CV Request & Email Notice sent to ${alumni.alumnusName}!`);
    } catch (err: any) {
      toast.error('Failed to request CV. Please try again.');
    }
  };

  const handleOpenMessageModal = (alumni: CandidateApplication) => {
    if (onSelectChatTarget) {
      onSelectChatTarget({
        alumniId: alumni.id.toString(),
        userId: (alumni as any).userId || alumni.id.toString(),
        name: alumni.alumnusName
      });
    } else {
      setSelectedAlumniForMessage(alumni);
      setMessageContent('');
      setMessageModalOpen(true);
    }
  };

  const handleSendMessage = async () => {
    if (!selectedAlumniForMessage || !messageContent.trim()) {
      toast.error('Please enter a message.');
      return;
    }
    
    setIsSendingMessage(true);
    try {
      await employerService.sendDirectMessage(selectedAlumniForMessage.id.toString(), messageContent);
      toast.success(`Message sent successfully to ${selectedAlumniForMessage.alumnusName}.`);
      setMessageModalOpen(false);
    } catch (err: any) {
      toast.error('Failed to send message. Please try again.');
    } finally {
      setIsSendingMessage(false);
    }
  };

  return (
    <div className="space-y-6 relative">
      
      {/* Search Filter Controls Card */}
      <div className={`p-6 border rounded-3xl shadow-sm transition-all duration-300 ${
        darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-gray-200/60 text-gray-900'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <span className="material-symbols-outlined text-astu-navy font-bold">person_search</span>
            Verified Talent Directory Search
          </h3>

          {/* View Mode Toggle Controls */}
          <div className="flex items-center gap-1 bg-[var(--bg-page)] dark:bg-slate-800 p-1 rounded-xl border border-[var(--border-color)] dark:border-slate-700 self-start sm:self-auto">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-slate-700 text-[#003366] dark:text-white shadow-xs'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] dark:hover:text-white'
              }`}
              title="Grid View"
            >
              <span className="material-symbols-outlined text-sm">grid_view</span>
              Grid
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-slate-700 text-[#003366] dark:text-white shadow-xs'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] dark:hover:text-white'
              }`}
              title="List View"
            >
              <span className="material-symbols-outlined text-sm">view_list</span>
              List
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative md:col-span-1">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">search</span>
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search skills, names, cities..."
              className={`w-full pl-10 pr-3 py-2.5 text-xs rounded-xl border focus:outline-none focus:ring-2 focus:ring-astu-navy/20 ${
                darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-800'
              }`}
            />
          </div>

          <div>
            <select
              value={selectedDept}
              onChange={e => setSelectedDept(e.target.value)}
              className={`w-full p-2.5 text-xs rounded-xl border focus:outline-none font-semibold ${
                darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-800'
              }`}
            >
              <option value="All">All Departments</option>
              {departments.filter(d => d !== 'All').map(d => (
                <option key={d} value={d}>{d.split(' ')[0]} Engineering</option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={selectedYear}
              onChange={e => setSelectedYear(e.target.value)}
              className={`w-full p-2.5 text-xs rounded-xl border focus:outline-none font-semibold ${
                darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-800'
              }`}
            >
              <option value="All">All Grad Years</option>
              {years.filter(y => y !== 'All').map(y => (
                <option key={y} value={y}>Class of {y}</option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={minCgpa}
              onChange={e => setMinCgpa(e.target.value)}
              className={`w-full p-2.5 text-xs rounded-xl border focus:outline-none font-semibold ${
                darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-800'
              }`}
            >
              <option value="0.0">Minimum CGPA (All)</option>
              <option value="3.5">CGPA &ge; 3.5 (Distinction)</option>
              <option value="3.75">CGPA &ge; 3.75 (High Honor)</option>
              <option value="3.9">CGPA &ge; 3.90</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid or List Display of Filtered Alumni */}
      {isLoading ? (
        <div className="flex justify-center p-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#003366] border-t-transparent"></div>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {alumniData.map((alum) => (
            <div
              key={alum.id}
              className={`p-6 border rounded-3xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between ${
                darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-gray-200/60 text-gray-900'
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <img 
                    src={alum.alumnusAvatar ? (alum.alumnusAvatar.startsWith('http') ? alum.alumnusAvatar : `${UPLOAD_BASE}${alum.alumnusAvatar}`) : `https://ui-avatars.com/api/?name=${encodeURIComponent(alum.alumnusName)}&background=003366&color=ffffff&bold=true`}
                    onError={(e) => {
                      e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(alum.alumnusName)}&background=003366&color=ffffff&bold=true`;
                    }}
                    alt={alum.alumnusName} 
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-astu-navy/20"
                  />
                  <div>
                    <h4 className="font-bold text-base text-[var(--text-primary)] dark:text-white">{alum.alumnusName}</h4>
                    <p className="text-xs text-astu-navy font-bold">{alum.department}</p>
                    <p className={`text-[11px] mt-0.5 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                      Class of {alum.graduationYear} • CGPA: <span className={`font-bold ${alum.cgpa.includes('Hidden') ? 'text-orange-500 bg-orange-50 px-1.5 py-0.5 rounded text-[10px]' : 'text-astu-green'}`}>{alum.cgpa}</span>
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {alum.skills && alum.skills.map(s => (
                    <span key={s} className="px-2.5 py-1 bg-[var(--bg-page)] dark:bg-slate-800 border border-[var(--border-color)] dark:border-slate-700 text-[10px] font-bold text-[var(--text-secondary)] dark:text-slate-300 rounded-lg">
                      {s}
                    </span>
                  ))}
                </div>

                <div className="flex justify-between items-center text-xs pt-1 text-[var(--text-muted)] dark:text-slate-400">
                  <span>Contact: <strong className="text-[var(--text-primary)] dark:text-slate-200">{alum.alumnusEmail}</strong></span>
                  <span>Applied Date: <strong className="text-[var(--text-primary)] dark:text-slate-200">{alum.appliedDate}</strong></span>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-[var(--border-color)] dark:border-slate-800 flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedProfileAlumni(alum)}
                  className="flex-1 py-2 px-3 bg-[#003366]/10 border border-[#003366]/20 text-[#003366] dark:text-blue-300 dark:bg-blue-900/30 rounded-xl text-xs font-bold hover:bg-[#003366] hover:text-white transition-all flex items-center justify-center gap-1"
                >
                  👁️ See Profile
                </button>
                <button
                  onClick={() => handleOpenMessageModal(alum)}
                  className="flex-1 py-2 px-3 bg-astu-navy text-white rounded-xl text-xs font-bold hover:bg-astu-navy/90 transition-all flex items-center justify-center gap-1"
                >
                  💬 Send Message
                </button>
                <button
                  onClick={() => handleRequestCv(alum)}
                  className="py-2 px-3 border border-[var(--border-color)] dark:border-slate-700 rounded-xl text-xs font-bold hover:bg-[var(--bg-page)] dark:hover:bg-slate-800 text-[var(--text-secondary)] dark:text-slate-300 transition-colors"
                >
                  📄 Request CV
                </button>
              </div>
            </div>
          ))}
          {alumniData.length === 0 && (
            <div className={`col-span-2 p-12 text-center italic ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>
              No graduates matching your search criteria.
            </div>
          )}
        </div>
      ) : (
        /* LIST VIEW */
        <div className={`border rounded-2xl sm:rounded-3xl shadow-sm overflow-hidden ${
          darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-gray-200/60 text-gray-900'
        }`}>
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className={`border-b text-xs font-bold uppercase tracking-wider ${
                  darkMode ? 'border-slate-800 text-slate-400 bg-slate-800/40' : 'border-gray-150 text-gray-400 bg-gray-50/50'
                }`}>
                  <th className="py-4 px-6">Graduate</th>
                  <th className="py-4 px-4">Department & Year</th>
                  <th className="py-4 px-4">CGPA</th>
                  <th className="py-4 px-4">Top Skills</th>
                  <th className="py-4 px-4">Contact</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)] dark:divide-slate-800 text-xs">
                {alumniData.map((alum) => (
                  <tr key={alum.id} className="hover:bg-[var(--bg-page)] dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <img 
                          src={alum.alumnusAvatar ? (alum.alumnusAvatar.startsWith('http') ? alum.alumnusAvatar : `${UPLOAD_BASE}${alum.alumnusAvatar}`) : `https://ui-avatars.com/api/?name=${encodeURIComponent(alum.alumnusName)}&background=003366&color=ffffff&bold=true`}
                          onError={(e) => {
                            e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(alum.alumnusName)}&background=003366&color=ffffff&bold=true`;
                          }}
                          alt={alum.alumnusName} 
                          className="w-10 h-10 rounded-xl object-cover border border-[var(--border-color)] shrink-0"
                        />
                        <div>
                          <p className="font-bold text-sm text-[var(--text-primary)] dark:text-white">{alum.alumnusName}</p>
                          <p className="text-[10px] text-[var(--text-muted)]">ID: {alum.studentId || 'N/A'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <p className="font-bold text-[#003366] dark:text-blue-400">{alum.department}</p>
                      <p className="text-[var(--text-muted)] font-medium">Class of {alum.graduationYear}</p>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`font-extrabold ${alum.cgpa.includes('Hidden') ? 'text-amber-600 bg-amber-50 px-2 py-0.5 rounded text-[10px]' : 'text-emerald-700 font-bold text-sm'}`}>
                        {alum.cgpa}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {alum.skills && alum.skills.slice(0, 3).map(s => (
                          <span key={s} className="px-2 py-0.5 bg-[var(--bg-page)] dark:bg-slate-800 text-[10px] font-bold text-[var(--text-secondary)] dark:text-slate-300 rounded">
                            {s}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="font-medium text-[var(--text-secondary)] dark:text-slate-300">{alum.alumnusEmail}</span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedProfileAlumni(alum)}
                          className="px-3 py-1.5 bg-[#003366]/10 border border-[#003366]/20 text-[#003366] dark:text-blue-300 rounded-lg text-xs font-extrabold hover:bg-[#003366] hover:text-white transition-all flex items-center gap-1"
                        >
                          👁️ See Profile
                        </button>
                        <button
                          onClick={() => handleOpenMessageModal(alum)}
                          className="px-3 py-1.5 bg-astu-navy text-white rounded-lg text-xs font-bold hover:bg-astu-navy/90 transition-all"
                        >
                          💬 Message
                        </button>
                        <button
                          onClick={() => handleRequestCv(alum)}
                          className="px-3 py-1.5 border border-[var(--border-color)] dark:border-slate-700 rounded-lg text-xs font-bold hover:bg-[var(--bg-page)] text-[var(--text-secondary)] dark:text-slate-300 transition-colors"
                        >
                          Request CV
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {alumniData.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-12 text-center italic text-[var(--text-muted)]">
                      No graduates matching your search criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Card List View (For small screens) */}
          <div className="block md:hidden p-4 space-y-4">
            {alumniData.map((alum) => (
              <div
                key={alum.id}
                className={`p-4 rounded-2xl border flex flex-col gap-3 ${
                  darkMode ? 'bg-slate-800/80 border-slate-700' : 'bg-gray-50/70 border-gray-200/80'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img 
                      src={alum.alumnusAvatar ? (alum.alumnusAvatar.startsWith('http') ? alum.alumnusAvatar : `${UPLOAD_BASE}${alum.alumnusAvatar}`) : `https://ui-avatars.com/api/?name=${encodeURIComponent(alum.alumnusName)}&background=003366&color=ffffff&bold=true`}
                      onError={(e) => {
                        e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(alum.alumnusName)}&background=003366&color=ffffff&bold=true`;
                      }}
                      alt={alum.alumnusName} 
                      className="w-12 h-12 rounded-xl object-cover border border-[var(--border-color)] shrink-0"
                    />
                    <div>
                      <p className="font-extrabold text-sm text-[var(--text-primary)] dark:text-white">{alum.alumnusName}</p>
                      <p className="text-xs text-[#003366] dark:text-blue-400 font-bold">{alum.department}</p>
                    </div>
                  </div>
                  <span className={`font-extrabold ${alum.cgpa.includes('Hidden') ? 'text-amber-600 bg-amber-50 px-2 py-0.5 rounded text-[10px]' : 'text-emerald-700 font-bold text-xs'}`}>
                    CGPA: {alum.cgpa}
                  </span>
                </div>

                <div className="flex justify-between items-center text-xs text-[var(--text-muted)] pt-1 border-t border-[var(--border-color)] dark:border-slate-700">
                  <span>Class of <strong>{alum.graduationYear}</strong></span>
                  <span className="truncate max-w-[170px]"><strong>{alum.alumnusEmail}</strong></span>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-[var(--border-color)] dark:border-slate-700">
                  <button
                    onClick={() => setSelectedProfileAlumni(alum)}
                    className="flex-1 py-2 bg-[#003366] text-white rounded-xl text-xs font-bold hover:bg-[#002244] transition-colors flex items-center justify-center gap-1 shadow-xs"
                  >
                    👁️ See Profile
                  </button>
                  <button
                    onClick={() => handleOpenMessageModal(alum)}
                    className="flex-1 py-2 bg-[#003366]/10 border border-[#003366]/20 text-[#003366] dark:text-blue-300 dark:bg-blue-900/30 rounded-xl text-xs font-bold flex items-center justify-center gap-1"
                  >
                    💬 Message
                  </button>
                </div>
              </div>
            ))}
            {alumniData.length === 0 && (
              <div className="py-8 text-center italic text-[var(--text-muted)] text-xs">No graduates matching your search criteria.</div>
            )}
          </div>

          {/* Pagination Controls Footer */}
          {totalCount > 0 && (
            <div className={`px-6 py-4 border-t flex flex-col sm:flex-row items-center justify-between gap-4 text-xs ${
              darkMode ? 'border-slate-800 bg-slate-900/60 text-slate-400' : 'border-gray-150 bg-gray-50/50 text-gray-500'
            }`}>
              <div>
                Showing <strong className="text-[var(--text-primary)] dark:text-white">{Math.min((page - 1) * pageSize + 1, totalCount)}</strong> to <strong className="text-[var(--text-primary)] dark:text-white">{Math.min(page * pageSize, totalCount)}</strong> of <strong className="text-astu-navy dark:text-blue-400 font-bold">{totalCount}</strong> Verified ASTU Alumni
              </div>

              <div className="flex items-center gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  className="px-3 py-1.5 rounded-lg border font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[var(--bg-page)] dark:hover:bg-slate-800 transition-colors"
                >
                  &larr; Previous
                </button>
                <span className="font-extrabold px-2">
                  Page {page} of {Math.ceil(totalCount / pageSize) || 1}
                </span>
                <button
                  disabled={page >= Math.ceil(totalCount / pageSize)}
                  onClick={() => setPage(p => p + 1)}
                  className="px-3 py-1.5 rounded-lg border font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[var(--bg-page)] dark:hover:bg-slate-800 transition-colors"
                >
                  Next &rarr;
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Candidate Profile Details Modal */}
      {selectedProfileAlumni && (
        <CandidateProfileModal
          candidate={selectedProfileAlumni}
          onClose={() => setSelectedProfileAlumni(null)}
          darkMode={darkMode}
          onMessageCandidate={(alum) => handleOpenMessageModal(alum)}
          showStatusControls={false}
        />
      )}

      {/* Message Modal */}
      {messageModalOpen && selectedAlumniForMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className={`w-full max-w-md p-6 rounded-3xl shadow-xl ${darkMode ? 'bg-slate-900 text-white' : 'bg-white text-gray-900'}`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Message {selectedAlumniForMessage.alumnusName}</h3>
              <button 
                onClick={() => setMessageModalOpen(false)}
                className="text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold mb-1 opacity-70">Message Content</label>
                <textarea
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                  placeholder="Type your direct message here... Start an internal conversation!"
                  className={`w-full p-3 text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-astu-navy/20 min-h-[120px] resize-none ${
                    darkMode ? 'bg-slate-800 border-slate-700' : 'bg-gray-50 border-gray-200'
                  }`}
                />
              </div>
              
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setMessageModalOpen(false)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                    darkMode ? 'hover:bg-slate-800' : 'hover:bg-gray-100'
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendMessage}
                  disabled={isSendingMessage}
                  className="px-6 py-2 bg-astu-navy text-white rounded-xl text-xs font-bold hover:bg-astu-navy/90 transition-all flex items-center gap-2 disabled:opacity-70"
                >
                  {isSendingMessage ? (
                    <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  ) : (
                    <span className="material-symbols-outlined text-[16px]">send</span>
                  )}
                  Send Email
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

