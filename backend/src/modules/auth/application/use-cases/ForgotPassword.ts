import { PrismaClient } from '@prisma/client';
import { EmailService } from '../../../../core/services/EmailService';
import { AuthError } from '../../domain/errors/AuthErrors';
import crypto from 'crypto';

const prisma = new PrismaClient();

export interface ForgotPasswordRequest {
  emailOrPhone: string;
  method: 'email' | 'phone';
}

export class ForgotPassword {
  constructor(private emailService: EmailService) {}

  async execute(req: ForgotPasswordRequest) {
    if (req.method === 'email') {
      // Look up the user by email
      const user = await prisma.user.findUnique({
        where: { email: req.emailOrPhone.toLowerCase() },
      });

      if (!user) {
        throw new AuthError('Email not found in database', 404);
      }

      // Generate a 6-digit OTP-style reset code
      const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
      const resetToken = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

      // Store the reset code in the alumni profile if alumni (for OTP UI support)
      const alumniProfile = await prisma.alumniProfile.findFirst({
        where: { userId: user.id },
      });

      // ALWAYS store the tokens in AnalyticsCache so token-based reset (the link) works for EVERYONE
      await prisma.analyticsCache.upsert({
        where: { key: `password_reset_${user.id}` },
        update: {
          data: { resetCode, resetToken } as any,
          expiresAt,
        },
        create: {
          key: `password_reset_${user.id}`,
          data: { resetCode, resetToken } as any,
          expiresAt,
        },
      });

      if (alumniProfile) {
        await prisma.alumniProfile.update({
          where: { id: alumniProfile.id },
          data: {
            pendingVerificationCode: resetCode,
            verificationCodeExpiresAt: expiresAt,
            verificationChannel: 'PASSWORD_RESET',
          },
        });
      }

      // Send the reset email
      const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;
      try {
        await this.emailService.sendMail({
          to: user.email,
          subject: 'ASTU Alumni - Password Reset Request',
          text: `Your password reset code is: ${resetCode}. Or use this link: ${resetUrl}. This expires in 15 minutes.`,
          html: `<p>Hello,</p>
            <p>You requested a password reset for your ASTU account.</p>
            <p>Your reset code is: <strong>${resetCode}</strong></p>
            <p>Or click this link to reset: <a href="${resetUrl}">${resetUrl}</a></p>
            <p>This link/code expires in 15 minutes.</p>
            <p>If you did not request this, please ignore this email.</p>`,
        });
      } catch (error) {
        console.error('Failed to send password reset email:', error);
        // Log the code to console for development
        console.log(`[DEV] Password reset code for ${user.email}: ${resetCode}`);
        console.log(`[DEV] Password reset link: ${resetUrl}`);
      }

      return {
        success: true,
        message: 'A password recovery code has been sent to your email.',
      };
    } else {
      // Phone recovery - look up alumni by phone
      const alumniProfile = await prisma.alumniProfile.findFirst({
        where: { phone: req.emailOrPhone },
        include: { user: true },
      });

      if (!alumniProfile || !alumniProfile.user) {
        throw new AuthError('Phone number not found in database', 404);
      }

      const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

      await prisma.alumniProfile.update({
        where: { id: alumniProfile.id },
        data: {
          pendingVerificationCode: resetCode,
          verificationCodeExpiresAt: expiresAt,
          verificationChannel: 'PASSWORD_RESET_PHONE',
        },
      });

      // In production, you'd send an SMS here
      console.log(`[DEV] Password reset code for phone ${req.emailOrPhone}: ${resetCode}`);

      return {
        success: true,
        message: 'A password recovery code has been sent to your phone.',
      };
    }
  }
}
