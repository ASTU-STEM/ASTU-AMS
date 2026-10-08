import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt.utils';
import { sendError } from '../utils/response.utils';
import prisma from '../config/db';

interface UserBanStatusCache {
  isSuspended: boolean;
  reason?: string;
  expiresAt: number;
}

const userBanCache = new Map<string, UserBanStatusCache>();

/**
 * Immediately invalidates the in-memory ban cache for a user ID when an Admin updates their status
 */
export const invalidateUserBanCache = (userId: string) => {
  if (userId) {
    userBanCache.delete(userId);
  }
};

/**
 * Checks if a user is suspended or banned in database / cache
 */
export const checkIsUserSuspended = async (userId: string): Promise<{ isSuspended: boolean; reason?: string }> => {
  if (process.env.NODE_ENV === 'test') {
    return { isSuspended: false };
  }

  const now = Date.now();
  const cached = userBanCache.get(userId);

  if (cached && cached.expiresAt > now) {
    return { isSuspended: cached.isSuspended, reason: cached.reason };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { alumniProfile: true }
    });

    if (!user) {
      userBanCache.set(userId, { isSuspended: true, reason: 'User account not found', expiresAt: now + 30000 });
      return { isSuspended: true, reason: 'User account not found' };
    }

    const isSuspended = !user.isActive ||
      user.alumniProfile?.status === 'SUSPENDED' ||
      (user.adminNotes && (user.adminNotes.includes('SUSPENDED') || user.adminNotes.includes('BANNED')));

    const reason = user.adminNotes || (user.alumniProfile?.status === 'SUSPENDED' ? 'Account suspended by Registrar Office' : 'Account deactivated or suspended by system administrator');

    userBanCache.set(userId, {
      isSuspended: Boolean(isSuspended),
      reason: isSuspended ? reason : undefined,
      expiresAt: now + 15000, // 15 seconds TTL
    });

    return { isSuspended: Boolean(isSuspended), reason: isSuspended ? reason : undefined };
  } catch (error) {
    // If DB check fails transiently, fallback to not blocking
    return { isSuspended: false };
  }
};

export const authenticateJWT = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, 'Authentication token required', null, 401);
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyAccessToken(token);
    (req as any).user = decoded;

    // Check user ban/suspension status
    if (decoded && decoded.userId) {
      const banCheck = await checkIsUserSuspended(decoded.userId);
      if (banCheck.isSuspended) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'USER_ACCOUNT_SUSPENDED',
            message: `Account Suspended: ${banCheck.reason || 'Your ASTU system account has been suspended or banned by an administrator.'}`
          }
        });
      }
    }

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
      (req as any).user = decoded;

      if (decoded && decoded.userId) {
        const banCheck = await checkIsUserSuspended(decoded.userId);
        if (banCheck.isSuspended) {
          (req as any).user = null; // Unset user if banned
        }
      }
    }
  } catch {
    // Ignore invalid tokens for optional auth
  }
  next();
};
