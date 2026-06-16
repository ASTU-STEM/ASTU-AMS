import { Router } from 'express';
import { AdminController } from '../controllers/AdminController';
import { authenticateJWT } from '../../../../core/middleware/auth.middleware';
import { requireRoles } from '../../../../core/middleware/role.middleware';

const router = Router();
const adminController = new AdminController();

// Only ADMIN role can access these routes
router.use(authenticateJWT, requireRoles(['ADMIN']));

router.get('/dashboard/metrics', adminController.getDashboardMetrics);
router.get('/users', adminController.getUsers);
router.post('/users', adminController.createUser);
router.put('/users/bulk/status', adminController.bulkUpdateStatus);
router.put('/users/:id/status', adminController.updateUserStatus);
router.delete('/users/:id', adminController.deleteUser);

export default router;
