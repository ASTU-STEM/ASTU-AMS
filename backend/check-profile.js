const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const profile = await prisma.employerProfile.findFirst({
    where: { companyName: { contains: 'INSA', mode: 'insensitive' } }
  });

  console.log('--- INSA CORPORATION DB RECORD ---');
  console.log(JSON.stringify(profile, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
