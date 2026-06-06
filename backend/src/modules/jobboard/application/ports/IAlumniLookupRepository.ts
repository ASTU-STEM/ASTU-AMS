import { AlumniProfileSummary, AlumniApplicationView } from '../../domain/entities/JobBoard';

export interface IAlumniLookupRepository {
  findByUserId(userId: string): Promise<AlumniProfileSummary | null>;
  findById(alumniId: string): Promise<AlumniProfileSummary | null>;
  findApplicationsByAlumniId(alumniId: string): Promise<AlumniApplicationView[]>;
  findApplicationByAlumniAndJob(alumniId: string, jobId: string): Promise<any | null>;
  createApplication(data: {
    jobId: string;
    alumniId: string;
    status: string;
    resumeUrl: string | null;
    coverLetter: string | null;
  }): Promise<any>;
  updateApplicationStatus(applicationId: string, status: string): Promise<any>;
}
