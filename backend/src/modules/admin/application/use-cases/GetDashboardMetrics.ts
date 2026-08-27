import prisma from '../../../../core/config/db';
import { Role } from '@prisma/client';

export class GetDashboardMetrics {
  async execute() {
    // 1. Core KPIs from real Database queries
    const totalAlumni = await prisma.user.count({ where: { role: Role.ALUMNI } });
    const totalEmployers = await prisma.user.count({ where: { role: Role.EMPLOYER } });
    
    // Real survey completion from DB
    const totalAssignments = await prisma.surveyAssignment.count();
    const completedAssignments = await prisma.surveyAssignment.count({ where: { status: 'COMPLETED' } });
    const surveyCompletionRate = totalAssignments > 0 ? Math.round((completedAssignments / totalAssignments) * 100) : 0;

    const activeJobs = await prisma.job.count({ where: { status: 'PUBLISHED', isActive: true } });

    // 2. Pending Actions from real Database records
    const pendingAlumni = await prisma.alumniProfile.count({ where: { isVerified: false } });
    const pendingEmployers = await prisma.employerProfile.count({ where: { isVerified: false } });
    const pendingJobs = await prisma.job.count({ where: { status: 'DRAFT' as any } });
    
    // 3. System Activities from real Audit logs
    const recentLogs = await prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 6,
      include: { user: true }
    });

    // 4. Real Employment Rate by Department calculated from alumni profile records
    const depts = await prisma.department.findMany({
      include: {
        alumniProfiles: {
          select: { id: true, employmentStatus: true }
        }
      }
    });

    const employmentData = depts.map((d: any) => {
      const total = d.alumniProfiles.length;
      const employed = d.alumniProfiles.filter((a: any) => a.employmentStatus === 'EMPLOYED' || a.employmentStatus === 'SELF_EMPLOYED').length;
      return {
        department: d.code || d.name.substring(0, 3).toUpperCase(),
        value: total > 0 ? Math.round((employed / total) * 100) : 0
      };
    });

    return {
      kpis: {
        totalAlumni,
        totalEmployers,
        surveyCompletion: `${surveyCompletionRate}%`,
        activeJobs
      },
      pendingActions: [
        { label: `${pendingAlumni} alumni accounts pending verification`, action: 'Verify', tone: '#003580' },
        { label: `${pendingEmployers} new employer registrations`, action: 'Approve', tone: '#1D9E75' },
        { label: `${pendingJobs} job postings awaiting approval`, action: 'Review', tone: '#E8A020' },
      ].filter(a => !a.label.startsWith('0')),
      systemActivities: recentLogs.map(log => ({
        text: `${log.action} - ${log.details || 'User Action'}`,
        time: log.createdAt.toISOString(),
        tone: '#003580'
      })),
      employmentData: employmentData.length > 0 ? employmentData : [
        { department: 'SWE', value: 0 },
        { department: 'MEG', value: 0 },
        { department: 'ECE', value: 0 },
        { department: 'CVE', value: 0 },
        { department: 'COM', value: 0 },
      ]
    };
  }
}
