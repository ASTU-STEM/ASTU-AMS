import { AuditLog } from '../../domain/entities/AuditLog';

export interface IAuditLogRepository {
  create(log: Omit<AuditLog, 'id' | 'createdAt'>): Promise<AuditLog>;
  findByUserId(userId: string): Promise<AuditLog[]>;
}
