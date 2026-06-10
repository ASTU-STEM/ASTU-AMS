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
        questionType: 'SELECT',
        options: ['Employed', 'Self-employed', 'Continuing education', 'Unemployed'],
        order: 1,
      },
      {
        surveyId: survey6m.id,
        questionText: 'How long did it take you to find a job after graduation?',
        questionType: 'SELECT',
        options: ['0-3 Months', '4-6 Months', '7-12 Months', 'More than 1 year', 'Not applicable'],
        order: 2,
      },
      {
        surveyId: survey6m.id,
        questionText: 'What is your current monthly gross salary in ETB?',
        questionType: 'SELECT',
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
        questionType: 'SELECT',
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

  const createdAlumni: any[] = [];

  for (const item of alumniData) {
    const profile = await prisma.alumniProfile.upsert({
      where: { studentId: item.studentId },
      update: {
        status: 'INACTIVE',
        isVerified: false,
      },
      create: {
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

    createdAlumni.push({ ...profile, email: item.email });
  }

  // 6. Create Work Experiences
  console.log('Creating work experiences...');
  const alice = createdAlumni.find(a => a.email === 'alice@alumni.com');
  const charlie = createdAlumni.find(a => a.email === 'charlie@alumni.com');
  const evan = createdAlumni.find(a => a.email === 'evan@alumni.com');

  await prisma.workExperience.create({
    data: {
      alumniId: alice.id,
      companyName: 'Safaricom Ethiopia',
      position: 'Junior Fullstack Engineer',
      industry: 'Telecommunications',
      salaryRange: '25,000 - 35,000 ETB',
      location: 'Addis Ababa',
      isCurrent: true,
      startDate: new Date('2024-09-01'),
    },
  });

  await prisma.workExperience.create({
    data: {
      alumniId: charlie.id,
      companyName: 'Ethio Telecom',
      position: 'Network Engineer',
      industry: 'Telecommunications',
      salaryRange: '20,001 - 35,000 ETB',
      location: 'Addis Ababa',
      isCurrent: true,
      startDate: new Date('2023-10-01'),
    },
  });

  await prisma.workExperience.create({
    data: {
      alumniId: evan.id,
      companyName: 'Sunshine Construction',
      position: 'Site Engineer',
      industry: 'Construction',
      salaryRange: '10,000 - 20,000 ETB',
      location: 'Adama',
      isCurrent: true,
      startDate: new Date('2023-11-15'),
    },
  });

  // 7. Create Employer Feedback
  console.log('Creating employer feedbacks...');
  await prisma.employerFeedback.create({
    data: {
      employerId: safaricomProfile.id,
      alumniId: alice.id,
      technicalSkill: 9,
      communicationSkill: 8,
      leadershipSkill: 7,
      teamworkSkill: 9,
      problemSolvingSkill: 8,
      innovationSkill: 8,
      feedbackText: 'Alice integrates well into our engineering team and delivers high-quality React features.',
    },
  });

  // 8. Create Survey Responses
  console.log('Creating survey assignments and responses...');
  const questions6m = await prisma.surveyQuestion.findMany({
    where: { surveyId: survey6m.id },
    orderBy: { order: 'asc' },
  });

  const questions12m = await prisma.surveyQuestion.findMany({
    where: { surveyId: survey12m.id },
    orderBy: { order: 'asc' },
  });

  // 6-Month Responses
  const responseAlumni6m = [
    {
      alumni: createdAlumni.find(a => a.email === 'alice@alumni.com'),
      answers: ['Employed', '0-3 Months', '20,001 - 35,000'],
    },
    {
      alumni: createdAlumni.find(a => a.email === 'bob@alumni.com'),
      answers: ['Self-employed', '0-3 Months', '10,000 - 20,000'],
    },
    {
      alumni: createdAlumni.find(a => a.email === 'diana@alumni.com'),
      answers: ['Unemployed', 'Not applicable', 'Under 10,000'],
    },
  ];

  for (const record of responseAlumni6m) {
    const assignment = await prisma.surveyAssignment.create({
      data: {
        surveyId: survey6m.id,
        alumniId: record.alumni.id,
        status: 'COMPLETED',
        dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        completedAt: new Date(),
      },
    });

    const response = await prisma.surveyResponse.create({
      data: {
        surveyId: survey6m.id,
        alumniId: record.alumni.id,
        assignmentId: assignment.id,
        isDraft: false,
        submittedAt: new Date(),
      },
    });

    await prisma.surveyAssignment.update({
      where: { id: assignment.id },
      data: { responseId: response.id },
    });

    for (let i = 0; i < questions6m.length; i++) {
      await prisma.surveyAnswer.create({
        data: {
          responseId: response.id,
          questionId: questions6m[i].id,
          answerText: record.answers[i],
        },
      });
    }
  }

  // 12-Month Responses
  const responseAlumni12m = [
    {
      alumni: createdAlumni.find(a => a.email === 'charlie@alumni.com'),
      answers: ['Highly Relevant', '8', 'Cloud Computing, DevOps'],
    },
    {
      alumni: createdAlumni.find(a => a.email === 'evan@alumni.com'),
      answers: ['Highly Relevant', '7', 'BIM Software, Project Management'],
    },
  ];

  for (const record of responseAlumni12m) {
    const assignment = await prisma.surveyAssignment.create({
      data: {
        surveyId: survey12m.id,
        alumniId: record.alumni.id,
        status: 'COMPLETED',
        dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        completedAt: new Date(),
      },
    });

    const response = await prisma.surveyResponse.create({
      data: {
        surveyId: survey12m.id,
        alumniId: record.alumni.id,
        assignmentId: assignment.id,
        isDraft: false,
        submittedAt: new Date(),
      },
    });

    await prisma.surveyAssignment.update({
      where: { id: assignment.id },
      data: { responseId: response.id },
    });

    for (let i = 0; i < questions12m.length; i++) {
      await prisma.surveyAnswer.create({
        data: {
          responseId: response.id,
          questionId: questions12m[i].id,
          answerText: record.answers[i],
        },
      });
    }
  }

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
