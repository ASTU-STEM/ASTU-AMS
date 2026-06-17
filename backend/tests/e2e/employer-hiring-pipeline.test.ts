import request from 'supertest';
import app from '../../src/app';
import { generateAccessToken } from '../../src/core/utils/jwt.utils';
import prisma, { initPrisma } from '../../src/core/config/db';
import { Role } from '@prisma/client';
import { describe } from 'node:test';
import { beforeAll,afterAll, jest, it, expect, beforeEach } from '@jest/globals';



jest.setTimeout(60000);

describe('Employer Recruitment Pipeline E2E Workflows', () => {
  let employerToken: string;
  let alumniToken: string;

  let testEmployerId: string;
  let testAlumniId: string;
  let testJobId: string;
  let testApplicationId: string;

  beforeAll(async () => {
    await initPrisma();

    // 1. Setup Tokens
    employerToken = generateAccessToken({
      userId: 'e2e-employer-user',
      email: 'recruiting@safaricom.et',
      role: Role.EMPLOYER,
    });

    alumniToken = generateAccessToken({
      userId: 'e2e-alumni-user',
      email: 'helen@alumni.com',
      role: Role.ALUMNI,
    });

    // 2. Setup Department
    const dept = await prisma.department.upsert({
      where: { code: 'MEG' },
      update: {},
      create: { name: 'Mechanical Engineering', code: 'MEG' },
    });

    // 3. Setup Users and Alumni Profile
    await prisma.user.upsert({
      where: { id: 'e2e-employer-user' },
      update: {},
      create: {
        id: 'e2e-employer-user',
        email: 'recruiting@safaricom.et',
        password: 'securePassword123',
        role: Role.EMPLOYER,
        isActive: true,
      },
    });
    await prisma.user.upsert({
      where: { id: 'e2e-alumni-user' },
      update: {},
      create: {
        id: 'e2e-alumni-user',
        email: 'helen@alumni.com',
        password: 'securePassword123',
        role: Role.ALUMNI,
        isActive: true,
      },
    });

    const alumniProfile = await prisma.alumniProfile.upsert({
      where: { studentId: 'ASTU/MEG/999' },
      update: {},
      create: {
        userId: 'e2e-alumni-user',
        studentId: 'ASTU/MEG/999',
        fullName: 'Helen Gidey',
        email: 'helen@alumni.com',
        cgpa: 3.75,
        graduationYear: 2024,
        gender: 'Female',
        departmentId: dept.id,
        status: 'ACTIVE',
        skills: ['CAD', 'SolidWorks', 'MATLAB'],
      },
    });
    testAlumniId = alumniProfile.id;
  });

  afterAll(async () => {
    // Cleanup
    await prisma.hiringEvent.deleteMany({ where: { employerId: testEmployerId } }).catch(() => {});
    await prisma.employerFeedback.deleteMany({ where: { employerId: testEmployerId } }).catch(() => {});
    await prisma.interview.deleteMany({ where: { application: { jobId: testJobId } } }).catch(() => {});
    await prisma.jobApplication.deleteMany({ where: { jobId: testJobId } }).catch(() => {});
    await prisma.job.deleteMany({ where: { employerId: testEmployerId } }).catch(() => {});
    await prisma.employerProfile.deleteMany({ where: { id: testEmployerId } }).catch(() => {});
    await prisma.$disconnect();
  });

  it('Pipeline Flow: Setup Profile -> Post Job -> Apply -> Interview -> Hire', async () => {
    // Step 1: Create Employer Profile
    const profileRes = await request(app)
      .post('/api/employer/profile')
      .set('Authorization', `Bearer ${employerToken}`)
      .send({
        companyName: 'Safaricom Ethiopia',
        industry: 'Telecommunications',
        location: 'Addis Ababa',
        hrContact: 'Recruitment Manager',
        website: 'https://safaricom.et',
        description: 'Safaricom Telecommunications Company',
        companySize: '500+',
        contactPerson: 'Safaricom HR',
        contactEmail: 'careers@safaricom.et',
        phone: '+251911000000',
      });

    expect(profileRes.status).toBe(201);
    expect(profileRes.body.success).toBe(true);
    testEmployerId = profileRes.body.data.id;

    // Step 2: Post a Job
    const jobRes = await request(app)
      .post('/api/employer/jobs')
      .set('Authorization', `Bearer ${employerToken}`)
      .send({
        title: 'Mechanical Design Associate',
        description: 'Design cellular tower components and enclosures.',
        location: 'Hawassa',
        employmentType: 'FULL_TIME',
        experienceRequired: 1,
        skillsRequired: ['CAD', 'SolidWorks'],
        deadline: new Date(Date.now() + 86400000 * 5),
        salary: '18000',
        responsibilities: 'Produce 3D models and CAD blueprints.',
        requirements: 'Knowledge of mechanical assemblies.',
        experienceLevel: 'JUNIOR',
        department: 'MEG',
        status: 'PUBLISHED',
      });

    expect(jobRes.status).toBe(201);
    testJobId = jobRes.body.data.id;

    // Step 3: Alumni Applies for Job
    const applyRes = await request(app)
      .post(`/api/employer/jobs/${testJobId}/apply`)
      .set('Authorization', `Bearer ${alumniToken}`)
      .send({
        coverLetter: 'I am Helen, a mechanical graduate who wants to work at Safaricom.',
      });

    expect(applyRes.status).toBe(201);
    testApplicationId = applyRes.body.data.id;

    // Step 4: Employer schedules an interview
    const interviewRes = await request(app)
      .post('/api/employer/interviews')
      .set('Authorization', `Bearer ${employerToken}`)
      .send({
        applicationId: testApplicationId,
        interviewer: 'E2E Interviewer',
        interviewDate: new Date(Date.now() + 86400000),
        interviewType: 'ONLINE',
        notes: 'Interview scheduled via E2E test.',
      });

    expect(interviewRes.status).toBe(201);

    // Step 5: Employer marks application as HIRED
    const hireRes = await request(app)
      .patch(`/api/employer/applications/${testApplicationId}/status`)
      .set('Authorization', `Bearer ${employerToken}`)
      .send({ status: 'HIRED' });

    expect(hireRes.status).toBe(200);
    expect(hireRes.body.data.status).toBe('HIRED');
    expect(hireRes.body.data.hiredAt).toBeDefined();

    // Step 6: Verify Database Updates
    const alumni = await prisma.alumniProfile.findUnique({ where: { id: testAlumniId } });
    expect(alumni?.employmentStatus).toBe('EMPLOYED');

    const hiringEvent = await prisma.hiringEvent.findUnique({ where: { applicationId: testApplicationId } });
    expect(hiringEvent).toBeDefined();
    expect(hiringEvent?.employerId).toBe(testEmployerId);
  });
});
