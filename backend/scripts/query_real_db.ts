import dotenv from 'dotenv';
dotenv.config();

import prisma from '../src/core/config/db';

async function main() {
  const depts = await prisma.department.findMany({});
  console.log('=== REAL NEON DB DEPARTMENTS ===');
  console.log(depts.map((d: any) => ({ id: d.id, name: d.name, code: d.code })));

  const alumni = await prisma.alumniProfile.findMany({
    include: { department: true }
  });
  console.log('=== REAL NEON DB ALUMNI PROFILES ===');
  console.log('Total Alumni in Neon DB:', alumni.length);
  alumni.forEach((a: any) => console.log('Alumni ID:', a.id, '| studentId:', a.studentId, '| dept:', a.department?.name, '| deptId:', a.departmentId, '| isVerified:', a.isVerified, '| status:', a.status));

  const users = await prisma.user.findMany({
    where: { role: { in: ['ALUMNI', 'DEPARTMENT_HEAD'] } }
  });
  console.log('=== REAL NEON DB USERS (ALUMNI & DEPT HEAD) ===');
  users.forEach((u: any) => console.log('User ID:', u.id, '| email:', u.email, '| role:', u.role, '| dept:', u.department));
}

main().catch(console.error).finally(() => process.exit(0));
