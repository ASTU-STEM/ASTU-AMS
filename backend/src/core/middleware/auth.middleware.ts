import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt.utils';
import { sendError } from '../utils/response.utils';

export const authenticateJWT = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, 'Authentication token required', null, 401);
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyAccessToken(token);
    (req as any).user = decoded;
    next();
  } catch (error: any) {
    return sendError(res, 'Invalid or expired token', error.message, 401);
  }
};
