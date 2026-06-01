import { Request, Response, NextFunction } from 'express';
import { sendSuccess } from '../../../core/utils/response.utils';
import { createAuditLogSchema, purgeAuditLogsSchema } from './audit.validation';
import { PrismaAuditLogRepository } from '../infrastructure/repositories/PrismaAuditLogRepository';
import {
  CreateAuditLog,
  GetAllAuditLogs,
  GetAuditLogsByUser,
  GetAuditLogsByAction,
  GetAuditLogById,
  PurgeOldAuditLogs,
} from '../application/use-cases/ManageAuditLogs';

const auditRepo = new PrismaAuditLogRepository();

export class AuditController {
  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const useCase = new GetAllAuditLogs(auditRepo);
      const result = await useCase.execute();
      return sendSuccess(res, 'Audit logs retrieved successfully.', result);
    } catch (err) {
      next(err);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const useCase = new GetAuditLogById(auditRepo);
      const result = await useCase.execute(req.params.id);
      return sendSuccess(res, 'Audit log entry retrieved.', result);
    } catch (err) {
      next(err);
    }
  }

  static async getByUser(req: Request, res: Response, next: NextFunction) {
    try {
      const useCase = new GetAuditLogsByUser(auditRepo);
      const result = await useCase.execute(req.params.userId);
      return sendSuccess(res, 'Audit logs for user retrieved.', result);
    } catch (err) {
      next(err);
    }
  }

  static async getByAction(req: Request, res: Response, next: NextFunction) {
    try {
      const useCase = new GetAuditLogsByAction(auditRepo);
      const result = await useCase.execute(req.params.action);
      return sendSuccess(res, 'Audit logs filtered by action.', result);
    } catch (err) {
      next(err);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = createAuditLogSchema.parse(req.body);
      const useCase = new CreateAuditLog(auditRepo);
      const result = await useCase.execute(
        data.userId ?? null,
        data.action,
        data.details,
        data.ipAddress ?? req.ip ?? null
      );
      return sendSuccess(res, 'Audit log created.', result, 201);
    } catch (err) {
      next(err);
    }
  }

  static async purge(req: Request, res: Response, next: NextFunction) {
    try {
      const data = purgeAuditLogsSchema.parse(req.body);
      const useCase = new PurgeOldAuditLogs(auditRepo);
      const deletedCount = await useCase.execute(data.daysOld);
      return sendSuccess(res, `Purged ${deletedCount} old audit log(s).`, { deletedCount });
    } catch (err) {
      next(err);
    }
  }
}
