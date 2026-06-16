import prisma from '../../../../core/config/db';
import { Role, AlumniStatus } from '@prisma/client';

export class GetDashboardMetrics {
  async execute() {
    // 1. Core KPIs
    const totalAlumni = await prisma.user.count({ where: { role: Role.ALUMNI } });
    const totalEmployers = await prisma.user.count({ where: { role: Role.EMPLOYER } });
    
    // Fallbacks if no data
    const safeTotalAlumni = totalAlumni || 1;
    
    // Approximating survey completion (mocked actual calculation logic to be safe)
    const surveyResponses = await prisma.surveyResponse.count();
    const surveyCompletion = Math.min(100, Math.round((surveyResponses / safeTotalAlumni) * 100));

    const activeJobs = await prisma.job.count({ where: { status: 'PUBLISHED', isActive: true } });

    // 2. Pending Actions
    const pendingAlumni = await prisma.alumniProfile.count({ where: { isVerified: false } });
    const pendingEmployers = await prisma.employerProfile.count({ where: { isVerified: false } });
    const pendingJobs = await prisma.job.count({ where: { status: 'DRAFT' as any } });
    
    // 3. System Activities (Audit logs)
    const recentLogs = await prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 6,
      include: { user: true }
    });

    // 4. Employment by Department (Mocking for now unless real data exists)
    // In reality, this requires group by on alumni profiles.
    const depts = await prisma.department.findMany();

    const employmentData = depts.slice(0, 6).map((d: any) => ({
      department: d.code || d.name.substring(0, 3).toUpperCase(),
      value: 80 + Math.floor(Math.random() * 15) // Mocked employment % for now
    }));

    return {
      kpis: {
        totalAlumni,
        totalEmployers,
        surveyCompletion: `${surveyCompletion}%`,
        activeJobs
      },
      pendingActions: [
        { label: `${pendingAlumni} alumni accounts pending verification`, action: 'Verify', tone: '#003580' },
        { label: `${pendingEmployers} new employer registrations`, action: 'Approve', tone: '#1D9E75' },
        { label: `${pendingJobs} job postings awaiting approval`, action: 'Review', tone: '#E8A020' },
      ].filter(a => !a.label.startsWith('0')),
      systemActivities: recentLogs.map(log => ({
        text: `${log.action} - ${log.details}`,
        time: log.createdAt.toISOString(),
        tone: '#003580'
      })),
      employmentData: employmentData.length > 0 ? employmentData : [
        { department: 'SE', value: 92 },
        { department: 'ME', value: 84 },
        { department: 'CE', value: 89 }
      ]
    };
  }
}
