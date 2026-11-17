export interface AlumniRegistration {
  id: string;
  contentId: string;
  contentTitle: string;
  fullName: string;
  studentId: string;
  email: string;
  phone: string;
  classYear: string;
  department: string;
  currentEmployer: string;
  jobTitle: string;
  employmentStatus: 'Employed Full-time' | 'Self-employed / Founder' | 'Further Studies' | 'Seeking Opportunities';
  salaryRange?: string;
  registeredAt: string;
  status: 'Confirmed' | 'Pending Verification' | 'Pending Approval' | 'Waitlisted' | 'Attended' | 'Rejected';
  accreditationVerified: boolean;
  notes?: string;
  eventCustomAnswers?: Record<string, string>;
}

export interface RegistrationFormConfig {
  formTitle: string;
  formSubtitle: string;
  noticeBanner: string;
  requireStudentId: boolean;
  requirePhone: boolean;
  requireEmployer: boolean;
  requireSalary: boolean;
  requireDepartment: boolean;
  successMessage: string;
  allowPublicRegistration: boolean;
}

const STORAGE_KEY = 'astu_ams_alumni_registrations';
const CONFIG_STORAGE_KEY = 'astu_ams_registration_form_config';

const DEFAULT_FORM_CONFIG: RegistrationFormConfig = {
  formTitle: 'ASTU Alumni Membership & Event Registration',
  formSubtitle: 'Join the official Adama Science and Technology University graduate network and register for upcoming university campaigns.',
  noticeBanner: 'Fulfills Ministry of Education and ETA accreditation compliance requirements.',
  requireStudentId: true,
  requirePhone: true,
  requireEmployer: true,
  requireSalary: false,
  requireDepartment: true,
  successMessage: 'Thank you for registering! Your alumni record has been submitted to the ASTU Directorate.',
  allowPublicRegistration: true,
};

const INITIAL_REGISTRATIONS: AlumniRegistration[] = [
  {
    id: 'REG-1001',
    contentId: 'C-003',
    contentTitle: 'Annual Tracer Study Survey Campaign 2026 (ETA Compliance)',
    fullName: 'Yared Hailu Tadesse',
    studentId: 'UGR/14205/12',
    email: 'yared.hailu@gmail.com',
    phone: '+251 91 123 4567',
    classYear: 'Class of 2022',
    department: 'Software Engineering',
    currentEmployer: 'Safaricom Ethiopia',
    jobTitle: 'Senior Cloud Engineer',
    employmentStatus: 'Employed Full-time',
    salaryRange: '45,000 - 60,000 ETB',
    registeredAt: '2026-06-02 09:15 AM',
    status: 'Confirmed',
    accreditationVerified: true,
    notes: 'Verified against Registrar database record.',
  },
  {
    id: 'REG-1002',
    contentId: 'C-003',
    contentTitle: 'Annual Tracer Study Survey Campaign 2026 (ETA Compliance)',
    fullName: 'Helina Sileshi Kebede',
    studentId: 'UGR/12890/11',
    email: 'helina.sileshi@astu.edu.et',
    phone: '+251 92 345 6789',
    classYear: 'Class of 2020',
    department: 'Computer Science',
    currentEmployer: 'ASTU AI Research Center',
    jobTitle: 'AI Research Fellow',
    employmentStatus: 'Employed Full-time',
    salaryRange: '35,000 - 45,000 ETB',
    registeredAt: '2026-06-02 10:40 AM',
    status: 'Confirmed',
    accreditationVerified: true,
    notes: 'Submitted full 24-month longitudinal survey.',
  },
  {
    id: 'REG-1003',
    contentId: 'C-003',
    contentTitle: 'Annual Tracer Study Survey Campaign 2026 (ETA Compliance)',
    fullName: 'Bekele Kebede Desta',
    studentId: 'UGR/09844/09',
    email: 'bekele@greengrid.et',
    phone: '+251 91 222 3344',
    classYear: 'Class of 2018',
    department: 'Electrical & Computer Engineering',
    currentEmployer: 'GreenGrid Labs Ethiopia',
    jobTitle: 'Engineering Director & Co-Founder',
    employmentStatus: 'Self-employed / Founder',
    salaryRange: '80,000+ ETB',
    registeredAt: '2026-06-03 02:10 PM',
    status: 'Confirmed',
    accreditationVerified: true,
    notes: 'Employer partner representative and alumnus.',
  },
  {
    id: 'REG-1004',
    contentId: 'C-001',
    contentTitle: 'ASTU Grand Alumni Homecoming & Networking Gala 2026',
    fullName: 'Kalkidan Bekele Wolde',
    studentId: 'UGR/11045/10',
    email: 'kalkidan.b@cbe.com.et',
    phone: '+251 93 456 7890',
    classYear: 'Class of 2019',
    department: 'Software Engineering',
    currentEmployer: 'Commercial Bank of Ethiopia',
    jobTitle: 'Fintech Solutions Lead',
    employmentStatus: 'Employed Full-time',
    salaryRange: '50,000 - 70,000 ETB',
    registeredAt: '2026-06-04 11:20 AM',
    status: 'Confirmed',
    accreditationVerified: true,
    notes: 'Addis Ababa Tech Chapter Organizer.',
  },
  {
    id: 'REG-1005',
    contentId: 'C-001',
    contentTitle: 'ASTU Grand Alumni Homecoming & Networking Gala 2026',
    fullName: 'Solomon Girma Gemechu',
    studentId: 'UGR/08120/08',
    email: 'solomon.g@industrialparks.gov.et',
    phone: '+251 91 555 6677',
    classYear: 'Class of 2017',
    department: 'Mechanical Engineering',
    currentEmployer: 'Adama Industrial Park Directorate',
    jobTitle: 'Operations & Plant Director',
    employmentStatus: 'Employed Full-time',
    salaryRange: '60,000 - 80,000 ETB',
    registeredAt: '2026-06-04 04:30 PM',
    status: 'Confirmed',
    accreditationVerified: true,
    notes: 'Keynote Speaker RSVP confirmed.',
  },
  {
    id: 'REG-1006',
    contentId: 'C-002',
    contentTitle: 'Senior Capstone & Alumni Industry Mentorship Cohort 2026',
    fullName: 'Dr. Henok Assefa Mengesha',
    studentId: 'UGR/06450/06',
    email: 'henok.assefa@northam.org',
    phone: '+1 416 890 1234',
    classYear: 'Class of 2015',
    department: 'Civil & Environmental Engineering',
    currentEmployer: 'Global Infrastructure Partners',
    jobTitle: 'Principal Research Scientist',
    employmentStatus: 'Employed Full-time',
    salaryRange: '100,000+ ETB equiv.',
    registeredAt: '2026-06-05 08:45 AM',
    status: 'Confirmed',
    accreditationVerified: true,
    notes: 'North America Diaspora Network Lead.',
  },
  {
    id: 'REG-1007',
    contentId: 'C-002',
    contentTitle: 'Senior Capstone & Alumni Industry Mentorship Cohort 2026',
    fullName: 'Ruth Alemu Zewdu',
    studentId: 'UGR/15600/13',
    email: 'ruth.alemu@astu.edu.et',
    phone: '+251 94 678 9012',
    classYear: 'Class of 2023',
    department: 'Chemical Engineering',
    currentEmployer: 'National Fertilizer Complex',
    jobTitle: 'Process Quality Engineer',
    employmentStatus: 'Employed Full-time',
    salaryRange: '30,000 - 40,000 ETB',
    registeredAt: '2026-06-05 01:15 PM',
    status: 'Confirmed',
    accreditationVerified: true,
    notes: 'Interested in mentoring female engineering seniors.',
  },
  {
    id: 'REG-1008',
    contentId: 'C-003',
    contentTitle: 'Annual Tracer Study Survey Campaign 2026 (ETA Compliance)',
    fullName: 'Dawit Mengistu Haile',
    studentId: 'UGR/16200/14',
    email: 'dawit.mengistu@ethiopower.com',
    phone: '+251 91 888 9900',
    classYear: 'Class of 2024',
    department: 'Mechanical Engineering',
    currentEmployer: 'Ethiopian Electric Power',
    jobTitle: 'Junior Turbine Specialist',
    employmentStatus: 'Employed Full-time',
    salaryRange: '25,000 - 35,000 ETB',
    registeredAt: '2026-06-06 09:30 AM',
    status: 'Pending Verification',
    accreditationVerified: false,
    notes: 'Awaiting graduation clearance cross-check.',
  },
  {
    id: 'REG-1009',
    contentId: 'C-002',
    contentTitle: 'Senior Capstone & Alumni Industry Mentorship Cohort 2026',
    fullName: 'Meron Tesfaye Negash',
    studentId: 'UGR/17100/14',
    email: 'meron.tesfaye@innovate.et',
    phone: '+251 92 777 8899',
    classYear: 'Class of 2024',
    department: 'Software Engineering',
    currentEmployer: 'Innovate Tech Addis',
    jobTitle: 'Associate Frontend Developer',
    employmentStatus: 'Employed Full-time',
    salaryRange: '25,000 - 35,000 ETB',
    registeredAt: '2026-06-06 03:00 PM',
    status: 'Confirmed',
    accreditationVerified: true,
    notes: 'Volunteer mentor for web application capstones.',
  },
  {
    id: 'REG-1010',
    contentId: 'C-001',
    contentTitle: 'ASTU Grand Alumni Homecoming & Networking Gala 2026',
    fullName: 'Aman Kassahun Desta',
    studentId: 'UGR/13500/12',
    email: 'aman.kassahun@telecom.et',
    phone: '+251 91 333 4455',
    classYear: 'Class of 2021',
    department: 'Electrical & Computer Engineering',
    currentEmployer: 'Ethio Telecom',
    jobTitle: '5G Core Network Engineer',
    employmentStatus: 'Employed Full-time',
    salaryRange: '40,000 - 55,000 ETB',
    registeredAt: '2026-06-07 10:00 AM',
    status: 'Confirmed',
    accreditationVerified: true,
    notes: 'Confirmed attendance with spouse.',
  },
];

export const registrationService = {
  getRegistrations(): AlumniRegistration[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch { /* ignore */ }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_REGISTRATIONS));
    return INITIAL_REGISTRATIONS;
  },

  saveRegistrations(list: AlumniRegistration[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    window.dispatchEvent(new Event('astu-ams-registrations-changed'));
  },

  getRegistrationsByContentId(contentId: string): AlumniRegistration[] {
    const list = this.getRegistrations();
    if (!contentId || contentId === 'all') return list;
    return list.filter((r) => r.contentId === contentId);
  },

  addRegistration(item: Omit<AlumniRegistration, 'id' | 'registeredAt'>): AlumniRegistration {
    const list = this.getRegistrations();
    const newReg: AlumniRegistration = {
      ...item,
      id: `REG-${Date.now()}`,
      registeredAt: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      accreditationVerified: item.accreditationVerified ?? true,
    };
    list.unshift(newReg);
    this.saveRegistrations(list);
    return newReg;
  },

  updateRegistrationStatus(id: string, status: AlumniRegistration['status']): void {
    const list = this.getRegistrations();
    const updated = list.map((r) => (r.id === id ? { ...r, status } : r));
    this.saveRegistrations(updated);
  },

  approveRegistration(id: string): void {
    this.updateRegistrationStatus(id, 'Confirmed');
  },

  declineRegistration(id: string): void {
    this.updateRegistrationStatus(id, 'Rejected');
  },

  updateRegistration(id: string, updates: Partial<AlumniRegistration>): void {
    const list = this.getRegistrations();
    const updated = list.map((r) => (r.id === id ? { ...r, ...updates } : r));
    this.saveRegistrations(updated);
  },

  toggleEtaVerified(id: string): void {
    const list = this.getRegistrations();
    const updated = list.map((r) => (r.id === id ? { ...r, accreditationVerified: !r.accreditationVerified } : r));
    this.saveRegistrations(updated);
  },

  getFormConfig(): RegistrationFormConfig {
    try {
      const stored = localStorage.getItem(CONFIG_STORAGE_KEY);
      if (stored) {
        return { ...DEFAULT_FORM_CONFIG, ...JSON.parse(stored) };
      }
    } catch { /* ignore */ }
    return DEFAULT_FORM_CONFIG;
  },

  saveFormConfig(config: RegistrationFormConfig): void {
    localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(config));
    window.dispatchEvent(new Event('astu-ams-registration-config-changed'));
  },

  deleteRegistration(id: string): void {
    const list = this.getRegistrations();
    const filtered = list.filter((r) => r.id !== id);
    this.saveRegistrations(filtered);
  },

  exportToCsv(registrationsToExport?: AlumniRegistration[]): void {
    const data = registrationsToExport || this.getRegistrations();
    if (data.length === 0) return;

    const headers = [
      'Registration ID',
      'Notice / Event Title',
      'Full Name',
      'Student ID',
      'Email',
      'Phone',
      'Graduation Class',
      'Department',
      'Current Employer',
      'Job Title',
      'Employment Status',
      'Salary Range',
      'Registered Date',
      'Status',
      'ETA Accreditation Verified',
      'Notes',
    ];

    const rows = data.map((r) => [
      `"${r.id}"`,
      `"${r.contentTitle.replace(/"/g, '""')}"`,
      `"${r.fullName.replace(/"/g, '""')}"`,
      `"${r.studentId}"`,
      `"${r.email}"`,
      `"${r.phone}"`,
      `"${r.classYear}"`,
      `"${r.department}"`,
      `"${r.currentEmployer.replace(/"/g, '""')}"`,
      `"${r.jobTitle.replace(/"/g, '""')}"`,
      `"${r.employmentStatus}"`,
      `"${r.salaryRange || 'N/A'}"`,
      `"${r.registeredAt}"`,
      `"${r.status}"`,
      `"${r.accreditationVerified ? 'YES' : 'NO'}"`,
      `"${(r.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `ASTU_Alumni_Registrations_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  exportToPdf(registrationsToExport?: AlumniRegistration[]): void {
    const data = registrationsToExport || this.getRegistrations();
    if (data.length === 0) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const rowsHtml = data
      .map(
        (r, idx) => `
        <tr>
          <td>${idx + 1}</td>
          <td><strong>${r.fullName}</strong><br/><span style="color:#64748b; font-family:monospace; font-size:11px;">${r.studentId}</span></td>
          <td>${r.department}<br/><span style="color:#64748b; font-size:11px;">${r.classYear}</span></td>
          <td><strong>${r.jobTitle}</strong><br/><span style="color:#003366; font-size:11px;">${r.currentEmployer}</span></td>
          <td><span style="padding: 2px 6px; border-radius: 4px; background: #e0f2fe; color: #0369a1; font-weight: bold; font-size: 10px;">${r.employmentStatus}</span></td>
          <td style="font-family:monospace; font-size:11px;">${r.registeredAt}</td>
          <td><span style="padding: 2px 6px; border-radius: 4px; background: ${r.status === 'Confirmed' ? '#dcfce7' : '#fef3c7'}; color: ${r.status === 'Confirmed' ? '#15803d' : '#b45309'}; font-weight: bold; font-size: 10px;">${r.status}</span></td>
          <td>${r.accreditationVerified ? '<span style="color:#16a34a; font-weight:bold; font-size:11px;">✓ ETA Verified</span>' : '<span style="color:#94a3b8; font-size:11px;">Pending</span>'}</td>
        </tr>
      `
      )
      .join('');

    const logoUrl = window.location.origin + '/images/astu-seal-logo.png';

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>ASTU Alumni Directorate — Registered Members Roster PDF Report</title>
          <style>
            @page { size: A4 landscape; margin: 15mm; }
            body { font-family: 'Segoe UI', Arial, sans-serif; padding: 20px; color: #0f172a; background: #fff; }
            .header { display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #003366; padding-bottom: 12px; margin-bottom: 16px; }
            .brand { display: flex; align-items: center; gap: 14px; }
            .logo-img { height: 60px; width: 60px; object-fit: contain; }
            .title { font-size: 18px; font-weight: 800; color: #003366; text-transform: uppercase; letter-spacing: 0.5px; }
            .subtitle { font-size: 11px; color: #475569; margin-top: 2px; }
            .meta { font-size: 10px; color: #475569; text-align: right; line-height: 1.4; }
            .badge { display: inline-block; background: #dcfce7; color: #15803d; font-weight: bold; padding: 2px 6px; border-radius: 4px; margin-top: 4px; }
            table { width: 100%; border-collapse: collapse; font-size: 11px; margin-top: 12px; }
            th { background: #003366; color: #ffffff; text-transform: uppercase; font-size: 9px; font-weight: 700; padding: 8px; text-align: left; letter-spacing: 0.5px; }
            td { border-bottom: 1px solid #e2e8f0; padding: 7px 8px; vertical-align: top; }
            tr:nth-child(even) { background: #f8fafc; }
            .footer { margin-top: 24px; border-top: 1px solid #cbd5e1; padding-top: 10px; font-size: 9px; color: #64748b; display: flex; justify-content: space-between; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="brand">
              <img src="${logoUrl}" alt="ASTU Logo" class="logo-img" onerror="this.src='/images/astu-seal-logo.png'" />
              <div>
                <div class="title">Adama Science & Technology University</div>
                <div class="subtitle">Official Directorate for Industry Linkage & Alumni Affairs — Roster Audit Report</div>
              </div>
            </div>
            <div class="meta">
              <div><strong>Report Date:</strong> ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
              <div><strong>Total Registrants:</strong> ${data.length} Alumni Members</div>
              <div class="badge">✓ ETA & HERQA Audit-Ready Roster</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Alumnus & Student ID</th>
                <th>Dept & Class</th>
                <th>Employer & Job Title</th>
                <th>Employment Status</th>
                <th>Registered Date</th>
                <th>Status</th>
                <th>Accreditation</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>

          <div class="footer">
            <div>Adama Science and Technology University (ASTU) • Main Campus, Adama, Ethiopia</div>
            <div>Generated via ASTU-AMS Alumni System • Document Ref: ASTU-REG-${Date.now()}</div>
          </div>

          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  },

  getStats(registrations?: AlumniRegistration[]) {
    const data = registrations || this.getRegistrations();
    const total = data.length;
    const confirmed = data.filter((r) => r.status === 'Confirmed').length;
    const attended = data.filter((r) => r.status === 'Attended').length;
    const pending = data.filter((r) => r.status === 'Pending Verification').length;
    const verifiedEta = data.filter((r) => r.accreditationVerified).length;
    const employedFullTime = data.filter((r) => r.employmentStatus === 'Employed Full-time').length;
    const founders = data.filter((r) => r.employmentStatus === 'Self-employed / Founder').length;

    return {
      total,
      confirmed,
      attended,
      pending,
      verifiedEta,
      etaComplianceRate: total > 0 ? Math.round((verifiedEta / total) * 100) : 0,
      employabilityRate: total > 0 ? Math.round(((employedFullTime + founders) / total) * 100) : 0,
    };
  },
};

export default registrationService;
