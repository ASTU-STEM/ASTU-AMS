import prisma, { initPrisma } from '../src/core/config/db';

async function main() {
  await initPrisma();

  const user = await prisma.user.findUnique({
    where: { email: 'admin@astu.edu.et' }
  });
  console.log('ADMIN_USER_IN_DB:', user);
}

main().catch(console.error).finally(() => prisma.$disconnect());
