import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.join(__dirname, '..', '.env') });
import { PrismaClient } from '@prisma/client';

async function main() {
  const p = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } });
  await p.$connect();

  const depts = await p.department.findMany({});
  console.log('=== DEPARTMENTS IN DB ===', depts.map(d => ({ id: d.id, name: d.name, code: d.code })));

  const alumni = await p.alumniProfile.findMany({
    include: {
      user: true,
      experiences: true,
      employerFeedback: true,
      surveyAssignments: true,
    }
  });
  console.log('=== TOTAL ALUMNI IN DB ===', alumni.length);
  alumni.forEach((a: any) => {
    console.log(`Alumni: ${a.fullName || a.user?.email} | DeptId: ${a.departmentId} | Skills: ${a.skills?.length} | Exps: ${a.experiences?.length} | Feedbacks: ${a.employerFeedback?.length}`);
    if (a.experiences?.length > 0) {
      a.experiences.forEach((e: any) => console.log('  -> Exp:', e.companyName, '|', e.position, '|', e.industry));
    }
  });

  const feedbacks = await p.employerFeedback.findMany({ include: { alumni: true, employer: true } });
  console.log('=== TOTAL FEEDBACKS IN DB ===', feedbacks.length);
  feedbacks.forEach((f: any) => {
    console.log(`Feedback: Tech:${f.technicalSkill} Comm:${f.communicationSkill} Prob:${f.problemSolvingSkill} Lead:${f.leadershipSkill} Team:${f.teamworkSkill} Innov:${f.innovationSkill} | Alumni: ${f.alumni?.fullName} (Dept: ${f.alumni?.departmentId})`);
  });

  const surveys = await p.surveyAssignment.findMany({ include: { alumni: true, survey: true } });
  console.log('=== TOTAL SURVEY ASSIGNMENTS IN DB ===', surveys.length);
  const statusCounts: Record<string, number> = {};
  surveys.forEach((s: any) => {
    statusCounts[s.status] = (statusCounts[s.status] || 0) + 1;
  });
  console.log('Survey Status Breakdown:', statusCounts);

  await p.$disconnect();
}

main().catch(console.error).finally(() => process.exit(0));
