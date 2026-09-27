/**
 * ASTU-AMS bootstrap seed.
 *
 * This runs automatically as part of `prisma migrate dev` / `migrate reset`,
 * so it must contain ONLY what a real deployment genuinely needs:
 *
 *   1. The department list (structure, not data)
 *   2. The first super-admin account (otherwise nobody can log in to create
 *      anything else)
 *
 * It deliberately creates NO alumni, employers, jobs, surveys or events.
 * Fabricated people would flow straight into placement rates, median salary
 * and tracer reporting, which is exactly what this project must never publish.
 *
 * Real records are added either through the admin UI or via the importer:
 *   npm run import:csv -- --file <path> --type alumni --dry-run
 *
 * Demo data, if ever wanted for a local sandbox, lives in seed-demo.ts and
 * must be invoked explicitly:  npm run prisma:seed:demo
 */
import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import process from 'process';

const prisma = new PrismaClient();

/**
 * The four ASTU departments. `code` is the stable join key used by the CSV
 * importer and reported in analytics, so treat changes here as a migration.
 */
const DEPARTMENTS = [
  { code: 'SWE', name: 'Software Engineering' },
  { code: 'MEG', name: 'Mechanical Engineering' },
  { code: 'ECE', name: 'Electrical and Computer Engineering' },
  { code: 'CVE', name: 'Civil Engineering' },
];

const ADMIN_EMAIL = (process.env.BOOTSTRAP_ADMIN_EMAIL || 'admin@astust.edu.et').trim().toLowerCase();

function resolveAdminPassword(): { password: string; generated: boolean } {
  const fromEnv = process.env.BOOTSTRAP_ADMIN_PASSWORD;
  if (fromEnv && fromEnv.trim().length >= 12) {
    return { password: fromEnv, generated: false };
  }
  if (fromEnv && fromEnv.trim().length > 0) {
    console.warn(
      '[bootstrap] BOOTSTRAP_ADMIN_PASSWORD is shorter than 12 characters; generating a strong one instead.'
    );
  }
  // Never fall back to a shared hardcoded password. A random one is printed
  // once, at creation time only, so it cannot leak from version control.
  const password = `${crypto.randomBytes(9).toString('base64url')}!Aa1`;
  return { password, generated: true };
}

async function main() {
  console.log('[bootstrap] Seeding structure only (no demo people, jobs or employers).');

  // ── 1. Departments ────────────────────────────────────────────────────────
  for (const dept of DEPARTMENTS) {
    await prisma.department.upsert({
      where: { code: dept.code },
      // Only fill in a missing name; never rename a department an admin has edited.
      update: {},
      create: { code: dept.code, name: dept.name },
    });
  }
  const deptCount = await prisma.department.count();
  console.log(`[bootstrap] Departments ready: ${deptCount}`);

  // ── 2. First super admin ──────────────────────────────────────────────────
  const existing = await prisma.user.findUnique({ where: { email: ADMIN_EMAIL } });
  if (existing) {
    console.log(`[bootstrap] Super admin ${ADMIN_EMAIL} already exists; leaving it untouched.`);
  } else {
    const { password, generated } = resolveAdminPassword();
    const hash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { email: ADMIN_EMAIL, password: hash, role: Role.SUPER_ADMIN, isActive: true },
    });
    await prisma.adminProfile.create({
      data: {
        userId: user.id,
        firstName: process.env.BOOTSTRAP_ADMIN_FIRST_NAME || 'System',
        lastName: process.env.BOOTSTRAP_ADMIN_LAST_NAME || 'Administrator',
        department: process.env.BOOTSTRAP_ADMIN_DEPARTMENT || 'Administration',
      },
    });
    console.log(`[bootstrap] Created super admin: ${ADMIN_EMAIL}`);
    if (generated) {
      console.log('');
      console.log('  ┌────────────────────────────────────────────────────────────┐');
      console.log('  │  ONE-TIME GENERATED PASSWORD (shown only now)              │');
      console.log(`  │  ${password.padEnd(54)}│`);
      console.log('  │  Store it in BOOTSTRAP_ADMIN_PASSWORD, then change it in-app.│');
      console.log('  └────────────────────────────────────────────────────────────┘');
      console.log('');
    }
  }

  // ── 3. Honest summary ─────────────────────────────────────────────────────
  const [alumni, employers, jobs] = await Promise.all([
    prisma.alumniProfile.count(),
    prisma.employerProfile.count(),
    prisma.job.count(),
  ]);
  console.log('[bootstrap] Data counts:');
  console.log(`             alumni    ${alumni}`);
  console.log(`             employers ${employers}`);
  console.log(`             jobs      ${jobs}`);
  if (alumni + employers + jobs > 0) {
    console.log('[bootstrap] Existing records preserved — this seed never deletes data.');
  }
  console.log('[bootstrap] Done. Import real records with: npm run import:csv');
}

main()
  .catch((e) => {
    console.error('[bootstrap] FAILED:', e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
