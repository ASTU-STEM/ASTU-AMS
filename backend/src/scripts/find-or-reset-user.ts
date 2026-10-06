import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const targetEmail = 'kitile@alumni.astu.edu.et';

  console.log(`Checking database for user: ${targetEmail}...`);

  const user = await prisma.user.findFirst({
    where: { email: { equals: targetEmail, mode: 'insensitive' } },
    include: {
      alumniProfile: true,
    },
  });

  if (user) {
    console.log(`FOUND_USER: User ID=${user.id}, Role=${user.role}, IsActive=${user.isActive}`);
    const newPassword = 'alumni123';
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword, isActive: true },
    });

    console.log(`SUCCESS: Password for ${targetEmail} has been reset/restored to: "${newPassword}"`);
  } else {
    console.log(`USER_NOT_FOUND: No user with email ${targetEmail} found. Checking alumni profiles...`);
    
    const profile = await prisma.alumniProfile.findFirst({
      where: { email: { equals: targetEmail, mode: 'insensitive' } },
    });

    if (profile) {
      console.log(`FOUND_PROFILE: AlumniProfile ID=${profile.id}, StudentId=${profile.studentId}`);
    }

    const defaultPassword = 'alumni123';
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);
    
    let dept = await prisma.department.findFirst({ where: { code: 'SWE' } });
    if (!dept) {
      dept = await prisma.department.findFirst();
    }

    const newUser = await prisma.user.create({
      data: {
        email: targetEmail,
        password: hashedPassword,
        role: Role.ALUMNI,
        isActive: true,
      },
    });

    if (!profile) {
      await prisma.alumniProfile.create({
        data: {
          studentId: 'ASTU/SWE/999/20',
          fullName: 'Kitile Alumni',
          email: targetEmail,
          cgpa: 3.75,
          gender: 'female',
          graduationYear: 2024,
          status: 'ACTIVE',
          isVerified: true,
          departmentId: dept ? dept.id : '',
          userId: newUser.id,
        },
      });
    } else {
      await prisma.alumniProfile.update({
        where: { id: profile.id },
        data: { userId: newUser.id, status: 'ACTIVE', isVerified: true },
      });
    }

    console.log(`SUCCESS: User ${targetEmail} created/restored with default password: "${defaultPassword}"`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
