import React, { useState } from 'react';
import toast from 'react-hot-toast';

interface TalentSearchTabProps {
  darkMode: boolean;
}

export const TalentSearchTab: React.FC<TalentSearchTabProps> = ({ darkMode }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedYear, setSelectedYear] = useState('All');
  const [minCgpa, setMinCgpa] = useState('0.0');

  const departments = ['All', 'Computer Science and Engineering', 'Electrical and Computer Engineering', 'Mechanical and Vehicle Engineering'];
  const years = ['All', '2024', '2023', '2022', '2021'];

  // High fidelity alumni database mock
  const alumniDatabase = [
    {
      id: 1,
      name: 'Abebe Bikila',
      department: 'Computer Science and Engineering',
      year: '2024',
      cgpa: '3.78',
      skills: ['React', 'TypeScript', 'Node.js', 'Express', 'SQL'],
      location: 'Addis Ababa',
      experience: '1 year',
      avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&h=150&q=80'
    },
    {
      id: 2,
      name: 'Tigist Kebede',
      department: 'Electrical and Computer Engineering',
      year: '2023',
      cgpa: '3.65',
      skills: ['Python', 'Django', 'Embedded Systems', 'IoT', 'C++'],
      location: 'Adama',
      experience: '2 years',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&h=150&q=80'
    },
    {
      id: 3,
      name: 'Melkamu Abebe',
      department: 'Computer Science and Engineering',
      year: '2024',
      cgpa: '3.91',
      skills: ['Go', 'Kubernetes', 'Docker', 'AWS', 'Python'],
      location: 'Addis Ababa',
      experience: 'Graduating Student',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80'
    },
    {
      id: 4,
      name: 'Kalkidan Yosef',
      department: 'Computer Science and Engineering',
      year: '2023',
      cgpa: '3.82',
      skills: ['React', 'Redux', 'Python', 'Machine Learning'],
      location: 'Remote',
      experience: '2 years',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80'
    }
  ];

  const filteredAlumni = alumniDatabase.filter((alumnus) => {
    const matchesSearch = 
      alumnus.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alumnus.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase())) ||
      alumnus.location.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDept = selectedDept === 'All' || alumnus.department === selectedDept;
    const matchesYear = selectedYear === 'All' || alumnus.year === selectedYear;
    const matchesCgpa = parseFloat(alumnus.cgpa) >= parseFloat(minCgpa);

    return matchesSearch && matchesDept && matchesYear && matchesCgpa;
  });

  return (
    <div className="space-y-6">
      
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredAlumni.map((alum) => (
          <div
            key={alum.id}
            className={`p-6 border rounded-3xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between ${
              darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-gray-200/60 text-gray-900'
            }`}
          >
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <img 
                  src={alum.avatarUrl} 
                  alt={alum.name} 
                  className="w-16 h-16 rounded-full object-cover border-2 border-astu-navy/20"
                />
                <div>
                  <h4 className="font-bold">{alum.name}</h4>
                  <p className="text-xs text-astu-navy font-bold">{alum.department}</p>
                  <p className={`text-[10px] ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                    Class of {alum.year} • CGPA: <span className="font-bold text-astu-green">{alum.cgpa}</span>
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5 pt-2">
                {alum.skills.map(s => (
                  <span key={s} className="px-2 py-0.5 bg-gray-50 border border-gray-150 text-[10px] font-bold text-gray-600 rounded">
                    {s}
                  </span>
                ))}
              </div>

              <div className="flex justify-between items-center text-xs pt-2">
                <span>Location: <strong>{alum.location}</strong></span>
                <span>Experience: <strong>{alum.experience}</strong></span>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-gray-100 flex gap-2">
              <button
                onClick={() => toast.success(`Simulated recruiter message sent to ${alum.name.split(' ')[0]}!`)}
                className="flex-1 py-2 bg-astu-navy text-white rounded-xl text-xs font-bold hover:bg-astu-navy/90 transition-all hover:scale-102"
              >
                Send Message
              </button>
              <button
                onClick={() => toast.success(`Mock CV requested from ${alum.name}.`)}
                className="flex-1 py-2 border border-gray-200 rounded-xl text-xs font-bold hover:bg-gray-50 text-gray-700 transition-colors"
              >
                Request CV
              </button>
            </div>
          </div>
        ))}
        {filteredAlumni.length === 0 && (
          <div className={`col-span-2 p-12 text-center italic ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>
            No graduates matching your search query.
          </div>
        )}
      </div>

    </div>
  );
};
