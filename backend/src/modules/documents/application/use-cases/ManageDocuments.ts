import { IDocumentRequestRepository } from '../ports/IDocumentRequestRepository';
import { DocumentNotFoundError, DuplicateDocumentRequestError } from '../../domain/errors/DocumentErrors';

export class RequestDocument {
  constructor(private readonly repo: IDocumentRequestRepository) {}

  async execute(alumniId: string, data: any) {
    const existing = await this.repo.findByAlumniId(alumniId);
    const hasPending = existing.some(
      (r) => r.documentType === data.documentType && r.status === 'PENDING'
    );
    if (hasPending) throw new DuplicateDocumentRequestError();

    return await this.repo.create({
      alumniId,
      documentType: data.documentType,
      status: 'PENDING',
      additionalInstructions: data.additionalInstructions || null,
    });
  }
}

export class UpdateDocumentStatus {
  constructor(private readonly repo: IDocumentRequestRepository) {}

  async execute(requestId: string, status: string) {
    const request = await this.repo.findById(requestId);
    if (!request) throw new DocumentNotFoundError();

    return await this.repo.updateStatus(requestId, status);
  }
}

export class GetAlumniDocuments {
  constructor(private readonly repo: IDocumentRequestRepository) {}

  async execute(alumniId: string) {
    return await this.repo.findByAlumniId(alumniId);
  }
}

export class GetAllDocumentRequests {
  constructor(private readonly repo: IDocumentRequestRepository) {}

  async execute() {
    return await this.repo.findAll();
  }
}
