const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.join(__dirname, '..', 'data', 'dev-db.json');
const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

const defaultPasswordHash = bcrypt.hashSync('astu_ams_pass123', 10);

const users = [
  {
    id: 'user-admin-1',
    email: 'admin@astu.edu.et',
    password: defaultPasswordHash,
    role: 'ADMIN',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'user-registrar-1',
    email: 'registrar@astu.edu.et',
    password: defaultPasswordHash,
    role: 'REGISTRAR',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'user-cms-1',
    email: 'alumnioffice@astu.edu.et',
    password: defaultPasswordHash,
    role: 'ALUMNI_OFFICE',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'user-dept-1',
    email: 'depthead.swe@astu.edu.et',
    password: defaultPasswordHash,
    role: 'DEPARTMENT_HEAD',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'test-employer-user-uuid',
    email: 'safaricom@mail.com',
    password: defaultPasswordHash,
    role: 'EMPLOYER',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'e2e-alumni-user',
    email: 'helen@alumni.com',
    password: defaultPasswordHash,
    role: 'ALUMNI',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'test-alumni-user-uuid',
    email: 'bob@alumni.com',
    password: defaultPasswordHash,
    role: 'ALUMNI',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

db.users = users;

if (!db.departments || db.departments.length === 0) {
  db.departments = [
    { id: 'dev-department-1787763781920', code: 'MEG', name: 'Mechanical Engineering' },
    { id: 'dev-dept-swe', code: 'SWE', name: 'Software Engineering' },
    { id: 'dev-dept-ece', code: 'ECE', name: 'Electrical and Computer Engineering' },
    { id: 'dev-dept-cve', code: 'CVE', name: 'Civil Engineering' }
  ];
}

// The department head user is useless without a head profile: every /departments/my-*
// and /surveys/templates call resolves the head's department through this record and
// 403s without it. Resolve SWE by code so we never point at a department id that is
// absent from the data file.
const sweDepartment =
  (db.departments || []).find((d) => d.code === 'SWE') ||
  (db.departments || []).find((d) => /software/i.test(d.name || '')) ||
  null;

if (!sweDepartment) {
  console.warn('No SWE department found; skipping departmentHeadProfile for user-dept-1.');
} else {
  if (!Array.isArray(db.departmentHeadProfiles)) db.departmentHeadProfiles = [];
  const existing = db.departmentHeadProfiles.find((p) => p && p.userId === 'user-dept-1');
  if (existing) {
    existing.departmentId = sweDepartment.id;
  } else {
    db.departmentHeadProfiles.push({
      id: 'dev-depthead-user-dept-1',
      userId: 'user-dept-1',
      departmentId: sweDepartment.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }
  console.log('Assigned user-dept-1 as department head of', sweDepartment.code, '(' + sweDepartment.id + ')');
}

fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
console.log('Successfully seeded users with bcrypt password astu_ams_pass123. Total users:', db.users.length);
