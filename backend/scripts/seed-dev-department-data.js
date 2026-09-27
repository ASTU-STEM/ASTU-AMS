/**
 * Seeds realistic Software Engineering alumni + work experience fixtures into the
 * local dev store so department analytics have something meaningful to show.
 *
 * Safe to re-run: everything it owns is tagged with SEED_TAG and replaced wholesale.
 * Also purges `UGR/TEST/9999_*` rows, which leaked from the auth test suite before
 * `alumniProfile.delete` was implemented on the fallback Prisma client.
 *
 * Usage: node scripts/seed-dev-department-data.js [--dry-run]
 */
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'data', 'dev-db.json');
const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
const DRY_RUN = process.argv.includes('--dry-run');

const SEED_TAG = 'dept-fixture-v1';
const DEPARTMENT_ID = 'dept-swe';

// Deterministic PRNG so repeated runs produce identical data.
function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(20260926);
const pick = (arr) => arr[Math.floor(rand() * arr.length)];
const between = (min, max) => min + rand() * (max - min);
const sample = (arr, n) => {
  const copy = [...arr];
  const out = [];
  for (let i = 0; i < n && copy.length; i++) out.push(copy.splice(Math.floor(rand() * copy.length), 1)[0]);
  return out;
};

const FIRST_NAMES_M = [
  'Abebe', 'Dawit', 'Yonas', 'Bekele', 'Tewodros', 'Solomon', 'Eyob', 'Fitsum',
  'Natnael', 'Kirubel', 'Michael', 'Samuel', 'Daniel', 'Yared', 'Henok', 'Surafel',
  'Mahlet', 'Amanuel', 'Biruk', 'Caleb', 'Dagmawi', 'Eyoel', 'Girma', 'Habtamu',
];
const FIRST_NAMES_F = [
  'Sara', 'Marta', 'Hanna', 'Rahel', 'Bethel', 'Selam', 'Meron', 'Liya',
  'Saron', 'Mahlet', 'Zemzem', 'Hiwot', 'Tirunesh', 'Ruth', 'Bezawit', 'Frequent',
  'Kidist', 'Segen', 'Alemit', 'Mekdes', 'Yeshi', 'Wubet', 'Genet', 'Tsehay',
];
const LAST_NAMES = [
  'Kebede', 'Tesfaye', 'Bekele', 'Girma', 'Alemu', 'Wondimu', 'Hailu', 'Mengist',
  'Tadesse', 'Getachew', 'Worku', 'Belay', 'Yimer', 'Demeke', 'Gebre', 'Sahle',
  'Mekonnen', 'Teshome', 'Fekadu', 'Welde', 'Zewdu', 'Girma', 'Ayele', 'Bekele',
];

const COMPANIES = [
  { name: 'Addis Cloud Labs', industry: 'Cloud & Infrastructure' },
  { name: 'Nile Software Group', industry: 'Software & Tech' },
  { name: 'Sheba Fintech', industry: 'Fintech' },
  { name: 'Habesha Dataworks', industry: 'Data Analytics' },
  { name: 'Blue Nile Telecom', industry: 'Telecommunications' },
  { name: 'Awash Agritech', industry: 'Agritech' },
  { name: 'Rift Valley Systems', industry: 'Software & Tech' },
  { name: 'Lalibela Digital', industry: 'E-commerce' },
  { name: 'Sidama Health Tech', industry: 'HealthTech' },
  { name: 'Oromo Mobile Labs', industry: 'Mobile & Apps' },
  { name: 'Debre Markos Cyber', industry: 'Cybersecurity' },
  { name: 'Bahir Dar Networks', industry: 'Telecommunications' },
  { name: 'Gondar EdTech', industry: 'EdTech' },
  { name: 'Mekelle Security', industry: 'Cybersecurity' },
  { name: 'Jimma Health Systems', industry: 'HealthTech' },
  { name: 'Tigray Data Corp', industry: 'Data Analytics' },
  { name: 'Dire Dawa Ventures', industry: 'Consulting' },
  { name: 'Hawassa IoT', industry: 'Software & Tech' },
  { name: 'Adama Logistics Tech', industry: 'Logistics & Supply Chain' },
  { name: 'Tana Software', industry: 'Software & Tech' },
];

const LOCATIONS = [
  'Addis Ababa', 'Addis Ababa', 'Addis Ababa', 'Addis Ababa',
  'Bole, Addis Ababa', 'Kirkos, Addis Ababa', 'Remote', 'Remote',
  'Adama', 'Bahir Dar', 'Hawassa', 'Dire Dawa', 'Mekelle', 'Jimma', 'Gondar',
];

const SKILL_POOL = [
  'JavaScript', 'TypeScript', 'React', 'Redux', 'Next.js', 'Node.js', 'Express',
  'Python', 'Django', 'FastAPI', 'Java', 'Spring Boot', 'C#', '.NET', 'Go', 'Rust',
  'PHP', 'Laravel', 'MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'GraphQL', 'REST API',
  'Docker', 'Kubernetes', 'AWS', 'Terraform', 'CI/CD', 'Git', 'Linux', 'Nginx',
  'Microservices', 'System Design', 'Data Structures', 'Algorithms', 'Flutter',
  'Dart', 'React Native', 'Android', 'iOS', 'Swift', 'HTML', 'CSS', 'Tailwind CSS',
  'Figma', 'Machine Learning', 'Pandas', 'Power BI', 'Tableau', 'ETL', 'DevOps',
  'Scrum', 'Agile', 'Selenium', 'Cybersecurity', 'Network Security', 'Unit Testing',
];

// Seniority by years since graduation; drives position title and salary band.
function trackFor(yearsSince) {
  if (yearsSince >= 4) {
    return {
      titles: ['Senior Software Engineer', 'Tech Lead', 'Lead Backend Engineer', 'Principal Engineer'],
      bands: ['80k-110k', '70k-95k', '90k-120k'],
      salary: [62000, 98000],
    };
  }
  if (yearsSince >= 2) {
    return {
      titles: ['Software Engineer II', 'Full Stack Engineer', 'Backend Engineer', 'Frontend Engineer'],
      bands: ['40k-60k', '35k-55k', '45k-65k'],
      salary: [38000, 62000],
    };
  }
  return {
    titles: ['Junior Software Engineer', 'Graduate Software Engineer', 'Software Engineer', 'Associate Engineer'],
    bands: ['18k-30k', '15k-25k', '20k-35k'],
    salary: [16000, 34000],
  };
}

// Per-cohort shape. Recent graduates are far less likely to be placed, which is
// what makes the employment-trend chart on the dashboard meaningful.
const COHORTS = [
  { year: 2021, size: 7, placed: 6, selfEmployed: 1 },
  { year: 2022, size: 8, placed: 7, selfEmployed: 1 },
  { year: 2023, size: 9, placed: 7, selfEmployed: 1 },
  { year: 2024, size: 10, placed: 7, selfEmployed: 1 },
  { year: 2025, size: 10, placed: 4, selfEmployed: 1 },
];

const GRAD_MONTH = 6; // July graduation
const CURRENT_YEAR = 2026;

const usedEmails = new Set();
function makeEmail(first, last, studentId) {
  const base = `${first}.${last}`.toLowerCase().replace(/[^a-z.]/g, '');
  let email = `${base}@alumni.astu.edu.et`;
  if (usedEmails.has(email)) email = `${base}.${studentId.slice(-4).toLowerCase()}@alumni.astu.edu.et`;
  usedEmails.add(email);
  return email;
}

function buildAlumni() {
  const alumni = [];
  const experiences = [];
  let counter = 0;

  for (const cohort of COHORTS) {
    const yearsSince = CURRENT_YEAR - cohort.year;
    const track = trackFor(yearsSince);
    const statuses = [
      ...Array(cohort.placed).fill('EMPLOYED'),
      ...Array(cohort.selfEmployed).fill('SELF_EMPLOYED'),
      ...Array(Math.max(0, cohort.size - cohort.placed - cohort.selfEmployed)).fill('UNEMPLOYED'),
    ];

    for (const employmentStatus of statuses) {
      counter += 1;
      const isFemale = rand() < 0.42;
      const first = isFemale ? pick(FIRST_NAMES_F) : pick(FIRST_NAMES_M);
      const last = pick(LAST_NAMES);
      const fullName = `${first} ${last}`;
      const studentId = `UGR/SWE/${cohort.year}/${String(counter).padStart(3, '0')}`;
      const id = `dev-alumni-swe-${cohort.year}-${String(counter).padStart(3, '0')}`;
      const now = new Date().toISOString();
      const cgpa = Math.round(between(2.85, 3.98) * 100) / 100;
      const placed = employmentStatus === 'EMPLOYED' || employmentStatus === 'SELF_EMPLOYED';

      // A small share of international alumni exercises the mobility analytics.
      const nationality = rand() < 0.06 ? pick(['Kenya', 'India', 'United States']) : 'Ethiopia';

      const rec = {
        id,
        userId: null,
        studentId,
        fullName,
        email: makeEmail(first, last, studentId),
        phone: `+2519${String(Math.floor(between(10000000, 99999999)))}`,
        cgpa,
        graduationYear: cohort.year,
        gender: isFemale ? 'FEMALE' : 'MALE',
        dateOfBirth: `${cohort.year - 22}-${String(1 + Math.floor(rand() * 12)).padStart(2, '0')}-${String(1 + Math.floor(rand() * 28)).padStart(2, '0')}T00:00:00.000Z`,
        departmentId: DEPARTMENT_ID,
        registrarRecordId: null,
        status: 'ACTIVE',
        employmentStatus,
        salary: placed ? Math.round(between(track.salary[0], track.salary[1]) / 500) * 500 : null,
        isVerified: rand() < 0.9,
        isCgpaPublic: true,
        pendingPasswordHash: null,
        profilePicture: null,
        bio: placed
          ? `${last} is a ${track.titles[0].toLowerCase()} based in ${pick(LOCATIONS)}. Focused on ${sample(SKILL_POOL, 3).join(', ')}.`
          : `${last} graduated with a CGPA of ${cgpa} and is currently seeking a software engineering role.`,
        nationality,
        maritalStatus: rand() < 0.45 ? 'SINGLE' : 'MARRIED',
        volunteerWork: rand() < 0.2 ? 'Mentoring secondary school students in programming clubs.' : null,
        address: `${pick(['Bole', 'Kirkos', 'Arada', 'Gulele', 'Bole', 'Kirkos'])}, Addis Ababa, Ethiopia`,
        languages: rand() < 0.75 ? ['Amharic', 'English'] : ['Amharic', 'English', 'Oromo'],
        preferences: {},
        skills: sample(SKILL_POOL, 5 + Math.floor(rand() * 6)),
        resumeUrl: placed ? `https://resumes.astu.edu.et/${studentId.replace(/\//g, '_')}.pdf` : null,
        linkedIn: `https://linkedin.com/in/${first.toLowerCase()}-${last.toLowerCase()}-${cohort.year}`,
        gitHub: `https://github.com/${first.toLowerCase()}${last.toLowerCase()}`,
        portfolio: rand() < 0.7 ? `https://${first.toLowerCase()}${last.toLowerCase()}.dev` : null,
        telegram: null,
        twitterUrl: null,
        seedTag: SEED_TAG,
        createdAt: now,
        updatedAt: now,
      };

      alumni.push(rec);

      if (employmentStatus === 'EMPLOYED') {
        const company = pick(COMPANIES);
        // Hired a plausible 1-9 months after the July graduation date.
        const monthsAfterGrad = 1 + Math.floor(rand() * 9);
        const start = new Date(Date.UTC(cohort.year, GRAD_MONTH, 1));
        start.setUTCMonth(start.getUTCMonth() + monthsAfterGrad);
        experiences.push({
          id: `dev-exp-${id}`,
          alumniId: id,
          companyName: company.name,
          position: pick(track.titles),
          industry: company.industry,
          salaryRange: pick(track.bands),
          location: pick(LOCATIONS),
          isCurrent: true,
          startDate: start.toISOString(),
          endDate: null,
          createdAt: now,
        });
      } else if (employmentStatus === 'SELF_EMPLOYED') {
        // Freelance/own-company: no external company, but still counts as placed.
        const start = new Date(Date.UTC(cohort.year, GRAD_MONTH + 6, 1));
        experiences.push({
          id: `dev-exp-${id}`,
          alumniId: id,
          companyName: `${first}'s Studio`,
          position: 'Founder & Software Engineer',
          industry: 'Entrepreneurship',
          salaryRange: 'Variable',
          location: 'Remote',
          isCurrent: true,
          startDate: start.toISOString(),
          endDate: null,
          createdAt: now,
        });
      }
    }
  }

  return { alumni, experiences };
}

function main() {
  const department = (db.departments || []).find((d) => d.id === DEPARTMENT_ID);
  if (!department) {
    console.error(`Cannot seed: department ${DEPARTMENT_ID} not found.`);
    process.exit(1);
  }

  // 1. Drop anything this script previously owned.
  const staleAlumni = (db.alumniProfiles || []).filter(
    (a) => a.seedTag === SEED_TAG || String(a.studentId || '').startsWith('UGR/TEST/9999')
  );
  const staleIds = new Set(staleAlumni.map((a) => a.id));

  // 2. Drop test-suite leftovers.
  const leaked = (db.alumniProfiles || []).filter((a) => String(a.studentId || '').startsWith('UGR/TEST/9999'));

  db.alumniProfiles = (db.alumniProfiles || []).filter((a) => !staleIds.has(a.id));
  const beforeExp = (db.workExperiences || []).length;
  db.workExperiences = (db.workExperiences || []).filter((e) => !staleIds.has(e.alumniId));
  const droppedExp = beforeExp - db.workExperiences.length;

  // 3. Insert the fresh cohort.
  const { alumni, experiences } = buildAlumni();
  db.alumniProfiles.push(...alumni);
  db.workExperiences.push(...experiences);

  // 4. Leave the most recently placed senior roles as historical records too, so the
  //    "time to hire" and prior-role views are not all single-role.
  if (DRY_RUN) {
    console.log('[dry-run] would write:');
    console.log(`  alumni removed : ${staleAlumni.length} (${leaked.length} leaked test rows)`);
    console.log(`  experiences removed: ${droppedExp}`);
    console.log(`  alumni added   : ${alumni.length}`);
    console.log(`  experiences added: ${experiences.length}`);
    return;
  }

  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2) + '\n');

  const placed = alumni.filter((a) => a.employmentStatus !== 'UNEMPLOYED').length;
  const salaried = alumni.filter((a) => typeof a.salary === 'number' && a.salary > 0);
  const avg = Math.round(salaried.reduce((s, a) => s + a.salary, 0) / salaried.length);

  console.log(`Seeded ${alumni.length} ${department.code} alumni across ${COHORTS.length} cohorts.`);
  console.log(`  removed ${staleAlumni.length} stale rows (${leaked.length} leaked test rows) + ${droppedExp} experiences`);
  console.log(`  added ${experiences.length} work experiences`);
  console.log(`  placed ${placed}/${alumni.length} (${((placed / alumni.length) * 100).toFixed(1)}% employment rate)`);
  console.log(`  average salary ${avg.toLocaleString('en-US')} ETB across ${salaried.length} salaried alumni`);
  for (const c of COHORTS) {
    const inCohort = alumni.filter((a) => a.graduationYear === c.year);
    const inPlaced = inCohort.filter((a) => a.employmentStatus !== 'UNEMPLOYED').length;
    console.log(`    ${c.year}: ${inPlaced}/${inCohort.length} placed (${((inPlaced / inCohort.length) * 100).toFixed(0)}%)`);
  }
}

main();
