import { PrismaClient } from '@prisma/client';
import { Logger } from '../utils/logger.utils';
import fs from 'fs';
import path from 'path';

// ─── In-memory dev DB helpers ───
const DEV_DB_PATH = process.env.NODE_ENV === 'test'
  ? path.join(process.cwd(), 'data', 'test-db.json')
  : path.join(process.cwd(), 'data', 'dev-db.json');
function readDevDb(): any {
  let store: any = null;
  try {
    if (fs.existsSync(DEV_DB_PATH)) {
      store = JSON.parse(fs.readFileSync(DEV_DB_PATH, 'utf-8'));
    } else if (process.env.NODE_ENV === 'test') {
      const templatePath = path.join(process.cwd(), 'data', 'dev-db.json');
      if (fs.existsSync(templatePath)) {
        store = JSON.parse(fs.readFileSync(templatePath, 'utf-8'));
      }
    }
  } catch { /* ignore */ }
  if (!store) {
    store = {
      users: [],
      alumniProfiles: [],
      employerProfiles: [],
      departments: [],
      registrarStudents: [],
      registrarSyncLogs: [],
      auditLogs: [],
      notifications: [],
      documentRequests: [],
      contentItems: [],
      mediaAssets: [],
      homepageConfigs: [],
    };
  }

  // Do not auto-bootstrap CMS demo content from cms-content.json.
  // Content is posted via the CMS only (post → test → clear).

  // Older dev-db.json snapshots may predate newer collections; make sure every
  // collection the fallback client touches exists so a read can never throw
  // "Cannot read properties of undefined".
  const COLLECTIONS = [
    'users', 'alumniProfiles', 'employerProfiles', 'departments', 'registrarStudents',
    'registrarSyncLogs', 'auditLogs', 'notifications', 'documentRequests',
    'contentItems', 'mediaAssets', 'homepageConfigs', 'jobs', 'events', 'eventRSVPs',
    'surveys', 'surveyResponses', 'mentorships', 'communityMembers',
    'departmentHeadProfiles', 'verificationRequests', 'forumPosts', 'employerFeedbacks',
    'donationCampaigns',
    'contentTemplates',
    'knowledgeDocuments', 'knowledgeChunks',
  ];
  for (const key of COLLECTIONS) {
    if (!Array.isArray(store[key])) store[key] = store[key] ?? [];
  }

  // contentTemplates stay empty until created in CMS — no demo seed.

  // donationCampaigns stay empty until created in CMS — no demo seed.

  return store;
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

  $disconnect() {
    // Nothing to flush: every mutation writes straight to the JSON store.
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
      const store = readDevDb();
      store.users.push(rec);
      writeDevDb(store);
      return rec;
    },
    update: async ({ where, data }: any) => {
      const store = readDevDb();
      const idx = store.users.findIndex((u: any) => u.id === where.id || u.email === where.email);
      if (idx === -1) throw new Error('User not found');
      store.users[idx] = { ...store.users[idx], ...data, updatedAt: new Date().toISOString() };
      writeDevDb(store);
      return store.users[idx];
    },
    delete: async ({ where }: any) => {
      const store = readDevDb();
      const idx = store.users.findIndex((u: any) => u.id === where.id);
      if (idx === -1) throw new Error('User not found');
      const [removed] = store.users.splice(idx, 1);
      // Cascade delete related alumniProfile and employerProfile records
      if (store.alumniProfiles) {
        store.alumniProfiles = store.alumniProfiles.filter(
          (a: any) => a.userId !== where.id && a.id !== where.id
        );
      }
      if (store.employerProfiles) {
        store.employerProfiles = store.employerProfiles.filter(
          (e: any) => e.userId !== where.id && e.id !== where.id
        );
      }
      writeDevDb(store);
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
      if (where?.isVerified !== undefined) profiles = profiles.filter((a: any) => Boolean(a.isVerified) === Boolean(where.isVerified));
      if (where?.employmentStatus) {
        if (typeof where.employmentStatus === 'string') profiles = profiles.filter((a: any) => a.employmentStatus === where.employmentStatus);
        else if (where.employmentStatus?.in) profiles = profiles.filter((a: any) => where.employmentStatus.in.includes(a.employmentStatus));
      }
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
    delete: async ({ where }: any = {}) => {
      const store = readDevDb();
      if (store.alumniProfiles) {
        const idx = store.alumniProfiles.findIndex((a: any) =>
          (where?.id !== undefined && (a.id === where.id || a.userId === where.id)) ||
          (where?.userId !== undefined && a.userId === where.userId) ||
          (where?.studentId !== undefined && a.studentId === where.studentId)
        );
        if (idx !== -1) {
          const [removed] = store.alumniProfiles.splice(idx, 1);
          writeDevDb(store);
          return removed;
        }
      }
      return {};
    },
  };

  employerProfile = {
    findUnique: async ({ where }: any) => {
      const store = readDevDb();
      if (where?.userId) return (store.employerProfiles || []).find((e: any) => e.userId === where.userId) || null;
      if (where?.id) return (store.employerProfiles || []).find((e: any) => e.id === where.id) || null;
      return null;
    },
    findMany: async ({ where, skip, take }: any = {}) => {
      const store = readDevDb();
      let employers = [...(store.employerProfiles || [])];
      if (where?.isVerified !== undefined) employers = employers.filter((e: any) => Boolean(e.isVerified) === Boolean(where.isVerified));
      if (skip) employers = employers.slice(skip);
      if (take) employers = employers.slice(0, take);
      return employers;
    },
    count: async ({ where }: any = {}) => {
      const store = readDevDb();
      let employers = store.employerProfiles || [];
      if (where?.isVerified !== undefined) employers = employers.filter((e: any) => Boolean(e.isVerified) === Boolean(where.isVerified));
      return employers.length;
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
    findUnique: async ({ where }: any = {}) => {
      const depts = this.store.departments || [];
      if (where?.code) return depts.find((d: any) => d.code === where.code) || null;
      if (where?.id) return depts.find((d: any) => d.id === where.id) || null;
      if (where?.name) return depts.find((d: any) => (d.name || '').toLowerCase() === String(where.name).toLowerCase()) || null;
      return null;
    },
    findMany: async ({ orderBy, include, select }: any = {}) => {
      const store = readDevDb();
      const depts = store.departments || [];
      const alumniProfiles = store.alumniProfiles || [];
      const users = store.users || [];
      const matchDept = (a: any, d: any) =>
        a.departmentId === d.id ||
        (d.code && a.departmentId?.toLowerCase().includes(d.code.toLowerCase())) ||
        (d.code && a.studentId?.toLowerCase().includes('/' + d.code.toLowerCase() + '/')) ||
        a.department === d.name;

      return depts.map((d: any) => {
        const matchedProfiles = alumniProfiles.filter((a: any) => matchDept(a, d));
        const rec: any = {
          ...d,
          departmentHeadProfiles: d.departmentHeadProfiles || [],
          _count: { alumniProfiles: matchedProfiles.length },
        };
        if (include?.alumniProfiles || select?.alumniProfiles) {
          rec.alumniProfiles = matchedProfiles;
        }
        if (include?.departmentHeadProfiles?.include?.user) {
          rec.departmentHeadProfiles = (rec.departmentHeadProfiles || []).map((h: any) => ({
            ...h,
            user: h.user || users.find((u: any) => u.id === h.userId) || null,
          }));
        }
        return rec;
      });
    },
    count: async () => (readDevDb().departments || []).length,
    create: async ({ data }: any) => {
      const rec = { ...data, id: `dev-dept-${Date.now()}` };
      const store = readDevDb();
      store.departments.push(rec);
      writeDevDb(store);
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
      const store = readDevDb();
      store.registrarStudents.push(rec);
      writeDevDb(store);
      return rec;
    },
    update: async ({ where, data }: any) => {
      const store = readDevDb();
      const idx = store.registrarStudents.findIndex((r: any) => r.studentId === where.studentId || r.id === where.id);
      if (idx === -1) throw new Error('Registrar student record not found');
      store.registrarStudents[idx] = {
        ...store.registrarStudents[idx],
        ...data,
        updatedAt: new Date().toISOString(),
      };
      writeDevDb(store);
      return store.registrarStudents[idx];
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
      const store = readDevDb();
      store.registrarSyncLogs = store.registrarSyncLogs || [];
      store.registrarSyncLogs.push(rec);
      writeDevDb(store);
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
      const store = readDevDb();
      store.auditLogs = store.auditLogs || [];
      store.auditLogs.push(rec);
      writeDevDb(store);
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
      const store = readDevDb();
      if (!store.documentRequests) store.documentRequests = [];
      store.documentRequests.push(rec);
      writeDevDb(store);
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
          logoUrl: '/images/partners/insa.png',
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
        logoUrl: '/images/partners/insa.png',
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

  contentItem = {
    findMany: async ({ where, orderBy, skip, take }: any = {}) => {
      const store = readDevDb();
      let items = [...(store.contentItems || [])];
      if (where?.status) items = items.filter((i: any) => i.status?.toUpperCase() === where.status?.toUpperCase());
      if (where?.type) items = items.filter((i: any) => i.type?.toUpperCase() === where.type?.toUpperCase());
      if (where?.featured !== undefined) items = items.filter((i: any) => i.featured === where.featured);
      if (where?.pinned !== undefined) items = items.filter((i: any) => i.pinned === where.pinned);
      if (where?.OR && Array.isArray(where.OR)) {
        const query = (where.OR[0]?.title?.contains || where.OR[0]?.excerpt?.contains || '').toLowerCase();
        if (query) {
          items = items.filter((i: any) =>
            (i.title || '').toLowerCase().includes(query) ||
            (i.excerpt || '').toLowerCase().includes(query) ||
            (i.tags || []).some((t: string) => t.toLowerCase().includes(query))
          );
        }
      }
      if (orderBy?.createdAt === 'desc') {
        items.sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      }
      if (skip) items = items.slice(skip);
      if (take) items = items.slice(0, take);
      return items;
    },
    findUnique: async ({ where }: any = {}) => {
      const store = readDevDb();
      const items = store.contentItems || [];
      if (where?.id) return items.find((i: any) => i.id === where.id) || null;
      if (where?.slug) return items.find((i: any) => i.slug === where.slug) || null;
      return null;
    },
    findFirst: async ({ where }: any = {}) => {
      const store = readDevDb();
      const items = store.contentItems || [];
      if (where?.id) return items.find((i: any) => i.id === where.id) || null;
      if (where?.slug) return items.find((i: any) => i.slug === where.slug) || null;
      return items[0] || null;
    },
    count: async ({ where }: any = {}) => {
      const store = readDevDb();
      let items = store.contentItems || [];
      if (where?.status) items = items.filter((i: any) => i.status?.toUpperCase() === where.status?.toUpperCase());
      if (where?.type) items = items.filter((i: any) => i.type?.toUpperCase() === where.type?.toUpperCase());
      return items.length;
    },
    create: async ({ data }: any) => {
      const store = readDevDb();
      const rec = {
        id: data.id || `C-${Date.now().toString().slice(-4)}`,
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      if (!store.contentItems) store.contentItems = [];
      store.contentItems.unshift(rec);
      writeDevDb(store);
      return rec;
    },
    update: async ({ where, data }: any) => {
      const store = readDevDb();
      const idx = (store.contentItems || []).findIndex((i: any) => i.id === where.id || i.slug === where.slug);
      if (idx === -1) throw new Error('Content item not found');
      store.contentItems[idx] = { ...store.contentItems[idx], ...data, updatedAt: new Date().toISOString() };
      writeDevDb(store);
      return store.contentItems[idx];
    },
    delete: async ({ where }: any = {}) => {
      const store = readDevDb();
      if (store.contentItems) {
        const idx = store.contentItems.findIndex((i: any) => i.id === where.id);
        if (idx !== -1) {
          const removed = store.contentItems.splice(idx, 1)[0];
          writeDevDb(store);
          return removed;
        }
      }
      return {};
    },
    upsert: async ({ where, create, update }: any) => {
      const store = readDevDb();
      const existing = (store.contentItems || []).find((i: any) => i.id === where.id || i.slug === where.slug);
      if (existing) {
        return this.contentItem.update({ where, data: update });
      }
      return this.contentItem.create({ data: create });
    },
  };

  mediaAsset = {
    findMany: async ({ where }: any = {}) => {
      const store = readDevDb();
      let items = store.mediaAssets || [];
      if (where?.album) items = items.filter((m: any) => m.album === where.album);
      return items;
    },
    create: async ({ data }: any) => {
      const store = readDevDb();
      const rec = { ...data, id: data.id || `media-${Date.now()}`, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      if (!store.mediaAssets) store.mediaAssets = [];
      store.mediaAssets.unshift(rec);
      writeDevDb(store);
      return rec;
    },
    delete: async ({ where }: any = {}) => {
      const store = readDevDb();
      if (store.mediaAssets) {
        store.mediaAssets = store.mediaAssets.filter((m: any) => m.id !== where.id);
        writeDevDb(store);
      }
      return {};
    },
  };


  contentTemplate = {
    findMany: async ({ where, orderBy }: any = {}) => {
      const store = readDevDb();
      let list = [...(store.contentTemplates || [])];
      if (where?.category && where.category !== 'all' && where.category !== 'ALL') {
        list = list.filter((t: any) => String(t.category).toLowerCase() === String(where.category).toLowerCase());
      }
      if (where?.isFeatured !== undefined) {
        list = list.filter((t: any) => Boolean(t.isFeatured) === Boolean(where.isFeatured));
      }
      if (where?.search) {
        const q = String(where.search).toLowerCase();
        list = list.filter((t: any) =>
          (t.name && t.name.toLowerCase().includes(q)) ||
          (t.description && t.description.toLowerCase().includes(q)) ||
          (t.category && t.category.toLowerCase().includes(q)) ||
          (Array.isArray(t.fields) && t.fields.some((f: string) => f.toLowerCase().includes(q)))
        );
      }
      // Sort: Featured first, then by usage descending
      list.sort((a: any, b: any) => {
        if (a.isFeatured && !b.isFeatured) return -1;
        if (!a.isFeatured && b.isFeatured) return 1;
        return (b.usage || 0) - (a.usage || 0);
      });
      return list;
    },
    findUnique: async ({ where }: any = {}) => {
      const store = readDevDb();
      return (store.contentTemplates || []).find((t: any) => t.id === where?.id) || null;
    },
    count: async ({ where }: any = {}) => {
      const store = readDevDb();
      let list = [...(store.contentTemplates || [])];
      if (where?.category && where.category !== 'all' && where.category !== 'ALL') {
        list = list.filter((t: any) => String(t.category).toLowerCase() === String(where.category).toLowerCase());
      }
      return list.length;
    },
    create: async ({ data }: any) => {
      const store = readDevDb();
      store.contentTemplates = store.contentTemplates || [];
      const rec = {
        ...data,
        id: data.id || `tpl-${Date.now()}`,
        usage: Number(data.usage) || 0,
        lastUpdated: data.lastUpdated || 'Just now',
        isDefault: Boolean(data.isDefault),
        isFeatured: Boolean(data.isFeatured),
        fields: Array.isArray(data.fields) ? data.fields : [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      store.contentTemplates.push(rec);
      writeDevDb(store);
      return rec;
    },
    update: async ({ where, data }: any) => {
      const store = readDevDb();
      const list = store.contentTemplates || [];
      const idx = list.findIndex((t: any) => t.id === where?.id);
      if (idx === -1) throw new Error('Template not found');
      list[idx] = {
        ...list[idx],
        ...data,
        updatedAt: new Date().toISOString(),
        lastUpdated: 'Just now',
      };
      store.contentTemplates = list;
      writeDevDb(store);
      return list[idx];
    },
    delete: async ({ where }: any) => {
      const store = readDevDb();
      store.contentTemplates = (store.contentTemplates || []).filter((t: any) => t.id !== where?.id);
      writeDevDb(store);
      return { success: true };
    },
    incrementUsage: async ({ where }: any) => {
      const store = readDevDb();
      const list = store.contentTemplates || [];
      const idx = list.findIndex((t: any) => t.id === where?.id);
      if (idx === -1) throw new Error('Template not found');
      list[idx].usage = (Number(list[idx].usage) || 0) + 1;
      list[idx].lastUpdated = 'Just now';
      list[idx].updatedAt = new Date().toISOString();
      store.contentTemplates = list;
      writeDevDb(store);
      return list[idx];
    },
  };

  donationCampaign = {
    findMany: async ({ where, orderBy }: any = {}) => {
      const store = readDevDb();
      let list = [...(store.donationCampaigns || [])];
      if (where?.status && where.status !== 'ALL') {
        list = list.filter((c: any) => c.status === where.status);
      }
      if (where?.category && where.category !== 'ALL') {
        list = list.filter((c: any) => c.category === where.category);
      }
      return list;
    },
    findUnique: async ({ where }: any = {}) => {
      const store = readDevDb();
      return (store.donationCampaigns || []).find((c: any) => c.id === where?.id) || null;
    },
    count: async ({ where }: any = {}) => {
      const store = readDevDb();
      let list = store.donationCampaigns || [];
      if (where?.status && where.status !== 'ALL') {
        list = list.filter((c: any) => c.status === where.status);
      }
      return list.length;
    },
    create: async ({ data }: any) => {
      const store = readDevDb();
      const rec = { ...data, id: data.id || `camp-${Date.now()}`, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      store.donationCampaigns = store.donationCampaigns || [];
      store.donationCampaigns.push(rec);
      writeDevDb(store);
      return rec;
    },
    createMany: async ({ data }: any = {}) => {
      const store = readDevDb();
      const items = Array.isArray(data) ? data : [data];
      const created = items.map((c: any) => ({
        ...c,
        id: c.id || `camp-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));
      store.donationCampaigns = store.donationCampaigns || [];
      store.donationCampaigns.push(...created);
      writeDevDb(store);
      return { count: created.length };
    },
    update: async ({ where, data }: any) => {
      const store = readDevDb();
      const list = store.donationCampaigns || [];
      const idx = list.findIndex((c: any) => c.id === where?.id);
      if (idx === -1) throw new Error('Campaign not found');
      list[idx] = { ...list[idx], ...data, updatedAt: new Date().toISOString() };
      store.donationCampaigns = list;
      writeDevDb(store);
      return list[idx];
    },
    delete: async ({ where }: any) => {
      const store = readDevDb();
      store.donationCampaigns = (store.donationCampaigns || []).filter((c: any) => c.id !== where?.id);
      writeDevDb(store);
      return {};
    },
  };

  homepageConfig = {
    findUnique: async ({ where }: any = {}) => {
      const store = readDevDb();
      const configs = store.homepageConfigs || [];
      return configs.find((c: any) => c.key === (where?.key || 'main')) || null;
    },
    upsert: async ({ where, create, update }: any) => {
      const store = readDevDb();
      if (!store.homepageConfigs) store.homepageConfigs = [];
      const key = where?.key || 'main';
      const idx = store.homepageConfigs.findIndex((c: any) => c.key === key);
      if (idx !== -1) {
        const existingData = store.homepageConfigs[idx].data || {};
        const mergedData = update.data ? { ...existingData, ...update.data } : existingData;
        store.homepageConfigs[idx] = {
          ...store.homepageConfigs[idx],
          ...update,
          data: mergedData,
          updatedAt: new Date().toISOString()
        };
        writeDevDb(store);
        return store.homepageConfigs[idx];
      }
      const rec = { id: `hc-${Date.now()}`, key, ...create, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      store.homepageConfigs.push(rec);
      writeDevDb(store);
      return rec;
    },
    update: async ({ where, data }: any) => {
      const store = readDevDb();
      if (!store.homepageConfigs) store.homepageConfigs = [];
      const key = where?.key || 'main';
      const idx = store.homepageConfigs.findIndex((c: any) => c.key === key);
      if (idx !== -1) {
        const existingData = store.homepageConfigs[idx].data || {};
        const mergedData = data.data ? { ...existingData, ...data.data } : (data && typeof data === 'object' ? { ...existingData, ...data } : existingData);
        store.homepageConfigs[idx] = {
          ...store.homepageConfigs[idx],
          ...data,
          data: mergedData,
          updatedAt: new Date().toISOString()
        };
        writeDevDb(store);
        return store.homepageConfigs[idx];
      }
      const rec = { id: `hc-${Date.now()}`, key, ...data, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      store.homepageConfigs.push(rec);
      writeDevDb(store);
      return rec;
    },
  };

  // Catch-all: for any model not explicitly defined, return safe no-ops
  [key: string]: any;

  departmentHeadProfile = {
    findUnique: async ({ where, include }: any = {}) => {
      const store = readDevDb();
      let profile = (store.departmentHeadProfiles || []).find(
        (p: any) => (where?.userId && p.userId === where.userId) || (where?.id && p.id === where.id)
      );
      if (!profile && where?.userId) {
        const u = (store.users || []).find((usr: any) => usr.id === where.userId);
        if (u) {
          const email = (u.email || '').toLowerCase();
          let deptCode = 'COM';
          let deptName = 'Computer Science';
          if (email.includes('swe') || email.includes('software')) {
            deptCode = 'SWE';
            deptName = 'Software Engineering';
          } else if (email.includes('ece') || email.includes('electrical')) {
            deptCode = 'ECE';
            deptName = 'Electrical and Computer Engineering';
          } else if (email.includes('meg') || email.includes('mechanical')) {
            deptCode = 'MEG';
            deptName = 'Mechanical Engineering';
          } else if (email.includes('cve') || email.includes('civil')) {
            deptCode = 'CVE';
            deptName = 'Civil Engineering';
          } else if (email.includes('che') || email.includes('chemical')) {
            deptCode = 'CHE';
            deptName = 'Chemical Engineering';
          } else if (email.includes('geo') || email.includes('geology')) {
            deptCode = 'GEO';
            deptName = 'Applied Geology';
          }
          profile = {
            id: `dev-head-${u.id}`,
            userId: u.id,
            department: { id: `dev-dept-${deptCode.toLowerCase()}`, name: deptName, code: deptCode },
          };
        }
      }
      if (profile && include?.department && !profile.department) {
        const d = (store.departments || []).find((dept: any) => dept.id === profile.departmentId);
        if (d) profile = { ...profile, department: d };
      }
      return profile;
    },
    findMany: async () => readDevDb().departmentHeadProfiles || [],
  };

  communityMember = {
    findMany: async ({ where }: any = {}) => {
      const store = readDevDb();
      let items = [...(store.communityMembers || [])];
      if (where?.active !== undefined) items = items.filter((m: any) => Boolean(m.active) === Boolean(where.active));
      if (where?.category) items = items.filter((m: any) => m.category === where.category);
      return items;
    },
    findUnique: async ({ where }: any = {}) => {
      const items = readDevDb().communityMembers || [];
      if (where?.id) return items.find((m: any) => m.id === where.id) || null;
      return null;
    },
    count: async () => (readDevDb().communityMembers || []).length,
    create: async ({ data }: any) => {
      const store = readDevDb();
      const rec = {
        ...data,
        id: data.id || `cm-${Date.now().toString().slice(-6)}`,
        active: data.active !== false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      if (!store.communityMembers) store.communityMembers = [];
      store.communityMembers.unshift(rec);
      writeDevDb(store);
      return rec;
    },
    update: async ({ where, data }: any) => {
      const store = readDevDb();
      const idx = (store.communityMembers || []).findIndex((m: any) => m.id === where.id);
      if (idx === -1) throw new Error('Community member not found');
      store.communityMembers[idx] = { ...store.communityMembers[idx], ...data, updatedAt: new Date().toISOString() };
      writeDevDb(store);
      return store.communityMembers[idx];
    },
    delete: async ({ where }: any = {}) => {
      const store = readDevDb();
      const before = (store.communityMembers || []).length;
      store.communityMembers = (store.communityMembers || []).filter((m: any) => m.id !== where.id);
      writeDevDb(store);
      if (store.communityMembers.length === before) throw new Error('Community member not found');
      return {};
    },
    deleteMany: async ({ where }: any = {}) => {
      const store = readDevDb();
      const before = (store.communityMembers || []).length;
      if (where?.id) store.communityMembers = (store.communityMembers || []).filter((m: any) => m.id !== where.id);
      writeDevDb(store);
      return { count: before - (store.communityMembers?.length || 0) };
    },
  };

  verificationRequest = {
    count: async ({ where }: any = {}) => {
      let reqs = readDevDb().verificationRequests || [];
      if (where?.status) reqs = reqs.filter((r: any) => r.status === where.status);
      return reqs.length;
    },
    findMany: async () => readDevDb().verificationRequests || [],
  };

  event = {
    findUnique: async ({ where }: any = {}) => {
      const store = readDevDb();
      const events = store.events || store.hiringEvents || [];
      if (where?.id) return events.find((e: any) => e.id === where.id) || null;
      return null;
    },
    findMany: async ({ where, orderBy }: any = {}) => {
      const store = readDevDb();
      let events = [...(store.events || store.hiringEvents || [])];
      if (where?.type) events = events.filter((e: any) => e.type === where.type);
      if (orderBy?.date === 'asc') {
        events.sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
      } else if (orderBy?.date === 'desc') {
        events.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
      }
      return events;
    },
    count: async () => (readDevDb().events || readDevDb().hiringEvents || []).length,
    create: async ({ data }: any) => {
      const store = readDevDb();
      const rec = { ...data, id: data.id || `dev-event-${Date.now()}`, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      store.events = store.events || [];
      store.events.push(rec);
      writeDevDb(store);
      return rec;
    },
    update: async ({ where, data }: any) => {
      const store = readDevDb();
      const events = store.events || [];
      const idx = events.findIndex((e: any) => e.id === where?.id);
      if (idx === -1) throw new Error('Event not found');
      events[idx] = { ...events[idx], ...data, updatedAt: new Date().toISOString() };
      store.events = events;
      writeDevDb(store);
      return events[idx];
    },
    delete: async ({ where }: any) => {
      const store = readDevDb();
      const before = (store.events || []).length;
      store.events = (store.events || []).filter((e: any) => e.id !== where?.id);
      writeDevDb(store);
      if (store.events.length === before) throw new Error('Event not found');
      return {};
    },
  };

  eventRSVP = {
    findUnique: async ({ where }: any = {}) => {
      const store = readDevDb();
      const key = where?.eventId_alumniId;
      const rsvps = store.eventRSVPs || [];
      if (key) return rsvps.find((r: any) => r.eventId === key.eventId && r.alumniId === key.alumniId) || null;
      if (where?.id) return rsvps.find((r: any) => r.id === where.id) || null;
      return null;
    },
    findMany: async ({ where, include }: any = {}) => {
      const store = readDevDb();
      let rsvps = [...(store.eventRSVPs || [])];
      if (where?.eventId) rsvps = rsvps.filter((r: any) => r.eventId === where.eventId);
      if (where?.status) rsvps = rsvps.filter((r: any) => r.status === where.status);
      if (include?.alumni) {
        const profiles = store.alumniProfiles || [];
        const departments = store.departments || [];
        rsvps = rsvps.map((r: any) => {
          const alumni = profiles.find((a: any) => a.id === r.alumniId || a.userId === r.alumniId) || null;
          if (!alumni) return { ...r, alumni: null };
          const department = departments.find((d: any) => d.id === alumni.departmentId) || null;
          return {
            ...r,
            alumni: {
              fullName: alumni.fullName,
              profilePicture: alumni.profilePicture,
              department: department ? { name: department.name } : null,
            },
          };
        });
      }
      return rsvps;
    },
    count: async ({ where }: any = {}) => (await this.eventRSVP.findMany({ where })).length,
    create: async ({ data }: any) => {
      const store = readDevDb();
      const rec = { ...data, id: data.id || `dev-rsvp-${Date.now()}`, createdAt: new Date().toISOString() };
      store.eventRSVPs = store.eventRSVPs || [];
      store.eventRSVPs.push(rec);
      writeDevDb(store);
      return rec;
    },
    update: async ({ where, data }: any) => {
      const store = readDevDb();
      const rsvps = store.eventRSVPs || [];
      const idx = rsvps.findIndex((r: any) => r.id === where?.id);
      if (idx === -1) throw new Error('RSVP not found');
      rsvps[idx] = { ...rsvps[idx], ...data, updatedAt: new Date().toISOString() };
      store.eventRSVPs = rsvps;
      writeDevDb(store);
      return rsvps[idx];
    },
  };

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

function applyPrismaUpdate(target: any, data: any): any {
  if (!data || typeof data !== 'object') return target;
  for (const [key, val] of Object.entries(data)) {
    if (val !== null && typeof val === 'object' && !Array.isArray(val) && !(val instanceof Date)) {
      const v = val as any;
      if ('increment' in v) {
        target[key] = (Number(target[key]) || 0) + Number(v.increment);
        continue;
      }
      if ('decrement' in v) {
        target[key] = (Number(target[key]) || 0) - Number(v.decrement);
        continue;
      }
      if ('multiply' in v) {
        target[key] = (Number(target[key]) || 0) * Number(v.multiply);
        continue;
      }
      if ('divide' in v) {
        target[key] = (Number(target[key]) || 0) / Number(v.divide);
        continue;
      }
      if ('set' in v) {
        target[key] = v.set;
        continue;
      }
    }
    target[key] = val;
  }
  return target;
}

function sanitizePrismaCreate(data: any): any {
  if (!data || typeof data !== 'object') return data;
  const res: any = {};
  for (const [key, val] of Object.entries(data)) {
    if (val !== null && typeof val === 'object' && !Array.isArray(val) && !(val instanceof Date)) {
      const v = val as any;
      if ('create' in v) {
        res[key] = Array.isArray(v.create) ? v.create : [v.create];
        continue;
      }
      if ('createMany' in v && v.createMany?.data) {
        res[key] = Array.isArray(v.createMany.data) ? v.createMany.data : [v.createMany.data];
        continue;
      }
      if ('increment' in v) {
        res[key] = Number(v.increment) || 0;
        continue;
      }
      if ('decrement' in v) {
        res[key] = -(Number(v.decrement) || 0);
        continue;
      }
      if ('set' in v) {
        res[key] = v.set;
        continue;
      }
    }
    res[key] = val;
  }
  return res;
}

function sanitizeItemForRead(item: any): any {
  if (!item || typeof item !== 'object') return item;
  for (const key of Object.keys(item)) {
    const val = item[key];
    if (val !== null && typeof val === 'object' && !Array.isArray(val) && !(val instanceof Date)) {
      if ('create' in val) {
        item[key] = Array.isArray(val.create) ? val.create : [val.create];
      } else if ('createMany' in val && val.createMany?.data) {
        item[key] = Array.isArray(val.createMany.data) ? val.createMany.data : [val.createMany.data];
      } else if ('increment' in val) {
        item[key] = Number(val.increment) || 0;
      } else if ('decrement' in val) {
        item[key] = -(Number(val.decrement) || 0);
      } else if ('set' in val) {
        item[key] = val.set;
      }
    }
  }
  return item;
}

const createSafeModel = (name: string) => {
  const store: any[] = [];
  return {
    findMany: async ({ where }: any = {}) => {
      let results = store;
      if (where && Object.keys(where).length > 0) {
        results = store.filter((item: any) => {
          return Object.entries(where).every(([k, v]) => item[k] === v);
        });
      }
      return results.map((item: any) => sanitizeItemForRead(item));
    },
    findUnique: async ({ where }: any = {}) => {
      if (!where) return null;
      const found = store.find((item: any) => {
        return Object.entries(where).every(([k, v]) => item[k] === v);
      });
      return found ? sanitizeItemForRead(found) : null;
    },
    findFirst: async ({ where }: any = {}) => {
      if (!where || Object.keys(where).length === 0) return store[0] ? sanitizeItemForRead(store[0]) : null;
      const found = store.find((item: any) => {
        return Object.entries(where).every(([k, v]) => item[k] === v);
      });
      return found ? sanitizeItemForRead(found) : null;
    },
    count: async ({ where }: any = {}) => {
      if (!where || Object.keys(where).length === 0) return store.length;
      return store.filter((item: any) => Object.entries(where).every(([k, v]) => item[k] === v)).length;
    },
    create: async ({ data }: any) => {
      const sanitized = sanitizePrismaCreate(data);
      const id = sanitized?.id || `dev-${name}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const rec = { id, ...sanitized };
      store.push(rec);
      return sanitizeItemForRead(rec);
    },
    createMany: async ({ data }: any = {}) => {
      const items = Array.isArray(data) ? data : [data];
      const created = items.map((item: any) => {
        const sanitized = sanitizePrismaCreate(item);
        const id = sanitized?.id || `dev-${name}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
        const rec = { id, ...sanitized };
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
      applyPrismaUpdate(item, data);
      return sanitizeItemForRead(item);
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
        applyPrismaUpdate(item, update);
        return sanitizeItemForRead(item);
      }
      const sanitized = sanitizePrismaCreate(create);
      const rec = { id: `dev-${name}-${Date.now()}`, ...sanitized };
      store.push(rec);
      return sanitizeItemForRead(rec);
    },
    updateMany: async ({ where, data }: any = {}) => {
      const items = store.filter((i: any) => Object.entries(where || {}).every(([k, v]) => i[k] === v));
      items.forEach(i => applyPrismaUpdate(i, data));
      return { count: items.length };
    },
    deleteMany: async ({ where }: any = {}) => {
      if (!where || Object.keys(where).length === 0) {
        const count = store.length;
        store.length = 0;
        return { count };
      }
      let count = 0;
      for (let i = store.length - 1; i >= 0; i -= 1) {
        if (Object.entries(where).every(([k, v]) => store[i][k] === v)) {
          store.splice(i, 1);
          count += 1;
        }
      }
      return { count };
    },
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
        try {
          return await original.apply(target, args);
        } catch (err: any) {
          if (isConnectionError(err)) {
            Logger.warn(`⚠️ Neon database connection reset on ${modelName}.${methodName}. Switching instantly to local fallback.`);
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
      client = getFallback();
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
      client = getFallback();
    }
    (client as any)[prop] = value;
    return true;
  }
});

export default proxy as PrismaClient;
