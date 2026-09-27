# ASTU-AMS Codebase Review Report

Prepared: Sep 12, 2026 · Branch `integrateddepartement` · Last commit `fcc48f4`

---

## Executive Summary

ASTU-AMS is a large, ambitious full-stack alumni management platform. The backend
(276 TS files, 18 modules) follows a genuinely good Clean Architecture in its core
modules and has a real test suite (~150 tests). The frontend (286 files, 11 features)
is rich in UI and recently migrated the Department dashboards from mocks to real APIs.

**Overall verdict:** The project is impressive in scope and the recent department
migration was well done. However, it has **5 critical security issues**, a
**silent fake-database fallback**, **inconsistent shared analytics data across
dashboards**, **a few hardcoded/mock dashboards remaining**, and **~45% orphaned
frontend code** that makes the codebase hard to navigate. The sections below give
concrete file:line evidence and an ordered action plan.

---

## PART 1 — Backend Review

### 1.1 Architecture (Good overall, with exceptions)

Modules that correctly follow the 4-layer Clean Architecture
(domain / application / infrastructure / presentation):
`auth`, `employer`, `jobboard`, `documents`, `analytics`, `department`,
`notifications`, `events`, `mentorship`, `ai`.

Modules that **do NOT** follow the pattern (logic in controllers, no ports/use-cases):

| Module | Problem |
|---|---|
| `chat` | Only presentation layer — 630-line controller with inline Prisma queries |
| `content` | Only presentation layer — 218-line controller with hardcoded mock data |
| `support` | No repository abstraction, no error types |
| `admin` | Logic lives in `infrastructure/controllers/AdminController.ts` (no presentation dir) |
| `surveys` | 501-line controller with inline Prisma in employer sections |
| `audit` | Entire module (7 endpoints) exists but is **never mounted** in `app.ts` — dead code |

### 1.2 CRITICAL security issues (fix first)

| # | Severity | Finding | Location |
|---|---|---|---|
| 1 | **CRITICAL** | **Hardcoded password bypass** — `Test@123` / `Test@1234` logs in as ANY user | `backend/src/modules/auth/application/use-cases/LoginUser.ts:51` |
| 2 | **CRITICAL** | **WebSocket has NO authentication** — any client can `register` as any `userId` and receive that user's real-time messages/notifications; `origin: '*'` | `backend/src/infrastructure/websocket/SocketServer.ts:10-25` |
| 3 | **HIGH** | **Rate limiting permanently disabled** — `skip: () => true` | `backend/src/app.ts:33` |
| 4 | **HIGH** | **Real-looking Chapa payment secret key hardcoded in source** (with public key) — test keys in source is bad practice; a live key here would be a money-handling breach | `backend/src/modules/alumni/presentation/alumni.controller.ts:166,210,223,728,772,783` |
| 5 | **HIGH** | **IDOR** — `MarkAsRead` does not verify notification ownership (any user can mark any notification read) | `backend/src/modules/notifications/application/use-cases/ManageNotifications.ts` |
| 6 | **MED** | `ForgotPassword` logs the reset code to the console | `backend/src/modules/auth/application/use-cases/ForgotPassword.ts:79-80,111` |
| 7 | **MED** | Content create/update/delete uses `optionalAuthenticateJWT` (no enforcement) | `backend/src/modules/content/presentation/content.controller.ts` |
| 8 | **MED** | Support ticket POST has no auth middleware | `backend/src/modules/support/presentation/support.routes.ts` |
| 9 | **MED** | `AdminController.getSidebarStats` reads `req.user.id` but auth middleware sets `req.user.userId` → bug returns wrong user | `backend/src/modules/admin/infrastructure/controllers/AdminController.ts:55` |
| 10 | **MED** | `verifyChapaPayment` auto-creates fake alumni profiles (fake studentId, cgpa 3.5, department `dept-swe`) | `backend/src/modules/alumni/presentation/alumni.controller.ts:234-248,794-808` |
| 11 | **INFO** | `frontend/.env` is committed to git | `git ls-files` |
| 12 | **INFO** | Real user-uploaded files (documents, resumes, verification docs) committed to git | `backend/uploads/**` |

> Note: Helmet **is** enabled in `app.ts:9` (correct), CORS allowlist is reasonable.

### 1.3 Data layer — `db.ts` silent fake-DB fallback (HIGH risk)

`backend/src/core/config/db.ts` (1,548 lines) contains a full **`FakePrisma`** in-memory
JSON database. The exported proxy **(1)** auto-swaps to FakePrisma on any connection
error (`getFallback()`, `usingFallback` flow, lines ~1354-1413) even outside tests, and
**(2)** seeds/writes to `data/dev-db.json`.

Consequences:
- If PostgreSQL fails in production, the API **silently serves made-up data** instead of failing loudly → users see fake numbers, writes are lost.
- The uncommitted `+599/-51` changes to this file are adding `matchWhere`, `select`, and ordering support to the fake DB (a big effort to emulate Prisma that would be better spent on a real DB or a clean `sqlite` fallback only for tests).
- Cron service in `tracer.service.ts` seeds sample data on startup.

### 1.4 Code quality / smells

- `alumni.controller.ts` is **954 lines** mixing use-case delegation with inline logic, including hardcoded `http://localhost:5000` avatar URLs (lines 361, 402), `twoFactorEnabled: false // Stubbed for now` (line 917), `openJobMatches: 12, // Dummy for now` (line 317).
- Donation campaigns are **auto-seeded as mock data** on empty responses in both `AdminController.ts:319-349` and `alumni.controller.ts:650-680`.
- `@types/pdfkit` is in production dependencies (`backend/package.json:21`).
- Password reset tokens are stored in the `AnalyticsCache` table (misuse as generic KV store).
- Root `.gitignore` and `backend/package.json` contain unrelated generated entries (e.g. `AUTH_SYSTEM_DOCUMENTATION`).

### 1.5 Testing

- **34 test files, ~150+ tests.** Mostly unit tests with mocked Prisma; integration tests for AI, employer, analytics; 1 e2e pipeline test (`tests/e2e/tracer-study-pipeline.test.ts`).
- Good coverage on core use-cases (auth, mentorship, jobboard, analytics).
- Gap: no tests for the `db.ts` FakePrisma fallback, no security tests (login bypass would have been caught), no coverage for `chat`, `content`, `support`, `admin`.

---

## PART 2 — Frontend Review

### 2.1 Routing

Router in `src/App.tsx`. Role-protected areas are wired correctly for ALUMNI,
EMPLOYER, REGISTRAR, DEPARTMENT_HEAD, ADMIN, CMS vs. `AuthContext` + localStorage.

Broken links found:
- `src/features/admin/pages/AdminDashboard.tsx:59` → "/admin/events" (route does not exist → NotFoundPage).
- `src/features/admin/pages/HomepageManagement.tsx:568-575` → 4 hardcoded `/cms/*` links that don't exist in `cmsRoutes.tsx`.

### 2.2 Tailwind CSS is CDN-only — biggest latent frontend bug

- `frontend/index.html:7` loads `https://cdn.tailwindcss.com` at runtime, and the entire theme is duplicated in an inline `<script>` `tailwind.config = {...}`.
- The new (untracked) `tailwind.config.js` + `postcss.config.js` compile **nothing** — `src/global.css` has no `@tailwind`/`@apply` directives.
- If the CDN is blocked/slow, or in a production build, **the entire app renders unstyled**.
- Fix: move theme into `tailwind.config.js`, add `@tailwind base/components/utilities` to a CSS file, build Tailwind locally, remove the CDN script.

### 2.3 State management is dual and mostly dead

- Redux store (`store/`) is **wired but unused** — nothing outside `src/store/` dispatches or selects (`useRedux.ts` has no importers). Real auth is `AuthContext` + localStorage.
- Two parallel sidebar/theme persistence systems: `uiSlice.ts` (`sidebar_collapsed`/`theme`) and the department dashboard's own `department_sidebar_collapsed`/`theme`.
- Recommendation: pick ONE (Redux or Context). Since `AuthContext` is already the working pattern, either delete Redux or migrate everything to it.

### 2.4 Duplication

- The `Skeleton`, `DetailItem`, `salarySummary`, and CSV `handleExport` blocks are copy-pasted verbatim across the three department components:
  - `DashboardOverview.tsx:31-98`
  - `EmploymentAnalytics.tsx:35-177`
  - `GraduatesDirectory.tsx:36-191`
  → extract into a shared `DepartmentChartCard`/`exportCsv` util.
- Two `<SurveyManagement>` components with different implementations: `features/surveys/components/SurveyManagement.tsx` (3,902 lines) and `features/admin/pages/SurveyManagement.tsx` (1,509 lines).
- Two `DashboardOverview` components (`departments/` and `alumni/`).

### 2.5 Orphaned / dead code (safe to delete ~45% of the feature layer)

- `src/layouts/DashboardLayout.tsx` (823 lines), `DashboardShell.tsx` (395), `pages/LandingPage.tsx` (823), `features/auth/pages/SignupPage.tsx` — no importers.
- `src/features/analytics/**` — stub (`index.ts` is `export {}`), types used only by mock data, mock data used by no one.
- `src/features/jobs/**` — types + `mockJobsData.ts`, no importers (jobs UI lives under `alumni`/`employer`).
- `src/features/notifications/services/mockNotificationData.ts` — no importers.
- `src/features/admin/hooks/useAdminAnalytics/useAdminSurveys/useAdminUsers.ts` — mock-backed, unused.
- `src/features/admin/api/adminApi.ts` — `USE_MOCK = true`, never imported.
- Feature `index.ts` barrels with no consumers.

❌ **Danger:** files marked deleted/mock but with dangling references still present:
- `SurveyManagement.tsx:14` imports `adminMockData` but never uses it (dead import).

### 2.6 Remaining mock/static dashboards

| Screen | Status | Evidence |
|---|---|---|
| Employer Messages tab | **localStorage mock** (backend has real `/employer/conversations`) | `employer.service.ts:424-433` used by `EmployerDashboard.tsx:55,265`; real methods at `:376-394` unused |
| `admin/ReportsCenter.tsx` | **100% hardcoded** KPIs (84%, 4.6/5, 31, 42) | lines 51-56 |
| `registrar/ReportingTab.tsx` | static UI | — |
| `registrar.service.ts` export manifest | client-side stub `{status:'Ready'}` | lines 125-132 |
| `AuthContext.MOCK_USERS` | fallback table still read for name lookups | `AuthContext.tsx:16-23,63-64` |

### 2.7 Small bugs

- `SUPER_ADMIN` role omitted from `LoginPage.roleRoutes` and `ProtectedRoute.dashboardMap` → super admins get bounced to `/`, and `readStoredUser` treats role-only SUPER_ADMIN as logged out (`AuthContext.tsx:63-64`).
- Env var inconsistency: most services read `VITE_API_BASE_URL`, some `VITE_API_URL`, some both. `.env` sets both today, but a partial deploy would silently split API targets.
- Department `unemployed` derived as `totalAlumni - employed - selfEmployed` from a record list while `totalAlumni` may come from server totals → unemployment rate can be overstated.

---

## PART 3 — Shared Data Across Dashboards (the "shared datas" problem)

### 3.1 The same concept is computed 3 different ways

Employment-rate / alumni-count analytics are produced by **three independent shapes**:

1. **Department dashboard** — derives everything client-side from the raw
   `/departments/my-alumni` list (`useDepartmentData.ts:21-44`).
2. **Registrar** — maps `/registrar/dashboard-stats` fields "approximately"
   (`registrar.service.ts:14-37`, comment: *"Mapped approximately"*).
3. **Admin** — consumes the backend `/analytics/report` aggregate
   (`admin.service.ts:138`).

There is **no shared analytics type** in the frontend. One DAO utility (a single
`useAnalytics` + shared TS types) would eliminate the triplication.

### 3.2 Confirmed backend↔frontend field mismatches

| # | Backend provides | Frontend expects | Location |
|---|---|---|---|
| 1 | **No such route** → 404 | `GET /departments/my-department` | FE `department.service.ts:45` vs BE `department.routes.ts` (only `/`, `/my-stats`, `/my-alumni`) |
| 2 | `DepartmentStats {totalAlumni, employedAlumni, employmentRate}` | also `selfEmployedAlumni, unemployedAlumni, averageSalary` | BE `DepartmentLookups.ts` vs FE `department.service.ts:6-9` |
| 3 | Alumni records carry only `{id, userId, fullName, graduationYear, employmentStatus}` | `studentId, email, phone, salary, skills, company, jobTitle, industry, location, isVerified` | BE `PrismaAlumniDepartmentRepository.ts:13-19` vs FE `department.service.ts:15-27` → salary/company/skills aggregations silently produce zeros |
| 4 | `averageTimeToHireMonths` | `timeToHireMonths` | BE `modules/analytics/domain/entities/Analytics.ts:13` vs FE `AnalyticsOverview.tsx:148` |
| 5 | `employmentTrend` / `graduateOutcomeTrend` | `rateByGraduationYear` | BE `Analytics.ts:14-15` vs FE `AnalyticsOverview.tsx:174` |

> In practice: the department dashboard shows **zeros/empty** for average salary,
> company/industry breakdowns, and time-to-hire because the backend's
> `/departments/my-alumni` endpoint doesn't return those fields yet.

### 3.3 Fixes for shared-data consistency

1. **Backend:** extend `PrismaAlumniDepartmentRepository.findByDepartmentId` to return
   salary, company, jobTitle, industry, location, skills, isVerified; add
   `GET /departments/my-department`; add a `selfEmployed` + `averageSalary` to
   department stats.
2. **Backend:** rename or alias `averageTimeToHireMonths` and
   `employmentTrend`/`graduateOutcomeTrend` to the exact field names the admin chart expects (or fix the FE).
3. **Frontend:** create `src/features/analytics/types.ts` + one `useAnalyticsData` hook and make department/registrar/admin all consume it. Delete the dead `features/analytics` stub or bring it to life.
4. **Frontend:** stop trusting client-side derivations of server totals; let the backend return authoritative aggregates.

---

## PART 4 — Project Health & Git State

- **Uncommitted work:** 13 modified + 6 untracked files (+3,158/−1,716). This is the department mock→backend migration — it is **clean** (tsc passes, no dangling imports) but should be committed soon to avoid loss.
- `npx tsc --noEmit` in frontend: **0 errors** (note: `tsconfig` has no `strict`, so this is a loose check — enable `strict: true`).
- Last committed report (`backend/IMPLEMENTATION_SUMMARY.md`, 638 lines) declares the backend "✅ FULLY IMPLEMENTED" for the initial 11 modules (auth/verification pipeline, registrar sync, unified login, baggage + filter verification). It contains curl/POSTMAN test recipes and a deployment checklist.
- Existing docs are good and accurate: `architecture.md` (1,205 lines), `TESTING_GUIDE.md`, `file_structure.md`.

---

## PART 5 — Priority Action Plan ("the way to a good project")

### Phase 1 — Security (this week, ~half a day)
1. Remove the hardcoded password bypass in `LoginUser.ts:51` (remove lines 51-53).
2. Add JWT/userId auth to the WebSocket handshake (`SocketServer.ts`); require a verified token + `userId`, and restrict origin.
3. Enable rate limiting (remove `skip: () => true`, keep max high but finite) in `app.ts:33`.
4. Delete the Chapa fallback keys from `alumni.controller.ts`; throw if env missing.
5. Fix `AdminController.ts:55` (`req.user.userId`).
6. Remove committed `frontend/.env` and `backend/uploads/**` from git; add to `.gitignore`.
7. Fix IDOR in `ManageNotifications`; remove console.log of reset codes.

### Phase 2 — Data integrity
8. **Remove the silent FakePrisma fallback** in production `db.ts` — either fail fast on DB errors outside `NODE_ENV=test`, or gate it strictly to test/dev.
9. Implement the department backend fields (salary, company, industry, location, skills) + `/my-department` route so the frontend isn't showing zeros (see 3.3).

### Phase 3 — Frontend quality
10. Replace CDN Tailwind with a real build (`@tailwind` in a CSS entry; remove the inline `tailwind.config` script from `index.html`).
11. Pick one state layer: delete Redux or migrate auth fully into it.
12. Delete all orphaned files (2.5) and dead mock data; wire the Employer Messages tab and ReportsCenter to real APIs.
13. Enable `strict: true` in `tsconfig.json` and fix the resulting errors (guards against typos in field names — the exact class of bug in Part 3).
14. Fix the dead links (AdminDashboard `/admin/events`, HomepageManagement `/cms/*`) and the `SUPER_ADMIN` routing gap.

### Phase 4 — Consistency & tests
15. Unify the three analytics consumers onto one shared `/analytics/report` shape + shared FE types.
16. Add a security regression test (the login bypass would have been caught), plus tests for chat/content/support/admin.
17. Extract the copy-pasted department component blocks into shared components/utils.

---

## Appendix — What's already good (keep doing this)

- Clean Architecture discipline in ~10 of 18 modules; ports/use-cases/test triplets.
- Real test suite (~150 tests) with integration + e2e.
- Single axios client with token + refresh interceptor (`services/api.ts`).
- The recent department migration shows you *can* remove mock and wire real APIs cleanly — do the same for the remaining static dashboards.
- Feature-scoped, typed components; shared `AnalyticsChart`/`ActivityTimeline` are used well.