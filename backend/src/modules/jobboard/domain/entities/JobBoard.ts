// ─── Job Board Domain Entities ───────────────────────────────────────────────
// Pure data containers — no imports, no behavior, no framework dependencies.

export class SavedJobEntity {
  constructor(
    public readonly id: string,
    public readonly alumniId: string,
    public readonly jobId: string,
    public readonly createdAt: Date
  ) {}
}

export class JobViewEntity {
  constructor(
    public readonly id: string,
    public readonly jobId: string,
    public readonly viewerIp: string | null,
    public readonly alumniId: string | null,
    public readonly createdAt: Date
  ) {}
}

export class JobRecommendationEntity {
  constructor(
    public readonly id: string,
    public readonly alumniId: string,
    public readonly jobId: string,
    public readonly score: number,
    public readonly reasons: string[],
    public readonly createdAt: Date,
    public readonly expiresAt: Date
  ) {}
}

export class JobSearchResult<T> {
  constructor(
    public readonly data: T[],
    public readonly total: number,
    public readonly page: number,
    public readonly limit: number,
    public readonly totalPages: number
  ) {}
}

export class JobWithEmployer {
  constructor(
    public readonly id: string,
    public readonly title: string,
    public readonly description: string,
    public readonly location: string,
    public readonly employmentType: string,
    public readonly experienceRequired: number,
    public readonly skillsRequired: string[],
    public readonly deadline: Date,
    public readonly salary: string | null,
    public readonly salaryMin: number | null,
    public readonly salaryMax: number | null,
    public readonly isActive: boolean,
    public readonly status: string,
    public readonly department: string | null,
    public readonly experienceLevel: string | null,
    public readonly responsibilities: string | null,
    public readonly requirements: string | null,
    public readonly createdAt: Date,
    // Employer info
    public readonly companyName: string,
    public readonly companyIndustry: string,
    public readonly companyLocation: string,
    public readonly companyLogoUrl: string | null,
    public readonly companyWebsite: string | null,
    public readonly employerId: string
  ) {}
}

export class JobDetailView extends JobWithEmployer {
  constructor(
    id: string,
    title: string,
    description: string,
    location: string,
    employmentType: string,
    experienceRequired: number,
    skillsRequired: string[],
    deadline: Date,
    salary: string | null,
    salaryMin: number | null,
    salaryMax: number | null,
    isActive: boolean,
    status: string,
    department: string | null,
    experienceLevel: string | null,
    responsibilities: string | null,
    requirements: string | null,
    createdAt: Date,
    companyName: string,
    companyIndustry: string,
    companyLocation: string,
    companyLogoUrl: string | null,
    companyWebsite: string | null,
    employerId: string,
    // Additional detail fields
    public readonly applicationCount: number,
    public readonly viewCount: number,
    public readonly companyDescription: string | null,
    public readonly companySize: string | null
  ) {
    super(
      id, title, description, location, employmentType,
      experienceRequired, skillsRequired, deadline, salary,
      salaryMin, salaryMax, isActive, status, department,
      experienceLevel, responsibilities, requirements, createdAt,
      companyName, companyIndustry, companyLocation, companyLogoUrl,
      companyWebsite, employerId
    );
  }
}

export class ApplicationTimelineEntry {
  constructor(
    public readonly status: string,
    public readonly timestamp: Date,
    public readonly note: string | null
  ) {}
}

export class AlumniApplicationView {
  constructor(
    public readonly id: string,
    public readonly jobId: string,
    public readonly jobTitle: string,
    public readonly companyName: string,
    public readonly status: string,
    public readonly resumeUrl: string | null,
    public readonly coverLetter: string | null,
    public readonly appliedAt: Date,
    public readonly updatedAt: Date
  ) {}
}

export class AlumniProfileSummary {
  constructor(
    public readonly id: string,
    public readonly userId: string | null,
    public readonly fullName: string,
    public readonly email: string | null,
    public readonly departmentId: string,
    public readonly departmentCode: string | null,
    public readonly skills: string[],
    public readonly cgpa: number,
    public readonly graduationYear: number,
    public readonly resumeUrl: string | null,
    public readonly status: string,
    public readonly employmentStatus: string
  ) {}
}

// ─── Search Parameters ──────────────────────────────────────────────────────

export interface JobSearchParams {
  keyword?: string;
  department?: string;
  location?: string;
  employmentType?: string;
  experienceLevel?: string;
  industry?: string;
  company?: string;
  salaryMin?: number;
  salaryMax?: number;
  experienceMin?: number;
  experienceMax?: number;
  page: number;
  limit: number;
  sort: 'newest' | 'oldest' | 'deadline' | 'salary_high' | 'salary_low';
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ScoredRecommendation {
  jobId: string;
  score: number;
  reasons: string[];
}
