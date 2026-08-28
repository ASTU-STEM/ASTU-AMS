import { Router } from 'express';
import { AdminController } from '../controllers/AdminController';
import { authenticateJWT } from '../../../../core/middleware/auth.middleware';
import { requireRoles } from '../../../../core/middleware/role.middleware';

const router = Router();
const adminController = new AdminController();

// Only ADMIN role can access these routes
router.use(authenticateJWT, requireRoles(['ADMIN']));

router.get('/profile', adminController.getProfile);
router.put('/profile', adminController.updateProfile);
router.put('/profile/security', adminController.updateSecurity);

router.get('/dashboard/metrics', adminController.getDashboardMetrics);
router.get('/sidebar-stats', adminController.getSidebarStats);
router.get('/roles/stats', adminController.getRoleStats);
router.get('/users', adminController.getUsers);
router.post('/users', adminController.createUser);
router.put('/users/bulk/status', adminController.bulkUpdateStatus);
router.put('/users/:id/status', adminController.updateUserStatus);
router.delete('/users/:id', adminController.deleteUser);

// Department Routes
router.get('/departments', adminController.getDepartments);
router.post('/departments', adminController.createDepartment);
router.put('/departments/:id', adminController.updateDepartment);
router.delete('/departments/:id', adminController.deleteDepartment);

router.get('/jobs', adminController.getJobs);
router.put('/jobs/:id/status', adminController.updateJobStatus);

// System Logs
router.get('/logs', adminController.getLogs);
router.get('/logs/stats', adminController.getLogStats);

// Notifications
router.get('/notifications', adminController.getNotifications);
router.get('/notifications/stats', adminController.getNotificationStats);
router.post('/notifications/send', adminController.sendNotification);

// Sync Logs (for Settings import history)
router.get('/sync-logs', adminController.getSyncLogs);

// System Settings
router.get('/settings', adminController.getSettings);
router.put('/settings', adminController.updateSettings);

// Donations & Campaign Management
router.get('/donations/campaigns', adminController.getDonationCampaigns);
router.post('/donations/campaigns', adminController.createDonationCampaign);
router.put('/donations/campaigns/:id', adminController.updateDonationCampaign);
router.delete('/donations/campaigns/:id', adminController.deleteDonationCampaign);
router.get('/donations/donors', adminController.getDonorsList);

export default router;
