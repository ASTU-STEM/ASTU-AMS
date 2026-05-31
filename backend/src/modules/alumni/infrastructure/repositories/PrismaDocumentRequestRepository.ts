import { IDocumentRequestRepository } from '../../application/ports/IDocumentRequestRepository';
import { DocumentRequest } from '../../domain/entities/Alumni';
import prisma from '../../../../core/config/db';

export class PrismaDocumentRequestRepository implements IDocumentRequestRepository {
  async findByAlumniId(alumniId: string): Promise<DocumentRequest[]> {
    const data = await prisma.documentRequest.findMany({
      where: { alumniId },
      orderBy: { createdAt: 'desc' },
    });
    return data as any as DocumentRequest[];
  }

  async create(data: Omit<DocumentRequest, 'id' | 'status' | 'createdAt'>): Promise<DocumentRequest> {
    const created = await prisma.documentRequest.create({ data: data as any });
    return created as any as DocumentRequest;
  }
}
