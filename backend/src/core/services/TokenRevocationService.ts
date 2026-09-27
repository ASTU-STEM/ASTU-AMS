import prisma from '../config/db';
import { env } from '../config/env';
import { Logger } from '../utils/logger.utils';

/**
 * Server-side denylist for stateless JWTs.
 *
 * A signed JWT stays valid until it expires, so clearing it from the client on
 * logout is not enough. Every token now carries a `jti`; logout writes that `jti`
 * here and `authenticateJWT` rejects anything it finds.
 */
export class TokenRevocationService {
  /** Revoke a verified token payload. Safe to call twice for the same token. */
  static async revoke(payload: { jti?: string; userId?: string; exp?: number }): Promise<boolean> {
    if (!payload?.jti) {
      // Tokens issued before jti was introduced cannot be revoked individually.
      Logger.warn('Token has no jti; cannot revoke server-side.');
      return false;
    }
    const expiresAt = payload.exp ? new Date(payload.exp * 1000) : new Date(Date.now() + 60 * 60 * 1000);
    try {
      await prisma.revokedToken.upsert({
        where: { jti: payload.jti },
        create: { jti: payload.jti, userId: payload.userId ?? null, expiresAt },
        update: {},
      });
      return true;
    } catch (err: any) {
      Logger.error(`Failed to revoke token: ${err?.message}`);
      return false;
    }
  }

  static async isRevoked(jti?: string): Promise<boolean> {
    if (!jti) return false;
    try {
      const hit = await prisma.revokedToken.findUnique({ where: { jti } });
      return !!hit;
    } catch (err: any) {
      // Fail CLOSED. If the denylist is unreachable we cannot prove the token was
      // not revoked, and treating it as valid would silently re-open every
      // session that logout already invalidated. The only escape hatch is an
      // explicit opt-in for local development.
      if (env.REVOCATION_FAIL_OPEN) {
        Logger.warn('Denylist unavailable; REVOCATION_FAIL_OPEN is set so the token is being accepted.');
        return false;
      }
      Logger.error(`Denylist lookup failed, rejecting token as revoked: ${err?.message}`);
      return true;
    }
  }

  /** Drop entries for tokens that have expired anyway, keeping the table small. */
  static async prune(): Promise<number> {
    try {
      const res = await prisma.revokedToken.deleteMany({
        where: { expiresAt: { lt: new Date() } },
      });
      return res?.count ?? 0;
    } catch {
      return 0;
    }
  }
}
