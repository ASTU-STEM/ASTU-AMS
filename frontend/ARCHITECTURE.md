# ASTU-AMS Frontend Architecture

## Directory Structure

```
src/
├── domains/                    # Domain-driven modules
│   ├── admin/                  # Admin panel (CMS, users, settings, analytics)
│   │   ├── pages/              # Page-level components (routes)
│   │   ├── components/         # Domain-specific UI components
│   │   ├── hooks/              # Domain-specific hooks
│   │   ├── api/                # API client & mock data
│   │   └── types/              # Domain TypeScript types
│   │
│   ├── alumni/                 # Alumni portal
│   │   ├── pages/              # AlumniDashboard
│   │   ├── components/         # DashboardOverview, CareerTab, JobsTab, etc.
│   │   ├── services/           # alumni.service.ts
│   │   ├── types/              # alumni.types.ts
│   │   └── config/             # Domain configuration
│   │
│   ├── analytics/              # Analytics & reporting
│   │   ├── services/           # analytics.service.ts
│   │   └── types/              # analytics.types.ts
│   │
│   ├── auth/                   # Authentication & registration
│   │   ├── pages/              # Login, Signup, ResetPassword, OTP, etc.
│   │   ├── components/         # FormField, AuthInput, PrimaryButton, etc.
│   │   ├── services/           # auth.service.ts
│   │   ├── types/              # auth.types.ts
│   │   ├── schemas/            # Yup validation schemas
│   │   └── contexts/           # RegistrationContext
│   │
│   ├── departments/            # Department analytics & curriculum
│   │   ├── pages/              # DepartmentDashboard
│   │   ├── components/         # 40+ analytics components
│   │   ├── services/           # department.service.ts
│   │   └── types/              # Domain types
│   │
│   ├── employers/              # Employer portal
│   │   ├── pages/              # EmployerDashboard
│   │   ├── components/         # AnalyticsTab, ApplicationsTab, etc.
│   │   ├── services/           # employer.service.ts
│   │   └── types/              # employer.types.ts
│   │
│   ├── jobs/                   # Job board
│   │   ├── services/           # jobs.service.ts
│   │   └── types/              # jobs.types.ts
│   │
│   ├── notifications/          # Notifications
│   │   ├── services/           # notification.service.ts
│   │   └── types/              # notifications.types.ts
│   │
│   ├── pages/                  # Public pages
│   │   ├── HomePage.tsx
│   │   ├── LandingPage.tsx
│   │   ├── NotFoundPage.tsx
│   │   ├── PartnersPage.tsx
│   │   ├── PublicInfoPage.tsx
│   │   └── EmployersPage.tsx
│   │
│   ├── registrar/              # Registrar portal
│   │   ├── pages/              # RegistrarDashboard
│   │   ├── components/         # RecordsTab, VerificationTab, etc.
│   │   ├── services/           # registrar.service.ts
│   │   └── types/              # registrar.types.ts
│   │
│   ├── support/                # Support tickets
│   │   ├── pages/              # SupportPage
│   │   └── services/           # support.service.ts
│   │
│   └── surveys/                # Surveys
│       ├── components/         # SurveyManagement
│       ├── services/           # survey.service.ts
│       └── types/              # survey.types.ts
│
├── shared/                     # Shared cross-domain code
│   ├── components/             # Generic reusable components
│   │   ├── cards/              # DashboardCard, StatCard
│   │   ├── charts/             # Charts
│   │   ├── forms/              # Dropdown, FormField, SearchInput, ToggleSwitch
│   │   ├── loaders/            # Spinner
│   │   ├── navbar/             # NavbarActions, NavbarBreadcrumb, NavbarSearch
│   │   ├── notifications/      # NotificationPanel
│   │   ├── sidebar/            # SidebarFooter, SidebarNav
│   │   ├── tables/             # Table, Pagination
│   │   └── ui/                 # Badge, Button, Input, Modal, Select
│   ├── layouts/                # App layout shells
│   │   ├── AdminLayout.tsx     # Admin panel layout
│   │   ├── AdminSidebar.tsx    # Admin sidebar
│   │   ├── AppSidebar.tsx      # Generic sidebar
│   │   ├── AuthLayout.tsx      # Auth pages layout
│   │   ├── CmsLayout.tsx       # CMS layout
│   │   ├── CmsSidebar.tsx      # CMS sidebar
│   │   ├── DashboardLayout.tsx # Dashboard container
│   │   └── DashboardShell.tsx  # Dashboard shell
│   ├── hooks/                  # Shared hooks (useRedux)
│   ├── contexts/               # AuthContext
│   ├── services/               # Centralized API client (api.ts)
│   ├── store/                  # Redux store (authSlice, uiSlice)
│   ├── types/                  # Shared TypeScript types
│   ├── utils/                  # Utility functions
│   ├── constants/              # App-wide constants
│   ├── config/                 # App configuration
│   └── styles/                 # Global styles (animations.css)
│
├── routes/                     # Route definitions
│   ├── adminRoutes.tsx         # Admin panel routes
│   └── cmsRoutes.tsx           # CMS routes
│
├── assets/                     # Static assets
│   ├── images/
│   ├── logos/
│   ├── icons/
│   └── fonts/
│
├── App.tsx                     # Root component with routing
├── main.tsx                    # Entry point
└── global.css                  # Global styles
```

## Architecture Principles

### 1. Domain-Driven Organization
Each domain module is self-contained with its own pages, components, services, and types. Cross-domain communication goes through the `shared/` layer.

### 2. Shared Code
The `shared/` directory contains code used across multiple domains:
- **Components**: Generic UI components (buttons, inputs, tables, modals)
- **Layouts**: Page layout shells
- **Services**: Centralized API client (`api.ts`)
- **Contexts**: AuthContext for authentication state
- **Store**: Redux store with domain-agnostic slices

### 3. Centralized API Client
All API calls go through `src/shared/services/api.ts` which exports:
- `get`, `post`, `put`, `patch`, `del` — JSON API helpers
- `upload`, `download` — File transfer helpers

Domain services wrap these to provide typed domain APIs.

### 4. Routing
Routes are defined in `src/routes/` and map to page components in `src/domains/*/pages/`. All existing routes remain unchanged.

### 5. Type Safety
- Each domain defines its own TypeScript types in `types/`
- Shared types live in `shared/types/`
- Backend Prisma models are the source of truth for field names

### 6. No Mock Data
All mock/demo/hardcoded data has been removed. Every value comes from the backend API.

## Key Conventions

| Convention | Rule |
|---|---|
| **File naming** | PascalCase for components, camelCase for services/hooks |
| **Imports** | Relative imports within domain; absolute-style from shared/ |
| **State** | Redux for global state, React context for auth, local state for UI |
| **API calls** | Always through domain service → shared API client |
| **Types** | Aligned to backend Prisma models; no frontend-only fields |
