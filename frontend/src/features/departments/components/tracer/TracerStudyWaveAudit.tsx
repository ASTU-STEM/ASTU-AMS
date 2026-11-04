import React, { useState } from 'react';
import { 
  FileSpreadsheet, CheckCircle2, AlertTriangle, ArrowUpRight, 
  BookOpen, Sparkles, PieChart, Layers, Download, Check
} from 'lucide-react';

export interface CurriculumFeedbackItem {
  id: string;
  courseCode: string;
  courseTitle: string;
  relevanceScore: number; // 0 - 100
  employerSatisfaction: number; // 0 - 100
  recommendation: 'Retain' | 'Revise Syllabi' | 'Add Lab Practicum' | 'Phase Out';
  status: 'Audited' | 'Under Review' | 'Revision Pending';
}

const INITIAL_AUDIT_DATA: CurriculumFeedbackItem[] = [
  { id: 'cur-1', courseCode: 'CSE-4201', courseTitle: 'Distributed Systems & Cloud Architecture', relevanceScore: 96, employerSatisfaction: 92, recommendation: 'Retain', status: 'Audited' },
  { id: 'cur-2', courseCode: 'CSE-3104', courseTitle: 'Relational Database Management Systems', relevanceScore: 84, employerSatisfaction: 80, recommendation: 'Revise Syllabi', status: 'Revision Pending' },
  { id: 'cur-3', courseCode: 'CSE-4310', courseTitle: 'DevOps & CI/CD Toolchains', relevanceScore: 98, employerSatisfaction: 95, recommendation: 'Add Lab Practicum', status: 'Under Review' },
  { id: 'cur-4', courseCode: 'ECE-3101', courseTitle: 'Microprocessor & Embedded Systems Lab', relevanceScore: 88, employerSatisfaction: 85, recommendation: 'Revise Syllabi', status: 'Revision Pending' },
  { id: 'cur-5', courseCode: 'CSE-2101', courseTitle: 'Legacy Assembly Programming', relevanceScore: 42, employerSatisfaction: 38, recommendation: 'Phase Out', status: 'Under Review' },
];

export const TracerStudyWaveAudit: React.FC = () => {
  const [items] = useState<CurriculumFeedbackItem[]>(INITIAL_AUDIT_DATA);
  const [filter, setFilter] = useState<string>('All');

  const filtered = items.filter(i => filter === 'All' || i.recommendation === filter);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Audited':
        return 'bg-emerald-900/30 text-emerald-300 border-emerald-600/40';
      case 'Revision Pending':
        return 'bg-amber-900/30 text-amber-300 border-amber-600/40';
      case 'Under Review':
        return 'bg-blue-900/30 text-blue-300 border-blue-600/40';
      default:
        return 'bg-[var(--bg-input)] text-[var(--text-secondary)] border-[var(--border-color)]';
    }
  };

  return (
    <div className="space-y-6">
      {/* Wave 3 Telemetry Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] p-4 rounded-xl">
          <div className="text-xs uppercase text-[var(--text-secondary)] tracking-wider font-semibold">Wave 3 Responses</div>
          <div className="text-2xl font-bold text-[var(--text-primary)] mt-1">1,480</div>
          <div className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> 78.4% Cohort Participation
          </div>
        </div>
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] p-4 rounded-xl">
          <div className="text-xs uppercase text-[var(--text-secondary)] tracking-wider font-semibold">Curriculum Relevancy</div>
          <div className="text-2xl font-bold text-[#22D3EE] mt-1">87.6%</div>
          <div className="text-xs text-[var(--text-secondary)] mt-1">Direct industry match</div>
        </div>
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] p-4 rounded-xl">
          <div className="text-xs uppercase text-[var(--text-secondary)] tracking-wider font-semibold">ABET Syllabus Readiness</div>
          <div className="text-2xl font-bold text-emerald-400 mt-1">94.1%</div>
          <div className="text-xs text-[var(--text-secondary)] mt-1">Criteria 3 & 5 compliant</div>
        </div>
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] p-4 rounded-xl">
          <div className="text-xs uppercase text-[var(--text-secondary)] tracking-wider font-semibold">Employer Net Relevancy</div>
          <div className="text-2xl font-bold text-purple-300 mt-1">+68 NPS</div>
          <div className="text-xs text-[var(--text-secondary)] mt-1">Based on 140 corporate reviews</div>
        </div>
      </div>

      {/* Audit Matrix Table */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl overflow-hidden">
        <div className="p-4 border-b border-[var(--border-color)] flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-[var(--text-primary)] flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#2196F3]" />
              Curriculum Audit & Tracer Study Feedback Matrix (Wave 3)
            </h3>
            <p className="text-xs text-[var(--text-secondary)]">
              Alumni survey responses cross-referenced with employer technical competence demands
            </p>
          </div>
          <div className="flex gap-2">
            {(['All', 'Retain', 'Revise Syllabi', 'Add Lab Practicum', 'Phase Out'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  filter === tab
                    ? 'bg-[#2196F3] text-white shadow'
                    : 'bg-[var(--bg-input)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-color)]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[var(--bg-input)] text-[var(--text-secondary)] border-b border-[var(--border-color)] uppercase font-semibold">
              <tr>
                <th className="py-3 px-4">Course</th>
                <th className="py-3 px-4">Alumni Relevance</th>
                <th className="py-3 px-4">Employer Satisfaction</th>
                <th className="py-3 px-4">Recommendation</th>
                <th className="py-3 px-4">Audit Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)] text-[var(--text-primary)]">
              {filtered.map(row => (
                <tr key={row.id} className="hover:bg-[var(--bg-hover)] transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-semibold text-xs text-[var(--text-primary)]">{row.courseTitle}</div>
                    <div className="text-[11px] text-[#22D3EE] font-mono">{row.courseCode}</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-[var(--bg-page)] h-2 rounded-full overflow-hidden border border-[var(--border-color)]">
                        <div 
                          className={`h-full rounded-full ${row.relevanceScore >= 80 ? 'bg-emerald-400' : 'bg-amber-400'}`}
                          style={{ width: `${row.relevanceScore}%` }} 
                        />
                      </div>
                      <span className="font-semibold">{row.relevanceScore}%</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-[var(--bg-page)] h-2 rounded-full overflow-hidden border border-[var(--border-color)]">
                        <div 
                          className={`h-full rounded-full ${row.employerSatisfaction >= 80 ? 'bg-[#2196F3]' : 'bg-red-400'}`}
                          style={{ width: `${row.employerSatisfaction}%` }} 
                        />
                      </div>
                      <span className="font-semibold">{row.employerSatisfaction}%</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-medium text-[var(--text-primary)]">{row.recommendation}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${getStatusBadge(row.status)}`}>
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
