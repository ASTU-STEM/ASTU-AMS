import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

import prisma from '../../../../core/config/db';

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export class ResetPassword {
  async execute(req: ResetPasswordRequest) {
    // First, try to find the reset data in AlumniProfile (for alumni users)
    const alumniProfile = await prisma.alumniProfile.findFirst({
      where: {
        verificationChannel: { in: ['PASSWORD_RESET', 'PASSWORD_RESET_PHONE'] },
        verificationCodeExpiresAt: { gte: new Date() },
        pendingVerificationCode: { not: null },
      },
      include: { user: true },
    });

    if (alumniProfile && alumniProfile.user) {
      // Verify token matches (the token here is the OTP code sent)
      if (alumniProfile.pendingVerificationCode !== req.token) {
        // Try looking up from AnalyticsCache for token-based reset
        const cacheEntry = await prisma.analyticsCache.findFirst({
          where: {
            key: { startsWith: 'password_reset_' },
            expiresAt: { gte: new Date() },
          },
        });

        if (cacheEntry) {
          const cacheData = cacheEntry.data as any;
          if (cacheData.resetToken === req.token || cacheData.resetCode === req.token) {
            const userId = cacheEntry.key.replace('password_reset_', '');
            const hashedPassword = await bcrypt.hash(req.newPassword, 10);

            await prisma.user.update({
              where: { id: userId },
              data: { password: hashedPassword },
            });

            // Clean up the cache entry
            await prisma.analyticsCache.delete({ where: { key: cacheEntry.key } });
            
            // Clean up the alumni profile if applicable
            await prisma.alumniProfile.update({
              where: { id: alumniProfile.id },
              data: {
                pendingVerificationCode: null,
                verificationCodeExpiresAt: null,
                verificationChannel: null,
              },
            });

            return {
              success: true,
              message: 'Your password has been reset successfully.',
            };
          }
        }

        throw new Error('Invalid or expired reset token.');
      }

      // Valid alumni reset
      const hashedPassword = await bcrypt.hash(req.newPassword, 10);

      await prisma.user.update({
        where: { id: alumniProfile.user.id },
        data: { password: hashedPassword },
      });

      // Clear the reset state
      await prisma.alumniProfile.update({
        where: { id: alumniProfile.id },
        data: {
          pendingVerificationCode: null,
          verificationCodeExpiresAt: null,
          verificationChannel: null,
        },
      });

      return {
        success: true,
        message: 'Your password has been reset successfully.',
      };
    }

    // Try AnalyticsCache for non-alumni users
    const cacheEntries = await prisma.analyticsCache.findMany({
      where: {
        key: { startsWith: 'password_reset_' },
        expiresAt: { gte: new Date() },
      },
    });

    for (const entry of cacheEntries) {
      const cacheData = entry.data as any;
      if (cacheData.resetToken === req.token || cacheData.resetCode === req.token) {
        const userId = entry.key.replace('password_reset_', '');
        const hashedPassword = await bcrypt.hash(req.newPassword, 10);

        await prisma.user.update({
          where: { id: userId },
          data: { password: hashedPassword },
        });

        await prisma.analyticsCache.delete({ where: { key: entry.key } });

        return {
          success: true,
          message: 'Your password has been reset successfully.',
        };
      }
    }

    throw new Error('Invalid or expired reset token. Please request a new password reset.');
  }
}
