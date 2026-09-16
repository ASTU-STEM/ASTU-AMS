import prisma, { initPrisma } from '../src/core/config/db';

async function run() {
  await initPrisma();
  const deptCount = await prisma.department.count();
  const totalAlumniInDb = await prisma.alumniProfile.count();
  const registrarCount = await prisma.registrarStudent.count();
  const depts = await prisma.department.findMany({
    select: {
      id: true,
      name: true,
      code: true,
      _count: { select: { alumniProfiles: true } }
    },
    orderBy: { name: 'asc' }
  });
  const lastSync = await prisma.registrarSyncLog.findFirst({
    orderBy: { syncedAt: 'desc' }
  });

  console.log('=== DEPARTMENT & ALUMNI REAL DB STATS ===');
  console.log('Total Departments in DB:', deptCount);
  console.log('Total Alumni Profiles in DB:', totalAlumniInDb);
  console.log('Total Registrar Student Records in DB:', registrarCount);
  console.log('Last Registrar Sync Log:', lastSync);
  console.log('\n--- Department Breakdown ---');
  console.dir(depts, { depth: null });
}

run()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
