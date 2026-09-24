import { StartDiditSession } from '../application/use-cases/StartDiditSession';
import { GetDiditStatus } from '../application/use-cases/GetDiditStatus';
import { VerifyAlumniNationalId } from '../application/use-cases/VerifyAlumniNationalId';
import { DiditService, diditService } from '../infrastructure/services/DiditService';
import prisma from '../../../core/config/db';

describe('Didit & National ID Verification Suite', () => {
  const testStudentId = `UGR/TEST/9999_${Date.now()}`;
  const testEmail = `didit_test_${Date.now()}@alumni.astu.edu.et`;
  let createdProfileId: string;

  beforeAll(async () => {
    // Seed an inactive alumni profile with pending password for verification tests
    const bcrypt = require('bcryptjs');
    const hash = await bcrypt.hash('Password123!', 10);

    const profile = await prisma.alumniProfile.create({
      data: {
        studentId: testStudentId,
        fullName: 'Abebe Kebede Worku',
        email: testEmail,
        status: 'INACTIVE',
        isVerified: false,
        pendingPasswordHash: hash,
        departmentId: 'dept-swe',
        graduationYear: 2025,
        cgpa: 3.8,
        gender: 'MALE',
      } as any,
    });
    createdProfileId = profile.id;
  });

  afterAll(async () => {
    // Cleanup test records from PostgreSQL
    if (createdProfileId) {
      await prisma.alumniProfile.delete({ where: { id: createdProfileId } }).catch(() => {});
      await prisma.user.deleteMany({ where: { email: testEmail } }).catch(() => {});
    }
  });

  describe('DiditService Infrastructure', () => {
    it('should initialize with correct API headers', () => {
      const customService = new DiditService('https://api.didit.me/v1', 'test_key_123');
      expect(customService).toBeDefined();
    });

    it('should validate National ID in mock mode correctly', () => {
      const result = diditService.mockVerifyNationalId('ETH-987654321', 'Abebe Kebede Worku');
      expect(result.valid).toBe(true);
      expect(result.name).toBe('Abebe Kebede Worku');

      const invalidResult = diditService.mockVerifyNationalId('', 'Unknown');
      expect(invalidResult.valid).toBe(false);
    });
  });

  describe('StartDiditSession UseCase', () => {
    it('should throw error for non-existent student ID', async () => {
      const startSession = new StartDiditSession();
      await expect(startSession.execute('NON_EXISTENT_ID')).rejects.toThrow(
        'Student ID not found in alumni records.'
      );
    });

    it('should create session and return verificationUrl for valid student ID', async () => {
      const startSession = new StartDiditSession();
      const res = await startSession.execute(testStudentId);

      expect(res.sessionId).toBeDefined();
      expect(res.verificationUrl).toContain(res.sessionId);
      expect(res.message).toBe('Didit session initialized.');

      // Check session in AnalyticsCache
      const cache = await prisma.analyticsCache.findUnique({
        where: { key: `didit_${res.sessionId}` },
      });
      expect(cache).toBeDefined();
      expect((cache?.data as any)?.studentId).toBe(testStudentId);

      // Cleanup test session cache
      await prisma.analyticsCache.delete({ where: { key: `didit_${res.sessionId}` } });
    });
  });

  describe('GetDiditStatus UseCase (Polling Flow)', () => {
    let activeSessionId: string;

    beforeEach(async () => {
      await prisma.alumniProfile.update({
        where: { id: createdProfileId },
        data: { status: 'INACTIVE', isVerified: false, userId: null, pendingPasswordHash: 'hash123' },
      });
      const startSession = new StartDiditSession();
      const res = await startSession.execute(testStudentId);
      activeSessionId = res.sessionId;
    });

    afterEach(async () => {
      if (activeSessionId) {
        await prisma.analyticsCache.deleteMany({ where: { key: `didit_${activeSessionId}` } });
      }
    });

    it('should return processing on first poll', async () => {
      const getStatus = new GetDiditStatus();
      const res = await getStatus.execute(activeSessionId);

      expect(res.status).toBe('processing');
      expect(res.message).toBe('Verification in progress...');
    });

    it('should complete verification and activate account when scanned National ID name matches', async () => {
      // Re-set profile to INACTIVE
      await prisma.alumniProfile.update({
        where: { id: createdProfileId },
        data: { status: 'INACTIVE', isVerified: false, userId: null, pendingPasswordHash: 'hash123' },
      });

      const getStatus = new GetDiditStatus();
      const res = await getStatus.execute(activeSessionId, 'Abebe Kebede Worku');

      expect(res.status).toBe('success');
      expect(res.message).toContain('National ID verified successfully');

      const profile = await prisma.alumniProfile.findUnique({
        where: { studentId: testStudentId },
        include: { user: true },
      });

      expect(profile?.status).toBe('ACTIVE');
      expect(profile?.isVerified).toBe(true);
      expect(profile?.verificationChannel).toBe('NATIONAL_ID');
      expect(profile?.user).toBeDefined();
    });

    it('should reject verification if scanned National ID name does not match alumni record', async () => {
      // Re-set profile to INACTIVE
      await prisma.alumniProfile.update({
        where: { id: createdProfileId },
        data: { status: 'INACTIVE', isVerified: false, userId: null, pendingPasswordHash: 'hash123' },
      });

      const getStatus = new GetDiditStatus();
      const res = await getStatus.execute(activeSessionId, 'Unknown Random Name');

      expect(res.status).toBe('failed');
      expect(res.message).toContain('does not match alumni record');
    });
  });

  describe('VerifyAlumniNationalId UseCase (Direct Verification)', () => {
    beforeEach(async () => {
      await prisma.alumniProfile.update({
        where: { id: createdProfileId },
        data: { status: 'INACTIVE', isVerified: false, userId: null, pendingPasswordHash: 'hash123' },
      });
    });

    it('should reject verification if names do not match', async () => {
      const userRepoMock: any = { create: jest.fn(), update: jest.fn() };
      const verifyUseCase = new VerifyAlumniNationalId(userRepoMock);

      const mockDiditService = {
        verifyNationalId: jest.fn().mockResolvedValue({
          valid: true,
          name: 'Mismatched Name',
        }),
      };

      await expect(
        verifyUseCase.execute(
          { studentId: testStudentId, nationalId: 'ETH-12345' },
          mockDiditService
        )
      ).rejects.toThrow('Name in national ID does not match alumni record.');
    });

    it('should verify and activate account when name matches', async () => {
      // Re-set profile to INACTIVE for direct verification test
      await prisma.alumniProfile.update({
        where: { id: createdProfileId },
        data: { status: 'INACTIVE', isVerified: false, pendingPasswordHash: 'hash123' },
      });

      const userRepoMock: any = {
        create: jest.fn().mockResolvedValue({ id: 'u_123', email: testEmail }),
        update: jest.fn().mockResolvedValue({ id: 'u_123', email: testEmail }),
      };

      const verifyUseCase = new VerifyAlumniNationalId(userRepoMock);

      const mockDiditService = {
        verifyNationalId: jest.fn().mockResolvedValue({
          valid: true,
          name: 'Abebe Kebede Worku',
        }),
      };

      const result = await verifyUseCase.execute(
        { studentId: testStudentId, nationalId: 'ETH-987654321', password: 'Password123!' },
        mockDiditService
      );

      expect(result.status).toBe('ACTIVE');
      expect(result.message).toContain('National ID verification succeeded.');

      const updatedProfile = await prisma.alumniProfile.findUnique({
        where: { id: createdProfileId },
      });

      expect(updatedProfile?.status).toBe('ACTIVE');
      expect(updatedProfile?.isVerified).toBe(true);
      expect(updatedProfile?.verificationChannel).toBe('NATIONAL_ID');
    });
  });
});
