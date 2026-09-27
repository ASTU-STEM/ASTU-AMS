import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt.utils';
import { TokenRevocationService } from '../services/TokenRevocationService';
import { sendError } from '../utils/response.utils';

export const authenticateJWT = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, 'Authentication token required', null, 401);
    }

    const token = authHeader.split(' ')[1];

    const decoded = verifyAccessToken(token);

    // A signature alone is not enough: logout must actually invalidate the token.
    if (await TokenRevocationService.isRevoked(decoded.jti)) {
      return sendError(res, 'Session has been revoked. Please sign in again.', null, 401);
    }

    (req as any).user = decoded;
    next();
  } catch (error: any) {
    return sendError(res, 'Invalid or expired token', error.message, 401);
  }
};

export const optionalAuthenticateJWT = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = verifyAccessToken(token);
      if (!(await TokenRevocationService.isRevoked(decoded.jti))) {
        (req as any).user = decoded;
      }
    }
  } catch {
    // Ignore invalid tokens for optional auth
  }
  next();
};
