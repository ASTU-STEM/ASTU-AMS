import prisma from '../src/core/config/db';

async function main() {
  const query = 'insa';
  const profiles = await prisma.alumniProfile.findMany({
    where: {
      OR: [
        { fullName: { contains: query, mode: 'insensitive' } },
        { bio: { contains: query, mode: 'insensitive' } },
        {
          experiences: {
            some: {
              OR: [
                { position: { contains: query, mode: 'insensitive' } },
                { companyName: { contains: query, mode: 'insensitive' } },
              ]
            }
          }
        }
      ]
    },
    include: {
      department: true,
      experiences: true,
      mentorProfile: true
    },
    orderBy: { fullName: 'asc' }
  });

  console.log('✅ Search query executed successfully! Results count:', profiles.length);
}

main()
  .catch((err) => {
    console.error('❌ Search query failed:', err);
  })
  .finally(() => prisma.$disconnect());
