import bcrypt from 'bcryptjs';
import crypto from 'crypto';

import prisma from '../../../../core/config/db';
import { InvalidTokenError } from '../../domain/errors/AuthErrors';

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

const RESET_CACHE_PREFIX = 'password_reset_';
const RESET_CHANNELS = ['PASSWORD_RESET', 'PASSWORD_RESET_PHONE'];

function tokensMatch(candidate: unknown, provided: string): boolean {
  if (typeof candidate !== 'string' || candidate.length === 0) return false;
  const a = Buffer.from(candidate);
  const b = Buffer.from(provided);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export class ResetPassword {
  async execute(req: ResetPasswordRequest) {
    const token = (req.token || '').trim();
    if (!token) throw new InvalidTokenError();

    const hashedPassword = await bcrypt.hash(req.newPassword, 10);

    // Resolve the token to exactly one account before touching any password.
    // Both stores are keyed/verified against the owner of the token, never
    // against an arbitrary pending profile.
    const resolved = await this.resolveTokenOwner(token);

    if (!resolved) throw new InvalidTokenError();

    await prisma.user.update({
      where: { id: resolved.userId },
      data: { password: hashedPassword },
    });

    if (resolved.profileId) {
      await prisma.alumniProfile.update({
        where: { id: resolved.profileId },
        data: {
          pendingVerificationCode: null,
          verificationCodeExpiresAt: null,
          verificationChannel: null,
        },
      });
    }

    if (resolved.cacheKey) {
      await prisma.analyticsCache.deleteMany({ where: { key: resolved.cacheKey } });
    }

    return {
      success: true,
      message: 'Your password has been reset successfully.',
    };
  }

  private async resolveTokenOwner(
    token: string
  ): Promise<{ userId: string; profileId: string | null; cacheKey: string | null } | null> {
    const cacheEntries = await prisma.analyticsCache.findMany({
      where: {
        key: { startsWith: RESET_CACHE_PREFIX },
        expiresAt: { gte: new Date() },
      },
    });

    for (const entry of cacheEntries) {
      const data = (entry.data || {}) as { resetToken?: string; resetCode?: string };
      if (!tokensMatch(data.resetToken, token) && !tokensMatch(data.resetCode, token)) continue;

      const userId = entry.key.slice(RESET_CACHE_PREFIX.length);
      if (!userId) continue;

      const profile = await prisma.alumniProfile.findFirst({ where: { userId } });
      return { userId, profileId: profile?.id ?? null, cacheKey: entry.key };
    }

    // Phone-based recovery never writes a cache entry, so fall back to matching
    // the OTP against every outstanding profile and only ever mutating the one
    // that actually owns it.
    const pendingProfiles = await prisma.alumniProfile.findMany({
      where: {
        verificationChannel: { in: RESET_CHANNELS },
        verificationCodeExpiresAt: { gte: new Date() },
        pendingVerificationCode: { not: null },
        userId: { not: null },
      },
      include: { user: true },
    });

    for (const profile of pendingProfiles) {
      if (!tokensMatch(profile.pendingVerificationCode, token)) continue;
      if (!profile.userId || !profile.user) continue;

      const entry = cacheEntries.find(
        (e) => e.key === `${RESET_CACHE_PREFIX}${profile.userId}`
      );
      return { userId: profile.userId, profileId: profile.id, cacheKey: entry?.key ?? null };
    }

    return null;
  }
}