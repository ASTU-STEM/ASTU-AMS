import request from 'supertest';
import app from '../../src/app';
import { generateAccessToken } from '../../src/core/utils/jwt.utils';
import prisma, { initPrisma } from '../../src/core/config/db';
import { Role } from '@prisma/client';
import { describe } from 'node:test';
import { beforeAll,afterAll, jest, it, expect } from '@jest/globals';

jest.setTimeout(60000);

describe('Traditional Analytics API Integration Tests', () => {
  let adminToken: string;
  let alumniToken: string;

  beforeAll(async () => {
    await initPrisma();
    
    // Clear analytics cache to prevent stale test cache interfering with test expectations
    await prisma.analyticsCache.deleteMany({});
    
    // Generate valid test JWTs using utility
    adminToken = generateAccessToken({
      userId: 'test-admin-uuid',
      email: 'admin@astu.edu.et',
      role: Role.ADMIN,
    });

    alumniToken = generateAccessToken({
      userId: 'test-alumni-uuid',
      email: 'alice@alumni.com',
      role: Role.ALUMNI,
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('GET /api/analytics/dashboard', () => {
    it('should retrieve overall dashboard analytics when requested by admin', async () => {
      const res = await request(app)
        .get('/api/analytics/dashboard')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.overallEmployment).toBeDefined();
      expect(res.body.data.skills).toBeDefined();
      expect(res.body.data.departments).toBeDefined();
    });

    it('should return 401 when request is unauthenticated', async () => {
      const res = await request(app).get('/api/analytics/dashboard');
      expect(res.status).toBe(401);
    });

    it('should return 403 when request is made by a student alumni', async () => {
      const res = await request(app)
        .get('/api/analytics/dashboard')
        .set('Authorization', `Bearer ${alumniToken}`);
      
      expect(res.status).toBe(403);
    });
  });

  describe('Other Analytics Endpoints', () => {
    it('GET /api/analytics/employment should succeed', async () => {
      const res = await request(app)
        .get('/api/analytics/employment')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.data.employmentRate).toBeDefined();
    });

    it('GET /api/analytics/employers should succeed', async () => {
      const res = await request(app)
        .get('/api/analytics/employers')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.data.topHiringCompanies).toBeDefined();
    });

    it('GET /api/analytics/departments should succeed', async () => {
      const res = await request(app)
        .get('/api/analytics/departments')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.data.departmentMetrics).toBeDefined();
    });

    it('GET /api/analytics/skills should succeed', async () => {
      const res = await request(app)
        .get('/api/analytics/skills')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.data.skillGaps).toBeDefined();
    });

    it('GET /api/analytics/tracer should succeed', async () => {
      const res = await request(app)
        .get('/api/analytics/tracer')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.data.surveyCompletionRate).toBeDefined();
    });

    it('GET /api/analytics/insights should succeed', async () => {
      const res = await request(app)
        .get('/api/analytics/insights')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('GET /api/analytics/recommendations should succeed', async () => {
      const res = await request(app)
        .get('/api/analytics/recommendations')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });
});
