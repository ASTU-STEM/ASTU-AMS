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
    findUnique: async ({ where }: any) => {
      const store = readDevDb();
      if (where?.userId) return (store.alumniProfiles || []).find((a: any) => a.userId === where.userId) || null;
      if (where?.studentId) return (store.alumniProfiles || []).find((a: any) => a.studentId === where.studentId) || null;
      if (where?.id) return (store.alumniProfiles || []).find((a: any) => a.id === where.id) || null;
      return null;
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
      const idx = (store.alumniProfiles || []).findIndex((a: any) => a.id === where.id || a.userId === where.userId || a.studentId === where.studentId);
      if (idx === -1) throw new Error('Alumni profile not found');
      store.alumniProfiles[idx] = { ...store.alumniProfiles[idx], ...data, updatedAt: new Date().toISOString() };
      writeDevDb(store);
      return store.alumniProfiles[idx];
    },
  };

  employerProfile = {
    create: async ({ data }: any) => {
      const rec = { ...data, id: `dev-employer-${Date.now()}`, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      this.store.employerProfiles.push(rec);
      writeDevDb(this.store);
      return rec;
    },
    findUnique: async ({ where }: any) => {
      if (where.userId) return this.store.employerProfiles.find((e: any) => e.userId === where.userId) || null;
      return null;
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
      const rec = { ...data, id: `dev-notif-${Date.now()}`, createdAt: new Date().toISOString(), isRead: false };
      if (!this.store.notifications) this.store.notifications = [];
      this.store.notifications.push(rec);
      writeDevDb(this.store);
      return rec;
    },
    findMany: async ({ where, orderBy }: any = {}) => {
      let items = this.store.notifications || [];
      if (where?.userId) items = items.filter((n: any) => n.userId === where.userId);
      if (where?.isRead !== undefined) items = items.filter((n: any) => n.isRead === where.isRead);
      return items;
    },
    count: async ({ where }: any = {}) => {
      let items = this.store.notifications || [];
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
      return apps.length;
    },
    findMany: async ({ where }: any = {}) => {
      const store = readDevDb();
      let apps = store.jobApplications || [];
      if (where?.jobId) apps = apps.filter((a: any) => a.jobId === where.jobId);
      if (where?.alumniId) apps = apps.filter((a: any) => a.alumniId === where.alumniId);
      if (where?.job?.employerId) {
        const empJobIds = new Set((store.jobs || []).filter((j: any) => j.employerId === where.job.employerId).map((j: any) => j.id));
        apps = apps.filter((a: any) => empJobIds.has(a.jobId));
      }
      return apps.map((a: any) => {
        const job = (store.jobs || []).find((j: any) => j.id === a.jobId);
        const alumni = (store.alumniProfiles || []).find((al: any) => al.id === a.alumniId || al.userId === a.alumniId);
        const user = (store.users || []).find((u: any) => u.id === alumni?.userId || u.id === a.alumniId);
        return {
          ...a,
          job: job ? { ...job, employer: { companyName: 'INSA' } } : null,
          alumni: alumni ? { ...alumni, user: user || { email: alumni?.email || 'alumni@astu.edu.et' } } : null,
        };
      });
    },
    findUnique: async ({ where }: any = {}) => {
      const store = readDevDb();
      return (store.jobApplications || []).find((a: any) => a.id === where?.id) || null;
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

const createSafeModel = (name: string) => ({
  findMany: async () => [],
  findUnique: async () => null,
  findFirst: async () => null,
  count: async () => 0,
  create: async ({ data }: any) => ({ ...data, id: `dev-${name}-${Date.now()}` }),
  update: async ({ where, data }: any) => ({ id: where?.id, ...data }),
  delete: async () => ({}),
  upsert: async ({ create }: any) => ({ ...create, id: `dev-${name}-${Date.now()}` }),
  updateMany: async () => ({ count: 0 }),
  deleteMany: async () => ({ count: 0 }),
});

function getFallback(): FakePrisma {
  if (!fallback) {
    const instance = new FakePrisma();
    instance.$connect();
    fallback = new Proxy(instance, {
      get(target: any, prop: string) {
        if (prop in target && target[prop] !== undefined) {
          return target[prop];
        }
        if (typeof prop === 'string' && prop.startsWith('$')) {
          return () => Promise.resolve();
        }
        if (typeof prop === 'string' && !prop.startsWith('_')) {
          target[prop] = createSafeModel(prop);
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
  // P1001 = can't reach server, P2024 = connection pool timeout, P1008 = operation timed out
  return code === 'P1001' || code === 'P2024' || code === 'P1008'
    || (err?.message && (
      err.message.includes("Can't reach database server")
      || err.message.includes('Timed out fetching a new connection')
      || err.message.includes('connection pool')
    ));
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
            switchToFallback();
            // Retry on fallback
            const fb = getFallback();
            const fbModel = (fb as any)[modelName];
            if (fbModel && typeof fbModel[methodName] === 'function') {
              return fbModel[methodName](...args);
            }
            // If fallback doesn't have this model/method, return safe defaults
            if (methodName === 'findMany') return [];
            if (methodName === 'count') return 0;
            if (methodName === 'findUnique' || methodName === 'findFirst') return null;
            return null;
          }
          throw err; // Re-throw non-connection errors
        }
      };
    },
  });
}

export const initPrisma = async () => {
  if (initialized && client) return client;

  try {
    const real = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });
    await real.$connect();
    client = real;
    usingFallback = false;
    Logger.info('✅ Connected to Neon Postgres database via Prisma.');
  } catch (e: any) {
    Logger.error(`❌ Neon PostgreSQL connection failed: ${e.message}`, e);
    // Try alternate Neon connection strings if ssl/pooler params fail
    const rawUrl = process.env.DATABASE_URL || '';
    if (rawUrl.includes('.c-7.')) {
      const fixedUrl = rawUrl.replace('.c-7.', '.');
      try {
        Logger.info(`Retrying connection with fixed Neon host: ${fixedUrl}`);
        const realFixed = new PrismaClient({
          datasources: { db: { url: fixedUrl } },
          log: ['error', 'warn'],
        });
        await realFixed.$connect();
        client = realFixed;
        usingFallback = false;
        Logger.info('✅ Connected to Neon Postgres database via fixed URL.');
        initialized = true;
        return client;
      } catch (err2: any) {
        Logger.error(`❌ Fixed Neon URL attempt failed: ${err2.message}`);
      }
    }
    throw e;
  }

  initialized = true;
  return client;
};

// Proxy that forwards to actual client after initialization, with auto-fallback
const proxy = new Proxy({}, {
  get(_, prop: string) {
    if (!client) throw new Error('Prisma client not initialized. Call initPrisma() first.');

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
    if (!client) throw new Error('Prisma client not initialized. Call initPrisma() first.');
    (client as any)[prop] = value;
    return true;
  }
});

export default proxy as PrismaClient;
