import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

import prisma from '../../../../core/config/db';
import { diditService } from '../../infrastructure/services/DiditService';

/**
 * StartDiditSession
 * 
 * For alumni who don't have access to their email.
 * Creates a Didit verification session. The frontend redirects to a callback URL,
 * and then polls GetDiditStatus which does the actual name matching.
 */
export class StartDiditSession {
  async execute(studentId: string) {
    if (!studentId) {
      throw new Error('Student ID is required.');
    }

    const profile = await prisma.alumniProfile.findUnique({
      where: { studentId },
    });

    if (!profile) {
      throw new Error('Student ID not found in alumni records.');
    }

    if (profile.status === 'ACTIVE') {
      throw new Error('This alumni profile is already active.');
    }

    if (!profile.pendingPasswordHash) {
      throw new Error('No pending registration found. Please register first before verifying.');
    }

    const callbackUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-national-id/callback`;
    const diditRes = await diditService.createSession(studentId, callbackUrl);
    const sessionId = diditRes.sessionId || crypto.randomBytes(16).toString('hex');
    const verificationUrl = diditRes.url || `${callbackUrl}?sessionId=${sessionId}`;

    // Store the session data in AnalyticsCache
    await prisma.analyticsCache.create({
      data: {
        key: `didit_${sessionId}`,
        data: {
          studentId,
          status: 'processing',
          diditUrl: diditRes.url || null,
          createdAt: new Date().toISOString()
        },
        expiresAt: new Date(Date.now() + 15 * 60 * 1000) // 15 mins
      }
    });

    return {
      verificationUrl,
      sessionId,
      message: 'Didit session initialized.'
    };
  }
}
