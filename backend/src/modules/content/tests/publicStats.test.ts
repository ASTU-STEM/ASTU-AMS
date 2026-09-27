import express from 'express';
import request from 'supertest';

import { getPublicStatsController } from '../presentation/content.controller';

/**
 * The public landing page used to render hand-entered figures from the CMS
 * ("1,238+ alumni members", "24,000+ global alumni", "87% employment rate").
 * Those numbers are now counted from real rows, so this suite pins the three
 * properties the landing page depends on:
 *
 *  1. the endpoint is reachable without any credentials,
 *  2. every figure is a non-negative integer,
 *  3. zero-valued keys are omitted so the section can hide itself.
 */

jest.mock('../../../core/config/db', () => ({
  __esModule: true,
  default: {
    alumniProfile: { count: jest.fn() },
    employerProfile: { count: jest.fn() },
    job: { count: jest.fn() },
    department: { count: jest.fn() },
  },
}));

// eslint-disable-next-line @typescript-eslint/no-var-requires
const prisma = require('../../../core/config/db').default;

const buildApp = () => {
  const app = express();
  app.get('/api/content/public-stats', getPublicStatsController);
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  app.use((err: any, _req: any, res: any, _next: any) =>
    res.status(500).json({ success: false, message: err?.message })
  );
  return app;
};

describe('GET /api/content/public-stats', () => {
  beforeEach(() => jest.clearAllMocks());

  it('serves anonymous callers with no token', async () => {
    (prisma.alumniProfile.count as jest.Mock).mockResolvedValue(47);
    (prisma.employerProfile.count as jest.Mock).mockResolvedValue(3);
    (prisma.job.count as jest.Mock).mockResolvedValue(67);
    (prisma.department.count as jest.Mock).mockResolvedValue(4);

    const res = await request(buildApp()).get('/api/content/public-stats');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('counts active alumni, verified employers, published jobs and departments', async () => {
    (prisma.alumniProfile.count as jest.Mock).mockResolvedValue(47);
    (prisma.employerProfile.count as jest.Mock).mockResolvedValue(3);
    (prisma.job.count as jest.Mock).mockResolvedValue(67);
    (prisma.department.count as jest.Mock).mockResolvedValue(4);

    await request(buildApp()).get('/api/content/public-stats');

    expect(prisma.alumniProfile.count).toHaveBeenCalledWith({ where: { status: 'ACTIVE' } });
    expect(prisma.employerProfile.count).toHaveBeenCalledWith({ where: { isVerified: true } });
    expect(prisma.job.count).toHaveBeenCalledWith({
      where: { isActive: true, status: 'PUBLISHED' },
    });
  });

  it('omits any figure that is zero so the landing band can hide itself', async () => {
    (prisma.alumniProfile.count as jest.Mock).mockResolvedValue(47);
    (prisma.employerProfile.count as jest.Mock).mockResolvedValue(0);
    (prisma.job.count as jest.Mock).mockResolvedValue(67);
    (prisma.department.count as jest.Mock).mockResolvedValue(4);

    const res = await request(buildApp()).get('/api/content/public-stats');

    const keys = res.body.data.map((s: any) => s.key);
    expect(keys).toEqual(['alumni', 'jobs', 'departments']);
    expect(keys).not.toContain('employers');
  });

  it('returns an empty list rather than zeros when the platform has no data', async () => {
    (prisma.alumniProfile.count as jest.Mock).mockResolvedValue(0);
    (prisma.employerProfile.count as jest.Mock).mockResolvedValue(0);
    (prisma.job.count as jest.Mock).mockResolvedValue(0);
    (prisma.department.count as jest.Mock).mockResolvedValue(0);

    const res = await request(buildApp()).get('/api/content/public-stats');

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
  });

  it('never emits a non-integer or negative figure', async () => {
    (prisma.alumniProfile.count as jest.Mock).mockResolvedValue(0);
    (prisma.employerProfile.count as jest.Mock).mockResolvedValue(2);
    (prisma.job.count as jest.Mock).mockResolvedValue(0);
    (prisma.department.count as jest.Mock).mockResolvedValue(0);

    const res = await request(buildApp()).get('/api/content/public-stats');

    for (const stat of res.body.data) {
      expect(Number.isInteger(stat.value)).toBe(true);
      expect(stat.value).toBeGreaterThan(0);
    }
  });

  it('survives a delegate that the dev database does not implement', async () => {
    (prisma.alumniProfile.count as jest.Mock).mockRejectedValue(new Error('not supported'));
    (prisma.employerProfile.count as jest.Mock).mockResolvedValue(0);
    (prisma.job.count as jest.Mock).mockResolvedValue(12);
    (prisma.department.count as jest.Mock).mockResolvedValue(0);

    const res = await request(buildApp()).get('/api/content/public-stats');

    // A broken counter degrades to "omitted", it never fabricates a number.
    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([{ key: 'jobs', value: 12 }]);
  });
});
