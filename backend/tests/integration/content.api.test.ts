import request from 'supertest';
import app from '../../src/app';
import { generateAccessToken } from '../../src/core/utils/jwt.utils';
import prisma, { initPrisma } from '../../src/core/config/db';
import { Role } from '@prisma/client';

jest.setTimeout(60000);

describe('Content & CMS API Integration Tests', () => {
  let adminToken: string;
  let alumniToken: string;
  let testContentId: string;
  const testSlug = `test-article-${Date.now()}`;

  beforeAll(async () => {
    await initPrisma();

    adminToken = generateAccessToken({
      userId: 'test-admin-uuid',
      email: 'admin@astu.edu.et',
      role: Role.ADMIN,
    });

    alumniToken = generateAccessToken({
      userId: 'test-alumni-uuid',
      email: 'alumni@astu.edu.et',
      role: Role.ALUMNI,
    });
  });

  afterAll(async () => {
    // Cleanup any created content
    if (testContentId) {
      try {
        await (prisma as any).contentItem.delete({ where: { id: testContentId } });
      } catch {
        // Ignore if already deleted
      }
    }
    await prisma.$disconnect();
  });

  describe('GET /api/content', () => {
    it('should retrieve a list of content items', async () => {
      const res = await request(app).get('/api/content');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body).toHaveProperty('total');
    });

    it('should support querying with filters (limit, status, type)', async () => {
      const res = await request(app)
        .get('/api/content?limit=5&status=Published&type=announcement');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe('POST /api/content', () => {
    it('should create a new content item', async () => {
      const payload = {
        title: 'Integration Test Announcement',
        slug: testSlug,
        type: 'announcement',
        status: 'Draft',
        excerpt: 'A brief summary of the test announcement.',
        body: 'Full body content for testing purposes.',
        category: 'Campus News',
        author: 'Content Test Suite',
        pinned: false,
        featured: false,
        tags: ['test', 'integration'],
      };

      const res = await request(app)
        .post('/api/content')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(payload);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      testContentId = res.body.data.id;

      expect(res.body.data.title).toBe(payload.title);
      expect(res.body.data.slug).toBe(payload.slug);
      expect(res.body.data.status.toUpperCase()).toBe('DRAFT');
    });

    it('should reject creating content with invalid schema', async () => {
      const invalidPayload = {
        // Missing required title
        type: 'announcement',
      };

      const res = await request(app)
        .post('/api/content')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidPayload);

      expect(res.status).toBeGreaterThanOrEqual(400);
    });
  });

  describe('GET /api/content/:id', () => {
    it('should retrieve a content item by ID or Slug', async () => {
      expect(testContentId).toBeDefined();

      const res = await request(app).get(`/api/content/${testContentId}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(testContentId);
    });
  });

  describe('PUT /api/content/:id', () => {
    it('should update an existing content item', async () => {
      expect(testContentId).toBeDefined();

      const updatePayload = {
        title: 'Updated Integration Test Announcement',
        status: 'Published',
        pinned: true,
      };

      const res = await request(app)
        .put(`/api/content/${testContentId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updatePayload);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe(updatePayload.title);
      expect(res.body.data.status.toUpperCase()).toBe('PUBLISHED');
      expect(res.body.data.pinned).toBe(true);
    });
  });

  describe('Homepage CMS Configuration Endpoints', () => {
    it('GET /api/content/homepage/config should return homepage config', async () => {
      const res = await request(app).get('/api/content/homepage/config');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
    });

    it('PUT /api/content/homepage/config should update homepage config', async () => {
      const configPayload = {
        heroSlides: [
          {
            id: 'slide-1',
            title: 'Welcome to ASTU Alumni Portal',
            subtitle: 'Empowering future innovators',
            active: true,
          },
        ],
        stats: {
          graduates: '45,000+',
          chapters: '12',
        },
        partners: [],
      };

      const res = await request(app)
        .put('/api/content/homepage/config')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(configPayload);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.heroSlides).toBeDefined();
    });
  });

  describe('Media Assets Endpoints', () => {
    it('GET /api/content/media should return media asset list', async () => {
      const res = await request(app).get('/api/content/media');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe('DELETE /api/content/:id', () => {
    it('should delete the content item', async () => {
      expect(testContentId).toBeDefined();

      const res = await request(app)
        .delete(`/api/content/${testContentId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      // Verify it is gone
      const verifyRes = await request(app).get(`/api/content/${testContentId}`);
      expect(verifyRes.status).toBe(404);

      testContentId = '';
    });
  });
});
