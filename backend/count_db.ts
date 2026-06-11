import prisma, { initPrisma } from './src/core/config/db';

async function main() {
  await initPrisma();
  const assignments = await prisma.surveyAssignment.findMany({
    include: {
      survey: true,
      alumni: true,
    }
  });
  console.log(`Assignments detail:`);
  assignments.forEach((a: any, idx: number) => {
    console.log(`${idx + 1}. Alumni: ${a.alumni?.fullName}, Survey: ${a.survey?.title}, Status: ${a.status}`);
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
