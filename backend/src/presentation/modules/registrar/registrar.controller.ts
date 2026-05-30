import { Request, Response, NextFunction } from 'express';
import { RegistrarService } from './registrar.service';
import { sendSuccess, sendError } from '../../../shared/utils/response.utils';

export class RegistrarController {
  /**
   * Manually triggers registrar database API sync.
   * Route: POST /api/registrar/sync
   * Access: ADMIN or REGISTRAR
   */
  static async triggerSync(req: Request, res: Response, next: NextFunction) {
    try {
      console.log(`👤 Sync triggered by User ID: ${(req as any).user?.userId}`);
      const result = await RegistrarService.syncGraduates();
      return sendSuccess(res, 'Registrar API sync completed successfully.', result);
    } catch (err: any) {
      next(err);
    }
  }

  /**
   * Import graduates from uploaded Excel/CSV file (multipart/form-data field `file`).
   */
  static async importFile(req: Request, res: Response, next: NextFunction) {
    try {
      const file = (req as any).file;
      if (!file) throw new Error('No file uploaded. Use field name `file`.');
      const result = await RegistrarService.importFromFile(file.path);
      return sendSuccess(res, 'File import completed.', result);
    } catch (err: any) {
      next(err);
    }
  }

  /**
   * Export graduates as CSV (query param `format=xlsx` for Excel).
   */
  static async exportGraduates(req: Request, res: Response, next: NextFunction) {
    try {
      const format = (req.query.format as string) || 'csv';
      return await RegistrarService.exportGraduates(res, format);
    } catch (err: any) {
      next(err);
    }
  }

  /**
   * Fetch a registrar student record by Student ID.
   */
  static async getStudentRecord(req: Request, res: Response, next: NextFunction) {
    try {
      const record = await RegistrarService.getStudentRecord(req.params.studentId);
      if (!record) {
        return sendError(res, 'Registrar student record not found', null, 404);
      }
      return sendSuccess(res, 'Fetched registrar student record.', record);
    } catch (err: any) {
      next(err);
    }
  }

  /**
   * Fetches Registrar synchronization logs history.
   * Route: GET /api/registrar/logs
   * Access: ADMIN or REGISTRAR
   */
  static async getLogs(req: Request, res: Response, next: NextFunction) {
    try {
      const logs = await RegistrarService.getSyncLogs();
      return sendSuccess(res, 'Fetched registrar sync history logs.', logs);
    } catch (err: any) {
      next(err);
    }
  }

  /**
   * Get all alumni accounts (registrar portal view).
   * Route: GET /api/registrar/alumni
   */
  static async getAllAlumni(req: Request, res: Response, next: NextFunction) {
    try {
      const status = (req.query.status as string) || undefined;
      const alumni = await RegistrarService.getAllAlumni(status);
      return sendSuccess(res, 'Fetched all alumni accounts.', alumni);
    } catch (err: any) {
      next(err);
    }
  }

  /**
   * Get single alumni details.
   * Route: GET /api/registrar/alumni/:alumniId
   */
  static async getAlumniDetails(req: Request, res: Response, next: NextFunction) {
    try {
      const alumni = await RegistrarService.getAlumniById(req.params.alumniId);
      if (!alumni) {
        return sendError(res, 'Alumni record not found', null, 404);
      }
      return sendSuccess(res, 'Fetched alumni details.', alumni);
    } catch (err: any) {
      next(err);
    }
  }

  /**
   * Update alumni account status (ACTIVE, INACTIVE, SUSPENDED).
   * Route: PUT /api/registrar/alumni/:alumniId/status
   */
  static async updateAlumniStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { status, reason } = req.body;
      const validStatuses = ['ACTIVE', 'INACTIVE', 'SUSPENDED'];
      
      if (!status || !validStatuses.includes(status)) {
        return sendError(res, `Status must be one of: ${validStatuses.join(', ')}`, null, 400);
      }

      const result = await RegistrarService.updateAlumniStatus(
        req.params.alumniId,
        status,
        reason || '',
        (req as any).user?.userId
      );

      return sendSuccess(res, `Alumni status updated to ${status}.`, result);
    } catch (err: any) {
      next(err);
    }
  }

  /**
   * Approve/activate an alumni account.
   * Route: POST /api/registrar/alumni/:alumniId/approve
   */
  static async approveAlumni(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await RegistrarService.updateAlumniStatus(
        req.params.alumniId,
        'ACTIVE',
        'Approved by registrar',
        (req as any).user?.userId
      );
      return sendSuccess(res, 'Alumni account approved and activated.', result);
    } catch (err: any) {
      next(err);
    }
  }

  /**
   * Suspend an alumni account.
   * Route: POST /api/registrar/alumni/:alumniId/suspend
   */
  static async suspendAlumni(req: Request, res: Response, next: NextFunction) {
    try {
      const { reason } = req.body;
      const result = await RegistrarService.updateAlumniStatus(
        req.params.alumniId,
        'SUSPENDED',
        reason || 'Suspended by registrar',
        (req as any).user?.userId
      );
      return sendSuccess(res, 'Alumni account suspended.', result);
    } catch (err: any) {
      next(err);
    }
  }

  /**
   * Inactivate an alumni account.
   * Route: POST /api/registrar/alumni/:alumniId/inactivate
   */
  static async inactivateAlumni(req: Request, res: Response, next: NextFunction) {
    try {
      const { reason } = req.body;
      const result = await RegistrarService.updateAlumniStatus(
        req.params.alumniId,
        'INACTIVE',
        reason || 'Inactivated by registrar',
        (req as any).user?.userId
      );
      return sendSuccess(res, 'Alumni account inactivated.', result);
    } catch (err: any) {
      next(err);
    }
  }

  /**
   * Get registrar dashboard overview.
   * Route: GET /api/registrar/dashboard
   */
  static async getDashboard(req: Request, res: Response, next: NextFunction) {
    try {
      const dashboard = await RegistrarService.getDashboardStats();
      return sendSuccess(res, 'Fetched dashboard statistics.', dashboard);
    } catch (err: any) {
      next(err);
    }
  }

  /**
   * Verify if a student ID exists in registrar records.
   * Route: GET /api/registrar/verify/:studentId
   * Public endpoint for alumni during registration
   */
  static async verifyStudentId(req: Request, res: Response, next: NextFunction) {
    try {
      const record = await RegistrarService.getStudentRecord(req.params.studentId);
      if (!record) {
        return sendSuccess(res, 'Student not found in registrar records.', { valid: false });
      }
      return sendSuccess(res, 'Student found in registrar records.', { 
        valid: true, 
        student: { 
          studentId: record.studentId, 
          fullName: record.fullName, 
          department: record.department,
          graduationYear: record.graduationYear 
        } 
      });
    } catch (err: any) {
      next(err);
    }
  }
}
