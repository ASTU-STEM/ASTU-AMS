import { Request, Response, NextFunction } from 'express';
import { sendSuccess } from '../../../core/utils/response.utils';
import { PrismaUserRepository } from '../infrastructure/repositories/PrismaUserRepository';
import { PrismaAuditLogRepository } from '../infrastructure/repositories/PrismaAuditLogRepository';
import { LoginUser } from '../application/use-cases/LoginUser';
import { RegisterEmployer } from '../application/use-cases/RegisterEmployer';
import { ActivateAlumni } from '../application/use-cases/ActivateAlumni';
import { RefreshToken } from '../application/use-cases/RefreshToken';
import { LogoutUser } from '../application/use-cases/LogoutUser';
import { RegisterAlumni } from '../application/use-cases/RegisterAlumni';
import { VerifyAlumniEmail } from '../application/use-cases/VerifyAlumniEmail';
import { VerifyAlumniNationalId } from '../application/use-cases/VerifyAlumniNationalId';
import { CreateAdminUser } from '../application/use-cases/CreateAdminUser';
import { DiditService } from '../infrastructure/services/DiditService';
import { EmailService } from '../../../core/services/EmailService';
import { loginSchema, activateAlumniSchema, registerEmployerSchema, registerAlumniSchema, verifyAlumniEmailSchema, verifyNationalIdSchema, createAdminUserSchema } from './auth.validation';

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
      const diditSvc = new DiditService();
      const useCase = new RegisterEmployer(userRepository, auditLogRepository, diditSvc, emailService);
      const result = await useCase.execute(parsedData, req.ip || 'unknown');
      return sendSuccess(res, 'Employer registration submitted successfully! Please wait for admin approval.', result, 201);
    } catch (err) {
      next(err);
    }
  }

  static async activateAlumni(req: Request, res: Response, next: NextFunction) {
    try {
      const parsedData = activateAlumniSchema.parse(req.body);
      const useCase = new ActivateAlumni(userRepository, auditLogRepository);
      await useCase.execute(parsedData, req.ip || 'unknown');
      return sendSuccess(res, 'Account activated successfully! You can now login.', null);
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
      const userId = (req as any).user?.userId;
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
      return sendSuccess(res, 'Verification code sent to registered student email.', result, 201);
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
}
