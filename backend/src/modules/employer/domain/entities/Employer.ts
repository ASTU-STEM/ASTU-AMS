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
    public readonly isVerified: boolean,
    public readonly description?: string | null,
    public readonly companySize?: string | null,
    public readonly contactPerson?: string | null,
    public readonly contactEmail?: string | null,
    public readonly phone?: string | null,
    public readonly tin?: string | null,
    public readonly isPremium?: boolean,
    public readonly partnerships?: string[],
    public readonly verificationStatus?: string,
    public readonly ndaSigned?: boolean
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
    public readonly isActive: boolean,
    public readonly responsibilities?: string | null,
    public readonly requirements?: string | null,
    public readonly experienceLevel?: string | null,
    public readonly department?: string | null,
    public readonly status?: string
  ) {}
}

export class JobApplication {
  constructor(
    public readonly id: string,
    public readonly jobId: string,
    public readonly alumniId: string,
    public readonly status: string,
    public readonly resumeUrl: string | null,
    public readonly coverLetter: string | null,
    public readonly hiredAt?: Date | null
  ) {}
}

export class Interview {
  constructor(
    public readonly id: string,
    public readonly applicationId: string,
    public readonly interviewer: string,
    public readonly interviewDate: Date,
    public readonly interviewType: string,
    public readonly meetingLink: string | null,
    public readonly location: string | null,
    public readonly notes: string | null,
    public readonly status: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}
}

export class EmployerFeedback {
  constructor(
    public readonly id: string,
    public readonly employerId: string,
    public readonly alumniId: string,
    public readonly technicalSkill: number,
    public readonly communicationSkill: number,
    public readonly leadershipSkill: number,
    public readonly teamworkSkill: number,
    public readonly problemSolvingSkill: number,
    public readonly innovationSkill: number,
    public readonly feedbackText: string | null,
    public readonly overallSatisfaction: number,
    public readonly missingSkills: string[],
    public readonly technologiesNeeded: string[],
    public readonly wouldHireAgain: boolean,
    public readonly createdAt: Date
  ) {}
}

export class HiringEvent {
  constructor(
    public readonly id: string,
    public readonly applicationId: string,
    public readonly employerId: string,
    public readonly alumniId: string,
    public readonly departmentId: string,
    public readonly hiredAt: Date,
    public readonly salary: number | null,
    public readonly timeToHireDays: number,
    public readonly createdAt: Date
  ) {}
}
