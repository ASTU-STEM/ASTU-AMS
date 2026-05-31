import { IAuditLogRepository } from '../ports/IAuditLogRepository';

export class LogoutUser {
  constructor(private readonly auditLogRepository: IAuditLogRepository) {}

  async execute(userId: string | undefined, ipAddress: string) {
    if (userId) {
      await this.auditLogRepository.create({
        userId,
        action: 'LOGOUT',
        details: 'User logged out',
        ipAddress,
      });
    }
    return true;
  }
}
