export class EmploymentStats {
  constructor(
    public readonly totalAlumni: number,
    public readonly employed: number,
    public readonly unemployed: number,
    public readonly selfEmployed: number,
    public readonly employmentRate: number, // percentage
    public readonly unemploymentRate: number, // percentage
    public readonly selfEmploymentRate: number, // percentage
    public readonly averageSalary: number,
    public readonly medianSalary: number,
    public readonly salaryGrowth: number, // percentage growth over years
    public readonly averageTimeToHireMonths: number,
    public readonly employmentTrend: { year: number; rate: number }[],
    public readonly graduateOutcomeTrend: { year: number; employed: number; unemployed: number; selfEmployed: number }[]
  ) {}
}

export class SkillGapStats {
  constructor(
    public readonly averageTechnical: number,
    public readonly averageCommunication: number,
    public readonly averageLeadership: number,
    public readonly averageTeamwork: number,
    public readonly averageProblemSolving: number,
    public readonly averageInnovation: number,
    public readonly totalFeedbackCount: number
  ) {}
}

export class DepartmentMetric {
  constructor(
    public readonly departmentName: string,
    public readonly departmentCode: string,
    public readonly totalAlumni: number,
    public readonly employmentRate: number,
    public readonly averageSalary: number,
    public readonly employabilityScore: number, // calculated out of 100
    public readonly statusDistribution: { status: string; count: number }[]
  ) {}
}

export class EmployerAnalytics {
  constructor(
    public readonly topHiringCompanies: { companyName: string; count: number }[],
    public readonly mostActiveEmployers: { companyName: string; jobPostCount: number }[],
    public readonly companyHiringRate: { companyName: string; rate: number }[], // accepted applications / total
    public readonly averageEmployerSatisfaction: number, // out of 10
    public readonly employerDemandTrend: { month: string; jobCount: number }[],
    public readonly employerRankings: { companyName: string; score: number }[], // based on feedback + hiring
    public readonly employerSalaryRanking: { companyName: string; averageSalaryPaid: number }[],
    public readonly employerGrowthTrend: { companyName: string; growthPercentage: number }[]
  ) {}
}

export class DepartmentAnalytics {
  constructor(
    public readonly departmentMetrics: DepartmentMetric[],
    public readonly departmentRankings: { code: string; rank: number }[],
    public readonly departmentSalaryRankings: { code: string; averageSalary: number }[],
    public readonly trendAnalysis: { year: number; departments: { code: string; rate: number }[] }[],
    public readonly performanceBenchmarks: { code: string; score: number }[]
  ) {}
}

export class CurriculumAnalytics {
  constructor(
    public readonly skillGaps: { skill: string; gapScore: number }[], // employer satisfaction gap (desired e.g. 9.0 vs actual avg)
    public readonly missingSkills: { skill: string; demandCount: number }[], // mentioned in jobs but not in alumni profiles
    public readonly emergingTechnologies: { skill: string; count: number }[], // growth in job specs
    public readonly curriculumRelevanceScore: number, // out of 100, parsed from tracer answers
    public readonly improvementOpportunities: { area: string; priority: 'HIGH' | 'MEDIUM' | 'LOW'; description: string }[]
  ) {}
}

export class TracerAnalytics {
  constructor(
    public readonly surveyCompletionRate: number, // percentage
    public readonly surveyParticipationRate: number, // percentage
    public readonly responseRate: number, // percentage
    public readonly responseTrend: { date: string; count: number }[],
    public readonly alumniEngagementScore: number // score out of 100
  ) {}
}

export class AnalyticsReport {
  constructor(
    public readonly overallEmployment: EmploymentStats,
    public readonly skills: SkillGapStats,
    public readonly departments: DepartmentMetric[],
    public readonly employers: EmployerAnalytics,
    public readonly departmentAnalytics: DepartmentAnalytics,
    public readonly curriculum: CurriculumAnalytics,
    public readonly tracer: TracerAnalytics
  ) {}
}
