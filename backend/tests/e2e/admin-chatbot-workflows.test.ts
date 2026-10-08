import request from 'supertest';
import app from '../../src/app';
import { generateAccessToken } from '../../src/core/utils/jwt.utils';
import prisma, { initPrisma } from '../../src/core/config/db';
import { Role } from '@prisma/client';
import { OpenRouterService } from '../../src/modules/ai/infrastructure/services/OpenRouterService';

import { invalidateUserBanCache } from '../../src/core/middleware/auth.middleware';

jest.mock('../../src/modules/ai/infrastructure/services/OpenRouterService');
jest.setTimeout(60000);

describe('Admin Chatbot E2E Workflows', () => {
  let adminToken: string;

  beforeAll(async () => {
    await initPrisma();
    
    await prisma.user.upsert({
      where: { id: 'admin-uuid' },
      update: {},
      create: {
        id: 'admin-uuid',
        email: 'admin@astu.edu.et',
        password: 'securePassword123',
        role: Role.ADMIN,
        isActive: true,
      },
    });
    invalidateUserBanCache('admin-uuid');

    adminToken = generateAccessToken({
      userId: 'admin-uuid',
      email: 'admin@astu.edu.et',
      role: Role.ADMIN,
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('Workflow 1: Admin asks "What is the employment rate?"', async () => {
    const mockGenerateJson = OpenRouterService.generateJson as jest.Mock;
    const mockGenerateText = OpenRouterService.generateText as jest.Mock;

    mockGenerateJson.mockResolvedValue({ intent: 'employment' });
    mockGenerateText.mockResolvedValue('Overall graduate employment rate is 80.0%. Software Engineering is highest at 100.0%.');

    const res = await request(app)
      .post('/api/ai/chat')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ message: 'What is the employment rate?' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.intent).toBe('employment');
    expect(res.body.data.response).toContain('80.0%');
    expect(res.body.data.response).toContain('Software Engineering');
  });

  it('Workflow 2: Admin asks "Compare CS and Software Engineering"', async () => {
    const mockGenerateJson = OpenRouterService.generateJson as jest.Mock;
    const mockGenerateText = OpenRouterService.generateText as jest.Mock;

    mockGenerateJson.mockResolvedValue({ intent: 'department' });
    mockGenerateText.mockResolvedValue(
      'Comparing Software Engineering (SWE) and Computer Science (ECE):\n' +
      '- SWE: 100% employment rate, average salary 28,000 ETB.\n' +
      '- ECE: 50% employment rate, average salary 22,000 ETB.'
    );

    const res = await request(app)
      .post('/api/ai/chat')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ message: 'Compare CS and Software Engineering' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.intent).toBe('department');
    expect(res.body.data.response).toContain('SWE: 100%');
    expect(res.body.data.response).toContain('ECE: 50%');
  });

  it('Workflow 3: Admin asks "Generate accreditation report"', async () => {
    const mockGenerateJson = OpenRouterService.generateJson as jest.Mock;
    const mockGenerateText = OpenRouterService.generateText as jest.Mock;

    mockGenerateJson.mockResolvedValue({ intent: 'report' });
    mockGenerateText.mockResolvedValue('### ACCREDITATION REPORT\nETA Standards have been fully achieved with 80% employment.');

    // 1. Chatbot endpoint workflow
    const chatRes = await request(app)
      .post('/api/ai/chat')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ message: 'Generate accreditation report' });

    expect(chatRes.status).toBe(200);
    expect(chatRes.body.data.intent).toBe('report');

    // 2. Direct PDF download endpoint workflow
    const pdfRes = await request(app)
      .post('/api/ai/reports/accreditation')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(pdfRes.status).toBe(200);
    expect(pdfRes.header['content-type']).toBe('application/pdf');
    expect(pdfRes.header['content-disposition']).toContain('accreditation_report.pdf');
  });
});
