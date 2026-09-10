import { IUserRepository } from '../ports/IUserRepository';
import { IAuditLogRepository } from '../ports/IAuditLogRepository';
import { InvalidCredentialsError, AccountPendingApprovalError } from '../../domain/errors/AuthErrors';
import bcrypt from 'bcryptjs';
import { generateAccessToken, generateRefreshToken } from '../../../../core/utils/jwt.utils';
import { verifyTOTP, verifyEmail2FAOTP, storeEmail2FAOTP } from '../../../../core/utils/totp.utils';
import { Role, PrismaClient } from '@prisma/client';
import { EmailService } from '../../../../core/services/EmailService';
import prisma from '../../../../core/config/db';

export class LoginUser {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly auditLogRepository: IAuditLogRepository
  ) {}

  async execute(data: any, ipAddress: string) {
    const identifier = data.emailOrStudentId?.trim();
    if (!identifier) {
      throw new InvalidCredentialsError();
    }

    let user: any = null;

    // Check if identifier looks like an email
    if (identifier.includes('@')) {
      user = await this.userRepository.findByEmail(identifier.toLowerCase());
    } else {
      // Try to find by student ID through AlumniProfile
      const profile = await prisma.alumniProfile.findUnique({
        where: { studentId: identifier },
        include: { user: true },
      });
      if (profile?.user) {
        user = profile.user;
      }
    }

    if (!user) {
      throw new InvalidCredentialsError();
    }

    if (!user.isActive) {
      if (user.role === Role.ALUMNI || user.role === Role.EMPLOYER) {
        throw new AccountPendingApprovalError();
      }
      throw new AccountPendingApprovalError();
    }

    // Password verification
    const isPasswordValid = await bcrypt.compare(data.password, user.password as string);
    if (!isPasswordValid) {
      throw new InvalidCredentialsError();
    }

    // Check 2FA enablement across all profiles & roles
    let is2FAEnabled = false;

    // 1. Alumni Profile
    const alumniProfile = await prisma.alumniProfile.findUnique({
      where: { userId: user.id }
    }).catch(() => null);

    if (alumniProfile) {
      const prefs = (alumniProfile.preferences as any) || {};
      if (prefs.twoFactorEnabled) is2FAEnabled = true;
    }

    // 2. Employer Profile
    const employerProfile = await prisma.employerProfile.findUnique({
      where: { userId: user.id }
    }).catch(() => null);

    if (employerProfile) {
      if ((employerProfile as any).twoFactorEnabled || (employerProfile as any).is2FAEnabled) {
        is2FAEnabled = true;
      }
    }

    // 3. User model / Global 2FA flag
    if ((user as any).twoFactorEnabled) {
      is2FAEnabled = true;
    }

    if (is2FAEnabled) {
      const emailService = new EmailService();
      const deliveryEmail = await emailService.resolveUserDeliveryEmail(user.id);
      const targetEmail = deliveryEmail || user.email;

      if (!data.twoFactorCode) {
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        storeEmail2FAOTP(targetEmail, otpCode);
        await emailService.send2FAVerificationCode(targetEmail, otpCode);

        return {
          requires2FA: true,
          email: targetEmail,
          message: 'Two-Factor Authentication required. Verification code sent to your email.',
        };
      }

      const isTotpValid = verifyTOTP(data.twoFactorCode);
      const isEmailOtpValid = verifyEmail2FAOTP(targetEmail, data.twoFactorCode);

      if (!isTotpValid && !isEmailOtpValid) {
        throw new InvalidCredentialsError();
      }
    }

    const payload = { userId: user.id, email: user.email, role: user.role as Role };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    await this.auditLogRepository.create({
      userId: user.id,
      action: data.isEmployerLoginFlow ? 'EMPLOYER_LOGIN' : 'LOGIN',
      details: 'User logged in successfully',
      ipAddress,
    });

    let displayName = (user as any).firstName
      ? `${(user as any).firstName} ${(user as any).lastName || ''}`.trim()
      : user.email.split('@')[0];

    if (alumniProfile?.fullName) {
      displayName = alumniProfile.fullName;
    } else if (employerProfile?.companyName) {
      displayName = employerProfile.companyName;
    } else if (user.role === Role.ADMIN) {
      displayName = 'System Admin';
    } else if (user.role === Role.REGISTRAR) {
      displayName = 'Office of Registrar';
    } else if (user.role === Role.DEPARTMENT_HEAD) {
      displayName = 'Department Head';
    }

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: displayName,
        fullName: displayName,
        firstName: (user as any).firstName || undefined,
        lastName: (user as any).lastName || undefined,
        alumniProfile: alumniProfile ? { id: alumniProfile.id, fullName: alumniProfile.fullName } : undefined,
        employerProfile: employerProfile ? { id: employerProfile.id, companyName: employerProfile.companyName } : undefined,
      },
      token: accessToken,
      refreshToken,
    };
  }
}
