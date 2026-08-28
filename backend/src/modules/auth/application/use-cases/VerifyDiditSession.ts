import { PrismaClient, Role } from '@prisma/client';

import prisma from '../../../../core/config/db';

/**
 * VerifyDiditSession
 *
 * Accepts the name from the National ID (simulated Didit scan) and
 * compares it against the AlumniProfile's fullName.
 * If they match (case-insensitive) → activates the alumni account.
 * If they don't match → returns failed.
 */
export class VerifyDiditSession {
  async execute(sessionId: string, nationalIdName: string) {
    const cacheKey = `didit_${sessionId}`;
    const cacheEntry = await prisma.analyticsCache.findUnique({
      where: { key: cacheKey },
    });

    if (!cacheEntry) {
      return { status: 'expired' as const, message: 'Session not found or expired. Please start again.' };
    }

    const sessionData = cacheEntry.data as any;

    if (cacheEntry.expiresAt < new Date()) {
      await prisma.analyticsCache.delete({ where: { key: cacheKey } });
      return { status: 'expired' as const, message: 'Verification session has expired. Please start a new one.' };
    }

    // Find the alumni profile
    const profile = await prisma.alumniProfile.findUnique({
      where: { studentId: sessionData.studentId },
      include: { user: true },
    });

    if (!profile) {
      await prisma.analyticsCache.delete({ where: { key: cacheKey } });
      return { status: 'failed' as const, message: 'Alumni profile not found in university records.' };
    }

    if (profile.status === 'ACTIVE') {
      await prisma.analyticsCache.delete({ where: { key: cacheKey } });
      return { status: 'success' as const, message: 'This account is already active. You can log in.' };
    }

    const passwordHash = profile.pendingPasswordHash;
    if (!passwordHash) {
      await prisma.analyticsCache.delete({ where: { key: cacheKey } });
      return { status: 'failed' as const, message: 'No pending registration found. Please register first.' };
    }

    // --- NAME COMPARISON ---
    // Normalize both names: trim, collapse spaces, lowercase
    const normalize = (name: string) =>
      name.trim().replace(/\s+/g, ' ').toLowerCase();

    const nameFromId = normalize(nationalIdName);
    const nameFromProfile = normalize(profile.fullName);

    if (nameFromId !== nameFromProfile) {
      // Name mismatch — do NOT activate
      await prisma.analyticsCache.delete({ where: { key: cacheKey } });
      return {
        status: 'failed' as const,
        message: `Name mismatch: the name on your National ID does not match your alumni record. Please try manual verification instead.`,
      };
    }

    // --- NAME MATCH → ACTIVATE ---
    let user = profile.user;
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: (profile.email || `${profile.studentId.replace(/\//g, '-')}@alumni.astu.edu.et`).toLowerCase(),
          password: passwordHash,
          role: Role.ALUMNI,
          isActive: true,
        },
      });
    } else {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          isActive: true,
          password: passwordHash,
        },
      });
    }

    await prisma.alumniProfile.update({
      where: { id: profile.id },
      data: {
        userId: user.id,
        isVerified: true,
        status: 'ACTIVE',
        pendingVerificationCode: null,
        verificationCodeExpiresAt: null,
        pendingPasswordHash: null,
        verificationChannel: 'NATIONAL_ID',
      },
    });

    // Clean up session
    await prisma.analyticsCache.delete({ where: { key: cacheKey } });

    return {
      status: 'success' as const,
      message: 'National ID verified successfully! Your account is now active. You can log in.',
    };
  }
}
