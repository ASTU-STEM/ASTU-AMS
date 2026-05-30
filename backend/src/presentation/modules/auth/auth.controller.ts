import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../../../infrastructure/config/db';
import { 
  loginSchema, 
  registerAlumniSchema, 
  verifyRegistrationSchema,
  nationalIdVerificationSchema,
  registerEmployerSchema, 
  createUserByAdminSchema, 
  activateAlumniSchema 
} from './auth.validation';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../../../shared/utils/jwt.utils';
import { sendSuccess, sendError } from '../../../shared/utils/response.utils';
import { BaseController } from '../../controllers/BaseController';
import { EmailService } from '../../../infrastructure/services/email.service';
import { diditService } from '../../../infrastructure/services/didit.service';
import { Role } from '@prisma/client';

// Helper: Generate random password
function generateTempPassword(length: number = 12): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

export class AuthController extends BaseController {
  /**
   * Alumni Public Registration (Pending Admin Approval).
   * Route: POST /api/auth/register
   * Role: Public
   */
  static async registerAlumni(req: Request, res: Response, next: NextFunction) {
    try {
      const parsedData = registerAlumniSchema.parse(req.body);

      const profile = await prisma.alumniProfile.findUnique({
        where: { studentId: parsedData.studentId },
        include: { user: true },
      });

      if (!profile) {
        return sendError(
          res,
          'Student ID not found in alumni records. Please ask the Registrar office to import graduate data first.',
          null,
          400
        );
      }

      if (profile.status === 'ACTIVE' || profile.userId) {
        return sendError(res, 'An active alumni account already exists for this Student ID.', null, 400);
      }

      const normalizedRequestName = parsedData.fullName.trim().toLowerCase();
      const normalizedProfileName = profile.fullName.trim().toLowerCase();

      if (normalizedRequestName !== normalizedProfileName) {
        return sendError(
          res,
          'The full name does not match the alumni record. Please make sure you entered the name exactly as in the registrar data.',
          null,
          400
        );
      }

      if (!profile.email) {
        return sendError(
          res,
          'No student email is available for this record. Please use national ID verification instead.',
          null,
          400
        );
      }

      const pendingPasswordHash = await bcrypt.hash(parsedData.password, 10);
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

      await prisma.alumniProfile.update({
        where: { id: profile.id },
        data: {
          pendingPasswordHash,
          pendingVerificationCode: verificationCode,
          verificationCodeExpiresAt: expiresAt,
          verificationChannel: 'EMAIL',
          isVerified: false,
          status: 'INACTIVE',
        },
      });

      await prisma.auditLog.create({
        data: {
          userId: profile.userId || 'SYSTEM',
          action: 'REQUEST_ALUMNI_VERIFICATION',
          details: `Alumni registration requested for studentId ${parsedData.studentId}`,
          ipAddress: req.ip,
        },
      });

      try {
        await EmailService.sendVerificationCode(profile.email, profile.fullName, verificationCode);
      } catch (emailErr: any) {
        console.warn('Failed to send registration verification code:', emailErr.message);
      }

      return sendSuccess(
        res,
        'Verification code sent to the registered student email address. Enter the code to complete registration.',
        { studentId: parsedData.studentId },
        200
      );
    } catch (err: any) {
      next(err);
    }
  }

  static async verifyAlumniRegistration(req: Request, res: Response, next: NextFunction) {
    try {
      const parsedData = verifyRegistrationSchema.parse(req.body);

      const profile = await prisma.alumniProfile.findUnique({
        where: { studentId: parsedData.studentId },
        include: { user: true },
      });

      if (!profile) {
        return sendError(res, 'Student ID not found in alumni records.', null, 404);
      }

      if (!profile.pendingVerificationCode || !profile.verificationCodeExpiresAt) {
        return sendError(res, 'No pending verification request found for this student.', null, 400);
      }

      if (profile.verificationCodeExpiresAt < new Date()) {
        return sendError(res, 'Verification code has expired. Please request a new registration verification.', null, 400);
      }

      if (profile.pendingVerificationCode !== parsedData.code) {
        return sendError(res, 'Invalid verification code.', null, 400);
      }

      const email = profile.email;
      if (!email) {
        return sendError(res, 'No email associated with this alumni profile.', null, 400);
      }

      const passwordHash = profile.pendingPasswordHash;
      if (!passwordHash) {
        return sendError(res, 'No pending password was saved for this registration request.', null, 400);
      }

      let user = profile.user;
      if (!user) {
        user = await prisma.user.create({
          data: {
            email: email.toLowerCase(),
            password: passwordHash,
            role: Role.ALUMNI,
            isActive: true,
          },
        });
      } else {
        await prisma.user.update({
          where: { id: user.id },
          data: { isActive: true, password: passwordHash },
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
          verificationChannel: 'EMAIL',
        },
      });

      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: 'VERIFY_ALUMNI_EMAIL',
          details: `Alumni email verification completed for studentId ${parsedData.studentId}`,
          ipAddress: req.ip,
        },
      });

      try {
        await EmailService.sendEmail(
          email,
          'Your Alumni Account is Now Active',
          `
            <h2>Welcome to ASTU Alumni Management System</h2>
            <p>Your alumni account has been successfully verified and activated.</p>
            <p>You can now login with your email and password.</p>
          `
        );
      } catch (emailErr: any) {
        console.warn('Failed to send activation email:', emailErr.message);
      }

      return sendSuccess(res, 'Alumni registration verified and account activated successfully.', {
        userId: user.id,
        email: user.email,
        status: 'ACTIVE',
      });
    } catch (err: any) {
      next(err);
    }
  }

  static async verifyAlumniNationalId(req: Request, res: Response, next: NextFunction) {
    try {
      const parsedData = nationalIdVerificationSchema.parse(req.body);

      const profile = await prisma.alumniProfile.findUnique({
        where: { studentId: parsedData.studentId },
        include: { user: true },
      });

      if (!profile) {
        return sendError(res, 'Student ID not found in alumni records.', null, 404);
      }

      if (profile.status === 'ACTIVE' && profile.userId) {
        return sendError(res, 'Alumni account is already active.', null, 400);
      }

      if (!profile.email) {
        return sendError(res, 'No email is available on the alumni profile. Cannot create login account.', null, 400);
      }

      const verification = await diditService.verifyNationalId(parsedData.nationalId);

      if (!verification.valid) {
        return sendError(res, 'National ID verification failed. Please check your details and try again.', null, 400);
      }

      const normalizedProfileName = profile.fullName.trim().toLowerCase();
      const normalizedDiditName = (verification.name || '').trim().toLowerCase();
      if (normalizedProfileName !== normalizedDiditName) {
        return sendError(
          res,
          'The name returned by national ID verification does not match the alumni record.',
          null,
          400
        );
      }

      const passwordHash = parsedData.password
        ? await bcrypt.hash(parsedData.password, 10)
        : profile.pendingPasswordHash;

      if (!passwordHash) {
        return sendError(res, 'Password is required to complete account creation.', null, 400);
      }

      const existingUserByEmail = await prisma.user.findUnique({
        where: { email: profile.email.toLowerCase() },
      });
      if (existingUserByEmail && existingUserByEmail.id !== profile.userId) {
        return sendError(res, 'A user already exists with the alumni profile email. Please contact support.', null, 400);
      }

      let user = profile.user;
      if (!user) {
        user = await prisma.user.create({
          data: {
            email: profile.email.toLowerCase(),
            password: passwordHash,
            role: Role.ALUMNI,
            isActive: true,
          },
        });
      } else {
        await prisma.user.update({
          where: { id: user.id },
          data: { isActive: true, password: passwordHash },
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

      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: 'VERIFY_ALUMNI_NATIONAL_ID',
          details: `Alumni national ID verification completed for studentId ${parsedData.studentId}`,
          ipAddress: req.ip,
        },
      });

      return sendSuccess(res, 'National ID verification succeeded. Alumni account activated.', {
        userId: user.id,
        email: user.email,
        status: 'ACTIVE',
      });
    } catch (err: any) {
      next(err);
    }
  }

  /**
   * Admin: Approve Alumni Account.
   * Route: POST /api/auth/admin/approve-alumni/:userId
   * Role: ADMIN
   */
  static async adminApproveAlumni(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;

      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        return sendError(res, 'User not found', null, 404);
      }

      if (user.role !== Role.ALUMNI) {
        return sendError(res, 'Only alumni accounts can be approved', null, 400);
      }

      if (user.isActive) {
        return sendError(res, 'This account is already approved', null, 400);
      }

      // Activate the account
      await prisma.user.update({
        where: { id: userId },
        data: { isActive: true },
      });

      // Generate activation token for setting password
      const activationToken = Buffer.from(`${userId}:${Date.now()}`).toString('base64');

      // Create audit log
      await prisma.auditLog.create({
        data: {
          userId: (req as any).user?.userId || 'SYSTEM',
          action: 'APPROVE_ALUMNI',
          details: `Alumni account ${user.email} approved`,
          ipAddress: req.ip,
        },
      });

      // Send approval email with activation link
      try {
        await EmailService.sendEmail(
          user.email,
          'Alumni Account Approved - Complete Your Registration',
          `
            <h2>Welcome to ASTU Alumni Management System</h2>
            <p>Your alumni account has been approved!</p>
            <p>Please activate your account by setting your password using the link below:</p>
            <p><a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/activate?token=${activationToken}">
              Activate Your Account
            </a></p>
            <p>This link will expire in 24 hours.</p>
          `
        );
      } catch (emailErr: any) {
        console.warn('Failed to send approval email:', emailErr.message);
      }

      return sendSuccess(res, 'Alumni account approved successfully', {
        userId: user.id,
        email: user.email,
      });
    } catch (err: any) {
      next(err);
    }
  }

  /**
   * Admin: Create Registrar/Department Head Account.
   * Route: POST /api/auth/admin/create-user
   * Role: ADMIN
   */
  static async adminCreateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const parsedData = createUserByAdminSchema.parse(req.body);

      const existingUser = await prisma.user.findUnique({
        where: { email: parsedData.email.toLowerCase() },
      });

      if (existingUser) {
        return sendError(res, 'Email address already in use', null, 400);
      }

      // Generate temporary password
      const tempPassword = generateTempPassword(12);
      const hashedPassword = await bcrypt.hash(tempPassword, 10);

      const newUser = await prisma.user.create({
        data: {
          email: parsedData.email.toLowerCase(),
          password: hashedPassword,
          role: parsedData.role,
          isActive: true, // Immediately active
        },
      });

      // Create audit log
      await prisma.auditLog.create({
        data: {
          userId: (req as any).user?.userId || 'SYSTEM',
          action: 'CREATE_USER',
          details: `${parsedData.role} account created: ${newUser.email}`,
          ipAddress: req.ip,
        },
      });

      // Send credentials email
      try {
        await EmailService.sendEmail(
          newUser.email,
          `Your ${parsedData.role} Account Credentials`,
          `
            <h2>ASTU Alumni Management System</h2>
            <p>Your ${parsedData.role} account has been created by an administrator.</p>
            <h3>Login Credentials:</h3>
            <p><strong>Email:</strong> ${newUser.email}</p>
            <p><strong>Temporary Password:</strong> ${tempPassword}</p>
            <p>Login here: ${process.env.FRONTEND_URL || 'http://localhost:3000'}/login</p>
            <p><strong>Important:</strong> Please change your password immediately after login.</p>
          `
        );
      } catch (emailErr: any) {
        console.warn('Failed to send credentials email:', emailErr.message);
      }

      return sendSuccess(res, 
        `${parsedData.role} account created and credentials sent to ${newUser.email}`,
        { 
          userId: newUser.id, 
          email: newUser.email,
          role: newUser.role,
          message: 'Credentials have been sent to the provided email address'
        },
        201
      );
    } catch (err: any) {
      next(err);
    }
  }

  /**
   * User login (Main System - All approved users).
   * Route: POST /api/auth/login
   */
  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const parsedData = loginSchema.parse(req.body);
      
      const user = await prisma.user.findUnique({
        where: { email: parsedData.email.toLowerCase() },
      });

      if (!user) {
        return sendError(res, 'Invalid email or password', null, 401);
      }

      if (!user.isActive) {
        if (user.role === Role.ALUMNI) {
          return sendError(res, 'Your account is pending admin approval', null, 403);
        }
        return sendError(res, 'Your account is not activated', null, 403);
      }

      if (user.role === Role.EMPLOYER) {
        return sendError(res, 'Employers use the separate employer login page', null, 403);
      }

      const isPasswordValid = await bcrypt.compare(parsedData.password, user.password);
      if (!isPasswordValid) {
        return sendError(res, 'Invalid email or password', null, 401);
      }

      const payload = { userId: user.id, email: user.email, role: user.role };
      const accessToken = generateAccessToken(payload);
      const refreshToken = generateRefreshToken(payload);

      // Create Audit Log
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: 'LOGIN',
          details: 'User logged in successfully',
          ipAddress: req.ip,
        },
      });

      return sendSuccess(res, 'Login successful', {
        user: { id: user.id, email: user.email, role: user.role },
        accessToken,
        refreshToken,
      });
    } catch (err: any) {
      next(err);
    }
  }

  /**
   * Employer Registration (Separate Flow - Pending Admin Approval).
   * Route: POST /api/auth/employer/register
   */
  static async registerEmployer(req: Request, res: Response, next: NextFunction) {
    try {
      const parsedData = registerEmployerSchema.parse(req.body);

      const existingUser = await prisma.user.findUnique({
        where: { email: parsedData.email.toLowerCase() },
      });

      if (existingUser) {
        return sendError(res, 'Email address already registered', null, 400);
      }

      const hashedPassword = await bcrypt.hash(parsedData.password, 10);

      // Create user and employer profile inside a transaction
      const result = await prisma.$transaction(async (tx: any) => {
        const user = await tx.user.create({
          data: {
            email: parsedData.email.toLowerCase(),
            password: hashedPassword,
            role: Role.EMPLOYER,
            isActive: false, // Pending admin approval
          },
        });

        const profile = await tx.employerProfile.create({
          data: {
            userId: user.id,
            companyName: parsedData.companyName,
            industry: parsedData.industry,
            website: parsedData.website || null,
            location: parsedData.location,
            hrContact: parsedData.hrContact,
            isVerified: false,
          },
        });

        return { user, profile };
      });

      // Create audit log
      await prisma.auditLog.create({
        data: {
          userId: result.user.id,
          action: 'REGISTER_EMPLOYER',
          details: `Employer account created and pending admin approval: ${result.profile.companyName}`,
          ipAddress: req.ip,
        },
      });

      // Send confirmation email
      try {
        await EmailService.sendEmail(
          result.user.email,
          'Employer Registration Submitted',
          `
            <h2>Welcome to ASTU Alumni Management System</h2>
            <p>Your employer registration has been submitted successfully.</p>
            <p><strong>Company:</strong> ${result.profile.companyName}</p>
            <p>An administrator will review your account and send you an approval email shortly.</p>
            <p>Registration ID: ${result.user.id}</p>
          `
        );
      } catch (emailErr: any) {
        console.warn('Failed to send confirmation email:', emailErr.message);
      }

      return sendSuccess(res, 'Employer registration submitted successfully! Please wait for admin approval.', {
        userId: result.user.id,
        email: result.user.email,
        companyName: result.profile.companyName,
      }, 201);
    } catch (err: any) {
      next(err);
    }
  }

  /**
   * Admin: Approve Employer Account.
   * Route: POST /api/auth/admin/approve-employer/:userId
   * Role: ADMIN
   */
  static async adminApproveEmployer(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;

      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        return sendError(res, 'User not found', null, 404);
      }

      if (user.role !== Role.EMPLOYER) {
        return sendError(res, 'This user is not an employer account', null, 400);
      }

      // Update user to active
      await prisma.user.update({
        where: { id: userId },
        data: { isActive: true },
      });

      // Get employer profile for company name
      const profile = await prisma.employerProfile.findUnique({
        where: { userId: userId },
      });

      // Create audit log
      await prisma.auditLog.create({
        data: {
          userId: (req as any).user?.userId || 'SYSTEM',
          action: 'APPROVE_EMPLOYER',
          details: `Employer account approved: ${profile?.companyName || user.email}`,
          ipAddress: req.ip,
        },
      });

      // Send approval email
      try {
        await EmailService.sendEmail(
          user.email,
          'Your Employer Account Has Been Approved',
          `
            <h2>Account Approval Notification</h2>
            <p>Your employer account has been approved by an administrator.</p>
            <p><strong>Company:</strong> ${profile?.companyName}</p>
            <p>You can now login to access the job board and post positions.</p>
            <p>Login here: ${process.env.FRONTEND_URL || 'http://localhost:3000'}/employer/login</p>
            <p><strong>Email:</strong> ${user.email}</p>
          `
        );
      } catch (emailErr: any) {
        console.warn('Failed to send approval email:', emailErr.message);
      }

      return sendSuccess(res, 'Employer account approved successfully', {
        userId: user.id,
        email: user.email,
        companyName: profile?.companyName,
      });
    } catch (err: any) {
      next(err);
    }
  }

  /**
   * Employer Login (Separate Flow).
   * Route: POST /api/auth/employer/login
   */
  static async employerLogin(req: Request, res: Response, next: NextFunction) {
    try {
      const parsedData = loginSchema.parse(req.body);
      
      const user = await prisma.user.findUnique({
        where: { email: parsedData.email.toLowerCase() },
      });

      if (!user || user.role !== Role.EMPLOYER) {
        return sendError(res, 'Invalid employer credentials', null, 401);
      }

      if (!user.isActive) {
        return sendError(res, 'Your employer account is pending admin approval', null, 403);
      }

      const isPasswordValid = await bcrypt.compare(parsedData.password, user.password);
      if (!isPasswordValid) {
        return sendError(res, 'Invalid employer credentials', null, 401);
      }

      const payload = { userId: user.id, email: user.email, role: user.role };
      const accessToken = generateAccessToken(payload);
      const refreshToken = generateRefreshToken(payload);

      // Create Audit Log
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: 'EMPLOYER_LOGIN',
          details: 'Employer logged in successfully',
          ipAddress: req.ip,
        },
      });

      return sendSuccess(res, 'Employer login successful', {
        user: { id: user.id, email: user.email, role: user.role },
        accessToken,
        refreshToken,
      });
    } catch (err: any) {
      next(err);
    }
  }

  /**
   * Alumni Account Activation (Set Password).
   * Route: POST /api/auth/activate-alumni
   */
  static async activateAlumni(req: Request, res: Response, next: NextFunction) {
    try {
      const parsedData = activateAlumniSchema.parse(req.body);
      
      let userId: string;
      try {
        const decodedToken = Buffer.from(parsedData.token, 'base64').toString('ascii');
        userId = decodedToken.split(':')[0];
      } catch (e) {
        return sendError(res, 'Invalid activation token', null, 400);
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        return sendError(res, 'User not found', null, 404);
      }

      if (user.role !== Role.ALUMNI) {
        return sendError(res, 'This endpoint is for alumni only', null, 400);
      }

      const newHashedPassword = await bcrypt.hash(parsedData.password, 10);

      await prisma.user.update({
        where: { id: userId },
        data: { password: newHashedPassword },
      });

      // Log action
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: 'ACTIVATE_ACCOUNT',
          details: 'Alumni account password set',
          ipAddress: req.ip,
        },
      });

      return sendSuccess(res, 'Account activated successfully! You can now login.', null);
    } catch (err: any) {
      next(err);
    }
  }

  /**
   * Refresh JWT Access Token.
   * Route: POST /api/auth/refresh
   */
  static async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        return sendError(res, 'Refresh token required', null, 401);
      }

      const decoded = verifyRefreshToken(refreshToken);
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
      });

      if (!user || !user.isActive) {
        return sendError(res, 'Invalid token or inactive account', null, 401);
      }

      const payload = { userId: user.id, email: user.email, role: user.role };
      const newAccessToken = generateAccessToken(payload);

      return sendSuccess(res, 'Token refreshed successfully', {
        accessToken: newAccessToken,
      });
    } catch (err: any) {
      return sendError(res, 'Invalid refresh token', err.message, 401);
    }
  }

  /**
   * User logout.
   * Route: POST /api/auth/logout
   */
  static async logout(req: Request, res: Response, next: NextFunction) {
    try {
      if ((req as any).user) {
        await prisma.auditLog.create({
          data: {
            userId: (req as any).user?.userId,
            action: 'LOGOUT',
            details: 'User logged out',
            ipAddress: req.ip,
          },
        });
      }
      return sendSuccess(res, 'Logout successful', null);
    } catch (err: any) {
      next(err);
    }
  }
}
