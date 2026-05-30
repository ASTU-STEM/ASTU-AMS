import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { Logger } from '../../shared/utils/logger.utils';

// Simple in-memory fallback storage persisted to disk for development
const DEV_DB_FILE = path.join(process.cwd(), 'data', 'dev-db.json');
if (!fs.existsSync(path.dirname(DEV_DB_FILE))) {
  fs.mkdirSync(path.dirname(DEV_DB_FILE), { recursive: true });
}

function readDevDb() {
  try {
    return JSON.parse(fs.readFileSync(DEV_DB_FILE, 'utf-8'));
  } catch (e) {
    return {
      users: [],
      alumniProfiles: [],
      employerProfiles: [],
      departments: [],
      registrarStudents: [],
      registrarSyncLogs: [],
      auditLogs: [],
    };
  }
}

function writeDevDb(data: any) {
  fs.writeFileSync(DEV_DB_FILE, JSON.stringify(data, null, 2));
}

class FakePrisma {
  private store: any;
  constructor() {
    this.store = readDevDb();
  }

  async $connect() {
    Logger.warn('Using fallback in-memory DB (dev)');
    return Promise.resolve();
  }

  async $disconnect() {
    writeDevDb(this.store);
    return Promise.resolve();
  }

  // Minimal user model implementations used by auth flows
  user = {
    findUnique: async ({ where }: any) => {
      if (where.email) {
        return this.store.users.find((u: any) => u.email === where.email) || null;
      }
      if (where.id) {
        return this.store.users.find((u: any) => u.id === where.id) || null;
      }
      return null;
    },
    create: async ({ data }: any) => {
      const newUser = { ...data };
      if (!newUser.id) newUser.id = `dev-${Date.now()}-${Math.floor(Math.random()*1000)}`;
      this.store.users.push(newUser);
      writeDevDb(this.store);
      return newUser;
    },
    update: async ({ where, data }: any) => {
      const idx = this.store.users.findIndex((u: any) => u.id === where.id);
      if (idx === -1) throw new Error('User not found');
      this.store.users[idx] = { ...this.store.users[idx], ...data };
      writeDevDb(this.store);
      return this.store.users[idx];
    },
  };

  alumniProfile = {
    findUnique: async ({ where }: any) => {
      if (where.userId) return this.store.alumniProfiles.find((a: any) => a.userId === where.userId) || null;
      if (where.studentId) return this.store.alumniProfiles.find((a: any) => a.studentId === where.studentId) || null;
      if (where.id) return this.store.alumniProfiles.find((a: any) => a.id === where.id) || null;
      return null;
    },
    findMany: async ({ where = {}, include = {} }: any = {}) => {
      let results = [...this.store.alumniProfiles];
      if (where.status) {
        results = results.filter((a: any) => a.status === where.status);
      }
      // Include related data if requested
      return results.map((a: any) => {
        const enriched: any = { ...a };
        if (include.user) {
          enriched.user = this.store.users.find((u: any) => u.id === a.userId);
        }
        if (include.department) {
          enriched.department = this.store.departments.find((d: any) => d.id === a.departmentId);
        }
        return enriched;
      });
    },
    count: async ({ where }: any = {}) => {
      let all = this.store.alumniProfiles;
      if (where?.status) all = all.filter((a: any) => a.status === where.status);
      return all.length;
    },
    create: async ({ data }: any) => {
      const rec = { ...data, id: `dev-alum-${Date.now()}`, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      this.store.alumniProfiles.push(rec);
      writeDevDb(this.store);
      return rec;
    },
    update: async ({ where, data }: any) => {
      const idx = this.store.alumniProfiles.findIndex((a: any) => a.id === where.id || a.userId === where.userId);
      if (idx === -1) throw new Error('Alumni not found');
      this.store.alumniProfiles[idx] = { ...this.store.alumniProfiles[idx], ...data, updatedAt: new Date().toISOString() };
      writeDevDb(this.store);
      return this.store.alumniProfiles[idx];
    },
  };

  employerProfile = {
    create: async ({ data }: any) => {
      const rec = { ...data, id: `dev-emp-${Date.now()}` };
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
  };

  documentRequest = {
    count: async ({ where }: any = {}) => {
      let docs = this.store.documentRequests || [];
      if (where?.status) docs = docs.filter((d: any) => d.status === where.status);
      return docs.length;
    },
  };

  // allow transactions for code that expects it
  async $transaction(cb: any) {
    if (typeof cb === 'function') return cb(this);
    return Promise.resolve(cb);
  }
}

let client: any = null;
let initialized = false;

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
    client = new FakePrisma();
    await client.$connect();
  }

  initialized = true;
  return client;
};

// Proxy that forwards to actual client after initialization
const proxy = new Proxy({}, {
  get(_, prop: string) {
    if (!client) throw new Error('Prisma client not initialized. Call initPrisma() first.');
    const v = (client as any)[prop];
    return typeof v === 'function' ? v.bind(client) : v;
  },
  set(_, prop: string, value) {
    if (!client) throw new Error('Prisma client not initialized. Call initPrisma() first.');
    (client as any)[prop] = value;
    return true;
  }
});

export default proxy as any;
