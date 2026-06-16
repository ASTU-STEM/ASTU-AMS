export interface DashboardSummary {
  totalGraduates: number;
  totalAlumni: number;
  pendingVerifications: number;
  pendingDocumentRequests: number;
}

export interface IDashboardRepository {
  getSummary(): Promise<DashboardSummary>;
}
