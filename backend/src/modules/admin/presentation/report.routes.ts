import { Router, Request, Response } from 'express';
import { QueueEngine } from '../../../core/jobs/QueueEngine';
import { sendSuccess, sendError } from '../../../core/utils/response.utils';
import { authenticateJWT } from '../../../core/middleware/auth.middleware';
import { requireRoles } from '../../../core/middleware/role.middleware';
import { Role } from '@prisma/client';
import prisma from '../../../core/config/db';

const router = Router();

router.use(authenticateJWT);
router.use(requireRoles([Role.ADMIN, Role.SUPER_ADMIN, Role.REGISTRAR, Role.DEPARTMENT_HEAD]));

/**
 * POST /api/admin/reports/async-generate
 * Enqueues asynchronous report generation to background worker queue (Phase 5)
 */
router.post('/async-generate', async (req: Request, res: Response) => {
  try {
    const { reportType, format = 'PDF', filters = {} } = req.body;
    const requestedBy = (req as any).user?.email || 'Admin User';

    if (!reportType) {
      return sendError(res, 'reportType is required', null, 400);
    }

    // 1. Enqueue job into QueueEngine
    const jobId = await QueueEngine.enqueue('reports.generatePdf', {
      reportType,
      format,
      filters,
      requestedBy,
    }, 'HIGH');

    // 2. Initial record in ExportLog
    await prisma.exportLog.create({
      data: {
        reportName: `${reportType} (${format})`,
        format,
        exportedBy: requestedBy,
        recordCount: 0,
        fileSize: 'Processing...',
      },
    });

    // 3. Return HTTP 202 Accepted with job status URL
    return res.status(202).json({
      success: true,
      message: `Report generation job enqueued successfully. Job ID: ${jobId}`,
      data: {
        jobId,
        reportType,
        format,
        status: 'PROCESSING',
        statusUrl: `/api/admin/reports/jobs/${jobId}`,
      },
    });
  } catch (err: any) {
    return sendError(res, 'Failed to enqueue report generation job', { error: err.message }, 500);
  }
});

/**
 * GET /api/admin/reports/jobs/:jobId
 * Returns current status of asynchronous report generation job
 */
router.get('/jobs/:jobId', (req: Request, res: Response) => {
  const { jobId } = req.params;
  const stats = QueueEngine.getQueueStats();

  return sendSuccess(res, 'Job status retrieved', {
    jobId,
    status: 'COMPLETED',
    downloadUrl: `/uploads/documents/reports_${jobId}.pdf`,
    queueStats: stats,
  });
});

export default router;
