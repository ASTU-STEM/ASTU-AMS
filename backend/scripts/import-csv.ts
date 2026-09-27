/**
 * ASTU-AMS CSV / Excel importer.
 *
 * Reads a real spreadsheet export and loads it into PostgreSQL, with a
 * dry-run-first workflow so nothing is written until the data is verified:
 *
 *   npm run import:csv -- --file ./exports/alumni.xlsx --type alumni
 *   npm run import:csv -- --file ./exports/alumni.xlsx --type alumni --commit
 *
 * Design rules:
 *  - Dry-run is the DEFAULT. Writes require an explicit --commit.
 *  - Column names are matched through an alias table, because registrar
 *    exports never use our field names.
 *  - Every rejected row is reported with its spreadsheet row number.
 *  - Employment status is normalised through the shared survey mapper, so a
 *    CSV never fabricates unemployment out of a blank or odd cell.
 *  - This uses the real PrismaClient, never the dev JSON fallback, so an
 *    import can never silently land in a local file.
 */
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import * as XLSX from 'xlsx';
import { mapEmploymentStatusAnswer } from '../src/shared/employmentStatusText';

const prisma = new PrismaClient();

// ─────────────────────────────── CLI ───────────────────────────────

type ImportType = 'alumni' | 'employers' | 'jobs';

interface Args {
  file: string;
  type: ImportType;
  commit: boolean;
  skipInvalid: boolean;
  mapping?: Record<string, string>;
}

const USAGE = `
Import real records from a CSV or Excel export.

  npm run import:csv -- --file <path> --type <alumni|employers|jobs> [--commit]

Options
  --file <path>       .csv, .xlsx or .xls file to read
  --type <type>       alumni | employers | jobs            (default: alumni)
  --commit            Actually write. Without this the run is a dry run.
  --skip-invalid      Import only the valid rows, skipping the rest
  --mapping <json>    Override auto-detected columns, e.g.
                        --mapping '{"Student ID":"studentId","Name":"fullName"}'
  --help              Show this message
`;

function parseArgs(argv: string[]): Args {
  const get = (flag: string): string | undefined => {
    const i = argv.indexOf(flag);
    return i >= 0 ? argv[i + 1] : undefined;
  };
  if (argv.includes('--help') || argv.length === 0) {
    console.log(USAGE);
    process.exit(0);
  }
  const file = get('--file');
  if (!file) {
    console.error('Error: --file is required.\n' + USAGE);
    process.exit(1);
  }
  if (!fs.existsSync(file)) {
    console.error(`Error: file not found: ${file}`);
    process.exit(1);
  }
  const type = (get('--type') || 'alumni') as ImportType;
  if (!['alumni', 'employers', 'jobs'].includes(type)) {
    console.error(`Error: unknown --type "${type}". Use alumni, employers or jobs.`);
    process.exit(1);
  }
  let mapping: Record<string, string> | undefined;
  const raw = get('--mapping');
  if (raw) {
    try {
      mapping = JSON.parse(raw);
    } catch {
      console.error('Error: --mapping must be valid JSON, e.g. \'{"Student ID":"studentId"}\'');
      process.exit(1);
    }
  }
  return { file, type, commit: argv.includes('--commit'), skipInvalid: argv.includes('--skip-invalid'), mapping };
}

// ─────────────────────────── Column mapping ───────────────────────────

/** Normalise a header so "Student ID", "student_id" and "studentId" compare equal. */
const norm = (h: string): string =>
  h.toLowerCase().replace(/[^a-z0-9]/g, '');

/**
 * alias -> canonical field. First alias that matches a header wins, so put the
 * most specific spelling first.
 */
const ALIASES: Record<ImportType, Record<string, string[]>> = {
  alumni: {
    studentId: ['studentid', 'studentnumber', 'studentno', 'regno', 'registrationno', 'registrationnumber', 'idno', 'uin', 'usin'],
    fullName: ['fullname', 'name', 'studentname', 'alumniname', 'graduatename'],
    email: ['email', 'emailaddress', 'mail'],
    phone: ['phone', 'phonenumber', 'mobile', 'mobilenumber', 'tel', 'telephone'],
    cgpa: ['cgpa', 'gpa', 'cumulativegpa', 'cumulativescore'],
    graduationYear: ['graduationyear', 'gradyear', 'yearofgraduation', 'gyear', 'classof'],
    gender: ['gender', 'sex'],
    department: ['departmentcode', 'deptcode', 'department', 'dept', 'program', 'programme', 'fieldofstudy', 'departmentname'],
    employmentStatus: [
      'employmentstatus', 'currentemploymentstatus', 'currentstatus', 'employstatus',
      'employment', 'jobstatus', 'workstatus', 'presentstatus', 'status',
    ],
    salary: ['monthlysalary', 'salary', 'salarymonthly', 'monthlyincome', 'income', 'grosssalary', 'netsalary'],
    company: ['company', 'companyname', 'employer', 'employername', 'organization', 'organisation', 'currentemployer'],
    jobTitle: ['jobtitle', 'position', 'role', 'title', 'currentposition', 'jobrole'],
    industry: ['industry', 'sector', 'field'],
    location: ['location', 'city', 'worklocation', 'headoffice', 'headquarters', 'address', 'town', 'basedin'],
    skills: ['skills', 'skill', 'competencies', 'technicalskills'],
    isVerified: ['isverified', 'verified', 'verificationstatus'],
    nationality: ['nationality', 'country'],
    bio: ['bio', 'biography', 'about'],
    linkedIn: ['linkedin', 'linkedinurl', 'linkedinprofile'],
    gitHub: ['github', 'githuburl', 'githubprofile'],
  },
  employers: {
    companyName: ['companyname', 'company', 'organisation', 'organization', 'employer', 'employername', 'name'],
    industry: ['industry', 'sector', 'field'],
    location: ['location', 'city', 'headoffice', 'headquarters', 'address', 'town', 'basedin', 'office'],
    hrContact: ['hrcontact', 'hr', 'hrperson', 'contactperson', 'recruiter', 'contact'],
    contactEmail: ['contactemail', 'hremail', 'email', 'emailaddress', 'mail'],
    phone: ['phone', 'phonenumber', 'tel', 'telephone', 'mobile'],
    website: ['website', 'url', 'web', 'site', 'homepage'],
    tin: ['tin', 'taxidentificationnumber', 'taxid', 'tinnumber'],
    companySize: ['companysize', 'size', 'numberofemployees', 'staffcount'],
    description: ['description', 'about', 'aboutus', 'profile', 'companydescription'],
    isVerified: ['isverified', 'verified', 'verificationstatus'],
  },
  jobs: {
    title: ['title', 'jobtitle', 'position', 'rolename', 'jobname', 'opening'],
    company: ['company', 'companyname', 'employer', 'employername', 'organisation', 'organization'],
    description: ['description', 'jobdescription', 'details', 'responsibilities', 'about'],
    location: ['location', 'city', 'worklocation', 'headoffice', 'headquarters', 'address', 'town', 'joblocation', 'basedin'],
    employmentType: ['employmenttype', 'type', 'jobtype', 'contracttype', 'natureofjob'],
    deadline: ['deadline', 'closingdate', 'applicationdeadline', 'closingdate', 'lastdate', 'expires', 'expirydate', 'duedate'],
    salary: ['salary', 'salaryrange', 'monthlysalary', 'pay', 'remuneration'],
    skills: ['skills', 'skillsrequired', 'requiredskills', 'requirements'],
    experienceRequired: ['experiencerequired', 'experience', 'yearsexperience', 'minexperience', 'experienceyears', 'expyears'],
    department: ['department', 'dept', 'departmentcode', 'targetdepartment', 'program'],
    status: ['status', 'jobstatus', 'publicationstatus'],
  },
};

interface MappingResult {
  /** canonical field -> spreadsheet header */
  fieldToHeader: Record<string, string>;
  /** spreadsheet headers we could not use */
  unusedHeaders: string[];
  /** canonical fields with no matching header */
  missing: string[];
}

function buildMapping(headers: string[], type: ImportType, override?: Record<string, string>): MappingResult {
  const fieldToHeader: Record<string, string> = {};
  const used = new Set<string>();
  const headerByNorm = new Map<string, string>();
  for (const h of headers) headerByNorm.set(norm(h), h);

  // Explicit overrides win and are keyed by the header text as it appears.
  if (override) {
    for (const [header, canonical] of Object.entries(override)) {
      const match = headers.find((h) => h === header) ?? header;
      fieldToHeader[canonical] = match;
      used.add(match);
    }
  }

  for (const [canonical, aliases] of Object.entries(ALIASES[type])) {
    if (fieldToHeader[canonical]) continue;
    for (const alias of aliases) {
      const hit = headerByNorm.get(alias);
      if (hit && !used.has(hit)) {
        fieldToHeader[canonical] = hit;
        used.add(hit);
        break;
      }
    }
  }

  return {
    fieldToHeader,
    unusedHeaders: headers.filter((h) => !used.has(h)),
    missing: Object.keys(ALIASES[type]).filter((f) => !fieldToHeader[f]),
  };
}

// ───────────────────────────── Value helpers ─────────────────────────────

const REQUIRED: Record<ImportType, string[]> = {
  alumni: ['studentId', 'fullName', 'cgpa', 'graduationYear', 'gender', 'department'],
  employers: ['companyName', 'industry', 'location', 'hrContact'],
  jobs: ['title', 'company', 'description', 'location', 'employmentType'],
};

const cell = (row: Record<string, any>, header?: string): string => {
  if (!header) return '';
  const v = row[header];
  if (v === null || v === undefined) return '';
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  return String(v).trim();
};

const splitList = (s: string): string[] =>
  s
    .split(/[,;|]/)
    .map((x) => x.trim())
    .filter(Boolean);

const parseNumber = (s: string): number | null => {
  if (!s) return null;
  const cleaned = s.replace(/[^0-9.-]/g, '');
  if (!cleaned || cleaned === '-' || cleaned === '.') return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
};

const parseBool = (s: string): boolean => {
  const v = s.toLowerCase();
  return v === 'true' || v === 'yes' || v === 'y' || v === '1' || v === 'verified';
};

const parseDate = (s: string): Date | null => {
  if (!s) return null;
  // Excel serial dates arrive as numbers.
  if (/^\d{4,6}$/.test(s)) {
    const serial = Number(s);
    if (serial > 20000 && serial < 60000) {
      const parsed = XLSX.SSF.parse_date_code(serial);
      if (parsed) return new Date(parsed.y, parsed.m - 1, parsed.d);
    }
  }
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
};

/** Normalise a CSV cell to an EmploymentStatus without inventing unemployment. */
function normaliseEmploymentStatus(raw: string): 'EMPLOYED' | 'UNEMPLOYED' | 'SELF_EMPLOYED' | 'UNSPECIFIED' {
  const v = raw.trim();
  if (!v) return 'UNSPECIFIED';
  const direct = v.toUpperCase().replace(/[\s-]+/g, '_');
  if (['EMPLOYED', 'UNEMPLOYED', 'SELF_EMPLOYED', 'UNSPECIFIED'].includes(direct)) {
    return direct as any;
  }
  return mapEmploymentStatusAnswer(v, 'UNSPECIFIED');
}

const normaliseAlumniStatus = (raw: string): 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' => {
  const v = raw.trim().toUpperCase();
  if (['ACTIVE', 'INACTIVE', 'SUSPENDED'].includes(v)) return v as any;
  if (/^(ACTIVE|GRADUATED|ALUMNI)\b/.test(v)) return 'ACTIVE';
  if (/^(INACTIVE|GRADUATING|NOT GRADUATED)\b/.test(v)) return 'INACTIVE';
  return 'ACTIVE';
};

// ───────────────────────────── Row results ─────────────────────────────

interface RowError {
  row: number;
  field?: string;
  message: string;
  fatal: boolean;
}

interface RowReport<T> {
  row: number;
  errors: RowError[];
  value?: T;
  preview: string;
}

// ─────────────────────────────── Main ───────────────────────────────

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const { file, type, commit, skipInvalid } = args;

  console.log(`\n${'='.repeat(72)}`);
  console.log(`  ASTU-AMS import  ·  ${type}`);
  console.log(`${'='.repeat(72)}\n`);
  console.log(`File      ${path.resolve(file)}`);
  console.log(`Mode      ${commit ? 'COMMIT (will write)' : 'DRY RUN (no writes)'}\n`);

  // ── Read the sheet ──────────────────────────────────────────────────
  const workbook = XLSX.readFile(file, { cellDates: true });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) {
    console.error('Error: the workbook has no sheets.');
    process.exit(1);
  }
  const rawRows = XLSX.utils.sheet_to_json<Record<string, any>>(workbook.Sheets[sheetName], { defval: '' });
  console.log(`Sheet     ${sheetName}`);
  console.log(`Rows      ${rawRows.length}\n`);

  if (rawRows.length === 0) {
    console.error('Error: no data rows found. Is the first row a header row?');
    process.exit(1);
  }

  const headers = Object.keys(rawRows[0]);
  const mapping = buildMapping(headers, type, args.mapping);

  // ── Report the mapping ──────────────────────────────────────────────
  console.log('Column mapping');
  console.log('-'.repeat(72));
  for (const [canonical, header] of Object.entries(mapping.fieldToHeader)) {
    console.log(`  ${canonical.padEnd(22)} <- "${header}"`);
  }
  if (mapping.unusedHeaders.length) {
    console.log(`\n  ignored columns: ${mapping.unusedHeaders.map((h) => `"${h}"`).join(', ')}`);
  }

  const missingRequired = REQUIRED[type].filter((f) => !mapping.fieldToHeader[f]);
  if (missingRequired.length) {
    console.log(`\n  MISSING REQUIRED COLUMN(S): ${missingRequired.join(', ')}`);
    console.log('  Add them to the file, or map them explicitly, e.g.');
    console.log(`    --mapping '{"Your Column":"${missingRequired[0]}"}'`);
    await prisma.$disconnect();
    process.exit(1);
  }
  console.log('');

  const get = (row: Record<string, any>) => {
    // Pre-seed every known field with '' so an unmapped column reads as blank
    // instead of producing `undefined` and crashing a value parser.
    const out: Record<string, string> = {};
    for (const canonical of Object.keys(ALIASES[type])) out[canonical] = '';
    for (const [canonical, header] of Object.entries(mapping.fieldToHeader)) {
      out[canonical] = cell(row, header);
    }
    return out;
  };

  // ── Load reference data ─────────────────────────────────────────────
  const departments = await prisma.department.findMany({ select: { id: true, code: true, name: true } });
  const deptByCode = new Map<string, string>();
  const deptByName = new Map<string, string>();
  for (const d of departments) {
    deptByCode.set(d.code.toLowerCase(), d.id);
    deptByCode.set(norm(d.code), d.id);
    deptByName.set(d.name.toLowerCase(), d.id);
    deptByName.set(norm(d.name), d.id);
  }
  const resolveDept = (raw: string): string | undefined =>
    deptByCode.get(raw.toLowerCase()) ?? deptByCode.get(norm(raw)) ?? deptByName.get(raw.toLowerCase()) ?? deptByName.get(norm(raw));

  const errors: RowError[] = [];
  const warnings: RowError[] = [];
  const accepted: any[] = [];
  const previews: string[] = [];

  // ══════════════════════════ ALUMNI ══════════════════════════
  if (type === 'alumni') {
    const existing = new Set((await prisma.alumniProfile.findMany({ select: { studentId: true } })).map((a) => a.studentId));
    const seenInFile = new Set<string>();
    const knownDepts = new Set(departments.map((d) => `${d.code}/${d.name}`));

    for (let i = 0; i < rawRows.length; i++) {
      const rowNum = i + 2; // +1 header, +1 for 1-based
      const r = get(rawRows[i]);
      const rowErrors: RowError[] = [];
      const push = (field: string, message: string, fatal = true) =>
        rowErrors.push({ row: rowNum, field, message, fatal });

      const studentId = r.studentId;
      if (!studentId) push('studentId', 'blank student ID');
      else if (seenInFile.has(studentId)) push('studentId', `duplicate student ID "${studentId}" within the file`);
      else if (existing.has(studentId)) push('studentId', `student ID "${studentId}" already exists in the database`);
      if (studentId) seenInFile.add(studentId);

      const fullName = r.fullName;
      if (!fullName) push('fullName', 'blank name');

      const cgpa = parseNumber(r.cgpa);
      if (cgpa === null) push('cgpa', `"${r.cgpa}" is not a number`);
      else if (cgpa < 0) push('cgpa', `CGPA ${cgpa} is negative and cannot be real`);
      else if (cgpa > 4) {
        // Legitimate on a 5- or 10-point scale, but ASTU analytics normalise
        // against 4.0, so surface it rather than silently skewing scores.
        warnings.push({
          row: rowNum,
          field: 'cgpa',
          message: `CGPA ${cgpa} is above 4.00; placement analytics normalise against 4.0`,
          fatal: false,
        });
      }

      const gradYear = parseNumber(r.graduationYear) ? Number(parseNumber(r.graduationYear)) : NaN;
      if (!Number.isInteger(gradYear) || gradYear < 1950 || gradYear > new Date().getFullYear() + 6) {
        push('graduationYear', `"${r.graduationYear}" is not a plausible graduation year`);
      }

      const gender = r.gender;
      if (!gender) push('gender', 'blank gender (the schema requires a value)');

      const departmentId = resolveDept(r.department);
      if (!r.department) push('department', 'blank department');
      else if (!departmentId) push('department', `unknown department "${r.department}" — known: ${[...knownDepts].join(', ')}`);

      const salary = parseNumber(r.salary);
      if (r.salary && salary === null) push('salary', `"${r.salary}" is not a number`);

      const status = normaliseEmploymentStatus(r.employmentStatus);
      if (r.employmentStatus && !/^(employed|unemployed|self[- ]?employed|unspecified)$/i.test(r.employmentStatus)) {
        warnings.push({
          row: rowNum,
          field: 'employmentStatus',
          message: `read "${r.employmentStatus}" as ${status}`,
          fatal: false,
        });
      }

      const hasFatal = rowErrors.some((e) => e.fatal);
      errors.push(...rowErrors);

      if (!hasFatal) {
        accepted.push({
          studentId,
          fullName,
          email: r.email || null,
          phone: r.phone || null,
          cgpa: cgpa as number,
          graduationYear: gradYear,
          gender,
          departmentId: departmentId as string,
          status: normaliseAlumniStatus(r.status || 'ACTIVE'),
          employmentStatus: status,
          salary,
          isVerified: parseBool(r.isVerified),
          skills: splitList(r.skills),
          nationality: r.nationality || null,
          address: r.location || null,
          bio: r.bio || null,
          linkedIn: r.linkedIn || null,
          gitHub: r.gitHub || null,
        });
        if (previews.length < 12) {
          previews.push(
            `  row ${String(rowNum).padStart(4)}  ${studentId.padEnd(14)} ${fullName.slice(0, 26).padEnd(26)} ` +
              `${status.padEnd(14)} ${salary != null ? 'ETB ' + salary.toLocaleString('en-US') : 'no salary'}`
          );
        }
      }
    }
  }

  // ══════════════════════════ EMPLOYERS ══════════════════════════
  if (type === 'employers') {
    const existing = await prisma.employerProfile.findMany({ select: { companyName: true, tin: true } });
    const byName = new Map(existing.map((e) => [norm(e.companyName), e]));
    const byTin = new Map(existing.filter((e) => e.tin).map((e) => [e.tin as string, e]));
    const seen = new Set<string>();
    let needsPasswordReset = 0;

    for (let i = 0; i < rawRows.length; i++) {
      const rowNum = i + 2;
      const r = get(rawRows[i]);
      const rowErrors: RowError[] = [];
      const push = (field: string, message: string, fatal = true) => rowErrors.push({ row: rowNum, field, message, fatal });

      const companyName = r.companyName;
      if (!companyName) push('companyName', 'blank company name');
      const key = norm(companyName);
      if (companyName && seen.has(key)) push('companyName', `duplicate company "${companyName}" within the file`);
      if (companyName) seen.add(key);

      if (r.tin && byTin.has(r.tin)) push('tin', `TIN ${r.tin} already exists`);
      if (companyName && (byName.has(key) || byTin.has(r.tin ?? ''))) {
        push('companyName', `"${companyName}" already exists in the database — update it in the app instead`);
      }
      for (const req of ['industry', 'location', 'hrContact'] as const) {
        if (!r[req]) push(req, `blank ${req}`);
      }
      if (r.contactEmail && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(r.contactEmail)) {
        push('contactEmail', `"${r.contactEmail}" is not a valid email address`);
      }

      const hasFatal = rowErrors.some((e) => e.fatal);
      errors.push(...rowErrors);
      if (!hasFatal) {
        const email = (r.contactEmail || `hr+${key}@placeholder.invalid`).toLowerCase();
        needsPasswordReset++;
        accepted.push({
          companyName,
          industry: r.industry,
          location: r.location,
          hrContact: r.hrContact,
          website: r.website || null,
          tin: r.tin || null,
          contactEmail: r.contactEmail || null,
          phone: r.phone || null,
          companySize: r.companySize || null,
          description: r.description || null,
          isVerified: parseBool(r.isVerified),
          _email: email,
        });
        if (previews.length < 12) {
          previews.push(`  row ${String(rowNum).padStart(4)}  ${companyName.slice(0, 34).padEnd(34)} ${r.industry.slice(0, 22).padEnd(22)} ${r.location.slice(0, 20)}`);
        }
      }
    }
    if (needsPasswordReset && commit) {
      console.log('  note: employer logins get a random password; they must use "forgot password".\n');
    }
  }

  // ══════════════════════════ JOBS ══════════════════════════
  if (type === 'jobs') {
    const employers = await prisma.employerProfile.findMany({ select: { id: true, companyName: true, tin: true } });
    const empByName = new Map(employers.map((e) => [norm(e.companyName), e]));
    const empByTin = new Map(employers.filter((e) => e.tin).map((e) => [e.tin as string, e]));
    const seen = new Set<string>();

    for (let i = 0; i < rawRows.length; i++) {
      const rowNum = i + 2;
      const r = get(rawRows[i]);
      const rowErrors: RowError[] = [];
      const push = (field: string, message: string, fatal = true) => rowErrors.push({ row: rowNum, field, message, fatal });

      const title = r.title;
      if (!title) push('title', 'blank job title');
      const key = `${norm(r.company)}|${norm(title)}`;
      if (title && seen.has(key)) push('title', `duplicate posting "${title}" at "${r.company}" within the file`);
      if (title) seen.add(key);

      const employer = empByName.get(norm(r.company)) ?? (r.company ? empByTin.get(r.company) : undefined);
      if (!r.company) push('company', 'blank company');
      else if (!employer) {
        push('company', `no employer profile matches "${r.company}" — import employers first, or create it in the app`);
      }

      for (const req of ['description', 'location', 'employmentType'] as const) {
        if (!r[req]) push(req, `blank ${req}`);
      }

      const deadline = parseDate(r.deadline);
      if (!r.deadline) push('deadline', 'blank deadline');
      else if (!deadline) push('deadline', `"${r.deadline}" is not a valid date`);
      else if (deadline.getTime() < Date.now() - 86400000 * 30) {
        warnings.push({ row: rowNum, field: 'deadline', message: `deadline ${r.deadline} is more than 30 days in the past`, fatal: false });
      }

      const salaryText = r.salary;
      let salaryMin: number | null = null;
      let salaryMax: number | null = null;
      if (salaryText) {
        const nums = salaryText.match(/\d[\d,]*/g)?.map((n) => Number(n.replace(/,/g, ''))).filter((n) => Number.isFinite(n)) ?? [];
        if (nums.length >= 2) {
          salaryMin = Math.min(...nums);
          salaryMax = Math.max(...nums);
        } else if (nums.length === 1) {
          salaryMin = nums[0];
        } else {
          warnings.push({ row: rowNum, field: 'salary', message: `could not read a number from "${salaryText}"`, fatal: false });
        }
      }

      const hasFatal = rowErrors.some((e) => e.fatal);
      errors.push(...rowErrors);
      if (!hasFatal) {
        const statusRaw = r.status.toUpperCase();
        const status = ['DRAFT', 'PUBLISHED', 'CLOSED', 'ARCHIVED'].includes(statusRaw) ? (statusRaw as any) : 'DRAFT';
        if (r.status && status !== statusRaw) {
          warnings.push({ row: rowNum, field: 'status', message: `read "${r.status}" as ${status} (safer than publishing)`, fatal: false });
        }
        accepted.push({
          employerId: (employer as any).id,
          title,
          description: r.description,
          location: r.location,
          employmentType: r.employmentType.toUpperCase().replace(/[\s-]+/g, '_'),
          deadline: deadline as Date,
          salary: salaryText || null,
          salaryMin,
          salaryMax,
          experienceRequired: parseNumber(r.experienceRequired) ?? 0,
          skillsRequired: splitList(r.skills),
          status,
        });
        if (previews.length < 12) {
          previews.push(`  row ${String(rowNum).padStart(4)}  ${title.slice(0, 30).padEnd(30)} ${r.employmentType.padEnd(14)} ${(deadline as Date).toISOString().slice(0, 10)}`);
        }
      }
    }
  }

  // ── Report ─────────────────────────────────────────────────────────
  const fatal = errors.filter((e) => e.fatal);
  console.log('Preview');
  console.log('-'.repeat(72));
  if (previews.length) {
    previews.forEach((p) => console.log(p));
    if (accepted.length > previews.length) console.log(`  ... and ${accepted.length - previews.length} more valid row(s)`);
  } else {
    console.log('  (no valid rows)');
  }

  if (warnings.length) {
    console.log(`\nWarnings (${warnings.length}) — rows imported but worth checking`);
    console.log('-'.repeat(72));
    for (const w of warnings.slice(0, 20)) console.log(`  row ${w.row}  [${w.field}] ${w.message}`);
    if (warnings.length > 20) console.log(`  ... and ${warnings.length - 20} more`);
  }

  if (fatal.length) {
    console.log(`\nRejected (${fatal.length} problem(s)) — fix these in the file`);
    console.log('-'.repeat(72));
    for (const e of fatal.slice(0, 30)) console.log(`  row ${e.row}  [${e.field}] ${e.message}`);
    if (fatal.length > 30) console.log(`  ... and ${fatal.length - 30} more`);
  }

  console.log(`\n${'-'.repeat(72)}`);
  console.log(`Rows read       ${rawRows.length}`);
  console.log(`Valid           ${accepted.length}`);
  console.log(`Rejected        ${fatal.length}`);
  console.log(`Warnings        ${warnings.length}`);

  if (!commit) {
    console.log(`\nDRY RUN — nothing was written.`);
    console.log(`Re-run with --commit to import the ${accepted.length} valid row(s).`);
    await prisma.$disconnect();
    process.exit(fatal.length && !accepted.length ? 1 : 0);
  }

  if (fatal.length && !skipInvalid) {
    console.log(`\nABORTED: ${fatal.length} row(s) would be rejected.`);
    console.log('Fix the file, or re-run with --skip-invalid to import the valid rows only.');
    await prisma.$disconnect();
    process.exit(1);
  }

  if (!accepted.length) {
    console.log('\nNothing to import.');
    await prisma.$disconnect();
    process.exit(1);
  }

  // ── Write ──────────────────────────────────────────────────────────
  console.log(`\nWriting ${accepted.length} ${type} record(s)...`);
  let written = 0;

  if (type === 'alumni') {
    for (const a of accepted) {
      await prisma.alumniProfile.create({ data: a });
      written++;
    }
  }

  if (type === 'employers') {
    for (const e of accepted) {
      const { _email, ...rest } = e;
      const user = await prisma.user.create({
        data: {
          email: _email,
          // Random: the employer must use "forgot password" to set their own.
          password: await bcrypt.hash(crypto.randomBytes(24).toString('base64url'), 12),
          role: 'EMPLOYER',
          isActive: true,
        },
      });
      await prisma.employerProfile.create({ data: { ...rest, userId: user.id } });
      written++;
    }
  }

  if (type === 'jobs') {
    for (const j of accepted) {
      await prisma.job.create({ data: j });
      written++;
    }
  }

  console.log(`\nImported ${written} ${type} record(s).`);
  if (type === 'alumni') {
    console.log('Reminder: new profiles default to employmentStatus UNSPECIFIED,');
    console.log('so they will not inflate unemployment until a status is recorded.');
  }
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error('\nImport failed:', e?.message || e);
  await prisma.$disconnect();
  process.exit(1);
});
