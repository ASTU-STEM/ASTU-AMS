import {
  BarChart3,
  Briefcase,
  Award,
  ShieldCheck,
  Sparkles,
  MapPinned,
  HeartHandshake,
  Layers,
} from 'lucide-react';

export type AnalyticsPageTab =
  | 'overview'
  | 'employment'
  | 'skills'
  | 'operations'
  | 'innovation'
  | 'geography'
  | 'engagement'
  | 'all';

export interface TabConfig {
  id: AnalyticsPageTab;
  label: string;
  shortLabel: string;
  icon: any;
  badge: string;
  category: string;
  description: string;
}

export const ANALYTICS_PAGE_TABS: TabConfig[] = [
  {
    id: 'overview',
    label: 'Executive Overview',
    shortLabel: 'Overview',
    icon: BarChart3,
    badge: 'Core KPIs',
    category: 'High-Level Metrics',
    description: 'High-level institutional outcomes, employment trajectories, 2027 AI predictive forecasts, and top hiring partners.',
  },
  {
    id: 'employment',
    label: 'Employment & Careers',
    shortLabel: 'Employment',
    icon: Briefcase,
    badge: 'Trajectories',
    category: 'Department & Compensation',
    description: 'Department-level employment rates, multi-year performance matrix, salary tier distributions, and time-to-hire velocity.',
  },
  {
    id: 'skills',
    label: 'Skills & Employer Feedback',
    shortLabel: 'Skills & Feedback',
    icon: Award,
    badge: 'Competencies',
    category: 'Curriculum & Industry',
    description: 'Spider radar competency scores, missing skill gap analysis, in-demand technical skills, and corporate partner ratings.',
  },
  {
    id: 'operations',
    label: 'Institutional SLA & Operations',
    shortLabel: 'Operations & SLA',
    icon: ShieldCheck,
    badge: 'Registrar & Desk',
    category: 'Administrative Telemetry',
    description: 'Registrar student batch import telemetry, official document request SLA turnaround, support desk performance, and accreditation.',
  },
  {
    id: 'innovation',
    label: 'National Impact & Innovation',
    shortLabel: 'Innovation',
    icon: Sparkles,
    badge: '50 Domains',
    category: 'National STEM Strategy',
    description: '50 modern out-of-the-box institutional innovation analyses, policy alignment radar, workforce velocity, and research migration.',
  },
  {
    id: 'geography',
    label: 'Geographic Mobility & Map',
    shortLabel: 'Geography',
    icon: MapPinned,
    badge: 'Interactive Map',
    category: 'Regional & Global',
    description: 'Interactive geographic placement map across Ethiopian industrial hubs and global diaspora destinations.',
  },
  {
    id: 'engagement',
    label: 'Engagement, Mentorship & Giving',
    shortLabel: 'Engagement',
    icon: HeartHandshake,
    badge: 'Community',
    category: 'Alumni Network',
    description: 'Alumni community financial giving campaigns, ROI multiplier, mentorship program velocity, forum sentiment, and network completeness.',
  },
  {
    id: 'all',
    label: 'All Modules (Audit View)',
    shortLabel: 'All Modules',
    icon: Layers,
    badge: 'Comprehensive',
    category: 'Full Institutional Audit',
    description: 'Comprehensive single-scroll view of all 150+ metrics and suites, optimized for executive briefings, exports, and printing.',
  },
];

export const getTabForIndicator = (category: string, id: string): AnalyticsPageTab => {
  const cat = (category || '').toLowerCase();
  const lowerId = (id || '').toLowerCase();
  if (cat.includes('geographic') || cat.includes('mobility') || cat.includes('regional')) return 'geography';
  if (cat.includes('skill') || cat.includes('competenc') || cat.includes('mou') || cat.includes('partner') || cat.includes('employer')) return 'skills';
  if (cat.includes('sla') || cat.includes('registrar') || cat.includes('document') || cat.includes('support') || cat.includes('accreditation') || cat.includes('operations')) return 'operations';
  if (cat.includes('mentorship') || cat.includes('giving') || cat.includes('donation') || cat.includes('forum') || cat.includes('community') || cat.includes('profile')) return 'engagement';
  if (cat.includes('innovation') || cat.includes('policy') || cat.includes('patent') || cat.includes('research') || lowerId.startsWith('ind-')) return 'innovation';
  if (cat.includes('employment') || cat.includes('salary') || cat.includes('cgpa') || cat.includes('matrix')) return 'employment';
  return 'overview';
};

export type DepartmentFilter = string;

export const generateAcademicYears = (): string[] => {
  const years: string[] = ['All Time'];
  const currentYear = new Date().getFullYear();
  for (let y = currentYear + 1; y >= 2000; y--) {
    const nextYY = String(y + 1).slice(-2);
    years.push(`${y}-${nextYY}`);
  }
  return years;
};

export const academicYears = generateAcademicYears();
export const exportOptions = ['PDF', 'Excel', 'CSV'];

export function heatColor(value: number): string {
  if (value >= 80) return 'bg-[#E24B4A] text-white';
  if (value >= 65) return 'bg-[#EF9F27] text-white';
  if (value >= 50) return 'bg-[#E8A020] text-white';
  if (value >= 35) return 'bg-[#9ACD6B] text-white';
  return 'bg-[#1D9E75] text-white';
}

export interface AdvancedFilterState {
  academicYear: string;
  department: DepartmentFilter;
  degreeLevel: string;
  cgpaTier: string;
  employmentStatus: string;
  industrySector: string;
  salaryTier: string;
  workLocation: string;
  verificationStatus: string;
  hasResume: boolean;
  hasLinkedIn: boolean;
}

export const DEFAULT_FILTERS: AdvancedFilterState = {
  academicYear: 'All Time',
  department: 'All',
  degreeLevel: 'All',
  cgpaTier: 'All',
  employmentStatus: 'All',
  industrySector: 'All',
  salaryTier: 'All',
  workLocation: 'All',
  verificationStatus: 'All',
  hasResume: false,
  hasLinkedIn: false,
};

export interface IncludedSuitesState {
  kpi: boolean;
  yoyForecast: boolean;
  suite1: boolean;
  suite2: boolean;
  suite3: boolean;
  suite4: boolean;
  suite5: boolean;
  suite6: boolean;
  suite7: boolean;
  suite8: boolean;
  domain1: boolean;
  domain2: boolean;
  domain3: boolean;
  domain4: boolean;
  domain5: boolean;
}

export const DEFAULT_SUITES_SELECTION: IncludedSuitesState = {
  kpi: true,
  yoyForecast: true,
  suite1: true,
  suite2: true,
  suite3: true,
  suite4: true,
  suite5: true,
  suite6: true,
  suite7: true,
  suite8: true,
  domain1: true,
  domain2: true,
  domain3: true,
  domain4: true,
  domain5: true,
};

export const SUITES_METADATA = [
  {
    group: 'Executive Core Metrics',
    items: [
      { key: 'kpi', label: 'Executive KPI Cards & Totals', count: '4 Cards' },
      { key: 'yoyForecast', label: 'YoY Rate Comparison & 2027 AI Predictive Forecast Model', count: 'Historical & Predictive' },
    ],
  },
  {
    group: '78 Report Center Analytics Suites (Suites 1–8)',
    items: [
      { key: 'suite1', label: 'Suite 1: University-Industry & Corporate MoU Analysis', count: '10 Analyses' },
      { key: 'suite2', label: 'Suite 2: Multi-Year Department Performance Matrix', count: '10 Analyses' },
      { key: 'suite3', label: 'Suite 3: Registrar Batch Import & Data Integrity Audit', count: '10 Analyses' },
      { key: 'suite4', label: 'Suite 4: Document Request Fulfillment Response SLA', count: '10 Analyses' },
      { key: 'suite5', label: 'Suite 5: Platform Active User Engagement & Account Audit', count: '10 Analyses' },
      { key: 'suite6', label: 'Suite 6: Digital Profile & Identity Verification Suite', count: '10 Analyses' },
      { key: 'suite7', label: 'Suite 7: Institutional SLA & Operations Suite', count: '10 Analyses' },
      { key: 'suite8', label: 'Suite 8: Academic Performance & Degree Outcome Suite', count: '8 Analyses' },
    ],
  },
  {
    group: '50 Executive Innovation Domains (Out-of-the-Box Analyses)',
    items: [
      { key: 'domain1', label: 'Domain 1: National Economic & Strategic Impact Matrix', count: '10 Analyses' },
      { key: 'domain2', label: 'Domain 2: Institutional Curriculum & Skills Readiness Radar', count: '10 Analyses' },
      { key: 'domain3', label: 'Domain 3: Global Career & Postgraduate Mobility Trends', count: '10 Analyses' },
      { key: 'domain4', label: 'Domain 4: Alumni Startup Ecosystem & Patent Velocity', count: '10 Analyses' },
      { key: 'domain5', label: 'Domain 5: Industry Partnership & Internship Outcomes', count: '10 Analyses' },
    ],
  },
];

export const CITY_COORDINATES: Record<string, [number, number]> = {
  'addis ababa': [8.9806, 38.7578],
  'adama': [8.5400, 39.2700],
  'nazret': [8.5400, 39.2700],
  'oromya/nekemte': [9.0833, 36.5500],
  'nekemte': [9.0833, 36.5500],
  'oromiya': [8.5400, 39.2700],
  'hawassa': [7.0500, 38.4667],
  'dire dawa': [9.6000, 41.8667],
  'bahir dar': [11.5833, 37.3833],
  'gondar': [12.6000, 37.4667],
  'mekelle': [13.4967, 39.4769],
  'jimma': [7.6667, 36.8333],
  'bishoftu': [8.7500, 38.9833],
  'ethiopian': [9.0000, 38.7500],
  'ethiopia': [9.0000, 38.7500],
  'remote': [8.9806, 38.7578],
};
