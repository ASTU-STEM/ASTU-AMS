const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.join(__dirname, '..', 'data', 'dev-db.json');
const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

const defaultPasswordHash = bcrypt.hashSync('astu_ams_pass123', 10);

const users = [
  {
    id: 'user-super-admin-1',
    email: 'superadmin@astu.edu.et',
    password: defaultPasswordHash,
    role: 'SUPER_ADMIN',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'user-super-admin-2',
    email: 'admin@astust.edu.et',
    password: defaultPasswordHash,
    role: 'SUPER_ADMIN',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
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
  },
  {
    id: 'alice-alumni-user',
    email: 'alice@alumni.com',
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

fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
console.log('Successfully seeded users with bcrypt password astu_ams_pass123. Total users:', db.users.length);
