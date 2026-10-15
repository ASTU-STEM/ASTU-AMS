import { Router, Request, Response, NextFunction } from 'express';
import { AdminController } from '../controllers/AdminController';
import { authenticateJWT } from '../../../../core/middleware/auth.middleware';
import { Role } from '@prisma/client';

const router = Router();
const adminController = new AdminController();

// Read-only reference data needed by the Alumni Office CMS notification center.
// CMS staff roles are served here; all other roles fall through to the main
// admin router so its stricter role + permission checks remain in force.
const cmsStaffRoles = ['CMS_MANAGER', Role.ALUMNI_OFFICE];

const cmsStaffOnly = (req: Request, res: Response, next: NextFunction) => {
  const role = (req as any).user?.role;
  if (cmsStaffRoles.includes(role)) return next();
  return next('router');
};

router.use(authenticateJWT, cmsStaffOnly);

router.get('/notifications', adminController.getNotifications);
router.get('/notifications/stats', adminController.getNotificationStats);
router.get('/departments', adminController.getDepartments);
router.get('/users', adminController.getUsers);

export default router;
