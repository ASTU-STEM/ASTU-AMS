import { IAlumniProfileRepository } from '../ports/IAlumniProfileRepository';
import { IDocumentRequestRepository } from '../ports/IDocumentRequestRepository';
import { IAuditLogger } from '../ports/IAuditLogger';
import { AlumniNotFoundError } from '../../domain/errors/AlumniErrors';

export class RequestDocument {
  constructor(
    private readonly alumniRepository: IAlumniProfileRepository,
    private readonly documentRepository: IDocumentRequestRepository,
    private readonly auditLogger: IAuditLogger
  ) {}

  async execute(userId: string, data: any, ipAddress: string) {
    const profile = await this.alumniRepository.findByUserId(userId);
    if (!profile) {
      throw new AlumniNotFoundError();
    }

    const docRequest = await this.documentRepository.create({
      alumniId: profile.id,
      documentType: data.documentType,
      additionalInstructions: data.additionalInstructions || null,
    });

    await this.auditLogger.log(
      userId,
      'DOCUMENT_REQUEST',
      `Alumni requested ${data.documentType}`,
      ipAddress
    );

    return docRequest;
  }
}

export class GetMyDocuments {
  constructor(
    private readonly alumniRepository: IAlumniProfileRepository,
    private readonly documentRepository: IDocumentRequestRepository
  ) {}

  async execute(userId: string) {
    const profile = await this.alumniRepository.findByUserId(userId);
    if (!profile) {
      throw new AlumniNotFoundError();
    }

    const requests = await this.documentRepository.findByAlumniId(profile.id);
    return requests;
  }
}
