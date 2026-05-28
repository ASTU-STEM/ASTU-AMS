import React, { useState } from 'react';
import { GraduateFeedback } from '../types/employer.types';
import toast from 'react-hot-toast';

interface FeedbackTabProps {
  feedbacks: GraduateFeedback[];
  onSubmitFeedback: (feedback: Omit<GraduateFeedback, 'id' | 'submittedAt'>) => void;
  darkMode: boolean;
}

export const FeedbackTab: React.FC<FeedbackTabProps> = ({ feedbacks, onSubmitFeedback, darkMode }) => {
  const [formData, setFormData] = useState({
    alumnusName: '',
    department: 'Computer Science and Engineering',
    technicalSkills: 5,
    communication: 5,
    leadership: 5,
    teamwork: 5,
    problemSolving: 5,
    comments: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.alumnusName.trim() || !formData.comments.trim()) {
      toast.error('Please complete the feedback comments and select graduate names.');
      return;
    }

    onSubmitFeedback({
      alumnusName: formData.alumnusName,
      department: formData.department,
      technicalSkills: formData.technicalSkills,
      communication: formData.communication,
      leadership: formData.leadership,
      teamwork: formData.teamwork,
      problemSolving: formData.problemSolving,
      comments: formData.comments
    });

    setFormData({
      alumnusName: '',
      department: 'Computer Science and Engineering',
      technicalSkills: 5,
      communication: 5,
      leadership: 5,
      teamwork: 5,
      problemSolving: 5,
      comments: ''
    });

    toast.success('Thank you! Graduate feedback submitted to ASTU Academic Board.');
  };

  const renderStarRating = (key: 'technicalSkills' | 'communication' | 'leadership' | 'teamwork' | 'problemSolving') => {
    return (
      <div className="flex gap-1.5 mt-1">
        {[1, 2, 3, 4, 5].map((val) => (
          <button
            key={val}
            type="button"
            onClick={() => setFormData(prev => ({ ...prev, [key]: val }))}
            className="text-amber-400 focus:outline-none transition-transform hover:scale-110"
          >
            <span className="material-symbols-outlined font-bold text-xl">
              {formData[key] >= val ? 'star' : 'star_border'}
            </span>
          </button>
        ))}
      </div>
    );
  };

  const getMetricAverage = (fb: GraduateFeedback) => {
    return ((fb.technicalSkills + fb.communication + fb.leadership + fb.teamwork + fb.problemSolving) / 5).toFixed(1);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      {/* Left: Rating feedback Form */}
      <div className="lg:col-span-1">
        <form
          onSubmit={handleSubmit}
          className={`p-6 border rounded-3xl shadow-sm transition-all duration-300 space-y-5 ${
            darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-gray-200/60 text-gray-900'
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
              className={`w-full text-xs p-2.5 rounded-xl border focus:outline-none ${
                darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-gray-50 border-gray-250 text-gray-800'
              }`}
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider">Department</label>
            <select
              value={formData.department}
              onChange={e => setFormData(prev => ({ ...prev, department: e.target.value }))}
              className={`w-full text-xs p-2.5 rounded-xl border focus:outline-none font-semibold ${
                darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-gray-50 border-gray-250 text-gray-800'
              }`}
            >
              <option value="Computer Science and Engineering">Computer Science and Engineering</option>
              <option value="Electrical and Computer Engineering">Electrical and Computer Engineering</option>
              <option value="Mechanical and Vehicle Engineering">Mechanical and Vehicle Engineering</option>
            </select>
          </div>

          {/* Core rating sliders */}
          <div className="space-y-3 pt-2 border-t border-gray-150">
            {[
              { key: 'technicalSkills' as const, label: 'Technical & Practical Skills' },
              { key: 'communication' as const, label: 'Professional Communication' },
              { key: 'leadership' as const, label: 'Leadership Qualities' },
              { key: 'teamwork' as const, label: 'Teamwork & Collaboration' },
              { key: 'problemSolving' as const, label: 'Analytical Problem-Solving' }
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
              value={formData.comments}
              onChange={e => setFormData(prev => ({ ...prev, comments: e.target.value }))}
              placeholder="Highlight any tools, frameworks, or syllabus improvements required..."
              className={`w-full text-xs p-2.5 rounded-xl border focus:outline-none h-20 resize-none ${
                darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-gray-50 border-gray-250 text-gray-800'
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

      {/* Right: Feedback ledger lists */}
      <div className="lg:col-span-2">
        <div className={`p-6 border rounded-3xl shadow-sm transition-all duration-300 space-y-6 ${
          darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-gray-200/60 text-gray-900'
        }`}>
          <div>
            <h3 className="text-lg font-bold">Submitted Quality Feedback</h3>
            <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>Review structured graduate audits transmitted to ASTU Quality Assurance Dean</p>
          </div>

          <div className="space-y-4">
            {feedbacks.map((fb) => (
              <div
                key={fb.id}
                className={`p-5 border rounded-2xl bg-gradient-to-br transition-all ${
                  darkMode ? 'from-slate-800 to-slate-900 border-slate-700' : 'from-gray-50 to-white border-gray-150'
                }`}
              >
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-3">
                  <div>
                    <h4 className="font-bold text-sm">{fb.alumnusName}</h4>
                    <p className="text-xs text-astu-navy font-bold">{fb.department}</p>
                    <span className="text-[10px] text-gray-500 font-semibold">Submitted {fb.submittedAt}</span>
                  </div>
                  <div className="text-right">
                    <span className="px-2.5 py-1 bg-amber-100 text-amber-800 font-extrabold rounded-lg text-xs">
                      Avg. Rating: {getMetricAverage(fb)} / 5
                    </span>
                  </div>
                </div>

                <p className={`text-xs leading-relaxed italic ${darkMode ? 'text-slate-300' : 'text-gray-600'}`}>
                  "{fb.comments}"
                </p>

                {/* Rating dots */}
                <div className="grid grid-cols-5 gap-2 pt-4 mt-3 border-t border-gray-150 text-[10px] font-bold text-gray-500">
                  <div>Tech: <span className="text-amber-500">{fb.technicalSkills}★</span></div>
                  <div>Comm: <span className="text-amber-500">{fb.communication}★</span></div>
                  <div>Lead: <span className="text-amber-500">{fb.leadership}★</span></div>
                  <div>Team: <span className="text-amber-500">{fb.teamwork}★</span></div>
                  <div>Solve: <span className="text-amber-500">{fb.problemSolving}★</span></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
};
