import { Request, Response, NextFunction } from 'express';
import { RegistrarService } from './registrar.service';
import { sendSuccess, sendError } from '../../utils/response.utils';

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
}
