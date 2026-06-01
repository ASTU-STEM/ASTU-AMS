import { IAuditLogRepository } from '../ports/IAuditLogRepository';
import { AuditLogNotFoundError } from '../../domain/errors/AuditErrors';

export class CreateAuditLog {
  constructor(private readonly repo: IAuditLogRepository) {}

  async execute(userId: string | null, action: string, details: string, ipAddress: string | null) {
    return await this.repo.create({ userId, action, details, ipAddress });
  }
}

export class GetAllAuditLogs {
  constructor(private readonly repo: IAuditLogRepository) {}

  async execute() {
    return await this.repo.findAll();
  }
}

export class GetAuditLogsByUser {
  constructor(private readonly repo: IAuditLogRepository) {}

  async execute(userId: string) {
    return await this.repo.findByUserId(userId);
  }
}

export class GetAuditLogsByAction {
  constructor(private readonly repo: IAuditLogRepository) {}

  async execute(action: string) {
    return await this.repo.findByAction(action);
  }
}

export class GetAuditLogById {
  constructor(private readonly repo: IAuditLogRepository) {}

  async execute(id: string) {
    const log = await this.repo.findById(id);
    if (!log) throw new AuditLogNotFoundError();
    return log;
  }
}

export class PurgeOldAuditLogs {
  constructor(private readonly repo: IAuditLogRepository) {}

  async execute(daysOld: number) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);
    return await this.repo.deleteOlderThan(cutoffDate);
  }
}
