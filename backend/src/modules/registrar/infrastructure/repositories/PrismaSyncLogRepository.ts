import { ISyncLogRepository } from '../../application/ports/ISyncLogRepository';
import { SyncLog } from '../../domain/entities/Registrar';
import prisma from '../../../../core/config/db';
import { SyncStatus } from '@prisma/client';

export class PrismaSyncLogRepository implements ISyncLogRepository {
  async create(data: Omit<SyncLog, 'id' | 'syncedAt'>): Promise<SyncLog> {
    const log = await prisma.registrarSyncLog.create({
      data: {
        recordsCount: data.recordsCount,
        status: data.status as SyncStatus,
        errors: data.errors,
      },
    });
    return log as any as SyncLog;
  }

  async getHistory(): Promise<SyncLog[]> {
    const logs = await prisma.registrarSyncLog.findMany({
      orderBy: { syncedAt: 'desc' },
      take: 50,
    });
    return logs as any as SyncLog[];
  }
}
