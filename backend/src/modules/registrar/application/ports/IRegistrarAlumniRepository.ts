export interface IRegistrarAlumniRepository {
  findById(alumniId: string): Promise<any | null>;
  findAll(status?: string): Promise<any[]>;
  updateStatus(alumniId: string, status: string): Promise<any>;
}
