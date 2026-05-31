import { SyncLog } from '../../domain/entities/Registrar';

export interface ISyncLogRepository {
  create(data: Omit<SyncLog, 'id' | 'syncedAt'>): Promise<SyncLog>;
  getHistory(): Promise<SyncLog[]>;
}
