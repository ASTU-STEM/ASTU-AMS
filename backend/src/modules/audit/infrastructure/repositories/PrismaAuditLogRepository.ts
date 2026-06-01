import { IAuditLogRepository } from '../../application/ports/IAuditLogRepository';
import { AuditLog } from '../../domain/entities/AuditLog';
import prisma from '../../../../core/config/db';

export class PrismaAuditLogRepository implements IAuditLogRepository {
  async findById(id: string): Promise<AuditLog | null> {
    const log = await prisma.auditLog.findUnique({ where: { id } });
    if (!log) return null;
    return log as any as AuditLog;
  }

  async findAll(): Promise<AuditLog[]> {
    const logs = await prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { email: true, role: true } } },
    });
    return logs as any as AuditLog[];
  }

  async findByUserId(userId: string): Promise<AuditLog[]> {
    const logs = await prisma.auditLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { email: true, role: true } } },
    });
    return logs as any as AuditLog[];
  }

  async findByAction(action: string): Promise<AuditLog[]> {
    const logs = await prisma.auditLog.findMany({
      where: { action },
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { email: true, role: true } } },
    });
    return logs as any as AuditLog[];
  }

  async create(data: Omit<AuditLog, 'id' | 'createdAt'>): Promise<AuditLog> {
    const log = await prisma.auditLog.create({ data: data as any });
    return log as any as AuditLog;
  }

  async deleteOlderThan(date: Date): Promise<number> {
    const result = await prisma.auditLog.deleteMany({
      where: { createdAt: { lt: date } },
    });
    return result.count;
  }
}
