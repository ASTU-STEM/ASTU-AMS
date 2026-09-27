export class Department {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly code: string
  ) {}
}

export class DepartmentHeadProfile {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly departmentId: string
  ) {}
}

// Representing stats
export class DepartmentStats {
  constructor(
    public readonly totalAlumni: number,
    public readonly employedAlumni: number,
    public readonly employmentRate: number, // percentage 0-100
    public readonly selfEmployedAlumni: number = 0,
    public readonly unemployedAlumni: number = 0,
    public readonly averageSalary: number | null = null
  ) {}
}
