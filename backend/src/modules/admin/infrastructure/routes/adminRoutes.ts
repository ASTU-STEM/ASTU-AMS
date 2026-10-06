import { Router } from 'express';
import { AdminController } from '../controllers/AdminController';
import { TechnicalOpsController } from '../controllers/TechnicalOpsController';
import { authenticateJWT, optionalAuthenticateJWT } from '../../../../core/middleware/auth.middleware';
import { requireRoles, requirePermission } from '../../../../core/middleware/role.middleware';
import { Role } from '@prisma/client';

const router = Router();
const adminController = new AdminController();
const techOpsController = new TechnicalOpsController();

// Open/optional auth endpoint for recording audit logs across all 6 portals
router.post('/audit-log', optionalAuthenticateJWT, adminController.createAuditLog);

// SUPER_ADMIN and ADMIN roles can access these admin routes
router.use(authenticateJWT, requireRoles([Role.SUPER_ADMIN, Role.ADMIN, 'SUPER_ADMIN', 'ADMIN']));

router.get('/profile', adminController.getProfile);
router.put('/profile', adminController.updateProfile);
router.put('/profile/security', adminController.updateSecurity);

router.get('/dashboard/metrics', requirePermission('view_dashboard'), adminController.getDashboardMetrics);
router.get('/sidebar-stats', adminController.getSidebarStats);
router.get('/roles/stats', adminController.getRoleStats);
router.get('/roles/permissions', adminController.getRolePermissions);
router.put('/roles/permissions', requirePermission('manage_roles'), adminController.updateRolePermissions);

router.get('/users', requirePermission('view_users'), adminController.getUsers);
router.post('/users', requirePermission('create_users'), adminController.createUser);
router.put('/users/:id', requirePermission('edit_users'), adminController.updateUser);
router.put('/users/bulk/status', requirePermission('suspend_users'), adminController.bulkUpdateStatus);
router.put('/users/:id/status', requirePermission('suspend_users'), adminController.updateUserStatus);
router.put('/users/:id/notes', requirePermission('edit_users'), adminController.updateUserNotes);
router.post('/users/:id/reset-password', requirePermission('edit_users'), adminController.resetPassword);
router.delete('/users/:id', requirePermission('suspend_users'), adminController.deleteUser);

// Technical Operations & System Controls (ICT Admin Portal)
router.get('/technical-ops/telemetry', techOpsController.getTelemetry);
router.get('/technical-ops/telemetry/live', techOpsController.getLiveTelemetry);
router.get('/technical-ops/security-governance', techOpsController.getSecurityGovernance);
router.put('/technical-ops/security-governance', techOpsController.updateSecurityGovernance);
router.get('/technical-ops/security', techOpsController.getSecurityStatus);
router.post('/technical-ops/security/owasp-scan', techOpsController.runOwaspScan);
router.post('/technical-ops/security/break-glass', techOpsController.elevateBreakGlass);
router.post('/technical-ops/security/block-ip', techOpsController.blockIp);
router.post('/technical-ops/security/unblock-ip', techOpsController.unblockIp);
router.get('/technical-ops/load-balancer', techOpsController.getLoadBalancer);
router.get('/technical-ops/api-gateway', techOpsController.getApiGateway);
router.get('/technical-ops/db-diagnostics', techOpsController.getDatabaseDiagnostics);
router.get('/technical-ops/incidents', techOpsController.getIncidents);
router.get('/technical-ops/feature-flags', techOpsController.getFeatureFlags);
router.put('/technical-ops/feature-flags', techOpsController.updateFeatureFlag);
router.post('/technical-ops/action', techOpsController.executeAction);

// Department Routes
router.get('/departments', adminController.getDepartments);
router.get('/departments/analysis', adminController.getDepartmentAnalysis);
router.get('/departments/:id', adminController.getDepartmentDetails);
router.post('/departments', adminController.createDepartment);
router.put('/departments/:id', adminController.updateDepartment);
router.delete('/departments/:id', adminController.deleteDepartment);

router.get('/jobs', requirePermission('view_jobs'), adminController.getJobs);
router.get('/jobs/applications', requirePermission('view_jobs'), adminController.getJobApplications);
router.put('/jobs/applications/bulk-status', requirePermission('approve_jobs'), adminController.bulkUpdateJobApplicationStatus);
router.put('/jobs/applications/:id/status', requirePermission('approve_jobs'), adminController.updateJobApplicationStatus);
router.get('/jobs/analytics', requirePermission('view_jobs'), adminController.getJobAnalytics);
router.post('/jobs', requirePermission('approve_jobs'), adminController.createJob);
router.put('/jobs/:id', requirePermission('approve_jobs'), adminController.updateJobDetails);
router.put('/jobs/:id/status', requirePermission('approve_jobs'), adminController.updateJobStatus);
router.delete('/jobs/:id', requirePermission('approve_jobs'), adminController.deleteJob);

// System Logs
router.get('/logs', requirePermission('view_universal_logs'), adminController.getLogs);
router.get('/logs/stats', adminController.getLogStats);

// Notifications
router.get('/notifications', adminController.getNotifications);
router.get('/notifications/stats', adminController.getNotificationStats);
router.post('/notifications/send', adminController.sendNotification);

// Sync Logs & Data Import (for Settings import history)
router.get('/sync-logs', adminController.getSyncLogs);
router.post('/data-import', requirePermission('edit_system_settings'), adminController.importData);

// System Settings
router.get('/settings/public', adminController.getPublicSettings);
router.get('/settings', requirePermission('view_system_settings'), adminController.getSettings);
router.put('/settings', requirePermission('edit_system_settings'), adminController.updateSettings);
router.post('/settings/test-integration', requirePermission('edit_system_settings'), adminController.testIntegration);

// Backup & Security Routes
router.get('/backup-security', adminController.getBackupSecurity);
router.post('/backup-security/run-backup', adminController.runDatabaseBackup);
router.post('/backup-security/session/revoke', adminController.revokeSession);
router.post('/backup-security/session/revoke-all', adminController.revokeAllSessions);
router.post('/backup-security/restore', adminController.restoreDatabaseBackup);
router.get('/backup-security/download', adminController.downloadDatabaseBackupFile);
router.post('/backup-security/api-key', adminController.createApiKey);
router.put('/backup-security/api-key/revoke', adminController.revokeApiKey);
router.put('/backup-security/whitelist', adminController.updateWhitelist);
router.put('/backup-security/config', adminController.updateBackupSecurityConfig);



// Donations & Campaign Management
router.get('/donations/campaigns', adminController.getDonationCampaigns);
router.post('/donations/campaigns', adminController.createDonationCampaign);
router.put('/donations/campaigns/:id', adminController.updateDonationCampaign);
router.delete('/donations/campaigns/:id', adminController.deleteDonationCampaign);
router.get('/donations/donors', adminController.getDonorsList);

// Module Governance Settings
router.get('/modules/governance', adminController.getModuleGovernance);
router.put('/modules/governance', adminController.updateModuleGovernance);

// Institutional Reports Center
router.get('/reports/metrics', adminController.getReportsMetrics);
router.get('/reports/data', adminController.getReportData);
router.post('/reports/export', adminController.recordReportExport);

export default router;
