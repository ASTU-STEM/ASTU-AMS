import prisma, { initPrisma } from '../src/core/config/db';
import bcrypt from 'bcryptjs';

async function main() {
  await initPrisma();

  const emails = ['admin@astu.edu.et', 'admin@astust.edu.et'];
  const newPassword = 'Test@123';
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  for (const email of emails) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      await prisma.user.update({
        where: { email },
        data: { password: hashedPassword, isActive: true }
      });
      console.log(`Successfully updated password for ${email} to: ${newPassword}`);
    } else {
      console.log(`User ${email} not found in database.`);
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
