export class EmploymentStats {
  constructor(
    public readonly totalAlumni: number,
    public readonly employed: number,
    public readonly unemployed: number,
    public readonly employmentRate: number // percentage
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
    public readonly employmentRate: number
  ) {}
}

export class AnalyticsReport {
  constructor(
    public readonly overallEmployment: EmploymentStats,
    public readonly skills: SkillGapStats,
    public readonly departments: DepartmentMetric[]
  ) {}
}
