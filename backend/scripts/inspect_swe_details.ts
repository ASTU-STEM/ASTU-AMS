import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.join(__dirname, '..', '.env') });
import { PrismaClient } from '@prisma/client';

async function main() {
  const p = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } });
  await p.$connect();
  const alumni = await p.alumniProfile.findMany({
    where: { departmentId: '9260379a-e8f2-4e42-ac05-c3836e2bc8c5' },
    include: { user: true, experiences: true }
  });
  console.log(`=== SOFTWARE ENGINEERING ALUMNI IN NEON DB (COUNT: ${alumni.length}) ===`);
  alumni.forEach((a: any, i: number) => {
    console.log(`[${i+1}] ID: ${a.id} | studentId: ${a.studentId} | name: ${a.fullName || a.user?.fullName || a.user?.name} | salary: ${a.salary} | employmentStatus: ${a.employmentStatus} | timeToHire: ${a.timeToHireMonths || a.timeToHire} | skills: ${JSON.stringify(a.skills)} | prefCompany: ${a.preferences?.company}`);
  });

  const allFeedbacks = await p.employerFeedback.findMany({});
  console.log('=== TOTAL EMPLOYER FEEDBACK RECORDS IN DB ===', allFeedbacks.length);
  allFeedbacks.forEach((f: any) => console.log('Feedback:', f.id, '| deptId:', f.departmentId, '| rating:', f.overallSatisfaction));

  const allJobs = await p.job.findMany({});
  console.log('=== TOTAL JOBS IN DB ===', allJobs.length);
  allJobs.forEach((j: any) => console.log('Job:', j.id, '| title:', j.title, '| targetDepts:', j.targetDepartments));

  const allSurveys = await p.surveyAssignment.findMany({});
  console.log('=== TOTAL SURVEY ASSIGNMENTS IN DB ===', allSurveys.length);
  allSurveys.forEach((s: any) => console.log('Survey:', s.id, '| status:', s.status, '| alumniId:', s.alumniProfileId || s.userId));

  await p.$disconnect();
}

main().catch(console.error).finally(() => process.exit(0));
