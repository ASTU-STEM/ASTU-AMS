import { IAlumniProfileRepository } from '../ports/IAlumniProfileRepository';
import { IDocumentRequestRepository } from '../ports/IDocumentRequestRepository';
import { IAuditLogger } from '../ports/IAuditLogger';
import { AlumniNotFoundError } from '../../domain/errors/AlumniErrors';

import { EmailService } from '../../../../core/services/EmailService';
import prisma from '../../../../core/config/db';

export class RequestDocument {
  constructor(
    private readonly alumniRepository: IAlumniProfileRepository,
    private readonly documentRepository: IDocumentRequestRepository,
    private readonly auditLogger: IAuditLogger,
    private readonly emailService: EmailService = new EmailService()
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

    // Notify Registrar(s)
    try {
      const registrars = await prisma.user.findMany({ where: { role: 'REGISTRAR' } });
      const emails = registrars.map((r: any) => r.email);
      for (const email of emails) {
        await this.emailService.sendGenericNotification(
          email,
          'New Document Request',
          `A new document request for ${data.documentType} has been submitted by ${profile.fullName || profile.id}. Please check the Registrar Portal for details.`
        );
      }
    } catch (e) {
      console.warn('Failed to notify registrar', e);
    }

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
