const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const jobs = await prisma.job.findMany({ select: { id: true, title: true, status: true, salaryMin: true, salaryMax: true } });
  const apps = await prisma.jobApplication.findMany({ select: { id: true, status: true, createdAt: true } });
  const feedbacks = await prisma.employerFeedback.findMany();

  console.log('--- DB JOBS ---', jobs);
  console.log('--- DB APPLICATIONS ---', apps);
  console.log('--- DB FEEDBACKS COUNT ---', feedbacks.length);
}

main().catch(console.error).finally(() => prisma.$disconnect());
