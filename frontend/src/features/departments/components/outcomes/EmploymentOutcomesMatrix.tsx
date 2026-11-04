import React, { useState } from 'react';
import { 
  Briefcase, TrendingUp, Clock, Building2, Users, 
  ArrowUpRight, Award, Filter, Download, CheckCircle2 
} from 'lucide-react';

export interface DepartmentPlacement {
  department: string;
  graduatesCount: number;
  placedCount: number;
  placementRate: number;
  avgSalary: string;
  medianTimeToHireMonths: number;
}

export interface CorporatePartner {
  name: string;
  hiresCount: number;
  industry: string;
  tier: 'Strategic' | 'Technology' | 'Research' | 'Recruitment';
}

const DEPT_PLACEMENTS: DepartmentPlacement[] = [
  { department: 'Software Engineering', graduatesCount: 142, placedCount: 134, placementRate: 94.4, avgSalary: '28,500 ETB', medianTimeToHireMonths: 2.1 },
  { department: 'Computer Science', graduatesCount: 120, placedCount: 111, placementRate: 92.5, avgSalary: '27,000 ETB', medianTimeToHireMonths: 2.4 },
  { department: 'Electrical & Electronics', graduatesCount: 165, placedCount: 147, placementRate: 89.1, avgSalary: '24,000 ETB', medianTimeToHireMonths: 3.2 },
  { department: 'Mechanical Engineering', graduatesCount: 150, placedCount: 129, placementRate: 86.0, avgSalary: '22,500 ETB', medianTimeToHireMonths: 3.8 },
  { department: 'Civil Engineering', graduatesCount: 180, placedCount: 149, placementRate: 82.8, avgSalary: '21,000 ETB', medianTimeToHireMonths: 4.1 },
  { department: 'Chemical Engineering', graduatesCount: 95, placedCount: 78, placementRate: 82.1, avgSalary: '20,500 ETB', medianTimeToHireMonths: 4.3 }
];

const TOP_PARTNERS: CorporatePartner[] = [
  { name: 'Ethio Telecom', hiresCount: 52, industry: 'Telecommunications', tier: 'Strategic' },
  { name: 'Commercial Bank of Ethiopia', hiresCount: 44, industry: 'Fintech & Banking', tier: 'Technology' },
  { name: 'Ethiopian Artificial Intelligence Inst.', hiresCount: 29, industry: 'AI & Research', tier: 'Research' },
  { name: 'MIDROC Investment Group', hiresCount: 26, industry: 'Industrial Manufacturing', tier: 'Recruitment' },
  { name: 'Information Network Security Admin', hiresCount: 22, industry: 'Cybersecurity', tier: 'Strategic' },
];

export const EmploymentOutcomesMatrix: React.FC = () => {
  const [selectedBatch, setSelectedBatch] = useState<string>('2024');
  const [deptFilter, setDeptFilter] = useState<string>('All');

  const filteredDepts = DEPT_PLACEMENTS.filter(d => 
    deptFilter === 'All' || d.department.toLowerCase().includes(deptFilter.toLowerCase())
  );

  const totalGrads = DEPT_PLACEMENTS.reduce((acc, d) => acc + d.graduatesCount, 0);
  const totalPlaced = DEPT_PLACEMENTS.reduce((acc, d) => acc + d.placedCount, 0);
  const overallRate = Math.round((totalPlaced / totalGrads) * 1000) / 10;

  return (
    <div className="space-y-6">
      {/* KPI Top Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] p-4 rounded-xl">
          <div className="text-xs uppercase text-[var(--text-secondary)] tracking-wider font-semibold">Overall Placement</div>
          <div className="text-2xl font-bold text-emerald-400 mt-1">{overallRate}%</div>
          <div className="text-xs text-[var(--text-secondary)] mt-1">{totalPlaced} / {totalGrads} Alumni Employed</div>
        </div>
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] p-4 rounded-xl">
          <div className="text-xs uppercase text-[var(--text-secondary)] tracking-wider font-semibold">Median Time-to-Hire</div>
          <div className="text-2xl font-bold text-[#22D3EE] mt-1">2.8 Mo</div>
          <div className="text-xs text-[var(--text-secondary)] mt-1">42% hired within 30 days</div>
        </div>
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] p-4 rounded-xl">
          <div className="text-xs uppercase text-[var(--text-secondary)] tracking-wider font-semibold">Top Hiring Sector</div>
          <div className="text-2xl font-bold text-[#2196F3] mt-1">ICT / Tech</div>
          <div className="text-xs text-[var(--text-secondary)] mt-1">38% of total cohort placements</div>
        </div>
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] p-4 rounded-xl">
          <div className="text-xs uppercase text-[var(--text-secondary)] tracking-wider font-semibold">Corporate Partners</div>
          <div className="text-2xl font-bold text-purple-300 mt-1">{TOP_PARTNERS.length} Tier-1</div>
          <div className="text-xs text-[var(--text-secondary)] mt-1">173 Direct Institutional Hires</div>
        </div>
      </div>

      {/* Main Placement Matrix Table */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl overflow-hidden">
        <div className="p-4 border-b border-[var(--border-color)] flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-[var(--text-primary)]">Graduate Employment Outcomes Matrix</h3>
            <p className="text-xs text-[var(--text-secondary)]">Class of {selectedBatch} longitudinal career velocity and median compensation</p>
          </div>
          <div className="flex gap-2">
            <select
              value={selectedBatch}
              onChange={e => setSelectedBatch(e.target.value)}
              className="bg-[var(--bg-input)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] rounded-lg px-3 py-1.5 focus:outline-none"
            >
              <option value="2024">Batch 2024</option>
              <option value="2023">Batch 2023</option>
              <option value="2022">Batch 2022</option>
            </select>
            <select
              value={deptFilter}
              onChange={e => setDeptFilter(e.target.value)}
              className="bg-[var(--bg-input)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] rounded-lg px-3 py-1.5 focus:outline-none"
            >
              <option value="All">All Engineering Depts</option>
              <option value="Software">Software Engineering</option>
              <option value="Computer">Computer Science</option>
              <option value="Electrical">Electrical & Electronics</option>
              <option value="Mechanical">Mechanical</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[var(--bg-input)] text-[var(--text-secondary)] border-b border-[var(--border-color)] uppercase font-semibold">
              <tr>
                <th className="py-3 px-4">Department / Program</th>
                <th className="py-3 px-4">Graduates</th>
                <th className="py-3 px-4">Placed</th>
                <th className="py-3 px-4">Placement Rate</th>
                <th className="py-3 px-4">Avg Base Salary</th>
                <th className="py-3 px-4">Time to Hire</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)] text-[var(--text-primary)]">
              {filteredDepts.map((d) => (
                <tr key={d.department} className="hover:bg-[var(--bg-hover)] transition-colors">
                  <td className="py-3 px-4 font-medium flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#2196F3]" />
                    {d.department}
                  </td>
                  <td className="py-3 px-4 text-[var(--text-secondary)]">{d.graduatesCount}</td>
                  <td className="py-3 px-4 text-emerald-400 font-semibold">{d.placedCount}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-[var(--bg-page)] h-2 rounded-full overflow-hidden border border-[var(--border-color)]">
                        <div 
                          className="bg-[#2196F3] h-full rounded-full" 
                          style={{ width: `${d.placementRate}%` }} 
                        />
                      </div>
                      <span className="font-semibold">{d.placementRate}%</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-[#22D3EE] font-mono">{d.avgSalary}</td>
                  <td className="py-3 px-4 text-[var(--text-secondary)]">{d.medianTimeToHireMonths} months</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Corporate Hiring Partners */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] p-5 rounded-xl">
        <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-3 flex items-center gap-2">
          <Building2 className="w-4 h-4 text-[#22D3EE]" /> Top Corporate Hiring Partners (Batch {selectedBatch})
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {TOP_PARTNERS.map(partner => (
            <div key={partner.name} className="bg-[var(--bg-input)] border border-[var(--border-color)] p-3 rounded-lg flex flex-col justify-between">
              <div>
                <div className="font-semibold text-xs text-[var(--text-primary)]">{partner.name}</div>
                <div className="text-[11px] text-[var(--text-secondary)]">{partner.industry}</div>
              </div>
              <div className="mt-3 flex items-center justify-between text-xs pt-2 border-t border-[var(--border-color)]">
                <span className="text-[#22D3EE] font-bold">{partner.hiresCount} Hires</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-900/30 text-blue-300 border border-blue-600/30">
                  {partner.tier}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
