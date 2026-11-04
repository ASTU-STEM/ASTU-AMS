import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';
import process from 'process';
import { MILESTONE_TEMPLATES } from '../src/modules/surveys/config/milestoneQuestions';

const prisma = new PrismaClient();

const sixMonthTemplate = MILESTONE_TEMPLATES.find((t) => t.type === 'SIX_MONTH')!;
const twelveMonthTemplate = MILESTONE_TEMPLATES.find((t) => t.type === 'TWELVE_MONTH')!;

type SeedResponse = {
  alumniId: string;
  answers: string[];
};

function getSampleAlumniId(alumni: Map<string, { id: string }>, email: string): string {
  const profile = alumni.get(email);
  if (!profile) {
    throw new Error(`Required sample alumni profile was not created: ${email}`);
  }
  return profile.id;
}

/**
 * Insert or refresh a sample response without creating a second assignment for
 * the same alumni/survey pair when the seed is run again.
 */
async function seedSurveyResponses(
  surveyId: string,
  questions: Array<{ id: string }>,
  records: SeedResponse[],
) {
  for (const record of records) {
    const now = new Date();
    const dueDate = new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000);
    const existingAssignment = await prisma.surveyAssignment.findFirst({
      where: { surveyId, alumniId: record.alumniId },
      orderBy: { createdAt: 'asc' },
    });

    const assignment = existingAssignment
      ? await prisma.surveyAssignment.update({
        where: { id: existingAssignment.id },
        data: { status: 'COMPLETED', dueDate, completedAt: now },
      })
      : await prisma.surveyAssignment.create({
        data: {
          surveyId,
          alumniId: record.alumniId,
          status: 'COMPLETED',
          dueDate,
          completedAt: now,
        },
      });

    const existingResponse = await prisma.surveyResponse.findUnique({
      where: { assignmentId: assignment.id },
    });
    const response = existingResponse
      ? await prisma.surveyResponse.update({
        where: { id: existingResponse.id },
        data: { isDraft: false, submittedAt: now },
      })
      : await prisma.surveyResponse.create({
        data: {
          surveyId,
          alumniId: record.alumniId,
          assignmentId: assignment.id,
          isDraft: false,
          submittedAt: now,
        },
      });

    await prisma.surveyAssignment.update({
      where: { id: assignment.id },
      data: { responseId: response.id },
    });

    await prisma.surveyAnswer.deleteMany({ where: { responseId: response.id } });
    await prisma.surveyAnswer.createMany({
      data: questions.map((question, index) => ({
        responseId: response.id,
        questionId: question.id,
        answerText: record.answers[index],
      })),
    });
  }
}

async function main() {
  console.log('🌱 Start seeding ASTU-AMS database...');

  // 1. Create Default Departments
  console.log('Creating departments...');
  const swe = await prisma.department.upsert({
    where: { code: 'SWE' },
    update: {},
    create: { code: 'SWE', name: 'Software Engineering' },
  });

  const meg = await prisma.department.upsert({
    where: { code: 'MEG' },
    update: {},
    create: { code: 'MEG', name: 'Mechanical Engineering' },
  });

  const ece = await prisma.department.upsert({
    where: { code: 'ECE' },
    update: {},
    create: { code: 'ECE', name: 'Electrical and Computer Engineering' },
  });

  const cve = await prisma.department.upsert({
    where: { code: 'CVE' },
    update: {},
    create: { code: 'CVE', name: 'Civil Engineering' },
  });

  // 2. Create Users (Admin, Registrar, Department Head)
  console.log('Creating system users...');
  const defaultPassword = await bcrypt.hash('astu_ams_pass123', 10);

  // Root Super Admin Account (Tolosa Abebe Badho)
  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@astust.edu.et' },
    update: { role: Role.SUPER_ADMIN, isActive: true },
    create: {
      email: 'admin@astust.edu.et',
      password: defaultPassword,
      role: Role.SUPER_ADMIN,
      isActive: true,
    },
  });

  await prisma.adminProfile.upsert({
    where: { userId: superAdmin.id },
    update: { firstName: 'Tolosa Abebe', lastName: 'Badho', department: 'Executive Directorate' },
    create: {
      userId: superAdmin.id,
      firstName: 'Tolosa Abebe',
      lastName: 'Badho',
      department: 'Executive Directorate',
    },
  });

  // Standard Admin / ICT Technical Admin Account
  const ictAdmin = await prisma.user.upsert({
    where: { email: 'admin@astu.edu.et' },
    update: { role: Role.ADMIN, isActive: true },
    create: {
      email: 'admin@astu.edu.et',
      password: defaultPassword,
      role: Role.ADMIN,
      isActive: true,
    },
  });

  await prisma.adminProfile.upsert({
    where: { userId: ictAdmin.id },
    update: { firstName: 'ICT System', lastName: 'Administrator', department: 'ICT Directorate' },
    create: {
      userId: ictAdmin.id,
      firstName: 'ICT System',
      lastName: 'Administrator',
      department: 'ICT Directorate',
    },
  });

  // Registrar Account
  await prisma.user.upsert({
    where: { email: 'registrar@astu.edu.et' },
    update: {},
    create: {
      email: 'registrar@astu.edu.et',
      password: defaultPassword,
      role: Role.REGISTRAR,
      isActive: true,
    },
  });

  // Alumni Office (CMS) Account
  await prisma.user.upsert({
    where: { email: 'alumnioffice@astu.edu.et' },
    update: {},
    create: {
      email: 'alumnioffice@astu.edu.et',
      password: defaultPassword,
      role: Role.ALUMNI_OFFICE,
      isActive: true,
    },
  });

  // Academic Department Heads
  const deptHeads = [
    { email: 'depthead.swe@astu.edu.et', deptId: swe.id, name: 'Software Engineering' },
    { email: 'depthead.ece@astu.edu.et', deptId: ece.id, name: 'Electrical and Computer Engineering' },
    { email: 'depthead.meg@astu.edu.et', deptId: meg.id, name: 'Mechanical Engineering' },
    { email: 'depthead.cve@astu.edu.et', deptId: cve.id, name: 'Civil Engineering' },
  ];

  for (const dh of deptHeads) {
    const dhUser = await prisma.user.upsert({
      where: { email: dh.email },
      update: { isActive: true },
      create: {
        email: dh.email,
        password: defaultPassword,
        role: Role.DEPARTMENT_HEAD,
        isActive: true,
      },
    });

    await prisma.departmentHeadProfile.upsert({
      where: { userId: dhUser.id },
      update: { departmentId: dh.deptId },
      create: {
        userId: dhUser.id,
        departmentId: dh.deptId,
      },
    });
  }

  // 3. Create active mock Employer
  console.log('Creating mock employer Safaricom...');
  const employerPassword = await bcrypt.hash('safaricom123', 10);
  const employerUser = await prisma.user.upsert({
    where: { email: 'safaricom@mail.com' },
    update: {},
    create: {
      email: 'safaricom@mail.com',
      password: employerPassword,
      role: Role.EMPLOYER,
      isActive: true,
    },
  });

  const safaricomProfile = await prisma.employerProfile.upsert({
    where: { userId: employerUser.id },
    update: {},
    create: {
      userId: employerUser.id,
      companyName: 'Safaricom Ethiopia',
      industry: 'Telecommunications',
      website: 'https://www.safaricom.et',
      location: 'Addis Ababa, HQ',
      hrContact: 'safaricom.careers@mail.com',
      isVerified: true,
    },
  });

  // Post mock Job listing
  console.log('Creating mock job posting...');
  const sampleJob = {
    description: 'We are seeking talented ASTU Software Engineering graduates to join our digital team. Experience with React, Node.js, and PostgreSQL is required.',
    salary: '25,000 - 35,000 ETB',
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    experienceRequired: 0,
    skillsRequired: ['React', 'Node.js', 'PostgreSQL', 'TypeScript'],
    location: 'Addis Ababa / Remote',
    employmentType: 'FULL_TIME',
    isActive: true,
  };
  const existingSampleJob = await prisma.job.findFirst({
    where: {
      employerId: safaricomProfile.id,
      title: 'Junior Software Engineer (Fullstack)',
    },
    orderBy: { createdAt: 'asc' },
  });
  if (existingSampleJob) {
    await prisma.job.update({ where: { id: existingSampleJob.id }, data: sampleJob });
  } else {
    await prisma.job.create({
      data: {
        employerId: safaricomProfile.id,
        title: 'Junior Software Engineer (Fullstack)',
        ...sampleJob,
      },
    });
  }

  // 4. Create Survey Templates (lookup by type; titles match MILESTONE_TEMPLATES)
  console.log('Creating Tracer Study Survey templates...');
  
  const sixMonthSurveyData = {
    title: sixMonthTemplate.title,
    description: sixMonthTemplate.description,
    type: 'SIX_MONTH' as const,
    milestoneMonths: sixMonthTemplate.milestoneMonths,
    isActive: true,
    isArchived: false,
  };
  const existingSurvey6m = await prisma.survey.findFirst({
    where: { type: 'SIX_MONTH' },
    orderBy: { createdAt: 'asc' },
  });
  const survey6m = existingSurvey6m
    ? await prisma.survey.update({ where: { id: existingSurvey6m.id }, data: sixMonthSurveyData })
    : await prisma.survey.create({
      data: sixMonthSurveyData,
    });

  const sixMonthQuestions = [
    {
      questionText: 'What is your current employment status?',
      questionType: 'SELECT' as const,
      options: ['Employed', 'Self-employed', 'Continuing education', 'Unemployed'],
      order: 1,
    },
    {
      questionText: 'How long did it take you to find a job after graduation?',
      questionType: 'SELECT' as const,
      options: ['0-3 Months', '4-6 Months', '7-12 Months', 'More than 1 year', 'Not applicable'],
      order: 2,
    },
    {
      questionText: 'What is your current monthly gross salary in ETB?',
      questionType: 'SELECT' as const,
      options: ['Under 10,000', '10,000 - 20,000', '20,001 - 35,000', '35,001 - 50,000', 'Above 50,000'],
      order: 3,
    },
  ];
  const questions6m = [];
  for (const question of sixMonthQuestions) {
    const existingQuestion = await prisma.surveyQuestion.findFirst({
      where: { surveyId: survey6m.id, order: question.order },
      orderBy: { createdAt: 'asc' },
    });
    questions6m.push(existingQuestion
      ? await prisma.surveyQuestion.update({ where: { id: existingQuestion.id }, data: question })
      : await prisma.surveyQuestion.create({ data: { surveyId: survey6m.id, ...question } }));
  }

  const twelveMonthSurveyData = {
    title: twelveMonthTemplate.title,
    description: twelveMonthTemplate.description,
    type: 'TWELVE_MONTH' as const,
    milestoneMonths: twelveMonthTemplate.milestoneMonths,
    isActive: true,
    isArchived: false,
  };
  const existingSurvey12m = await prisma.survey.findFirst({
    where: { type: 'TWELVE_MONTH' },
    orderBy: { createdAt: 'asc' },
  });
  const survey12m = existingSurvey12m
    ? await prisma.survey.update({ where: { id: existingSurvey12m.id }, data: twelveMonthSurveyData })
    : await prisma.survey.create({
      data: twelveMonthSurveyData,
    });

  const twelveMonthQuestions = [
    {
      questionText: 'How relevant was your field of study to your current job?',
      questionType: 'SELECT' as const,
      options: ['Highly Relevant', 'Somewhat Relevant', 'Unrelated'],
      order: 1,
    },
    {
      questionText: 'Rate the quality of hands-on practical/lab training at ASTU:',
      questionType: 'RATING' as const,
      options: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
      order: 2,
    },
    {
      questionText: 'Which technologies or skills did you find missing in the ASTU curriculum?',
      questionType: 'TEXT' as const,
      options: [],
      order: 3,
    },
  ];
  const questions12m = [];
  for (const question of twelveMonthQuestions) {
    const existingQuestion = await prisma.surveyQuestion.findFirst({
      where: { surveyId: survey12m.id, order: question.order },
      orderBy: { createdAt: 'asc' },
    });
    questions12m.push(existingQuestion
      ? await prisma.surveyQuestion.update({ where: { id: existingQuestion.id }, data: question })
      : await prisma.surveyQuestion.create({ data: { surveyId: survey12m.id, ...question } }));
  }
  // 5. Create Mock Alumni Users and Profiles
  console.log('Creating mock alumni profiles...');
  const alumniPassword = await bcrypt.hash('alumni123', 10);

  const alumniData = [
    {
      email: 'alice@alumni.com',
      fullName: 'Alice Johnson',
      studentId: 'ASTU/SWE/001/20',
      cgpa: 3.82,
      graduationYear: 2024,
      gender: 'female',
      deptId: swe.id,
      employmentStatus: 'EMPLOYED' as const,
      salary: 28000,
      skills: ['React', 'Node.js', 'PostgreSQL', 'TypeScript', 'Docker'],
    },
    {
      email: 'bob@alumni.com',
      fullName: 'Bob Smith',
      studentId: 'ASTU/SWE/002/20',
      cgpa: 3.51,
      graduationYear: 2024,
      gender: 'male',
      deptId: swe.id,
      employmentStatus: 'SELF_EMPLOYED' as const,
      salary: 18000,
      skills: ['Flutter', 'Firebase', 'Dart', 'TailwindCSS'],
    },
    {
      email: 'charlie@alumni.com',
      fullName: 'Charlie Davis',
      studentId: 'ASTU/ECE/003/19',
      cgpa: 3.15,
      graduationYear: 2023,
      gender: 'male',
      deptId: ece.id,
      employmentStatus: 'EMPLOYED' as const,
      salary: 22000,
      skills: ['Python', 'C++', 'Embedded Systems', 'IoT'],
    },
    {
      email: 'diana@alumni.com',
      fullName: 'Diana Prince',
      studentId: 'ASTU/ECE/004/20',
      cgpa: 3.65,
      graduationYear: 2024,
      gender: 'female',
      deptId: ece.id,
      employmentStatus: 'UNEMPLOYED' as const,
      salary: null,
      skills: ['MATLAB', 'Circuit Design', 'Verilog'],
    },
    {
      email: 'evan@alumni.com',
      fullName: 'Evan Wright',
      studentId: 'ASTU/CVE/005/19',
      cgpa: 3.42,
      graduationYear: 2023,
      gender: 'male',
      deptId: cve.id,
      employmentStatus: 'EMPLOYED' as const,
      salary: 16000,
      skills: ['AutoCAD', 'Civil 3D', 'Project Management'],
    },
  ];

  const createdAlumni = new Map<string, { id: string }>();

  for (const item of alumniData) {
    const alumniUser = await prisma.user.upsert({
      where: { email: item.email },
      update: { role: Role.ALUMNI, isActive: true },
      create: {
        email: item.email,
        password: alumniPassword,
        role: Role.ALUMNI,
        isActive: true,
      },
    });

    const profile = await prisma.alumniProfile.upsert({
      where: { studentId: item.studentId },
      update: {
        userId: alumniUser.id,
        fullName: item.fullName,
        email: item.email,
        cgpa: item.cgpa,
        graduationYear: item.graduationYear,
        gender: item.gender,
        departmentId: item.deptId,
        status: 'INACTIVE',
        isVerified: false,
        employmentStatus: item.employmentStatus,
        salary: item.salary,
        skills: item.skills,
      },
      create: {
        userId: alumniUser.id,
        studentId: item.studentId,
        fullName: item.fullName,
        email: item.email,
        cgpa: item.cgpa,
        graduationYear: item.graduationYear,
        gender: item.gender,
        departmentId: item.deptId,
        status: 'INACTIVE',
        isVerified: false,
        employmentStatus: item.employmentStatus,
        salary: item.salary,
        skills: item.skills,
      },
    });

    createdAlumni.set(item.email, profile);
  }

  // 6. Create Work Experiences
  console.log('Creating work experiences...');
  const alice = getSampleAlumniId(createdAlumni, 'alice@alumni.com');
  const charlie = getSampleAlumniId(createdAlumni, 'charlie@alumni.com');
  const evan = getSampleAlumniId(createdAlumni, 'evan@alumni.com');

  const workExperiences = [
    {
      alumniId: alice,
      companyName: 'Safaricom Ethiopia',
      position: 'Junior Fullstack Engineer',
      industry: 'Telecommunications',
      salaryRange: '25,000 - 35,000 ETB',
      location: 'Addis Ababa',
      isCurrent: true,
      startDate: new Date('2024-09-01'),
    },
    {
      alumniId: charlie,
      companyName: 'Ethio Telecom',
      position: 'Network Engineer',
      industry: 'Telecommunications',
      salaryRange: '20,001 - 35,000 ETB',
      location: 'Addis Ababa',
      isCurrent: true,
      startDate: new Date('2023-10-01'),
    },
    {
      alumniId: evan,
      companyName: 'Sunshine Construction',
      position: 'Site Engineer',
      industry: 'Construction',
      salaryRange: '10,000 - 20,000 ETB',
      location: 'Adama',
      isCurrent: true,
      startDate: new Date('2023-11-15'),
    },
  ];

  for (const experience of workExperiences) {
    const existingExperience = await prisma.workExperience.findFirst({
      where: {
        alumniId: experience.alumniId,
        companyName: experience.companyName,
        position: experience.position,
      },
      orderBy: { createdAt: 'asc' },
    });
    if (existingExperience) {
      await prisma.workExperience.update({
        where: { id: existingExperience.id },
        data: experience,
      });
    } else {
      await prisma.workExperience.create({ data: experience });
    }
  }

  // 7. Create Employer Feedback
  console.log('Creating employer feedbacks...');
  const feedbackData = {
    technicalSkill: 9,
    communicationSkill: 8,
    leadershipSkill: 7,
    teamworkSkill: 9,
    problemSolvingSkill: 8,
    innovationSkill: 8,
    feedbackText: 'Alice integrates well into our engineering team and delivers high-quality React features.',
  };
  const existingFeedback = await prisma.employerFeedback.findFirst({
    where: { employerId: safaricomProfile.id, alumniId: alice },
    orderBy: { createdAt: 'asc' },
  });
  if (existingFeedback) {
    await prisma.employerFeedback.update({ where: { id: existingFeedback.id }, data: feedbackData });
  } else {
    await prisma.employerFeedback.create({
      data: { employerId: safaricomProfile.id, alumniId: alice, ...feedbackData },
    });
  }

  // 8. Create Survey Responses
  console.log('Creating survey assignments and responses...');
  // 6-Month Responses
  const responseAlumni6m = [
    {
      alumniId: alice,
      answers: ['Employed', '0-3 Months', '20,001 - 35,000'],
    },
    {
      alumniId: getSampleAlumniId(createdAlumni, 'bob@alumni.com'),
      answers: ['Self-employed', '0-3 Months', '10,000 - 20,000'],
    },
    {
      alumniId: getSampleAlumniId(createdAlumni, 'diana@alumni.com'),
      answers: ['Unemployed', 'Not applicable', 'Under 10,000'],
    },
  ];
  await seedSurveyResponses(survey6m.id, questions6m, responseAlumni6m);

  // 12-Month Responses
  const responseAlumni12m = [
    {
      alumniId: charlie,
      answers: ['Highly Relevant', '8', 'Cloud Computing, DevOps'],
    },
    {
      alumniId: evan,
      answers: ['Highly Relevant', '7', 'BIM Software, Project Management'],
    },
  ];
  await seedSurveyResponses(survey12m.id, questions12m, responseAlumni12m);

  console.log('🌱 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
