import { IRegistrarAlumniRepository } from '../ports/IRegistrarAlumniRepository';
import { AlumniStatusUpdateError } from '../../domain/errors/RegistrarErrors';

export class ManageAlumniStatus {
  constructor(
    private readonly alumniRepo: IRegistrarAlumniRepository,
    private readonly logger: any // IAuditLogger in a real app, assuming simple any for mock
  ) {}

  async execute(alumniId: string, status: string, reason: string, adminId: string, ipAddress: string) {
    const validStatuses = ['ACTIVE', 'INACTIVE', 'SUSPENDED'];
    if (!validStatuses.includes(status)) {
      throw new AlumniStatusUpdateError(`Status must be one of: ${validStatuses.join(', ')}`);
    }

    const alumni = await this.alumniRepo.findById(alumniId);
    if (!alumni) {
      throw new AlumniStatusUpdateError('Alumni record not found');
    }

    const updated = await this.alumniRepo.updateStatus(alumniId, status);

    if (this.logger && typeof this.logger.log === 'function') {
      await this.logger.log(
        adminId,
        'ALUMNI_STATUS_UPDATE',
        `Changed status of ${alumniId} to ${status}. Reason: ${reason}`,
        ipAddress
      );
    }

    return updated;
  }
}
