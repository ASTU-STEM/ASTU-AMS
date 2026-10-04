import { Request, Response, NextFunction } from 'express';
import { sendSuccess } from '../../../core/utils/response.utils';
import { TokenRevocationService } from '../../../core/services/TokenRevocationService';
import { verifyRefreshToken } from '../../../core/utils/jwt.utils';
import { PrismaUserRepository } from '../infrastructure/repositories/PrismaUserRepository';
import { PrismaAuditLogRepository } from '../infrastructure/repositories/PrismaAuditLogRepository';
import { LoginUser } from '../application/use-cases/LoginUser';
import { RegisterEmployer } from '../application/use-cases/RegisterEmployer';
import { RefreshToken } from '../application/use-cases/RefreshToken';
import { LogoutUser } from '../application/use-cases/LogoutUser';
import { RegisterAlumni } from '../application/use-cases/RegisterAlumni';
import { VerifyAlumniEmail } from '../application/use-cases/VerifyAlumniEmail';
import { VerifyAlumniNationalId } from '../application/use-cases/VerifyAlumniNationalId';
import { ResendAlumniOtp } from '../application/use-cases/ResendAlumniOtp';
import { CreateAdminUser } from '../application/use-cases/CreateAdminUser';
import { ForgotPassword } from '../application/use-cases/ForgotPassword';
import { ResetPassword } from '../application/use-cases/ResetPassword';
import { StartDiditSession } from '../application/use-cases/StartDiditSession';
import { GetDiditStatus } from '../application/use-cases/GetDiditStatus';
import { SubmitManualVerification } from '../application/use-cases/SubmitManualVerification';
import { VerifyDiditSession } from '../application/use-cases/VerifyDiditSession';
import { SubmitRegistrationIssue } from '../application/use-cases/SubmitRegistrationIssue';
import { DiditService } from '../infrastructure/services/DiditService';
import { EmailService } from '../../../core/services/EmailService';
import { storeEmail2FAOTP, verifyTOTP, verifyEmail2FAOTP } from '../../../core/utils/totp.utils';
import { loginSchema, registerEmployerSchema, registerAlumniSchema, verifyAlumniEmailSchema, resendOtpSchema, verifyNationalIdSchema, createAdminUserSchema } from './auth.validation';

const userRepository = new PrismaUserRepository();
const auditLogRepository = new PrismaAuditLogRepository();
const emailService = new EmailService();

export class AuthController {
  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const parsedData = loginSchema.parse(req.body);
      const useCase = new LoginUser(userRepository, auditLogRepository);
      const result = await useCase.execute(parsedData, req.ip || 'unknown');
      return sendSuccess(res, 'Login successful', result);
    } catch (err) {
      next(err);
    }
  }

  static async employerLogin(req: Request, res: Response, next: NextFunction) {
    try {
      const parsedData = loginSchema.parse({ ...req.body, isEmployerLoginFlow: true });
      const useCase = new LoginUser(userRepository, auditLogRepository);
      const result = await useCase.execute(parsedData, req.ip || 'unknown');
      return sendSuccess(res, 'Employer login successful', result);
    } catch (err) {
      next(err);
    }
  }

  static async registerEmployer(req: Request, res: Response, next: NextFunction) {
    try {
      const parsedData = registerEmployerSchema.parse(req.body);
      const useCase = new RegisterEmployer(userRepository, auditLogRepository, emailService);
      const result = await useCase.execute(parsedData, req.ip || 'unknown');
      return sendSuccess(res, 'Employer registration submitted successfully! Please wait for admin approval.', result, 201);
    } catch (err) {
      next(err);
    }
  }

  static async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const useCase = new RefreshToken(userRepository);
      const result = await useCase.execute(req.body.refreshToken);
      return sendSuccess(res, 'Token refreshed successfully', result);
    } catch (err) {
      next(err);
    }
  }

  static async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;
      const userId = user?.userId;

      // Revoke the presented access token so it cannot be replayed after logout.
      await TokenRevocationService.revoke(user || {});

      // Revoke the refresh token too, otherwise the client can mint a new access
      // token for up to JWT_REFRESH_EXPIRY after the user believes they left.
      const refreshToken = req.body?.refreshToken || req.headers['x-refresh-token'];
      if (typeof refreshToken === 'string' && refreshToken.length > 0) {
        try {
          await TokenRevocationService.revoke(verifyRefreshToken(refreshToken));
        } catch {
          // An unparseable refresh token is already useless; nothing to revoke.
        }
      }

      const useCase = new LogoutUser(auditLogRepository);
      await useCase.execute(userId, req.ip || 'unknown');
      return sendSuccess(res, 'Logout successful', null);
    } catch (err) {
      next(err);
    }
  }

  // Alumni Registration Flow
  static async registerAlumni(req: Request, res: Response, next: NextFunction) {
    try {
      const parsedData = registerAlumniSchema.parse(req.body);
      const useCase = new RegisterAlumni(userRepository, emailService);
      const result = await useCase.execute(parsedData);
      return sendSuccess(res, result.message, result, 201);
    } catch (err) {
      next(err);
    }
  }

  static async verifyAlumniEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const parsedData = verifyAlumniEmailSchema.parse(req.body);
      const useCase = new VerifyAlumniEmail(userRepository);
      const result = await useCase.execute(parsedData);
      return sendSuccess(res, 'Alumni email verified and account activated.', result);
    } catch (err) {
      next(err);
    }
  }

  static async verifyAlumniNationalId(req: Request, res: Response, next: NextFunction) {
    try {
      const parsedData = verifyNationalIdSchema.parse(req.body);
      const diditSvc = new DiditService();
      const useCase = new VerifyAlumniNationalId(userRepository);
      const result = await useCase.execute(parsedData, diditSvc);
      return sendSuccess(res, 'National ID verified and account activated.', result);
    } catch (err) {
      next(err);
    }
  }

  static async resendOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const parsedData = resendOtpSchema.parse(req.body);
      const useCase = new ResendAlumniOtp(emailService);
      const result = await useCase.execute(parsedData);
      return sendSuccess(res, result.message, result);
    } catch (err) {
      next(err);
    }
  }

  // Submit Registration Issue
  static async submitRegistrationIssue(req: Request, res: Response, next: NextFunction) {
    try {
      const fileObj = req.files && (req.files as any)['identificationDocument']
        ? (req.files as any)['identificationDocument'][0]
        : null;

      let identificationUrl: string | null = null;
      if (fileObj) {
        const normPath = fileObj.path.replace(/\\/g, '/');
        const match = normPath.match(/uploads\/.*/i);
        identificationUrl = match ? match[0] : `uploads/VerificationDocument/${fileObj.filename}`;
      }

      if (!identificationUrl) {
        throw new Error('Identification document is required.');
      }

      const useCase = new SubmitRegistrationIssue(emailService);
      const result = await useCase.execute({
        ...req.body,
        identificationUrl
      });
      return sendSuccess(res, 'Registration issue submitted successfully. We will notify you once verified.', result, 201);
    } catch (err) {
      next(err);
    }
  }

  // Admin: Create Registrar/Department Head Account
  static async adminCreateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const adminId = (req as any).user?.userId;
      const parsedData = createAdminUserSchema.parse(req.body);
      const useCase = new CreateAdminUser(userRepository, emailService);
      const result = await useCase.execute(parsedData, adminId);
      return sendSuccess(res, 'User account created successfully.', result, 201);
    } catch (err) {
      next(err);
    }
  }

  // Forgot Password / Reset Password
  static async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { identifier, method } = req.body;
      if (!identifier) throw new Error('Email or Student ID is required');
      const useCase = new ForgotPassword(emailService);
      const result = await useCase.execute({ emailOrPhone: identifier, method: method || 'email' });
      return sendSuccess(res, result.message, result);
    } catch (err) {
      next(err);
    }
  }

  static async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { token, newPassword } = req.body;
      if (!token || !newPassword) throw new Error('Token and new password are required');
      const useCase = new ResetPassword();
      const result = await useCase.execute({ token, newPassword });
      return sendSuccess(res, result.message, result);
    } catch (err) {
      next(err);
    }
  }

  // Didit Verification Flow
  static async startDiditSession(req: Request, res: Response, next: NextFunction) {
    try {
      const { studentId } = req.body;
      if (!studentId) throw new Error('Student ID is required');
      const useCase = new StartDiditSession();
      const result = await useCase.execute(studentId);
      return sendSuccess(res, result.message, result);
    } catch (err) {
      next(err);
    }
  }

  static async getDiditStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { sessionId } = req.params;
      if (!sessionId) throw new Error('Session ID is required');
      const useCase = new GetDiditStatus();
      const result = await useCase.execute(sessionId);
      return sendSuccess(res, result.message, result);
    } catch (err) {
      next(err);
    }
  }

  // Manual Verification Upload
  static async submitManualVerification(req: Request, res: Response, next: NextFunction) {
    try {
      const { studentId, fullName, graduationYear, country, contactEmail, phone, documentType, notes } = req.body;
      const files = req.files as Express.Multer.File[];
      const fileUrls = files?.map(f => f.filename) || [];

      const useCase = new SubmitManualVerification(emailService);
      const result = await useCase.execute({
        studentId, fullName, graduationYear, country, contactEmail, phone, documentType, notes, fileUrls
      });
      return sendSuccess(res, result.message, result);
    } catch (err) {
      next(err);
    }
  }

  // Didit Verification — compare National ID name against AlumniProfile
  static async verifyDiditSession(req: Request, res: Response, next: NextFunction) {
    try {
      const { sessionId, nationalIdName } = req.body;
      if (!sessionId || !nationalIdName) {
        throw new Error('Session ID and National ID name are required.');
      }
      const useCase = new VerifyDiditSession();
      const result = await useCase.execute(sessionId, nationalIdName);
      return sendSuccess(res, result.message, result);
    } catch (err) {
      next(err);
    }
  }

  // Send 2FA Verification Code via Email
  static async send2FAOTP(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ success: false, message: 'Email address is required' });
      }

      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      storeEmail2FAOTP(email, otpCode);
      await emailService.send2FAVerificationCode(email, otpCode);

      return sendSuccess(res, `2FA verification code sent to ${email}`, {
        email,
        codeSent: true,
        devCode: otpCode
      });
    } catch (err) {
      next(err);
    }
  }

  // Verify 2FA Setup Code (TOTP or Email OTP)
  static async verify2FACode(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, code } = req.body;
      if (!code || !email) {
        return res.status(400).json({ success: false, message: 'Email address and verification code are required' });
      }

      const isTotpValid = verifyTOTP(code);
      const isEmailOtpValid = verifyEmail2FAOTP(email, code);

      if (!isTotpValid && !isEmailOtpValid) {
        return res.status(400).json({ success: false, message: 'Invalid 2FA verification code. Please check the code and try again.' });
      }

      return sendSuccess(res, '2FA verification code valid', { valid: true });
    } catch (err) {
      next(err);
    }
  }

  // Change Password
  static async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.userId;
      const { currentPassword, newPassword } = req.body;

      if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized authentication' });
      }
      if (!newPassword || newPassword.length < 6) {
        return res.status(400).json({ success: false, message: 'New password must be at least 6 characters long' });
      }

      const bcrypt = require('bcryptjs');
      const prisma = require('../../../core/config/db').default;

      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        return res.status(404).json({ success: false, message: 'User account not found' });
      }

      if (currentPassword) {
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
          return res.status(400).json({ success: false, message: 'Current password is incorrect' });
        }
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await prisma.user.update({
        where: { id: userId },
        data: { password: hashedPassword }
      });

      return sendSuccess(res, 'Password changed successfully!', { updated: true });
    } catch (err) {
      next(err);
    }
  }

  static async toggle2FA(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const { enabled } = req.body;
      const isEnabled = Boolean(enabled);
      const prisma = require('../../../core/config/db').default;

      await prisma.user.update({
        where: { id: userId },
        data: { twoFactorEnabled: isEnabled }
      });

      const alumniProfile = await prisma.alumniProfile.findUnique({ where: { userId } }).catch(() => null);
      if (alumniProfile) {
        const existingPrefs = (alumniProfile.preferences as any) || {};
        await prisma.alumniProfile.update({
          where: { userId },
          data: {
            preferences: { ...existingPrefs, twoFactorEnabled: isEnabled }
          }
        }).catch(() => null);
      }

      return sendSuccess(res, isEnabled ? '2FA protection enabled successfully' : '2FA protection disabled', { twoFactorEnabled: isEnabled });
    } catch (err) {
      next(err);
    }
  }
}
