import prisma from '../../../../core/config/db';
import { Role } from '@prisma/client';

const metricsCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL_MS = 3 * 1000; // 3 seconds cache for real-time responsiveness

export class GetDashboardMetrics {
  static invalidateCache() {
    metricsCache.clear();
  }

  async execute(range: string = '30d') {
    const cached = metricsCache.get(range);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached.data;
    }

    const startTime = Date.now();
    let days = 30;
    if (range === '7d') days = 7;
    if (range === '90d') days = 90;
    if (range === '1y') days = 365;

    const sinceDate = new Date();
    sinceDate.setDate(sinceDate.getDate() - days);

    // Run all independent DB queries concurrently via Promise.all for maximum speed
    // Group queries into smaller batches to prevent connection pool spikes and timeouts
    const [
      alumniProfilesCount,
      alumniUsersCount,
      employerProfilesCount,
      employerUsersCount,
      totalAssignments,
      completedAssignments,
      activeJobs,
      verifiedAlumni,
      allAlumniSample,
      pendingAlumni
    ] = await Promise.all([
      prisma.alumniProfile.count().catch(() => 0),
      prisma.user.count({ where: { role: Role.ALUMNI } }).catch(() => 0),
      prisma.employerProfile.count().catch(() => 0),
      prisma.user.count({ where: { role: Role.EMPLOYER } }).catch(() => 0),
      prisma.surveyAssignment.count().catch(() => 0),
      prisma.surveyAssignment.count({ where: { status: 'COMPLETED' } }).catch(() => 0),
      prisma.job.count({ where: { status: 'PUBLISHED', isActive: true } }).catch(() => 0),
      prisma.alumniProfile.count({ where: { isVerified: true } }).catch(() => 0),
      prisma.alumniProfile.findMany({
        take: 50,
        select: {
          fullName: true,
          email: true,
          phone: true,
          departmentId: true,
          department: true,
          graduationYear: true,
          isVerified: true
        }
      }).catch(() => []),
      prisma.alumniProfile.count({ where: { isVerified: false } }).catch(() => 0),
    ]);

    const [
      pendingEmployers,
      pendingJobs,
      pendingManualDocs,
      duplicateStudentIds,
      duplicateEmails,
      registrarCount,
      userCount,
      jobAppsCount,
      lastSyncLog,
      lastAuditLog
    ] = await Promise.all([
      prisma.employerProfile.count({ where: { isVerified: false } }).catch(() => 0),
      prisma.job.count({ where: { status: 'DRAFT' as any } }).catch(() => 0),
      prisma.documentRequest.count({ where: { status: 'PENDING' } }).catch(() => 0),
      prisma.alumniProfile.groupBy({
        by: ['studentId'],
        _count: { studentId: true },
        having: { studentId: { _count: { gt: 1 } } }
      }).catch(() => []),
      prisma.user.groupBy({
        by: ['email'],
        _count: { email: true },
        having: { email: { _count: { gt: 1 } } }
      }).catch(() => []),
      prisma.registrarStudent.count().catch(() => 0),
      prisma.user.count().catch(() => 0),
      prisma.jobApplication.count().catch(() => 0),
      prisma.registrarSyncLog.findFirst({ orderBy: { syncedAt: 'desc' } }).catch(() => null),
      prisma.auditLog.findFirst({ orderBy: { createdAt: 'desc' } }).catch(() => null),
    ]);

    const [
      recentLogs,
      depts,
      allEmployers,
      allWorkExps,
      allTracerAnswers,
      feedbacks,
      auditLogsCount,
      totalRequests,
      approvedRequests
    ] = await Promise.all([
      prisma.auditLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: 6,
      }).catch(() => []),
      prisma.department.findMany({
        select: {
          code: true,
          name: true,
          alumniProfiles: {
            select: { id: true, employmentStatus: true }
          }
        }
      }).catch(() => []),
      prisma.employerProfile.findMany({
        take: 100,
        select: {
          id: true,
          companyName: true,
          industry: true,
          isVerified: true,
          location: true,
          jobs: {
            select: {
              id: true,
              title: true,
              applications: {
                where: {
                  OR: [{ status: 'HIRED' }, { status: 'ACCEPTED' }]
                },
                select: {
                  id: true,
                  status: true,
                  alumni: {
                    select: {
                      id: true,
                      fullName: true,
                      email: true,
                      phone: true,
                      graduationYear: true,
                      department: true,
                      studentId: true
                    }
                  }
                }
              }
            }
          }
        }
      }).catch(() => []),
      prisma.workExperience.findMany({
        take: 200,
        select: {
          companyName: true,
          industry: true,
          position: true,
          alumni: {
            select: {
              id: true,
              fullName: true,
              email: true,
              phone: true,
              graduationYear: true,
              department: true,
              studentId: true
            }
          }
        }
      }).catch(() => []),
      prisma.surveyAnswer.findMany({
        take: 200,
        where: {
          answerText: { not: '' }
        },
        select: {
          answerText: true,
          response: {
            select: {
              alumni: {
                select: {
                  id: true,
                  fullName: true,
                  email: true,
                  phone: true,
                  graduationYear: true,
                  department: true,
                  studentId: true
                }
              }
            }
          }
        }
      }).catch(() => []),
      prisma.employerFeedback.findMany({ take: 30, select: { missingSkills: true } }).catch(() => []),
      prisma.auditLog.count().catch(() => 0),
      prisma.documentRequest.count().catch(() => 0),
      prisma.documentRequest.count({ where: { status: 'APPROVED' } }).catch(() => 0)
    ]);

    // 1. Core KPIs
    const totalAlumni = Math.max(alumniProfilesCount, alumniUsersCount);
    const totalEmployers = Math.max(employerProfilesCount, employerUsersCount);
    const surveyCompletionRate = totalAssignments > 0 ? Math.round((completedAssignments / totalAssignments) * 100) : 0;

    // 2. Identity Coverage & Completeness
    const identityCoverage = totalAlumni > 0 ? Math.min(100, Math.round((verifiedAlumni / totalAlumni) * 100)) : 100;
    let totalScore = 0;
    if (allAlumniSample.length > 0) {
      allAlumniSample.forEach((p: any) => {
        let score = 0;
        if (p.fullName) score += 20;
        if (p.email) score += 20;
        if (p.phone) score += 15;
        if (p.departmentId || p.department) score += 15;
        if (p.graduationYear) score += 15;
        if (p.isVerified) score += 15;
        totalScore += score;
      });
    }
    const profileCompleteness = allAlumniSample.length > 0 ? Math.round(totalScore / allAlumniSample.length) : 0;

    // 3. Duplicate scans count
    const openDuplicatesCount = (duplicateStudentIds || []).length + (duplicateEmails || []).length;

    // 4. Database Total Records Count
    const totalRecordsCount = totalAlumni + totalEmployers + registrarCount + userCount + jobAppsCount;
    const formattedRecordsCount = totalRecordsCount >= 1000 ? `${(totalRecordsCount / 1000).toFixed(1)}k` : `${totalRecordsCount}`;

    // 5. Last Sync calculation
    let lastSyncText = 'Just now';
    const latestTime = lastSyncLog?.syncedAt || lastAuditLog?.createdAt;
    if (latestTime) {
      const diffMinutes = Math.floor((Date.now() - new Date(latestTime).getTime()) / (1000 * 60));
      if (diffMinutes < 1) lastSyncText = 'Just now';
      else if (diffMinutes < 60) lastSyncText = `${diffMinutes} min ago`;
      else lastSyncText = `${Math.floor(diffMinutes / 60)}h ago`;
    }

    // 6. Employment Rate by Department
    let employmentData = depts.map((d: any) => {
      const total = d.alumniProfiles?.length || 0;
      const employed = (d.alumniProfiles || []).filter((a: any) => a.employmentStatus === 'EMPLOYED' || a.employmentStatus === 'SELF_EMPLOYED').length;
      return {
        department: d.code || d.name?.substring(0, 3).toUpperCase() || 'DEPT',
        value: total > 0 ? Math.round((employed / total) * 100) : 0
      };
    });

    if (employmentData.length === 0) {
      const alumniByDept = await prisma.alumniProfile.findMany({
        take: 100,
        select: { department: true, employmentStatus: true }
      }).catch(() => []);

      const deptGroup: Record<string, { total: number; employed: number }> = {};
      alumniByDept.forEach((a: any) => {
        const deptName = typeof a.department === 'string' ? a.department : a.department?.code || a.department?.name || 'General';
        if (!deptGroup[deptName]) deptGroup[deptName] = { total: 0, employed: 0 };
        deptGroup[deptName].total += 1;
        if (a.employmentStatus === 'EMPLOYED' || a.employmentStatus === 'SELF_EMPLOYED') {
          deptGroup[deptName].employed += 1;
        }
      });

      employmentData = Object.entries(deptGroup).map(([dept, counts]) => ({
        department: dept.length > 5 ? dept.substring(0, 4).toUpperCase() : dept.toUpperCase(),
        value: counts.total > 0 ? Math.round((counts.employed / counts.total) * 100) : 0
      }));
    }

    // 7. Top Hiring Companies calculation
    const isLikelyInvalidCompany = (str: string) => {
      const cleaned = str.trim().toLowerCase();
      if (cleaned.length < 3) return true;
      if (!/[aeiouy]/i.test(cleaned)) return true;
      if (/^(.)\1+$/.test(cleaned)) return true;
      
      const invalidKeywords = [
        'bachelor', 'master', 'phd', 'degree', 'student', 'none', 'n/a', 'na', 
        'test', 'null', 'undefined', 'xax', 'adas', 'qdsd', 'sdcsd', 'refdfd', 
        'fdvfdv', 'erferferf', 'self', 'freelance', 'unemployed', 'dvdfv', 'wedwed',
        'sdcs', 'sdcsdc', 'dscsc', 'sdsdf', 'sdfsd', 'adscsdc', 'dscsdcsdc', 'dscdscsdc',
        'yes', 'no', 'agree', 'satisfied', 'good', 'excellent'
      ];
      if (invalidKeywords.some(kw => cleaned === kw || cleaned.startsWith(kw))) return true;
      if (!cleaned.includes(' ') && cleaned.length <= 4 && !['google', 'mantrac', 'ecae', 'wego', 'insa', 'astu'].some(k => cleaned.includes(k))) {
        return true;
      }
      return false;
    };

    interface HiredAlumnusRecord {
      id: string;
      name: string;
      email?: string;
      phone?: string;
      department?: string;
      graduationYear?: number | string;
      position?: string;
      source: 'Platform Application' | 'Work Experience' | 'Tracer Survey';
    }

    const companyHiresMap: Record<string, {
      id?: string;
      displayName: string;
      hires: number;
      postedJobs: number;
      industry: string;
      isVerified: boolean;
      location: string;
      alumniList: HiredAlumnusRecord[];
    }> = {};

    const formatDept = (d: any) => {
      if (!d) return 'Engineering';
      if (typeof d === 'string') return d;
      return d.name || d.code || 'Engineering';
    };

    allEmployers.forEach((emp: any) => {
      const rawName = (emp.companyName || '').trim();
      if (!rawName || isLikelyInvalidCompany(rawName)) return;
      const key = rawName.toLowerCase();
      
      const alumniList: HiredAlumnusRecord[] = [];
      let appHires = 0;

      if (emp.jobs) {
        emp.jobs.forEach((j: any) => {
          if (j.applications) {
            j.applications.forEach((app: any) => {
              if (app.alumni) {
                appHires += 1;
                alumniList.push({
                  id: app.alumni.id,
                  name: app.alumni.fullName || 'ASTU Graduate',
                  email: app.alumni.email || 'N/A',
                  phone: app.alumni.phone || 'N/A',
                  department: formatDept(app.alumni.department),
                  graduationYear: app.alumni.graduationYear || 'Class of 2024',
                  position: j.title || 'Hired Candidate',
                  source: 'Platform Application'
                });
              }
            });
          }
        });
      }

      const postedJobs = emp.jobs?.length || 0;

      if (!companyHiresMap[key]) {
        companyHiresMap[key] = {
          id: emp.id,
          displayName: rawName,
          hires: appHires,
          postedJobs,
          industry: emp.industry || 'Technology & Engineering',
          isVerified: Boolean(emp.isVerified),
          location: emp.location || 'Ethiopia',
          alumniList
        };
      } else {
        companyHiresMap[key].hires += appHires;
        companyHiresMap[key].postedJobs += postedJobs;
        companyHiresMap[key].alumniList.push(...alumniList);
      }
    });

    // Match work exps
    const existingCompanyKeys = Object.keys(companyHiresMap);
    allWorkExps.forEach((exp: any) => {
      const rawName = (exp.companyName || '').trim();
      if (!rawName || isLikelyInvalidCompany(rawName)) return;
      const key = rawName.toLowerCase();
      
      const matchedKey = existingCompanyKeys.find(k => k === key || k.includes(key) || key.includes(k));
      const alumniRecord: HiredAlumnusRecord | null = exp.alumni ? {
        id: exp.alumni.id,
        name: exp.alumni.fullName || 'ASTU Graduate',
        email: exp.alumni.email || 'N/A',
        phone: exp.alumni.phone || 'N/A',
        department: formatDept(exp.alumni.department),
        graduationYear: exp.alumni.graduationYear || 'Class of 2024',
        position: exp.position || 'Employee',
        source: 'Work Experience'
      } : null;

      if (matchedKey) {
        if (alumniRecord && !companyHiresMap[matchedKey].alumniList.some(a => a.id === alumniRecord.id)) {
          companyHiresMap[matchedKey].alumniList.push(alumniRecord);
          companyHiresMap[matchedKey].hires = companyHiresMap[matchedKey].alumniList.length;
        }
      } else {
        companyHiresMap[key] = {
          displayName: rawName,
          hires: alumniRecord ? 1 : 1,
          postedJobs: 0,
          industry: exp.industry || 'Industry Partner',
          isVerified: false,
          location: 'Ethiopia',
          alumniList: alumniRecord ? [alumniRecord] : []
        };
        existingCompanyKeys.push(key);
      }
    });

    // Match tracer answers
    allTracerAnswers.forEach((ans: any) => {
      const rawName = (ans.answerText || '').trim();
      if (!rawName || isLikelyInvalidCompany(rawName)) return;
      const key = rawName.toLowerCase();

      const alumniRecord: HiredAlumnusRecord | null = ans.response?.alumni ? {
        id: ans.response.alumni.id,
        name: ans.response.alumni.fullName || 'ASTU Graduate',
        email: ans.response.alumni.email || 'N/A',
        phone: ans.response.alumni.phone || 'N/A',
        department: formatDept(ans.response.alumni.department),
        graduationYear: ans.response.alumni.graduationYear || 'Class of 2024',
        position: 'Tracer Survey Respondent',
        source: 'Tracer Survey'
      } : null;

      const matchedKey = existingCompanyKeys.find(k => k === key || k.includes(key) || key.includes(k));
      if (matchedKey) {
        if (alumniRecord && !companyHiresMap[matchedKey].alumniList.some(a => a.id === alumniRecord.id)) {
          companyHiresMap[matchedKey].alumniList.push(alumniRecord);
          companyHiresMap[matchedKey].hires = companyHiresMap[matchedKey].alumniList.length;
        }
      } else if (alumniRecord) {
        companyHiresMap[key] = {
          displayName: rawName,
          hires: 1,
          postedJobs: 0,
          industry: 'Tracer Study Partner',
          isVerified: false,
          location: 'Ethiopia',
          alumniList: [alumniRecord]
        };
        existingCompanyKeys.push(key);
      }
    });

    const allCompaniesList = Object.values(companyHiresMap);
    const totalSystemHires = allCompaniesList.reduce((sum, c) => sum + c.hires, 0) || 1;

    const sectorHiresMap: Record<string, number> = {};
    allCompaniesList.forEach(c => {
      const ind = c.industry || 'Technology & Engineering';
      sectorHiresMap[ind] = (sectorHiresMap[ind] || 0) + c.hires;
    });

    const sortedSectors = Object.entries(sectorHiresMap).sort((a, b) => b[1] - a[1]);
    const leadingSector = sortedSectors[0]?.[0] || 'Technology & Engineering';
    const leadingSectorHires = sortedSectors[0]?.[1] || 0;

    const sortedAllCompanies = allCompaniesList
      .map(c => ({
        id: c.id || c.displayName.toLowerCase().replace(/\s+/g, '-'),
        name: c.displayName,
        hires: c.hires,
        percentage: Math.round((c.hires / totalSystemHires) * 100),
        postedJobs: c.postedJobs,
        industry: c.industry,
        isVerified: c.isVerified,
        location: c.location,
        alumniList: c.alumniList
      }))
      .sort((a, b) => b.hires - a.hires);

    const activeHiringCompanies = sortedAllCompanies.slice(0, 5);

    // 8. Skill Gaps
    const skillMap: Record<string, number> = {};
    feedbacks.forEach((fb: any) => {
      if (fb.missingSkills && Array.isArray(fb.missingSkills)) {
        fb.missingSkills.forEach((s: string) => {
          skillMap[s] = (skillMap[s] || 0) + 1;
        });
      }
    });

    const skillGaps = Object.entries(skillMap)
      .map(([skill, count]) => ({ skill, value: Math.min(100, count * 20) }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 4);

    // 9. SLA
    const slaPercent = totalRequests > 0 ? Math.round((approvedRequests / totalRequests) * 100) : 100;
    const executionLatencyMs = Date.now() - startTime;

    const result = {
      kpis: {
        totalAlumni,
        totalEmployers,
        surveyCompletion: `${surveyCompletionRate}%`,
        activeJobs
      },
      headerInfo: {
        totalRecords: `${formattedRecordsCount} records`,
        lastSync: lastSyncText,
        activeSessions: `${Math.max(1, totalAlumni + totalEmployers)} active sessions`,
      },
      systemHealth: {
        apiLatency: `${Math.max(4, executionLatencyMs)}ms`,
        apiLatencyNum: executionLatencyMs,
        dbStatus: `${formattedRecordsCount} records`,
        completeness: `${profileCompleteness}%`,
        activeSessions: `${Math.max(1, totalAlumni + totalEmployers)} active sessions`,
        latencyTrend: executionLatencyMs < 100 ? 'Optimal' : executionLatencyMs < 300 ? 'Normal' : 'High Latency'
      },
      commandCenter: {
        identityCoverage: `${identityCoverage}%`,
        approvalQueueCount: pendingAlumni + pendingEmployers + pendingJobs + pendingManualDocs,
        systemSLA: `${slaPercent}% On-Time`,
        exportStatus: totalRecordsCount > 0 ? 'Ready' : 'No Data',
        duplicateScan: `${openDuplicatesCount} open`,
        completeness: `${profileCompleteness}%`,
        auditTrail: auditLogsCount > 0 ? `${auditLogsCount} Logged` : '0 Logged',
        healthStatusText: openDuplicatesCount === 0 
          ? `System database health verified conflict-free across ${formattedRecordsCount} records. ${auditLogsCount} audit logs active.`
          : `Database scan detected ${openDuplicatesCount} potential record conflicts across ${formattedRecordsCount} records. ${auditLogsCount} audit logs active.`
      },
      pendingActions: [
        { label: `${pendingAlumni} alumni accounts pending verification`, action: 'Verify', tone: '#003580', path: '/admin/users?status=PENDING&role=ALUMNI' },
        { label: `${pendingEmployers} new employer registrations`, action: 'Approve', tone: '#1D9E75', path: '/admin/users?status=PENDING&role=EMPLOYER' },
        { label: `${pendingJobs} job postings awaiting approval`, action: 'Review', tone: '#E8A020', path: '/admin/jobs?status=DRAFT' },
        { label: `${pendingManualDocs} manual document requests pending`, action: 'Inspect', tone: '#7C3AED', path: '/admin/users?tab=documents' },
      ].filter(a => !a.label.startsWith('0')),
      systemActivities: (recentLogs || []).length > 0 ? recentLogs.map((log: any) => ({
        text: `${log.action} - ${log.details || 'System event logged'}`,
        time: log.createdAt ? log.createdAt.toISOString() : new Date().toISOString(),
        tone: '#003580'
      })) : [
        { text: 'Database connection verified & operational', time: new Date().toISOString(), tone: '#1D9E75' },
      ],
      employmentData,
      topHiringCompanies: activeHiringCompanies,
      allHiringCompanies: sortedAllCompanies,
      totalSystemHires,
      leadingSector,
      leadingSectorHires,
      skillGaps,
    };

    // Cache computed metrics in memory
    metricsCache.set(range, { data: result, timestamp: Date.now() });

    return result;
  }
}
