import { DocumentRequest } from '../../domain/entities/Alumni';

export interface IDocumentRequestRepository {
  findByAlumniId(alumniId: string): Promise<DocumentRequest[]>;
  create(data: Omit<DocumentRequest, 'id' | 'status' | 'createdAt'>): Promise<DocumentRequest>;
}
