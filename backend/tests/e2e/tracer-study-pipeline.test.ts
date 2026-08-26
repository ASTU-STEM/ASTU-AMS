import request from 'supertest';
import app from '../../src/app';
import { generateAccessToken } from '../../src/core/utils/jwt.utils';
import prisma, { initPrisma } from '../../src/core/config/db';
import { Role, SurveyType } from '@prisma/client';

jest.setTimeout(60000);

describe('Tracer Study Engine E2E Workflows', () => {
  let adminToken: string;
  let alumniToken: string;

  let testSurveyId: string;
  let testAlumniId: string;

  beforeAll(async () => {
    await initPrisma();

    adminToken = generateAccessToken({
      userId: 'tracer-admin-user',
      email: 'admin.tracer@astu.edu.et',
      role: Role.ADMIN,
    });

    alumniToken = generateAccessToken({
      userId: 'tracer-alumni-user',
      email: 'alumni.tracer@alumni.com',
      role: Role.ALUMNI,
    });

    // Create Base Department
    const dept = await prisma.department.upsert({
      where: { code: 'CSE' },
      update: {},
      create: { name: 'Computer Science & Engineering', code: 'CSE' },
    });

    // Create Users & Alumni Profile
    await prisma.user.upsert({
      where: { id: 'tracer-admin-user' },
      update: {},
      create: {
        id: 'tracer-admin-user',
        email: 'admin.tracer@astu.edu.et',
        password: 'securePassword123',
        role: Role.ADMIN,
        isActive: true,
      },
    });

    await prisma.user.upsert({
      where: { id: 'tracer-alumni-user' },
      update: {},
      create: {
        id: 'tracer-alumni-user',
        email: 'alumni.tracer@alumni.com',
        password: 'securePassword123',
        role: Role.ALUMNI,
        isActive: true,
      },
    });

    const profile = await prisma.alumniProfile.upsert({
      where: { studentId: 'ASTU/CSE/777' },
      update: {},
      create: {
        userId: 'tracer-alumni-user',
        studentId: 'ASTU/CSE/777',
        fullName: 'Tracer Test Alumni',
        email: 'alumni.tracer@alumni.com',
        cgpa: 3.85,
        graduationYear: 2024,
        gender: 'Male',
        departmentId: dept.id,
        status: 'ACTIVE',
        skills: ['Cybersecurity', 'Python'],
      },
    });
    testAlumniId = profile.id;
  });

  afterAll(async () => {
    await prisma.surveyResponse.deleteMany({ where: { alumniId: testAlumniId } }).catch(() => {});
    await prisma.survey.deleteMany({ where: { title: 'ASTU 6-Month Graduate Tracer Study' } }).catch(() => {});
    await prisma.$disconnect();
  });

  it('Pipeline Flow: Instant Post & Milestone Schedule -> Instant Notification Dispatch -> Alumni Receipt -> Response Submission', async () => {
    // Step 1: Admin Creates 6-Month Tracer Survey with Instant Posting (sendInstantly: true)
    const createRes = await request(app)
      .post('/api/surveys/templates')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: 'ASTU 6-Month Graduate Tracer Study',
        description: 'Mandatory accreditation survey for 2024 graduates.',
        type: SurveyType.SIX_MONTH,
        milestoneMonths: 6,
        sendInstantly: true,
        sections: [
          {
            title: 'Employment Information',
            order: 1,
            questions: [
              {
                questionText: 'What is your current employment status?',
                questionType: 'SELECT',
                required: true,
                order: 1,
                options: ['EMPLOYED', 'UNEMPLOYED', 'SELF_EMPLOYED', 'STUDYING'],
              },
            ],
          },
        ],
      });

    expect(createRes.status).toBe(201);
    expect(createRes.body.success).toBe(true);
    testSurveyId = createRes.body.data.id;

    // Step 2: Admin Explicitly Triggers Instant Dispatch Endpoint
    const dispatchRes = await request(app)
      .post(`/api/surveys/templates/${testSurveyId}/send-instantly`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(dispatchRes.status).toBe(200);
    expect(dispatchRes.body.success).toBe(true);
    expect(dispatchRes.body.data.surveyId).toBe(testSurveyId);

    // Step 3: Alumni Retrieves Assigned Surveys in Dashboard Account
    const mySurveysRes = await request(app)
      .get('/api/surveys/my-surveys')
      .set('Authorization', `Bearer ${alumniToken}`);

    expect(mySurveysRes.status).toBe(200);
    expect(mySurveysRes.body.success).toBe(true);

    // Step 4: Alumni Retrieves Instant Notifications in Account Popover
    const notificationsRes = await request(app)
      .get('/api/notifications')
      .set('Authorization', `Bearer ${alumniToken}`);

    expect(notificationsRes.status).toBe(200);
    expect(notificationsRes.body.success).toBe(true);

    // Step 5: Alumni Submits Tracer Response
    const firstQuestionId = createRes.body.data?.questions?.[0]?.id || createRes.body.data?.sections?.[0]?.questions?.[0]?.id || '00000000-0000-0000-0000-000000000001';
    const fakeAssignmentId = '00000000-0000-0000-0000-000000000002';

    const submitRes = await request(app)
      .post(`/api/surveys/${testSurveyId}/responses`)
      .set('Authorization', `Bearer ${alumniToken}`)
      .send({
        assignmentId: fakeAssignmentId,
        answers: [
          {
            questionId: firstQuestionId,
            answerText: 'EMPLOYED',
          },
        ],
      });

    expect(submitRes.status).toBe(201);
    expect(submitRes.body.success).toBe(true);

    // Step 6: Admin Verifies Statistics and Completion Reports
    const statsRes = await request(app)
      .get('/api/surveys/statistics')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(statsRes.status).toBe(200);
    expect(statsRes.body.success).toBe(true);

    const reportRes = await request(app)
      .get('/api/surveys/completion-report')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(reportRes.status).toBe(200);
    expect(reportRes.body.success).toBe(true);
  });
});
