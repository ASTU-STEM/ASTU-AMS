import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { employerService } from '../services/employer.service';
import { CandidateApplication } from '../types';

interface TalentSearchTabProps {
  darkMode: boolean;
  onSelectChatTarget?: (target: { userId?: string; alumniId?: string; name: string }) => void;
}

export const TalentSearchTab: React.FC<TalentSearchTabProps> = ({ darkMode, onSelectChatTarget }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedYear, setSelectedYear] = useState('All');
  const [minCgpa, setMinCgpa] = useState('0.0');
  
  const [alumniData, setAlumniData] = useState<CandidateApplication[]>([]);
  const [isLoading, setIsLoading] = useState(false);

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
          skills: []
        };
        const results = await employerService.searchTalent(filters);
        setAlumniData(results);
      } catch (error: any) {
        toast.error('Failed to load talent data');
      } finally {
        setIsLoading(false);
      }
    };
    
    // Simple debounce
    const timeoutId = setTimeout(() => {
      fetchTalent();
    }, 400);
    
    return () => clearTimeout(timeoutId);
  }, [searchQuery, selectedDept, selectedYear, minCgpa]);

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
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-astu-navy font-bold">person_search</span>
          Verified Talent Directory Search
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative md:col-span-1">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
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

      {/* Grid displaying filtered graduates */}
      {isLoading ? (
        <div className="flex justify-center p-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#003366] border-t-transparent"></div>
        </div>
      ) : (
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
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(alum.alumnusName)}&background=random`}
                    alt={alum.alumnusName} 
                    className="w-16 h-16 rounded-full object-cover border-2 border-astu-navy/20"
                  />
                  <div>
                    <h4 className="font-bold">{alum.alumnusName}</h4>
                    <p className="text-xs text-astu-navy font-bold">{alum.department}</p>
                    <p className={`text-[10px] ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                      Class of {alum.graduationYear} • CGPA: <span className={`font-bold ${alum.cgpa === 'Hidden (Privacy Setting)' ? 'text-orange-500' : 'text-astu-green'}`}>{alum.cgpa}</span>
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-2">
                  {alum.skills && alum.skills.map(s => (
                    <span key={s} className="px-2 py-0.5 bg-gray-50 border border-gray-150 text-[10px] font-bold text-gray-600 rounded">
                      {s}
                    </span>
                  ))}
                </div>

                <div className="flex justify-between items-center text-xs pt-2">
                  <span>Contact: <strong>{alum.alumnusEmail}</strong></span>
                  <span>Applied Date: <strong>{alum.appliedDate}</strong></span>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-gray-100 flex gap-2">
                <button
                  onClick={() => handleOpenMessageModal(alum)}
                  className="flex-1 py-2 bg-astu-navy text-white rounded-xl text-xs font-bold hover:bg-astu-navy/90 transition-all hover:scale-102"
                >
                  Send Message
                </button>
                <button
                  onClick={() => handleRequestCv(alum)}
                  className="flex-1 py-2 border border-gray-200 rounded-xl text-xs font-bold hover:bg-gray-50 text-gray-700 transition-colors"
                >
                  Request CV
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
      )}

      {/* Message Modal */}
      {messageModalOpen && selectedAlumniForMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className={`w-full max-w-md p-6 rounded-3xl shadow-xl ${darkMode ? 'bg-slate-900 text-white' : 'bg-white text-gray-900'}`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Message {selectedAlumniForMessage.alumnusName}</h3>
              <button 
                onClick={() => setMessageModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
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

