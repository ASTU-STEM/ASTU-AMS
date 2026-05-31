import { DocumentRequest } from '../../domain/entities/Document';

export interface IDocumentRequestRepository {
  findById(id: string): Promise<DocumentRequest | null>;
  findByAlumniId(alumniId: string): Promise<DocumentRequest[]>;
  findAll(): Promise<DocumentRequest[]>;
  create(data: Omit<DocumentRequest, 'id' | 'createdAt' | 'updatedAt'>): Promise<DocumentRequest>;
  updateStatus(id: string, status: string): Promise<DocumentRequest>;
}
