import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../../config/db';
import {
  createUserSchema,
  updateUserSchema,
  assignRoleSchema,
  banUserSchema,
} from './users.validation';
import { sendSuccess, sendError } from '../../utils/response.utils';

export class UsersController {
  /**
   * List all system users with filters.
   * Route: GET /api/users
   * Access: ADMIN
   */
  static async listUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const { role, isActive, limit = 20, page = 1 } = req.query;

      const whereClause: any = {};
      if (role) {
        whereClause.role = String(role);
      }
      if (isActive !== undefined) {
        whereClause.isActive = String(isActive) === 'true';
      }

      const take = Number(limit);
      const skip = (Number(page) - 1) * take;

      const users = await prisma.user.findMany({
        where: whereClause,
        select: {
          id: true,
          email: true,
          role: true,
          isActive: true,
          createdAt: true,
          alumniProfile: { select: { fullName: true, isVerified: true } },
          employerProfile: { select: { companyName: true, isVerified: true } },
        },
        take,
        skip,
        orderBy: { createdAt: 'desc' },
      });

      const total = await prisma.user.count({ where: whereClause });

      return sendSuccess(res, 'Fetched system users list successfully.', {
        users,
        pagination: {
          total,
          limit: take,
          page: Number(page),
          pages: Math.ceil(total / take),
        },
      });
    } catch (err: any) {
      next(err);
    }
  }

  /**
   * Create a new user account (Admin utility).
   * Route: POST /api/users
   * Access: ADMIN
   */
  static async createUser(req: Request, res: Response, next: NextFunction) {
    try {
      const parsedData = createUserSchema.parse(req.body);

      const existing = await prisma.user.findUnique({
        where: { email: parsedData.email.toLowerCase() },
      });

      if (existing) {
        return sendError(res, 'User email already exists', null, 400);
      }

      const hashedPassword = await bcrypt.hash(parsedData.password, 10);

      const user = await prisma.user.create({
        data: {
          email: parsedData.email.toLowerCase(),
          password: hashedPassword,
          role: parsedData.role,
          isActive: parsedData.isActive,
        },
        select: { id: true, email: true, role: true, isActive: true, createdAt: true },
      });

      // Audit Log
      await prisma.auditLog.create({
        data: {
              userId: (req as any).user?.userId,
          action: 'CREATE_USER',
          details: `Admin created user ${user.email} with role ${user.role}`,
          ipAddress: req.ip,
        },
      });

      return sendSuccess(res, 'User account created successfully.', user, 201);
    } catch (err: any) {
      next(err);
    }
  }

  /**
   * Update credentials of a user.
   * Route: PUT /api/users/:id
   * Access: ADMIN
   */
  static async updateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const parsedData = updateUserSchema.parse(req.body);

      const user = await prisma.user.findUnique({ where: { id } });
      if (!user) {
        return sendError(res, 'User not found', null, 404);
      }

      const updateData: any = {};
      if (parsedData.email) {
        updateData.email = parsedData.email.toLowerCase();
      }
      if (parsedData.password) {
        updateData.password = await bcrypt.hash(parsedData.password, 10);
      }

      const updated = await prisma.user.update({
        where: { id },
        data: updateData,
        select: { id: true, email: true, role: true, isActive: true },
      });

      // Audit Log
      await prisma.auditLog.create({
        data: {
          userId: (req as any).user?.userId,
          action: 'UPDATE_USER',
          details: `Admin updated user credentials for ID ${id}`,
          ipAddress: req.ip,
        },
      });

      return sendSuccess(res, 'User updated successfully.', updated);
    } catch (err: any) {
      next(err);
    }
  }

  /**
   * Ban/Unban user (toggle account state).
   * Route: PUT /api/users/:id/ban
   * Access: ADMIN
   */
  static async banUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const parsedData = banUserSchema.parse(req.body);

      const user = await prisma.user.findUnique({ where: { id } });
      if (!user) {
        return sendError(res, 'User not found', null, 404);
      }

      const updated = await prisma.user.update({
        where: { id },
        data: { isActive: !parsedData.ban },
        select: { id: true, email: true, isActive: true },
      });

      // Audit Log
      await prisma.auditLog.create({
        data: {
          userId: (req as any).user?.userId,
          action: parsedData.ban ? 'BAN_USER' : 'UNBAN_USER',
          details: `${parsedData.ban ? 'Banned' : 'Unbanned'} user ID ${id}`,
          ipAddress: req.ip,
        },
      });

      return sendSuccess(res, `User successfully ${parsedData.ban ? 'banned' : 'unbanned'}.`, updated);
    } catch (err: any) {
      next(err);
    }
  }

  /**
   * Assign role to user account.
   * Route: PUT /api/users/:id/role
   * Access: ADMIN
   */
  static async assignRole(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const parsedData = assignRoleSchema.parse(req.body);

      const user = await prisma.user.findUnique({ where: { id } });
      if (!user) {
        return sendError(res, 'User not found', null, 404);
      }

      const updated = await prisma.user.update({
        where: { id },
        data: { role: parsedData.role },
        select: { id: true, email: true, role: true },
      });

      // Audit Log
      await prisma.auditLog.create({
        data: {
          userId: (req as any).user?.userId,
          action: 'ASSIGN_ROLE',
          details: `Assigned role ${parsedData.role} to user ID ${id}`,
          ipAddress: req.ip,
        },
      });

      return sendSuccess(res, 'User role assigned successfully.', updated);
    } catch (err: any) {
      next(err);
    }
  }

  /**
   * Verify Alumni or Employer profile identity.
   * Route: PUT /api/users/:id/verify
   * Access: ADMIN or REGISTRAR
   */
  static async verifyUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const user = await prisma.user.findUnique({
        where: { id },
        include: { alumniProfile: true, employerProfile: true },
      });

      if (!user) {
        return sendError(res, 'User not found', null, 404);
      }

      let profileType = '';

      if (user.alumniProfile) {
        await prisma.alumniProfile.update({
          where: { userId: id },
          data: { isVerified: true },
        });
        profileType = 'Alumni';
      } else if (user.employerProfile) {
        await prisma.employerProfile.update({
          where: { userId: id },
          data: { isVerified: true },
        });
        profileType = 'Employer';
      } else {
        return sendError(res, 'User has no profile structure that can be verified.', null, 400);
      }

      // Audit Log
      await prisma.auditLog.create({
        data: {
          userId: (req as any).user?.userId,
          action: 'VERIFY_PROFILE',
          details: `Verified ${profileType} profile for User ID ${id}`,
          ipAddress: req.ip,
        },
      });

      // Send System Notification to user
      await prisma.notification.create({
        data: {
          userId: id,
          title: 'Profile Identity Verified',
          content: 'Congratulations! Your profile has been reviewed and verified by ASTU admin.',
        },
      });

      return sendSuccess(res, `${profileType} profile verified successfully.`, null);
    } catch (err: any) {
      next(err);
    }
  }

  /**
   * Fetch complete user profile data.
   * Route: GET /api/users/:id/profile
   * Access: ADMIN, DEPARTMENT_HEAD
   */
  static async getUserProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const user = await prisma.user.findUnique({
        where: { id },
        include: {
          alumniProfile: { include: { department: true } },
          employerProfile: true,
        },
      });

      if (!user) {
        return sendError(res, 'User not found', null, 404);
      }

      return sendSuccess(res, 'Fetched user profile detail.', {
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        profile: user.alumniProfile || user.employerProfile || null,
      });
    } catch (err: any) {
      next(err);
    }
  }

  /**
   * Track user activity via audit logs.
   * Route: GET /api/users/:id/activity
   * Access: ADMIN
   */
  static async getUserActivity(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const logs = await prisma.auditLog.findMany({
        where: { userId: id },
        orderBy: { createdAt: 'desc' },
        take: 50,
      });

      return sendSuccess(res, 'Fetched user audit logs activity successfully.', logs);
    } catch (err: any) {
      next(err);
    }
  }
}
