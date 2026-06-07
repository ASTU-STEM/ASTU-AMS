export interface IJobViewRepository {
  record(jobId: string, alumniId?: string | null, viewerIp?: string | null): Promise<void>;
  getViewCount(jobId: string): Promise<number>;
  hasViewedRecently(jobId: string, alumniId: string, withinHours: number): Promise<boolean>;
}
