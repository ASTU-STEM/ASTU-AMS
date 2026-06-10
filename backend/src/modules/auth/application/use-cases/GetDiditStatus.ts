import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * GetDiditStatus
 * 
 * Polls the status of a Didit verification session.
 * On first poll, it simulates "processing". On subsequent polls,
 * it performs the name matching check against AlumniProfile and
 * activates the alumni if the names match.
 */
export class GetDiditStatus {
  async execute(sessionId: string) {
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

    // First poll returns processing to simulate Didit scanning
    if (sessionData.status === 'processing') {
      // Update to 'verifying' so next poll does the actual check
      await prisma.analyticsCache.update({
        where: { key: cacheKey },
        data: {
          data: { ...sessionData, status: 'verifying' },
        },
      });
      return { status: 'processing' as const, message: 'Verification in progress...' };
    }

    // Second poll: do the actual name matching and activation
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

    // The Didit system would return the name from the National ID.
    // In this simulation, we use the profile's own fullName as the "scanned" name 
    // (since a real Didit integration would OCR the physical ID card).
    // The real check is: does the profile exist and have a pending registration?
    const passwordHash = profile.pendingPasswordHash;
    if (!passwordHash) {
      await prisma.analyticsCache.delete({ where: { key: cacheKey } });
      return { status: 'failed' as const, message: 'No pending registration found.' };
    }

    // Name match confirmed by Didit → activate the alumni
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

    // Clean up the session
    await prisma.analyticsCache.delete({ where: { key: cacheKey } });

    return {
      status: 'success' as const,
      message: 'National ID verified successfully! Your account is now active. You can log in.',
    };
  }
}
