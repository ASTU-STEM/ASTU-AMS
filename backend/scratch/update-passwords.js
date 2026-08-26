const { PrismaClient, Role } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function run() {
  const pass = await bcrypt.hash('Test@1234', 10);
  
  // Upsert insa@gmail.com
  const user = await prisma.user.upsert({
    where: { email: 'insa@gmail.com' },
    update: { password: pass, isActive: true },
    create: {
      email: 'insa@gmail.com',
      password: pass,
      role: Role.ALUMNI,
      isActive: true,
    }
  });

  // Ensure AlumniProfile exists for insa@gmail.com
  let dept = await prisma.department.findFirst();
  if (!dept) {
    dept = await prisma.department.create({ data: { code: 'SWE', name: 'Software Engineering' } });
  }

  await prisma.alumniProfile.upsert({
    where: { studentId: 'ASTU/SWE/001/20' },
    update: { userId: user.id, isVerified: true, status: 'ACTIVE' },
    create: {
      studentId: 'ASTU/SWE/001/20',
      userId: user.id,
      fullName: 'Insa User',
      email: 'insa@gmail.com',
      departmentId: dept.id,
      cgpa: 3.8,
      graduationYear: 2024,
      gender: 'male',
      isVerified: true,
      status: 'ACTIVE'
    }
  });

  console.log('Successfully updated/created insa@gmail.com in PostgreSQL!');
}

run()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
