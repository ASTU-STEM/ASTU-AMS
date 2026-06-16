import prisma from '../../../../core/config/db';

export class GetAdminAnalytics {
  async execute() {
    // Return structured mock data for complex charts but fetch real DB stats
    const totalAlumni = await prisma.alumniProfile.count();
    
    return {
      keyMetrics: [
        { label: 'Overall Employment Rate', value: '76.8%', tone: 'blue' },
        { label: 'Average Time to Hire', value: '4.2 months', tone: 'gold' },
        { label: 'Avg Starting Salary', value: 'ETB 18,500/mo', tone: 'green' },
        { label: 'Total Alumni Registered', value: totalAlumni.toString(), tone: 'purple' },
      ],
      employmentByDepartmentYear: [
        { department: 'Software Engineering', y2022: 84, y2023: 88, y2024: 92 },
        { department: 'Computer Science', y2022: 78, y2023: 84, y2024: 88 },
      ],
      skillGapTop10: [
        { skill: 'Cloud Computing', value: 92 },
        { skill: 'DevOps', value: 88 },
      ],
      skillGapHeatMap: [],
      employerRadar: [
        { subject: 'Technical', score: 4.5 },
        { subject: 'Communication', score: 4.1 },
      ],
      employerFeedbackEntries: [],
      geoDistribution: [
        { name: 'Addis Ababa', value: 41 },
        { name: 'Adama', value: 15 },
      ],
      timeToHireTrend: [
        { batch: '2023', months: 4.4 },
        { batch: '2024', months: 4.2 },
      ],
      departmentYearTable: [],
      jobsPostedByMonth: [
        { month: 'Jan', jobs: 12 },
        { month: 'Feb', jobs: 15 },
      ],
      applicationFunnel: [
        { stage: 'Posted', value: 120 },
        { stage: 'Applied', value: 86 },
        { stage: 'Shortlisted', value: 35 },
        { stage: 'Hired', value: 18 },
      ],
    };
  }
}
