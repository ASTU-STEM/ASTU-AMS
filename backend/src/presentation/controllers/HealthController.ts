import { Request, Response } from 'express';
import { sendSuccess } from '../../shared/utils/response.utils';

export class HealthController {
  static getHealth(req: Request, res: Response) {
    return sendSuccess(res, 'API is healthy', { timestamp: new Date().toISOString() });
  }
}
