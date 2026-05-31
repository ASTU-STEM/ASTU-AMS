import { IAuditLogger } from '../../application/ports/IAuditLogger';
import prisma from '../../../../core/config/db';

export class PrismaAuditLogger implements IAuditLogger {
  async log(userId: string, action: string, details: string, ipAddress: string): Promise<void> {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        details,
        ipAddress,
      },
    });
  }
}
