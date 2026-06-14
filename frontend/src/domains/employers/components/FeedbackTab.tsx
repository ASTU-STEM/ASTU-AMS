import React, { useState, useMemo } from 'react';
import { GraduateFeedback } from '../types/employer.types';
import toast from 'react-hot-toast';
import { Download, Search, Star, TrendingUp, Users, Award } from 'lucide-react';

interface FeedbackTabProps {
  feedbacks: GraduateFeedback[];
  onSubmitFeedback: (feedback: Omit<GraduateFeedback, 'id' | 'createdAt'>) => void;
  darkMode: boolean;
}

export const FeedbackTab: React.FC<FeedbackTabProps> = ({ feedbacks, onSubmitFeedback, darkMode }) => {
  const [formData, setFormData] = useState({
    alumnusName: '',
    department: 'Computer Science and Engineering',
    technicalSkill: 7,
    communicationSkill: 7,
    leadershipSkill: 7,
    teamworkSkill: 7,
    problemSolvingSkill: 7,
    feedbackText: ''
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'rating'>('recent');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.alumnusName.trim() || !formData.feedbackText.trim()) {
      toast.error('Please complete the feedback comments and select graduate names.');
      return;
    }

    onSubmitFeedback({
      alumnusName: formData.alumnusName,
      department: formData.department,
      technicalSkill: formData.technicalSkill,
      communicationSkill: formData.communicationSkill,
      leadershipSkill: formData.leadershipSkill,
      teamworkSkill: formData.teamworkSkill,
      problemSolvingSkill: formData.problemSolvingSkill,
      feedbackText: formData.feedbackText
    });

    setFormData({
      alumnusName: '',
      department: 'Computer Science and Engineering',
      technicalSkill: 7,
      communicationSkill: 7,
      leadershipSkill: 7,
      teamworkSkill: 7,
      problemSolvingSkill: 7,
      feedbackText: ''
    });

    toast.success('Thank you! Graduate feedback submitted to ASTU Academic Board.');
  };

  const filteredFeedbacks = useMemo(() => {
    let result = [...feedbacks];

    if (searchQuery) {
      result = result.filter(fb =>
        (fb.alumnusName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (fb.feedbackText || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (fb.department || '').toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedDepartment !== 'all') {
      result = result.filter(fb => fb.department === selectedDepartment);
    }

    if (sortBy === 'rating') {
      result.sort((a, b) => {
        const avgA = (a.technicalSkill + a.communicationSkill + a.leadershipSkill + a.teamworkSkill + a.problemSolvingSkill) / 5;
        const avgB = (b.technicalSkill + b.communicationSkill + b.leadershipSkill + b.teamworkSkill + b.problemSolvingSkill) / 5;
        return avgB - avgA;
      });
    }

    return result;
  }, [feedbacks, searchQuery, selectedDepartment, sortBy]);

  const stats = useMemo(() => {
    if (feedbacks.length === 0) {
      return {
        avgOverall: 0,
        avgTechnical: 0,
        avgCommunication: 0,
        avgLeadership: 0,
        avgTeamwork: 0,
        avgProblemSolving: 0,
        totalFeedbacks: 0,
        topDepartment: 'N/A'
      };
    }

    const total = feedbacks.length;
    const avgOverall = feedbacks.reduce((sum, fb) =>
      sum + (fb.technicalSkill + fb.communicationSkill + fb.leadershipSkill + fb.teamworkSkill + fb.problemSolvingSkill) / 5, 0) / total;

    const deptCounts: Record<string, { count: number; total: number }> = {};
    feedbacks.forEach(fb => {
      const dept = fb.department || 'Unknown';
      if (!deptCounts[dept]) {
        deptCounts[dept] = { count: 0, total: 0 };
      }
      deptCounts[dept].count++;
      deptCounts[dept].total += (fb.technicalSkill + fb.communicationSkill + fb.leadershipSkill + fb.teamworkSkill + fb.problemSolvingSkill) / 5;
    });

    let topDept = '';
    let topAvg = 0;
    Object.entries(deptCounts).forEach(([dept, data]) => {
      const avg = data.total / data.count;
      if (avg > topAvg) {
        topAvg = avg;
        topDept = dept;
      }
    });

    return {
      avgOverall: avgOverall.toFixed(2),
      avgTechnical: (feedbacks.reduce((sum, fb) => sum + fb.technicalSkill, 0) / total).toFixed(2),
      avgCommunication: (feedbacks.reduce((sum, fb) => sum + fb.communicationSkill, 0) / total).toFixed(2),
      avgLeadership: (feedbacks.reduce((sum, fb) => sum + fb.leadershipSkill, 0) / total).toFixed(2),
      avgTeamwork: (feedbacks.reduce((sum, fb) => sum + fb.teamworkSkill, 0) / total).toFixed(2),
      avgProblemSolving: (feedbacks.reduce((sum, fb) => sum + fb.problemSolvingSkill, 0) / total).toFixed(2),
      totalFeedbacks: total,
      topDepartment: topDept || 'N/A'
    };
  }, [feedbacks]);

  const departments = useMemo(() => {
    const depts = new Set(feedbacks.map(fb => fb.department).filter(Boolean));
    return ['all', ...Array.from(depts)];
  }, [feedbacks]);

  const handleExport = () => {
    const csvContent = 'data:text/csv;charset=utf-8,'
      + 'Graduate Name,Department,Technical Skill,Communication,Leadership,Teamwork,Problem Solving,Average Rating,Comments,Created At\n'
      + feedbacks.map(fb => {
        const avg = ((fb.technicalSkill + fb.communicationSkill + fb.leadershipSkill + fb.teamworkSkill + fb.problemSolvingSkill) / 5).toFixed(2);
        return `"${fb.alumnusName || ''}","${fb.department || ''}",${fb.technicalSkill},${fb.communicationSkill},${fb.leadershipSkill},${fb.teamworkSkill},${fb.problemSolvingSkill},${avg},"${(fb.feedbackText || '').replace(/"/g, '""')}","${fb.createdAt || ''}"`;
      }).join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `graduate_feedback_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('Feedback data exported successfully!');
  };

  const renderStarRating = (key: 'technicalSkill' | 'communicationSkill' | 'leadershipSkill' | 'teamworkSkill' | 'problemSolvingSkill') => {
    return (
      <div className="flex gap-0.5 mt-1">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((val) => (
          <button
            key={val}
            type="button"
            onClick={() => setFormData(prev => ({ ...prev, [key]: val }))}
            className={`text-amber-400 focus:outline-none transition-transform hover:scale-110 ${val <= formData[key] ? 'opacity-100' : 'opacity-30'}`}
          >
            <span className="material-symbols-outlined font-bold text-sm">star</span>
          </button>
        ))}
      </div>
    );
  };

  const getMetricAverage = (fb: GraduateFeedback) => {
    return ((fb.technicalSkill + fb.communicationSkill + fb.leadershipSkill + fb.teamworkSkill + fb.problemSolvingSkill) / 5).toFixed(1);
  };

  return (
    <div className="space-y-8">

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200/60'}`}>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-lg bg-astu-navy/10">
              <Award className="w-4 h-4 text-astu-navy" />
            </div>
            <span className="text-[10px] font-semibold text-gray-500">Overall</span>
          </div>
          <p className="text-2xl font-extrabold text-astu-navy">{stats.avgOverall}</p>
          <p className="text-[10px] text-gray-500">/ 10.0 average</p>
        </div>

        <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200/60'}`}>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/10">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
            </div>
            <span className="text-[10px] font-semibold text-gray-500">Technical</span>
          </div>
          <p className="text-2xl font-extrabold text-emerald-600">{stats.avgTechnical}</p>
          <p className="text-[10px] text-gray-500">/ 10.0 average</p>
        </div>

        <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200/60'}`}>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-lg bg-blue-500/10">
              <Users className="w-4 h-4 text-blue-500" />
            </div>
            <span className="text-[10px] font-semibold text-gray-500">Teamwork</span>
          </div>
          <p className="text-2xl font-extrabold text-blue-600">{stats.avgTeamwork}</p>
          <p className="text-[10px] text-gray-500">/ 10.0 average</p>
        </div>

        <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200/60'}`}>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-lg bg-purple-500/10">
              <Star className="w-4 h-4 text-purple-500" />
            </div>
            <span className="text-[10px] font-semibold text-gray-500">Communication</span>
          </div>
          <p className="text-2xl font-extrabold text-purple-600">{stats.avgCommunication}</p>
          <p className="text-[10px] text-gray-500">/ 10.0 average</p>
        </div>

        <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200/60'}`}>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-lg bg-amber-500/10">
              <Award className="w-4 h-4 text-amber-500" />
            </div>
            <span className="text-[10px] font-semibold text-gray-500">Leadership</span>
          </div>
          <p className="text-2xl font-extrabold text-amber-600">{stats.avgLeadership}</p>
          <p className="text-[10px] text-gray-500">/ 10.0 average</p>
        </div>

        <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200/60'}`}>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-lg bg-rose-500/10">
              <TrendingUp className="w-4 h-4 text-rose-500" />
            </div>
            <span className="text-[10px] font-semibold text-gray-500">Total</span>
          </div>
          <p className="text-2xl font-extrabold text-rose-600">{stats.totalFeedbacks}</p>
          <p className="text-[10px] text-gray-500">feedbacks</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        <div className="lg:col-span-1">
          <form
            onSubmit={handleSubmit}
            className={`p-6 border rounded-3xl shadow-sm transition-all duration-300 space-y-5 ${darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-gray-200/60 text-gray-900'
              }`}
          >
            <div>
              <h3 className="text-lg font-bold">Submit Graduate Audit</h3>
              <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>Rate hired ASTU graduates to assist academic curriculum quality audits</p>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider">Hired Graduate Name</label>
              <input
                type="text"
                value={formData.alumnusName}
                onChange={e => setFormData(prev => ({ ...prev, alumnusName: e.target.value }))}
                placeholder="e.g. Abebe Bikila"
                className={`w-full text-xs p-2.5 rounded-xl border focus:outline-none ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-gray-50 border-gray-250 text-gray-800'
                  }`}
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider">Department</label>
              <select
                value={formData.department}
                onChange={e => setFormData(prev => ({ ...prev, department: e.target.value }))}
                className={`w-full text-xs p-2.5 rounded-xl border focus:outline-none font-semibold ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-gray-50 border-gray-250 text-gray-800'
                  }`}
              >
                <option value="Computer Science and Engineering">Computer Science and Engineering</option>
                <option value="Electrical and Computer Engineering">Electrical and Computer Engineering</option>
                <option value="Mechanical and Vehicle Engineering">Mechanical and Vehicle Engineering</option>
              </select>
            </div>

            <div className="space-y-3 pt-2 border-t border-gray-150">
              {[
                { key: 'technicalSkill' as const, label: 'Technical & Practical Skills' },
                { key: 'communicationSkill' as const, label: 'Professional Communication' },
                { key: 'leadershipSkill' as const, label: 'Leadership Qualities' },
                { key: 'teamworkSkill' as const, label: 'Teamwork & Collaboration' },
                { key: 'problemSolvingSkill' as const, label: 'Analytical Problem-Solving' }
              ].map(metric => (
                <div key={metric.key} className="flex justify-between items-center bg-gray-50/5 p-2 rounded-xl border border-gray-100/5">
                  <span className="text-xs font-semibold">{metric.label}</span>
                  {renderStarRating(metric.key)}
                </div>
              ))}
            </div>

            <div className="space-y-1 pt-2 border-t border-gray-150">
              <label className="text-[10px] font-bold uppercase tracking-wider">Academic Recommendations</label>
              <textarea
                value={formData.feedbackText}
                onChange={e => setFormData(prev => ({ ...prev, feedbackText: e.target.value }))}
                placeholder="Highlight any tools, frameworks, or syllabus improvements required..."
                className={`w-full text-xs p-2.5 rounded-xl border focus:outline-none h-20 resize-none ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-gray-50 border-gray-250 text-gray-800'
                  }`}
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-astu-navy text-white rounded-xl text-xs font-extrabold uppercase tracking-wider hover:scale-102 transition-all shadow-md"
            >
              Submit Feedback Audit
            </button>
          </form>
        </div>

        <div className="lg:col-span-2">
          <div className={`p-6 border rounded-3xl shadow-sm transition-all duration-300 space-y-6 ${darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-gray-200/60 text-gray-900'
            }`}>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="text-lg font-bold">Submitted Quality Feedback</h3>
                <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>Review structured graduate audits transmitted to ASTU Quality Assurance Dean</p>
              </div>
              <button
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2 bg-astu-navy text-white rounded-xl text-xs font-bold hover:bg-astu-navy/90 transition-all"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search feedback..."
                  className={`w-full pl-10 pr-4 py-2 text-xs rounded-xl border focus:outline-none focus:ring-2 focus:ring-astu-navy/20 ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-800'
                    }`}
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className={`px-3 py-2 text-xs rounded-xl border focus:outline-none focus:ring-2 focus:ring-astu-navy/20 ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-800'
                    }`}
                >
                  {departments.map(dept => (
                    <option key={dept} value={dept}>
                      {dept === 'all' ? 'All Departments' : dept}
                    </option>
                  ))}
                </select>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'recent' | 'rating')}
                  className={`px-3 py-2 text-xs rounded-xl border focus:outline-none focus:ring-2 focus:ring-astu-navy/20 ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-800'
                    }`}
                >
                  <option value="recent">Most Recent</option>
                  <option value="rating">Highest Rated</option>
                </select>
              </div>
            </div>

<div className="space-y-4">
                {filteredFeedbacks.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-sm text-gray-500">No feedback found matching your criteria.</p>
                  </div>
                ) : (
                  filteredFeedbacks.map((fb) => (
                    <div
                      key={fb.id}
                      className={`p-5 border rounded-2xl bg-gradient-to-br transition-all ${darkMode ? 'from-slate-800 to-slate-900 border-slate-700' : 'from-gray-50 to-white border-gray-150'}`}
                    >
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-3">
                        <div>
                          <h4 className="font-bold text-sm">{fb.alumnusName}</h4>
                          <p className="text-xs text-astu-navy font-bold">{fb.department}</p>
                          <span className="text-[10px] text-gray-500 font-semibold">Submitted {fb.createdAt}</span>
                        </div>
                        <div className="text-right">
                          <span className="px-2.5 py-1 bg-amber-100 text-amber-800 font-extrabold rounded-lg text-xs">
                            Avg. Rating: {getMetricAverage(fb)} / 10
                          </span>
                        </div>
                      </div>

                      <p className={`text-xs leading-relaxed italic ${darkMode ? 'text-slate-300' : 'text-gray-600'}`}>
                        &ldquo;{fb.feedbackText}&rdquo;
                      </p>

                      <div className="grid grid-cols-5 gap-2 pt-4 mt-3 border-t border-gray-150 text-[10px] font-bold text-gray-500">
                        <div>Tech: <span className="text-amber-500">{fb.technicalSkill}/10</span></div>
                        <div>Comm: <span className="text-amber-500">{fb.communicationSkill}/10</span></div>
                        <div>Lead: <span className="text-amber-500">{fb.leadershipSkill}/10</span></div>
                        <div>Team: <span className="text-amber-500">{fb.teamworkSkill}/10</span></div>
                        <div>Solve: <span className="text-amber-500">{fb.problemSolvingSkill}/10</span></div>
                      </div>
                    </div>
                  ))
                )}
              </div>
          </div>
        </div>
      </div>
    </div>
  );
};
