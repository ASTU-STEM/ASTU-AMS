import { IAuditLogRepository } from '../../application/ports/IAuditLogRepository';
import { AuditLog } from '../../domain/entities/AuditLog';
import prisma from '../../../../core/config/db';

export class PrismaAuditLogRepository implements IAuditLogRepository {
  async create(log: Omit<AuditLog, 'id' | 'createdAt'>): Promise<AuditLog> {
    const data = await prisma.auditLog.create({
      data: {
        userId: log.userId as string,
        action: log.action,
        details: log.details,
        ipAddress: log.ipAddress,
      },
    });
    return new AuditLog(data.id, data.userId, data.action, data.details, data.ipAddress, data.createdAt);
  }

  async findByUserId(userId: string): Promise<AuditLog[]> {
    const logs = await prisma.auditLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return logs.map(
      (log: any) => new AuditLog(log.id, log.userId, log.action, log.details, log.ipAddress, log.createdAt)
    );
  }
}
