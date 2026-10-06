import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.join(__dirname, '..', '.env') });
import { PrismaClient } from '@prisma/client';

async function checkNeon() {
  console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'FOUND' : 'NOT FOUND');
  const p = new PrismaClient({
    datasources: { db: { url: process.env.DATABASE_URL } }
  });
  await p.$connect();
  const alumni = await p.alumniProfile.findMany({ include: { department: true } });
  console.log('NEON DB TOTAL ALUMNI COUNT:', alumni.length);
  alumni.forEach((a: any) => {
    console.log('Alumni ID:', a.id, '| studentId:', a.studentId, '| deptId:', a.departmentId, '| dept:', a.department?.name);
  });
  const depts = await p.department.findMany({});
  console.log('NEON DB DEPARTMENTS:', depts.map((d: any) => ({ id: d.id, name: d.name, code: d.code })));
  await p.$disconnect();
}

checkNeon().catch(console.error).finally(() => process.exit(0));
