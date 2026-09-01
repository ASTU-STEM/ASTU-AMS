export class AlumniProfile {
  constructor(
    public readonly id: string,
    public readonly userId: string | null,
    public readonly studentId: string,
    public readonly fullName: string,
    public readonly email: string | null,
    public readonly status: string,
    public readonly isVerified: boolean,
    public fullNameAmharic?: string | null,
    public gender?: string | null,
    public dateOfBirth?: Date | null,
    public phone?: string | null,
    public address?: string | null,
    public admissionYear?: number | null,
    public graduationYear?: number | null,
    public cgpa?: number | null,
    public skills?: string[] | null,
    public linkedIn?: string | null,
    public gitHub?: string | null,
    public portfolio?: string | null,
    public telegram?: string | null,
    public resumeUrl?: string | null,
    public profilePicture?: string | null
  ) {}
}

export class WorkExperience {
  constructor(
    public readonly id: string,
    public readonly alumniId: string,
    public readonly companyName: string,
    public readonly position: string,
    public readonly industry: string,
    public readonly salaryRange: string | null,
    public readonly location: string,
    public readonly isCurrent: boolean,
    public readonly startDate: Date,
    public readonly endDate?: Date | null
  ) {}
}

export class DocumentRequest {
  constructor(
    public readonly id: string,
    public readonly alumniId: string,
    public readonly documentType: string,
    public readonly additionalInstructions: string | null,
    public readonly status: string,
    public readonly createdAt: Date,
    public readonly fileUrls?: string[] | null
  ) {}
}
