import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

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

  // Admin Account
  await prisma.user.upsert({
    where: { email: 'admin@astu.edu.et' },
    update: {},
    create: {
      email: 'admin@astu.edu.et',
      password: defaultPassword,
      role: Role.ADMIN,
      isActive: true,
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

  // SWE Department Head
  await prisma.user.upsert({
    where: { email: 'depthead.swe@astu.edu.et' },
    update: {},
    create: {
      email: 'depthead.swe@astu.edu.et',
      password: defaultPassword,
      role: Role.DEPARTMENT_HEAD,
      isActive: true,
    },
  });

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
  await prisma.job.create({
    data: {
      employerId: safaricomProfile.id,
      title: 'Junior Software Engineer (Fullstack)',
      description: 'We are seeking talented ASTU Software Engineering graduates to join our digital team. Experience with React, Node.js, and PostgreSQL is required.',
      salary: '25,000 - 35,000 ETB',
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      experienceRequired: 0,
      skillsRequired: ['React', 'Node.js', 'PostgreSQL', 'TypeScript'],
      location: 'Addis Ababa / Remote',
      employmentType: 'FULL_TIME',
      isActive: true,
    },
  });

  // 4. Create Survey Templates
  console.log('Creating Tracer Study Survey templates...');
  
  // 6-Month Tracer Survey
  const survey6m = await prisma.survey.create({
    data: {
      title: '6-Month Graduate Tracer Study',
      description: 'Required by Quality Assurance & Education Training Authority (ETA) to assess early career outcomes.',
      type: 'SIX_MONTH',
      isActive: true,
    },
  });

  await prisma.surveyQuestion.createMany({
    data: [
      {
        surveyId: survey6m.id,
        questionText: 'What is your current employment status?',
        questionType: 'SINGLE_CHOICE',
        options: ['Employed', 'Self-employed', 'Continuing education', 'Unemployed'],
        order: 1,
      },
      {
        surveyId: survey6m.id,
        questionText: 'How long did it take you to find a job after graduation?',
        questionType: 'SINGLE_CHOICE',
        options: ['0-3 Months', '4-6 Months', '7-12 Months', 'More than 1 year', 'Not applicable'],
        order: 2,
      },
      {
        surveyId: survey6m.id,
        questionText: 'What is your current monthly gross salary in ETB?',
        questionType: 'SINGLE_CHOICE',
        options: ['Under 10,000', '10,000 - 20,000', '20,001 - 35,000', '35,001 - 50,000', 'Above 50,000'],
        order: 3,
      },
    ],
  });

  // 12-Month Tracer Survey
  const survey12m = await prisma.survey.create({
    data: {
      title: '12-Month Longitudinal Tracer Study',
      description: 'Measures alignment of academic curriculum with your professional role in the industry.',
      type: 'TWELVE_MONTH',
      isActive: true,
    },
  });

  await prisma.surveyQuestion.createMany({
    data: [
      {
        surveyId: survey12m.id,
        questionText: 'How relevant was your field of study to your current job?',
        questionType: 'SINGLE_CHOICE',
        options: ['Highly Relevant', 'Somewhat Relevant', 'Unrelated'],
        order: 1,
      },
      {
        surveyId: survey12m.id,
        questionText: 'Rate the quality of hands-on practical/lab training at ASTU:',
        questionType: 'RATING',
        options: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
        order: 2,
      },
      {
        surveyId: survey12m.id,
        questionText: 'Which technologies or skills did you find missing in the ASTU curriculum?',
        questionType: 'TEXT',
        options: [],
        order: 3,
      },
    ],
  });

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
