import { Request, Response, NextFunction } from 'express';
import { sendSuccess } from '../../../core/utils/response.utils';
import { PrismaUserRepository } from '../infrastructure/repositories/PrismaUserRepository';
import { PrismaAuditLogRepository } from '../infrastructure/repositories/PrismaAuditLogRepository';
import { LoginUser } from '../application/use-cases/LoginUser';
import { RegisterEmployer } from '../application/use-cases/RegisterEmployer';
import { ActivateAlumni } from '../application/use-cases/ActivateAlumni';
import { RefreshToken } from '../application/use-cases/RefreshToken';
import { LogoutUser } from '../application/use-cases/LogoutUser';
import { loginSchema, activateAlumniSchema, registerEmployerSchema } from './auth.validation';

const userRepository = new PrismaUserRepository();
const auditLogRepository = new PrismaAuditLogRepository();

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
      const useCase = new RegisterEmployer(userRepository, auditLogRepository);
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
}
