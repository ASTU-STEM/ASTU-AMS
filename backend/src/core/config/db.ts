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
      let profile = null;
      if (where.userId) profile = this.store.alumniProfiles.find((a: any) => a.userId === where.userId) || null;
      if (where.studentId) profile = this.store.alumniProfiles.find((a: any) => a.studentId === where.studentId) || null;
      if (where.id) profile = this.store.alumniProfiles.find((a: any) => a.id === where.id) || null;
      return profile;
    },
    findMany: async ({ where, skip, take, include }: any = {}) => {
      let profiles = [...this.store.alumniProfiles];
      if (where?.departmentId) profiles = profiles.filter((a: any) => a.departmentId === where.departmentId);
      if (skip) profiles = profiles.slice(skip);
      if (take) profiles = profiles.slice(0, take);
      return profiles;
    },
    count: async ({ where }: any = {}) => {
      let profiles = this.store.alumniProfiles;
      if (where?.departmentId) profiles = profiles.filter((a: any) => a.departmentId === where.departmentId);
      return profiles.length;
    },
    create: async ({ data }: any) => {
      const rec = { ...data, id: `dev-alumni-${Date.now()}`, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      this.store.alumniProfiles.push(rec);
      writeDevDb(this.store);
      return rec;
    },
    update: async ({ where, data }: any) => {
      const idx = this.store.alumniProfiles.findIndex((a: any) => a.id === where.id || a.userId === where.userId || a.studentId === where.studentId);
      if (idx === -1) throw new Error('Alumni profile not found');
      this.store.alumniProfiles[idx] = { ...this.store.alumniProfiles[idx], ...data, updatedAt: new Date().toISOString() };
      writeDevDb(this.store);
      return this.store.alumniProfiles[idx];
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

  // ─── Models needed by various repositories for fallback ───
  job = {
    findMany: async (_args?: any) => [],
    findUnique: async (_args?: any) => null,
    count: async (_args?: any) => 0,
    create: async ({ data }: any) => ({ ...data, id: `dev-job-${Date.now()}`, createdAt: new Date() }),
    update: async ({ where, data }: any) => ({ id: where.id, ...data }),
    delete: async (_args?: any) => ({}),
  };

  event = {
    findMany: async (_args?: any) => [],
    findUnique: async (_args?: any) => null,
    count: async (_args?: any) => 0,
    create: async ({ data }: any) => ({ ...data, id: `dev-event-${Date.now()}`, createdAt: new Date() }),
    update: async ({ where, data }: any) => ({ id: where.id, ...data }),
    delete: async (_args?: any) => ({}),
  };

  surveyTemplate = {
    findMany: async (_args?: any) => [],
    findUnique: async (_args?: any) => null,
    count: async (_args?: any) => 0,
    create: async ({ data }: any) => ({ ...data, id: `dev-survey-${Date.now()}`, createdAt: new Date() }),
    update: async ({ where, data }: any) => ({ id: where.id, ...data }),
    delete: async (_args?: any) => ({}),
  };

  mentorshipSession = {
    count: async (_args?: any) => 0,
    findMany: async (_args?: any) => [],
  };

  savedJob = {
    count: async (_args?: any) => 0,
    findMany: async (_args?: any) => [],
    findUnique: async (_args?: any) => null,
    create: async ({ data }: any) => ({ ...data, id: `dev-saved-${Date.now()}` }),
    delete: async (_args?: any) => ({}),
  };

  jobApplication = {
    count: async (_args?: any) => 0,
    findMany: async (_args?: any) => [],
    findUnique: async (_args?: any) => null,
    create: async ({ data }: any) => ({ ...data, id: `dev-app-${Date.now()}`, createdAt: new Date() }),
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

  donationCampaign = {
    findMany: async (_args?: any) => [],
    update: async ({ where, data }: any) => ({ id: where.id, ...data }),
  };

  donationRecord = {
    create: async ({ data }: any) => ({ ...data, id: `dev-donation-${Date.now()}`, createdAt: new Date() }),
  };

  directMessage = {
    create: async ({ data }: any) => ({ ...data, id: `dev-msg-${Date.now()}`, createdAt: new Date() }),
    findMany: async (_args?: any) => [],
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
let fallback: FakePrisma | null = null;
let usingFallback = false;

function getFallback(): FakePrisma {
  if (!fallback) {
    fallback = new FakePrisma();
    fallback.$connect();
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
    Logger.info('Connected to Postgres via Prisma');
  } catch (e: any) {
    Logger.warn(`Prisma connection failed. Falling back to in-memory dev DB: ${e.message}`);
    client = getFallback();
    usingFallback = true;
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
