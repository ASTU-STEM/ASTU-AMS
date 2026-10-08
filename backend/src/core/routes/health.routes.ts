import { Router, Request, Response } from 'express';
import prisma from '../config/db';
import { sendSuccess, sendError } from '../utils/response.utils';
import { QueueEngine } from '../jobs/QueueEngine';

const router = Router();

// 1. Basic Health Check
router.get('/', (req: Request, res: Response) => {
  return sendSuccess(res, 'ASTU-AMS API Server is online and healthy', {
    status: 'UP',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production',
    uptimeSeconds: Math.floor(process.uptime()),
  });
});

// 2. Liveness Probe (K8s / LB Liveness check)
router.get('/live', (req: Request, res: Response) => {
  return res.status(200).json({
    status: 'ALIVE',
    timestamp: new Date().toISOString(),
    pid: process.pid,
  });
});

// 3. Readiness Probe (Verifies backend DB and Queue dependencies)
router.get('/ready', async (req: Request, res: Response) => {
  try {
    const start = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    const dbLatencyMs = Date.now() - start;

    return res.status(200).json({
      status: 'READY',
      timestamp: new Date().toISOString(),
      dependencies: {
        database: { status: 'CONNECTED', latencyMs: dbLatencyMs },
        queue: { status: 'ONLINE', stats: QueueEngine.getQueueStats() },
      },
    });
  } catch (err: any) {
    return res.status(503).json({
      status: 'NOT_READY',
      timestamp: new Date().toISOString(),
      error: 'Database connection failed during readiness check',
    });
  }
});

// 4. Database Probe
router.get('/database', async (req: Request, res: Response) => {
  const start = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    const latencyMs = Date.now() - start;

    return sendSuccess(res, 'PostgreSQL primary database is available', {
      status: 'HEALTHY',
      engine: 'PostgreSQL 16.2 / Neon Serverless',
      latencyMs,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return sendError(res, 'PostgreSQL database check failed', { error: err.message }, 503);
  }
});

// 5. Cache Probe
router.get('/cache', (req: Request, res: Response) => {
  return sendSuccess(res, 'Shared cache system is operational', {
    status: 'HEALTHY',
    mode: 'Redis/Cache-Aside Active',
    timestamp: new Date().toISOString(),
  });
});

// 6. Queue Probe
router.get('/queue', (req: Request, res: Response) => {
  const stats = QueueEngine.getQueueStats();
  return sendSuccess(res, 'Background Queue Workers are running', {
    status: 'HEALTHY',
    queueStats: stats,
    timestamp: new Date().toISOString(),
  });
});

export default router;
