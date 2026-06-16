import prisma from '../../../../core/config/db';

export class GetAdminOverview {
  async execute() {
    const totalAlumni = await prisma.alumniProfile.count();
    const totalEmployers = await prisma.employerProfile.count();
    const activeJobs = await prisma.job.count({ where: { isActive: true } });
    const surveyResponses = await prisma.surveyResponse.count();

    // Fallbacks for complex charts that don't have DB schemas yet
    const dashboardOverview = {
      stats: [
        { label: 'Total Alumni', value: totalAlumni.toString(), trend: '+0 this year', tone: 'blue' },
        { label: 'Total Employers', value: totalEmployers.toString(), trend: '+0 this month', tone: 'gold' },
        { label: 'Survey Responses', value: surveyResponses.toString(), trend: '0% vs last year', tone: 'green' },
        { label: 'Active Jobs', value: activeJobs.toString(), trend: '0 expiring soon', tone: 'purple' },
      ],
      employmentRateByDepartment: [
        { department: 'SE', value: 92 },
        { department: 'ME', value: 84 },
        { department: 'CE', value: 89 },
        { department: 'EE', value: 77 },
        { department: 'CHE', value: 95 },
        { department: 'IE', value: 81 },
      ],
      surveyCompletion: [
        { name: 'Completed', value: 68, color: '#1D9E75' },
        { name: 'Pending', value: 22, color: '#E8A020' },
        { name: 'Never Responded', value: 10, color: '#E24B4A' },
      ],
      employmentTrends: [
        { year: '2020', employed: 61, selfEmployed: 14 },
        { year: '2021', employed: 65, selfEmployed: 16 },
        { year: '2022', employed: 70, selfEmployed: 18 },
        { year: '2023', employed: 74, selfEmployed: 20 },
        { year: '2024', employed: 79, selfEmployed: 23 },
      ],
      hiringCompanies: [
        { name: 'Ethio Telecom', hires: 34 },
        { name: 'Safaricom', hires: 29 },
        { name: 'INSA', hires: 25 },
        { name: 'Ethiopian Airlines', hires: 21 },
        { name: 'Huawei', hires: 18 },
      ],
      activities: [],
      pendingActions: [],
      skillGaps: [
        { skill: 'Cloud Computing', value: 78 },
        { skill: 'DevOps', value: 71 },
        { skill: 'AI/ML', value: 65 },
        { skill: 'Cyber Security', value: 58 },
      ],
    };

    return dashboardOverview;
  }
}
