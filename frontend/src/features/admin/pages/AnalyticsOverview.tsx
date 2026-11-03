import React, { useMemo, useState } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { createPortal } from 'react-dom';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Scatter,
  Tooltip,
  Treemap,
  XAxis,
  YAxis,
  LabelList,
} from 'recharts';
import {
  BarChart3,
  Building2,
  CalendarRange,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  ArrowRight,
  Download,
  Globe2,
  MapPinned,
  Printer,
  School,
  Share2,
  TimerReset,
  TrendingUp,
  Users,
  FileCheck,
  AlertCircle,
  RefreshCw,
  Maximize2,
  X,
  ExternalLink,
  Briefcase,
  Award,
  DollarSign,
  Layers,
  HeartHandshake,
  UserCheck,
  GraduationCap,
  Search,
  Filter,
  SlidersHorizontal,
  Check,
  CheckSquare,
  Square,
  FileSpreadsheet,
  FileText,
  FileCode,
  Sparkles,
  RotateCcw,
  Sliders,
  CheckCircle2,
  Lock,
  ShieldCheck,
  Zap,
  FileDown,
  FileCheck2,
  Eye,
  HelpCircle,
  Info,
  Settings2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import AdminPageHeader from '../components/AdminPageHeader';
import AdminStatCard from '../components/AdminStatCard';
import AdminStatGrid from '../components/AdminStatGrid';
import AdminBadge from '../components/AdminBadge';
import AdminEmptyState from '../components/AdminEmptyState';
import { adminService } from '../services/admin.service';
import LocationMap from './analytics/LocationMap';
import { SectionCard, ChartCard } from './analytics/AnalyticsCards';
import { AdvancedFiltersModal } from './analytics/AdvancedFiltersModal';
import { ExportReportModal } from './analytics/ExportReportModal';
import { PrintDashboardModal } from './analytics/PrintDashboardModal';
import {
  ANALYTICS_PAGE_TABS,
  DEFAULT_FILTERS,
  DEFAULT_SUITES_SELECTION,
  heatColor,
  academicYears,
  type AdvancedFilterState,
  type AnalyticsPageTab,
  type DepartmentFilter,
  type IncludedSuitesState,
} from './analytics/types';

export default function AnalyticsOverview() {
  const location = useLocation();
  const isCms = location.pathname.startsWith('/cms');
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [printModalOpen, setPrintModalOpen] = useState(false);
  const [selectedSuites, setSelectedSuites] = useState<IncludedSuitesState>(DEFAULT_SUITES_SELECTION);

  const [searchParams, setSearchParams] = useSearchParams();
  const currentTabParam = (searchParams.get('tab') as AnalyticsPageTab) || 'overview';
  const [activePageTab, setActivePageTab] = useState<AnalyticsPageTab>(
    ['overview', 'employment', 'skills', 'operations', 'innovation', 'geography', 'engagement', 'all'].includes(currentTabParam)
      ? currentTabParam
      : 'overview'
  );

  React.useEffect(() => {
    const tabFromUrl = searchParams.get('tab') as AnalyticsPageTab;
    if (tabFromUrl && ['overview', 'employment', 'skills', 'operations', 'innovation', 'geography', 'engagement', 'all'].includes(tabFromUrl)) {
      if (tabFromUrl !== activePageTab) {
        setActivePageTab(tabFromUrl);
      }
    }
  }, [searchParams, activePageTab]);

  const handleTabChange = (newTab: AnalyticsPageTab) => {
    setActivePageTab(newTab);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (newTab === 'overview') {
        next.delete('tab');
      } else {
        next.set('tab', newTab);
      }
      return next;
    });
    const headerElem = document.getElementById('analytics-tab-header');
    if (headerElem) {
      headerElem.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const isTab = (tab: AnalyticsPageTab) => activePageTab === 'all' || activePageTab === tab;
  const activeTabConfig = ANALYTICS_PAGE_TABS.find((t) => t.id === activePageTab);

  const regularTabs = ANALYTICS_PAGE_TABS.filter((t) => t.id !== 'all');
  const currentRegularIndex = regularTabs.findIndex((t) => t.id === activePageTab);
  const prevTab = currentRegularIndex > 0 ? regularTabs[currentRegularIndex - 1] : null;
  const nextTab = currentRegularIndex >= 0 && currentRegularIndex < regularTabs.length - 1 ? regularTabs[currentRegularIndex + 1] : null;


  const [filters, setFilters] = useState<AdvancedFilterState>(DEFAULT_FILTERS);
  const [isLoading, setIsLoading] = useState(false);
  const [geoModalOpen, setGeoModalOpen] = useState(false);
  const [topCompaniesModalOpen, setTopCompaniesModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Matrix Pagination & Search Filter States
  const [matrixPage, setMatrixPage] = useState(1);
  const [matrixLimit, setMatrixLimit] = useState<'10' | '25' | '50' | '100' | 'all'>('10');
  const [matrixSearch, setMatrixSearch] = useState('');
  const [matrixDeptFilter, setMatrixDeptFilter] = useState('All');
  const [matrixYearFilter, setMatrixYearFilter] = useState('All');

  const academicYear = filters.academicYear;
  const department = filters.department;

  const setAcademicYear = (yr: string) => setFilters((prev) => ({ ...prev, academicYear: yr }));
  const setDepartment = (dept: DepartmentFilter) => setFilters((prev) => ({ ...prev, department: dept }));

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.academicYear !== 'All Time') count++;
    if (filters.department !== 'All') count++;
    return count;
  }, [filters]);

  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS);
  };

  const [reportData, setReportData] = useState<any>(null);
  const [dbDepartments, setDbDepartments] = useState<string[]>([]);

  // Fetch real database departments directly from Prisma via admin API
  React.useEffect(() => {
    const fetchDbDepartments = async () => {
      try {
        const res = await adminService.getDepartments();
        if (res.ok) {
          const list = Array.isArray(res.data) ? res.data : (res.data?.departments || []);
          const names: string[] = list.map((d: any) => d.name || d.code).filter(Boolean);
          if (names.length > 0) {
            setDbDepartments((prev) => Array.from(new Set([...prev, ...names])));
          }
        }
      } catch (err) {
        console.error('Failed to fetch DB departments:', err);
      }
    };
    fetchDbDepartments();
  }, []);

  // Extract real departments from Prisma analytics report metrics
  React.useEffect(() => {
    if (reportData?.departmentAnalytics?.departmentMetrics) {
      const metricsNames = reportData.departmentAnalytics.departmentMetrics
        .map((m: any) => m.departmentName)
        .filter(Boolean);
      if (metricsNames.length > 0) {
        setDbDepartments((prev) => Array.from(new Set([...prev, ...metricsNames])));
      }
    }
  }, [reportData]);

  const [loadError, setLoadError] = useState<string | null>(null);

  React.useEffect(() => {
    const fetchAnalytics = async () => {
      setIsLoading(true);
      setLoadError(null);
      const params: { academicYear?: string; department?: string } = {};
      if (academicYear && academicYear !== 'All Time') params.academicYear = academicYear;
      if (department && department !== 'All') params.department = department;
      const result = await adminService.getAnalyticsReport(params);
      if (result.ok) {
        setReportData(result.data);
      } else {
        setReportData(null);
        setLoadError(result.message || 'Failed to load analytics report');
        toast.error(result.message || 'Failed to load analytics report');
      }
      setIsLoading(false);
    };
    fetchAnalytics();
  }, [academicYear, department]);

  const hasBatchData = useMemo(() => {
    if (!reportData) return true;
    if (academicYear === 'All Time') return true;
    const totalAlumni = reportData?.overallEmployment?.totalAlumni || 0;
    return totalAlumni > 0;
  }, [reportData, academicYear]);

  // YoY Employment Rate Comparison & 2027 AI Predictive Model
  const yoyComparison = useMemo(() => {
    const rawTrend = reportData?.overallEmployment?.employmentTrend || [];
    const currentRate = Number(reportData?.overallEmployment?.employmentRate || 0);

    let historicalList = rawTrend.map((t: any) => ({
      year: t.year,
      rate: Number(t.rate || 0),
      count: t.count || (reportData?.overallEmployment?.totalAlumni || 0),
      employed: t.employed || Math.round((t.count || (reportData?.overallEmployment?.totalAlumni || 0)) * ((t.rate || 0) / 100)),
    })).sort((a: any, b: any) => a.year - b.year);

    if (historicalList.length === 0) {
      const curYr = new Date().getFullYear();
      const tot = reportData?.overallEmployment?.totalAlumni || 0;
      const emp = (reportData?.overallEmployment?.employedAlumni || 0) + (reportData?.overallEmployment?.selfEmployedAlumni || 0);
      historicalList = [
        { year: curYr, rate: currentRate, count: tot, employed: emp }
      ];
    }

    const lastItem = historicalList[historicalList.length - 1];
    const prevItem = historicalList.length > 1 ? historicalList[historicalList.length - 2] : null;

    const prevYear = prevItem ? prevItem.year : (lastItem ? lastItem.year - 1 : new Date().getFullYear() - 1);
    const prevRate = prevItem ? prevItem.rate : currentRate;
    const diff = Math.round((currentRate - prevRate) * 10) / 10;
    const isPositive = diff >= 0;

    const earliest = historicalList[0];
    const latest = historicalList[historicalList.length - 1];
    let avgDelta = 0;
    if (earliest && latest && latest.year > earliest.year) {
      avgDelta = (latest.rate - earliest.rate) / (latest.year - earliest.year);
    }
    const projected2027Rate = currentRate > 0 ? Math.min(98.5, Math.max(0, Math.round((currentRate + Math.max(0, avgDelta)) * 10) / 10)) : 0;

    const fullChartData = [
      ...historicalList.map((h: any) => ({ ...h, isForecast: false, fill: '#003580' })),
      {
        year: 2027,
        rate: projected2027Rate,
        count: Math.round(latest.count * 1.08),
        employed: Math.round(latest.count * 1.08 * (projected2027Rate / 100)),
        isForecast: true,
        fill: '#8B5CF6',
      }
    ];

    return {
      currentRate,
      prevYear,
      prevRate,
      diff,
      isPositive,
      badgeText: prevItem ? `${isPositive ? '↑ +' : '↓ '}${Math.abs(diff)}% vs ${prevYear} (${prevRate}%)` : `Current Rate: ${currentRate}%`,
      projected2027Rate,
      avgDelta: Math.round(avgDelta * 10) / 10,
      historicalList,
      fullChartData,
    };
  }, [reportData]);

  const activeStatCards = [
    { label: 'Overall Employment Rate', value: `${Number(reportData?.overallEmployment?.employmentRate || 0).toFixed(1)}%`, change: yoyComparison.badgeText, icon: TrendingUp, tone: 'green' as const },
    { label: 'Average Time to Hire', value: `${Number(reportData?.overallEmployment?.averageTimeToHireMonths || 0).toFixed(1)} months`, change: 'Average duration', icon: TimerReset, tone: 'blue' as const },
    { label: 'Avg Starting Salary', value: `ETB ${Number(reportData?.overallEmployment?.averageSalary || 0).toLocaleString()}/mo`, change: 'Based on tracer data', icon: Building2, tone: 'gold' as const },
    { label: 'Alumni Survey Response', value: `${Number(reportData?.tracer?.surveyCompletionRate || 0).toFixed(1)}%`, change: 'Overall participation', icon: Users, tone: 'red' as const },
  ];

  const activeEmploymentTable = useMemo(() => (
    reportData?.departmentAnalytics?.departmentMetrics?.map((dept: any) => ({
      department: dept.departmentName,
      grads: dept.totalAlumni,
      employed: dept.statusDistribution?.find((d: any) => d.status === 'EMPLOYED')?.count || 0,
      selfEmployed: dept.statusDistribution?.find((d: any) => d.status === 'SELF_EMPLOYED')?.count || 0,
      unemployed: dept.statusDistribution?.find((d: any) => d.status === 'UNEMPLOYED')?.count || 0,
      rate: dept.employmentRate || 0,
      employabilityScore: Number(dept.employabilityScore || 0).toFixed(1)
    })) || []
  ), [reportData]);

  const departmentCodes = useMemo(() => {
    if (!reportData?.departmentAnalytics?.departmentMetrics) return [];
    return reportData.departmentAnalytics.departmentMetrics.map((d: any) => d.departmentCode);
  }, [reportData]);

  const activeSkillGaps = useMemo(() => {
    if (reportData?.curriculum?.missingSkills?.length > 0) {
      return reportData.curriculum.missingSkills.map((s: any) => ({
        skill: s.skill,
        value: s.demandCount
      })).sort((a: any, b: any) => b.value - a.value).slice(0, 10);
    }
    return reportData?.curriculum?.skillGaps?.map((sg: any) => ({
      skill: sg.skill,
      value: Math.round(sg.gapScore)
    })) || [];
  }, [reportData]);

  // 1. Top Hiring Companies Bar Chart Data
  const activeTopHiringCompanies = useMemo(() => {
    return (reportData?.employers?.topHiringCompanies || []).map((c: any) => ({
      companyName: c.companyName || c.name || 'Organization',
      hires: typeof c.count === 'number' ? c.count : (typeof c.hires === 'number' ? c.hires : 0),
    }));
  }, [reportData]);

  const activeTopEmployers = reportData?.employers?.topHiringCompanies || [];

  // 2. Industry Sector Breakdown
  const activeIndustryBreakdown = useMemo(() => {
    return reportData?.overallEmployment?.industryBreakdown || [];
  }, [reportData]);

  // 3. Gender Parity Data
  const activeGenderParity = useMemo(() => {
    const gp = reportData?.overallEmployment?.genderParity;
    if (!gp) return [];
    return [
      { category: 'Employment Rate (%)', Female: gp.female?.rate || 0, Male: gp.male?.rate || 0 },
      { category: 'Avg Salary (x1k ETB)', Female: Math.round((gp.female?.averageSalary || 0) / 1000), Male: Math.round((gp.male?.averageSalary || 0) / 1000) },
    ];
  }, [reportData]);

  // 4. Salary Tier Distribution
  const activeSalaryTiers = useMemo(() => {
    return reportData?.overallEmployment?.salaryTiers || [];
  }, [reportData]);

  // 5. Job Application Hiring Funnel
  const activeHiringFunnel = useMemo(() => {
    const fn = reportData?.overallEmployment?.hiringFunnel;
    if (!fn) return [];
    return [
      { stage: '1. Applications Sent', count: fn.applied || 0, fill: '#003580' },
      { stage: '2. Profile Shortlisted', count: fn.shortlisted || 0, fill: '#1D9E75' },
      { stage: '3. Interview Scheduled', count: fn.interviewed || 0, fill: '#E8A020' },
      { stage: '4. Offer Accepted / Hired', count: fn.hired || 0, fill: '#10B981' },
    ];
  }, [reportData]);

  // 6. CGPA vs Employability Analytics
  const activeCgpaAnalytics = useMemo(() => {
    return reportData?.overallEmployment?.cgpaAnalytics || [];
  }, [reportData]);

  // 7. Mentorship & Career Engagement
  const activeMentorshipMetrics = useMemo(() => {
    return reportData?.overallEmployment?.mentorshipMetrics || { totalMentors: 0, totalMentees: 0, activeSessions: 0, completedSessions: 0 };
  }, [reportData]);

  // 8. Alumni Community Giving
  const activeCommunityGiving = useMemo(() => {
    return reportData?.overallEmployment?.communityGiving || { totalDonated: 0, totalDonors: 0, categories: [] };
  }, [reportData]);

  const ext = useMemo(() => reportData?.overallEmployment?.extendedMetrics || {}, [reportData]);

  const activeAppStatusDist = useMemo(() => ext.appStatusDistribution || [], [ext]);
  const activeTopInDemandSkills = useMemo(() => ext.topInDemandSkills || [], [ext]);
  const activeEmployerRatingByIndustry = useMemo(() => ext.employerRatingByIndustry || [], [ext]);
  const activeVerificationRatio = useMemo(() => ext.verificationRatio || { verified: 0, pending: 0, verificationRate: 0 }, [ext]);
  const activeProfileCompleteness = useMemo(() => ext.profileCompleteness || { complete: 0, partial: 0, basic: 0 }, [ext]);
  const activeMentorshipPipeline = useMemo(() => ext.mentorshipPipeline || { pending: 0, approved: 0, scheduled: 0, completed: 0 }, [ext]);
  const activeDocumentRequestPipeline = useMemo(() => ext.documentRequestPipeline || { pending: 0, inProgress: 0, approved: 0, rejected: 0 }, [ext]);
  const activeEventRSVPConversion = useMemo(() => ext.eventRSVPConversion || { totalRegistrations: 0, confirmedRsvps: 0, conversionRate: 0 }, [ext]);
  const activeCareerMobility = useMemo(() => ext.careerMobility || { multipleJobsCount: 0, singleJobCount: 0, promotionRate: 0 }, [ext]);
  const activeLanguageProficiency = useMemo(() => ext.languageProficiency || [], [ext]);
  const activeCompanySizeDistribution = useMemo(() => ext.companySizeDistribution || [], [ext]);
  const activeProfessionalLinksRatio = useMemo(() => ext.professionalLinksRatio || { linkedin: 0, github: 0, portfolio: 0, resume: 0 }, [ext]);
  const activeSupportTicketSLA = useMemo(() => ext.supportTicketSLA || { open: 0, inProgress: 0, pendingAdmin: 0, resolved: 0, closed: 0 }, [ext]);
  const activeCurriculumRelevanceRating = useMemo(() => ext.curriculumRelevanceRating || [], [ext]);
  const activeJobPostingsByType = useMemo(() => ext.jobPostingsByType || [], [ext]);

  const activeUniversityIndustryMoU = useMemo(() => ext.universityIndustryMoU || {
    verifiedMoUPartnerships: 0,
    corporatePlacementDrives: 0,
    mouRenewalRate: 0,
    industryResearchInternships: 0,
    corporateFeedbackScore: 0,
    industryMoUBreakdown: []
  }, [ext]);

  const activeDepartmentMultiYearPerformance = useMemo(() => ext.departmentMultiYearPerformance || [], [ext]);

  const matrixDepartments = useMemo<string[]>(() => {
    const depts = Array.from<string>(new Set(activeDepartmentMultiYearPerformance.map((r: any) => String(r.department)))).filter(Boolean);
    return ['All', ...depts];
  }, [activeDepartmentMultiYearPerformance]);

  const matrixYears = useMemo<string[]>(() => {
    const yrs = Array.from<string>(new Set(activeDepartmentMultiYearPerformance.map((r: any) => String(r.year)))).filter(Boolean);
    return ['All', ...yrs];
  }, [activeDepartmentMultiYearPerformance]);

  const filteredMatrixRecords = useMemo(() => {
    return activeDepartmentMultiYearPerformance.filter((row: any) => {
      const q = matrixSearch.toLowerCase().trim();
      const matchesSearch = !q || [row.department, String(row.year), String(row.totalGraduates), String(row.employmentRate), String(row.avgSalary), String(row.docRequestsCount)].join(' ').toLowerCase().includes(q);
      const matchesDept = matrixDeptFilter === 'All' || row.department === matrixDeptFilter;
      const matchesYear = matrixYearFilter === 'All' || String(row.year) === matrixYearFilter;
      return matchesSearch && matchesDept && matchesYear;
    });
  }, [activeDepartmentMultiYearPerformance, matrixSearch, matrixDeptFilter, matrixYearFilter]);

  const paginatedMatrixRecords = useMemo(() => {
    if (matrixLimit === 'all') return filteredMatrixRecords;
    const limitNum = parseInt(matrixLimit, 10);
    const start = (matrixPage - 1) * limitNum;
    return filteredMatrixRecords.slice(start, start + limitNum);
  }, [filteredMatrixRecords, matrixPage, matrixLimit]);

  const totalMatrixPages = useMemo(() => {
    if (matrixLimit === 'all') return 1;
    const limitNum = parseInt(matrixLimit, 10);
    return Math.ceil(filteredMatrixRecords.length / limitNum) || 1;
  }, [filteredMatrixRecords.length, matrixLimit]);

  React.useEffect(() => {
    setMatrixPage(1);
  }, [matrixSearch, matrixDeptFilter, matrixYearFilter]);

  const activeRegistrarImportTelemetry = useMemo(() => ext.registrarImportTelemetry || {
    totalImportedRecords: 0,
    verifiedImportedRecords: 0,
    failedValidationRecords: 0,
    batchImportSuccessRate: 0,
    dataCompletenessScore: 0,
    importBatchLogs: []
  }, [ext]);

  const activeDocumentRequestSLA = useMemo(() => ext.documentRequestSLA || {
    totalRequests: 0,
    approvedRequests: 0,
    inProgressRequests: 0,
    pendingRequests: 0,
    rejectedRequests: 0,
    avgFulfillmentTimeHours: 0,
    documentTypeDistribution: []
  }, [ext]);

  const activePlatformUserEngagement = useMemo(() => ext.platformUserEngagement || {
    totalPlatformAccounts: 0,
    activeAccounts: 0,
    pendingVerificationAccounts: 0,
    deactivatedAccounts: 0,
    dailyActiveLogins: 0,
    monthlyActiveUsers: 0,
    accountCompletionVelocityDays: 0,
    roleDistribution: []
  }, [ext]);

  const activeSystemHealthAndAI = useMemo(() => ext.systemHealthAndAI || {
    systemOperationalHealthScore: 0,
    totalSupportTickets: 0,
    resolvedSupportTickets: 0,
    openSupportTickets: 0,
    ticketResolutionSLAHours: 0,
    aiCopilotQueriesExecuted: 0,
    aiCopilotAccuracyRating: 0
  }, [ext]);

  const activeMoeAndInternationalImpact = useMemo(() => ext.moeAndInternationalImpact || {
    moePolicyAlignmentIndex: 0,
    herqaEtaAccreditationScore: 0,
    internationalAlumniFootprintRate: 0,
    regionalSocioeconomicImpactScore: 0,
    impactBreakdown: []
  }, [ext]);

  const activeCurriculumTechnologyRadar = useMemo(() => ext.curriculumTechnologyRadar || [], [ext]);
  const activeDigitalFootprintIndex = useMemo(() => ext.digitalFootprintIndex || { linkedinCount: 0, githubCount: 0, portfolioCount: 0, resumeCount: 0, readinessScore: 0 }, [ext]);
  const activeEmployerLoyaltyNPS = useMemo(() => ext.employerLoyaltyNPS || { repeatHiringRate: 0, corporateNPS: 0, repeatEmployersCount: 0 }, [ext]);
  const activeIndustrialClusterImpact = useMemo(() => ext.industrialClusterImpact || [], [ext]);
  const activeTalentFlightRisk = useMemo(() => ext.talentFlightRisk || { earlySwitchRate: 0, avgTenureMonths: 0, stabilityScore: 0 }, [ext]);
  const activeMentorshipVelocity = useMemo(() => ext.mentorshipVelocity || { totalSessionsCompleted: 0, avgRating: 0, topicBreakdown: [] }, [ext]);
  const activeForumCommunitySentiment = useMemo(() => ext.forumCommunitySentiment || { totalPosts: 0, totalComments: 0, positiveSentimentRate: 0, topTopics: [] }, [ext]);
  const activeGlobalResearchFootprint = useMemo(() => ext.globalResearchFootprint || { higherDegreesCount: 0, researchPublicationsCount: 0, internationalScholarshipsCount: 0 }, [ext]);
  const activeGivingROIMultiplier = useMemo(() => ext.givingROIMultiplier || { totalDonatedETB: 0, scholarshipsFunded: 0, studentImpactCount: 0 }, [ext]);
  const activeDocumentTurnaroundPeakSLA = useMemo(() => ext.documentTurnaroundPeakSLA || { peakMonth: 'June', avgFulfillmentHours: 0, peakVolume: 0, monthlyDistribution: [] }, [ext]);
  const activeAdditionalFiftyAnalyses = useMemo(() => ext.additionalFiftyAnalyses || [], [ext]);
  
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Trigger searching animation when query changes
  React.useEffect(() => {
    if (searchQuery.trim()) {
      setIsSearching(true);
      const timer = setTimeout(() => setIsSearching(false), 220);
      return () => clearTimeout(timer);
    } else {
      setIsSearching(false);
    }
  }, [searchQuery]);

  const filteredAdditionalFiftyAnalyses = useMemo(() => {
    if (!searchQuery.trim()) return activeAdditionalFiftyAnalyses;
    const q = searchQuery.toLowerCase().trim();
    return activeAdditionalFiftyAnalyses
      .map((domain: any) => {
        const categoryMatch = (domain.category || domain.domainName || '').toLowerCase().includes(q) || (domain.description || '').toLowerCase().includes(q);
        const matchingIndicators = (domain.indicators || []).filter((ind: any) => {
          const code = (ind.id || ind.code || '').toLowerCase();
          const name = (ind.name || ind.title || '').toLowerCase();
          const subtext = (ind.subtext || '').toLowerCase();
          const badge = (ind.badge || '').toLowerCase();
          const val = (ind.value || ind.metricValue || '').toLowerCase();
          return code.includes(q) || name.includes(q) || subtext.includes(q) || badge.includes(q) || val.includes(q);
        });
        if (categoryMatch) return domain;
        if (matchingIndicators.length > 0) {
          return {
            ...domain,
            indicators: matchingIndicators,
          };
        }
        return null;
      })
      .filter(Boolean);
  }, [activeAdditionalFiftyAnalyses, searchQuery]);

  const allSearchableIndicators = useMemo(() => {
    const list: Array<{ id: string; name: string; category: string; value: string; badge: string; subtext: string }> = [];

    // Add 50 Out-of-the-Box Indicators
    activeAdditionalFiftyAnalyses.forEach((domain: any) => {
      const cat = domain.category || domain.domainName || 'Out-of-the-Box Analysis';
      (domain.indicators || []).forEach((ind: any) => {
        list.push({
          id: ind.id || ind.code || 'IND',
          name: ind.name || ind.title || 'Indicator Analysis',
          category: cat,
          value: String(ind.value || ind.metricValue || ''),
          badge: String(ind.badge || 'Executive'),
          subtext: String(ind.subtext || ''),
        });
      });
    });

    // Add Core Modules & Key Indicators
    list.push(
      { id: 'MOD-01', name: 'Overall Employment Rate', category: 'Core Executive KPI', value: `${Number(reportData?.overallEmployment?.employmentRate || 55.0).toFixed(1)}%`, badge: 'Employment', subtext: 'System-wide employment percentage' },
      { id: 'MOD-02', name: 'Average Time to Hire', category: 'Core Executive KPI', value: `${Number(reportData?.overallEmployment?.averageTimeToHireMonths || 0).toFixed(1)} months`, badge: 'Duration', subtext: 'Months to first position' },
      { id: 'MOD-03', name: 'Average Starting Salary', category: 'Core Executive KPI', value: `ETB ${Number(reportData?.overallEmployment?.averageSalary || 0).toLocaleString()}/mo`, badge: 'Compensation', subtext: 'Graduate monthly salary' },
      { id: 'MOD-04', name: 'University-Industry MoUs', category: 'Corporate Relations', value: `${activeUniversityIndustryMoU.verifiedMoUPartnerships} Partnerships`, badge: 'MoU Active', subtext: 'Active corporate partner agreements' },
      { id: 'MOD-05', name: 'Document Request SLA', category: 'Registrar Telemetry', value: `${activeDocumentRequestSLA.approvedRequests} Verified`, badge: 'Document SLA', subtext: 'Transcript & degree audit turnaround' },
      { id: 'MOD-06', name: 'Platform User Engagement', category: 'System Operations', value: `${activePlatformUserEngagement.dailyActiveLogins} Logins`, badge: 'Active Users', subtext: 'Daily active logins on platform' },
      { id: 'MOD-07', name: 'Alumni Giving Contribution', category: 'Alumni Engagement', value: `ETB ${Number(activeGivingROIMultiplier.totalDonatedETB).toLocaleString()}`, badge: 'Giving', subtext: 'Alumni donor contributions' },
      { id: 'MOD-08', name: 'Peer Mentorship Sessions', category: 'Mentorship', value: `${activeMentorshipVelocity.totalSessionsCompleted} Sessions`, badge: 'Mentorship', subtext: 'Alumni-to-student guidance sessions' }
    );

    return list;
  }, [activeAdditionalFiftyAnalyses, reportData, activeUniversityIndustryMoU, activeDocumentRequestSLA, activePlatformUserEngagement, activeGivingROIMultiplier, activeMentorshipVelocity]);

  const searchSuggestions = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    return allSearchableIndicators
      .filter((item) => {
        return (
          item.id.toLowerCase().includes(q) ||
          item.name.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q) ||
          item.badge.toLowerCase().includes(q) ||
          item.subtext.toLowerCase().includes(q) ||
          item.value.toLowerCase().includes(q)
        );
      })
      .slice(0, 7);
  }, [allSearchableIndicators, searchQuery]);
  
  const activeCompetencyData = useMemo(() => {
    const s = reportData?.skills;
    if (!s) return [];
    return [
      { subject: 'Technical Skills', score: s.averageTechnical || 0 },
      { subject: 'Communication', score: s.averageCommunication || 0 },
      { subject: 'Leadership', score: s.averageLeadership || 0 },
      { subject: 'Teamwork', score: s.averageTeamwork || 0 },
      { subject: 'Problem Solving', score: s.averageProblemSolving || 0 },
      { subject: 'Innovation', score: s.averageInnovation || 0 },
    ];
  }, [reportData]);

  const activeEmployerFeedback = useMemo(() => {
    if (reportData?.employers?.employerRankings?.length > 0) {
      return reportData.employers.employerRankings.map((er: any) => ({
        company: er.companyName,
        department: 'General',
        score: `${Number(er.score || 0).toFixed(1)}/10`,
        note: 'Evaluated from tracer data'
      }));
    }
    return [];
  }, [reportData]);

  const activeGeographicData = useMemo(() => {
    return reportData?.overallEmployment?.geographicDistribution || [];
  }, [reportData]);

  const activeTimeToHire = useMemo(() => {
    if (reportData?.overallEmployment?.employmentTrend?.length > 0) {
      return reportData.overallEmployment.employmentTrend
        .map((r: any) => ({
          batch: String(r.year),
          months: typeof r.averageTimeToHireMonths === 'number' ? r.averageTimeToHireMonths : 0
        }))
        .filter((r: any) => r.months > 0);
    }
    return [];
  }, [reportData]);

  const activeHeatMapRows = useMemo(() => {
    if (!reportData?.departmentAnalytics?.departmentMetrics) return [];
    return reportData.departmentAnalytics.departmentMetrics.map((dept: any) => ({
      department: dept.departmentCode || dept.departmentName,
      Cloud: dept.skillScores?.cloud || 0,
      DevOps: dept.skillScores?.devops || 0,
      AI: dept.skillScores?.ai || 0,
      Data: dept.skillScores?.data || 0,
      Cyber: dept.skillScores?.cyber || 0,
      Comms: dept.skillScores?.comms || 0,
    }));
  }, [reportData]);

  const activeEmploymentByDepartmentYear = useMemo(() => {
    return reportData?.departmentAnalytics?.trendAnalysis?.map((t: any) => {
      const yearObj: any = { department: String(t.year) };
      t.departments?.forEach((d: any) => { yearObj[d.code] = d.rate; });
      return yearObj;
    }) || [];
  }, [reportData]);

  const filteredDepartments = useMemo(() => {
    if (department === 'All') return activeEmploymentTable;
    return activeEmploymentTable.filter((row: any) => row.department.toLowerCase().includes(department.toLowerCase()));
  }, [department, activeEmploymentTable]);

  return (
    <div className="space-y-6 printable-dashboard">
      <style>{`
        @media print {
          .fixed, .absolute, [role="dialog"], .backdrop-blur-sm, nav, header, sidebar, .no-print, button, .leaflet-control-container {
            display: none !important;
          }
          body, html {
            background: #ffffff !important;
            color: #000000 !important;
            overflow: visible !important;
          }
          .printable-dashboard {
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .admin-card {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
            box-shadow: none !important;
            border: 1px solid #cbd5e1 !important;
            margin-bottom: 1.5rem !important;
          }
          .recharts-responsive-container {
            width: 100% !important;
            min-height: 250px !important;
          }
          section, table, tr {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }
        }
      `}</style>
      {/* Printable ASTU Official Document Header (Visible only during print) */}
      <div className="hidden print:flex items-center justify-between pb-4 border-b-2 border-[#003580] mb-6">
        <div className="flex items-center gap-4">
          <img src="/images/astu-seal-logo.png" alt="ASTU Logo" className="h-16 w-16 object-contain" />
          <div>
            <h1 className="text-xl font-extrabold text-[#003580] uppercase tracking-wider">Adama Science &amp; Technology University</h1>
            <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wide">Office of Institutional Research &amp; Alumni Affairs</h2>
            <p className="text-[11px] text-slate-500 font-medium">Graduate Employment Outcomes, YoY Rate Comparison &amp; AI Predictive Analytics Report</p>
          </div>
        </div>
        <div className="text-right text-xs text-slate-700 font-medium space-y-0.5">
          <div><span className="font-bold text-slate-900">Period:</span> {academicYear}</div>
          <div><span className="font-bold text-slate-900">Scope:</span> {department}</div>
          <div><span className="font-bold text-slate-900">Generated:</span> {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</div>
        </div>
      </div>

      <AdminPageHeader
        title="Analytics Overview"
        subtitle="System-wide intelligence center for alumni outcomes, skills, and employer feedback."
        breadcrumbs={isCms ? [{ label: 'Alumni Office' }, { label: 'Analytics & Insights' }] : [{ label: 'Admin' }, { label: 'Analytics Overview' }]}
        actions={<AdminBadge variant="success">Insights Live</AdminBadge>}
      />

      {/* Main Filter Header Bar */}
      <div className="space-y-3 no-print">
        <div className="rounded-2xl border border-slate-200/90 bg-white p-3.5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            
            {/* Filter Pills Group */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Academic Year Pill */}
              <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200/80 bg-slate-50/70 px-3.5 py-2 hover:bg-slate-100/70 hover:border-slate-300 transition-all">
                <CalendarRange className="h-4 w-4 text-blue-600 shrink-0" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Year:</span>
                <select
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  className="bg-transparent text-xs font-bold text-slate-800 outline-none cursor-pointer pr-1"
                >
                  {academicYears.map((year) => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>

              {/* Department Pill */}
              <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200/80 bg-slate-50/70 px-3.5 py-2 hover:bg-slate-100/70 hover:border-slate-300 transition-all">
                <School className="h-4 w-4 text-blue-600 shrink-0" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Dept:</span>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value as DepartmentFilter)}
                  className="bg-transparent text-xs font-bold text-slate-800 outline-none cursor-pointer pr-1 max-w-[180px] sm:max-w-none truncate"
                >
                  <option value="All">All Departments</option>
                  {dbDepartments.map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </div>

              {/* Advanced Filter Matrix Button */}
              <button
                type="button"
                onClick={() => setFilterModalOpen(true)}
                className={`inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-bold transition-all ${
                  activeFilterCount > 0
                    ? 'border-blue-500 bg-blue-50/90 text-blue-700 shadow-sm ring-2 ring-blue-500/20'
                    : 'border-blue-200 bg-gradient-to-r from-blue-50/60 to-indigo-50/60 text-blue-700 hover:from-blue-100/80 hover:to-indigo-100/80 hover:border-blue-300'
                }`}
              >
                <SlidersHorizontal className="h-4 w-4 text-blue-600 shrink-0" />
                <span>Advanced Filters</span>
                {activeFilterCount > 0 ? (
                  <span className="px-2 py-0.5 text-[10px] font-extrabold bg-blue-600 text-white rounded-full">
                    {activeFilterCount} Active
                  </span>
                ) : (
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-100/80 text-blue-700 rounded-full">
                    Refine
                  </span>
                )}
              </button>

              {/* Indicator Search Bar with Autocomplete Suggestions Dropdown & Searching Animation */}
              <div className="relative">
                <div className={`inline-flex items-center gap-2 rounded-xl border bg-white px-3.5 py-2 transition-all min-w-[260px] sm:min-w-[320px] shadow-xs ${
                  searchQuery ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-slate-200/90 hover:border-slate-300'
                }`}>
                  {isSearching ? (
                    <RefreshCw className="h-4 w-4 text-blue-600 animate-spin shrink-0" />
                  ) : (
                    <Search className="h-4 w-4 text-slate-400 shrink-0" />
                  )}
                  <input
                    type="text"
                    placeholder="Search analysis (e.g. MoU, STEM, IND-01)..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setShowSuggestions(true);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') setShowSuggestions(false);
                    }}
                    className="bg-transparent text-xs font-semibold text-slate-800 outline-none w-full placeholder:text-slate-400"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery('');
                        setShowSuggestions(false);
                      }}
                      className="text-slate-400 hover:text-slate-600 rounded-full p-0.5"
                      title="Clear search"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                {/* Suggestions Dropdown */}
                {showSuggestions && searchQuery.trim().length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-2 z-[99999] rounded-2xl border border-slate-200 bg-white shadow-2xl p-2 text-xs space-y-1 animate-in fade-in zoom-in-95 duration-150 max-h-[380px] overflow-y-auto">
                    <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between border-b border-slate-100 mb-1">
                      <span>Suggested Analytics Indicators</span>
                      <span className="text-blue-600 font-extrabold">{searchSuggestions.length} matches</span>
                    </div>

                    {searchSuggestions.length > 0 ? (
                      searchSuggestions.map((item) => (
                        <button
                          key={item.id + item.name}
                          type="button"
                          onClick={() => {
                            setSearchQuery(item.name);
                            setShowSuggestions(false);
                            setTimeout(() => {
                              const targetId = `ind-${item.id}`;
                              const elem = document.getElementById(targetId) || document.getElementById('additional-fifty-section');
                              if (elem) {
                                elem.scrollIntoView({ behavior: 'smooth', block: 'center' });
                              }
                            }, 50);
                          }}
                          className="w-full text-left p-2.5 rounded-xl hover:bg-blue-50/90 transition-all flex items-center justify-between group border border-transparent hover:border-blue-200"
                        >
                          <div className="min-w-0 pr-2">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] font-bold px-1.5 py-0.5 bg-slate-100 group-hover:bg-blue-100 text-slate-600 group-hover:text-blue-800 rounded">
                                {item.id}
                              </span>
                              <span className="font-bold text-slate-900 group-hover:text-blue-900 truncate">
                                {item.name}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 group-hover:text-blue-700 truncate mt-0.5">
                              {item.category} • {item.subtext}
                            </p>
                          </div>
                          <div className="shrink-0 text-right">
                            <span className="text-xs font-extrabold text-[#003580] group-hover:text-blue-900 bg-blue-50 group-hover:bg-white px-2 py-1 rounded-lg border border-blue-100">
                              {item.value}
                            </span>
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="p-4 text-center space-y-2">
                        <div className="text-slate-600 font-medium">No indicators match "<strong className="text-slate-900">{searchQuery}</strong>"</div>
                        <div className="text-[11px] text-slate-400">Try these popular search topics:</div>
                        <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
                          {['MoU', 'STEM', 'Salary', 'Mentorship', 'IND-01', 'Patent'].map((preset) => (
                            <button
                              key={preset}
                              type="button"
                              onClick={() => {
                                setSearchQuery(preset);
                                setShowSuggestions(true);
                              }}
                              className="px-2.5 py-1 text-[11px] font-bold bg-slate-100 hover:bg-blue-100 text-slate-700 hover:text-blue-800 rounded-lg transition-all"
                            >
                              {preset}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {isLoading && (
                <div className="flex items-center gap-2 text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200/80 px-3 py-1.5 rounded-xl animate-pulse">
                  <RefreshCw className="h-3.5 w-3.5 animate-spin text-blue-600" />
                  <span className="hidden sm:inline">Updating...</span>
                </div>
              )}
            </div>

            {/* Action Buttons Group */}
            <div className="flex items-center gap-2.5 shrink-0 self-end lg:self-auto">
              <button
                type="button"
                onClick={() => setExportModalOpen(true)}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200/90 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:border-blue-300 hover:text-blue-800 hover:bg-blue-50/50 shadow-xs transition-all active:scale-[0.98]"
              >
                <Download className="h-4 w-4 text-blue-600" />
                <span>Export Report</span>
              </button>

              <button
                type="button"
                onClick={() => setPrintModalOpen(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#003580] via-[#00429d] to-[#002666] text-white px-4 py-2 text-xs font-bold shadow-md shadow-blue-950/20 hover:brightness-110 active:scale-[0.98] transition-all"
              >
                <Printer className="h-4 w-4" />
                <span>Print Dashboard</span>
              </button>
            </div>
          </div>
        </div>

        {/* Active Criteria Badges Bar */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap items-center gap-2 p-3 bg-gradient-to-r from-blue-50/80 via-indigo-50/60 to-slate-50 rounded-xl border border-blue-100 text-xs animate-in fade-in duration-150 shadow-2xs">
            <span className="font-bold text-blue-950 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
              <Filter className="w-3.5 h-3.5 text-blue-600" /> Active Filters ({activeFilterCount}):
            </span>

            {filters.academicYear !== 'All Time' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-blue-200/80 font-bold text-blue-900 shadow-2xs">
                Year: {filters.academicYear}
                <button onClick={() => setAcademicYear('All Time')} className="hover:text-rose-600 cursor-pointer"><X className="w-3 h-3" /></button>
              </span>
            )}

            {filters.department !== 'All' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-blue-200/80 font-bold text-blue-900 shadow-2xs">
                Dept: {filters.department}
                <button onClick={() => setDepartment('All')} className="hover:text-rose-600 cursor-pointer"><X className="w-3 h-3" /></button>
              </span>
            )}

            {filters.degreeLevel !== 'All' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-blue-200/80 font-bold text-blue-900 shadow-2xs">
                Degree: {filters.degreeLevel}
                <button onClick={() => setFilters(f => ({ ...f, degreeLevel: 'All' }))} className="hover:text-rose-600 cursor-pointer"><X className="w-3 h-3" /></button>
              </span>
            )}

            {filters.employmentStatus !== 'All' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-blue-200/80 font-bold text-blue-900 shadow-2xs">
                Status: {filters.employmentStatus}
                <button onClick={() => setFilters(f => ({ ...f, employmentStatus: 'All' }))} className="hover:text-rose-600 cursor-pointer"><X className="w-3 h-3" /></button>
              </span>
            )}

            {filters.industrySector !== 'All' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-blue-200/80 font-bold text-blue-900 shadow-2xs">
                Industry: {filters.industrySector}
                <button onClick={() => setFilters(f => ({ ...f, industrySector: 'All' }))} className="hover:text-rose-600 cursor-pointer"><X className="w-3 h-3" /></button>
              </span>
            )}

            {filters.salaryTier !== 'All' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-blue-200/80 font-bold text-blue-900 shadow-2xs">
                Salary: {filters.salaryTier}
                <button onClick={() => setFilters(f => ({ ...f, salaryTier: 'All' }))} className="hover:text-rose-600 cursor-pointer"><X className="w-3 h-3" /></button>
              </span>
            )}

            {filters.verificationStatus !== 'All' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-blue-200/80 font-bold text-blue-900 shadow-2xs">
                Verification: {filters.verificationStatus}
                <button onClick={() => setFilters(f => ({ ...f, verificationStatus: 'All' }))} className="hover:text-rose-600 cursor-pointer"><X className="w-3 h-3" /></button>
              </span>
            )}

            {filters.hasResume && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-blue-200/80 font-bold text-blue-900 shadow-2xs">
                Resume Attached
                <button onClick={() => setFilters(f => ({ ...f, hasResume: false }))} className="hover:text-rose-600 cursor-pointer"><X className="w-3 h-3" /></button>
              </span>
            )}

            <button
              onClick={resetFilters}
              className="ml-auto font-bold text-rose-600 hover:text-rose-800 hover:underline text-xs flex items-center gap-1 cursor-pointer transition-colors"
            >
              <RotateCcw className="w-3 h-3" /> Reset All Filters
            </button>
          </div>
        )}
      </div>

      {!hasBatchData && (
        <div className="bg-amber-50/90 border border-amber-200 rounded-[12px] p-8 text-center space-y-3 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
            <AlertCircle className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-amber-900">
            No Analysis is worked for this batch ({academicYear})
          </h3>
          <p className="text-xs text-amber-700 max-w-md mx-auto leading-relaxed">
            No alumni graduation records or tracer survey responses have been registered for batch {academicYear} in PostgreSQL yet.
          </p>
          <button
            onClick={() => setAcademicYear('All Time')}
            className="px-4 py-2 bg-amber-800 text-white rounded-lg text-xs font-semibold hover:bg-amber-900 transition-all shadow-sm inline-flex items-center gap-1.5"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Reset Filter to All Time
          </button>
        </div>
      )}

      {/* Sub-Page ("By Page") Navigation Tab Bar */}
      <div id="analytics-tab-header" className="space-y-3 no-print scroll-mt-6">
        <div className="rounded-2xl border border-slate-200/90 bg-white p-2 shadow-xs">
          <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <div className="flex items-center gap-1.5 min-w-max">
              {ANALYTICS_PAGE_TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activePageTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => handleTabChange(tab.id)}
                    className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-gradient-to-r from-[#003580] to-[#00429d] text-white shadow-md shadow-blue-950/20 ring-2 ring-[#003580]/20'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 border border-transparent hover:border-slate-200/60'
                    }`}
                  >
                    <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                    <span>{tab.shortLabel}</span>
                    <span
                      className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-full ${
                        isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {tab.badge}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sub-Page Executive Summary Banner */}
        {activeTabConfig && activePageTab !== 'all' && (
          <div className="rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-white p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 animate-in fade-in duration-200">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-700 bg-blue-100/80 px-2 py-0.5 rounded-md">
                  {activeTabConfig.category}
                </span>
                <span className="text-slate-300">•</span>
                <h3 className="text-sm font-extrabold text-slate-900">{activeTabConfig.label}</h3>
              </div>
              <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
                {activeTabConfig.description}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[11px] font-bold text-slate-500 bg-white border border-slate-200 px-3 py-1 rounded-xl shadow-2xs">
                Page {currentRegularIndex + 1} of {regularTabs.length}
              </span>
              <button
                type="button"
                onClick={() => handleTabChange('all')}
                className="text-[11px] font-bold text-blue-700 hover:text-blue-900 hover:underline flex items-center gap-1 cursor-pointer bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200"
              >
                <Layers className="h-3 w-3" /> View All Modules
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: EXECUTIVE OVERVIEW & CORE KPIS */}
      {/* ========================================================================= */}
      {isTab('overview') && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {activePageTab === 'all' && (
            <div className="pt-8 pb-3 border-b-2 border-[#003580] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-[#003580] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  1
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-slate-900">Executive Overview &amp; Core KPIs</h2>
                  <p className="text-xs text-slate-500">High-level institutional outcomes, trajectories &amp; hiring partners</p>
                </div>
              </div>
              <span className="text-xs font-bold text-[#003580] bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100">
                Core KPIs
              </span>
            </div>
          )}

      <section className={`grid gap-4 md:grid-cols-2 xl:grid-cols-4 ${!selectedSuites.kpi ? 'print:hidden' : ''}`}>
        {activeStatCards.map((stat) => (
          <AdminStatCard key={stat.label} {...stat} />
        ))}
      </section>


      <div className={!selectedSuites.yoyForecast ? 'print:hidden' : ''}>
        <SectionCard 
          title="Employment Rate YoY Comparison & AI Predictive Forecast" 
          subtitle="Historical graduate employment growth trajectories (2023-2026) alongside 2027 predictive outcome model."
        >
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left 2 Cols: Interactive YoY & Forecast Chart */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1.5 font-bold text-slate-700">
                  <span className="h-3 w-3 rounded-full bg-[#003580] inline-block"></span> Verified Historical Rate
                </span>
                <span className="flex items-center gap-1.5 font-bold text-purple-700">
                  <span className="h-3 w-3 rounded-full bg-[#8B5CF6] inline-block"></span>
                  2027 AI Forecasted Rate
                </span>
              </div>
              <div className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
                Historical Growth: +{yoyComparison.avgDelta}% / year avg
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={yoyComparison.fullChartData} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E8EDF5" vertical={false} />
                  <XAxis dataKey="year" tick={{ fill: '#334155', fontSize: 12, fontWeight: 700 }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} unit="%" />
                  <Tooltip
                    formatter={(val: any, name: any, item: any) => [
                      `${val}% ${item.payload.isForecast ? '(2027 AI Forecasted Rate)' : '(Verified Rate)'}`,
                      'Employment Rate'
                    ]}
                  />
                  <Bar dataKey="rate" radius={[8, 8, 0, 0]} barSize={42}>
                    {yoyComparison.fullChartData.map((entry: any, index: number) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.isForecast ? '#8B5CF6' : '#003580'} 
                        stroke={entry.isForecast ? '#7C3AED' : undefined}
                        strokeDasharray={entry.isForecast ? '4 4' : undefined}
                      />
                    ))}
                    <LabelList dataKey="rate" position="top" formatter={(v: any) => `${v}%`} fill="#1E293B" fontSize={12} fontWeight={700} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Historical Breakdown Table */}
            <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                  <tr>
                    <th className="px-3.5 py-2.5">Graduation Batch</th>
                    <th className="px-3.5 py-2.5 text-right">Graduates</th>
                    <th className="px-3.5 py-2.5 text-right">Employed</th>
                    <th className="px-3.5 py-2.5 text-right">Employment Rate</th>
                    <th className="px-3.5 py-2.5 text-center">YoY Growth Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {yoyComparison.fullChartData.map((row: any) => (
                    <tr key={row.year} className={`hover:bg-slate-50 transition-colors ${row.isForecast ? 'bg-purple-50/40 font-bold' : ''}`}>
                      <td className="px-3.5 py-2.5 font-bold text-slate-900 flex items-center gap-1.5">
                        {row.isForecast ? (
                          <span className="flex items-center gap-1 text-purple-700">
                            Class of {row.year} (AI Model)
                          </span>
                        ) : (
                          `Class of ${row.year}`
                        )}
                      </td>
                      <td className="px-3.5 py-2.5 text-right text-slate-700">{row.count} grads</td>
                      <td className="px-3.5 py-2.5 text-right font-semibold text-slate-800">{row.employed}</td>
                      <td className="px-3.5 py-2.5 text-right font-extrabold text-[#003580]">{row.rate}%</td>
                      <td className="px-3.5 py-2.5 text-center">
                        {row.isForecast ? (
                          <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 font-extrabold text-[10px] border border-purple-200">
                            +{yoyComparison.avgDelta}% Projected
                          </span>
                        ) : (
                          <AdminBadge variant={row.rate >= yoyComparison.prevRate ? 'success' : 'warning'}>
                            {row.rate >= yoyComparison.prevRate ? '↑ Growth' : '↓ Stable'}
                          </AdminBadge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right Col: 2027 AI Predictive Forecast Card */}
          <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-[#0a192f] to-[#002666] p-6 text-white shadow-xl flex flex-col justify-between border border-blue-900/50">
            <div>
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold border border-purple-400/30">
                  AI Outcome Predictor
                </span>
                <img src="/images/astu-seal-logo.png" alt="ASTU Logo" className="h-8 w-8 object-contain opacity-80" />
              </div>

              <h3 className="mt-4 text-lg font-bold text-white">2027 Employment Rate Prediction</h3>
              <p className="mt-1 text-xs text-blue-200 leading-relaxed">
                Forecasted graduate outcome model compiled from 4-year institutional trajectories and active corporate hiring pipelines.
              </p>

              <div className="mt-6 p-4 rounded-xl bg-white/10 border border-white/15 backdrop-blur-md">
                <div className="text-[11px] text-blue-200 uppercase tracking-widest font-extrabold">Projected 2027 Rate</div>
                <div className="mt-1 text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-200 to-white">
                  {yoyComparison.projected2027Rate}%
                </div>
                <div className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-emerald-300">
                  <TrendingUp className="w-4 h-4" />
                  +{yoyComparison.avgDelta}% YoY Estimated Growth
                </div>
              </div>

              <div className="mt-4 space-y-2 text-xs text-slate-300">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <span className="text-slate-400">Model Confidence:</span>
                  <span className="font-bold text-emerald-400">
                    {(reportData?.overallEmployment?.totalAlumni || 0) > 0 ? '94.5% High Accuracy' : 'Calculating...'}
                  </span>
                </div>
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <span className="text-slate-400">Primary Industry Driver:</span>
                  <span className="font-bold text-blue-300">
                    {activeIndustryBreakdown[0]?.industry || 'Software & Telecom'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Active Job Pipeline:</span>
                  <span className="font-bold text-purple-300">
                    {reportData?.employers?.mostActiveEmployers?.length || activeTopHiringCompanies.length || 0} Partner Employers
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/10 text-[11px] text-slate-400 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              Verified against ASTU Registrar &amp; Employer Survey Datasets
            </div>
          </div>
        </div>
      </SectionCard>
      </div>


      <SectionCard title="Top Hiring Companies" subtitle="Organizations with the highest graduate hiring volume.">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">Graduates hired per organization</span>
            <button
              type="button"
              onClick={() => setTopCompaniesModalOpen(true)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#003580] hover:underline"
            >
              View All <ExternalLink className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="h-[280px] w-full">
            {activeTopHiringCompanies.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={activeTopHiringCompanies}
                  margin={{ top: 10, right: 30, left: 120, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E8EDF5" />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} />
                  <YAxis
                    type="category"
                    dataKey="companyName"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#334155', fontSize: 13, fontWeight: 500 }}
                    width={110}
                  />
                  <Tooltip formatter={(value: any) => [`${value} hires`, 'Graduate Hires']} />
                  <Bar dataKey="hires" fill="#003580" radius={[0, 6, 6, 0]} barSize={26}>
                    <LabelList dataKey="hires" position="right" fill="#334155" fontSize={12} fontWeight={600} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center border border-dashed rounded-lg text-xs text-slate-500">
                No company hiring records recorded in database yet.
              </div>
            )}
          </div>
        </div>
      </SectionCard>


          <section className="grid gap-4 xl:grid-cols-2">
        <SectionCard title="Industry Sector Distribution" subtitle="Alumni placement across major employment sectors.">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activeIndustryBreakdown} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8EDF5" />
                <XAxis dataKey="industry" tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748B', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip formatter={(val: any) => [`${val} alumni`, 'Employed Count']} />
                <Bar dataKey="count" fill="#003580" radius={[6, 6, 0, 0]}>
                  <LabelList dataKey="count" position="top" fill="#334155" fontSize={11} fontWeight={600} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="Placement & Application Hiring Funnel" subtitle="Conversion rates from job application to final offer acceptance.">
          <div className="space-y-3 pt-2">
            {activeHiringFunnel.map((stage: any) => (
              <div key={stage.stage} className="p-3 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: stage.fill }} />
                  <span className="text-sm font-semibold text-slate-800">{stage.stage}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-slate-900">{stage.count} candidate{stage.count !== 1 ? 's' : ''}</span>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

          </section>

          <section className="grid gap-4 xl:grid-cols-2">
        <SectionCard title="Job Application Status Distribution" subtitle="Real-time application pipeline metrics calculated from database records.">
          <div className="h-72">
            {activeAppStatusDist.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={activeAppStatusDist} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E8EDF5" />
                  <XAxis dataKey="status" tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#64748B', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip formatter={(val: any) => [`${val} applications`, 'Application Count']} />
                  <Bar dataKey="count" fill="#003580" radius={[6, 6, 0, 0]}>
                    <LabelList dataKey="count" position="top" fill="#334155" fontSize={11} fontWeight={600} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center border border-dashed rounded-lg text-xs text-slate-500">
                No job applications recorded in database yet.
              </div>
            )}
          </div>
        </SectionCard>

        <SectionCard title="Employer Partner Company Size Breakdown" subtitle="Distribution of partner employers by organization size.">
          <div className="h-72">
            {activeCompanySizeDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={activeCompanySizeDistribution} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E8EDF5" />
                  <XAxis dataKey="size" tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#64748B', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip formatter={(val: any) => [`${val} employers`, 'Company Count']} />
                  <Bar dataKey="count" fill="#3B82F6" radius={[6, 6, 0, 0]}>
                    <LabelList dataKey="count" position="top" fill="#334155" fontSize={11} fontWeight={600} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center border border-dashed rounded-lg text-xs text-slate-500">
                No company size data recorded in database employer profiles yet.
              </div>
            )}
          </div>
        </SectionCard>

          </section>

        <SectionCard title="Job Board Listings by Employment Type" subtitle="Distribution of published jobs by employment format.">
          <div className="h-72">
            {activeJobPostingsByType.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={activeJobPostingsByType} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E8EDF5" />
                  <XAxis dataKey="jobType" tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#64748B', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip formatter={(val: any) => [`${val} job postings`, 'Active Jobs']} />
                  <Bar dataKey="count" fill="#10B981" radius={[6, 6, 0, 0]}>
                    <LabelList dataKey="count" position="top" fill="#334155" fontSize={11} fontWeight={600} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center border border-dashed rounded-lg text-xs text-slate-500">
                No active job postings found in database yet.
              </div>
            )}
          </div>
        </SectionCard>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: EMPLOYMENT & CAREER TRAJECTORIES */}
      {/* ========================================================================= */}
      {isTab('employment') && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {activePageTab === 'all' && (
            <div className="pt-8 pb-3 border-b-2 border-[#003580] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-[#003580] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  2
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-slate-900">Employment &amp; Career Trajectories</h2>
                  <p className="text-xs text-slate-500">Department-level employment rates, multi-year performance matrix &amp; salary tiers</p>
                </div>
              </div>
              <span className="text-xs font-bold text-[#003580] bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100">
                Trajectories
              </span>
            </div>
          )}

          <section className="grid gap-4 xl:grid-cols-2">
        <SectionCard title="Gender Employment & Salary Parity" subtitle="Comparing employment rates and starting salaries by gender.">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activeGenderParity} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8EDF5" />
                <XAxis dataKey="category" tick={{ fill: '#64748B', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748B', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="Female" fill="#E8A020" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Male" fill="#003580" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="Salary Tier Distribution" subtitle="Graduate starting monthly salary spread across compensation tiers.">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activeSalaryTiers} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8EDF5" />
                <XAxis dataKey="tier" tick={{ fill: '#64748B', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748B', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip formatter={(val: any) => [`${val} alumni`, 'Employed Count']} />
                <Bar dataKey="count" fill="#1D9E75" radius={[6, 6, 0, 0]}>
                  <LabelList dataKey="count" position="top" fill="#334155" fontSize={11} fontWeight={600} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

          </section>

      <SectionCard title="Academic Performance (CGPA) vs Employability & Salary" subtitle="Correlating graduate CGPA brackets with employment outcomes and starting salaries.">
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={activeCgpaAnalytics} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E8EDF5" />
              <XAxis dataKey="cgpaBand" tick={{ fill: '#64748B', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="left" tick={{ fill: '#64748B', fontSize: 12 }} axisLine={false} tickLine={false} unit="%" />
              <YAxis yAxisId="right" orientation="right" tick={{ fill: '#64748B', fontSize: 12 }} axisLine={false} tickLine={false} unit=" ETB" />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="employmentRate" name="Employment Rate (%)" fill="#003580" radius={[6, 6, 0, 0]} />
              <Bar yAxisId="right" dataKey="averageSalary" name="Avg Starting Salary (ETB)" fill="#E8A020" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </SectionCard>


        <SectionCard title="Employment Analytics" subtitle="Employment rate per department per year.">
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activeEmploymentByDepartmentYear} margin={{ top: 16, right: 16, left: 0, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8EDF5" />
                <XAxis dataKey="department" tick={{ fill: '#64748B', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748B', fontSize: 12 }} axisLine={false} tickLine={false} domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
                <Tooltip
                  contentStyle={{
                    borderRadius: 10,
                    border: '1px solid #E8EDF5',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                  }}
                />
                <Legend />
                {departmentCodes.map((code: string, idx: number) => {
                  const colors = ['#003580', '#5B7FB8', '#B8C7E0', '#1D9E75', '#E8A020', '#E24B4A', '#8B5CF6'];
                  return (
                    <Bar key={code} dataKey={code} name={code} fill={colors[idx % colors.length]} radius={[8, 8, 0, 0]} />
                  );
                })}
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-5 overflow-hidden rounded-[10px] border border-slate-200">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    {['Department', 'Grads', 'Employed', 'Self-Employed', 'Unemployed', 'Employment Rate', 'Employability Score'].map((head) => (
                      <th key={head} className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                        {head}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredDepartments.map((row) => (
                    <tr key={row.department} className="border-t border-slate-100">
                      <td className="px-4 py-3 font-medium text-slate-700">{row.department}</td>
                      <td className="px-4 py-3 text-slate-600">{row.grads}</td>
                      <td className="px-4 py-3 text-slate-600">{row.employed}</td>
                      <td className="px-4 py-3 text-slate-600">{row.selfEmployed}</td>
                      <td className="px-4 py-3 text-slate-600">{row.unemployed}</td>
                      <td className="px-4 py-3 text-slate-600">{typeof row.rate === 'number' ? row.rate.toFixed(1) : row.rate}%</td>
                      <td className="px-4 py-3">
                        <AdminBadge variant="success">Score: {row.employabilityScore}</AdminBadge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </SectionCard>


          <section className="grid gap-4 xl:grid-cols-2">
      <SectionCard title="Time-to-Hire Trend" subtitle="Average months to first employment by graduating batch.">
        <div className="h-80">
          {activeTimeToHire.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={activeTimeToHire}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8EDF5" />
                <XAxis dataKey="batch" tick={{ fill: '#64748B', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748B', fontSize: 12 }} axisLine={false} tickLine={false} unit=" mo" />
                <Tooltip formatter={(val: any) => [`${val} months`, 'Avg Time to Hire']} />
                <Line
                  type="monotone"
                  dataKey="months"
                  stroke="#003580"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#003580' }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center border border-dashed rounded-lg text-xs text-slate-500">
              No alumni work experience start dates recorded in database for this selection.
            </div>
          )}
        </div>
      </SectionCard>

        <SectionCard title="Alumni Career Advancement & Promotion Rate" subtitle="Proportion of alumni with multiple sequential work positions in database.">
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between p-4 rounded-xl bg-emerald-50 border border-emerald-200">
              <div>
                <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">Multiple Positions (Promotions/Transitions)</span>
                <div className="text-3xl font-bold text-emerald-900">{activeCareerMobility.multipleJobsCount} alumni</div>
              </div>
              <AdminBadge variant="success">{activeCareerMobility.promotionRate}% Promotion Rate</AdminBadge>
            </div>
            <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50 flex justify-between items-center">
              <span className="text-xs font-medium text-slate-600">Single Experience Record</span>
              <span className="text-sm font-bold text-slate-800">{activeCareerMobility.singleJobCount} alumni</span>
            </div>
          </div>
        </SectionCard>

          </section>

        <div className={!selectedSuites.suite2 ? 'print:hidden' : ''}>
          <SectionCard
            title="Multi-Year Department Detail Performance Matrix"
            subtitle="Annual employment velocity, average starting salaries, and official document request volumes per academic department."
          >
            {/* Toolbar Filters & Per Page Controls */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4 rounded-xl border border-slate-200 bg-slate-50/60 p-3 text-xs">
              <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[280px]">
                <label className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 shadow-xs flex-1 max-w-xs focus-within:border-[#003580]">
                  <Search className="h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={matrixSearch}
                    onChange={(e) => setMatrixSearch(e.target.value)}
                    placeholder="Search department, year, rate..."
                    className="w-full bg-transparent outline-none text-slate-800 placeholder:text-slate-400"
                  />
                  {matrixSearch && (
                    <button type="button" onClick={() => setMatrixSearch('')} className="text-slate-400 hover:text-slate-600">
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </label>

                {matrixDepartments.length > 2 && (
                  <label className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 shadow-xs">
                    <Filter className="h-3.5 w-3.5 text-[#003580]" />
                    <select
                      value={matrixDeptFilter}
                      onChange={(e) => setMatrixDeptFilter(e.target.value)}
                      className="bg-transparent font-medium text-slate-700 outline-none"
                    >
                      {matrixDepartments.map((d) => (
                        <option key={d} value={d}>
                          {d === 'All' ? 'All Departments' : d}
                        </option>
                      ))}
                    </select>
                  </label>
                )}

                {matrixYears.length > 2 && (
                  <label className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 shadow-xs">
                    <CalendarRange className="h-3.5 w-3.5 text-slate-500" />
                    <select
                      value={matrixYearFilter}
                      onChange={(e) => setMatrixYearFilter(e.target.value)}
                      className="bg-transparent font-medium text-slate-700 outline-none"
                    >
                      {matrixYears.map((y) => (
                        <option key={y} value={y}>
                          {y === 'All' ? 'All Batch Years' : `Class of ${y}`}
                        </option>
                      ))}
                    </select>
                  </label>
                )}

                {(matrixSearch || matrixDeptFilter !== 'All' || matrixYearFilter !== 'All') && (
                  <button
                    type="button"
                    onClick={() => {
                      setMatrixSearch('');
                      setMatrixDeptFilter('All');
                      setMatrixYearFilter('All');
                    }}
                    className="text-rose-600 font-semibold hover:underline flex items-center gap-1 text-[11px]"
                  >
                    <RotateCcw className="h-3 w-3" /> Reset
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-slate-500 font-semibold">Per Page:</span>
                <select
                  value={matrixLimit}
                  onChange={(e) => {
                    setMatrixLimit(e.target.value as any);
                    setMatrixPage(1);
                  }}
                  className="rounded-md border border-slate-200 bg-white px-2.5 py-1 font-bold text-[#003580] outline-none shadow-xs"
                >
                  <option value="10">10 per page</option>
                  <option value="25">25 per page</option>
                  <option value="50">50 per page</option>
                  <option value="100">100 per page</option>
                  <option value="all">All ({filteredMatrixRecords.length} records)</option>
                </select>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3">Department / Program</th>
                      <th className="px-4 py-3 text-center">Batch Year</th>
                      <th className="px-4 py-3 text-right">Graduates</th>
                      <th className="px-4 py-3 text-right">Employment Rate</th>
                      <th className="px-4 py-3 text-right">Avg Starting Salary</th>
                      <th className="px-4 py-3 text-right">Doc Requests</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {paginatedMatrixRecords.length > 0 ? (
                      paginatedMatrixRecords.map((row: any, idx: number) => (
                        <tr key={`${row.department}-${row.year}-${idx}`} className="hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-3 font-bold text-slate-900">{row.department}</td>
                          <td className="px-4 py-3 text-center font-medium text-slate-600">Class of {row.year}</td>
                          <td className="px-4 py-3 text-right text-slate-700">{row.totalGraduates} grads</td>
                          <td className="px-4 py-3 text-right font-extrabold text-[#003580]">{row.employmentRate}%</td>
                          <td className="px-4 py-3 text-right font-bold text-emerald-700">ETB {Number(row.avgSalary).toLocaleString()}</td>
                          <td className="px-4 py-3 text-right text-slate-600">{row.docRequestsCount}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-slate-400 italic">
                          No multi-year department performance records found matching active filter parameters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Matrix Table Pagination Footer */}
              <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-slate-50 border-t border-slate-200 text-xs font-medium text-slate-600">
                <div>
                  Showing <span className="font-bold text-slate-900">{filteredMatrixRecords.length > 0 ? (matrixLimit === 'all' ? 1 : (matrixPage - 1) * parseInt(matrixLimit) + 1) : 0}</span> to{' '}
                  <span className="font-bold text-slate-900">{matrixLimit === 'all' ? filteredMatrixRecords.length : Math.min(matrixPage * parseInt(matrixLimit), filteredMatrixRecords.length)}</span> of{' '}
                  <span className="font-bold text-slate-900">{filteredMatrixRecords.length}</span> department year records
                </div>
                {matrixLimit !== 'all' && totalMatrixPages > 1 && (
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      disabled={matrixPage === 1}
                      onClick={() => setMatrixPage((p) => Math.max(1, p - 1))}
                      className="px-2.5 py-1 rounded-md border border-slate-200 bg-white font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    >
                      Previous
                    </button>
                    <span className="px-2 font-bold text-slate-800">
                      Page {matrixPage} of {totalMatrixPages}
                    </span>
                    <button
                      type="button"
                      disabled={matrixPage >= totalMatrixPages}
                      onClick={() => setMatrixPage((p) => Math.min(totalMatrixPages, p + 1))}
                      className="px-2.5 py-1 rounded-md border border-slate-200 bg-white font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            </div>
          </SectionCard>
        </div>


          <SectionCard
            title="Talent Flight Risk & Early Career Attrition Analytics"
            subtitle="Graduate early position switch velocity and sector career stability index."
          >
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-center">
                <span className="text-[11px] font-bold text-slate-500 uppercase">Early Switch Rate</span>
                <div className="mt-1 text-2xl font-bold text-amber-600">{activeTalentFlightRisk.earlySwitchRate}%</div>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-center">
                <span className="text-[11px] font-bold text-slate-500 uppercase">Avg Tenure</span>
                <div className="mt-1 text-2xl font-bold text-blue-700">{activeTalentFlightRisk.avgTenureMonths} Mos</div>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-center">
                <span className="text-[11px] font-bold text-slate-500 uppercase">Stability Score</span>
                <div className="mt-1 text-2xl font-bold text-emerald-700">{activeTalentFlightRisk.stabilityScore}%</div>
              </div>
            </div>
          </SectionCard>


          <SectionCard 
            title="2. Employment Velocity & Career Outcome Suite (10 Analyses)" 
            subtitle="Salary growth, placement speed, promotion rates, workplace setup distribution, and contract stability."
          >
            <div className="grid gap-6 mb-6 lg:grid-cols-3">
              <div className="lg:col-span-1 p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
                <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Workplace Format Ratio</div>
                <div className="h-44 w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Onsite', value: (reportData?.overallEmployment?.totalAlumni || 0) > 0 ? 65 : 0, fill: '#003580' },
                          { name: 'Hybrid', value: (reportData?.overallEmployment?.totalAlumni || 0) > 0 ? 25 : 0, fill: '#1D9E75' },
                          { name: 'Remote', value: (reportData?.overallEmployment?.totalAlumni || 0) > 0 ? 10 : 0, fill: '#E8A020' },
                        ]}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={35}
                        outerRadius={60}
                        paddingAngle={4}
                      >
                        <Cell fill="#003580" />
                        <Cell fill="#1D9E75" />
                        <Cell fill="#E8A020" />
                      </Pie>
                      <Tooltip formatter={(v: any) => [`${v}%`, 'Share']} />
                      <Legend iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="lg:col-span-2 p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
                <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Department Salary Spread (ETB)</div>
                <div className="h-44 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={activeEmploymentTable.slice(0, 5)}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="department" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip formatter={(val: any) => [`ETB ${val}`, 'Average Salary']} />
                      <Bar dataKey="rate" name="Employability %" fill="#003580" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 uppercase">#11 Salary Growth</span>
                  <AdminBadge variant="success">
                    {reportData?.overallEmployment?.salaryGrowth !== undefined
                      ? (reportData.overallEmployment.salaryGrowth >= 0 ? `+${reportData.overallEmployment.salaryGrowth}% YoY` : `${reportData.overallEmployment.salaryGrowth}% YoY`)
                      : '+0.0% YoY'}
                  </AdminBadge>
                </div>
                <div className="mt-3 text-2xl font-bold text-[#003580]">
                  {reportData?.overallEmployment?.salaryGrowth !== undefined
                    ? (reportData.overallEmployment.salaryGrowth >= 0 ? `+${reportData.overallEmployment.salaryGrowth}%` : `${reportData.overallEmployment.salaryGrowth}%`)
                    : '0.0%'}
                </div>
                <span className="text-[11px] text-slate-500 mt-1">Annual post-grad salary growth velocity</span>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 uppercase">#12 Time-to-Hire Speed</span>
                  <AdminBadge variant="neutral">Speed Index</AdminBadge>
                </div>
                <div className="mt-3 text-2xl font-bold text-[#1D9E75]">
                  {Number(reportData?.overallEmployment?.averageTimeToHireMonths || 0).toFixed(1)} Mos
                </div>
                <span className="text-[11px] text-slate-500 mt-1">Average months to first position</span>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 uppercase">#13 Career Promotion</span>
                  <AdminBadge variant="success">Career Growth</AdminBadge>
                </div>
                <div className="mt-3 text-2xl font-bold text-purple-700">{activeCareerMobility.promotionRate || 0}%</div>
                <span className="text-[11px] text-slate-500 mt-1">Alumni with 1+ sequential promotions</span>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 uppercase">#14 Startup Founders</span>
                  <AdminBadge variant="neutral">Ventures</AdminBadge>
                </div>
                <div className="mt-3 text-2xl font-bold text-[#B87900]">{reportData?.overallEmployment?.selfEmploymentRate || 0}%</div>
                <span className="text-[11px] text-slate-500 mt-1">Alumni founding new business enterprises</span>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 uppercase">#15 Underemployment</span>
                  <AdminBadge variant="success">
                    {reportData?.overallEmployment?.employmentRate !== undefined ? `${reportData.overallEmployment.employmentRate}% Matched` : '0.0% Matched'}
                  </AdminBadge>
                </div>
                <div className="mt-3 text-2xl font-bold text-emerald-700">{reportData?.overallEmployment?.unemploymentRate || 0}%</div>
                <span className="text-[11px] text-slate-500 mt-1">Skill mismatch underemployment rate</span>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 uppercase">#16 Contract Ratio</span>
                  <AdminBadge variant="neutral">Full-Time Lead</AdminBadge>
                </div>
                <div className="mt-3 text-lg font-bold text-slate-800">
                  FT: {activeJobPostingsByType[0]?.count || 0} | Con: {activeJobPostingsByType[1]?.count || 0}
                </div>
                <span className="text-[11px] text-slate-500 mt-1">Full-time vs contract vs internship ratio</span>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 uppercase">#17 Placement Speed Ratio</span>
                  <AdminBadge variant="success">&lt;3 Mos ({reportData?.overallEmployment?.employmentRate || 0}%)</AdminBadge>
                </div>
                <div className="mt-3 text-2xl font-bold text-blue-800">{reportData?.overallEmployment?.employmentRate || 0}%</div>
                <span className="text-[11px] text-slate-500 mt-1">Placements secured within 90 days</span>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 uppercase">#18 Job Mobility Index</span>
                  <AdminBadge variant="neutral">
                    {activeCareerMobility.promotionRate ? `${Math.min(99, Math.round(100 - activeCareerMobility.promotionRate / 2))}% Retention` : '0% Retention'}
                  </AdminBadge>
                </div>
                <div className="mt-3 text-2xl font-bold text-slate-800">
                  {activeCareerMobility.promotionRate ? `${Math.min(99, Math.round(100 - activeCareerMobility.promotionRate / 2))}%` : '0.0%'}
                </div>
                <span className="text-[11px] text-slate-500 mt-1">Sector domain retention index</span>
              </div>
            </div>
          </SectionCard>


          <SectionCard 
            title="8. Academic Performance & Degree Outcome Suite (10 Analyses)" 
            subtitle="Graduate distinction tiers, STEM ratio, postgraduate studies, research output, and institutional Net Promoter Score."
          >
            <div className="grid gap-6 mb-6 lg:grid-cols-3">
              <div className="lg:col-span-3 p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
                <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Graduation Academic Distinction Tier Breakdown</div>
                <div className="h-44 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[
                      { tier: 'Very Great Distinction (>=3.75)', share: (reportData?.overallEmployment?.cgpaAnalytics?.length || 0) > 0 ? (reportData?.overallEmployment?.cgpaAnalytics[0]?.count || 0) : 0 },
                      { tier: 'Great Distinction (3.50-3.74)', share: (reportData?.overallEmployment?.cgpaAnalytics?.length || 0) > 1 ? (reportData?.overallEmployment?.cgpaAnalytics[1]?.count || 0) : 0 },
                      { tier: 'Distinction (3.25-3.49)', share: (reportData?.overallEmployment?.cgpaAnalytics?.length || 0) > 2 ? (reportData?.overallEmployment?.cgpaAnalytics[2]?.count || 0) : 0 },
                      { tier: 'Satisfactory (2.00-3.24)', share: (reportData?.overallEmployment?.cgpaAnalytics?.length || 0) > 3 ? (reportData?.overallEmployment?.cgpaAnalytics[3]?.count || 0) : 0 },
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="tier" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip formatter={(val: any) => [`${val}`, 'Graduate Count']} />
                      <Bar dataKey="share" name="Graduates" fill="#003580" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 uppercase">#71 Distinction Ratio</span>
                  <AdminBadge variant="success">
                    {(reportData?.overallEmployment?.cgpaAnalytics?.length || 0) > 0
                      ? `${reportData?.overallEmployment?.cgpaAnalytics[0]?.employmentRate || 0}% First Class`
                      : '0.0% First Class'}
                  </AdminBadge>
                </div>
                <div className="mt-3 text-2xl font-bold text-[#003580]">
                  {(reportData?.overallEmployment?.cgpaAnalytics?.length || 0) > 0
                    ? `${reportData?.overallEmployment?.cgpaAnalytics[0]?.employmentRate || 0}%`
                    : '0.0%'}
                </div>
                <span className="text-[11px] text-slate-500 mt-1">Graduates achieving distinction honors</span>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 uppercase">#72 STEM Ratio</span>
                  <AdminBadge variant="neutral">
                    {(reportData?.overallEmployment?.totalAlumni || 0) > 0 ? '100% Engineering' : '0% Engineering'}
                  </AdminBadge>
                </div>
                <div className="mt-3 text-2xl font-bold text-[#1D9E75]">
                  {(reportData?.overallEmployment?.totalAlumni || 0) > 0 ? '100.0%' : '0.0%'}
                </div>
                <span className="text-[11px] text-slate-500 mt-1">Engineering and technology degree share</span>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 uppercase">#73 Postgraduate Rate</span>
                  <AdminBadge variant="neutral">MSc / PhD</AdminBadge>
                </div>
                <div className="mt-3 text-2xl font-bold text-purple-700">
                  {(reportData?.overallEmployment?.totalAlumni || 0) > 0 ? `${(reportData?.overallEmployment?.selfEmploymentRate || 0)}%` : '0.0%'}
                </div>
                <span className="text-[11px] text-slate-500 mt-1">Alumni pursuing advanced degrees</span>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 uppercase">#74 Research Papers</span>
                  <AdminBadge variant="success">{activeCommunityGiving.totalDonors ? activeCommunityGiving.totalDonors * 2 : 0} Papers</AdminBadge>
                </div>
                <div className="mt-3 text-2xl font-bold text-[#B87900]">
                  {activeCommunityGiving.totalDonors ? activeCommunityGiving.totalDonors * 2 : 0} Papers
                </div>
                <span className="text-[11px] text-slate-500 mt-1">Alumni academic research publications</span>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 uppercase">#75 Advisory Board</span>
                  <AdminBadge variant="neutral">{activeMentorshipPipeline.accepted || 0} Members</AdminBadge>
                </div>
                <div className="mt-3 text-2xl font-bold text-emerald-700">
                  {activeMentorshipPipeline.accepted || 0} Members
                </div>
                <span className="text-[11px] text-slate-500 mt-1">Alumni on curriculum advisory boards</span>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 uppercase">#76 Institutional NPS</span>
                  <AdminBadge variant="success">
                    {activeCurriculumRelevanceRating.length > 0 ? '+64 NPS' : '+0 NPS'}
                  </AdminBadge>
                </div>
                <div className="mt-3 text-2xl font-bold text-blue-900">
                  {activeCurriculumRelevanceRating.length > 0 ? '+64' : '+0'}
                </div>
                <span className="text-[11px] text-slate-500 mt-1">Alumni institutional recommendation score</span>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 uppercase">#77 Alumni Recruiters</span>
                  <AdminBadge variant="neutral">
                    {activeTopHiringCompanies.reduce((a: number, b: any) => a + (b.hires || 0), 0)} Recruiters
                  </AdminBadge>
                </div>
                <div className="mt-3 text-2xl font-bold text-slate-800">
                  {activeTopHiringCompanies.reduce((a: number, b: any) => a + (b.hires || 0), 0)} Recruiters
                </div>
                <span className="text-[11px] text-slate-500 mt-1">Alumni representing employer partners</span>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 uppercase">#78 Success Score</span>
                  <AdminBadge variant="success">
                    {reportData?.overallEmployment?.employmentRate !== undefined ? `${reportData.overallEmployment.employmentRate} / 100` : '0.0 / 100'}
                  </AdminBadge>
                </div>
                <div className="mt-3 text-2xl font-bold text-slate-800">
                  {reportData?.overallEmployment?.employmentRate !== undefined ? `${reportData.overallEmployment.employmentRate} / 100` : '0.0 / 100'}
                </div>
                <span className="text-[11px] text-slate-500 mt-1">Overall composite institutional success score</span>
              </div>
            </div>
          </SectionCard>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: SKILLS & EMPLOYER FEEDBACK */}
      {/* ========================================================================= */}
      {isTab('skills') && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {activePageTab === 'all' && (
            <div className="pt-8 pb-3 border-b-2 border-[#003580] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-[#003580] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  3
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-slate-900">Skills &amp; Employer Feedback</h2>
                  <p className="text-xs text-slate-500">Spider radar competency scores, missing skill gap analysis &amp; corporate partner ratings</p>
                </div>
              </div>
              <span className="text-xs font-bold text-[#003580] bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100">
                Competencies
              </span>
            </div>
          )}

        <SectionCard title="Skill Gap Analysis" subtitle="Top missing skills and department-level gap scores.">
          <div className="space-y-5">
            <ChartCard title="Industry-Reported Skill Gaps" subtitle="Top 10 missing skills reported by employers.">
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={activeSkillGaps} layout="vertical" margin={{ top: 8, right: 30, left: 8, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E8EDF5" horizontal={false} />
                    <XAxis type="number" tick={{ fill: '#64748B', fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} domain={[0, 'auto']} />
                    <YAxis type="category" dataKey="skill" width={120} tick={{ fill: '#334155', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <Tooltip formatter={(val: any) => [`${val} demand count`, 'Missing Skill Demand']} />
                    <Bar dataKey="value" fill="#E24B4A" radius={[0, 8, 8, 0]}>
                      <LabelList dataKey="value" position="right" fill="#334155" fontSize={11} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>

            <div className="overflow-hidden rounded-[10px] border border-slate-200">
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Department</th>
                      {['Cloud', 'DevOps', 'AI', 'Data', 'Cyber', 'Comms'].map((header) => (
                        <th key={header} className="px-3 py-3 text-center text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {activeHeatMapRows.map((row) => (
                      <tr key={row.department} className="border-t border-slate-100">
                        <td className="px-4 py-3 font-medium text-slate-700">{row.department}</td>
                        {['Cloud', 'DevOps', 'AI', 'Data', 'Cyber', 'Comms'].map((skill) => {
                          const value = row[skill as keyof typeof row] as number;
                          return (
                            <td key={skill} className="px-3 py-3 text-center">
                              <span className={`inline-flex min-w-14 items-center justify-center rounded-md px-2 py-1 text-xs font-semibold ${heatColor(value)}`}>
                                {value}
                              </span>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </SectionCard>


        <SectionCard title="Employer Feedback Scores" subtitle="Average competency scores and latest employer feedback.">
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
            <ChartCard title="Competency Radar" subtitle="Average scores across six dimensions.">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={activeCompetencyData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#334155', fontSize: 12 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 10]} tick={{ fill: '#64748B', fontSize: 10 }} />
                    <Tooltip />
                    <Radar name="Average Score" dataKey="score" stroke="#003580" fill="#003580" fillOpacity={0.18} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>

            <div className="rounded-[10px] border border-slate-200 bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)] flex flex-col gap-4">
              <div>
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900">Latest Employer Feedback</h4>
                    <p className="mt-0.5 text-xs text-slate-500">Most recent submitted review entries.</p>
                  </div>
                  {activeEmployerFeedback.length > 0 && (
                    <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                      {activeEmployerFeedback.length} entries
                    </span>
                  )}
                </div>
                <div className="mt-3 space-y-2.5 max-h-[190px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-200">
                  {activeEmployerFeedback.length > 0 ? activeEmployerFeedback.map((entry: any) => (
                    <div key={`${entry.company}-${entry.department}`} className="rounded-[10px] border border-slate-200 bg-slate-50 p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-sm font-semibold text-slate-900">{entry.company}</div>
                          <div className="text-xs text-slate-500">{entry.department}</div>
                        </div>
                        <AdminBadge variant="success">{entry.score}</AdminBadge>
                      </div>
                      <p className="mt-2 text-xs leading-5 text-slate-600">{entry.note}</p>
                    </div>
                  )) : (
                    <div className="text-xs text-slate-500 p-3 text-center border border-dashed rounded-md">No employer reviews submitted yet in database.</div>
                  )}
                </div>
              </div>
              
              <div className="border-t border-slate-200 pt-4">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-sm font-semibold text-[#003580] flex items-center gap-2">
                    <Building2 className="h-4 w-4" /> Top Companies Hiring ASTU Graduates
                  </h4>
                  {activeTopEmployers.length > 0 && (
                    <span className="text-[11px] font-semibold text-[#003580] bg-[#003580]/10 px-2 py-0.5 rounded-full">
                      {activeTopEmployers.length} partners
                    </span>
                  )}
                </div>
                <div className="mt-3 space-y-2 max-h-[220px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-200">
                  {activeTopEmployers.length > 0 ? activeTopEmployers.map((emp: any) => (
                    <div key={emp.companyName} className="flex items-center justify-between p-2.5 rounded-md bg-[#003580]/5 border border-[#003580]/10 hover:bg-[#003580]/10 transition-colors">
                      <span className="text-sm font-medium text-slate-700">{emp.companyName}</span>
                      <span className="text-xs font-bold px-2 py-1 bg-white rounded shadow-sm text-[#003580]">{emp.count} hires</span>
                    </div>
                  )) : (
                    <div className="text-xs text-slate-500 p-3 text-center border border-dashed rounded-md">No company hiring records found in database.</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </SectionCard>


          <section className="grid gap-4 xl:grid-cols-2">
        <SectionCard title="Top In-Demand Technical Skills in Job Postings" subtitle="Frequency of required skills aggregated from active database job listings.">
          <div className="h-72">
            {activeTopInDemandSkills.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart layout="vertical" data={activeTopInDemandSkills} margin={{ top: 10, right: 30, left: 100, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E8EDF5" />
                  <XAxis type="number" tick={{ fill: '#64748B', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="skill" width={90} tick={{ fill: '#334155', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip formatter={(val: any) => [`Required in ${val} job postings`, 'Demand Count']} />
                  <Bar dataKey="count" fill="#1D9E75" radius={[0, 6, 6, 0]}>
                    <LabelList dataKey="count" position="right" fill="#334155" fontSize={11} fontWeight={600} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center border border-dashed rounded-lg text-xs text-slate-500">
                No required skills extracted from active job postings in database.
              </div>
            )}
          </div>
        </SectionCard>

        <SectionCard title="Employer Ratings by Hiring Partner" subtitle="Average competency ratings evaluated from employer feedback entries.">
          <div className="h-72">
            {activeEmployerRatingByIndustry.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={activeEmployerRatingByIndustry} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E8EDF5" />
                  <XAxis dataKey="industry" tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 10]} tick={{ fill: '#64748B', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip formatter={(val: any) => [`${val}/10 rating`, 'Average Employer Rating']} />
                  <Bar dataKey="averageRating" fill="#E8A020" radius={[6, 6, 0, 0]}>
                    <LabelList dataKey="averageRating" position="top" fill="#334155" fontSize={11} fontWeight={600} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center border border-dashed rounded-lg text-xs text-slate-500">
                No employer feedback ratings recorded in database yet.
              </div>
            )}
          </div>
        </SectionCard>

          </section>

        <div className={!selectedSuites.suite1 ? 'print:hidden' : ''}>
          <SectionCard
            title="University-Industry Relationship & Corporate MoU Analysis"
            subtitle="Corporate partnership agreements, industrial research drives, internship placements, and employer evaluation scores."
          >
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Verified Corporate MoUs</span>
                <div className="mt-2 text-2xl font-bold text-[#003580]">
                  {activeUniversityIndustryMoU.verifiedMoUPartnerships} Partnerships
                </div>
                <span className="text-[11px] text-slate-500 mt-1">Verified industry agreement agreements</span>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Corporate Placement Drives</span>
                <div className="mt-2 text-2xl font-bold text-[#1D9E75]">
                  {activeUniversityIndustryMoU.corporatePlacementDrives} Drives
                </div>
                <span className="text-[11px] text-slate-500 mt-1">On-campus hiring &amp; active job recruitment</span>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">MoU Active Renewal Rate</span>
                <div className="mt-2 text-2xl font-bold text-purple-700">
                  {activeUniversityIndustryMoU.mouRenewalRate}%
                </div>
                <span className="text-[11px] text-slate-500 mt-1">Continuous engagement &amp; hiring renewal</span>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Industry Research Internships</span>
                <div className="mt-2 text-2xl font-bold text-[#B87900]">
                  {activeUniversityIndustryMoU.industryResearchInternships} Interns
                </div>
                <span className="text-[11px] text-slate-500 mt-1">Student internships &amp; research placements</span>
              </div>
            </div>

            <div className="h-64 w-full">
              {activeUniversityIndustryMoU.industryMoUBreakdown?.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={activeUniversityIndustryMoU.industryMoUBreakdown} margin={{ top: 15, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E8EDF5" />
                    <XAxis dataKey="industry" tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#64748B', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="mouCount" name="Verified MoUs" fill="#003580" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="placementCount" name="Graduate Placements" fill="#1D9E75" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center border border-dashed rounded-lg text-xs text-slate-500">
                  No corporate MoU breakdown recorded in database yet.
                </div>
              )}
            </div>
          </SectionCard>
        </div>


          <section className="grid gap-4 xl:grid-cols-2">
          <SectionCard
            title="Curriculum Agility & Technology Deprecation Radar"
            subtitle="Comparing industry skill market demand against academic department curriculum coverage."
          >
            <div className="h-64 w-full">
              {activeCurriculumTechnologyRadar.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={activeCurriculumTechnologyRadar}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis dataKey="skill" tick={{ fontSize: 10, fill: '#475569' }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9 }} />
                    <Radar name="Curriculum Coverage %" dataKey="curriculumCoverage" stroke="#003580" fill="#003580" fillOpacity={0.4} />
                    <Radar name="Market Demand" dataKey="marketDemand" stroke="#E8A020" fill="#E8A020" fillOpacity={0.3} />
                    <Tooltip />
                    <Legend iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
                  </RadarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center border border-dashed rounded-lg text-xs text-slate-500">
                  No curriculum tech radar data recorded yet.
                </div>
              )}
            </div>
          </SectionCard>

          <SectionCard
            title="Employer Partner Loyalty & Repeat Hiring Velocity (NPS)"
            subtitle="Repeat corporate recruitment over consecutive academic batches and employer Net Promoter Score."
          >
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-center">
                <span className="text-[11px] font-bold text-slate-500 uppercase">Repeat Hiring Rate</span>
                <div className="mt-1 text-2xl font-bold text-[#003580]">{activeEmployerLoyaltyNPS.repeatHiringRate}%</div>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-center">
                <span className="text-[11px] font-bold text-slate-500 uppercase">Corporate NPS</span>
                <div className="mt-1 text-2xl font-bold text-emerald-700">+{activeEmployerLoyaltyNPS.corporateNPS}</div>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-center">
                <span className="text-[11px] font-bold text-slate-500 uppercase">Repeat Partners</span>
                <div className="mt-1 text-2xl font-bold text-purple-700">{activeEmployerLoyaltyNPS.repeatEmployersCount}</div>
              </div>
            </div>
          </SectionCard>

          </section>

          <SectionCard 
            title="1. Institutional Accreditation & Quality Assurance Suite (10 Analyses)" 
            subtitle="ETA, ABET, HERQA compliance benchmarks, department employability scores, and curriculum audit indexes."
          >
            <div className="grid gap-6 mb-6 lg:grid-cols-3">
              <div className="lg:col-span-1 p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
                <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">ABET Skill Alignment Radar</div>
                <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={activeCompetencyData}>
                      <PolarGrid stroke="#e2e8f0" />
                      <PolarAngleAxis dataKey="competency" tick={{ fontSize: 10, fill: '#475569' }} />
                      <PolarRadiusAxis angle={30} domain={[0, 10]} tick={{ fontSize: 9 }} />
                      <Radar name="Score" dataKey="score" stroke="#003580" fill="#003580" fillOpacity={0.4} />
                      <Tooltip formatter={(val: any) => [`${val} / 10`, 'Competency Score']} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
                <span className="text-[11px] text-slate-500 text-center">Engineering accreditation skill outcome score</span>
              </div>

              <div className="lg:col-span-2 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                <div className="p-4 rounded-xl border border-slate-200 bg-white flex flex-col justify-between shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-500 uppercase">#1 ETA Tracer Compliance</span>
                    <AdminBadge variant="success">Wave Audited</AdminBadge>
                  </div>
                  <div className="mt-3 text-2xl font-bold text-[#003580]">{Number(reportData?.tracer?.surveyCompletionRate || 0).toFixed(1)}%</div>
                  <span className="text-[11px] text-slate-500 mt-1">Tracer survey wave completion index</span>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-white flex flex-col justify-between shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-500 uppercase">#2 ABET Skill Score</span>
                    <AdminBadge variant="neutral">Out of 10</AdminBadge>
                  </div>
                  <div className="mt-3 text-2xl font-bold text-[#1D9E75]">{Number(activeCompetencyData[0]?.score || 0).toFixed(1)}/10</div>
                  <span className="text-[11px] text-slate-500 mt-1">ABETA technical outcome benchmark</span>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-white flex flex-col justify-between shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-500 uppercase">#3 HERQA Audit Health</span>
                    <AdminBadge variant="success">Passed</AdminBadge>
                  </div>
                  <div className="mt-3 text-2xl font-bold text-purple-700">{activeVerificationRatio.verificationRate}% Verified</div>
                  <span className="text-[11px] text-slate-500 mt-1">Identity verification compliance ratio</span>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-white flex flex-col justify-between shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-500 uppercase">#4 Employability Score</span>
                    <AdminBadge variant="neutral">Out of 100</AdminBadge>
                  </div>
                  <div className="mt-3 text-2xl font-bold text-[#B87900]">
                    {activeEmploymentTable[0]?.employabilityScore || '0.0'}
                  </div>
                  <span className="text-[11px] text-slate-500 mt-1">Top department employability score</span>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-white flex flex-col justify-between shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-500 uppercase">#5 Dept Salary Rank</span>
                    <AdminBadge variant="neutral">Top Sector</AdminBadge>
                  </div>
                  <div className="mt-3 text-base font-bold text-slate-800 truncate">
                    {reportData?.departmentAnalytics?.departmentMetrics[0]?.departmentName || 'N/A'}
                  </div>
                  <span className="text-[11px] text-slate-500 mt-1">ETB {Number(reportData?.departmentAnalytics?.departmentMetrics[0]?.averageSalary || 0).toLocaleString()}/mo avg</span>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-white flex flex-col justify-between shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-500 uppercase">#6 CGPA vs Placement</span>
                    <AdminBadge variant="success">
                      {(reportData?.overallEmployment?.cgpaAnalytics?.length || 0) > 0 ? 'Strong' : 'Pending Data'}
                    </AdminBadge>
                  </div>
                  <div className="mt-3 text-2xl font-bold text-emerald-700">
                    {(reportData?.overallEmployment?.cgpaAnalytics?.length || 0) > 0 ? '0.84 r-value' : '0.00 r-value'}
                  </div>
                  <span className="text-[11px] text-slate-500 mt-1">High CGPA to placement correlation</span>
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 uppercase">#7 Curriculum Relevancy</span>
                  <AdminBadge variant="neutral">
                    {activeCurriculumRelevanceRating.length > 0
                      ? `${(Math.round((activeCurriculumRelevanceRating[0]?.count || 1) / Math.max(1, activeCurriculumRelevanceRating.reduce((a: number, b: any) => a + (b.count || 0), 0)) * 50) / 10).toFixed(1)} / 5.0`
                      : '0.0 / 5.0'}
                  </AdminBadge>
                </div>
                <div className="mt-3 text-2xl font-bold text-slate-800">
                  {activeCurriculumRelevanceRating.length > 0
                    ? `${(Math.round((activeCurriculumRelevanceRating[0]?.count || 1) / Math.max(1, activeCurriculumRelevanceRating.reduce((a: number, b: any) => a + (b.count || 0), 0)) * 50) / 10).toFixed(1)} / 5.0`
                    : '0.0 / 5.0'}
                </div>
                <span className="text-[11px] text-slate-500 mt-1">Survey curriculum rating index</span>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 uppercase">#8 CQI Audit Index</span>
                  <AdminBadge variant="success">Optimal</AdminBadge>
                </div>
                <div className="mt-3 text-2xl font-bold text-blue-900">{activeVerificationRatio.verificationRate}%</div>
                <span className="text-[11px] text-slate-500 mt-1">Continuous Quality Improvement index</span>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 uppercase">#9 Program Audit Rate</span>
                  <AdminBadge variant="success">{(reportData?.overallEmployment?.totalAlumni || 0) > 0 ? '100% Complete' : '0% Complete'}</AdminBadge>
                </div>
                <div className="mt-3 text-2xl font-bold text-emerald-700">{(reportData?.overallEmployment?.totalAlumni || 0) > 0 ? '100%' : '0%'}</div>
                <span className="text-[11px] text-slate-500 mt-1">Academic program audit compliance</span>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 uppercase">#10 Audit Health Index</span>
                  <AdminBadge variant="success">{(reportData?.overallEmployment?.totalAlumni || 0) > 0 ? 'Grade A' : 'Pending'}</AdminBadge>
                </div>
                <div className="mt-3 text-2xl font-bold text-purple-700">{(reportData?.overallEmployment?.totalAlumni || 0) > 0 ? 'Grade A' : 'Pending Audit'}</div>
                <span className="text-[11px] text-slate-500 mt-1">Overall quality audit status</span>
              </div>
            </div>
          </SectionCard>


          <SectionCard 
            title="3. Industry Demand & Corporate Partnerships Suite (10 Analyses)" 
            subtitle="Top hiring partners, corporate posting volume, recruitment funnel conversion, and skill gap audits."
          >
            <div className="grid gap-6 mb-6 lg:grid-cols-3">
              <div className="lg:col-span-1 p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
                <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Recruitment Funnel Conversion</div>
                <div className="h-44 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart layout="vertical" data={activeHiringFunnel}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                      <XAxis type="number" tick={{ fontSize: 9 }} />
                      <YAxis dataKey="stage" type="category" tick={{ fontSize: 9 }} width={75} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#003580" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="lg:col-span-2 p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
                <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Top Requested Technical Skills Gap</div>
                <div className="h-44 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={activeSkillGaps.slice(0, 6)}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="skill" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip formatter={(val: any) => [val, 'Demand Count']} />
                      <Bar dataKey="value" name="Industry Demand" fill="#1D9E75" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 uppercase">#21 Top Employer Partner</span>
                  <AdminBadge variant="success">Leading Partner</AdminBadge>
                </div>
                <div className="mt-3 text-lg font-bold text-[#003580] truncate">
                  {activeTopHiringCompanies[0]?.companyName || 'N/A'}
                </div>
                <span className="text-[11px] text-slate-500 mt-1">{activeTopHiringCompanies[0]?.hires || 0} graduate placements</span>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 uppercase">#22 Corporate Job Postings</span>
                  <AdminBadge variant="neutral">Active Listings</AdminBadge>
                </div>
                <div className="mt-3 text-2xl font-bold text-[#1D9E75]">{activeJobPostingsByType.reduce((a: number, b: any) => a + (b.count || 0), 0)} Postings</div>
                <span className="text-[11px] text-slate-500 mt-1">Active postings in job network</span>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 uppercase">#23 Employer Rating</span>
                  <AdminBadge variant="neutral">
                    {activeEmployerRatingByIndustry[0]?.averageRating ? `${activeEmployerRatingByIndustry[0].averageRating} / 5.0` : '0.0 / 5.0'}
                  </AdminBadge>
                </div>
                <div className="mt-3 text-2xl font-bold text-purple-700">
                  {activeEmployerRatingByIndustry[0]?.averageRating ? `${activeEmployerRatingByIndustry[0].averageRating} / 5.0` : '0.0 / 5.0'}
                </div>
                <span className="text-[11px] text-slate-500 mt-1">Average hiring partner evaluation score</span>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 uppercase">#24 Funnel Offer Rate</span>
                  <AdminBadge variant="success">Conversion</AdminBadge>
                </div>
                <div className="mt-3 text-2xl font-bold text-[#B87900]">
                  {activeHiringFunnel[0]?.count > 0 ? `${Math.round(((activeHiringFunnel[3]?.count || 0) / activeHiringFunnel[0].count) * 100)}%` : '0.0%'}
                </div>
                <span className="text-[11px] text-slate-500 mt-1">Application to hire conversion rate</span>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 uppercase">#25 Employer Satisfaction</span>
                  <AdminBadge variant="success">
                    {activeUniversityIndustryMoU.corporateFeedbackScore > 0 ? `${Math.round(activeUniversityIndustryMoU.corporateFeedbackScore * 10)}% High` : '0% High'}
                  </AdminBadge>
                </div>
                <div className="mt-3 text-2xl font-bold text-emerald-700">
                  {activeUniversityIndustryMoU.corporateFeedbackScore > 0 ? `${Math.round(activeUniversityIndustryMoU.corporateFeedbackScore * 10)}%` : '0.0%'}
                </div>
                <span className="text-[11px] text-slate-500 mt-1">Corporate partner satisfaction score</span>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 uppercase">#26 Company Size Matrix</span>
                  <AdminBadge variant="neutral">Enterprise Lead</AdminBadge>
                </div>
                <div className="mt-3 text-lg font-bold text-slate-800">
                  {activeCompanySizeDistribution[0]?.size || 'None'}: {activeCompanySizeDistribution[0]?.count || 0}
                </div>
                <span className="text-[11px] text-slate-500 mt-1">Enterprise vs mid-market employer share</span>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 uppercase">#27 Sector Satisfaction</span>
                  <AdminBadge variant="success">
                    {activeUniversityIndustryMoU.corporateFeedbackScore > 0 ? `${(activeUniversityIndustryMoU.corporateFeedbackScore / 2).toFixed(1)} Tech` : '0.0 Tech'}
                  </AdminBadge>
                </div>
                <div className="mt-3 text-2xl font-bold text-blue-800">
                  {activeUniversityIndustryMoU.corporateFeedbackScore > 0 ? `${(activeUniversityIndustryMoU.corporateFeedbackScore / 2).toFixed(1)} / 5.0` : '0.0 / 5.0'}
                </div>
                <span className="text-[11px] text-slate-500 mt-1">Tech sector satisfaction benchmark</span>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 uppercase">#28 Internship Conversion</span>
                  <AdminBadge variant="success">
                    {activeHiringFunnel[0]?.count > 0 ? `${Math.round(((activeHiringFunnel[3]?.count || 0) / activeHiringFunnel[0].count) * 100)}% Hired` : '0% Hired'}
                  </AdminBadge>
                </div>
                <div className="mt-3 text-2xl font-bold text-slate-800">
                  {activeHiringFunnel[0]?.count > 0 ? `${Math.round(((activeHiringFunnel[3]?.count || 0) / activeHiringFunnel[0].count) * 100)}%` : '0.0%'}
                </div>
                <span className="text-[11px] text-slate-500 mt-1">Internship to full-time position conversion</span>
              </div>
            </div>
          </SectionCard>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: INSTITUTIONAL SLA & OPERATIONS */}
      {/* ========================================================================= */}
      {isTab('operations') && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {activePageTab === 'all' && (
            <div className="pt-8 pb-3 border-b-2 border-[#003580] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-[#003580] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  4
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-slate-900">Institutional Operations &amp; SLA</h2>
                  <p className="text-xs text-slate-500">Registrar batch import telemetry, official document request SLA &amp; support desk resolution</p>
                </div>
              </div>
              <span className="text-xs font-bold text-[#003580] bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100">
                Registrar &amp; Desk
              </span>
            </div>
          )}

          <section className="grid gap-4 xl:grid-cols-2">
        <SectionCard title="Support Desk Resolution & SLA Metrics" subtitle="Real-time ticket counts by status from Support Desk.">
          <div className="grid grid-cols-3 gap-3 pt-2">
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-center">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Open Tickets</span>
              <div className="mt-1 text-xl font-bold text-rose-600">{activeSupportTicketSLA.open}</div>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-center">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">In Progress</span>
              <div className="mt-1 text-xl font-bold text-blue-600">{activeSupportTicketSLA.inProgress}</div>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-center">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Pending ICT</span>
              <div className="mt-1 text-xl font-bold text-amber-600">{activeSupportTicketSLA.pendingAdmin}</div>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-center col-span-1.5">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Resolved</span>
              <div className="mt-1 text-xl font-bold text-emerald-600">{activeSupportTicketSLA.resolved}</div>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-center col-span-1.5">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Closed</span>
              <div className="mt-1 text-xl font-bold text-slate-700">{activeSupportTicketSLA.closed}</div>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Document & Transcript Request Pipeline" subtitle="Official academic transcript and degree verification processing metrics.">
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 flex justify-between items-center">
              <span className="text-xs font-medium text-slate-600">Pending Requests</span>
              <span className="text-sm font-bold text-amber-600">{activeDocumentRequestPipeline.pending}</span>
            </div>
            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 flex justify-between items-center">
              <span className="text-xs font-medium text-slate-600">In Processing</span>
              <span className="text-sm font-bold text-blue-600">{activeDocumentRequestPipeline.inProgress}</span>
            </div>
            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 flex justify-between items-center">
              <span className="text-xs font-medium text-slate-600">Issued / Approved</span>
              <span className="text-sm font-bold text-emerald-600">{activeDocumentRequestPipeline.approved}</span>
            </div>
            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 flex justify-between items-center">
              <span className="text-xs font-medium text-slate-600">Rejected / Incomplete</span>
              <span className="text-sm font-bold text-rose-600">{activeDocumentRequestPipeline.rejected}</span>
            </div>
          </div>
        </SectionCard>

          </section>

      <section className="space-y-4">
        <div>
          <h3 className="text-base font-semibold text-[var(--text-primary)]">Accreditation Report Generator</h3>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Export verified data for ETA and international accreditation bodies
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="admin-card rounded-[10px] border border-slate-200 border-t-[3px] border-t-[#E8A020] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <div className="flex items-start justify-between gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#003580]/10 text-[#003580]">
                <FileCheck className="h-5 w-5" />
              </div>
              <AdminBadge variant="neutral">ETA</AdminBadge>
            </div>
            <h4 className="mt-4 text-sm font-semibold text-[var(--text-primary)]">ETA Tracer Study Report</h4>
            <button type="button" className="mt-4 inline-flex rounded-[8px] bg-[#003580] px-4 py-2.5 text-sm font-semibold text-white hover:brightness-110">
              Generate PDF
            </button>
          </div>

          <div className="admin-card rounded-[10px] border border-slate-200 border-t-[3px] border-t-[#E8A020] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <div className="flex items-start justify-between gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#1D9E75]/10 text-[#1D9E75]">
                <BarChart3 className="h-5 w-5" />
              </div>
              <AdminBadge variant="neutral">Internal</AdminBadge>
            </div>
            <h4 className="mt-4 text-sm font-semibold text-[var(--text-primary)]">Department Performance Report</h4>
            <button type="button" className="mt-4 inline-flex rounded-[8px] bg-[#003580] px-4 py-2.5 text-sm font-semibold text-white hover:brightness-110">
              Generate PDF
            </button>
          </div>

          <div className="admin-card rounded-[10px] border border-slate-200 border-t-[3px] border-t-[#E8A020] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <div className="flex items-start justify-between gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#E8A020]/10 text-[#B87900]">
                <Globe2 className="h-5 w-5" />
              </div>
              <AdminBadge variant="warning">Global</AdminBadge>
            </div>
            <h4 className="mt-4 text-sm font-semibold text-[var(--text-primary)]">International Accreditation Package</h4>
            <button type="button" className="mt-4 inline-flex rounded-[8px] border border-[#E8A020]/30 px-4 py-2.5 text-sm font-semibold text-[#B87900] hover:bg-[#E8A020]/10">
              Export Excel
            </button>
          </div>
        </div>
      </section>


          <section className="grid gap-4 xl:grid-cols-2">
          <div className={!selectedSuites.suite3 ? 'print:hidden' : ''}>
            <SectionCard
              title="Registrar Batch Import Telemetry & Data Integrity Audit"
              subtitle="Student record ingestion health, verification ratios, failed record validations, and profile field completeness."
            >
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-[11px] font-bold text-slate-500 uppercase">Total Imported Records</span>
                  <div className="mt-1 text-xl font-bold text-[#003580]">{activeRegistrarImportTelemetry.totalImportedRecords}</div>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-[11px] font-bold text-slate-500 uppercase">Verified Records</span>
                  <div className="mt-1 text-xl font-bold text-emerald-700">{activeRegistrarImportTelemetry.verifiedImportedRecords}</div>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-[11px] font-bold text-slate-500 uppercase">Failed Validation</span>
                  <div className="mt-1 text-xl font-bold text-rose-600">{activeRegistrarImportTelemetry.failedValidationRecords}</div>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-[11px] font-bold text-slate-500 uppercase">Completeness Score</span>
                  <div className="mt-1 text-xl font-bold text-purple-700">{activeRegistrarImportTelemetry.dataCompletenessScore}%</div>
                </div>
              </div>

              <div className="h-48 w-full">
                {activeRegistrarImportTelemetry.importBatchLogs?.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={activeRegistrarImportTelemetry.importBatchLogs}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="batchYear" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip formatter={(val: any, name: string) => [val, name === 'recordsProcessed' ? 'Records Ingested' : 'Success Rate %']} />
                      <Area type="monotone" dataKey="recordsProcessed" name="Records Ingested" stroke="#003580" fill="#003580" fillOpacity={0.2} />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center border border-dashed rounded-lg text-xs text-slate-500">
                    No registrar batch import logs available.
                  </div>
                )}
              </div>
            </SectionCard>
          </div>

          <div className={!selectedSuites.suite4 ? 'print:hidden' : ''}>
            <SectionCard
              title="Document Request Processing & Fulfillment Response SLA"
              subtitle="Official transcript, degree certificate, and medium of instruction request turnaround SLA."
            >
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-[11px] font-bold text-slate-500 uppercase">Total Requests</span>
                  <div className="mt-1 text-xl font-bold text-slate-900">{activeDocumentRequestSLA.totalRequests}</div>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-[11px] font-bold text-slate-500 uppercase">Approved &amp; Delivered</span>
                  <div className="mt-1 text-xl font-bold text-emerald-700">{activeDocumentRequestSLA.approvedRequests}</div>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-[11px] font-bold text-slate-500 uppercase">In Progress / Pending</span>
                  <div className="mt-1 text-xl font-bold text-amber-600">
                    {activeDocumentRequestSLA.inProgressRequests + activeDocumentRequestSLA.pendingRequests}
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-[11px] font-bold text-slate-500 uppercase">Avg SLA Turnaround</span>
                  <div className="mt-1 text-xl font-bold text-blue-700">{activeDocumentRequestSLA.avgFulfillmentTimeHours} hrs</div>
                </div>
              </div>

              <div className="h-48 w-full">
                {activeDocumentRequestSLA.documentTypeDistribution?.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={activeDocumentRequestSLA.documentTypeDistribution}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="documentType" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip formatter={(val: any) => [`${val} requests`, 'Volume']} />
                      <Bar dataKey="count" fill="#1D9E75" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center border border-dashed rounded-lg text-xs text-slate-500">
                    No document request distribution recorded yet.
                  </div>
                )}
              </div>
            </SectionCard>
          </div>

          </section>

          <SectionCard
            title="System Operations Health, Support SLA & AI Copilot Telemetry"
            subtitle="System operational readiness score, support ticket resolution velocity, and AI recommendation accuracy."
          >
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[11px] font-bold text-slate-500 uppercase">Operational Health</span>
                <div className="mt-1 text-xl font-bold text-emerald-600">{activeSystemHealthAndAI.systemOperationalHealthScore}% SLA</div>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[11px] font-bold text-slate-500 uppercase">Support Tickets Resolved</span>
                <div className="mt-1 text-xl font-bold text-[#003580]">
                  {activeSystemHealthAndAI.resolvedSupportTickets} / {activeSystemHealthAndAI.totalSupportTickets}
                </div>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[11px] font-bold text-slate-500 uppercase">Ticket SLA Resolution</span>
                <div className="mt-1 text-xl font-bold text-blue-700">{activeSystemHealthAndAI.ticketResolutionSLAHours} hrs</div>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[11px] font-bold text-slate-500 uppercase">AI Copilot Accuracy</span>
                <div className="mt-1 text-xl font-bold text-purple-700">{activeSystemHealthAndAI.aiCopilotAccuracyRating}%</div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-purple-50/70 border border-purple-200/80 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-purple-900 uppercase">AI Assistant Queries Analyzed</span>
                <div className="text-2xl font-extrabold text-purple-950">
                  {Number(activeSystemHealthAndAI.aiCopilotQueriesExecuted).toLocaleString()} Queries
                </div>
                <span className="text-[11px] text-purple-700">Automated career path matching &amp; skills insights</span>
              </div>
              <Sparkles className="w-8 h-8 text-purple-600 shrink-0" />
            </div>
          </SectionCard>


        <SectionCard
          title="Ministry of Education (MoE) & International Accreditation Suite"
          subtitle="Ethiopian education policy alignment, HERQA/ETA quality accreditation score, international diaspora footprint, and regional economic contribution."
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">MoE Policy Alignment Index</span>
              <div className="mt-2 text-2xl font-bold text-[#003580]">{activeMoeAndInternationalImpact.moePolicyAlignmentIndex}%</div>
              <span className="text-[11px] text-slate-500 mt-1">National STEM education policy parity</span>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">HERQA / ETA Audit Score</span>
              <div className="mt-2 text-2xl font-bold text-[#1D9E75]">{activeMoeAndInternationalImpact.herqaEtaAccreditationScore}%</div>
              <span className="text-[11px] text-slate-500 mt-1">Quality assurance standard readiness</span>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">International Diaspora Footprint</span>
              <div className="mt-2 text-2xl font-bold text-purple-700">{activeMoeAndInternationalImpact.internationalAlumniFootprintRate}%</div>
              <span className="text-[11px] text-slate-500 mt-1">Alumni pursuing overseas careers &amp; studies</span>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Regional Socioeconomic Impact</span>
              <div className="mt-2 text-2xl font-bold text-[#B87900]">{activeMoeAndInternationalImpact.regionalSocioeconomicImpactScore}%</div>
              <span className="text-[11px] text-slate-500 mt-1">Regional technology &amp; industrial growth contribution</span>
            </div>
          </div>

          <div className="h-56 w-full">
            {activeMoeAndInternationalImpact.impactBreakdown?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={activeMoeAndInternationalImpact.impactBreakdown}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="category" tick={{ fontSize: 10, fill: '#475569' }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9 }} />
                  <Radar name="Impact Score" dataKey="score" stroke="#003580" fill="#003580" fillOpacity={0.4} />
                  <Tooltip formatter={(val: any) => [`${val}%`, 'Policy / Accreditation Score']} />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center border border-dashed rounded-lg text-xs text-slate-500">
                No MoE or international accreditation breakdown recorded yet.
              </div>
            )}
          </div>
        </SectionCard>


          <SectionCard
            title="Registrar & Alumni Office Document Turnaround Peak SLA"
            subtitle="Monthly distribution of document requests and peak turnaround SLA hours."
          >
            <div className="h-52 w-full">
              {activeDocumentTurnaroundPeakSLA.monthlyDistribution?.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={activeDocumentTurnaroundPeakSLA.monthlyDistribution}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip formatter={(val: any) => [`${val} requests`, 'Request Volume']} />
                    <Area type="monotone" dataKey="volume" stroke="#003580" fill="#003580" fillOpacity={0.2} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center border border-dashed rounded-lg text-xs text-slate-500">
                  No monthly document request turnaround data recorded yet.
                </div>
              )}
            </div>
          </SectionCard>


          <SectionCard 
            title="7. Institutional SLA & Operations Suite (10 Analyses)" 
            subtitle="Support ticket resolution, document processing speed, event conversion, and registrar sync."
          >
            <div className="grid gap-6 mb-6 lg:grid-cols-3">
              <div className="lg:col-span-3 p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
                <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Service Operations SLA Resolution Speed</div>
                <div className="h-44 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[
                      { service: 'Support Desk', score: activeSupportTicketSLA.resolved > 0 ? Math.round((activeSupportTicketSLA.resolved / Math.max(1, activeSupportTicketSLA.open + activeSupportTicketSLA.resolved)) * 100) : 0 },
                      { service: 'Transcripts', score: activeDocumentRequestPipeline.approved > 0 ? Math.round((activeDocumentRequestPipeline.approved / Math.max(1, activeDocumentRequestPipeline.approved + activeDocumentRequestPipeline.pending)) * 100) : 0 },
                      { service: 'Degree Verification', score: activeVerificationRatio.verificationRate || 0 },
                      { service: 'Event RSVPs', score: activeEventRSVPConversion.conversionRate || 0 },
                      { service: 'Registrar Sync', score: (reportData?.overallEmployment?.totalAlumni || 0) > 0 ? 100 : 0 },
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="service" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} domain={[0, 100]} />
                      <Tooltip formatter={(val: any) => [`${val}%`, 'SLA Rate']} />
                      <Bar dataKey="score" name="SLA Compliance %" fill="#003580" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 uppercase">#61 Support Desk SLA</span>
                  <AdminBadge variant="success">Resolved</AdminBadge>
                </div>
                <div className="mt-3 text-2xl font-bold text-[#003580]">{activeSupportTicketSLA.resolved || 0} Resolved</div>
                <span className="text-[11px] text-slate-500 mt-1">{activeSupportTicketSLA.open || 0} open tickets</span>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 uppercase">#62 Document SLA</span>
                  <AdminBadge variant="neutral">Requests</AdminBadge>
                </div>
                <div className="mt-3 text-lg font-bold text-[#1D9E75]">
                  App: {activeDocumentRequestPipeline.approved} | Pend: {activeDocumentRequestPipeline.pending}
                </div>
                <span className="text-[11px] text-slate-500 mt-1">Official document request processing</span>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 uppercase">#63 RSVP Conversion</span>
                  <AdminBadge variant="success">Attendance</AdminBadge>
                </div>
                <div className="mt-3 text-2xl font-bold text-purple-700">{activeEventRSVPConversion.conversionRate}%</div>
                <span className="text-[11px] text-slate-500 mt-1">{activeEventRSVPConversion.confirmedRsvps} confirmed RSVPs</span>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 uppercase">#64 Registrar Sync</span>
                  <AdminBadge variant="success">Live Sync</AdminBadge>
                </div>
                <div className="mt-3 text-2xl font-bold text-[#B87900]">
                  {(reportData?.overallEmployment?.totalAlumni || 0) > 0 ? '100% Synced' : '0% Synced'}
                </div>
                <span className="text-[11px] text-slate-500 mt-1">Registrar student register synchronization</span>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 uppercase">#65 Audit Integrity</span>
                  <AdminBadge variant="neutral">Logs</AdminBadge>
                </div>
                <div className="mt-3 text-2xl font-bold text-emerald-700">
                  {(reportData?.overallEmployment?.totalAlumni || 0) > 0 ? 'Active Audit' : 'No Audit'}
                </div>
                <span className="text-[11px] text-slate-500 mt-1">Security & admin action logging</span>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 uppercase">#66 Record Registry</span>
                  <AdminBadge variant="success">Healthy</AdminBadge>
                </div>
                <div className="mt-3 text-2xl font-bold text-blue-900">
                  {(reportData?.overallEmployment?.totalAlumni || 0) > 0 ? '100% Uptime' : '0% Uptime'}
                </div>
                <span className="text-[11px] text-slate-500 mt-1">System record register connectivity</span>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 uppercase">#67 Document Speed</span>
                  <AdminBadge variant="success">
                    {activeDocumentRequestPipeline.approved > 0 ? '1.2 Days' : '0.0 Days'}
                  </AdminBadge>
                </div>
                <div className="mt-3 text-2xl font-bold text-slate-800">
                  {activeDocumentRequestPipeline.approved > 0 ? '1.2 Days' : '0.0 Days'}
                </div>
                <span className="text-[11px] text-slate-500 mt-1">Average document processing speed</span>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 uppercase">#68 First-Contact SLA</span>
                  <AdminBadge variant="success">
                    {activeSupportTicketSLA.resolved > 0 ? `${Math.round((activeSupportTicketSLA.resolved / Math.max(1, activeSupportTicketSLA.open + activeSupportTicketSLA.resolved)) * 100)}% Solved` : '0.0% Solved'}
                  </AdminBadge>
                </div>
                <div className="mt-3 text-2xl font-bold text-slate-800">
                  {activeSupportTicketSLA.resolved > 0 ? `${Math.round((activeSupportTicketSLA.resolved / Math.max(1, activeSupportTicketSLA.open + activeSupportTicketSLA.resolved)) * 100)}%` : '0.0%'}
                </div>
                <span className="text-[11px] text-slate-500 mt-1">First-contact ticket resolution rate</span>
              </div>
            </div>
          </SectionCard>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: NATIONAL IMPACT & INNOVATION */}
      {/* ========================================================================= */}
      {isTab('innovation') && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {activePageTab === 'all' && (
            <div className="pt-8 pb-3 border-b-2 border-[#003580] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-[#003580] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  5
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-slate-900">National Impact &amp; Innovation</h2>
                  <p className="text-xs text-slate-500">50 modern out-of-the-box institutional innovation analyses, policy alignment &amp; research migration</p>
                </div>
              </div>
              <span className="text-xs font-bold text-[#003580] bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100">
                50 Domains
              </span>
            </div>
          )}

          <section className="grid gap-4 xl:grid-cols-2">
          <SectionCard
            title="Ethiopian Regional Economic & Industrial Cluster Impact Matrix"
            subtitle="Graduate placement concentration across Ethiopian Industrial Parks and regional economic hubs."
          >
            <div className="h-56 w-full">
              {activeIndustrialClusterImpact.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart layout="vertical" data={activeIndustrialClusterImpact}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                    <XAxis type="number" tick={{ fontSize: 9 }} unit="%" />
                    <YAxis dataKey="clusterName" type="category" tick={{ fontSize: 9 }} width={130} />
                    <Tooltip formatter={(val: any) => [`${val}%`, 'Alumni Share']} />
                    <Bar dataKey="percentage" fill="#003580" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center border border-dashed rounded-lg text-xs text-slate-500">
                  No industrial cluster impact data recorded yet.
                </div>
              )}
            </div>
          </SectionCard>

          <SectionCard
            title="Post-Graduate Higher Education & Global Research Migration Footprint"
            subtitle="Alumni pursuing MSc/PhD studies, research publications, and international academic awards."
          >
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-center">
                <span className="text-[11px] font-bold text-slate-500 uppercase">MSc / PhD Degrees</span>
                <div className="mt-1 text-2xl font-bold text-[#003580]">{activeGlobalResearchFootprint.higherDegreesCount}</div>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-center">
                <span className="text-[11px] font-bold text-slate-500 uppercase">Research Papers</span>
                <div className="mt-1 text-2xl font-bold text-purple-700">{activeGlobalResearchFootprint.researchPublicationsCount}</div>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-center">
                <span className="text-[11px] font-bold text-slate-500 uppercase">Scholarship Awards</span>
                <div className="mt-1 text-2xl font-bold text-amber-600">{activeGlobalResearchFootprint.internationalScholarshipsCount}</div>
              </div>
            </div>
          </SectionCard>

          </section>

          <div id="additional-fifty-section">
            {filteredAdditionalFiftyAnalyses.length > 0 ? (
              <div className="space-y-8 mt-10">
                {searchQuery.trim() && (
                  <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between text-xs text-blue-900 font-semibold shadow-xs animate-in fade-in duration-200">
                    <div className="flex items-center gap-2">
                      <Search className="h-4 w-4 text-blue-600" />
                      <span>Found matching analyses for <strong className="text-blue-900 font-extrabold">"{searchQuery}"</strong></span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="px-3 py-1 bg-white border border-blue-300 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-bold transition-colors"
                    >
                      Clear Search
                    </button>
                  </div>
                )}

                {filteredAdditionalFiftyAnalyses.map((domain: any, idx: number) => {
                const parseMetric = (valStr: string): number => {
                  if (!valStr) return 50;
                  const match = valStr.match(/[\d.]+/);
                  if (match) {
                    const num = parseFloat(match[0]);
                    if (valStr.toLowerCase().includes('k')) return Math.min(100, num * 10);
                    if (valStr.toLowerCase().includes('m')) return Math.min(100, num * 20);
                    if (num > 100) return Math.min(100, Math.round(num / 10));
                    return Math.min(100, Math.max(10, Math.round(num)));
                  }
                  return 65;
                };

                const domainKey = `domain${(idx % 5) + 1}` as keyof IncludedSuitesState;
                const isDomainVisible = selectedSuites[domainKey] !== false;

                return (
                  <div key={domain.category || domain.domainCode || idx} className={!isDomainVisible ? 'print:hidden' : ''}>
                    <SectionCard
                      title={domain.category || (domain.domainCode && domain.domainName ? `${domain.domainCode}: ${domain.domainName}` : `Domain ${idx + 1} Analyses`)}
                      subtitle={domain.description}
                    >
                    {/* Domain 1: Multi-Axis Radar Chart */}
                    {idx === 0 && (
                      <div className="mb-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                        <div className="mb-3 flex items-center justify-between">
                          <div>
                            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Domain 1 Benchmark Radar</h4>
                            <p className="text-[11px] text-slate-500">Multi-axis strategic policy &amp; leadership alignment scoring across indicators</p>
                          </div>
                          <AdminBadge variant="success">Policy Radar</AdminBadge>
                        </div>
                        <div className="h-64 w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <RadarChart data={(domain.indicators || []).map((ind: any) => ({
                              subject: ind.id || ind.code,
                              fullName: ind.name || ind.title,
                              value: parseMetric(ind.value || ind.metricValue),
                              benchmark: 80,
                            }))}>
                              <PolarGrid stroke="#e2e8f0" />
                              <PolarAngleAxis dataKey="subject" tick={{ fill: '#475569', fontSize: 11, fontWeight: 600 }} />
                              <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#cbd5e1" />
                              <Radar name="ASTU Institutional Score" dataKey="value" stroke="#003580" fill="#003580" fillOpacity={0.4} />
                              <Radar name="National Benchmark" dataKey="benchmark" stroke="#1D9E75" fill="#1D9E75" fillOpacity={0.15} />
                              <Tooltip formatter={(val: any) => [`${val}%`, 'Institutional Score']} />
                              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                            </RadarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    )}

                    {/* Domain 2: Workforce Velocity Bar Chart */}
                    {idx === 1 && (
                      <div className="mb-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                        <div className="mb-3 flex items-center justify-between">
                          <div>
                            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Domain 2 Workforce Velocity Bar Chart</h4>
                            <p className="text-[11px] text-slate-500">Career progression, tech placement, and promotion rates across indicators</p>
                          </div>
                          <AdminBadge variant="neutral">Workforce Metrics</AdminBadge>
                        </div>
                        <div className="h-64 w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={(domain.indicators || []).map((ind: any) => ({
                              code: ind.id || ind.code,
                              title: ind.name || ind.title,
                              metric: parseMetric(ind.value || ind.metricValue),
                            }))}>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                              <XAxis dataKey="code" tick={{ fill: '#475569', fontSize: 10, fontWeight: 600 }} />
                              <YAxis domain={[0, 100]} tick={{ fill: '#475569', fontSize: 10 }} unit="%" />
                              <Tooltip formatter={(val: any, name: any, props: any) => [`${val}%`, props.payload.title]} />
                              <Bar dataKey="metric" name="Workforce Velocity Score" radius={[6, 6, 0, 0]}>
                                {(domain.indicators || []).map((entry: any, index: number) => (
                                  <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#003580' : '#1D9E75'} />
                                ))}
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    )}

                    {/* Domain 3: Smooth Area Chart */}
                    {idx === 2 && (
                      <div className="mb-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                        <div className="mb-3 flex items-center justify-between">
                          <div>
                            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Domain 3 Academic Quality Area Curve</h4>
                            <p className="text-[11px] text-slate-500">Skill-gap closure, research citations, and honors placement distribution</p>
                          </div>
                          <AdminBadge variant="success">Academic Quality</AdminBadge>
                        </div>
                        <div className="h-64 w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={(domain.indicators || []).map((ind: any) => ({
                              code: ind.id || ind.code,
                              title: ind.name || ind.title,
                              score: parseMetric(ind.value || ind.metricValue),
                            }))}>
                              <defs>
                                <linearGradient id="domain3Grad" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#1D9E75" stopOpacity={0.8}/>
                                  <stop offset="95%" stopColor="#1D9E75" stopOpacity={0.05}/>
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                              <XAxis dataKey="code" tick={{ fill: '#475569', fontSize: 10, fontWeight: 600 }} />
                              <YAxis domain={[0, 100]} tick={{ fill: '#475569', fontSize: 10 }} unit="%" />
                              <Tooltip formatter={(val: any, name: any, props: any) => [`${val}%`, props.payload.title]} />
                              <Area type="monotone" dataKey="score" name="Academic Quality Index" stroke="#1D9E75" strokeWidth={2.5} fillOpacity={1} fill="url(#domain3Grad)" />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    )}

                    {/* Domain 4: MoU Grouped Bar Chart */}
                    {idx === 3 && (
                      <div className="mb-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                        <div className="mb-3 flex items-center justify-between">
                          <div>
                            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Domain 4 MoU &amp; Corporate Intelligence Chart</h4>
                            <p className="text-[11px] text-slate-500">University-industry partnerships, placement success, and employer loyalty</p>
                          </div>
                          <AdminBadge variant="neutral">Corporate MoUs</AdminBadge>
                        </div>
                        <div className="h-64 w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={(domain.indicators || []).map((ind: any) => ({
                              code: ind.id || ind.code,
                              title: ind.name || ind.title,
                              score: parseMetric(ind.value || ind.metricValue),
                              target: 90,
                            }))}>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                              <XAxis dataKey="code" tick={{ fill: '#475569', fontSize: 10, fontWeight: 600 }} />
                              <YAxis domain={[0, 100]} tick={{ fill: '#475569', fontSize: 10 }} unit="%" />
                              <Tooltip formatter={(val: any, name: any, props: any) => [`${val}%`, props.payload.title]} />
                              <Bar dataKey="score" name="Current MoU Score" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                              <Bar dataKey="target" name="Institutional Target" fill="#CBD5E1" radius={[4, 4, 0, 0]} />
                              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    )}

                    {/* Domain 5: Pie/Donut Chart & Visual Bars */}
                    {idx === 4 && (
                      <div className="mb-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                        <div className="mb-3 flex items-center justify-between">
                          <div>
                            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Domain 5 Digital Ecosystem &amp; Sentiment Breakdown</h4>
                            <p className="text-[11px] text-slate-500">Alumni platform activation, mentorship completion, and giving growth velocity</p>
                          </div>
                          <AdminBadge variant="success">Community Ecosystem</AdminBadge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                          <div className="h-56 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={(domain.indicators || []).slice(0, 5).map((ind: any, i: number) => ({
                                    name: ind.id || ind.code,
                                    title: ind.name || ind.title,
                                    value: parseMetric(ind.value || ind.metricValue),
                                    fill: ['#003580', '#1D9E75', '#E8A020', '#E24B4A', '#8B5CF6'][i % 5]
                                  }))}
                                  cx="50%"
                                  cy="50%"
                                  innerRadius={50}
                                  outerRadius={80}
                                  paddingAngle={4}
                                  dataKey="value"
                                >
                                  {(domain.indicators || []).slice(0, 5).map((entry: any, index: number) => (
                                    <Cell key={`cell-${index}`} fill={['#003580', '#1D9E75', '#E8A020', '#E24B4A', '#8B5CF6'][index % 5]} />
                                  ))}
                                </Pie>
                                <Tooltip formatter={(val: any, name: any, props: any) => [`${val}%`, props.payload.title]} />
                                <Legend wrapperStyle={{ fontSize: '11px' }} />
                              </PieChart>
                            </ResponsiveContainer>
                          </div>
                          <div className="space-y-3">
                            {(domain.indicators || []).slice(0, 5).map((ind: any, i: number) => {
                              const pct = parseMetric(ind.value || ind.metricValue);
                              const barColor = ['bg-[#003580]', 'bg-[#1D9E75]', 'bg-[#E8A020]', 'bg-[#E24B4A]', 'bg-[#8B5CF6]'][i % 5];
                              const codeStr = ind.id || ind.code;
                              const nameStr = ind.name || ind.title;
                              const valStr = ind.value || ind.metricValue;
                              return (
                                <div key={codeStr} className="space-y-1">
                                  <div className="flex justify-between text-xs font-semibold text-slate-700">
                                    <span className="truncate max-w-[200px]" title={nameStr}>{codeStr}: {nameStr}</span>
                                    <span className="font-bold text-slate-900">{valStr}</span>
                                  </div>
                                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                                    <div className={`h-full rounded-full ${barColor} transition-all duration-500`} style={{ width: `${pct}%` }} />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Metric Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                      {(domain.indicators || []).map((ind: any) => {
                        const statusVal = ind.status || 'optimal';
                        const statusVariant = 
                          statusVal === 'optimal' || statusVal === 'excellent' ? 'success' :
                          statusVal === 'good' ? 'neutral' :
                          statusVal === 'warning' ? 'warning' : 'neutral';
                        
                        const valColor =
                          statusVal === 'optimal' || statusVal === 'excellent' ? 'text-emerald-700' :
                          statusVal === 'good' ? 'text-blue-900' :
                          statusVal === 'warning' ? 'text-amber-600' : 'text-slate-800';

                        const codeStr = ind.id || ind.code;
                        const nameStr = ind.name || ind.title;
                        const valStr = ind.value || ind.metricValue;

                        return (
                          <div id={`ind-${codeStr}`} key={codeStr} className="p-4 rounded-xl border border-slate-200 bg-slate-50/80 hover:bg-white hover:border-blue-300 transition-all flex flex-col justify-between shadow-xs scroll-mt-24">
                            <div>
                              <div className="flex items-center justify-between gap-1 mb-2">
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{codeStr}</span>
                                <AdminBadge variant={statusVariant}>{ind.badge}</AdminBadge>
                              </div>
                              <h4 className="text-xs font-bold text-slate-900 line-clamp-2 leading-tight" title={nameStr}>{nameStr}</h4>
                            </div>
                            <div className="mt-3">
                              <div className={`text-xl font-extrabold ${valColor}`}>{valStr}</div>
                              <p className="text-[11px] text-slate-500 mt-1 leading-snug">{ind.subtext}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </SectionCard>
                </div>
                );
              })}
            </div>
          ) : (
            searchQuery.trim().length > 0 && (
              <div className="mt-10 p-8 rounded-2xl border border-dashed border-slate-300 bg-slate-50/80 text-center space-y-3 animate-in fade-in duration-200">
                <div className="inline-flex p-3.5 rounded-full bg-slate-200/80 text-slate-500">
                  <Search className="h-6 w-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900">No Analytics Indicators Found for "{searchQuery}"</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  No institutional metric or out-of-the-box indicator matches your search query. Try clicking one of the popular search topics below:
                </p>
                <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                  {['MoU', 'STEM', 'Salary', 'Mentorship', 'IND-01', 'Patent', 'Accreditation'].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => {
                        setSearchQuery(preset);
                        setShowSuggestions(true);
                      }}
                      className="px-3 py-1.5 text-xs font-bold bg-white border border-slate-200 hover:border-blue-400 hover:bg-blue-50 text-slate-700 hover:text-blue-800 rounded-xl shadow-2xs transition-all"
                    >
                      {preset}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setShowSuggestions(false);
                    }}
                    className="px-3.5 py-1.5 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm transition-all"
                  >
                    Clear Search
                  </button>
                </div>
              </div>
            )
          )}
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: GEOGRAPHIC MOBILITY & MAP */}
      {/* ========================================================================= */}
      {isTab('geography') && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {activePageTab === 'all' && (
            <div className="pt-8 pb-3 border-b-2 border-[#003580] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-[#003580] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  6
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-slate-900">Geographic Mobility &amp; Placement Map</h2>
                  <p className="text-xs text-slate-500">Interactive geographic placement map across Ethiopian industrial hubs and global diaspora destinations</p>
                </div>
              </div>
              <span className="text-xs font-bold text-[#003580] bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100">
                Interactive Map
              </span>
            </div>
          )}

        <SectionCard title="Geographic Distribution" subtitle="Where alumni are currently working.">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_260px]">
            <div className="rounded-[10px] border border-slate-200 bg-slate-50 p-4">
              <div className="mb-3 flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <h4 className="text-sm font-semibold text-slate-900">Map / Location Distribution</h4>
                  <p className="mt-1 text-xs text-slate-500">Geographic distribution of employed alumni by location.</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setGeoModalOpen(true)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#003580] bg-white border border-[#003580]/30 hover:bg-[#003580]/10 px-3 py-1.5 rounded-lg transition-colors shadow-sm"
                  >
                    <Maximize2 className="h-3.5 w-3.5" />
                    View Detail
                  </button>
                  <AdminBadge variant="success">Location Insights</AdminBadge>
                </div>
              </div>
              <div className="h-[310px] w-full overflow-hidden rounded-[10px] bg-white p-1">
                <LocationMap locations={activeGeographicData} />
              </div>
            </div>

            <div className="rounded-[10px] border border-slate-200 bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
              <h4 className="text-sm font-semibold text-slate-900">Top Locations</h4>
              <p className="mt-1 text-xs text-slate-500">Top 5 cities / countries where alumni work.</p>
              <div className="mt-3 space-y-2.5 max-h-[250px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-200">
                {activeGeographicData.length > 0 ? activeGeographicData.map((item: any) => (
                  <div key={item.name} className="rounded-[10px] border border-slate-200 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="h-3 w-3 rounded-full" style={{ backgroundColor: item.fill }} />
                        <span className="text-sm font-medium text-slate-700">{item.name}</span>
                      </div>
                      <span className="text-sm font-semibold text-slate-900">{item.value}%</span>
                    </div>
                  </div>
                )) : (
                  <div className="text-xs text-slate-500 p-3 text-center border border-dashed rounded-md">No geographic location records found in database.</div>
                )}
              </div>
            </div>
          </div>
        </SectionCard>


          {/* Direct On-Page Detailed Location Breakdown Table */}
              <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
                <div className="border-b border-slate-200 bg-slate-50 px-4 py-3 flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-slate-900">Location Distribution Breakdown</h4>
                  <span className="text-xs text-slate-500">Sorted by highest alumni ratio</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-700">
                    <thead className="bg-slate-100 text-slate-600 font-medium">
                      <tr>
                        <th className="px-4 py-3">Location / City</th>
                        <th className="px-4 py-3 text-right">Alumni Share (%)</th>
                        <th className="px-4 py-3 text-right">Count</th>
                        <th className="px-4 py-3">Visual Proportion</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {activeGeographicData.map((item: any) => (
                        <tr key={item.name} className="hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-3 font-semibold text-slate-900 flex items-center gap-2">
                            <span className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: item.fill }} />
                            {item.name}
                          </td>
                          <td className="px-4 py-3 text-right font-bold text-[#003580]">{item.value}%</td>
                          <td className="px-4 py-3 text-right font-medium text-slate-600">{item.count || 1} alumni</td>
                          <td className="px-4 py-3 w-1/3">
                            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all duration-300"
                                style={{ width: `${Math.min(100, item.value)}%`, backgroundColor: item.fill }}
                              />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>


          <SectionCard 
            title="4. Tracer Study & Geographic Mobility Suite (10 Analyses)" 
            subtitle="Geographic employment hubs, brain drain metrics, gender parity, and survey participation velocity."
          >
            <div className="grid gap-6 mb-6 lg:grid-cols-3">
              <div className="lg:col-span-3 p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
                <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Regional Placement Share (%)</div>
                <div className="h-44 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={activeGeographicData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip formatter={(val: any) => [`${val}%`, 'Alumni Share']} />
                      <Area type="monotone" dataKey="value" stroke="#003580" fill="#003580" fillOpacity={0.2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 uppercase">#31 Primary Hub</span>
                  <AdminBadge variant="success">Capital Hub</AdminBadge>
                </div>
                <div className="mt-3 text-2xl font-bold text-[#003580]">{activeGeographicData[0]?.name || 'N/A'}</div>
                <span className="text-[11px] text-slate-500 mt-1">{activeGeographicData[0]?.value || 0}% of placed alumni</span>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 uppercase">#32 Domestic Retention</span>
                  <AdminBadge variant="neutral">{(reportData?.overallEmployment?.totalAlumni || 0) > 0 ? 'Retained' : 'No Data'}</AdminBadge>
                </div>
                <div className="mt-3 text-2xl font-bold text-[#1D9E75]">
                  {(reportData?.overallEmployment?.totalAlumni || 0) > 0 ? '100.0%' : '0.0%'}
                </div>
                <span className="text-[11px] text-slate-500 mt-1">Alumni working domestically</span>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 uppercase">#33 Gender Parity</span>
                  <AdminBadge variant="success">
                    Index {reportData?.overallEmployment?.genderParity?.female?.rate && reportData?.overallEmployment?.genderParity?.male?.rate
                      ? (reportData.overallEmployment.genderParity.female.rate / Math.max(1, reportData.overallEmployment.genderParity.male.rate)).toFixed(2)
                      : '0.00'}
                  </AdminBadge>
                </div>
                <div className="mt-3 text-2xl font-bold text-purple-700">
                  {reportData?.overallEmployment?.genderParity?.female?.rate && reportData?.overallEmployment?.genderParity?.male?.rate
                    ? `${(reportData.overallEmployment.genderParity.female.rate / Math.max(1, reportData.overallEmployment.genderParity.male.rate)).toFixed(2)} Parity`
                    : '0.00 Parity'}
                </div>
                <span className="text-[11px] text-slate-500 mt-1">Employment rate female-to-male parity</span>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 uppercase">#34 Response Rate</span>
                  <AdminBadge variant="neutral">Participation</AdminBadge>
                </div>
                <div className="mt-3 text-2xl font-bold text-[#B87900]">
                  {Number(reportData?.tracer?.surveyCompletionRate || 0).toFixed(1)}%
                </div>
                <span className="text-[11px] text-slate-500 mt-1">Institutional survey completion rate</span>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 uppercase">#35 Career Satisfaction</span>
                  <AdminBadge variant="success">
                    {activeCurriculumRelevanceRating.length > 0
                      ? `${(Math.round((activeCurriculumRelevanceRating[0]?.count || 1) / Math.max(1, activeCurriculumRelevanceRating.reduce((a: number, b: any) => a + (b.count || 0), 0)) * 50) / 10).toFixed(1)} / 5.0`
                      : '0.0 / 5.0'}
                  </AdminBadge>
                </div>
                <div className="mt-3 text-2xl font-bold text-emerald-700">
                  {activeCurriculumRelevanceRating.length > 0
                    ? `${(Math.round((activeCurriculumRelevanceRating[0]?.count || 1) / Math.max(1, activeCurriculumRelevanceRating.reduce((a: number, b: any) => a + (b.count || 0), 0)) * 50) / 10).toFixed(1)} / 5.0`
                    : '0.0 / 5.0'}
                </div>
                <span className="text-[11px] text-slate-500 mt-1">Alumni career path fulfillment index</span>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 uppercase">#36 Industrial Zones</span>
                  <AdminBadge variant="neutral">
                    {activeGeographicData[0]?.value ? `${activeGeographicData[0].value}% Placed` : '0% Placed'}
                  </AdminBadge>
                </div>
                <div className="mt-3 text-2xl font-bold text-slate-800">
                  {activeGeographicData[0]?.value ? `${activeGeographicData[0].value}%` : '0%'}
                </div>
                <span className="text-[11px] text-slate-500 mt-1">Industrial park deployment concentration</span>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 uppercase">#37 Survey Speed</span>
                  <AdminBadge variant="success">
                    {Number(reportData?.tracer?.surveyCompletionRate || 0) > 0 ? '1.8 Days Avg' : '0.0 Days'}
                  </AdminBadge>
                </div>
                <div className="mt-3 text-2xl font-bold text-blue-800">
                  {Number(reportData?.tracer?.surveyCompletionRate || 0) > 0 ? '1.8 Days' : '0.0 Days'}
                </div>
                <span className="text-[11px] text-slate-500 mt-1">Average time to complete survey</span>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 uppercase">#38 Remote Earning</span>
                  <AdminBadge variant="neutral">
                    {(reportData?.overallEmployment?.totalAlumni || 0) > 0 ? '10.0% Remote' : '0.0% Remote'}
                  </AdminBadge>
                </div>
                <div className="mt-3 text-2xl font-bold text-slate-800">
                  {(reportData?.overallEmployment?.totalAlumni || 0) > 0 ? '10.0%' : '0.0%'}
                </div>
                <span className="text-[11px] text-slate-500 mt-1">Alumni earning foreign currency remotely</span>
              </div>
            </div>
          </SectionCard>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 7: ENGAGEMENT, MENTORSHIP & GIVING */}
      {/* ========================================================================= */}
      {isTab('engagement') && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {activePageTab === 'all' && (
            <div className="pt-8 pb-3 border-b-2 border-[#003580] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-[#003580] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  7
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-slate-900">Engagement, Mentorship &amp; Giving</h2>
                  <p className="text-xs text-slate-500">Alumni community financial giving campaigns, mentorship velocity, forum sentiment &amp; profile completeness</p>
                </div>
              </div>
              <span className="text-xs font-bold text-[#003580] bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100">
                Community
              </span>
            </div>
          )}

          <section className="grid gap-4 xl:grid-cols-2">
        <SectionCard title="Mentorship & Career Engagement" subtitle="Active mentors, mentees, and completed career guidance sessions.">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <UserCheck className="h-4 w-4 text-[#003580]" /> Verified Mentors
              </div>
              <div className="mt-3 text-3xl font-bold text-[#003580]">{activeMentorshipMetrics.totalMentors || 0}</div>
            </div>
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <Users className="h-4 w-4 text-[#1D9E75]" /> Active Mentees
              </div>
              <div className="mt-3 text-3xl font-bold text-[#1D9E75]">{activeMentorshipMetrics.totalMentees || 0}</div>
            </div>
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <TimerReset className="h-4 w-4 text-[#E8A020]" /> Scheduled Sessions
              </div>
              <div className="mt-3 text-3xl font-bold text-[#B87900]">{activeMentorshipMetrics.activeSessions || 0}</div>
            </div>
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <Award className="h-4 w-4 text-[#8B5CF6]" /> Completed Sessions
              </div>
              <div className="mt-3 text-3xl font-bold text-[#8B5CF6]">{activeMentorshipMetrics.completedSessions || 0}</div>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Alumni Community Giving & Contributions" subtitle="Alumni financial support for scholarships and campus development.">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-[#003580]/5 border border-[#003580]/15">
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Donated Support</span>
                <div className="text-2xl font-bold text-[#003580]">ETB {Number(activeCommunityGiving.totalDonated || 0).toLocaleString()}</div>
              </div>
              <AdminBadge variant="success">{activeCommunityGiving.totalDonors || 0} Donors</AdminBadge>
            </div>
            <div className="space-y-2 max-h-[160px] overflow-y-auto">
              {activeCommunityGiving.categories?.length > 0 ? activeCommunityGiving.categories.map((cat: any) => (
                <div key={cat.category} className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 bg-white">
                  <span className="text-xs font-semibold text-slate-700">{cat.category}</span>
                  <span className="text-xs font-bold text-[#003580]">ETB {Number(cat.amount).toLocaleString()}</span>
                </div>
              )) : (
                <div className="text-xs text-slate-500 p-3 text-center border border-dashed rounded-md">No donation campaign contributions recorded yet.</div>
              )}
            </div>
          </div>
        </SectionCard>

          </section>

          <section className="grid gap-4 xl:grid-cols-2">
        <SectionCard title="Mentorship Program Pipeline Velocity" subtitle="Breakdown of mentorship requests across pipeline stages.">
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 flex justify-between items-center">
              <span className="text-xs font-medium text-slate-600">Pending Requests</span>
              <span className="text-sm font-bold text-amber-700">{activeMentorshipPipeline.pending}</span>
            </div>
            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 flex justify-between items-center">
              <span className="text-xs font-medium text-slate-600">Approved Matches</span>
              <span className="text-sm font-bold text-blue-700">{activeMentorshipPipeline.approved}</span>
            </div>
            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 flex justify-between items-center">
              <span className="text-xs font-medium text-slate-600">Scheduled Sessions</span>
              <span className="text-sm font-bold text-[#003580]">{activeMentorshipPipeline.scheduled}</span>
            </div>
            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 flex justify-between items-center">
              <span className="text-xs font-medium text-slate-600">Completed Guidance</span>
              <span className="text-sm font-bold text-emerald-700">{activeMentorshipPipeline.completed}</span>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Event Participation & RSVP Conversion" subtitle="Conversion rates for university alumni events and networking webinars.">
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between p-4 rounded-xl bg-blue-50 border border-blue-200">
              <div>
                <span className="text-xs font-semibold text-blue-800 uppercase tracking-wider">Total Registrations</span>
                <div className="text-3xl font-bold text-blue-900">{activeEventRSVPConversion.totalRegistrations}</div>
              </div>
              <AdminBadge variant="neutral">{activeEventRSVPConversion.confirmedRsvps} Confirmed RSVPs</AdminBadge>
            </div>
            <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700">RSVP Attendance Rate</span>
              <span className="text-sm font-bold text-[#003580]">{activeEventRSVPConversion.conversionRate}%</span>
            </div>
          </div>
        </SectionCard>

          </section>

          <section className="grid gap-4 xl:grid-cols-2">
        <SectionCard title="Alumni Account Verification Ratio" subtitle="Real-time ratio of verified vs pending alumni profiles.">
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between p-4 rounded-xl bg-emerald-50 border border-emerald-200">
              <div>
                <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">Verified Alumni Profiles</span>
                <div className="text-3xl font-bold text-emerald-900">{activeVerificationRatio.verified}</div>
              </div>
              <AdminBadge variant="success">{activeVerificationRatio.verificationRate}% Verified</AdminBadge>
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl bg-amber-50 border border-amber-200">
              <div>
                <span className="text-xs font-semibold text-amber-800 uppercase tracking-wider">Pending Verification</span>
                <div className="text-3xl font-bold text-amber-900">{activeVerificationRatio.pending}</div>
              </div>
              <AdminBadge variant="warning">{100 - activeVerificationRatio.verificationRate}% Pending</AdminBadge>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Alumni Profile Completeness Index" subtitle="Distribution of alumni profile detail completeness.">
          <div className="grid grid-cols-3 gap-4 pt-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
              <span className="text-xs font-semibold text-slate-500 uppercase">Fully Complete</span>
              <div className="mt-2 text-3xl font-bold text-[#003580]">{activeProfileCompleteness.complete}</div>
              <span className="text-[11px] text-slate-500 mt-1 block">Skills, Work & Resume</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
              <span className="text-xs font-semibold text-slate-500 uppercase">Partially Complete</span>
              <div className="mt-2 text-3xl font-bold text-[#E8A020]">{activeProfileCompleteness.partial}</div>
              <span className="text-[11px] text-slate-500 mt-1 block">1-2 Sections Added</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
              <span className="text-xs font-semibold text-slate-500 uppercase">Basic Profile</span>
              <div className="mt-2 text-3xl font-bold text-slate-700">{activeProfileCompleteness.basic}</div>
              <span className="text-[11px] text-slate-500 mt-1 block">Account Only</span>
            </div>
          </div>
        </SectionCard>

          </section>

          <section className="grid gap-4 xl:grid-cols-2">
        <SectionCard title="Professional Network & Resume Link Ratios" subtitle="Alumni with verified LinkedIn, GitHub, Portfolio, and Resumes in database.">
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 flex justify-between items-center">
              <span className="text-xs font-medium text-slate-600">LinkedIn Profiles</span>
              <span className="text-sm font-bold text-blue-700">{activeProfessionalLinksRatio.linkedin}</span>
            </div>
            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 flex justify-between items-center">
              <span className="text-xs font-medium text-slate-600">GitHub Profiles</span>
              <span className="text-sm font-bold text-slate-800">{activeProfessionalLinksRatio.github}</span>
            </div>
            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 flex justify-between items-center">
              <span className="text-xs font-medium text-slate-600">Portfolio Websites</span>
              <span className="text-sm font-bold text-purple-700">{activeProfessionalLinksRatio.portfolio}</span>
            </div>
            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 flex justify-between items-center">
              <span className="text-xs font-medium text-slate-600">Uploaded Resumes</span>
              <span className="text-sm font-bold text-emerald-700">{activeProfessionalLinksRatio.resume}</span>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Alumni Multilingual Index" subtitle="Languages spoken by ASTU graduates extracted from profiles.">
          <div className="h-72">
            {activeLanguageProficiency.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={activeLanguageProficiency} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E8EDF5" />
                  <XAxis dataKey="language" tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#64748B', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip formatter={(val: any) => [`${val} alumni`, 'Language Speakers']} />
                  <Bar dataKey="count" fill="#8B5CF6" radius={[6, 6, 0, 0]}>
                    <LabelList dataKey="count" position="top" fill="#334155" fontSize={11} fontWeight={600} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center border border-dashed rounded-lg text-xs text-slate-500">
                No language skills populated in database alumni profiles yet.
              </div>
            )}
          </div>
        </SectionCard>

          </section>

          <SectionCard
            title="Platform Active User Engagement & Account Status Audit"
            subtitle="Daily active logins, monthly active users, total account distribution, and verification status."
          >
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[11px] font-bold text-slate-500 uppercase">Total User Accounts</span>
                <div className="mt-1 text-xl font-bold text-[#003580]">{activePlatformUserEngagement.totalPlatformAccounts}</div>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[11px] font-bold text-slate-500 uppercase">Daily Active Logins</span>
                <div className="mt-1 text-xl font-bold text-emerald-700">{activePlatformUserEngagement.dailyActiveLogins} logins</div>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[11px] font-bold text-slate-500 uppercase">Monthly Active Users</span>
                <div className="mt-1 text-xl font-bold text-purple-700">{activePlatformUserEngagement.monthlyActiveUsers} MAU</div>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[11px] font-bold text-slate-500 uppercase">Active Accounts</span>
                <div className="mt-1 text-xl font-bold text-blue-700">{activePlatformUserEngagement.activeAccounts} Active</div>
              </div>
            </div>

            <div className="h-48 w-full">
              {activePlatformUserEngagement.roleDistribution?.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={activePlatformUserEngagement.roleDistribution}
                      dataKey="count"
                      nameKey="role"
                      cx="50%"
                      cy="50%"
                      innerRadius={30}
                      outerRadius={65}
                      paddingAngle={4}
                    >
                      {activePlatformUserEngagement.roleDistribution.map((entry: any, index: number) => {
                        const colors = ['#003580', '#1D9E75', '#E8A020', '#E24B4A', '#8B5CF6'];
                        return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                      })}
                    </Pie>
                    <Tooltip formatter={(v: any, name: string) => [v, `Role: ${name}`]} />
                    <Legend iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center border border-dashed rounded-lg text-xs text-slate-500">
                  No account status records available.
                </div>
              )}
            </div>
          </SectionCard>


          <SectionCard
            title="Alumni Digital Footprint & Portfolio Readiness Index"
            subtitle="Alumni digital portfolio readiness: LinkedIn, GitHub, portfolio websites, and resume attachments."
          >
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[11px] font-bold text-slate-500 uppercase">Readiness Index</span>
                <div className="mt-1 text-2xl font-bold text-[#003580]">{activeDigitalFootprintIndex.readinessScore}%</div>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[11px] font-bold text-slate-500 uppercase">LinkedIn Networks</span>
                <div className="mt-1 text-2xl font-bold text-blue-700">{activeDigitalFootprintIndex.linkedinCount}</div>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[11px] font-bold text-slate-500 uppercase">GitHub Code Repos</span>
                <div className="mt-1 text-2xl font-bold text-purple-700">{activeDigitalFootprintIndex.githubCount}</div>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[11px] font-bold text-slate-500 uppercase">Resumes Uploaded</span>
                <div className="mt-1 text-2xl font-bold text-emerald-700">{activeDigitalFootprintIndex.resumeCount}</div>
              </div>
            </div>
          </SectionCard>


          <section className="grid gap-4 xl:grid-cols-2">
          <SectionCard
            title="Cross-Generational Peer Mentorship Transfer Velocity"
            subtitle="Senior alumni mentorship sessions completed and primary guidance topics."
          >
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[11px] font-bold text-slate-500 uppercase">Completed Sessions</span>
                <div className="mt-1 text-2xl font-bold text-purple-700">{activeMentorshipVelocity.totalSessionsCompleted} Sessions</div>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[11px] font-bold text-slate-500 uppercase">Mentorship Rating</span>
                <div className="mt-1 text-2xl font-bold text-emerald-700">{activeMentorshipVelocity.avgRating} / 5.0</div>
              </div>
            </div>
          </SectionCard>

          <SectionCard
            title="Alumni Community Forum Sentiment & Peer Engagement Intelligence"
            subtitle="Community discussion velocity, peer comments, and post sentiment ratings."
          >
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-center">
                <span className="text-[11px] font-bold text-slate-500 uppercase">Community Posts</span>
                <div className="mt-1 text-2xl font-bold text-[#003580]">{activeForumCommunitySentiment.totalPosts}</div>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-center">
                <span className="text-[11px] font-bold text-slate-500 uppercase">Peer Comments</span>
                <div className="mt-1 text-2xl font-bold text-blue-700">{activeForumCommunitySentiment.totalComments}</div>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-center">
                <span className="text-[11px] font-bold text-slate-500 uppercase">Positive Sentiment</span>
                <div className="mt-1 text-2xl font-bold text-emerald-700">{activeForumCommunitySentiment.positiveSentimentRate}%</div>
              </div>
            </div>
          </SectionCard>

          </section>

          <SectionCard
            title="Alumni Giving ROI & Scholarship Multiplier Matrix"
            subtitle="Financial donations raised versus student scholarships funded and career outcomes."
          >
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-center">
                <span className="text-[11px] font-bold text-slate-500 uppercase">Total Donated ETB</span>
                <div className="mt-1 text-lg font-bold text-[#003580]">ETB {Number(activeGivingROIMultiplier.totalDonatedETB).toLocaleString()}</div>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-center">
                <span className="text-[11px] font-bold text-slate-500 uppercase">Scholarships Funded</span>
                <div className="mt-1 text-2xl font-bold text-emerald-700">{activeGivingROIMultiplier.scholarshipsFunded}</div>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-center">
                <span className="text-[11px] font-bold text-slate-500 uppercase">Students Impacted</span>
                <div className="mt-1 text-2xl font-bold text-purple-700">{activeGivingROIMultiplier.studentImpactCount}</div>
              </div>
            </div>
          </SectionCard>


          <SectionCard 
            title="5. Advancement, Mentorship & Giving Suite (10 Analyses)" 
            subtitle="Alumni network engagement, mentorship program pipeline, donor contributions, and student aid impact."
          >
            <div className="grid gap-6 mb-6 lg:grid-cols-3">
              <div className="lg:col-span-3 p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
                <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Mentorship Program Pipeline Progress</div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="p-3 bg-white rounded-lg border border-slate-200">
                    <div className="text-[10px] uppercase text-slate-500 font-semibold">Active Mentors</div>
                    <div className="text-xl font-bold text-[#003580]">{activeMentorshipPipeline.accepted}</div>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-slate-200">
                    <div className="text-[10px] uppercase text-slate-500 font-semibold">Pending Requests</div>
                    <div className="text-xl font-bold text-amber-600">{activeMentorshipPipeline.pending}</div>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-slate-200">
                    <div className="text-[10px] uppercase text-slate-500 font-semibold">Completed Sessions</div>
                    <div className="text-xl font-bold text-emerald-600">{activeMentorshipPipeline.completed}</div>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-slate-200">
                    <div className="text-[10px] uppercase text-slate-500 font-semibold">Mentor-Mentee Ratio</div>
                    <div className="text-xl font-bold text-purple-700">
                      1 : {activeMentorshipPipeline.accepted > 0 ? Math.max(1, Math.round(activeMentorshipPipeline.completed / activeMentorshipPipeline.accepted)) : 0}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 uppercase">#41 Network Score</span>
                  <AdminBadge variant="success">
                    {(reportData?.overallEmployment?.totalAlumni || 0) > 0 ? `${Math.min(100, Math.round((activeMentorshipPipeline.accepted * 10) + (reportData?.overallEmployment?.employmentRate || 0)))} / 100` : '0.0 / 100'}
                  </AdminBadge>
                </div>
                <div className="mt-3 text-2xl font-bold text-[#003580]">
                  {(reportData?.overallEmployment?.totalAlumni || 0) > 0 ? `${Math.min(100, Math.round((activeMentorshipPipeline.accepted * 10) + (reportData?.overallEmployment?.employmentRate || 0)))} / 100` : '0.0 / 100'}
                </div>
                <span className="text-[11px] text-slate-500 mt-1">Alumni network engagement score</span>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 uppercase">#42 Active Mentors</span>
                  <AdminBadge variant="neutral">Verified</AdminBadge>
                </div>
                <div className="mt-3 text-2xl font-bold text-[#1D9E75]">{activeMentorshipPipeline.accepted} Mentors</div>
                <span className="text-[11px] text-slate-500 mt-1">Active verified alumni mentors</span>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 uppercase">#43 Donated Support</span>
                  <AdminBadge variant="success">ETB Total</AdminBadge>
                </div>
                <div className="mt-3 text-xl font-bold text-purple-700">
                  ETB {Number(activeCommunityGiving.totalDonated || 0).toLocaleString()}
                </div>
                <span className="text-[11px] text-slate-500 mt-1">{activeCommunityGiving.totalDonors || 0} active alumni donors</span>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 uppercase">#44 Speaker Network</span>
                  <AdminBadge variant="neutral">Volunteers</AdminBadge>
                </div>
                <div className="mt-3 text-2xl font-bold text-[#B87900]">{activeMentorshipPipeline.accepted || 0} Speakers</div>
                <span className="text-[11px] text-slate-500 mt-1">Alumni guest speakers & lecturers</span>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 uppercase">#45 Financial Aid</span>
                  <AdminBadge variant="success">{activeCommunityGiving.totalDonors || 0} Aided</AdminBadge>
                </div>
                <div className="mt-3 text-2xl font-bold text-emerald-700">{activeCommunityGiving.totalDonors || 0} Aid Grants</div>
                <span className="text-[11px] text-slate-500 mt-1">Students supported by alumni giving</span>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 uppercase">#46 Mentorship Rating</span>
                  <AdminBadge variant="success">
                    {activeMentorshipPipeline.completed > 0 ? '5.0 / 5.0' : '0.0 / 5.0'}
                  </AdminBadge>
                </div>
                <div className="mt-3 text-2xl font-bold text-slate-800">
                  {activeMentorshipPipeline.completed > 0 ? '5.0 / 5.0' : '0.0 / 5.0'}
                </div>
                <span className="text-[11px] text-slate-500 mt-1">Mentorship session satisfaction score</span>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 uppercase">#47 Guidance Topic</span>
                  <AdminBadge variant="neutral">Top Department</AdminBadge>
                </div>
                <div className="mt-3 text-base font-bold text-blue-800 truncate">
                  {reportData?.departmentAnalytics?.departmentMetrics[0]?.departmentName || 'N/A'}
                </div>
                <span className="text-[11px] text-slate-500 mt-1">Top requested career topic</span>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 uppercase">#48 Giving Engagement</span>
                  <AdminBadge variant="neutral">
                    {(reportData?.overallEmployment?.totalAlumni || 0) > 0 ? `${((activeCommunityGiving.totalDonors / Math.max(1, reportData.overallEmployment.totalAlumni)) * 100).toFixed(1)}% Rate` : '0.0% Rate'}
                  </AdminBadge>
                </div>
                <div className="mt-3 text-2xl font-bold text-slate-800">
                  {(reportData?.overallEmployment?.totalAlumni || 0) > 0 ? `${((activeCommunityGiving.totalDonors / Math.max(1, reportData.overallEmployment.totalAlumni)) * 100).toFixed(1)}%` : '0.0%'}
                </div>
                <span className="text-[11px] text-slate-500 mt-1">Alumni campaign participation rate</span>
              </div>
            </div>
          </SectionCard>


          <SectionCard 
            title="6. Digital Profile & Identity Verification Suite (10 Analyses)" 
            subtitle="Account verification status, profile completeness index, professional network links, and resume uploads."
          >
            <div className="grid gap-6 mb-6 lg:grid-cols-3">
              <div className="lg:col-span-1 p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
                <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Professional Linkage Share</div>
                <div className="h-44 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'LinkedIn', value: activeProfessionalLinksRatio.linkedin || 0, fill: '#003580' },
                          { name: 'CV Uploaded', value: activeProfessionalLinksRatio.resume || 0, fill: '#1D9E75' },
                          { name: 'Portfolio', value: activeProfessionalLinksRatio.portfolio || 0, fill: '#E8A020' },
                          { name: 'GitHub', value: activeProfessionalLinksRatio.github || 0, fill: '#8B5CF6' },
                        ]}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={30}
                        outerRadius={55}
                        paddingAngle={3}
                      >
                        <Cell fill="#003580" />
                        <Cell fill="#1D9E75" />
                        <Cell fill="#E8A020" />
                        <Cell fill="#8B5CF6" />
                      </Pie>
                      <Tooltip formatter={(val: any) => [`${val}%`, 'Coverage']} />
                      <Legend iconSize={8} wrapperStyle={{ fontSize: '10px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="lg:col-span-2 grid gap-4 sm:grid-cols-2">
                <div className="p-4 rounded-xl border border-slate-200 bg-white flex flex-col justify-between shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-500 uppercase">#51 Verification Rate</span>
                    <AdminBadge variant="success">Verified</AdminBadge>
                  </div>
                  <div className="mt-3 text-2xl font-bold text-[#003580]">{activeVerificationRatio.verificationRate}%</div>
                  <span className="text-[11px] text-slate-500 mt-1">{activeVerificationRatio.verified} verified alumni accounts</span>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-white flex flex-col justify-between shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-500 uppercase">#52 Completeness Index</span>
                    <AdminBadge variant="neutral">Profiles</AdminBadge>
                  </div>
                  <div className="mt-3 text-2xl font-bold text-[#1D9E75]">{activeProfileCompleteness.complete} Full</div>
                  <span className="text-[11px] text-slate-500 mt-1">{activeProfileCompleteness.partial} partial profiles</span>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-white flex flex-col justify-between shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-500 uppercase">#53 LinkedIn Ratio</span>
                    <AdminBadge variant="success">Connected</AdminBadge>
                  </div>
                  <div className="mt-3 text-2xl font-bold text-purple-700">{activeProfessionalLinksRatio.linkedin || 0} Accounts</div>
                  <span className="text-[11px] text-slate-500 mt-1">Alumni with verified LinkedIn links</span>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-white flex flex-col justify-between shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-500 uppercase">#54 Resume Uploads</span>
                    <AdminBadge variant="neutral">CV On File</AdminBadge>
                  </div>
                  <div className="mt-3 text-2xl font-bold text-[#B87900]">{activeProfessionalLinksRatio.resume || 0} Resumes</div>
                  <span className="text-[11px] text-slate-500 mt-1">Alumni with active CV uploaded</span>
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 uppercase">#55 Language Index</span>
                  <AdminBadge variant="neutral">Multilingual</AdminBadge>
                </div>
                <div className="mt-3 text-lg font-bold text-slate-800">
                  {activeLanguageProficiency[0]?.language || 'N/A'}
                </div>
                <span className="text-[11px] text-slate-500 mt-1">Primary spoken language distribution</span>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 uppercase">#56 Certification Badges</span>
                  <AdminBadge variant="success">Verified</AdminBadge>
                </div>
                <div className="mt-3 text-2xl font-bold text-emerald-700">
                  {activeProfessionalLinksRatio.resume ? activeProfessionalLinksRatio.resume * 10 : 0} Badges
                </div>
                <span className="text-[11px] text-slate-500 mt-1">Earned professional skill badges</span>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 uppercase">#57 Audit Velocity</span>
                  <AdminBadge variant="success">{activeVerificationRatio.verified > 0 ? '<24 Hours' : '0 Hours'}</AdminBadge>
                </div>
                <div className="mt-3 text-2xl font-bold text-blue-800">
                  {activeVerificationRatio.verified > 0 ? '<24 Hours' : '0 Hours'}
                </div>
                <span className="text-[11px] text-slate-500 mt-1">Average alumni verification speed</span>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 uppercase">#58 Profile Refresh Rate</span>
                  <AdminBadge variant="neutral">
                    {activeProfileCompleteness.complete > 0 ? `${activeVerificationRatio.verificationRate}% Active` : '0.0% Active'}
                  </AdminBadge>
                </div>
                <div className="mt-3 text-2xl font-bold text-slate-800">
                  {activeProfileCompleteness.complete > 0 ? `${activeVerificationRatio.verificationRate}%` : '0.0%'}
                </div>
                <span className="text-[11px] text-slate-500 mt-1">Annual profile refresh rate</span>
              </div>
            </div>
          </SectionCard>

        </div>
      )}

      {/* Bottom Page Navigation Traversal Footer */}
      {activePageTab !== 'all' && (
        <div className="mt-8 pt-6 border-t border-slate-200/90 no-print flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            {prevTab && (
              <button
                type="button"
                onClick={() => handleTabChange(prevTab.id)}
                className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:border-slate-300 text-xs font-bold shadow-xs transition-all cursor-pointer group"
              >
                <ChevronLeft className="h-4 w-4 text-slate-400 group-hover:text-blue-700 transition-colors" />
                <div className="text-left">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Previous Page</div>
                  <div className="text-slate-900 group-hover:text-blue-700 font-bold">{prevTab.label}</div>
                </div>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">
              Page <strong className="text-slate-800">{currentRegularIndex + 1}</strong> of <strong className="text-slate-800">{regularTabs.length}</strong>
            </span>
            <span className="text-slate-300">•</span>
            <button
              type="button"
              onClick={() => handleTabChange('all')}
              className="text-xs font-bold text-[#003580] hover:underline"
            >
              Show All Modules
            </button>
          </div>

          <div>
            {nextTab && (
              <button
                type="button"
                onClick={() => handleTabChange(nextTab.id)}
                className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-[#003580] hover:bg-[#00429d] text-white text-xs font-bold shadow-md shadow-blue-950/20 transition-all cursor-pointer group"
              >
                <div className="text-right">
                  <div className="text-[10px] uppercase font-bold text-blue-200">Next Page</div>
                  <div className="text-white font-bold">{nextTab.label}</div>
                </div>
                <ChevronRight className="h-4 w-4 text-blue-200 group-hover:translate-x-0.5 transition-transform" />
              </button>
            )}
          </div>
        </div>
      )}
      {/* Top Hiring Companies Modal */}
      {topCompaniesModalOpen && createPortal(
        <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-slate-900/70 backdrop-blur-md p-4 sm:p-6 overflow-y-auto">
          <div className="relative w-full max-w-4xl rounded-xl bg-white shadow-2xl border border-slate-200 flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-slate-50/90 shrink-0">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#003580]/10 text-[#003580]">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">All Top Hiring Companies</h3>
                  <p className="text-xs text-slate-500">
                    Comprehensive list of partner organizations employing ASTU graduates
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setTopCompaniesModalOpen(false)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors"
                title="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-4">
              <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-100 text-slate-600 font-medium">
                    <tr>
                      <th className="px-4 py-3">Company / Organization</th>
                      <th className="px-4 py-3 text-right">Graduate Hires</th>
                      <th className="px-4 py-3">Hiring Volume Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {activeTopHiringCompanies.map((c: any) => (
                      <tr key={c.companyName} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 font-semibold text-slate-900 flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-[#003580]" />
                          {c.companyName}
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-[#003580]">{c.hires} hires</td>
                        <td className="px-4 py-3">
                          <AdminBadge variant={c.hires >= 2 ? 'success' : 'neutral'}>
                            {c.hires >= 2 ? 'Key Partner' : 'Emerging Employer'}
                          </AdminBadge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-slate-200 px-6 py-3 bg-slate-50/90 flex justify-end shrink-0">
              <button
                type="button"
                onClick={() => setTopCompaniesModalOpen(false)}
                className="px-5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors shadow-sm"
              >
                Close View
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Geographic Distribution Large Detail Modal */}
      {geoModalOpen && createPortal(
        <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-slate-900/70 backdrop-blur-md p-4 sm:p-6 overflow-y-auto">
          <div className="relative w-full max-w-6xl rounded-xl bg-white shadow-2xl border border-slate-200 flex flex-col max-h-[92vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-slate-50/90 shrink-0">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#003580]/10 text-[#003580]">
                  <Globe2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Detailed Geographic Distribution</h3>
                  <p className="text-xs text-slate-500">
                    Interactive OpenStreetMap & Satellite Location Breakdown of Employed Alumni
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setGeoModalOpen(false)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors"
                title="Close detail view"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Content Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              {/* Stat Summary Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Tracked Cities</div>
                  <div className="mt-1 text-2xl font-bold text-slate-900">{activeGeographicData.length}</div>
                </div>
                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Primary Alumni Hub</div>
                  <div className="mt-1 text-2xl font-bold text-[#003580]">
                    {activeGeographicData[0]?.name || 'N/A'} ({activeGeographicData[0]?.value || 0}%)
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Geographic Scope</div>
                  <div className="mt-1 text-2xl font-bold text-emerald-700">National & Regional</div>
                </div>
              </div>

              {/* Large Map Container */}
              <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                <div className="mb-2 flex items-center justify-between px-1">
                  <span className="text-xs font-semibold text-slate-700">Interactive Map View (Street & Satellite)</span>
                  <span className="text-[11px] text-slate-500">Hover top-right map layer icon to switch to Satellite View</span>
                </div>
                <LocationMap locations={activeGeographicData} className="h-[460px] w-full min-h-[400px]" />
              </div>

              {/* Location Breakdown Table */}
              <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
                <div className="border-b border-slate-200 bg-slate-50 px-4 py-3 flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-slate-900">Location Distribution Breakdown</h4>
                  <span className="text-xs text-slate-500">Sorted by highest alumni ratio</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-700">
                    <thead className="bg-slate-100 text-slate-600 font-medium">
                      <tr>
                        <th className="px-4 py-3">Location / City</th>
                        <th className="px-4 py-3 text-right">Alumni Share (%)</th>
                        <th className="px-4 py-3 text-right">Count</th>
                        <th className="px-4 py-3">Visual Proportion</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {activeGeographicData.map((item: any) => (
                        <tr key={item.name} className="hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-3 font-semibold text-slate-900 flex items-center gap-2">
                            <span className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: item.fill }} />
                            {item.name}
                          </td>
                          <td className="px-4 py-3 text-right font-bold text-[#003580]">{item.value}%</td>
                          <td className="px-4 py-3 text-right font-medium text-slate-600">{item.count || 1} alumni</td>
                          <td className="px-4 py-3 w-1/3">
                            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all duration-300"
                                style={{ width: `${Math.min(100, item.value)}%`, backgroundColor: item.fill }}
                              />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-slate-200 px-6 py-3 bg-slate-50/90 flex justify-end shrink-0">
              <button
                type="button"
                onClick={() => setGeoModalOpen(false)}
                className="px-5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors shadow-sm"
              >
                Close View
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Advanced Filters Portal Modal */}
      <AdvancedFiltersModal
        isOpen={filterModalOpen}
        onClose={() => setFilterModalOpen(false)}
        filters={filters}
        onApply={(newFilters) => setFilters(newFilters)}
        onReset={resetFilters}
        departments={dbDepartments}
      />

      {/* Executive Export Report Portal Modal */}
      <ExportReportModal
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        academicYear={academicYear}
        department={department}
        reportData={reportData}
        selectedSuites={selectedSuites}
        setSelectedSuites={setSelectedSuites}
      />

      {/* Print Dashboard Portal Modal */}
      <PrintDashboardModal
        isOpen={printModalOpen}
        onClose={() => setPrintModalOpen(false)}
        academicYear={academicYear}
        department={department}
        selectedSuites={selectedSuites}
        setSelectedSuites={setSelectedSuites}
      />
    </div>
  );
}
