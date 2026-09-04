import { IDocumentRequestRepository } from '../ports/IDocumentRequestRepository';
import { DocumentNotFoundError, DuplicateDocumentRequestError } from '../../domain/errors/DocumentErrors';
import { EmailService } from '../../../../core/services/EmailService';
import prisma from '../../../../core/config/db';

export class RequestDocument {
  constructor(
    private readonly repo: IDocumentRequestRepository,
    private readonly emailService: EmailService
  ) {}

  async execute(alumniId: string, data: any) {
    const existing = await this.repo.findByAlumniId(alumniId);
    const hasPending = existing.some(
      (r) => r.documentType === data.documentType && r.status === 'PENDING'
    );
    if (hasPending) throw new DuplicateDocumentRequestError();

    const newRequest = await this.repo.create({
      alumniId,
      documentType: data.documentType,
      status: 'PENDING',
      additionalInstructions: data.additionalInstructions || null,
    });

    try {
      await this.emailService.sendMail({
        to: 'REGISTRAR',
        subject: `New Document Request: ${data.documentType}`,
        text: `A new document request of type ${data.documentType} has been submitted by alumni (ID: ${alumniId}).\nInstructions: ${data.additionalInstructions || 'None'}`,
        html: `
          <h3>New Document Request</h3>
          <p><strong>Document Type:</strong> ${data.documentType}</p>
          <p><strong>Alumni ID:</strong> ${alumniId}</p>
          <p><strong>Instructions:</strong> ${data.additionalInstructions || 'None'}</p>
          <p>Please review this request in the Registrar Portal.</p>
        `
      });
    } catch (err) {
      console.warn('Failed to send notification email to registrar:', err);
    }

    return newRequest;
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
