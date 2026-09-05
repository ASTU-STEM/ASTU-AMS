import { PrismaClient, Role } from '@prisma/client';

import prisma from '../../../../core/config/db';

/**
 * GetDiditStatus
 * 
 * Polls the status of a Didit verification session.
 * On first poll, it simulates "processing". On subsequent polls,
 * it performs the name matching check against AlumniProfile and
 * activates the alumni if the names match.
 */
export class GetDiditStatus {
  async execute(sessionId: string, scannedName?: string) {
    const cacheKey = `didit_${sessionId}`;
    const cacheEntry = await prisma.analyticsCache.findUnique({
      where: { key: cacheKey },
    });

    if (!cacheEntry) {
      return { status: 'expired' as const, message: 'Session not found or expired.' };
    }

    const sessionData = cacheEntry.data as any;

    if (cacheEntry.expiresAt < new Date()) {
      await prisma.analyticsCache.delete({ where: { key: cacheKey } });
      return { status: 'expired' as const, message: 'Session has expired.' };
    }

    // First poll returns processing to simulate Didit scanning if no scannedName is supplied
    if (sessionData.status === 'processing' && !scannedName) {
      // Update to 'verifying' so next poll does the actual check
      await prisma.analyticsCache.update({
        where: { key: cacheKey },
        data: {
          data: { ...sessionData, status: 'verifying' },
        },
      });
      return { status: 'processing' as const, message: 'Verification in progress...' };
    }

    // Do the actual name matching and activation
    const profile = await prisma.alumniProfile.findUnique({
      where: { studentId: sessionData.studentId },
      include: { user: true },
    });

    if (!profile) {
      await prisma.analyticsCache.delete({ where: { key: cacheKey } });
      return { status: 'failed' as const, message: 'Alumni profile not found.' };
    }

    if (profile.status === 'ACTIVE') {
      await prisma.analyticsCache.delete({ where: { key: cacheKey } });
      return { status: 'success' as const, message: 'Account is already active.' };
    }

    // If scannedName is passed (from Didit cloud or camera OCR), compare names
    if (scannedName) {
      const normalizedRecordName = profile.fullName.trim().toLowerCase();
      const normalizedScannedName = scannedName.trim().toLowerCase();

      // Check if parts of the name match (or full string contains)
      const recordTokens = normalizedRecordName.split(/\s+/);
      const scannedTokens = normalizedScannedName.split(/\s+/);
      const tokenMatch = recordTokens.some(t => scannedTokens.includes(t)) || scannedTokens.some(t => recordTokens.includes(t));

      if (!tokenMatch && normalizedRecordName !== normalizedScannedName) {
        return {
          status: 'failed' as const,
          message: `Name on scanned National ID ("${scannedName}") does not match alumni record ("${profile.fullName}").`,
        };
      }
    }

    const passwordHash = profile.pendingPasswordHash;
    if (!passwordHash) {
      await prisma.analyticsCache.delete({ where: { key: cacheKey } });
      return { status: 'failed' as const, message: 'No pending registration found.' };
    }

    // Name match confirmed by Didit → activate the alumni
    const targetEmail = (profile.email || `${profile.studentId.replace(/\//g, '-')}@alumni.astu.edu.et`).toLowerCase();
    let userId = profile.userId || profile.user?.id;
    let user: any = null;

    if (userId) {
      user = await prisma.user.findUnique({ where: { id: userId } });
    }

    if (!user) {
      user = await prisma.user.findUnique({ where: { email: targetEmail } });
    }

    if (user) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          isActive: true,
          password: passwordHash,
        },
      });
      userId = user.id;
    } else {
      user = await prisma.user.create({
        data: {
          email: targetEmail,
          password: passwordHash,
          role: Role.ALUMNI,
          isActive: true,
        },
      });
      userId = user.id;
    }

    const updated = await prisma.alumniProfile.update({
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

    // Clean up the session
    await prisma.analyticsCache.delete({ where: { key: cacheKey } });

    return {
      status: 'success' as const,
      message: 'National ID verified successfully! Your account is now active. You can log in.',
    };
  }
}
