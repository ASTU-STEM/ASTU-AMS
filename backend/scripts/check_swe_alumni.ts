import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.join(__dirname, '..', '.env') });
import { PrismaClient } from '@prisma/client';

async function main() {
  const p = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } });
  await p.$connect();
  const alumni = await p.alumniProfile.findMany({
    where: { departmentId: '9260379a-e8f2-4e42-ac05-c3836e2bc8c5' },
    include: { user: true }
  });
  console.log(`=== SOFTWARE ENGINEERING ALUMNI IN NEON POSTGRES (COUNT: ${alumni.length}) ===`);
  alumni.forEach((a: any, index: number) => {
    console.log(`${index + 1}. StudentID: ${a.studentId} | Name: ${a.fullName || a.user?.fullName || a.user?.name || 'N/A'} | Year: ${a.graduationYear} | Status: ${a.status} | Verified: ${a.isVerified}`);
  });
  await p.$disconnect();
}

main().catch(console.error).finally(() => process.exit(0));
