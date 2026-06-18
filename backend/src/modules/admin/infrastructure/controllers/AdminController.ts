import { Request, Response } from 'express';
import { ManageUsers } from '../../application/use-cases/ManageUsers';
import { GetDashboardMetrics } from '../../application/use-cases/GetDashboardMetrics';
import { ManageDepartments } from '../../application/use-cases/ManageDepartments';
import { ManageJobs } from '../../application/use-cases/ManageJobs';
import { ManageLogs } from '../../application/use-cases/ManageLogs';
import { ManageNotifications } from '../../application/use-cases/ManageNotifications';
import { ManageSettings } from '../../application/use-cases/ManageSettings';
import { GetSidebarStats } from '../../application/use-cases/GetSidebarStats';
import { ManageAdminProfile } from '../../application/use-cases/ManageAdminProfile';
import prisma from '../../../../core/config/db';

const manageUsersUseCase = new ManageUsers();
const getDashboardMetricsUseCase = new GetDashboardMetrics();
const manageDepartmentsUseCase = new ManageDepartments();
const manageJobsUseCase = new ManageJobs();
const manageLogsUseCase = new ManageLogs();
const manageNotificationsUseCase = new ManageNotifications();
const manageSettingsUseCase = new ManageSettings();
const getSidebarStatsUseCase = new GetSidebarStats();

export class AdminController {
  async getProfile(req: Request, res: Response) {
    try {
      const adminUserId = (req as any).user?.userId;
      const result = await ManageAdminProfile.getProfile(adminUserId);
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async updateProfile(req: Request, res: Response) {
    try {
      const adminUserId = (req as any).user?.userId;
      const result = await ManageAdminProfile.updateProfile(adminUserId, req.body);
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async updateSecurity(req: Request, res: Response) {
    try {
      const adminUserId = (req as any).user?.userId;
      const result = await ManageAdminProfile.updateSecurity(adminUserId, req.body);
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getSidebarStats(req: Request, res: Response) {
    try {
      const adminUserId = (req as any).user?.id; // Assuming auth middleware sets this
      const result = await getSidebarStatsUseCase.execute(adminUserId);
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getDashboardMetrics(req: Request, res: Response) {
    try {
      const result = await getDashboardMetricsUseCase.execute();
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getRoleStats(req: Request, res: Response) {
    try {
      const result = await manageUsersUseCase.getRoleStats();
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

  // --- Department Management ---
  async getDepartments(req: Request, res: Response) {
    try {
      const result = await manageDepartmentsUseCase.getDepartments();
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async createDepartment(req: Request, res: Response) {
    try {
      const result = await manageDepartmentsUseCase.createDepartment(req.body);
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async updateDepartment(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await manageDepartmentsUseCase.updateDepartment(id, req.body);
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async deleteDepartment(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await manageDepartmentsUseCase.deleteDepartment(id);
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getJobs(req: Request, res: Response) {
    try {
      const { page, limit, query, status } = req.query;
      const result = await manageJobsUseCase.getJobs({
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
        query: query ? String(query) : undefined,
        status: status as any,
      });
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async updateJobStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const result = await manageJobsUseCase.updateJobStatus(id, status);
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // --- System Logs ---
  async getLogs(req: Request, res: Response) {
    try {
      const { page, limit, query, action, dateFrom, dateTo } = req.query;
      const result = await manageLogsUseCase.getLogs({
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
        query: query ? String(query) : undefined,
        action: action ? String(action) : undefined,
        dateFrom: dateFrom ? String(dateFrom) : undefined,
        dateTo: dateTo ? String(dateTo) : undefined,
      });
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getLogStats(req: Request, res: Response) {
    try {
      const result = await manageLogsUseCase.getLogStats();
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // --- Notifications ---
  async getNotifications(req: Request, res: Response) {
    try {
      const { page, limit, query } = req.query;
      const result = await manageNotificationsUseCase.getNotifications({
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
        query: query ? String(query) : undefined,
      });
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getNotificationStats(req: Request, res: Response) {
    try {
      const result = await manageNotificationsUseCase.getNotificationStats();
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async sendNotification(req: Request, res: Response) {
    try {
      const { title, content, targetRole, targetUserIds } = req.body;
      if (!title || !content) {
        return res.status(400).json({ success: false, message: 'Title and content are required' });
      }
      const result = await manageNotificationsUseCase.sendNotification({
        title,
        content,
        targetRole,
        targetUserIds,
      });
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // --- Sync Logs (for Settings import history) ---
  async getSyncLogs(req: Request, res: Response) {
    try {
      const logs = await prisma.registrarSyncLog.findMany({
        orderBy: { syncedAt: 'desc' },
        take: 20,
      });
      res.json({ success: true, data: logs });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getSettings(req: Request, res: Response) {
    try {
      const settings = await manageSettingsUseCase.getSettings();
      res.json({ success: true, data: settings });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async updateSettings(req: Request, res: Response) {
    try {
      const settings = await manageSettingsUseCase.updateSettings(req.body);
      res.json({ success: true, data: settings });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}
