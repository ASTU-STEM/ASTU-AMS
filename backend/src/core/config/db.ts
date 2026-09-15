import { PrismaClient } from '@prisma/client';
import { Logger } from '../utils/logger.utils';
import fs from 'fs';
import path from 'path';

// ─── In-memory dev DB helpers ───
const DEV_DB_PATH = path.join(process.cwd(), 'data', 'dev-db.json');

function readDevDb(): any {
  try {
    if (fs.existsSync(DEV_DB_PATH)) {
      return JSON.parse(fs.readFileSync(DEV_DB_PATH, 'utf-8'));
    }
  } catch { /* ignore */ }
  return {
    users: [],
    alumniProfiles: [],
    employerProfiles: [],
    departments: [],
    registrarStudents: [],
    registrarSyncLogs: [],
    auditLogs: [],
    notifications: [],
    documentRequests: [],
  };
}

function writeDevDb(store: any) {
  const dir = path.dirname(DEV_DB_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(DEV_DB_PATH, JSON.stringify(store, null, 2));
}

// ─── Fake Prisma for dev fallback ───
class FakePrisma {
  private get store() {
    return readDevDb();
  }

  async $connect() {
    Logger.info('FakePrisma: Using in-memory JSON dev database');
  }

  async $disconnect() {
    writeDevDb(this.store);
  }

  user = {
    findUnique: async ({ where }: any) => {
      if (where.id) return this.store.users.find((u: any) => u.id === where.id) || null;
      if (where.email) return this.store.users.find((u: any) => u.email === where.email) || null;
      return null;
    },
    findMany: async ({ where, skip, take }: any = {}) => {
      let users = [...this.store.users];
      if (where?.role) users = users.filter((u: any) => u.role === where.role);
      if (skip) users = users.slice(skip);
      if (take) users = users.slice(0, take);
      return users;
    },
    count: async ({ where }: any = {}) => {
      let users = this.store.users;
      if (where?.role) users = users.filter((u: any) => u.role === where.role);
      return users.length;
    },
    create: async ({ data }: any) => {
      const rec = { ...data, id: `dev-${Date.now()}`, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), isActive: data.isActive ?? false };
      this.store.users.push(rec);
      writeDevDb(this.store);
      return rec;
    },
    update: async ({ where, data }: any) => {
      const idx = this.store.users.findIndex((u: any) => u.id === where.id || u.email === where.email);
      if (idx === -1) throw new Error('User not found');
      this.store.users[idx] = { ...this.store.users[idx], ...data, updatedAt: new Date().toISOString() };
      writeDevDb(this.store);
      return this.store.users[idx];
    },
    delete: async ({ where }: any) => {
      const idx = this.store.users.findIndex((u: any) => u.id === where.id);
      if (idx === -1) throw new Error('User not found');
      const [removed] = this.store.users.splice(idx, 1);
      writeDevDb(this.store);
      return removed;
    },
  };

  alumniProfile = {
    findUnique: async ({ where, include }: any) => {
      const store = readDevDb();
      let profile: any = null;
      if (where?.userId) profile = (store.alumniProfiles || []).find((a: any) => a.userId === where.userId) || null;
      else if (where?.studentId) profile = (store.alumniProfiles || []).find((a: any) => a.studentId === where.studentId) || null;
      else if (where?.id) profile = (store.alumniProfiles || []).find((a: any) => a.id === where.id || a.userId === where.id) || null;

      if (profile && include?.user && !profile.user) {
        const u = (store.users || []).find((user: any) => user.id === profile.userId || user.email === profile.email);
        profile = { ...profile, user: u || { email: profile.email || 'alumni@astu.edu.et' } };
      }
      return profile;
    },
    findFirst: async ({ where, include }: any = {}) => {
      const store = readDevDb();
      const profiles = store.alumniProfiles || [];
      let profile: any = null;
      if (where?.userId) profile = profiles.find((a: any) => a.userId === where.userId) || null;
      else if (where?.id) profile = profiles.find((a: any) => a.id === where.id || a.userId === where.id) || null;
      else if (where?.OR && Array.isArray(where.OR)) {
        for (const cond of where.OR) {
          if (cond.id) {
            const found = profiles.find((a: any) => a.id === cond.id || a.userId === cond.id);
            if (found) { profile = found; break; }
          }
          if (cond.userId) {
            const found = profiles.find((a: any) => a.userId === cond.userId);
            if (found) { profile = found; break; }
          }
        }
      } else if (!where || Object.keys(where).length === 0) {
        profile = profiles[0] || null;
      }

      if (profile && include?.user && !profile.user) {
        const u = (store.users || []).find((user: any) => user.id === profile.userId || user.email === profile.email);
        profile = { ...profile, user: u || { email: profile.email || 'alumni@astu.edu.et' } };
      }
      return profile;
    },
    findMany: async ({ where, skip, take }: any = {}) => {
      const store = readDevDb();
      let profiles = [...(store.alumniProfiles || [])];
      if (where?.departmentId) profiles = profiles.filter((a: any) => a.departmentId === where.departmentId);
      if (where?.graduationYear) profiles = profiles.filter((a: any) => Number(a.graduationYear) === Number(where.graduationYear));
      if (where?.cgpa?.gte) profiles = profiles.filter((a: any) => Number(a.cgpa) >= Number(where.cgpa.gte));
      if (where?.OR && Array.isArray(where.OR)) {
        const query = where.OR[0]?.fullName?.contains?.toLowerCase() || '';
        if (query) {
          profiles = profiles.filter((a: any) =>
            (a.fullName || '').toLowerCase().includes(query) ||
            (a.email || '').toLowerCase().includes(query) ||
            (a.skills || []).some((s: string) => s.toLowerCase().includes(query))
          );
        }
      }
      if (skip) profiles = profiles.slice(skip);
      if (take) profiles = profiles.slice(0, take);
      return profiles;
    },
    count: async ({ where }: any = {}) => {
      const store = readDevDb();
      let profiles = store.alumniProfiles || [];
      if (where?.departmentId) profiles = profiles.filter((a: any) => a.departmentId === where.departmentId);
      return profiles.length;
    },
    create: async ({ data }: any) => {
      const store = readDevDb();
      const rec = { ...data, id: `dev-alumni-${Date.now()}`, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      if (!store.alumniProfiles) store.alumniProfiles = [];
      store.alumniProfiles.push(rec);
      writeDevDb(store);
      return rec;
    },
    update: async ({ where, data }: any) => {
      const store = readDevDb();
      const idx = (store.alumniProfiles || []).findIndex((a: any) =>
        (where?.id !== undefined && (a.id === where.id || a.userId === where.id)) ||
        (where?.userId !== undefined && a.userId === where.userId) ||
        (where?.studentId !== undefined && a.studentId === where.studentId)
      );
      if (idx === -1) throw new Error('Alumni profile not found');
      store.alumniProfiles[idx] = { ...store.alumniProfiles[idx], ...data, updatedAt: new Date().toISOString() };
      writeDevDb(store);
      return store.alumniProfiles[idx];
    },
    upsert: async ({ where, create, update }: any) => {
      const existing = await this.alumniProfile.findUnique({ where });
      if (existing) {
        return this.alumniProfile.update({ where: { id: existing.id }, data: update });
      }
      return this.alumniProfile.create({ data: create });
    },
    deleteMany: async ({ where }: any = {}) => {
      const store = readDevDb();
      if (store.alumniProfiles) {
        store.alumniProfiles = store.alumniProfiles.filter((a: any) => {
          if (where?.id && a.id === where.id) return false;
          if (where?.userId && a.userId === where.userId) return false;
          if (where?.studentId && a.studentId === where.studentId) return false;
          return true;
        });
        writeDevDb(store);
      }
      return { count: 1 };
    },
  };

  employerProfile = {
    findUnique: async ({ where }: any) => {
      const store = readDevDb();
      if (where?.userId) return (store.employerProfiles || []).find((e: any) => e.userId === where.userId) || null;
      if (where?.id) return (store.employerProfiles || []).find((e: any) => e.id === where.id) || null;
      return null;
    },
    create: async ({ data }: any) => {
      const store = readDevDb();
      const rec = { ...data, id: data.id || `dev-employer-${Date.now()}`, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      if (!store.employerProfiles) store.employerProfiles = [];
      store.employerProfiles.push(rec);
      writeDevDb(store);
      return rec;
    },
    update: async ({ where, data }: any) => {
      const store = readDevDb();
      const idx = (store.employerProfiles || []).findIndex((e: any) => e.userId === where?.userId || e.id === where?.id);
      if (idx !== -1) {
        store.employerProfiles[idx] = { ...store.employerProfiles[idx], ...data, updatedAt: new Date().toISOString() };
        writeDevDb(store);
        return store.employerProfiles[idx];
      }
      return { id: where?.id || where?.userId, ...data };
    },
    upsert: async ({ where, create, update }: any) => {
      const existing = await this.employerProfile.findUnique({ where });
      if (existing) {
        return this.employerProfile.update({ where, data: update });
      }
      return this.employerProfile.create({ data: create });
    },
    deleteMany: async ({ where }: any = {}) => {
      const store = readDevDb();
      if (store.employerProfiles) {
        store.employerProfiles = store.employerProfiles.filter((e: any) => {
          if (where?.userId && e.userId === where.userId) return false;
          if (where?.id && e.id === where.id) return false;
          return true;
        });
        writeDevDb(store);
      }
      return { count: 1 };
    },
    delete: async ({ where }: any = {}) => {
      const store = readDevDb();
      if (store.employerProfiles) {
        store.employerProfiles = store.employerProfiles.filter((e: any) => e.id !== where?.id && e.userId !== where?.userId);
        writeDevDb(store);
      }
      return {};
    },
  };

  department = {
    findUnique: async ({ where }: any) => {
      if (where.code) return this.store.departments.find((d: any) => d.code === where.code) || null;
      if (where.id) return this.store.departments.find((d: any) => d.id === where.id) || null;
      return null;
    },
    create: async ({ data }: any) => {
      const rec = { ...data, id: `dev-dept-${Date.now()}` };
      this.store.departments.push(rec);
      writeDevDb(this.store);
      return rec;
    },
  };

  registrarStudent = {
    findUnique: async ({ where }: any) => {
      if (where.studentId) return this.store.registrarStudents.find((r: any) => r.studentId === where.studentId) || null;
      if (where.id) return this.store.registrarStudents.find((r: any) => r.id === where.id) || null;
      return null;
    },
    findMany: async () => {
      return [...this.store.registrarStudents];
    },
    count: async () => {
      return this.store.registrarStudents.length;
    },
    create: async ({ data }: any) => {
      const rec = { ...data, id: `dev-registrar-${Date.now()}`, importedAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      this.store.registrarStudents.push(rec);
      writeDevDb(this.store);
      return rec;
    },
    update: async ({ where, data }: any) => {
      const idx = this.store.registrarStudents.findIndex((r: any) => r.studentId === where.studentId || r.id === where.id);
      if (idx === -1) throw new Error('Registrar student record not found');
      this.store.registrarStudents[idx] = {
        ...this.store.registrarStudents[idx],
        ...data,
        updatedAt: new Date().toISOString(),
      };
      writeDevDb(this.store);
      return this.store.registrarStudents[idx];
    },
    upsert: async ({ where, create, update }: any) => {
      const existing = await this.registrarStudent.findUnique({ where });
      if (existing) {
        return this.registrarStudent.update({ where, data: update });
      }
      return this.registrarStudent.create({ data: create });
    },
  };

  registrarSyncLog = {
    create: async ({ data }: any) => {
      const rec = { ...data, id: `dev-sync-${Date.now()}`, syncedAt: new Date().toISOString() };
      this.store.registrarSyncLogs.push(rec);
      writeDevDb(this.store);
      return rec;
    },
    findFirst: async ({ orderBy }: any = {}) => {
      const logs = this.store.registrarSyncLogs || [];
      if (orderBy?.syncedAt === 'desc') {
        return logs.sort((a: any, b: any) => new Date(b.syncedAt).getTime() - new Date(a.syncedAt).getTime())[0] || null;
      }
      return logs[logs.length - 1] || null;
    },
    findMany: async ({ orderBy }: any = {}) => {
      const logs = this.store.registrarSyncLogs || [];
      if (orderBy?.syncedAt === 'desc') {
        return logs.sort((a: any, b: any) => new Date(b.syncedAt).getTime() - new Date(a.syncedAt).getTime());
      }
      return logs;
    },
  };

  auditLog = {
    create: async ({ data }: any) => {
      const rec = { ...data, id: `dev-log-${Date.now()}`, createdAt: new Date().toISOString() };
      this.store.auditLogs.push(rec);
      writeDevDb(this.store);
      return rec;
    },
    findMany: async ({ where }: any = {}) => {
      let logs = [...(this.store.auditLogs || [])];
      if (where?.userId) logs = logs.filter((l: any) => l.userId === where.userId);
      return logs.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 50);
    },
  };

  notification = {
    create: async ({ data }: any) => {
      const store = readDevDb();
      const rec = { ...data, id: `dev-notif-${Date.now()}`, createdAt: new Date().toISOString(), isRead: false };
      if (!store.notifications) store.notifications = [];
      store.notifications.push(rec);
      writeDevDb(store);
      return rec;
    },
    findMany: async ({ where, orderBy }: any = {}) => {
      const store = readDevDb();
      let items = store.notifications || [];
      if (where?.userId) items = items.filter((n: any) => n.userId === where.userId);
      if (where?.isRead !== undefined) items = items.filter((n: any) => n.isRead === where.isRead);
      return items;
    },
    deleteMany: async ({ where }: any = {}) => {
      const store = readDevDb();
      if (store.notifications) {
        if (where?.userId) store.notifications = store.notifications.filter((n: any) => n.userId !== where.userId);
        else store.notifications = [];
        writeDevDb(store);
      }
      return { count: 0 };
    },
    count: async ({ where }: any = {}) => {
      const store = readDevDb();
      let items = store.notifications || [];
      if (where?.userId) items = items.filter((n: any) => n.userId === where.userId);
      if (where?.isRead !== undefined) items = items.filter((n: any) => n.isRead === where.isRead);
      return items.length;
    },
    update: async ({ where, data }: any) => {
      return { id: where.id, ...data };
    },
    updateMany: async ({ where, data }: any) => {
      return { count: 0 };
    },
  };

  hiringEvent = {
    create: async ({ data }: any) => {
      const store = readDevDb();
      const rec = { ...data, id: data.id || `dev-hiring-event-${Date.now()}`, createdAt: new Date().toISOString() };
      if (!store.hiringEvents) store.hiringEvents = [];
      store.hiringEvents.push(rec);
      writeDevDb(store);
      return rec;
    },
    findUnique: async ({ where }: any = {}) => {
      const store = readDevDb();
      const events = store.hiringEvents || [];
      if (where?.applicationId) return events.find((e: any) => e.applicationId === where.applicationId) || null;
      if (where?.id) return events.find((e: any) => e.id === where.id) || null;
      return null;
    },
    findMany: async ({ where }: any = {}) => {
      const store = readDevDb();
      let events = store.hiringEvents || [];
      if (where?.employerId) events = events.filter((e: any) => e.employerId === where.employerId);
      return events;
    },
    deleteMany: async ({ where }: any = {}) => {
      const store = readDevDb();
      if (store.hiringEvents) {
        if (where?.employerId) store.hiringEvents = store.hiringEvents.filter((e: any) => e.employerId !== where.employerId);
        else store.hiringEvents = [];
        writeDevDb(store);
      }
      return { count: 0 };
    },
  };

  documentRequest = {
    count: async ({ where }: any = {}) => {
      let docs = this.store.documentRequests || [];
      if (where?.status) docs = docs.filter((d: any) => d.status === where.status);
      if (where?.alumniId) docs = docs.filter((d: any) => d.alumniId === where.alumniId);
      return docs.length;
    },
    findMany: async ({ where }: any = {}) => {
      let docs = this.store.documentRequests || [];
      if (where?.alumniId) docs = docs.filter((d: any) => d.alumniId === where.alumniId);
      return docs;
    },
    create: async ({ data }: any) => {
      const rec = { ...data, id: `dev-doc-${Date.now()}`, createdAt: new Date().toISOString(), status: 'PENDING' };
      if (!this.store.documentRequests) this.store.documentRequests = [];
      this.store.documentRequests.push(rec);
      writeDevDb(this.store);
      return rec;
    },
  };

  job = {
    findMany: async ({ where }: any = {}) => {
      const store = readDevDb();
      let jobs = store.jobs || [];
      if (where?.employerId) jobs = jobs.filter((j: any) => j.employerId === where.employerId);
      if (where?.status) jobs = jobs.filter((j: any) => j.status === where.status);
      return jobs.map((j: any) => {
        const emp = (store.employerProfiles || []).find((e: any) => e.id === j.employerId) || {
          id: j.employerId || 'dev-employer-insa',
          companyName: 'INSA Corporation',
          industry: 'Cybersecurity & Defense Tech',
          location: 'Addis Ababa, Ethiopia',
          logoUrl: '/images/AdamaScienceandTechnologyUniversityASTU-logo-350x350.jpg',
          website: 'https://insa.gov.et'
        };
        return {
          ...j,
          isActive: j.isActive ?? true,
          status: j.status || 'PUBLISHED',
          deadline: j.deadline || '2030-12-31T23:59:59.000Z',
          employer: emp,
          _count: {
            applications: (store.jobApplications || []).filter((a: any) => a.jobId === j.id).length
          }
        };
      });
    },
    findUnique: async ({ where }: any = {}) => {
      const store = readDevDb();
      const j = (store.jobs || []).find((item: any) => item.id === where?.id);
      if (!j) return null;
      const emp = (store.employerProfiles || []).find((e: any) => e.id === j.employerId) || {
        id: j.employerId || 'dev-employer-insa',
        companyName: 'INSA Corporation',
        industry: 'Cybersecurity & Defense Tech',
        location: 'Addis Ababa, Ethiopia',
        logoUrl: '/images/AdamaScienceandTechnologyUniversityASTU-logo-350x350.jpg',
        website: 'https://insa.gov.et'
      };
      return {
        ...j,
        isActive: j.isActive ?? true,
        status: j.status || 'PUBLISHED',
        deadline: j.deadline || '2030-12-31T23:59:59.000Z',
        employer: emp,
        _count: {
          applications: (store.jobApplications || []).filter((a: any) => a.jobId === j.id).length,
          views: j.views || 0
        }
      };
    },
    count: async ({ where }: any = {}) => {
      const store = readDevDb();
      let jobs = store.jobs || [];
      if (where?.employerId) jobs = jobs.filter((j: any) => j.employerId === where.employerId);
      return jobs.length;
    },
    create: async ({ data }: any) => {
      const store = readDevDb();
      const rec = { ...data, id: `job-${Date.now()}`, createdAt: new Date().toISOString(), views: 0 };
      if (!store.jobs) store.jobs = [];
      store.jobs.unshift(rec);
      writeDevDb(store);
      return rec;
    },
    update: async ({ where, data }: any) => {
      const store = readDevDb();
      const idx = (store.jobs || []).findIndex((j: any) => j.id === where.id);
      if (idx !== -1) {
        store.jobs[idx] = { ...store.jobs[idx], ...data, updatedAt: new Date().toISOString() };
        writeDevDb(store);
        return store.jobs[idx];
      }
      return { id: where.id, ...data };
    },
    delete: async ({ where }: any = {}) => {
      const store = readDevDb();
      if (store.jobs) {
        store.jobs = store.jobs.filter((j: any) => j.id !== where.id);
        writeDevDb(store);
      }
      return {};
    },
  };

  jobApplication = {
    count: async ({ where }: any = {}) => {
      const store = readDevDb();
      let apps = store.jobApplications || [];
      if (where?.jobId) apps = apps.filter((a: any) => a.jobId === where.jobId);
      if (where?.alumniId) apps = apps.filter((a: any) => a.alumniId === where.alumniId);
      if (where?.job?.employerId) {
        const empProf = (store.employerProfiles || []).find((e: any) => e.id === where.job.employerId || e.userId === where.job.employerId);
        const empIds = new Set([where.job.employerId, empProf?.id, empProf?.userId].filter(Boolean));
        const empJobIds = new Set((store.jobs || []).filter((j: any) => empIds.has(j.employerId)).map((j: any) => j.id));
        apps = apps.filter((a: any) => empJobIds.has(a.jobId));
      }
      if (where?.status) apps = apps.filter((a: any) => a.status === where.status);
      return apps.length;
    },
    deleteMany: async ({ where }: any = {}) => {
      const store = readDevDb();
      if (store.jobApplications) {
        if (where?.jobId) {
          store.jobApplications = store.jobApplications.filter((a: any) => a.jobId !== where.jobId);
        } else if (where?.job?.employerId) {
          const empProf = (store.employerProfiles || []).find((e: any) => e.id === where.job.employerId || e.userId === where.job.employerId);
          const empIds = new Set([where.job.employerId, empProf?.id, empProf?.userId].filter(Boolean));
          const empJobIds = new Set((store.jobs || []).filter((j: any) => empIds.has(j.employerId)).map((j: any) => j.id));
          store.jobApplications = store.jobApplications.filter((a: any) => !empJobIds.has(a.jobId));
        } else {
          store.jobApplications = [];
        }
        writeDevDb(store);
      }
      return { count: 0 };
    },
    findMany: async ({ where }: any = {}) => {
      const store = readDevDb();
      let apps = store.jobApplications || [];
      if (where?.jobId) apps = apps.filter((a: any) => a.jobId === where.jobId);
      if (where?.alumniId) apps = apps.filter((a: any) => a.alumniId === where.alumniId);
      if (where?.job?.employerId) {
        const empProf = (store.employerProfiles || []).find((e: any) => e.id === where.job.employerId || e.userId === where.job.employerId);
        const empIds = new Set([where.job.employerId, empProf?.id, empProf?.userId].filter(Boolean));
        const empJobIds = new Set((store.jobs || []).filter((j: any) => empIds.has(j.employerId)).map((j: any) => j.id));
        apps = apps.filter((a: any) => empJobIds.has(a.jobId));
      }
      return apps.map((a: any) => {
        const job = (store.jobs || []).find((j: any) => j.id === a.jobId);
        const emp = (store.employerProfiles || []).find((e: any) => e.id === job?.employerId || e.userId === job?.employerId);
        const alumni = (store.alumniProfiles || []).find((al: any) => al.id === a.alumniId || al.userId === a.alumniId);
        const user = (store.users || []).find((u: any) => u.id === alumni?.userId || u.id === a.alumniId);
        return {
          ...a,
          job: job ? { ...job, employer: emp || { id: job.employerId || 'dev-employer-1', companyName: 'Safaricom Ethiopia' } } : null,
          alumni: alumni ? { ...alumni, user: user || { email: alumni?.email || 'alumni@astu.edu.et' } } : null,
        };
      });
    },
    findUnique: async ({ where, include }: any = {}) => {
      const store = readDevDb();
      const app = (store.jobApplications || []).find((a: any) => a.id === where?.id) || null;
      if (!app) return null;
      if (include) {
        const job = (store.jobs || []).find((j: any) => j.id === app.jobId);
        const emp = (store.employerProfiles || []).find((e: any) => e.id === job?.employerId || e.userId === job?.employerId);
        const alumni = (store.alumniProfiles || []).find((al: any) => al.id === app.alumniId || al.userId === app.alumniId);
        const user = (store.users || []).find((u: any) => u.id === alumni?.userId || u.id === app.alumniId);
        const empObject = emp || { id: job?.employerId || 'dev-employer-1', companyName: 'Safaricom Ethiopia' };
        return {
          ...app,
          job: job ? { ...job, employer: empObject } : null,
          alumni: alumni ? { ...alumni, user: user || { email: alumni?.email || 'alumni@astu.edu.et' } } : null,
        };
      }
      return app;
    },
    create: async ({ data }: any) => {
      const store = readDevDb();
      const rec = { ...data, id: `app-${Date.now()}`, createdAt: new Date().toISOString() };
      if (!store.jobApplications) store.jobApplications = [];
      store.jobApplications.unshift(rec);
      writeDevDb(store);
      return rec;
    },
    update: async ({ where, data }: any) => {
      const store = readDevDb();
      const idx = (store.jobApplications || []).findIndex((a: any) => a.id === where.id);
      if (idx !== -1) {
        store.jobApplications[idx] = { ...store.jobApplications[idx], ...data, updatedAt: new Date().toISOString() };
        writeDevDb(store);
        return store.jobApplications[idx];
      }
      return { id: where.id, ...data };
    },
    delete: async (_args?: any) => ({}),
  };

  jobView = {
    findUnique: async (_args?: any) => null,
    create: async ({ data }: any) => ({ ...data, id: `dev-view-${Date.now()}` }),
    upsert: async ({ create }: any) => ({ ...create, id: `dev-view-${Date.now()}` }),
  };

  surveyAssignment = {
    count: async (_args?: any) => 0,
    findMany: async (_args?: any) => [],
  };

  eventRegistration = {
    count: async (_args?: any) => 0,
    findMany: async (_args?: any) => [],
  };

  forumPost = {
    findMany: async (_args?: any) => [],
    create: async ({ data }: any) => {
      const rec = { ...data, id: `dev-post-${Date.now()}`, createdAt: new Date(), likesCount: 0, commentsCount: 0, alumni: { fullName: 'Dev User', currentRole: 'Alumni', avatarUrl: null } };
      return rec;
    },
  };

  employerFeedback = {
    findMany: async ({ where }: any = {}) => {
      const store = readDevDb();
      let fbs = store.employerFeedbacks || [];
      if (where?.employerId) fbs = fbs.filter((f: any) => f.employerId === where.employerId);
      return fbs.map((f: any) => {
        const alumni = (store.alumniProfiles || []).find((al: any) => al.id === f.alumniId);
        return {
          ...f,
          alumni: alumni ? { ...alumni, user: { firstName: alumni.fullName?.split(' ')[0], lastName: alumni.fullName?.split(' ')[1] } } : null,
        };
      });
    },
    create: async ({ data }: any) => {
      const store = readDevDb();
      const rec = { ...data, id: `fb-${Date.now()}`, createdAt: new Date().toISOString() };
      if (!store.employerFeedbacks) store.employerFeedbacks = [];
      store.employerFeedbacks.unshift(rec);
      writeDevDb(store);
      return rec;
    },
  };

  directMessage = {
    findMany: async ({ where }: any = {}) => {
      const store = readDevDb();
      let msgs = store.directMessages || [];
      if (where?.employerId) msgs = msgs.filter((m: any) => m.employerId === where.employerId);
      return msgs.map((m: any) => {
        const alumni = (store.alumniProfiles || []).find((al: any) => al.id === m.alumniId);
        return {
          ...m,
          alumni: alumni || { fullName: 'ASTU Alumni', email: 'alumni@astu.edu.et' },
        };
      });
    },
    create: async ({ data }: any) => {
      const store = readDevDb();
      const rec = { ...data, id: `msg-${Date.now()}`, isRead: false, createdAt: new Date().toISOString() };
      if (!store.directMessages) store.directMessages = [];
      store.directMessages.push(rec);
      writeDevDb(store);
      return rec;
    },
  };

  // Catch-all: for any model not explicitly defined, return safe no-ops
  [key: string]: any;

  async $transaction(cb: any) {
    if (typeof cb === 'function') return cb(this);
    return Promise.resolve(cb);
  }
}

// ─── Client Initialization ───
let client: any = null;
let initialized = false;
let fallback: any = null;
let usingFallback = false;

const createSafeModel = (name: string) => {
  const store: any[] = [];
  return {
    findMany: async ({ where }: any = {}) => {
      if (!where || Object.keys(where).length === 0) return store;
      return store.filter((item: any) => {
        return Object.entries(where).every(([k, v]) => item[k] === v);
      });
    },
    findUnique: async ({ where }: any = {}) => {
      if (!where) return null;
      return store.find((item: any) => {
        return Object.entries(where).every(([k, v]) => item[k] === v);
      }) || null;
    },
    findFirst: async ({ where }: any = {}) => {
      if (!where || Object.keys(where).length === 0) return store[0] || null;
      return store.find((item: any) => {
        return Object.entries(where).every(([k, v]) => item[k] === v);
      }) || null;
    },
    count: async ({ where }: any = {}) => {
      if (!where || Object.keys(where).length === 0) return store.length;
      return store.filter((item: any) => Object.entries(where).every(([k, v]) => item[k] === v)).length;
    },
    create: async ({ data }: any) => {
      const id = data?.id || `dev-${name}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const rec = { id, ...data };
      store.push(rec);
      return rec;
    },
    createMany: async ({ data }: any = {}) => {
      const items = Array.isArray(data) ? data : [data];
      const created = items.map((item: any) => {
        const id = item?.id || `dev-${name}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
        const rec = { id, ...item };
        store.push(rec);
        return rec;
      });
      return { count: created.length };
    },
    update: async ({ where, data }: any) => {
      let item = store.find((i: any) => Object.entries(where || {}).every(([k, v]) => i[k] === v));
      if (!item) {
        const id = where?.id || `dev-${name}-${Date.now()}`;
        item = { id, ...where };
        store.push(item);
      }
      Object.assign(item, data);
      return item;
    },
    delete: async ({ where }: any = {}) => {
      const idx = store.findIndex((i: any) => Object.entries(where || {}).every(([k, v]) => i[k] === v));
      if (idx !== -1) {
        return store.splice(idx, 1)[0];
      }
      return {};
    },
    upsert: async ({ where, create, update }: any) => {
      let item = store.find((i: any) => Object.entries(where || {}).every(([k, v]) => i[k] === v));
      if (item) {
        Object.assign(item, update);
        return item;
      }
      const rec = { id: `dev-${name}-${Date.now()}`, ...create };
      store.push(rec);
      return rec;
    },
    updateMany: async ({ where, data }: any = {}) => {
      const items = store.filter((i: any) => Object.entries(where || {}).every(([k, v]) => i[k] === v));
      items.forEach(i => Object.assign(i, data));
      return { count: items.length };
    },
    deleteMany: async () => ({ count: 0 }),
    aggregate: async () => ({ _avg: { salary: 0, technicalSkill: 0, communicationSkill: 0, leadershipSkill: 0, teamworkSkill: 0, problemSolvingSkill: 0, innovationSkill: 0 }, _count: { id: store.length } }),
    groupBy: async () => [],
  };
};

const safeModelMap = new Map<string, any>();
function getSafeModel(name: string) {
  if (!safeModelMap.has(name)) {
    safeModelMap.set(name, createSafeModel(name));
  }
  return safeModelMap.get(name);
}

function getFallback(): FakePrisma {
  if (!fallback) {
    const instance = new FakePrisma();
    instance.$connect();
    fallback = new Proxy(instance, {
      get(target: any, prop: string) {
        if (typeof prop === 'string' && prop.startsWith('$')) {
          if (prop === '$transaction') {
            return (cb: any) => (typeof cb === 'function' ? cb(fallback) : Promise.resolve(cb));
          }
          return () => Promise.resolve();
        }
        if (typeof prop === 'string' && !prop.startsWith('_')) {
          const customModel = target[prop];
          const safeDefaults = getSafeModel(prop);
          if (customModel && typeof customModel === 'object') {
            return new Proxy(customModel, {
              get(mTarget: any, mProp: string) {
                if (mProp in mTarget && typeof mTarget[mProp] === 'function') {
                  return mTarget[mProp];
                }
                if (mProp in safeDefaults) {
                  return (safeDefaults as any)[mProp];
                }
                return async () => null;
              }
            });
          }
          target[prop] = safeDefaults;
          return target[prop];
        }
        return target[prop];
      },
    }) as any;
  }
  return fallback;
}

function isConnectionError(err: any): boolean {
  const code = err?.code;
  const msg = (err?.message || String(err || '')).toLowerCase();
  return code === 'P1001' || code === 'P2024' || code === 'P1008' || code === 'ECONNRESET' || code === 'ETIMEDOUT'
    || msg.includes("can't reach database server")
    || msg.includes('timed out fetching a new connection')
    || msg.includes('connection pool')
    || msg.includes('connectionreset')
    || msg.includes('forcibly closed')
    || msg.includes('10054')
    || msg.includes('socket');
}

function switchToFallback() {
  if (!usingFallback) {
    Logger.warn('⚠️ Database unreachable at query time. Switching to in-memory FakePrisma for remaining requests.');
    usingFallback = true;
    client = getFallback();
  }
}

/**
 * Wraps a Prisma model object so that every method call is try/caught.
 * If a connection error occurs, we swap the global client to FakePrisma
 * and retry the same call on the fallback model.
 */
function wrapModel(modelName: string, realModel: any): any {
  return new Proxy(realModel, {
    get(target: any, methodName: string) {
      const original = target[methodName];
      if (typeof original !== 'function') return original;

      return async (...args: any[]) => {
        let attempts = 0;
        const maxAttempts = 3;
        while (attempts < maxAttempts) {
          try {
            return await original.apply(target, args);
          } catch (err: any) {
            attempts++;
            if (isConnectionError(err) && attempts < maxAttempts) {
              const backoffMs = attempts * 1000;
              Logger.warn(`⚠️ Neon database cold-start / connection pause on ${modelName}.${methodName}. Retrying in ${backoffMs}ms (attempt ${attempts}/${maxAttempts})...`);
              await new Promise(r => setTimeout(r, backoffMs));
              if (client && typeof (client as any).$connect === 'function') {
                try {
                  await (client as any).$connect();
                } catch {
                  /* ignore reconnect error on retry */
                }
              }
              continue;
            }
            if (isConnectionError(err) && attempts >= maxAttempts) {
              Logger.error(`❌ Neon database connection lost after ${maxAttempts} attempts for ${modelName}.${methodName}`);
              switchToFallback();
              const fb = getFallback();
              const fbModel = (fb as any)[modelName];
              if (fbModel && typeof fbModel[methodName] === 'function') {
                return fbModel[methodName](...args);
              }
              if (methodName === 'findMany') return [];
              if (methodName === 'count') return 0;
              if (methodName === 'findUnique' || methodName === 'findFirst') return null;
              return null;
            }
            throw err;
          }
        }
      };
    },
  });
}

export const initPrisma = async () => {
  if (initialized && client) return client;

  const rawUrl = process.env.DATABASE_URL || '';
  let dbUrl = rawUrl;
  if (dbUrl) {
    const params: string[] = [];
    if (!dbUrl.includes('connect_timeout')) params.push('connect_timeout=30');
    if (!dbUrl.includes('pool_timeout')) params.push('pool_timeout=60');
    if (!dbUrl.includes('connection_limit')) params.push('connection_limit=50');
    if (params.length > 0) {
      dbUrl += (dbUrl.includes('?') ? '&' : '?') + params.join('&');
    }
  }

  try {
    const real = new PrismaClient({
      datasources: dbUrl ? { db: { url: dbUrl } } : undefined,
      log: ['error'],
    });
    await real.$connect();
    client = real;
    usingFallback = false;
    Logger.info('✅ Connected to Neon Postgres database via Prisma.');
  } catch (e: any) {
    if (process.env.NODE_ENV === 'test') {
      Logger.warn('⚠️ Real PostgreSQL connection failed during tests. Falling back to FakePrisma.');
      client = getFallback();
      usingFallback = true;
      initialized = true;
      return client;
    }
    Logger.error(`❌ Neon PostgreSQL connection failed: ${e.message}`, e);
    Logger.warn('⚠️ Could not reach remote Neon database on startup. Falling back to local dev JSON database.');
    client = getFallback();
    usingFallback = true;
    initialized = true;
    return client;
  }

  initialized = true;
  return client;
};


// Proxy that forwards to actual client after initialization, with auto-fallback
const proxy = new Proxy({}, {
  get(_, prop: string) {
    if (!client) {
      if (process.env.NODE_ENV === 'test') {
        client = getFallback();
      } else {
        throw new Error('Prisma client not initialized. Call initPrisma() first.');
      }
    }

    const v = (client as any)[prop];

    // For $-methods (like $connect, $disconnect, $transaction), bind directly
    if (typeof prop === 'string' && prop.startsWith('$')) {
      return typeof v === 'function' ? v.bind(client) : v;
    }

    // For model accessors (e.g. prisma.alumniProfile), wrap with fallback logic
    // Only wrap if we're using the real Prisma client (not already on fallback)
    if (v && typeof v === 'object' && !usingFallback) {
      return wrapModel(prop, v);
    }

    return typeof v === 'function' ? v.bind(client) : v;
  },
  set(_, prop: string, value) {
    if (!client) {
      if (process.env.NODE_ENV === 'test') {
        client = getFallback();
      } else {
        throw new Error('Prisma client not initialized. Call initPrisma() first.');
      }
    }
    (client as any)[prop] = value;
    return true;
  }
});

export default proxy as PrismaClient;
