import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../../config/db';
import { loginSchema, registerEmployerSchema, activateAlumniSchema } from './auth.validation';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../../utils/jwt.utils';
import { sendSuccess, sendError } from '../../utils/response.utils';
import { Role } from '@prisma/client';

export class AuthController {
  /**
   * User login.
   * Route: POST /api/auth/login
   */
  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const parsedData = loginSchema.parse(req.body);
      
      const user = await prisma.user.findUnique({
        where: { email: parsedData.email.toLowerCase() },
      });

      if (!user) {
        return sendError(res, 'Invalid credentials', null, 401);
      }

      if (!user.isActive) {
        return sendError(res, 'Account is not activated yet. Please check your email.', null, 403);
      }

      const isPasswordValid = await bcrypt.compare(parsedData.password, user.password);
      if (!isPasswordValid) {
        return sendError(res, 'Invalid credentials', null, 401);
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
   * Employer registration.
   * Route: POST /api/auth/register-employer
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
            isActive: true, // Employers can be active immediately, or wait for verification
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
            isVerified: false, // Must be verified by Admin later
          },
        });

        return { user, profile };
      });

      return sendSuccess(res, 'Employer registered successfully. Welcome!', {
        userId: result.user.id,
        email: result.user.email,
        companyName: result.profile.companyName,
      }, 201);
    } catch (err: any) {
      next(err);
    }
  }

  /**
   * Alumni Account Activation.
   * Route: POST /api/auth/activate-alumni
   */
  static async activateAlumni(req: Request, res: Response, next: NextFunction) {
    try {
      const parsedData = activateAlumniSchema.parse(req.body);
      
      // Decrypt activation token to verify identity (Base64 string userId:timestamp)
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
        return sendError(res, 'User matching this token does not exist', null, 404);
      }

      if (user.isActive) {
        return sendError(res, 'Account is already activated. Please login.', null, 400);
      }

      const newHashedPassword = await bcrypt.hash(parsedData.password, 10);

      await prisma.user.update({
        where: { id: userId },
        data: {
          password: newHashedPassword,
          isActive: true,
        },
      });

      // Log action
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: 'ACTIVATE_ACCOUNT',
          details: 'Alumni account activated and password configured.',
          ipAddress: req.ip,
        },
      });

      return sendSuccess(res, 'Alumni account activated successfully! You may now login.', null);
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
   * User logout placeholder.
   * Route: POST /api/auth/logout
   */
  static async logout(req: Request, res: Response, next: NextFunction) {
    try {
      // In stateless JWT architectures, logout is primarily handled client-side by purging tokens.
      // We log the event here for audit compliance.
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
