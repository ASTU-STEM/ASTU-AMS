import { Request, Response, NextFunction } from 'express';
import { GetAllUsers } from '../application/use-cases/GetAllUsers';
import { UpdateUserStatus } from '../application/use-cases/UpdateUserStatus';
import { GetAdminJobs } from '../application/use-cases/GetAdminJobs';
import { GetAdminDepartments } from '../application/use-cases/GetAdminDepartments';
import { GetAdminSurveys } from '../application/use-cases/GetAdminSurveys';
import { GetAdminLogs } from '../application/use-cases/GetAdminLogs';
import { GetAdminOverview } from '../application/use-cases/GetAdminOverview';
import { GetAdminAnalytics } from '../application/use-cases/GetAdminAnalytics';
import { sendSuccess, sendError } from '../../../core/utils/response.utils';

export class AdminController {
  static async getAllUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const useCase = new GetAllUsers();
      const users = await useCase.execute();
      return sendSuccess(res, 'Users fetched successfully', users);
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to fetch users', null, 500);
    }
  }

  static async updateUserStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;
      const { isActive } = req.body;

      if (typeof isActive !== 'boolean') {
        return sendError(res, 'isActive must be a boolean value');
      }

      const useCase = new UpdateUserStatus();
      const updatedUser = await useCase.execute(userId, isActive);
      return sendSuccess(res, `User ${isActive ? 'activated' : 'deactivated'} successfully`, updatedUser);
    } catch (error: any) {
      const status = error.message === 'User not found' ? 404 : 500;
      return sendError(res, error.message || 'Failed to update user status', null, status);
    }
  }

  static async getJobs(req: Request, res: Response, next: NextFunction) {
    try {
      const useCase = new GetAdminJobs();
      const data = await useCase.execute();
      return res.json(data);
    } catch (error: any) {
      return sendError(res, error.message, null, 500);
    }
  }

  static async getDepartments(req: Request, res: Response, next: NextFunction) {
    try {
      const useCase = new GetAdminDepartments();
      const data = await useCase.execute();
      return res.json(data);
    } catch (error: any) {
      return sendError(res, error.message, null, 500);
    }
  }

  static async getSurveys(req: Request, res: Response, next: NextFunction) {
    try {
      const useCase = new GetAdminSurveys();
      const data = await useCase.execute();
      return res.json(data);
    } catch (error: any) {
      return sendError(res, error.message, null, 500);
    }
  }

  static async getLogs(req: Request, res: Response, next: NextFunction) {
    try {
      const useCase = new GetAdminLogs();
      const data = await useCase.execute();
      return res.json(data);
    } catch (error: any) {
      return sendError(res, error.message, null, 500);
    }
  }

  static async getOverview(req: Request, res: Response, next: NextFunction) {
    try {
      const useCase = new GetAdminOverview();
      const data = await useCase.execute();
      return res.json(data);
    } catch (error: any) {
      return sendError(res, error.message, null, 500);
    }
  }

  static async getAnalytics(req: Request, res: Response, next: NextFunction) {
    try {
      const useCase = new GetAdminAnalytics();
      const data = await useCase.execute();
      return res.json(data);
    } catch (error: any) {
      return sendError(res, error.message, null, 500);
    }
  }
}
