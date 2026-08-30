const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const feedbacks = await prisma.employerFeedback.findMany({
    include: { employer: true, alumni: { include: { department: true } } }
  });
  console.log('--- EMPLOYER FEEDBACKS ---');
  console.log(JSON.stringify(feedbacks, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
