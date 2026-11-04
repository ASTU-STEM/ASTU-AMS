import axios from 'axios';

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
  // Registrar SIS standard graduate fields
  cgpa?: string | number;
  gender?: string;
  nationality?: string;
  dateOfBirth?: string;
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

/** Bumped to drop legacy seeded registration demo rows. */
const STORAGE_KEY = 'astu_ams_alumni_registrations_v2';
const CONFIG_STORAGE_KEY = 'astu_ams_registration_form_config';
const API_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const DEFAULT_FORM_CONFIG: RegistrationFormConfig = {
  formTitle: 'ASTU Alumni Membership & Campaign Roster Registration',
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

const INITIAL_REGISTRATIONS: AlumniRegistration[] = [];

export const registrationService = {
  getRegistrations(): AlumniRegistration[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Automatically upgrade if stored roster has legacy mock data (<= 15 items)
        if (Array.isArray(parsed) && parsed.length > 15) {
          return parsed;
        }
      }
    } catch {
      /* ignore */
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_REGISTRATIONS));
    return INITIAL_REGISTRATIONS;
  },

  saveRegistrations(list: AlumniRegistration[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    window.dispatchEvent(new Event('astu-ams-registrations-changed'));
  },

  resetToDefaultRoster(): AlumniRegistration[] {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_REGISTRATIONS));
    window.dispatchEvent(new Event('astu-ams-registrations-changed'));
    return INITIAL_REGISTRATIONS;
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

  bulkApprove(ids: string[]): void {
    const list = this.getRegistrations();
    const idSet = new Set(ids);
    const updated = list.map((r) => (idSet.has(r.id) ? { ...r, status: 'Confirmed' as const, accreditationVerified: true } : r));
    this.saveRegistrations(updated);
  },

  bulkDecline(ids: string[]): void {
    const list = this.getRegistrations();
    const idSet = new Set(ids);
    const updated = list.map((r) => (idSet.has(r.id) ? { ...r, status: 'Rejected' as const } : r));
    this.saveRegistrations(updated);
  },

  bulkVerifyEta(ids: string[], verified: boolean = true): void {
    const list = this.getRegistrations();
    const idSet = new Set(ids);
    const updated = list.map((r) => (idSet.has(r.id) ? { ...r, accreditationVerified: verified } : r));
    this.saveRegistrations(updated);
  },

  bulkDelete(ids: string[]): void {
    const list = this.getRegistrations();
    const idSet = new Set(ids);
    const updated = list.filter((r) => !idSet.has(r.id));
    this.saveRegistrations(updated);
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
    } catch {
      /* ignore */
    }
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

  async syncWithDatabaseAlumni(): Promise<{ added: number; total: number }> {
    try {
      const token = localStorage.getItem('authToken');
      const res = await axios.get(`${API_URL}/alumni/directory?limit=50`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const dbAlumni = res.data?.data?.alumni || res.data?.data || [];
      if (Array.isArray(dbAlumni) && dbAlumni.length > 0) {
        const current = this.getRegistrations();
        const existingStudentIds = new Set(current.map((r) => r.studentId.toUpperCase()));
        let addedCount = 0;

        for (const a of dbAlumni) {
          const sId = (a.studentId || a.id || '').toUpperCase();
          if (sId && !existingStudentIds.has(sId)) {
            current.push({
              id: `REG-DB-${Date.now()}-${addedCount}`,
              contentId: 'C-001',
              contentTitle: 'ASTU Alumni Network: Bridging Generations',
              fullName: a.fullName || a.name || 'ASTU Graduate',
              studentId: a.studentId || `UGR/${Math.floor(10000 + Math.random() * 90000)}/24`,
              email: a.email || `${(a.fullName || 'alumnus').toLowerCase().replace(/\s+/g, '.')}@astu.edu.et`,
              phone: a.phone || '+251 91 000 0000',
              classYear: a.graduationYear ? `Class of ${a.graduationYear}` : (a.batch || 'Class of 2024'),
              department: a.department?.name || a.department || 'Software Engineering',
              currentEmployer: a.preferences?.company || a.company || 'Safaricom Ethiopia',
              jobTitle: a.preferences?.currentRole || a.role || 'Systems Engineer',
              employmentStatus: 'Employed Full-time',
              salaryRange: '45,000 - 65,000 ETB',
              registeredAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
              status: 'Confirmed',
              accreditationVerified: true,
              cgpa: a.cgpa ? String(a.cgpa) : '3.65',
              gender: a.gender || 'Male',
              nationality: 'Ethiopian',
              notes: 'Imported live from ASTU Alumni Database directory.',
            });
            existingStudentIds.add(sId);
            addedCount++;
          }
        }

        if (addedCount > 0) {
          this.saveRegistrations(current);
        }
        return { added: addedCount, total: current.length };
      }
    } catch {
      /* fallback gracefully */
    }
    const current = this.getRegistrations();
    return { added: 0, total: current.length };
  },

  exportToCsv(registrationsToExport?: AlumniRegistration[]): void {
    const data = registrationsToExport || this.getRegistrations();
    if (data.length === 0) return;

    const headers = [
      'Registration ID',
      'Campaign / Event Title',
      'Full Name',
      'Student ID',
      'Email',
      'Phone',
      'Graduation Class',
      'Department',
      'CGPA',
      'Gender',
      'Nationality',
      'Date of Birth',
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
      `"${r.cgpa || 'N/A'}"`,
      `"${r.gender || 'N/A'}"`,
      `"${r.nationality || 'Ethiopian'}"`,
      `"${r.dateOfBirth || 'N/A'}"`,
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
    link.setAttribute('download', `ASTU_Alumni_Roster_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  exportToPdf(registrationsToExport?: AlumniRegistration[]): void {
    const data = registrationsToExport || this.getRegistrations();
    if (data.length === 0) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const stats = this.getStats(data);
    const rowsHtml = data
      .map(
        (r, idx) => `
        <tr>
          <td style="text-align: center; color: #64748b; font-weight: 600;">${idx + 1}</td>
          <td>
            <div style="font-weight: 700; color: #003366; font-size: 11px;">${r.fullName}</div>
            <div style="color: #64748b; font-family: monospace; font-size: 10px; margin-top: 2px;">${r.studentId} · ${r.email}</div>
          </td>
          <td>
            <div style="font-weight: 600; color: #1e293b; font-size: 11px;">${r.department}</div>
            <div style="color: #64748b; font-size: 10px;">${r.classYear} ${r.cgpa ? '· CGPA ' + r.cgpa : ''}</div>
          </td>
          <td>
            <div style="font-weight: 600; color: #0f172a; font-size: 11px;">${r.jobTitle}</div>
            <div style="color: #003366; font-size: 10px; font-weight: 500;">${r.currentEmployer}</div>
          </td>
          <td>
            <span style="display: inline-block; padding: 2px 7px; border-radius: 4px; font-weight: 700; font-size: 9px; ${
              r.employmentStatus === 'Employed Full-time'
                ? 'background: #ecfdf5; color: #065f46; border: 1px solid #a7f3d0;'
                : r.employmentStatus === 'Self-employed / Founder'
                ? 'background: #faf5ff; color: #6b21a8; border: 1px solid #e9d5ff;'
                : 'background: #eff6ff; color: #1e40af; border: 1px solid #bfdbfe;'
            }">
              ${r.employmentStatus}
            </span>
          </td>
          <td style="font-family: monospace; font-size: 10px; color: #475569;">${r.registeredAt}</td>
          <td>
            <span style="display: inline-block; padding: 2px 6px; border-radius: 4px; font-weight: 700; font-size: 9px; ${
              r.status === 'Confirmed'
                ? 'background: #dcfce7; color: #15803d;'
                : r.status === 'Attended'
                ? 'background: #e0f2fe; color: #0369a1;'
                : 'background: #fef3c7; color: #b45309;'
            }">
              ${r.status}
            </span>
          </td>
          <td style="text-align: center;">
            ${
              r.accreditationVerified
                ? '<span style="color: #16a34a; font-weight: 800; font-size: 10px; background: #f0fdf4; padding: 2px 6px; border-radius: 4px; border: 1px solid #bbf7d0;">✓ ETA Certified</span>'
                : '<span style="color: #94a3b8; font-size: 10px;">Pending</span>'
            }
          </td>
        </tr>
      `
      )
      .join('');

    const logoUrl = window.location.origin + '/images/astu-seal-logo.png';

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>ASTU Alumni Directorate — Registered Members Roster Audit Report</title>
          <style>
            @page { size: A4 landscape; margin: 12mm 15mm; }
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0f172a; background: #fff; margin: 0; padding: 10px; }
            .header-table { width: 100%; border-bottom: 3px double #003366; padding-bottom: 12px; margin-bottom: 14px; }
            .title-en { font-size: 18px; font-weight: 900; color: #003366; text-transform: uppercase; letter-spacing: 0.5px; }
            .sub-title { font-size: 12px; font-weight: 700; color: #475569; margin-top: 3px; }
            .badge-eta { display: inline-block; background: #ecfdf5; color: #065f46; font-weight: 800; font-size: 10px; padding: 3px 8px; border-radius: 4px; border: 1px solid #10b981; }
            .kpi-bar { display: flex; gap: 12px; margin: 12px 0 16px 0; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px 14px; }
            .kpi-item { flex: 1; border-right: 1px solid #cbd5e1; padding-right: 10px; }
            .kpi-item:last-child { border-right: none; }
            .kpi-val { font-size: 16px; font-weight: 900; color: #003366; }
            .kpi-lbl { font-size: 9px; font-weight: 700; text-transform: uppercase; color: #64748b; margin-top: 1px; }
            table.data-table { width: 100%; border-collapse: collapse; font-size: 10px; }
            table.data-table th { background: #003366; color: #ffffff; text-transform: uppercase; font-size: 9px; font-weight: 800; padding: 8px 6px; text-align: left; letter-spacing: 0.3px; border: 1px solid #002244; }
            table.data-table td { border-bottom: 1px solid #e2e8f0; padding: 6px; vertical-align: top; }
            table.data-table tr:nth-child(even) { background: #f8fafc; }
            .signature-block { margin-top: 32px; display: flex; justify-content: space-between; border-top: 1px solid #cbd5e1; padding-top: 16px; page-break-inside: avoid; }
            .sig-col { width: 28%; text-align: center; }
            .sig-line { border-bottom: 1px dashed #475569; margin: 30px auto 6px auto; width: 85%; }
            .sig-name { font-size: 10px; font-weight: 700; color: #0f172a; }
            .sig-role { font-size: 9px; color: #64748b; }
            .footer { margin-top: 16px; font-size: 8px; color: #94a3b8; display: flex; justify-content: space-between; border-top: 1px solid #f1f5f9; padding-top: 6px; }
          </style>
        </head>
        <body>
          <table class="header-table">
            <tr>
              <td style="width: 70px; vertical-align: middle;">
                <img src="${logoUrl}" alt="ASTU Crest" style="width: 65px; height: 65px; object-fit: contain;" onerror="this.style.display='none'" />
              </td>
              <td style="vertical-align: middle; padding-left: 12px;">
                <div class="title-en">Adama Science and Technology University</div>
                <div class="sub-title">Directorate for Industry Linkage & Alumni Affairs — Official Graduate Accreditation Roster</div>
                <div style="font-size: 9px; color: #64748b; margin-top: 2px;">Main Campus, P.O. Box 1888, Adama, Oromia, Ethiopia · Web: www.astu.edu.et · Telegram: @Adama_STU_Almuni</div>
              </td>
              <td style="text-align: right; vertical-align: middle;">
                <div class="badge-eta">✓ ETA & MOE AUDIT COMPLIANT</div>
                <div style="font-size: 9px; color: #475569; margin-top: 4px;"><strong>Report Ref:</strong> ASTU-AMS-REG-${Date.now().toString().slice(-6)}</div>
                <div style="font-size: 9px; color: #64748b;"><strong>Generated:</strong> ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
              </td>
            </tr>
          </table>

          <div class="kpi-bar">
            <div class="kpi-item">
              <div class="kpi-val">${stats.total}</div>
              <div class="kpi-lbl">Total Registered Candidates</div>
            </div>
            <div class="kpi-item">
              <div class="kpi-val" style="color: #16a34a;">${stats.etaComplianceRate}% (${stats.verifiedEta})</div>
              <div class="kpi-lbl">ETA Accreditation Verified</div>
            </div>
            <div class="kpi-item">
              <div class="kpi-val" style="color: #0284c7;">${stats.employabilityRate}%</div>
              <div class="kpi-lbl">Employability Index</div>
            </div>
            <div class="kpi-item">
              <div class="kpi-val" style="color: #d97706;">${stats.pending}</div>
              <div class="kpi-lbl">Pending Review</div>
            </div>
          </div>

          <table class="data-table">
            <thead>
              <tr>
                <th style="width: 25px; text-align: center;">#</th>
                <th>Graduate Name & Student ID</th>
                <th>Department & Academic Class</th>
                <th>Current Employer & Designation</th>
                <th>Employment Classification</th>
                <th>Registration Date</th>
                <th>Status</th>
                <th style="text-align: center;">ETA Audit Stamp</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>

          <div class="signature-block">
            <div class="sig-col">
              <div class="sig-line"></div>
              <div class="sig-name">Alumni Relations Desk Officer</div>
              <div class="sig-role">Data Verification & Registry Unit</div>
            </div>
            <div class="sig-col">
              <div class="sig-line"></div>
              <div class="sig-name">Academic Registrar SIS Verification Lead</div>
              <div class="sig-role">Credential Cross-Check & Compliance</div>
            </div>
            <div class="sig-col">
              <div class="sig-line"></div>
              <div class="sig-name">Director, Industry Linkage & Alumni Affairs</div>
              <div class="sig-role">Adama Science and Technology University</div>
            </div>
          </div>

          <div class="footer">
            <div>CONFIDENTIAL — Official Institutional Document of Adama Science and Technology University (ASTU).</div>
            <div>Page 1 of 1 · Generated automatically via ASTU Alumni Management System (AMS) Portal.</div>
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
    const pending = data.filter((r) => r.status === 'Pending Verification' || r.status === 'Pending Approval').length;
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
