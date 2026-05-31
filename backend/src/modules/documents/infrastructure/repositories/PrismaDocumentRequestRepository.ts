import { IDocumentRequestRepository } from '../../application/ports/IDocumentRequestRepository';
import { DocumentRequest } from '../../domain/entities/Document';
import prisma from '../../../../core/config/db';
import { DocumentRequestStatus } from '@prisma/client';

export class PrismaDocumentRequestRepository implements IDocumentRequestRepository {
  async findById(id: string): Promise<DocumentRequest | null> {
    const doc = await prisma.documentRequest.findUnique({ where: { id } });
    if (!doc) return null;
    return doc as any as DocumentRequest;
  }

  async findByAlumniId(alumniId: string): Promise<DocumentRequest[]> {
    const docs = await prisma.documentRequest.findMany({
      where: { alumniId },
      orderBy: { createdAt: 'desc' },
    });
    return docs as any as DocumentRequest[];
  }

  async findAll(): Promise<DocumentRequest[]> {
    const docs = await prisma.documentRequest.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return docs as any as DocumentRequest[];
  }

  async create(data: Omit<DocumentRequest, 'id' | 'createdAt' | 'updatedAt'>): Promise<DocumentRequest> {
    const doc = await prisma.documentRequest.create({
      data: {
        alumniId: data.alumniId,
        documentType: data.documentType,
        status: data.status as DocumentRequestStatus,
        additionalInstructions: data.additionalInstructions,
      },
    });
    return doc as any as DocumentRequest;
  }

  async updateStatus(id: string, status: string): Promise<DocumentRequest> {
    const doc = await prisma.documentRequest.update({
      where: { id },
      data: { status: status as DocumentRequestStatus },
    });
    return doc as any as DocumentRequest;
  }
}
