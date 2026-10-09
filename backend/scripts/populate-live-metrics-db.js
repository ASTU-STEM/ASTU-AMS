const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'data', 'dev-db.json');
const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

// 1. Ensure 5 Departments
const departments = [
  { id: 'dev-dept-swe', code: 'SWE', name: 'Software Engineering' },
  { id: 'dev-department-1787763781920', code: 'MEG', name: 'Mechanical Engineering' },
  { id: 'dev-dept-ece', code: 'ECE', name: 'Electrical and Computer Engineering' },
  { id: 'dev-dept-cve', code: 'CVE', name: 'Civil Engineering' },
  { id: 'dev-dept-ans', code: 'ANS', name: 'Applied Natural Sciences & Technology' },
];

db.departments = departments;

// 2. Ethiopian first and last names for realistic generation
const firstNamesMale = [
  'Abebe', 'Bekele', 'Chala', 'Dawit', 'Ephrem', 'Fikru', 'Girma', 'Habtamu', 'Iyasu', 'Jemal',
  'Kassahun', 'Lema', 'Mulugeta', 'Natnael', 'Omer', 'Paulos', 'Robel', 'Samuel', 'Tariku', 'Worku',
  'Yohannes', 'Zelalem', 'Alazar', 'Bereket', 'Cherinet', 'Daniel', 'Ermias', 'Fasika', 'Getachew', 'Henok'
];
const firstNamesFemale = [
  'Almaz', 'Aster', 'Bethlehem', 'Danayit', 'Eden', 'Fantu', 'Genet', 'Hanna', 'Idil', 'Jerusalem',
  'Kalkidan', 'Lemlem', 'Meron', 'Nebiyat', 'Rahel', 'Sara', 'Tigist', 'Weinshet', 'Yemisrach', 'Zinash',
  'Selamawit', 'Blen', 'Feven', 'Hermela', 'Mahlet', 'Sosina', 'Tsion', 'Wubet', 'Saron', 'Ruth'
];
const lastNames = [
  'Tadesse', 'Alemu', 'Kebede', 'Desta', 'Tesfaye', 'Haile', 'Worku', 'Mengistu', 'Girma', 'Assefa',
  'Demissie', 'Tekle', 'Gebre', 'Ayele', 'Berhanu', 'Tolosa', 'Gudina', 'Kassa', 'Mekonnen', 'Wondimu',
  'Negash', 'Beyene', 'Bekele', 'Tilahun', 'Zewde', 'Bogale', 'Chala', 'Derese', 'Fikre', 'Gemechu'
];

const industries = [
  'Information Technology & Software',
  'Telecommunications',
  'Aviation & Aerospace',
  'Banking, FinTech & Insurance',
  'Civil Infrastructure & Construction',
  'Manufacturing & Industrial Engineering',
  'Renewable Energy & Power Systems',
  'Research & Advanced Computing',
  'Automotive & Transportation',
  'AgriTech & Food Processing'
];

const topCompanies = [
  'Safaricom Ethiopia', 'Ethio Telecom', 'Ethiopian Airlines', 'Commercial Bank of Ethiopia',
  'Dashen Bank', 'Awash International Bank', 'Bank of Abyssinia', 'Zemen Bank',
  'Kuraz Technologies', 'Gebeya Inc.', 'Kifiya Financial Technology', 'Chapa Financial Technologies',
  'Information Network Security Administration (INSA)', 'Ethiopian Artificial Intelligence Institute',
  'Ethiopian Electric Power', 'Ethiopian Roads Administration', 'MIDROC Investment Group',
  'Dangote Cement Ethiopia', 'Huawei Technologies Ethiopia', 'Google East Africa',
  'Microsoft Africa Research', 'IBM East Africa', 'Meta Connectivity Partners', 'Amazon Web Services (East Africa)',
  'Appointed Labs', 'Minab Tech Hub', 'Sheba Valley Software', 'Nile Tech Solutions',
  'Sunbird Bioenergy Africa', 'Oromia International Bank', 'Cooperative Bank of Oromia'
];

// Skills by Department
const deptSkills = {
  SWE: ['React', 'TypeScript', 'Node.js', 'Python', 'Docker', 'PostgreSQL', 'GraphQL', 'AWS', 'Kubernetes', 'Go'],
  MEG: ['SolidWorks', 'AutoCAD', 'Finite Element Analysis', 'MATLAB', 'HVAC Design', 'Robotics', 'Thermodynamics', 'CNC Machining'],
  ECE: ['Embedded C', 'FPGA', 'PCB Design', 'IoT Architectures', 'Signal Processing', 'PLC Programming', 'Microcontrollers', 'Telecom Protocols'],
  CVE: ['Structural Analysis', 'ETABS', 'AutoCAD Civil 3D', 'Revit', 'Project Management', 'Geotechnical Surveying', 'Highway Design'],
  ANS: ['Data Science', 'Machine Learning', 'Statistical Modeling', 'Bioinformatics', 'Python', 'R', 'Analytical Chemistry', 'Remote Sensing']
};

// 3. Ensure 1,238 Alumni Profiles
if (!db.alumniProfiles) db.alumniProfiles = [];
const currentAlumniCount = db.alumniProfiles.length;
const targetAlumniCount = 1238;

console.log(`Current alumni profiles: ${currentAlumniCount}. Target: ${targetAlumniCount}`);

for (let i = currentAlumniCount; i < targetAlumniCount; i++) {
  const isFemale = i % 2 === 0;
  const firstName = isFemale 
    ? firstNamesFemale[i % firstNamesFemale.length] 
    : firstNamesMale[i % firstNamesMale.length];
  const lastName = lastNames[(i * 7) % lastNames.length];
  const fullName = `${firstName} ${lastName}`;
  const deptObj = departments[i % departments.length];
  const gradYear = 1997 + (i % (2025 - 1997 + 1));
  const studentId = `ASTU/${deptObj.code}/${1000 + i}/${String(gradYear).slice(-2)}`;
  
  // Employment distribution: ~88% employed/self-employed
  const empRand = (i * 13) % 100;
  let employmentStatus = 'EMPLOYED';
  if (empRand > 90) {
    employmentStatus = 'UNEMPLOYED';
  } else if (empRand > 80) {
    employmentStatus = 'SELF_EMPLOYED';
  }

  const company = topCompanies[i % topCompanies.length];
  const skills = deptSkills[deptObj.code].slice(0, 3 + (i % 3));
  const cgpa = Number((3.0 + ((i % 100) / 100)).toFixed(2));

  db.alumniProfiles.push({
    id: `dev-alumni-seeded-${1000 + i}`,
    userId: `seeded-user-${1000 + i}`,
    studentId,
    fullName,
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@alumni.astu.edu.et`,
    cgpa,
    graduationYear: gradYear,
    gender: isFemale ? 'Female' : 'Male',
    departmentId: deptObj.id,
    status: 'ACTIVE',
    skills,
    isVerified: true,
    employmentStatus,
    salary: employmentStatus === 'UNEMPLOYED' ? 0 : 22000 + (i % 60) * 1000,
    preferences: {
      company: employmentStatus === 'UNEMPLOYED' ? null : company,
      currentRole: `${deptObj.name} Professional`,
      location: i % 5 === 0 ? 'International / Remote' : (i % 2 === 0 ? 'Addis Ababa' : 'Adama')
    },
    createdAt: new Date(Date.now() - (targetAlumniCount - i) * 3600000).toISOString(),
    updatedAt: new Date().toISOString()
  });
}

// 4. Ensure 500 Corporate Partner Enterprises
if (!db.employerProfiles) db.employerProfiles = [];
const currentEmployerCount = db.employerProfiles.length;
const targetEmployerCount = 500;

console.log(`Current employer profiles: ${currentEmployerCount}. Target: ${targetEmployerCount}`);

const enterprisePrefixes = [
  'Alliance', 'Apex', 'Horizon', 'Vanguard', 'Global', 'Prime', 'Zenith', 'Summit',
  'Pioneer', 'Crown', 'United', 'National', 'Beacon', 'Atlas', 'Starlight', 'Novus',
  'Omega', 'Quantum', 'Nexus', 'Vertex', 'Dynamic', 'Integrity', 'Equinox', 'Radiant'
];
const enterpriseSuffixes = [
  'Technologies', 'Industries', 'Engineering Group', 'Solutions', 'Holdings',
  'Enterprises', 'Systems Africa', 'Innovations', 'Consulting', 'Corporation',
  'Labs', 'Infrastructure', 'Networks', 'Robotics', 'Aviation Partners', 'Energy Corp'
];
const locations = ['Addis Ababa', 'Adama', 'Hawassa', 'Dire Dawa', 'Bahir Dar', 'Nairobi, Kenya', 'Dubai, UAE', 'London, UK', 'Silicon Valley, USA'];

for (let i = currentEmployerCount; i < targetEmployerCount; i++) {
  let companyName = topCompanies[i % topCompanies.length];
  if (i >= topCompanies.length) {
    const pre = enterprisePrefixes[i % enterprisePrefixes.length];
    const suf = enterpriseSuffixes[(i * 3) % enterpriseSuffixes.length];
    const city = locations[i % locations.length].split(',')[0];
    companyName = `${pre} ${suf} (${city})`;
  } else {
    companyName = `${companyName} [Unit ${i + 1}]`;
  }

  const industry = industries[i % industries.length];
  const loc = locations[i % locations.length];

  db.employerProfiles.push({
    id: `dev-employer-seeded-${1000 + i}`,
    userId: `employer-user-${1000 + i}`,
    companyName,
    industry,
    location: loc,
    hrContact: `talent@${companyName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
    website: `https://${companyName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
    description: `Official enterprise hiring & industry innovation partner with Adama Science and Technology University.`,
    companySize: i % 4 === 0 ? '500+ employees' : (i % 2 === 0 ? '100-500 employees' : '50-100 employees'),
    isVerified: true,
    createdAt: new Date(Date.now() - (targetEmployerCount - i) * 86400000).toISOString(),
    updatedAt: new Date().toISOString()
  });
}

// 5. Ensure Digital Requests (documentRequests & verificationRequests) Total 2,500+
if (!db.documentRequests) db.documentRequests = [];
if (!db.verificationRequests) db.verificationRequests = [];

const currentRequests = db.documentRequests.length + db.verificationRequests.length;
const targetRequests = 2500;
console.log(`Current requests: ${currentRequests}. Target: ${targetRequests}`);

const docTypes = ['OFFICIAL_TRANSCRIPT', 'DEGREE_CERTIFICATE', 'MEDIUM_OF_INSTRUCTION', 'RECOMMENDATION_LETTER', 'STUDENT_COPY'];
for (let i = db.documentRequests.length; i < 2100; i++) {
  db.documentRequests.push({
    id: `dev-doc-req-${1000 + i}`,
    alumniId: `dev-alumni-seeded-${1000 + (i % 1200)}`,
    type: docTypes[i % docTypes.length],
    status: i % 5 === 0 ? 'PENDING' : 'APPROVED',
    createdAt: new Date(Date.now() - i * 1800000).toISOString(),
    updatedAt: new Date().toISOString()
  });
}

for (let i = db.verificationRequests.length; i < 400; i++) {
  db.verificationRequests.push({
    id: `dev-verif-req-${1000 + i}`,
    companyName: topCompanies[i % topCompanies.length],
    candidateName: `ASTU Alumnus Candidate ${i + 1}`,
    status: 'APPROVED',
    createdAt: new Date(Date.now() - i * 3600000).toISOString(),
    updatedAt: new Date().toISOString()
  });
}

// 6. Ensure active jobs count is realistic (e.g. 142 jobs)
if (!db.jobs) db.jobs = [];
const jobTitles = [
  'Senior Software Engineer (Go/Kubernetes)',
  'Embedded Systems Firmware Developer',
  'HVAC Design & Energy Auditor',
  'Structural BIM Engineer',
  'Machine Learning Research Fellow',
  'Telecommunications Network Specialist',
  'Full Stack React/Node Engineer',
  'Robotics & Automation Specialist',
  'Highway & Geotechnical Engineer',
  'Data Platform Engineer'
];

for (let i = db.jobs.length; i < 142; i++) {
  const emp = db.employerProfiles[i % db.employerProfiles.length];
  db.jobs.push({
    id: `dev-job-seeded-${1000 + i}`,
    employerId: emp.id,
    title: `${jobTitles[i % jobTitles.length]}`,
    location: emp.location,
    salary: '35,000 - 65,000 ETB',
    employmentType: 'FULL_TIME',
    isActive: true,
    views: 120 + (i * 11) % 400,
    createdAt: new Date(Date.now() - i * 7200000).toISOString(),
    deadline: new Date(Date.now() + 30 * 86400000).toISOString()
  });
}

fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf8');

console.log('✅ Successfully seeded real live counts into dev-db.json:');
console.log(`- Alumni Profiles: ${db.alumniProfiles.length}`);
console.log(`- Employer Profiles: ${db.employerProfiles.length}`);
console.log(`- Departments: ${db.departments.length}`);
console.log(`- Jobs: ${db.jobs.length}`);
console.log(`- Document Requests: ${db.documentRequests.length}`);
console.log(`- Verification Requests: ${db.verificationRequests.length}`);
console.log(`- Total Digital Requests: ${db.documentRequests.length + db.verificationRequests.length}`);
