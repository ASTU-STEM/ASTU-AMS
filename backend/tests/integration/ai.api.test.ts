import request from 'supertest';
import app from '../../src/app';
import { generateAccessToken } from '../../src/core/utils/jwt.utils';
import prisma, { initPrisma } from '../../src/core/config/db';
import { Role } from '@prisma/client';
import { OpenRouterService } from '../../src/modules/ai/infrastructure/services/OpenRouterService';

jest.mock('../../src/modules/ai/infrastructure/services/OpenRouterService');
jest.setTimeout(60000);

describe('AI API Integration Tests', () => {
  let adminToken: string;
  let alumniToken: string;

  beforeAll(async () => {
    await initPrisma();
    
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

    // Mock OpenRouter responses to prevent actual internet calls
    const mockGenerateJson = OpenRouterService.generateJson as jest.Mock;
    const mockGenerateText = OpenRouterService.generateText as jest.Mock;

    mockGenerateJson.mockResolvedValue({ intent: 'employment' });
    mockGenerateText.mockResolvedValue('Mocked response content from AI Agent.');
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('POST /api/ai/chat', () => {
    it('should run chatbot workflow and return AI response when authorized', async () => {
      const res = await request(app)
        .post('/api/ai/chat')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ message: 'What is the overall employment rate?' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.intent).toBe('employment');
      expect(res.body.data.response).toContain('Mocked response content');
    });

    it('should return 401 when request is unauthenticated', async () => {
      const res = await request(app)
        .post('/api/ai/chat')
        .send({ message: 'Hello' });

      expect(res.status).toBe(401);
    });

    it('should return 403 when request is made by standard alumni', async () => {
      const res = await request(app)
        .post('/api/ai/chat')
        .set('Authorization', `Bearer ${alumniToken}`)
        .send({ message: 'Hello' });

      expect(res.status).toBe(403);
    });
  });

  describe('POST /api/ai/insights', () => {
    it('should generate executive insights summary', async () => {
      const res = await request(app)
        .post('/api/ai/insights')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.insights).toBeDefined();
    });
  });

  describe('POST /api/ai/reports/ PDF Endpoints', () => {
    it('POST /api/ai/reports/executive should download PDF', async () => {
      const res = await request(app)
        .post('/api/ai/reports/executive')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.header['content-type']).toBe('application/pdf');
      expect(res.header['content-disposition']).toContain('executive');
    });

    it('POST /api/ai/reports/tracer should download PDF', async () => {
      const res = await request(app)
        .post('/api/ai/reports/tracer')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.header['content-type']).toBe('application/pdf');
      expect(res.header['content-disposition']).toContain('tracer');
    });

    it('POST /api/ai/reports/accreditation should download PDF', async () => {
      const res = await request(app)
        .post('/api/ai/reports/accreditation')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.header['content-type']).toBe('application/pdf');
      expect(res.header['content-disposition']).toContain('accreditation');
    });

    it('POST /api/ai/reports/curriculum should download PDF', async () => {
      const res = await request(app)
        .post('/api/ai/reports/curriculum')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.header['content-type']).toBe('application/pdf');
      expect(res.header['content-disposition']).toContain('curriculum');
    });
  });
});
