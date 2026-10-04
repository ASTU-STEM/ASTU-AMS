import { EmailService } from '../../../../core/services/EmailService';
import { AuthError } from '../../domain/errors/AuthErrors';

import prisma from '../../../../core/config/db';

export interface ResendAlumniOtpRequest {
  studentId: string;
}

const CODE_TTL_MS = 15 * 60 * 1000;
const RESEND_COOLDOWN_MS = 30 * 1000;

export class ResendAlumniOtp {
  constructor(private emailService: EmailService) {}

  async execute(req: ResendAlumniOtpRequest) {
    const profile = await prisma.alumniProfile.findUnique({
      where: { studentId: req.studentId },
    });

    if (!profile) {
      throw new AuthError('No pending registration found for this student.', 404);
    }

    if (profile.status === 'ACTIVE' && profile.userId) {
      throw new AuthError('This alumni account is already active. Please log in.', 409);
    }

    if (!profile.email) {
      throw new AuthError('No email on record for this student.', 400);
    }

    if (
      profile.verificationChannel !== 'EMAIL' ||
      !profile.pendingVerificationCode ||
      !profile.verificationCodeExpiresAt ||
      profile.verificationCodeExpiresAt < new Date()
    ) {
      throw new AuthError('No pending verification request found for this student.', 400);
    }

    const issuedAt = profile.verificationCodeExpiresAt.getTime() - CODE_TTL_MS;
    if (Date.now() - issuedAt < RESEND_COOLDOWN_MS) {
      throw new AuthError('Please wait before requesting another code.', 429);
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + CODE_TTL_MS);

    await prisma.alumniProfile.update({
      where: { id: profile.id },
      data: {
        pendingVerificationCode: code,
        verificationCodeExpiresAt: expiresAt,
        pendingVerificationAttempts: 0,
      },
    });

    // Always delivered to the address held on the alumni record, never to an
    // address supplied by the caller, so this cannot be used as a mail cannon.
    await this.emailService.sendVerificationCode(profile.email, code, profile.studentId);

    return {
      studentId: profile.studentId,
      email: profile.email,
      verificationCodeSent: true,
      message: 'A new verification code has been sent to your registered email.',
    };
  }
}