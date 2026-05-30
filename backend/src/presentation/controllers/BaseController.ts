import { Request, Response, NextFunction } from 'express';
import { sendError, sendSuccess } from '../../shared/utils/response.utils';

export abstract class BaseController {
  protected static sendSuccess<T>(res: Response, message: string, data?: T, statusCode: number = 200) {
    return sendSuccess(res, message, data, statusCode);
  }

  protected static sendError(res: Response, message: string, error?: any, statusCode: number = 400) {
    return sendError(res, message, error, statusCode);
  }

  protected static handleAsync(fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        await fn(req, res, next);
      } catch (err) {
        next(err);
      }
    };
  }
}
