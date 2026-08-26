import request from 'supertest';
import app from '../../src/app';
import { generateAccessToken } from '../../src/core/utils/jwt.utils';
import prisma, { initPrisma } from '../../src/core/config/db';
import { Role } from '@prisma/client';

jest.setTimeout(60000);

describe('Analysis Engine E2E Workflows', () => {
  let adminToken: string;

  beforeAll(async () => {
    await initPrisma();

    adminToken = generateAccessToken({
      userId: 'analytics-admin-user',
      email: 'admin.analytics@astu.edu.et',
      role: Role.ADMIN,
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('Flow: Fetch Executive Report -> Employment Stats -> Employer Stats -> Department Metrics -> Skills & Recommendations', async () => {
    // Step 1: Executive Dashboard Report
    const dashboardRes = await request(app)
      .get('/api/analytics/dashboard')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(dashboardRes.status).toBe(200);
    expect(dashboardRes.body.success).toBe(true);
    expect(dashboardRes.body.data.overallEmployment).toBeDefined();

    // Step 2: Employment Analytics
    const employmentRes = await request(app)
      .get('/api/analytics/employment')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(employmentRes.status).toBe(200);
    expect(employmentRes.body.success).toBe(true);
    expect(employmentRes.body.data.employmentRate).toBeDefined();

    // Step 3: Employer Partner Analytics
    const employersRes = await request(app)
      .get('/api/analytics/employers')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(employersRes.status).toBe(200);
    expect(employersRes.body.success).toBe(true);
    expect(employersRes.body.data.topHiringCompanies).toBeDefined();

    // Step 4: Department Breakdown Analytics
    const departmentRes = await request(app)
      .get('/api/analytics/departments')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(departmentRes.status).toBe(200);
    expect(departmentRes.body.success).toBe(true);
    expect(departmentRes.body.data.departmentMetrics).toBeDefined();

    // Step 5: Skills Supply vs Demand Analytics
    const skillsRes = await request(app)
      .get('/api/analytics/skills')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(skillsRes.status).toBe(200);
    expect(skillsRes.body.success).toBe(true);
    expect(skillsRes.body.data.skillGaps).toBeDefined();

    // Step 6: Strategic AI Insights & Recommendations
    const insightsRes = await request(app)
      .get('/api/analytics/insights')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(insightsRes.status).toBe(200);
    expect(insightsRes.body.success).toBe(true);

    const recRes = await request(app)
      .get('/api/analytics/recommendations')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(recRes.status).toBe(200);
    expect(recRes.body.success).toBe(true);
  });
});
