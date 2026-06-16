import { Request, Response } from 'express';
import { ManageUsers } from '../../application/use-cases/ManageUsers';
import { GetDashboardMetrics } from '../../application/use-cases/GetDashboardMetrics';

const manageUsersUseCase = new ManageUsers();
const getDashboardMetricsUseCase = new GetDashboardMetrics();

export class AdminController {
  async getDashboardMetrics(req: Request, res: Response) {
    try {
      const result = await getDashboardMetricsUseCase.execute();
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getUsers(req: Request, res: Response) {
    try {
      const { page, limit, query, role, status, department } = req.query;
      const result = await manageUsersUseCase.getUsers({
        page: page ? parseInt(page as string, 10) : 1,
        limit: limit ? parseInt(limit as string, 10) : 25,
        query: query as string,
        role: role as string,
        status: status as string,
        department: department as string,
      });
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async createUser(req: Request, res: Response) {
    try {
      const result = await manageUsersUseCase.createUser(req.body);
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async updateUserStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { action } = req.body; // 'activate' | 'suspend' | 'verify'
      if (!['activate', 'suspend', 'verify'].includes(action)) {
        return res.status(400).json({ success: false, message: 'Invalid action' });
      }
      const result = await manageUsersUseCase.updateUserStatus(id, action as any);
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async bulkUpdateStatus(req: Request, res: Response) {
    try {
      const { ids, action } = req.body;
      if (!Array.isArray(ids) || !['activate', 'suspend', 'verify'].includes(action)) {
        return res.status(400).json({ success: false, message: 'Invalid payload' });
      }
      const result = await manageUsersUseCase.bulkUpdateStatus(ids, action as any);
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async deleteUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await manageUsersUseCase.deleteUser(id);
      res.json({ success: true, data: result });
    } catch (error: any) {
      if (error.message.includes('last admin')) {
        return res.status(400).json({ success: false, message: error.message });
      }
      res.status(500).json({ success: false, message: error.message });
    }
  }
}
