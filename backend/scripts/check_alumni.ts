import prisma from '../src/core/config/db';

async function main() {
  const alumni = await prisma.alumniProfile.findMany({});
  console.log(`Found ${alumni.length} total alumni in database:`);
  
  const depts: Record<string, number> = {};
  for (const a of alumni) {
    const dept = a.department || a.departmentId || 'Unspecified';
    depts[dept] = (depts[dept] || 0) + 1;
    console.log(`- ID: ${a.id} | Name: ${a.fullName} | StudentID: ${a.studentId} | Dept: ${dept} | Year: ${a.graduationYear}`);
  }

  console.log('\n--- Department Breakdown ---');
  console.table(depts);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
