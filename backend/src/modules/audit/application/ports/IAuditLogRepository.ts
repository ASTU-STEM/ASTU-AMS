import { AuditLog } from '../../domain/entities/AuditLog';

export interface IAuditLogRepository {
  findById(id: string): Promise<AuditLog | null>;
  findAll(): Promise<AuditLog[]>;
  findByUserId(userId: string): Promise<AuditLog[]>;
  findByAction(action: string): Promise<AuditLog[]>;
  create(data: Omit<AuditLog, 'id' | 'createdAt'>): Promise<AuditLog>;
  deleteOlderThan(date: Date): Promise<number>;
}
