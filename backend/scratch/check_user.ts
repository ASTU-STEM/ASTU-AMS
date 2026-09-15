import prisma, { initPrisma } from '../src/core/config/db';

async function main() {
  await initPrisma();
  const user = await prisma.user.findUnique({
    where: { email: 'admin@astust.edu.et' }
  });
  console.log('USER_IN_DB:', user);
}

main().catch(console.error).finally(() => prisma.$disconnect());
