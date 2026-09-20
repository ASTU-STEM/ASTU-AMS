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
    public readonly employmentTrend: { year: number; rate: number; averageTimeToHireMonths?: number }[],
    public readonly graduateOutcomeTrend: { year: number; employed: number; unemployed: number; selfEmployed: number }[],
    public readonly geographicDistribution: { name: string; count: number; value: number; fill: string }[] = [],
    public readonly industryBreakdown: { industry: string; count: number; value: number; fill: string }[] = [],
    public readonly genderParity: { female: { total: number; employed: number; rate: number; averageSalary: number }; male: { total: number; employed: number; rate: number; averageSalary: number } } = { female: { total: 0, employed: 0, rate: 0, averageSalary: 0 }, male: { total: 0, employed: 0, rate: 0, averageSalary: 0 } },
    public readonly salaryTiers: { tier: string; count: number; percentage: number }[] = [],
    public readonly hiringFunnel: { applied: number; shortlisted: number; interviewed: number; hired: number } = { applied: 0, shortlisted: 0, interviewed: 0, hired: 0 },
    public readonly cgpaAnalytics: { cgpaBand: string; count: number; employmentRate: number; averageSalary: number }[] = [],
    public readonly mentorshipMetrics: { totalMentors: number; totalMentees: number; activeSessions: number; completedSessions: number } = { totalMentors: 0, totalMentees: 0, activeSessions: 0, completedSessions: 0 },
    public readonly communityGiving: { totalDonated: number; totalDonors: number; categories: { category: string; amount: number }[] } = { totalDonated: 0, totalDonors: 0, categories: [] },
    public readonly extendedMetrics: ExtendedAnalyticsStats = new ExtendedAnalyticsStats()
  ) {}
}

export class ExtendedAnalyticsStats {
  constructor(
    public readonly appStatusDistribution: { status: string; count: number }[] = [],
    public readonly topInDemandSkills: { skill: string; count: number }[] = [],
    public readonly employerRatingByIndustry: { industry: string; averageRating: number; count: number }[] = [],
    public readonly verificationRatio: { verified: number; pending: number; verificationRate: number } = { verified: 0, pending: 0, verificationRate: 0 },
    public readonly profileCompleteness: { complete: number; partial: number; basic: number } = { complete: 0, partial: 0, basic: 0 },
    public readonly mentorshipPipeline: { pending: number; approved: number; scheduled: number; completed: number } = { pending: 0, approved: 0, scheduled: 0, completed: 0 },
    public readonly documentRequestPipeline: { pending: number; inProgress: number; approved: number; rejected: number } = { pending: 0, inProgress: 0, approved: 0, rejected: 0 },
    public readonly eventRSVPConversion: { totalRegistrations: number; confirmedRsvps: number; conversionRate: number } = { totalRegistrations: 0, confirmedRsvps: 0, conversionRate: 0 },
    public readonly careerMobility: { multipleJobsCount: number; singleJobCount: number; promotionRate: number } = { multipleJobsCount: 0, singleJobCount: 0, promotionRate: 0 },
    public readonly languageProficiency: { language: string; count: number }[] = [],
    public readonly companySizeDistribution: { size: string; count: number }[] = [],
    public readonly professionalLinksRatio: { linkedin: number; github: number; portfolio: number; resume: number } = { linkedin: 0, github: 0, portfolio: 0, resume: 0 },
    public readonly supportTicketSLA: { open: number; inProgress: number; pendingAdmin: number; resolved: number; closed: number } = { open: 0, inProgress: 0, pendingAdmin: 0, resolved: 0, closed: 0 },
    public readonly curriculumRelevanceRating: { rating: string; count: number }[] = [],
    public readonly jobPostingsByType: { jobType: string; count: number }[] = [],
    public readonly universityIndustryMoU: {
      verifiedMoUPartnerships: number;
      corporatePlacementDrives: number;
      mouRenewalRate: number;
      industryResearchInternships: number;
      corporateFeedbackScore: number;
      industryMoUBreakdown: { industry: string; mouCount: number; placementCount: number }[];
    } = { verifiedMoUPartnerships: 0, corporatePlacementDrives: 0, mouRenewalRate: 0, industryResearchInternships: 0, corporateFeedbackScore: 0, industryMoUBreakdown: [] },
    public readonly departmentMultiYearPerformance: {
      department: string;
      year: number;
      totalGraduates: number;
      employmentRate: number;
      avgSalary: number;
      docRequestsCount: number;
    }[] = [],
    public readonly registrarImportTelemetry: {
      totalImportedRecords: number;
      verifiedImportedRecords: number;
      failedValidationRecords: number;
      batchImportSuccessRate: number;
      dataCompletenessScore: number;
      importBatchLogs: { batchYear: number; recordsProcessed: number; successRate: number; errorCount: number }[];
    } = { totalImportedRecords: 0, verifiedImportedRecords: 0, failedValidationRecords: 0, batchImportSuccessRate: 0, dataCompletenessScore: 0, importBatchLogs: [] },
    public readonly documentRequestSLA: {
      totalRequests: number;
      approvedRequests: number;
      inProgressRequests: number;
      pendingRequests: number;
      rejectedRequests: number;
      avgFulfillmentTimeHours: number;
      documentTypeDistribution: { documentType: string; count: number; approvalRate: number }[];
    } = { totalRequests: 0, approvedRequests: 0, inProgressRequests: 0, pendingRequests: 0, rejectedRequests: 0, avgFulfillmentTimeHours: 0, documentTypeDistribution: [] },
    public readonly platformUserEngagement: {
      totalPlatformAccounts: number;
      activeAccounts: number;
      pendingVerificationAccounts: number;
      deactivatedAccounts: number;
      dailyActiveLogins: number;
      monthlyActiveUsers: number;
      accountCompletionVelocityDays: number;
      roleDistribution: { role: string; count: number; activeCount: number }[];
    } = { totalPlatformAccounts: 0, activeAccounts: 0, pendingVerificationAccounts: 0, deactivatedAccounts: 0, dailyActiveLogins: 0, monthlyActiveUsers: 0, accountCompletionVelocityDays: 0, roleDistribution: [] },
    public readonly systemHealthAndAI: {
      systemOperationalHealthScore: number;
      totalSupportTickets: number;
      resolvedSupportTickets: number;
      openSupportTickets: number;
      ticketResolutionSLAHours: number;
      aiCopilotQueriesExecuted: number;
      aiCopilotAccuracyRating: number;
    } = { systemOperationalHealthScore: 99.8, totalSupportTickets: 0, resolvedSupportTickets: 0, openSupportTickets: 0, ticketResolutionSLAHours: 0, aiCopilotQueriesExecuted: 0, aiCopilotAccuracyRating: 0 },
    public readonly moeAndInternationalImpact: {
      moePolicyAlignmentIndex: number;
      herqaEtaAccreditationScore: number;
      internationalAlumniFootprintRate: number;
      regionalSocioeconomicImpactScore: number;
      impactBreakdown: { category: string; score: number }[];
    } = { moePolicyAlignmentIndex: 0, herqaEtaAccreditationScore: 0, internationalAlumniFootprintRate: 0, regionalSocioeconomicImpactScore: 0, impactBreakdown: [] },
    public readonly curriculumTechnologyRadar: { skill: string; marketDemand: number; curriculumCoverage: number }[] = [],
    public readonly digitalFootprintIndex: { linkedinCount: number; githubCount: number; portfolioCount: number; resumeCount: number; readinessScore: number } = { linkedinCount: 0, githubCount: 0, portfolioCount: 0, resumeCount: 0, readinessScore: 0 },
    public readonly employerLoyaltyNPS: { repeatHiringRate: number; corporateNPS: number; repeatEmployersCount: number } = { repeatHiringRate: 0, corporateNPS: 0, repeatEmployersCount: 0 },
    public readonly industrialClusterImpact: { clusterName: string; alumniCount: number; percentage: number }[] = [],
    public readonly talentFlightRisk: { earlySwitchRate: number; avgTenureMonths: number; stabilityScore: number } = { earlySwitchRate: 0, avgTenureMonths: 0, stabilityScore: 0 },
    public readonly mentorshipVelocity: { totalSessionsCompleted: number; avgRating: number; topicBreakdown: { topic: string; count: number }[] } = { totalSessionsCompleted: 0, avgRating: 0, topicBreakdown: [] },
    public readonly forumCommunitySentiment: { totalPosts: number; totalComments: number; positiveSentimentRate: number; topTopics: { topic: string; engagement: number }[] } = { totalPosts: 0, totalComments: 0, positiveSentimentRate: 0, topTopics: [] },
    public readonly globalResearchFootprint: { higherDegreesCount: number; researchPublicationsCount: number; internationalScholarshipsCount: number } = { higherDegreesCount: 0, researchPublicationsCount: 0, internationalScholarshipsCount: 0 },
    public readonly givingROIMultiplier: { totalDonatedETB: number; scholarshipsFunded: number; studentImpactCount: number } = { totalDonatedETB: 0, scholarshipsFunded: 0, studentImpactCount: 0 },
    public readonly documentTurnaroundPeakSLA: { peakMonth: string; avgFulfillmentHours: number; peakVolume: number; monthlyDistribution: { month: string; volume: number }[] } = { peakMonth: 'June', avgFulfillmentHours: 0, peakVolume: 0, monthlyDistribution: [] },
    public readonly additionalFiftyAnalyses: {
      category: string;
      description: string;
      indicators: { id: string; name: string; value: string; subtext: string; badge: string; status: 'optimal' | 'good' | 'warning' }[];
    }[] = []
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
    public readonly statusDistribution: { status: string; count: number }[],
    public readonly skillScores: { cloud: number; devops: number; ai: number; data: number; cyber: number; comms: number } = { cloud: 0, devops: 0, ai: 0, data: 0, cyber: 0, comms: 0 }
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
