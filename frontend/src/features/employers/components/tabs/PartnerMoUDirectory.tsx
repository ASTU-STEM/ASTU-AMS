import React, { useState } from 'react';
import { 
  Building2, ShieldCheck, Calendar, FileText, ExternalLink, 
  Search, Filter, CheckCircle2, AlertCircle, Award, Users, Download
} from 'lucide-react';

export type AccreditationTier = 'Strategic' | 'Technology' | 'Research' | 'Recruitment';

export interface PartnerMoU {
  id: string;
  partnerName: string;
  tier: AccreditationTier;
  mouNumber: string;
  signedDate: string;
  expiryDate: string;
  status: 'Active' | 'Under Review' | 'Pending Renewal';
  scope: string;
  liaisonName: string;
  liaisonEmail: string;
  internshipQuota: number;
  hiredCount: number;
}

const INITIAL_MOUS: PartnerMoU[] = [
  {
    id: 'mou-01',
    partnerName: 'Ethio Telecom Innovation Labs',
    tier: 'Strategic',
    mouNumber: 'ASTU-MOU-2024-001',
    signedDate: '2024-01-15',
    expiryDate: '2027-01-14',
    status: 'Active',
    scope: '5G testbed research, direct campus recruitment pipeline, 50 annual software internships',
    liaisonName: 'Dr. Dawit Bekele',
    liaisonEmail: 'dawit.b@ethiotelecom.et',
    internshipQuota: 50,
    hiredCount: 38,
  },
  {
    id: 'mou-02',
    partnerName: 'Ethiopian Artificial Intelligence Institute',
    tier: 'Research',
    mouNumber: 'ASTU-MOU-2023-089',
    signedDate: '2023-09-01',
    expiryDate: '2026-08-31',
    status: 'Active',
    scope: 'Joint LLM development, NLP for Ethiopian languages, postgraduate fellowships',
    liaisonName: 'Eng. Selamawit Tadesse',
    liaisonEmail: 'selamawit@eaiai.gov.et',
    internshipQuota: 25,
    hiredCount: 19,
  },
  {
    id: 'mou-03',
    partnerName: 'Commercial Bank of Ethiopia (Fintech Hub)',
    tier: 'Technology',
    mouNumber: 'ASTU-MOU-2024-042',
    signedDate: '2024-03-10',
    expiryDate: '2026-03-09',
    status: 'Active',
    scope: 'Core banking cybersecurity validation, mobile financial systems hackathons',
    liaisonName: 'Yared Hailu',
    liaisonEmail: 'yared.h@cbe.com.et',
    internshipQuota: 40,
    hiredCount: 27,
  },
  {
    id: 'mou-04',
    partnerName: 'MIDROC Investment Group - Industrial Div.',
    tier: 'Recruitment',
    mouNumber: 'ASTU-MOU-2022-112',
    signedDate: '2022-11-20',
    expiryDate: '2025-11-19',
    status: 'Pending Renewal',
    scope: 'Mechanical, Mechatronics and Chemical engineering priority graduate hiring',
    liaisonName: 'Bethlehem Girma',
    liaisonEmail: 'bgirma@midroc-corp.com',
    internshipQuota: 30,
    hiredCount: 34,
  },
  {
    id: 'mou-05',
    partnerName: 'Ride / Hybrid Designs Tech',
    tier: 'Technology',
    mouNumber: 'ASTU-MOU-2024-077',
    signedDate: '2024-05-18',
    expiryDate: '2026-05-17',
    status: 'Active',
    scope: 'Geospatial routing algorithms, real-time analytics engineering hiring',
    liaisonName: 'Robel Worku',
    liaisonEmail: 'robel@hybrid.et',
    internshipQuota: 20,
    hiredCount: 14,
  }
];

const TIER_COLORS: Record<AccreditationTier, { bg: string; text: string; border: string }> = {
  Strategic: { bg: 'bg-purple-900/30', text: 'text-purple-300', border: 'border-purple-600/40' },
  Technology: { bg: 'bg-blue-900/30', text: 'text-blue-300', border: 'border-blue-600/40' },
  Research: { bg: 'bg-emerald-900/30', text: 'text-emerald-300', border: 'border-emerald-600/40' },
  Recruitment: { bg: 'bg-amber-900/30', text: 'text-amber-300', border: 'border-amber-600/40' },
};

export const PartnerMoUDirectory: React.FC = () => {
  const [mous] = useState<PartnerMoU[]>(INITIAL_MOUS);
  const [selectedTier, setSelectedTier] = useState<string>('All');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  const filtered = mous.filter(m => {
    const matchTier = selectedTier === 'All' || m.tier === selectedTier;
    const matchStatus = statusFilter === 'All' || m.status === statusFilter;
    const matchSearch = !search || 
      m.partnerName.toLowerCase().includes(search.toLowerCase()) ||
      m.scope.toLowerCase().includes(search.toLowerCase()) ||
      m.mouNumber.toLowerCase().includes(search.toLowerCase());
    return matchTier && matchStatus && matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Metric Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] p-4 rounded-xl">
          <div className="text-xs uppercase text-[var(--text-secondary)] tracking-wider font-semibold">Active MoUs</div>
          <div className="text-2xl font-bold text-[var(--text-primary)] mt-1">
            {mous.filter(m => m.status === 'Active').length}
          </div>
          <div className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> 100% Verified Legal Terms
          </div>
        </div>
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] p-4 rounded-xl">
          <div className="text-xs uppercase text-[var(--text-secondary)] tracking-wider font-semibold">Strategic Partners</div>
          <div className="text-2xl font-bold text-purple-300 mt-1">
            {mous.filter(m => m.tier === 'Strategic').length}
          </div>
          <div className="text-xs text-[var(--text-secondary)] mt-1">Tier 1 Institutional Alliances</div>
        </div>
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] p-4 rounded-xl">
          <div className="text-xs uppercase text-[var(--text-secondary)] tracking-wider font-semibold">Annual Quota</div>
          <div className="text-2xl font-bold text-[#22D3EE] mt-1">
            {mous.reduce((acc, m) => acc + m.internshipQuota, 0)}
          </div>
          <div className="text-xs text-[var(--text-secondary)] mt-1">Dedicated slots reserved</div>
        </div>
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] p-4 rounded-xl">
          <div className="text-xs uppercase text-[var(--text-secondary)] tracking-wider font-semibold">Placements Realized</div>
          <div className="text-2xl font-bold text-emerald-400 mt-1">
            {mous.reduce((acc, m) => acc + m.hiredCount, 0)}
          </div>
          <div className="text-xs text-[var(--text-secondary)] mt-1">Graduates hired via MoUs</div>
        </div>
      </div>

      {/* Control Filters */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] p-4 rounded-xl flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-[var(--text-secondary)] absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search partner, MoU # or scope..."
            className="w-full pl-9 pr-4 py-2 bg-[var(--bg-page)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-primary)] focus:outline-none focus:border-[#2196F3]"
          />
        </div>

        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          {(['All', 'Strategic', 'Technology', 'Research', 'Recruitment'] as const).map(tier => (
            <button
              key={tier}
              onClick={() => setSelectedTier(tier)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                selectedTier === tier
                  ? 'bg-[#2196F3] text-[var(--text-primary)] shadow'
                  : 'bg-[var(--bg-input)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-color)]'
              }`}
            >
              {tier}
            </button>
          ))}
        </div>
      </div>

      {/* MoU Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(mou => {
          const tierStyle = TIER_COLORS[mou.tier];
          return (
            <div 
              key={mou.id} 
              className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-5 hover:border-[#2196F3]/50 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[var(--bg-page)] border border-[var(--border-color)] flex items-center justify-center text-[#22D3EE]">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-[var(--text-primary)] text-base leading-snug">{mou.partnerName}</h3>
                      <div className="text-xs text-[var(--text-secondary)] font-mono">{mou.mouNumber}</div>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-md text-xs font-semibold border ${tierStyle.bg} ${tierStyle.text} ${tierStyle.border}`}>
                    {mou.tier}
                  </span>
                </div>

                <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-4 bg-[var(--bg-page)]/50 p-3 rounded-lg border border-[var(--border-color)]">
                  {mou.scope}
                </p>

                <div className="grid grid-cols-2 gap-2 text-xs text-[var(--text-secondary)] mb-4">
                  <div>
                    <span className="block text-[11px] text-[var(--text-secondary)]/70">Liaison</span>
                    <span className="text-[var(--text-primary)] font-medium">{mou.liaisonName}</span>
                  </div>
                  <div>
                    <span className="block text-[11px] text-[var(--text-secondary)]/70">Validity</span>
                    <span className="text-[var(--text-primary)] font-medium">{mou.signedDate} – {mou.expiryDate}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-[var(--border-color)] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${mou.status === 'Active' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                  <span className="text-xs font-medium text-[var(--text-primary)]">{mou.status}</span>
                </div>
                <div className="text-xs text-[var(--text-secondary)]">
                  Placement Rate: <strong className="text-emerald-400">{Math.round((mou.hiredCount / mou.internshipQuota) * 100)}%</strong>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
