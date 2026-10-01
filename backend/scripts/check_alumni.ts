import prisma from '../src/core/config/db';

async function main() {
  const alumni = await prisma.alumniProfile.findMany({
    include: {
      department: true,
      experiences: true,
      mentorProfile: true,
    }
  });
  console.log(`Found ${alumni.length} alumni in database:`);
  for (const a of alumni) {
    console.log(`- ${a.fullName} | ${a.department?.name} | Class of ${a.graduationYear} | Skills: ${a.skills.join(', ')}`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
