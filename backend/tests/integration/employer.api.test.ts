import request from 'supertest';
import app from '../../src/app';
import { generateAccessToken } from '../../src/core/utils/jwt.utils';
import prisma, { initPrisma } from '../../src/core/config/db';
import { Role, ApplicationStatus, JobStatus, InterviewStatus } from '@prisma/client';

jest.setTimeout(60000);

describe('Employer Portal API & Hiring Workflow Integration Tests', () => {
  let employerToken: string;
  let alumniToken: string;
  let adminToken: string;

  let testEmployerId: string;
  let testAlumniId: string;
  let testJobId: string;
  let testApplicationId: string;
  let testInterviewId: string;

  beforeAll(async () => {
    await initPrisma();

    // Generate tokens
    employerToken = generateAccessToken({
      userId: 'test-employer-user-uuid',
      email: 'employer-integration-test-hr@google.com',
      role: Role.EMPLOYER,
    });

    alumniToken = generateAccessToken({
      userId: 'test-alumni-user-uuid',
      email: 'alumni-integration-test-bob@alumni.com',
      role: Role.ALUMNI,
    });

    adminToken = generateAccessToken({
      userId: 'test-admin-user-uuid',
      email: 'admin@astu.edu.et',
      role: Role.ADMIN,
    });

    // Create a base department if not exists
    const dept = await prisma.department.upsert({
      where: { code: 'SWE' },
      update: {},
      create: { name: 'Software Engineering', code: 'SWE' },
    });

    // Setup base mock accounts
    await prisma.user.upsert({
      where: { id: 'test-employer-user-uuid' },
      update: {},
      create: {
        id: 'test-employer-user-uuid',
        email: 'employer-integration-test-hr@google.com',
        password: 'securePassword123',
        role: Role.EMPLOYER,
        isActive: true,
      },
    });
    // 1. Employer Profile
    const employerProfile = await prisma.employerProfile.upsert({
      where: { userId: 'test-employer-user-uuid' },
      update: {},
      create: {
        userId: 'test-employer-user-uuid',
        companyName: 'Google East Africa',
        industry: 'Technology',
        location: 'Addis Ababa',
        hrContact: 'HR Lead',
        website: 'https://google.com',
        description: 'Google office in Ethiopia',
        companySize: '11-50',
      },
    });
    testEmployerId = employerProfile.id;

    // 2. User & Alumni Profile
    await prisma.user.upsert({
      where: { id: 'test-alumni-user-uuid' },
      update: {},
      create: {
        id: 'test-alumni-user-uuid',
        email: 'alumni-integration-test-bob@alumni.com',
        password: 'securePassword123',
        role: Role.ALUMNI,
        isActive: true,
      },
    });

    const alumniProfile = await prisma.alumniProfile.upsert({
      where: { studentId: 'ASTU/SWE/001' },
      update: {},
      create: {
        userId: 'test-alumni-user-uuid',
        studentId: 'ASTU/SWE/001',
        fullName: 'Bob Marley',
        email: 'bob@alumni.com',
        cgpa: 3.9,
        graduationYear: 2024,
        gender: 'Male',
        departmentId: dept.id,
        status: 'ACTIVE',
        skills: ['TypeScript', 'Node.js', 'React'],
      },
    });
    testAlumniId = alumniProfile.id;
  });

  afterAll(async () => {
    // Cleanup created test records
    await prisma.hiringEvent.deleteMany({ where: { employerId: testEmployerId } }).catch(() => {});
    await prisma.employerFeedback.deleteMany({ where: { employerId: testEmployerId } }).catch(() => {});
    await prisma.interview.deleteMany({ where: { application: { jobId: testJobId } } }).catch(() => {});
    await prisma.jobApplication.deleteMany({ where: { jobId: testJobId } }).catch(() => {});
    await prisma.job.deleteMany({ where: { employerId: testEmployerId } }).catch(() => {});
    await prisma.$disconnect();
  });

  describe('POST /api/employer/jobs - Job Management', () => {
    it('should allow employer to create a new job', async () => {
      const res = await request(app)
        .post('/api/employer/jobs')
        .set('Authorization', `Bearer ${employerToken}`)
        .send({
          title: 'Fullstack Engineer',
          description: 'Looking for a senior fullstack engineer with React & Node experience.',
          location: 'Addis Ababa',
          employmentType: 'FULL_TIME',
          experienceRequired: 2,
          skillsRequired: ['TypeScript', 'Node.js', 'React'],
          deadline: new Date(Date.now() + 86400000 * 10), // 10 days in future
          salary: '25000',
          responsibilities: 'Build backend APIs and frontend UIs.',
          requirements: '2+ years of experience.',
          experienceLevel: 'MID_LEVEL',
          department: 'SWE',
          status: 'PUBLISHED',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBeDefined();
      testJobId = res.body.data.id;
    });

    it('should allow alumni to apply to the job', async () => {
      const res = await request(app)
        .post(`/api/employer/jobs/${testJobId}/apply`)
        .set('Authorization', `Bearer ${alumniToken}`)
        .send({
          coverLetter: 'I would love to work at Google!',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBeDefined();
      testApplicationId = res.body.data.id;
    });
  });

  describe('GET /api/employer/applications - Application Reviews', () => {
    it('should list job applications for the employer', async () => {
      const res = await request(app)
        .get('/api/employer/applications')
        .set('Authorization', `Bearer ${employerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.data[0].id).toBe(testApplicationId);
    });

    it('should retrieve single application detail', async () => {
      const res = await request(app)
        .get(`/api/employer/applications/${testApplicationId}`)
        .set('Authorization', `Bearer ${employerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(testApplicationId);
    });

    it('should allow employer to change status to SHORTLISTED', async () => {
      const res = await request(app)
        .patch(`/api/employer/applications/${testApplicationId}/status`)
        .set('Authorization', `Bearer ${employerToken}`)
        .send({ status: 'SHORTLISTED' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('SHORTLISTED');
    });
  });

  describe('POST /api/employer/interviews - Interview Scheduling', () => {
    it('should schedule a candidate interview', async () => {
      const res = await request(app)
        .post('/api/employer/interviews')
        .set('Authorization', `Bearer ${employerToken}`)
        .send({
          applicationId: testApplicationId,
          interviewer: 'Sundar Pichai',
          interviewDate: new Date(Date.now() + 86400000), // tomorrow
          interviewType: 'ONLINE',
          meetingLink: 'https://meet.google.com/abc-defg-hij',
          notes: 'Prepare for coding test.',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBeDefined();
      testInterviewId = res.body.data.id;
    });
  });

  describe('PATCH /api/employer/applications/:id/status - Hiring Workflow', () => {
    it('should hire candidate, trigger transaction, log events, and send notification', async () => {
      const res = await request(app)
        .patch(`/api/employer/applications/${testApplicationId}/status`)
        .set('Authorization', `Bearer ${employerToken}`)
        .send({ status: 'HIRED' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('HIRED');
      expect(res.body.data.hiredAt).toBeDefined();

      // Check candidate's alumni profile is now EMPLOYED in the database
      const profile = await prisma.alumniProfile.findUnique({
        where: { id: testAlumniId },
      });
      expect(profile?.employmentStatus).toBe('EMPLOYED');

      // Check HiringEvent was created in the database
      const event = await prisma.hiringEvent.findUnique({
        where: { applicationId: testApplicationId },
      });
      expect(event).toBeDefined();
      expect(event?.employerId).toBe(testEmployerId);

      // Check candidate notification was created in the database
      const notifications = await prisma.notification.findMany({
        where: { userId: 'test-alumni-user-uuid' },
      });
      expect(notifications.some((n: any) => n.title.includes('Hired'))).toBe(true);
    });
  });

  describe('POST /api/employer/feedback - Employer Feedback', () => {
    it('should allow employer to submit post-hiring feedback', async () => {
      const res = await request(app)
        .post('/api/employer/feedback')
        .set('Authorization', `Bearer ${employerToken}`)
        .send({
          alumniId: testAlumniId,
          technicalSkill: 9,
          communicationSkill: 8,
          leadershipSkill: 7,
          teamworkSkill: 9,
          problemSolvingSkill: 8,
          innovationSkill: 8,
          feedbackText: 'Great employee!',
          overallSatisfaction: 9,
          missingSkills: ['Kubernetes'],
          technologiesNeeded: ['GoLang'],
          wouldHireAgain: true,
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBeDefined();
    });
  });

  describe('GET /api/employer/dashboard - Dashboard Statistics', () => {
    it('should return aggregated stats for the employer', async () => {
      const res = await request(app)
        .get('/api/employer/dashboard')
        .set('Authorization', `Bearer ${employerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.totalApplications).toBe(1);
      expect(res.body.data.hiredCandidates).toBe(1);
      expect(res.body.data.hiringRate).toBe(100);
    });
  });
});
