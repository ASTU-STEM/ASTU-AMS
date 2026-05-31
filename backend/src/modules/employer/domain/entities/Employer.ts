export class EmployerProfile {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly companyName: string,
    public readonly industry: string,
    public readonly location: string,
    public readonly hrContact: string,
    public readonly website: string | null,
    public readonly logoUrl: string | null,
    public readonly isVerified: boolean
  ) {}
}

export class Job {
  constructor(
    public readonly id: string,
    public readonly employerId: string,
    public readonly title: string,
    public readonly description: string,
    public readonly location: string,
    public readonly employmentType: string,
    public readonly experienceRequired: number,
    public readonly skillsRequired: string[],
    public readonly deadline: Date,
    public readonly salary: string | null,
    public readonly isActive: boolean
  ) {}
}

export class JobApplication {
  constructor(
    public readonly id: string,
    public readonly jobId: string,
    public readonly alumniId: string,
    public readonly status: string,
    public readonly resumeUrl: string | null,
    public readonly coverLetter: string | null
  ) {}
}
