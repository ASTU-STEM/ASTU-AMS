import { PrismaClient } from '@prisma/client';
import { Logger } from '../utils/logger.utils';
import fs from 'fs';
import path from 'path';

// ─── In-memory dev DB helpers ───
const DEV_DB_PATH = path.join(process.cwd(), 'data', 'dev-db.json');
const CMS_CONTENT_PATH = path.join(process.cwd(), 'data', 'cms-content.json');

/**
 * Under test the dev store must never touch the real data/dev-db.json.
 * Jest previously wrote its fixtures straight into that file, so running the
 * suite replaced the developer's real dev data with test records.
 */
const IS_TEST_ENV = process.env.NODE_ENV === 'test' || process.env.JEST_WORKER_ID !== undefined;
let testStore: any | null = null;

function readDevDb(): any {
  if (IS_TEST_ENV) {
    if (!testStore) testStore = emptyDevStore();
    return testStore;
  }
  return readDevDbFromDisk();
}

function emptyDevStore(): any {
  return {
    users: [], adminProfiles: [], alumniProfiles: [], employers: [], jobs: [],
    jobApplications: [], interviews: [], contents: [], contentItems: [],
    notifications: [], auditLogs: [], registrarStudents: [], registrarSyncLogs: [],
    documentRequests: [], departments: [], surveys: [], surveyResponses: [],
    events: [], homepageConfigs: [], feedback: [],
  };
}

function readDevDbFromDisk(): any {
  let store: any = null;
  try {
    if (fs.existsSync(DEV_DB_PATH)) {
      store = JSON.parse(fs.readFileSync(DEV_DB_PATH, 'utf-8'));
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
      revokedTokens: [],
    };
  }

  // Auto-bootstrap CMS items from cms-content.json if empty
  if (!store.contentItems || store.contentItems.length === 0) {
    try {
      if (fs.existsSync(CMS_CONTENT_PATH)) {
        const raw = JSON.parse(fs.readFileSync(CMS_CONTENT_PATH, 'utf-8'));
        if (Array.isArray(raw)) {
          const configItem = raw.find((i: any) => i.title === 'Homepage CMS Configuration');
          if (configItem && configItem.excerpt) {
            try {
              const parsed = typeof configItem.excerpt === 'string' ? JSON.parse(configItem.excerpt) : configItem.excerpt;
              store.homepageConfigs = [{ id: 'hc-main', key: 'main', data: parsed, updatedAt: new Date().toISOString() }];
            } catch { /* ignore */ }
          }
          store.contentItems = raw
            .filter((i: any) => i.title !== 'Homepage CMS Configuration')
            .map((i: any) => ({
              ...i,
              type: i.type?.toUpperCase() || 'POST',
              status: i.status === 'Published' ? 'PUBLISHED' : i.status === 'Draft' ? 'DRAFT' : i.status === 'Needs Review' ? 'NEEDS_REVIEW' : i.status?.toUpperCase() || 'PUBLISHED',
              createdAt: i.createdAt || new Date().toISOString(),
              updatedAt: i.updatedAt || new Date().toISOString(),
            }));
        }
      }
    } catch { /* ignore fallback error */ }
  }

  return store;
}

function writeDevDb(store: any) {
  if (IS_TEST_ENV) {
    testStore = store;
    return;
  }
  const dir = path.dirname(DEV_DB_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(DEV_DB_PATH, JSON.stringify(store, null, 2));
}

// ─── Fake Prisma for dev fallback ───
class FakePrisma {
  /**
   * Always re-reads, so reads see the current file. Mutating methods must NOT
   * use this twice: `this.store` returning a fresh object each access meant
   *     this.store.rows.push(rec);  // read #1 -> array A, push into A
   *     writeDevDb(this.store);     // read #2 -> array B, writes B (change lost)
   * and every write through the dev fallback was silently discarded.
   * Mutating methods now snapshot once into a local `store` instead.
   */
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
      if (where.id) return withDates(this.store.users.find((u: any) => u.id === where.id) || null);
      if (where.email) return withDates(this.store.users.find((u: any) => u.email === where.email) || null);
      return null;
    },
    findMany: async ({ where, skip, take, select }: any = {}) => {
      let users = this.store.users.filter((u: any) => matchWhere(u, where));
      if (select) users = users.map((u: any) => {
        const out: any = {};
        for (const key of Object.keys(select)) out[key] = u[key];
        return out;
      });
      if (skip) users = users.slice(skip);
      if (take) users = users.slice(0, take);
      return users.map((u: any) => withDates(u));
    },
    count: async ({ where }: any = {}) => {
      return this.store.users.filter((u: any) => matchWhere(u, where)).length;
    },
    create: async ({ data }: any) => {
      const store = this.store;
      const rec = { ...data, id: `dev-${Date.now()}`, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), isActive: data.isActive ?? false };
      (store.users || (store.users = [])).push(rec);
      writeDevDb(store);
      return withDates(rec);
    },
    update: async ({ where, data }: any) => {
      const store = this.store;
      const idx = (store.users || []).findIndex((u: any) => u.id === where.id || u.email === where.email);
      if (idx === -1) throw new Error('User not found');
      store.users[idx] = { ...store.users[idx], ...data, updatedAt: new Date().toISOString() };
      writeDevDb(store);
      return withDates(store.users[idx]);
    },
    delete: async ({ where }: any) => {
      const store = this.store;
      const idx = (store.users || []).findIndex((u: any) => u.id === where.id);
      if (idx === -1) throw new Error('User not found');
      const [removed] = store.users.splice(idx, 1);
      writeDevDb(store);
      return removed;
    },
  };

  adminProfile = {
    findUnique: async ({ where }: any) => {
      const store = readDevDb();
      const rows = store.adminProfiles || (store.adminProfiles = []);
      if (where?.userId) return rows.find((a: any) => a.userId === where.userId) || null;
      if (where?.id) return rows.find((a: any) => a.id === where.id) || null;
      return null;
    },
    upsert: async ({ where, create, update }: any) => {
      const store = readDevDb();
      const rows = store.adminProfiles || (store.adminProfiles = []);
      const idx = where?.userId
        ? rows.findIndex((a: any) => a.userId === where.userId)
        : rows.findIndex((a: any) => a.id === where?.id);
      if (idx === -1) {
        const rec = { ...create, id: create.id || `dev-admin-${Date.now()}`, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
        rows.push(rec);
        writeDevDb(store);
        return rec;
      }
      rows[idx] = { ...rows[idx], ...update, updatedAt: new Date().toISOString() };
      writeDevDb(store);
      return rows[idx];
    },
    create: async ({ data }: any) => {
      const store = readDevDb();
      const rows = store.adminProfiles || (store.adminProfiles = []);
      const rec = { ...data, id: data.id || `dev-admin-${Date.now()}`, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      rows.push(rec);
      writeDevDb(store);
      return rec;
    },
    update: async ({ where, data }: any) => {
      const store = readDevDb();
      const rows = store.adminProfiles || (store.adminProfiles = []);
      const idx = where?.userId ? rows.findIndex((a: any) => a.userId === where.userId) : rows.findIndex((a: any) => a.id === where?.id);
      if (idx === -1) throw new Error('AdminProfile not found');
      rows[idx] = { ...rows[idx], ...data, updatedAt: new Date().toISOString() };
      writeDevDb(store);
      return rows[idx];
    },
    findMany: async () => {
      const store = readDevDb();
      return store.adminProfiles || [];
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
      let profile: any = (store.alumniProfiles || []).find((a: any) => matchWhere(a, where)) || null;

      if (profile && include?.user && !profile.user) {
        const u = (store.users || []).find((user: any) => user.id === profile.userId || user.email === profile.email);
        profile = { ...profile, user: u || { email: profile.email || 'alumni@astu.edu.et' } };
      }
      return profile;
    },
    findMany: async ({ where, skip, take, include }: any = {}) => {
      const store = readDevDb();
      let profiles = (store.alumniProfiles || []).filter((a: any) => matchWhere(a, where));
      if (include) {
        profiles = profiles.map((a: any) => {
          let out = a;
          if (include?.user) {
            const u = (store.users || []).find((user: any) => user.id === a.userId || user.email === a.email);
            out = { ...out, user: u || { email: a.email || 'alumni@astu.edu.et' } };
          }
          if (include?.experiences) {
            // Work experiences live in their own store keyed by alumniId, not nested
            // on the profile record, so hydrate them the way Prisma would.
            let exps: any[] = Array.isArray(a.experiences) ? [...a.experiences] : [];
            if (exps.length === 0) {
              exps = (store.workExperiences || []).filter((e: any) => e?.alumniId === a.id);
            }
            // Honour `orderBy: [{ isCurrent: 'desc' }, { startDate: 'desc' }]` style sorts.
            for (const rule of include.experiences.orderBy || []) {
              const [field, dir] = Array.isArray(rule) ? rule : [rule, 'asc'];
              const sign = String(dir).toLowerCase() === 'desc' ? -1 : 1;
              exps = [...exps].sort((x: any, y: any) => {
                const xv = x?.[field] ?? '';
                const yv = y?.[field] ?? '';
                if (xv === yv) return 0;
                return (xv > yv ? 1 : -1) * sign;
              });
            }
            // Only backfill an experience for statuses that actually assert
            // employment. UNSPECIFIED must stay experience-free or the dev
            // fallback would invent an employer for a job seeker.
            if (
              exps.length === 0 &&
              (a.employmentStatus === 'EMPLOYED' || a.employmentStatus === 'SELF_EMPLOYED')
            ) {
              exps.push({
                id: `${a.id}-exp-dev`,
                alumniId: a.id,
                companyName: a.company ?? null,
                position: a.jobTitle ?? null,
                salary: a.salary ?? null,
                location: a.location ?? null,
                isCurrent: true,
                startDate: `${a.graduationYear || 2020}-09-01T00:00:00.000Z`,
                endDate: null,
              });
            }
            out = { ...out, experiences: exps };
          }
          return out;
        });
      }
      if (skip) profiles = profiles.slice(skip);
      if (take) profiles = profiles.slice(0, take);
      return profiles;
    },
    count: async ({ where }: any = {}) => {
      const store = readDevDb();
      return (store.alumniProfiles || []).filter((a: any) => matchWhere(a, where)).length;
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
    delete: async ({ where }: any = {}) => {
      const store = readDevDb();
      const idx = (store.alumniProfiles || []).findIndex((a: any) => {
        if (where?.id) return a.id === where.id || a.userId === where.id;
        if (where?.userId) return a.userId === where.userId;
        if (where?.studentId) return a.studentId === where.studentId;
        return false;
      });
      if (idx === -1) throw new Error('Alumni profile not found');
      const [removed] = (store.alumniProfiles || []).splice(idx, 1);
      writeDevDb(store);
      return removed;
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

  revokedToken = {
    findUnique: async ({ where }: any = {}) => {
      const store = readDevDb();
      return (store.revokedTokens || []).find((t: any) => t.jti === where?.jti) || null;
    },
    create: async ({ data }: any = {}) => {
      const store = readDevDb();
      if (!store.revokedTokens) store.revokedTokens = [];
      const rec = {
        id: data.id || `dev-revoked-${Date.now()}-${store.revokedTokens.length}`,
        jti: data.jti,
        userId: data.userId ?? null,
        expiresAt: data.expiresAt,
        revokedAt: data.revokedAt || new Date().toISOString(),
      };
      store.revokedTokens.push(rec);
      writeDevDb(store);
      return rec;
    },
    upsert: async ({ where, create, update }: any = {}) => {
      const store = readDevDb();
      const existing = (store.revokedTokens || []).find((t: any) => t.jti === where?.jti);
      if (existing) {
        Object.assign(existing, update || {});
        writeDevDb(store);
        return existing;
      }
      return this.revokedToken.create({ data: create });
    },
    deleteMany: async ({ where }: any = {}) => {
      const store = readDevDb();
      const before = (store.revokedTokens || []).length;
      store.revokedTokens = (store.revokedTokens || []).filter((t: any) => {
        if (where?.jti && t.jti === where.jti) return false;
        if (where?.expiresAt?.lt && new Date(t.expiresAt) >= new Date(where.expiresAt.lt)) return true;
        return true;
      });
      writeDevDb(store);
      return { count: before - store.revokedTokens.length };
    },
  };

  employerProfile = {
    findUnique: async ({ where, include }: any) => {
      const store = readDevDb();
      let e: any = null;
      if (where?.userId) e = (store.employerProfiles || []).find((p: any) => p.userId === where.userId) || null;
      else if (where?.id) e = (store.employerProfiles || []).find((p: any) => p.id === where.id) || null;
      if (e && include?.user && !e.user) {
        const u = (store.users || []).find((user: any) => user.id === e.userId);
        e = { ...e, user: u || { email: e.contactEmail || 'employer@astu.edu.et' } };
      }
      return e;
    },
    findMany: async ({ where, include, skip, take }: any = {}) => {
      const store = readDevDb();
      let list = (store.employerProfiles || []).filter((e: any) => matchWhere(e, where));
      if (include?.user) {
        list = list.map((e: any) => {
          const u = (store.users || []).find((user: any) => user.id === e.userId);
          return { ...e, user: u || { email: e.contactEmail || 'employer@astu.edu.et' } };
        });
      }
      if (skip) list = list.slice(skip);
      if (take) list = list.slice(0, take);
      return list;
    },
    count: async ({ where }: any = {}) => {
      const store = readDevDb();
      return (store.employerProfiles || []).filter((e: any) => matchWhere(e, where)).length;
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
      const store = readDevDb();
      const depts: any[] = store.departments || [];
      if (where?.code) return depts.find((d: any) => d.code === where.code) || null;
      if (where?.id) return depts.find((d: any) => d.id === where.id) || null;
      return null;
    },
    // Without these the proxy falls through to createSafeModel, whose store is a
    // throwaway empty array, so listing departments returned [] and looking one up
    // by name always missed.
    findFirst: async ({ where }: any = {}) => {
      const store = readDevDb();
      const depts: any[] = store.departments || [];
      if (!where || Object.keys(where).length === 0) return depts[0] || null;
      return depts.find((d: any) => matchWhere(d, where)) || null;
    },
    findMany: async ({ where, orderBy, include }: any = {}) => {
      const store = readDevDb();
      let depts: any[] = [...(store.departments || [])];
      if (where && Object.keys(where).length > 0) {
        depts = depts.filter((d: any) => matchWhere(d, where));
      }      if (orderBy?.name) {
        const dir = orderBy.name === 'desc' ? -1 : 1;
        depts.sort((a: any, b: any) => String(a?.name ?? '').localeCompare(String(b?.name ?? '')) * dir);
      }
      if (!include) return depts;

      const alumni: any[] = store.alumniProfiles || [];
      const headProfiles: any[] = store.departmentHeadProfiles || [];
      const users: any[] = store.users || [];

      return depts.map((dept) => {
        const row: any = { ...dept };
        if (include._count?.select?.alumniProfiles) {
          row._count = {
            ...(row._count || {}),
            alumniProfiles: alumni.filter((a) => a?.departmentId === dept.id).length,
          };
        }
        if (include.departmentHeadProfiles) {
          row.departmentHeadProfiles = headProfiles
            .filter((p) => p?.departmentId === dept.id)
            .map((p) => ({
              ...p,
              user: include.departmentHeadProfiles?.include?.user
                ? users.find((u) => u?.id === p.userId) || null
                : undefined,
            }));
        }
        if (include.alumniProfiles) {
          const nested = include.alumniProfiles;
          let matched = alumni.filter((a) => a?.departmentId === dept.id);
          if (nested.where && Object.keys(nested.where).length > 0) {
            matched = matched.filter((a) => matchWhere(a, nested.where));
          }
          row.alumniProfiles = matched.map((a) => {
            const hydrated: any = { ...a };
            if (nested.include?.experiences) {
              hydrated.experiences = (store.workExperiences || []).filter(
                (e: any) => e?.alumniId === a.id || e?.alumni?.id === a.id
              );
            }
            if (nested.include?.employerFeedback) {
              hydrated.employerFeedback = (store.employerFeedbacks || []).filter(
                (f: any) => f?.alumniId === a.id || f?.alumni?.id === a.id
              );
            }
            return hydrated;
          });
        }
        return row;
      });
    },
    // Without this the proxy synthesises a `count` backed by a throwaway array,
    // so every department count silently reported 0.
    count: async ({ where }: any = {}) => {
      const store = readDevDb();
      const depts: any[] = store.departments || [];
      if (where && Object.keys(where).length > 0) {
        return depts.filter((d: any) => matchWhere(d, where)).length;
      }
      return depts.length;
    },
    create: async ({ data }: any) => {
      const rec = { ...data, id: `dev-dept-${Date.now()}` };
      const store = readDevDb();
      if (!store.departments) store.departments = [];
      store.departments.push(rec);
      writeDevDb(store);
      return rec;
    },
  };

  departmentHeadProfile = {
    findUnique: async ({ where }: any) => {
      const profiles: any[] = readDevDb().departmentHeadProfiles || [];
      if (where?.userId) return profiles.find((p: any) => p.userId === where.userId) || null;
      if (where?.id) return profiles.find((p: any) => p.id === where.id) || null;
      if (where?.departmentId) return profiles.find((p: any) => p.departmentId === where.departmentId) || null;
      return null;
    },
    findFirst: async ({ where }: any = {}) => {
      const profiles: any[] = readDevDb().departmentHeadProfiles || [];
      if (where && Object.keys(where).length > 0) {
        return profiles.find((p: any) => matchWhere(p, where)) || null;
      }
      return profiles[0] || null;
    },
    findMany: async ({ where }: any = {}) => {
      const profiles: any[] = readDevDb().departmentHeadProfiles || [];
      if (where && Object.keys(where).length > 0) {
        return profiles.filter((p: any) => matchWhere(p, where));
      }
      return profiles;
    },
    create: async ({ data }: any) => {
      const store = readDevDb();
      if (!store.departmentHeadProfiles) store.departmentHeadProfiles = [];
      const rec = { ...data, id: data?.id || `dev-depthead-${Date.now()}`, createdAt: new Date().toISOString() };
      store.departmentHeadProfiles.push(rec);
      writeDevDb(store);
      return rec;
    },
    upsert: async ({ where, create, update }: any) => {
      const store = readDevDb();
      if (!store.departmentHeadProfiles) store.departmentHeadProfiles = [];
      const existing = where?.userId
        ? store.departmentHeadProfiles.find((p: any) => p.userId === where.userId)
        : null;
      if (existing) {
        Object.assign(existing, update);
        writeDevDb(store);
        return existing;
      }
      const rec = { ...create, id: create?.id || `dev-depthead-${Date.now()}`, createdAt: new Date().toISOString() };
      store.departmentHeadProfiles.push(rec);
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
      const store = this.store;
      const rec = { ...data, id: `dev-registrar-${Date.now()}`, importedAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      (store.registrarStudents || (store.registrarStudents = [])).push(rec);
      writeDevDb(store);
      return rec;
    },
    update: async ({ where, data }: any) => {
      const store = this.store;
      const idx = (store.registrarStudents || []).findIndex((r: any) => r.studentId === where.studentId || r.id === where.id);
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
      const store = this.store;
      const rec = { ...data, id: `dev-sync-${Date.now()}`, syncedAt: new Date().toISOString() };
      (store.registrarSyncLogs || (store.registrarSyncLogs = [])).push(rec);
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
      const store = this.store;
      const rec = { ...data, id: `dev-log-${Date.now()}`, createdAt: new Date().toISOString() };
      (store.auditLogs || (store.auditLogs = [])).push(rec);
      writeDevDb(store);
      return withDates(rec);
    },
    findMany: async ({ where }: any = {}) => {
      let logs = [...(this.store.auditLogs || [])];
      if (where?.userId) logs = logs.filter((l: any) => l.userId === where.userId);
      return logs
        .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 50)
        .map((l: any) => withDates(l));
    },
  };

  notification = {
    create: async ({ data }: any) => {
      const store = readDevDb();
      const rec = { ...data, id: data.id || `dev-notif-${Date.now()}`, createdAt: new Date().toISOString(), isRead: false };
      if (!store.notifications) store.notifications = [];
      store.notifications.push(rec);
      writeDevDb(store);
      return rec;
    },
    findUnique: async ({ where }: any = {}) => {
      const store = readDevDb();
      const items = store.notifications || [];
      if (where?.id) return items.find((n: any) => n.id === where.id) || null;
      return null;
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
      const store = readDevDb();
      const items = store.notifications || [];
      const idx = items.findIndex((n: any) => n.id === where.id);
      if (idx >= 0) { items[idx] = { ...items[idx], ...data }; writeDevDb(store); return items[idx]; }
      return { id: where.id, ...data };
    },
    updateMany: async ({ where, data }: any) => {
      const store = readDevDb();
      let items = store.notifications || [];
      if (where?.userId) items = items.filter((n: any) => n.userId === where.userId);
      if (where?.isRead !== undefined) items = items.filter((n: any) => n.isRead === where.isRead);
      if (items.length > 0 && store.notifications) {
        const ids = new Set(items.map((n: any) => n.id));
        store.notifications = store.notifications.map((n: any) => ids.has(n.id) ? { ...n, ...data } : n);
        writeDevDb(store);
      }
      return { count: items.length };
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
      const store = this.store;
      const rec = { ...data, id: `dev-doc-${Date.now()}`, createdAt: new Date().toISOString(), status: 'PENDING' };
      (store.documentRequests || (store.documentRequests = [])).push(rec);
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
        id: j.employerId || 'dev-employer-unknown',
        // Not a real company: see the note on the findMany fallback above.
        companyName: 'Employer details unavailable',
        industry: null,
        location: null,
        logoUrl: null,
        website: null
      };
        return withDates({
          ...j,
          isActive: j.isActive ?? true,
          status: j.status || 'PUBLISHED',
          deadline: j.deadline || '2030-12-31T23:59:59.000Z',
          employer: emp,
          _count: {
            applications: (store.jobApplications || []).filter((a: any) => a.jobId === j.id).length
          }
        });
      });
    },
    findUnique: async ({ where }: any = {}) => {
      const store = readDevDb();
      const j = (store.jobs || []).find((item: any) => item.id === where?.id);
      if (!j) return null;
      const emp = (store.employerProfiles || []).find((e: any) => e.id === j.employerId) || {
        id: j.employerId || 'dev-employer-insa',
        // Not a real company. This placeholder previously invented "INSA
        // Corporation" so a job row missing its employer still rendered a
        // plausible-looking listing; it attributed vacancies to a real
        // third party that had nothing to do with the record.
        companyName: 'Employer details unavailable',
        industry: null,
        location: null,
        logoUrl: null,
        website: null
      };
      return withDates({
        ...j,
        isActive: j.isActive ?? true,
        status: j.status || 'PUBLISHED',
        deadline: j.deadline || '2030-12-31T23:59:59.000Z',
        employer: emp,
        _count: {
          applications: (store.jobApplications || []).filter((a: any) => a.jobId === j.id).length,
          views: j.views || 0
        }
      });
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

  survey = {
    findUnique: async ({ where, include }: any = {}) => {
      const store = readDevDb();
      const s = (store.surveys || []).find((x: any) => x.id === where?.id) || null;
      return s ? surveyDates(surveyWithRelations(s, include, store)) : null;
    },
    findFirst: async ({ where, include, orderBy }: any = {}) => {
      const store = readDevDb();
      const item = applyOrder((store.surveys || []).filter((x: any) => matchWhere(x, where)), orderBy)[0] || null;
      return item ? surveyDates(surveyWithRelations(item, include, store)) : null;
    },
    findMany: async ({ where, include, orderBy, skip, take }: any = {}) => {
      const store = readDevDb();
      let items = applyOrder((store.surveys || []).filter((x: any) => matchWhere(x, where)), orderBy);
      if (skip) items = items.slice(skip);
      if (take) items = items.slice(0, take);
      return items.map((s: any) => surveyDates(surveyWithRelations(s, include, store)));
    },
    count: async ({ where }: any = {}) => {
      const store = readDevDb();
      return (store.surveys || []).filter((x: any) => matchWhere(x, where)).length;
    },
    create: async ({ data }: any = {}) => {
      const store = readDevDb();
      const id = data.id || `dev-survey-${Date.now()}`;
      const now = new Date().toISOString();
      const rec = {
        id,
        title: data.title,
        description: data.description ?? '',
        type: data.type ?? 'CUSTOM',
        milestoneMonths: data.milestoneMonths ?? null,
        scheduledAt: data.scheduledAt ?? null,
        isActive: data.isActive ?? true,
        isArchived: data.isArchived ?? false,
        departmentId: data.departmentId ?? null,
        createdByUserId: data.createdByUserId ?? null,
        createdAt: now,
        updatedAt: now,
      };
      if (!store.surveys) store.surveys = [];
      store.surveys.push(rec);
      if (data.questions?.create && Array.isArray(data.questions.create)) {
        if (!store.surveyQuestions) store.surveyQuestions = [];
        for (const q of data.questions.create) store.surveyQuestions.push(buildSurveyQuestion(id, null, q));
      }
      if (data.sections?.create && Array.isArray(data.sections.create)) {
        if (!store.surveySections) store.surveySections = [];
        data.sections.create.forEach((sec: any, i: number) => {
          const srec = {
            id: sec.id || `dev-ss-${Date.now()}-${i}`,
            surveyId: id,
            title: sec.title,
            description: sec.description ?? null,
            order: sec.order ?? i,
            createdAt: now,
            updatedAt: now,
          };
          store.surveySections.push(srec);
          if (sec.questions?.create && Array.isArray(sec.questions.create)) {
            if (!store.surveyQuestions) store.surveyQuestions = [];
            for (const q of sec.questions.create) store.surveyQuestions.push(buildSurveyQuestion(id, srec.id, q));
          }
        });
      }
      writeDevDb(store);
      return surveyDates(surveyWithRelations(rec, data.include ?? {}, store));
    },
    update: async ({ where, data, include }: any = {}) => {
      const store = readDevDb();
      const idx = (store.surveys || []).findIndex((x: any) => x.id === where?.id);
      if (idx === -1) throw new Error('Survey not found');
      const rec = { ...store.surveys[idx], ...data, updatedAt: new Date().toISOString() };
      store.surveys[idx] = rec;
      writeDevDb(store);
      return surveyDates(surveyWithRelations(rec, include ?? {}, store));
    },
    delete: async ({ where }: any = {}) => {
      const store = readDevDb();
      const idx = (store.surveys || []).findIndex((x: any) => x.id === where?.id);
      if (idx === -1) return {};
      const [removed] = store.surveys.splice(idx, 1);
      store.surveyQuestions = (store.surveyQuestions || []).filter((q: any) => q.surveyId !== where.id);
      store.surveySections = (store.surveySections || []).filter((s: any) => s.surveyId !== where.id);
      const respIds = new Set((store.surveyResponses || []).filter((r: any) => r.surveyId === where.id).map((r: any) => r.id));
      store.surveyAnswers = (store.surveyAnswers || []).filter((a: any) => !respIds.has(a.responseId));
      store.surveyResponses = (store.surveyResponses || []).filter((r: any) => r.surveyId !== where.id);
      store.surveyAssignments = (store.surveyAssignments || []).filter((a: any) => a.surveyId !== where.id);
      writeDevDb(store);
      return removed;
    },
    deleteMany: async ({ where }: any = {}) => {
      const store = readDevDb();
      const ids = new Set((store.surveys || []).filter((x: any) => matchWhere(x, where)).map((x: any) => x.id));
      store.surveys = (store.surveys || []).filter((x: any) => !ids.has(x.id));
      store.surveyQuestions = (store.surveyQuestions || []).filter((q: any) => !ids.has(q.surveyId));
      store.surveySections = (store.surveySections || []).filter((s: any) => !ids.has(s.surveyId));
      store.surveyResponses = (store.surveyResponses || []).filter((r: any) => !ids.has(r.surveyId));
      store.surveyAssignments = (store.surveyAssignments || []).filter((a: any) => !ids.has(a.surveyId));
      writeDevDb(store);
      return { count: ids.size };
    },
  };

  surveySection = {
    findUnique: async ({ where }: any = {}) => {
      const store = readDevDb();
      return (store.surveySections || []).find((s: any) => s.id === where?.id) || null;
    },
    findMany: async ({ where, orderBy }: any = {}) => {
      const store = readDevDb();
      return applyOrder((store.surveySections || []).filter((s: any) => matchWhere(s, where)), orderBy);
    },
    create: async ({ data }: any = {}) => {
      const store = readDevDb();
      const rec = {
        id: data.id || `dev-ss-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        surveyId: data.surveyId,
        title: data.title,
        description: data.description ?? null,
        order: data.order ?? 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      if (!store.surveySections) store.surveySections = [];
      store.surveySections.push(rec);
      if (data.questions?.create && Array.isArray(data.questions.create)) {
        if (!store.surveyQuestions) store.surveyQuestions = [];
        for (const q of data.questions.create) store.surveyQuestions.push(buildSurveyQuestion(data.surveyId, rec.id, q));
      }
      writeDevDb(store);
      return rec;
    },
    deleteMany: async ({ where }: any = {}) => {
      const store = readDevDb();
      const before = (store.surveySections || []).length;
      store.surveySections = (store.surveySections || []).filter((s: any) => !matchWhere(s, where));
      store.surveyQuestions = (store.surveyQuestions || []).filter((q: any) => !(store.surveySections || []).some((s: any) => s.id === q.sectionId) && q.sectionId);
      writeDevDb(store);
      return { count: before - (store.surveySections || []).length };
    },
  };

  surveyQuestion = {
    findUnique: async ({ where }: any = {}) => {
      const store = readDevDb();
      return (store.surveyQuestions || []).find((q: any) => q.id === where?.id) || null;
    },
    findMany: async ({ where, orderBy }: any = {}) => {
      const store = readDevDb();
      return applyOrder((store.surveyQuestions || []).filter((q: any) => matchWhere(q, where)), orderBy);
    },
    create: async ({ data }: any = {}) => {
      const store = readDevDb();
      const rec = buildSurveyQuestion(data.surveyId, data.sectionId ?? null, data);
      if (!store.surveyQuestions) store.surveyQuestions = [];
      store.surveyQuestions.push(rec);
      writeDevDb(store);
      return rec;
    },
    createMany: async ({ data }: any = {}) => {
      const store = readDevDb();
      const items = Array.isArray(data) ? data : data?.create || data || [];
      if (!store.surveyQuestions) store.surveyQuestions = [];
      for (const q of items) store.surveyQuestions.push(buildSurveyQuestion(q.surveyId, q.sectionId ?? null, q));
      writeDevDb(store);
      return { count: items.length };
    },
    deleteMany: async ({ where }: any = {}) => {
      const store = readDevDb();
      const before = (store.surveyQuestions || []).length;
      store.surveyQuestions = (store.surveyQuestions || []).filter((q: any) => !matchWhere(q, where));
      writeDevDb(store);
      return { count: before - (store.surveyQuestions || []).length };
    },
  };

  surveyAnswer = {
    findMany: async ({ where }: any = {}) => {
      const store = readDevDb();
      return (store.surveyAnswers || []).filter((a: any) => matchWhere(a, where));
    },
    createMany: async ({ data }: any = {}) => {
      const store = readDevDb();
      const items = Array.isArray(data) ? data : data?.create || [];
      if (!store.surveyAnswers) store.surveyAnswers = [];
      for (const a of items) {
        store.surveyAnswers.push({
          id: a.id || `dev-sa-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          responseId: a.responseId,
          questionId: a.questionId,
          answerText: a.answerText,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
      writeDevDb(store);
      return { count: items.length };
    },
    deleteMany: async ({ where }: any = {}) => {
      const store = readDevDb();
      const before = (store.surveyAnswers || []).length;
      store.surveyAnswers = (store.surveyAnswers || []).filter((a: any) => !matchWhere(a, where));
      writeDevDb(store);
      return { count: before - (store.surveyAnswers || []).length };
    },
  };

  surveyResponse = {
    findUnique: async ({ where, include }: any = {}) => {
      const store = readDevDb();
      const r = (store.surveyResponses || []).find((x: any) => x.id === where?.id) || null;
      return r ? responseWithRelations(r, include, store) : null;
    },
    findFirst: async ({ where, include, orderBy }: any = {}) => {
      const store = readDevDb();
      const r = applyOrder((store.surveyResponses || []).filter((x: any) => matchWhere(x, where)), orderBy)[0] || null;
      return r ? responseWithRelations(r, include, store) : null;
    },
    findMany: async ({ where, include, orderBy }: any = {}) => {
      const store = readDevDb();
      return applyOrder((store.surveyResponses || []).filter((x: any) => matchWhere(x, where)), orderBy)
        .map((r: any) => responseWithRelations(r, include, store));
    },
    count: async ({ where }: any = {}) => {
      const store = readDevDb();
      return (store.surveyResponses || []).filter((x: any) => matchWhere(x, where)).length;
    },
    create: async ({ data, include }: any = {}) => {
      const store = readDevDb();
      const id = data.id || `dev-sr-${Date.now()}`;
      const rec = {
        id,
        surveyId: data.surveyId,
        alumniId: data.alumniId,
        assignmentId: data.assignmentId ?? null,
        isDraft: data.isDraft ?? false,
        submittedAt: data.submittedAt ?? null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      if (!store.surveyResponses) store.surveyResponses = [];
      store.surveyResponses.push(rec);
      if (data.answers?.create && Array.isArray(data.answers.create)) {
        if (!store.surveyAnswers) store.surveyAnswers = [];
        for (const a of data.answers.create) {
          store.surveyAnswers.push({
            id: `dev-sa-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            responseId: id,
            questionId: a.questionId,
            answerText: a.answerText,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        }
      }
      writeDevDb(store);
      return responseWithRelations(rec, include ?? { answers: true, survey: true }, store);
    },
    update: async ({ where, data, include }: any = {}) => {
      const store = readDevDb();
      const idx = (store.surveyResponses || []).findIndex((x: any) => x.id === where?.id);
      if (idx === -1) throw new Error('Survey response not found');
      const rec = { ...store.surveyResponses[idx], ...data, updatedAt: new Date().toISOString() };
      store.surveyResponses[idx] = rec;
      if (data.answers?.create && Array.isArray(data.answers.create)) {
        store.surveyAnswers = (store.surveyAnswers || []).filter((a: any) => a.responseId !== where.id);
        if (!store.surveyAnswers) store.surveyAnswers = [];
        for (const a of data.answers.create) {
          store.surveyAnswers.push({
            id: `dev-sa-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            responseId: where.id,
            questionId: a.questionId,
            answerText: a.answerText,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        }
      }
      writeDevDb(store);
      return responseWithRelations(rec, include ?? { answers: true, survey: true }, store);
    },
    deleteMany: async ({ where }: any = {}) => {
      const store = readDevDb();
      const before = (store.surveyResponses || []).length;
      store.surveyResponses = (store.surveyResponses || []).filter((x: any) => !matchWhere(x, where));
      writeDevDb(store);
      return { count: before - (store.surveyResponses || []).length };
    },
  };

  surveyAssignment = {
    findUnique: async ({ where, include }: any = {}) => {
      const store = readDevDb();
      const a = (store.surveyAssignments || []).find((x: any) => x.id === where?.id) || null;
      return a ? assignmentWithRelations(a, include, store) : null;
    },
    findFirst: async ({ where, include, orderBy }: any = {}) => {
      const store = readDevDb();
      const a = applyOrder((store.surveyAssignments || []).filter((x: any) => matchWhere(x, where)), orderBy)[0] || null;
      return a ? assignmentWithRelations(a, include, store) : null;
    },
    findMany: async ({ where, include, orderBy }: any = {}) => {
      const store = readDevDb();
      return applyOrder((store.surveyAssignments || []).filter((x: any) => matchWhere(x, where)), orderBy)
        .map((a: any) => assignmentWithRelations(a, include, store));
    },
    count: async ({ where }: any = {}) => {
      const store = readDevDb();
      return (store.surveyAssignments || []).filter((x: any) => matchWhere(x, where)).length;
    },
    create: async ({ data, include }: any = {}) => {
      const store = readDevDb();
      const rec = {
        id: data.id || `dev-sass-${Date.now()}`,
        surveyId: data.surveyId,
        alumniId: data.alumniId,
        status: data.status ?? 'PENDING',
        assignedAt: data.assignedAt ?? new Date().toISOString(),
        dueDate: data.dueDate ?? new Date().toISOString(),
        completedAt: data.completedAt ?? null,
        sevenDayReminderSent: data.sevenDayReminderSent ?? false,
        threeDayReminderSent: data.threeDayReminderSent ?? false,
        overdueReminderSent: data.overdueReminderSent ?? false,
        responseId: data.responseId ?? null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      if (!store.surveyAssignments) store.surveyAssignments = [];
      store.surveyAssignments.push(rec);
      writeDevDb(store);
      const defInclude = { survey: { include: { questions: true, sections: { include: { questions: true } } } }, alumni: true };
      return assignmentWithRelations(rec, include ?? defInclude, store);
    },
    update: async ({ where, data, include }: any = {}) => {
      const store = readDevDb();
      const idx = (store.surveyAssignments || []).findIndex((x: any) => x.id === where?.id);
      if (idx === -1) throw new Error('Survey assignment not found');
      const rec = { ...store.surveyAssignments[idx], ...data, updatedAt: new Date().toISOString() };
      store.surveyAssignments[idx] = rec;
      writeDevDb(store);
      const defInclude = { survey: { include: { questions: true, sections: { include: { questions: true } } } }, alumni: true };
      return assignmentWithRelations(rec, include ?? defInclude, store);
    },
    deleteMany: async ({ where }: any = {}) => {
      const store = readDevDb();
      const before = (store.surveyAssignments || []).length;
      store.surveyAssignments = (store.surveyAssignments || []).filter((x: any) => !matchWhere(x, where));
      writeDevDb(store);
      return { count: before - (store.surveyAssignments || []).length };
    },
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
        store.homepageConfigs[idx] = { ...store.homepageConfigs[idx], ...update, updatedAt: new Date().toISOString() };
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
        store.homepageConfigs[idx] = { ...store.homepageConfigs[idx], ...data, updatedAt: new Date().toISOString() };
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

// ─── Survey / relation helpers for FakePrisma ───
const toDate = (v: any): any => (v == null || v instanceof Date ? v : new Date(v));

/**
 * Normalise the timestamp fields of a record read out of the JSON dev store.
 *
 * Real Prisma hands back `Date` objects, so controllers are written to call
 * `.toISOString()` on `createdAt`, `updatedAt`, `deadline` and friends. The
 * fallback store returns whatever JSON.parse produced, which is a *string*, so
 * those calls threw `... is not a function` and took whole admin endpoints
 * down with HTTP 500. Coercing on read keeps the fake store shape-compatible
 * with the real client.
 */
const DATE_FIELDS = [
  'createdAt', 'updatedAt', 'deletedAt', 'deadline', 'publishedAt',
  'submittedAt', 'scheduledAt', 'completedAt', 'assignedAt', 'dueDate',
  'verifiedAt', 'approvedAt', 'lastLoginAt', 'expiresAt', 'respondedAt',
];

function withDates<T extends Record<string, any>>(record: T): T {
  if (!record || typeof record !== 'object') return record;
  const row = record as Record<string, any>;
  for (const field of DATE_FIELDS) {
    if (row[field] !== undefined && row[field] !== null && !(row[field] instanceof Date)) {
      const parsed = new Date(row[field]);
      if (!Number.isNaN(parsed.getTime())) row[field] = parsed;
    }
  }
  return row as T;
}

function matchWhere(record: any, where: any): boolean {
  if (!where || typeof where !== 'object') return true;
  for (const [key, cond] of Object.entries(where) as any) {
    if (key === 'OR' || key === 'AND') {
      const pass = key === 'OR'
        ? (cond || []).some((c: any) => matchWhere(record, c))
        : (cond || []).every((c: any) => matchWhere(record, c));
      if (!pass) return false;
      continue;
    }
    if (key === 'NOT') {
      if (matchWhere(record, cond)) return false;
      continue;
    }
    const val = record[key];
    if (cond && typeof cond === 'object' && !Array.isArray(cond) && !(cond instanceof Date)) {
      for (const [op, opVal] of Object.entries(cond) as any) {
        if (op === 'in') { if (!(opVal || []).includes(val)) return false; }
        else if (op === 'notIn') { if ((opVal || []).includes(val)) return false; }
        else if (op === 'not') { if (val === opVal) return false; }
        else if (op === 'contains') { if (!String(val ?? '').toLowerCase().includes(String(opVal).toLowerCase())) return false; }
        else if (op === 'notContains') { if (String(val ?? '').toLowerCase().includes(String(opVal).toLowerCase())) return false; }
        else if (op === 'lte') { if (Number(val) > Number(opVal)) return false; }
        else if (op === 'gte') { if (Number(val) < Number(opVal)) return false; }
        else if (op === 'lt') { if (Number(val) >= Number(opVal)) return false; }
        else if (op === 'gt') { if (Number(val) <= Number(opVal)) return false; }
        else if (op === 'has') { const arr = val || []; if (!arr.includes(opVal)) return false; }
        else if (op === 'hasSome') { const arr = val || []; if (!(opVal || []).some((o: any) => arr.includes(o))) return false; }
      }
    } else if ((val === undefined ? null : val) !== (cond === undefined ? null : cond)) {
      // A missing key and an explicit null both mean SQL NULL, so they must compare equal.
      // Without this, filters like { departmentId: null } silently drop records whose
      // field was never written.
      return false;
    }
  }
  return true;
}

function applyOrder(items: any[], orderBy: any): any[] {
  if (!orderBy) return items;
  const rules = Array.isArray(orderBy) ? orderBy : [orderBy];
  return [...items].sort((a, b) => {
    for (const rule of rules) {
      for (const [key, dir] of Object.entries(rule) as any) {
        const av = a[key];
        const bv = b[key];
        if (av === bv) continue;
        if (av == null) return 1;
        if (bv == null) return -1;
        const cmp = av > bv ? 1 : -1;
        return typeof dir === 'string' && dir.toLowerCase() === 'desc' ? -cmp : cmp;
      }
    }
    return 0;
  });
}

const buildSurveyQuestion = (surveyId: string, sectionId: string | null, q: any) => ({
  id: q.id || `dev-sq-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  surveyId,
  sectionId: sectionId ?? null,
  questionText: q.questionText,
  questionType: q.questionType ?? 'TEXT',
  required: q.required ?? false,
  placeholder: q.placeholder ?? null,
  helpText: q.helpText ?? null,
  validationRules: q.validationRules ?? null,
  options: q.options || [],
  order: q.order ?? 0,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

function surveyWithRelations(survey: any, include: any, store: any) {
  const out: any = { ...survey };
  const inc: any = include?.include ?? include;
  if (inc?.sections) {
    out.sections = (store.surveySections || [])
      .filter((s: any) => s.surveyId === survey.id)
      .sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0));
    if (inc.sections?.include?.questions) {
      out.sections = out.sections.map((s: any) => ({
        ...s,
        questions: (store.surveyQuestions || [])
          .filter((q: any) => q.sectionId === s.id)
          .sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0)),
      }));
    }
  }
  if (inc?.questions) {
    out.questions = (store.surveyQuestions || [])
      .filter((q: any) => q.surveyId === survey.id && !q.sectionId)
      .sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0));
  }
  if (inc?._count?.select) {
    out._count = {
      assignments: (store.surveyAssignments || []).filter((a: any) => a.surveyId === survey.id).length,
      responses: (store.surveyResponses || []).filter((r: any) => r.surveyId === survey.id).length,
    };
  }
  return out;
}

function surveyDates(s: any) {
  return {
    ...s,
    createdAt: toDate(s.createdAt),
    updatedAt: toDate(s.updatedAt),
    scheduledAt: toDate(s.scheduledAt),
  };
}

function assignmentWithRelations(ass: any, include: any, store: any) {
  const out: any = { ...ass };
  if (include?.survey) {
    const survey = (store.surveys || []).find((s: any) => s.id === ass.surveyId);
    out.survey = survey ? surveyDates(surveyWithRelations(survey, include.survey, store)) : null;
  }
  if (include?.alumni) {
    out.alumni = (store.alumniProfiles || []).find((a: any) => a.id === ass.alumniId) || null;
  }
  return out;
}

function responseWithRelations(resp: any, include: any, store: any) {
  const out: any = {
    ...resp,
    createdAt: toDate(resp.createdAt),
    updatedAt: toDate(resp.updatedAt),
    submittedAt: toDate(resp.submittedAt),
  };
  if (include?.answers) {
    out.answers = (store.surveyAnswers || [])
      .filter((a: any) => a.responseId === resp.id)
      .map((a: any) => {
        const rec: any = { ...a, createdAt: toDate(a.createdAt), updatedAt: toDate(a.updatedAt) };
        if (include.answers?.include?.question) {
          rec.question = (store.surveyQuestions || []).find((q: any) => q.id === a.questionId) || null;
        }
        return rec;
      });
  }
  if (include?.survey) {
    const survey = (store.surveys || []).find((s: any) => s.id === resp.surveyId);
    out.survey = survey ? surveyDates({ ...survey }) : null;
  }
  if (include?.alumni) {
    const prof = (store.alumniProfiles || []).find((a: any) => a.id === resp.alumniId);
    if (prof) {
      const al: any = { ...prof };
      if (include.alumni?.include?.department) al.department = (store.departments || []).find((d: any) => d.id === prof.departmentId) || null;
      if (include.alumni?.include?.user) {
        const usr = (store.users || []).find((u: any) => u.id === prof.userId || u.email === prof.email);
        al.user = usr || { email: prof.email || 'alumni@astu.edu.et' };
      }
      out.alumni = al;
    } else {
      out.alumni = null;
    }
  }
  return out;
}

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

const isTestRun = (): boolean =>
  process.env.NODE_ENV === 'test' || process.env.JEST_WORKER_ID !== undefined;

export const initPrisma = async () => {
  if (initialized && client) return client;

  // Tests must never reach a real database. The suite creates and deletes
  // users, alumni and jobs, so a live DATABASE_URL in .env would otherwise let
  // `npm test` mutate the real dataset. Tests always use the in-memory store.
  if (isTestRun()) {
    Logger.warn('\u26a0\ufe0f Test run detected \u2014 using the in-memory store, never a real database.');
    client = getFallback();
    usingFallback = true;
    initialized = true;
    return client;
  }

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
    // Report the database we actually reached. Hardcoding a provider name here
    // previously logged "Neon" even when pointed at a local database, which
    // makes it impossible to tell from the logs which data is live.
    const target = (() => {
      try {
        const u = new URL(dbUrl || process.env.DATABASE_URL || '');
        const db = u.pathname.replace(/^\//, '') || '(default)';
        return `${u.hostname}/${db}`;
      } catch {
        return '(url unavailable)';
      }
    })();
    Logger.info(`✅ Connected to PostgreSQL via Prisma: ${target}`);
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
