/**
 * Create or update a staff account.
 *
 * The bootstrap seed deliberately creates only the first super admin, so this
 * is how every additional account is made — content managers, registrars,
 * department heads, employers. It is idempotent: re-running with the same
 * email updates the role and resets the password rather than failing.
 *
 *   npm run create:account -- --email cms@astu.edu.et --name "Content Editor" --role CMS_MANAGER
 *   npm run create:account -- --email cms@astu.edu.et --role CMS_MANAGER --password "chosen-here"
 *
 * It writes through the application's own database client, so the account
 * lands in whichever store the running app uses: real PostgreSQL when
 * DATABASE_URL is reachable, otherwise the local dev JSON store.
 *
 * If --password is omitted a strong random one is generated and printed once.
 * There is no hardcoded default password anywhere in this repository.
 */
import { Role } from '@prisma/client';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import process from 'process';
import appPrisma, { initPrisma } from '../src/core/config/db';

// The same client the application uses: real PostgreSQL when DATABASE_URL is
// reachable, otherwise the local dev JSON store.
const prisma = appPrisma;

/** Which optional profile row a role needs. */
const PROFILE_FOR_ROLE: Partial<Record<Role, string>> = {
  ADMIN: 'adminProfile',
  SUPER_ADMIN: 'adminProfile',
  CMS_MANAGER: 'adminProfile',
  ALUMNI_OFFICE: 'adminProfile',
  REGISTRAR: 'adminProfile',
  DEPARTMENT_HEAD: 'departmentHeadProfile',
  ALUMNI: 'alumniProfile',
  EMPLOYER: 'employerProfile',
};

const USAGE = `
Create or update a staff account.

  npm run create:account -- --email <email> --role <role> [--name "Full Name"] [--password <pw>]

Options
  --email <address>   Login email                        (required)
  --role <role>       ADMIN | SUPER_ADMIN | CMS_MANAGER | ALUMNI_OFFICE |
                      REGISTRAR | DEPARTMENT_HEAD | ALUMNI | EMPLOYER   (required)
  --name "First Last" Display name; defaults to the email local part
  --password <pw>     At least 12 characters. Omit to generate a strong one.
  --inactive          Create the account disabled
  --help              Show this message

Notes
  * A DEPARTMENT_HEAD account also needs a department. Use
    --department <code> to bind it, e.g. --department SWE.
  * An EMPLOYER account also needs a company; use --company "<name>".
`;

function parseArgs(argv: string[]): Record<string, string | boolean> {
  const out: Record<string, string | boolean> = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith('--')) continue;
    const key = a.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith('--')) {
      out[key] = true;
    } else {
      out[key] = next;
      i++;
    }
  }
  return out;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help || Object.keys(args).length === 0) {
    console.log(USAGE);
    process.exit(0);
  }

  // The app initialises its client on boot; scripts must do it explicitly.
  await initPrisma();

  const email = String(args.email || '').trim().toLowerCase();
  const roleArg = String(args.role || '').trim().toUpperCase();
  const nameArg = typeof args.name === 'string' ? args.name : '';
  const passwordArg = typeof args.password === 'string' ? args.password : '';

  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    console.error('Error: --email must be a valid email address.');
    process.exit(1);
  }
  const validRoles = Object.values(Role) as string[];
  if (!validRoles.includes(roleArg)) {
    console.error(`Error: --role must be one of: ${validRoles.join(', ')}`);
    process.exit(1);
  }
  const role = roleArg as Role;
  if (passwordArg && passwordArg.length < 12) {
    console.error('Error: --password must be at least 12 characters.');
    process.exit(1);
  }

  const generated = !passwordArg;
  const password = passwordArg || `${crypto.randomBytes(9).toString('base64url')}!Aa1`;
  const hash = await bcrypt.hash(password, 12);
  const isActive = !args.inactive;

  const existing = await prisma.user.findUnique({
    where: { email },
    include: { adminProfile: true },
  });

  const user = existing
    ? await prisma.user.update({
        where: { email },
        data: { role, isActive, password: hash },
      })
    : await prisma.user.create({ data: { email, role, isActive, password: hash } });

  // Attach the profile row the role needs, if it is missing.
  const [firstName, ...rest] = (nameArg || email.split('@')[0]).trim().split(/\s+/);
  const lastName = rest.join(' ') || '-';

  if (PROFILE_FOR_ROLE[role] === 'adminProfile') {
    await prisma.adminProfile.upsert({
      where: { userId: user.id },
      update: { firstName, lastName },
      create: { userId: user.id, firstName, lastName },
    });
  }

  if (role === Role.DEPARTMENT_HEAD) {
    const code = String(args.department || '').trim().toUpperCase();
    if (!code) {
      console.error('Error: a DEPARTMENT_HEAD needs --department <code> (e.g. SWE).');
      await prisma.$disconnect();
      process.exit(1);
    }
    const dept = await prisma.department.findFirst({ where: { code } });
    if (!dept) {
      console.error(`Error: no department with code ${code}. Known: SWE, MEG, ECE, CVE.`);
      await prisma.$disconnect();
      process.exit(1);
    }
    await prisma.departmentHeadProfile.upsert({
      where: { userId: user.id },
      update: { departmentId: dept.id },
      create: { userId: user.id, departmentId: dept.id },
    });
    console.log(`Department head bound to ${dept.code} (${dept.name}).`);
  }

  if (role === Role.EMPLOYER) {
    const company = String(args.company || '').trim();
    if (!company) {
      console.error('Error: an EMPLOYER needs --company "<name>".');
      await prisma.$disconnect();
      process.exit(1);
    }
    await prisma.employerProfile.upsert({
      where: { userId: user.id },
      update: { companyName: company },
      create: {
        userId: user.id,
        companyName: company,
        industry: String(args.industry || 'Unspecified'),
        location: String(args.location || 'Unspecified'),
        hrContact: firstName + ' ' + lastName,
      },
    });
  }

  console.log('');
  console.log(`  ${existing ? 'Updated' : 'Created'} ${role} account`);
  console.log(`  email     ${email}`);
  console.log(`  name      ${firstName} ${lastName}`);
  console.log(`  active    ${isActive}`);
  if (generated) {
    console.log('');
    console.log('  ┌────────────────────────────────────────────────────────────┐');
    console.log('  │  ONE-TIME GENERATED PASSWORD (shown only now)              │');
    console.log(`  │  ${password.padEnd(54)}│`);
    console.log('  └────────────────────────────────────────────────────────────┘');
    console.log('  Change it after first sign-in.');
  } else {
    console.log('  password  (as supplied)');
  }
  console.log('');
}

main()
  .catch((e) => {
    console.error('Failed:', e?.message || e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
