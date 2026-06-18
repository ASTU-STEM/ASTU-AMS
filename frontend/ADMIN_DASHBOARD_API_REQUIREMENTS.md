# Admin Dashboard Backend API Requirements

This document lists backend API endpoints that the Admin Dashboard frontend requires but are not documented in the current API specification (`api_documentation.md`). These endpoints are specific to admin functionality and need to be implemented for the admin dashboard to work properly.

**Note:** The following endpoints are already documented in `api_documentation.md` and should NOT be included in this list:
- `POST /auth/admin/create-user` (Authentication Module)
- `PUT /registrar/alumni/:id/status` (Registrar Module)
- `GET /jobs` (Job Board Module)
- `POST /surveys/templates` (Tracer Surveys Module)
- `GET /analytics/dashboard` (Analytics Module)
- `GET /analytics/employment` (Analytics Module)
- `GET /analytics/skills` (Analytics Module)
- `GET /departments/` (Department Module)
- `GET /departments/my-stats` (Department Module)
- `POST /notifications/` (Notifications Module)
- `PUT /notifications/:id/read` (Notifications Module)
- `DELETE /audit/purge` (Audit Logs Module)

---

## 1. User Management Endpoints

### GET /admin/users or GET /auth/admin/users
**Purpose:** List all users in the system with filtering and pagination
**Access:** ADMIN
**Required by:** UserManagement.tsx
**Current Status:** Frontend has full CRUD UI but only `POST /auth/admin/create-user` exists in API
**Suggested Request:**
```json
GET /auth/admin/users?page=1&limit=20&role=ALUMNI&status=ACTIVE&search=john
```
**Suggested Response:**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "uuid",
        "fullName": "John Doe",
        "email": "john@astu.edu.et",
        "role": "ALUMNI",
        "status": "ACTIVE",
        "studentId": "UGR/1234/12",
        "department": "Computer Science",
        "batch": "2023",
        "createdAt": "2024-01-01T00:00:00Z"
      }
    ],
    "total": 150,
    "page": 1,
    "totalPages": 8
  }
}
```

### PUT /auth/admin/users/:id
**Purpose:** Update user details (not just status)
**Access:** ADMIN
**Required by:** UserManagement.tsx
**Current Status:** Only `PUT /registrar/alumni/:id/status` exists for status updates
**Suggested Request:**
```json
PUT /auth/admin/users/:id
{
  "fullName": "John Doe",
  "email": "john@astu.edu.et",
  "role": "REGISTRAR",
  "status": "ACTIVE"
}
```

### DELETE /auth/admin/users/:id
**Purpose:** Delete or deactivate a user
**Access:** ADMIN
**Required by:** UserManagement.tsx
**Current Status:** Not documented
**Suggested Response:**
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

---

## 2. Audit/Log Management Endpoints

### GET /audit/logs
**Purpose:** View system audit logs with filtering
**Access:** ADMIN
**Required by:** AdminDashboard.tsx (System Activities section), SystemLogs.tsx page
**Current Status:** Only `DELETE /audit/purge` exists in API documentation
**Suggested Request:**
```json
GET /audit/logs?page=1&limit=50&userId=uuid&action=LOGIN&startDate=2024-01-01&endDate=2024-12-31
```
**Suggested Response:**
```json
{
  "success": true,
  "data": {
    "logs": [
      {
        "id": "uuid",
        "userId": "uuid",
        "userEmail": "john@astu.edu.et",
        "action": "LOGIN",
        "entity": "User",
        "entityId": "uuid",
        "details": "User logged in from IP 192.168.1.1",
        "ipAddress": "192.168.1.1",
        "timestamp": "2024-06-11T10:30:00Z"
      }
    ],
    "total": 5000,
    "page": 1,
    "totalPages": 100
  }
}
```

---

## 3. Dashboard-Specific Endpoints

### GET /admin/pending-actions
**Purpose:** Get pending actions that require admin attention
**Access:** ADMIN
**Required by:** AdminDashboard.tsx (Pending Actions section)
**Current Status:** Not documented
**Suggested Response:**
```json
{
  "success": true,
  "data": {
    "pendingActions": [
      {
        "id": "uuid",
        "type": "VERIFICATION_REQUEST",
        "title": "Manual verification request",
        "description": "Jane Doe submitted manual verification",
        "priority": "HIGH",
        "createdAt": "2024-06-11T09:00:00Z",
        "actionUrl": "/admin/verifications/uuid"
      },
      {
        "id": "uuid",
        "type": "DOCUMENT_REQUEST",
        "title": "Document approval pending",
        "description": "Transcript request from John Smith",
        "priority": "MEDIUM",
        "createdAt": "2024-06-10T14:30:00Z",
        "actionUrl": "/admin/documents/uuid"
      }
    ],
    "total": 15
  }
}
```

### GET /admin/weekly-registrations
**Purpose:** Get weekly registration statistics for the dashboard chart
**Access:** ADMIN
**Required by:** AdminDashboard.tsx (Weekly Registrations chart)
**Current Status:** Not documented
**Suggested Response:**
```json
{
  "success": true,
  "data": {
    "weeklyRegistrations": [
      { "week": "Week 1", "alumni": 45, "employers": 12 },
      { "week": "Week 2", "alumni": 52, "employers": 8 },
      { "week": "Week 3", "alumni": 38, "employers": 15 },
      { "week": "Week 4", "alumni": 61, "employers": 10 }
    ]
  }
}
```

---

## 4. Analytics Endpoints

### GET /analytics/employers
**Purpose:** Get top employers by hiring statistics
**Access:** ADMIN
**Required by:** AnalyticsOverview.tsx
**Current Status:** Already implemented in frontend, needs backend implementation
**Suggested Response:**
```json
{
  "success": true,
  "data": {
    "topEmployers": [
      {
        "companyName": "Tech Corp",
        "industry": "IT",
        "hiresCount": 25,
        "applicationsCount": 150
      },
      {
        "companyName": "Bank of Ethiopia",
        "industry": "Finance",
        "hiresCount": 18,
        "applicationsCount": 95
      }
    ]
  }
}
```

### GET /analytics/geographic
**Purpose:** Get alumni geographic distribution
**Access:** ADMIN
**Required by:** AnalyticsOverview.tsx (Geographic Distribution chart)
**Current Status:** Not documented in API documentation (only /analytics/dashboard, /analytics/employment, /analytics/skills exist)
**Suggested Response:**
```json
{
  "success": true,
  "data": {
    "geographicData": [
      { "region": "Addis Ababa", "count": 450, "percentage": 45 },
      { "region": "Oromia", "count": 250, "percentage": 25 },
      { "region": "Amhara", "count": 150, "percentage": 15 },
      { "region": "Tigray", "count": 100, "percentage": 10 },
      { "region": "International", "count": 50, "percentage": 5 }
    ]
  }
}
```

### GET /analytics/time-to-hire
**Purpose:** Get average time-to-hire statistics
**Access:** ADMIN
**Required by:** AnalyticsOverview.tsx (Time to Hire chart)
**Current Status:** Not documented in API documentation (only /analytics/dashboard, /analytics/employment, /analytics/skills exist)
**Suggested Response:**
```json
{
  "success": true,
  "data": {
    "timeToHire": [
      { "month": "Jan", "days": 25 },
      { "month": "Feb", "days": 22 },
      { "month": "Mar", "days": 28 },
      { "month": "Apr", "days": 20 },
      { "month": "May", "days": 24 }
    ]
  }
}
```

---

## 5. Department Management Endpoints

### GET /departments/stats
**Purpose:** Get aggregated statistics across all departments
**Access:** ADMIN
**Required by:** AdminDashboard.tsx, DepartmentManagement.tsx
**Current Status:** Only `GET /departments/my-stats` exists in API documentation for single department
**Suggested Response:**
```json
{
  "success": true,
  "data": {
    "departments": [
      {
        "id": "uuid",
        "name": "Computer Science",
        "totalAlumni": 350,
        "employedCount": 280,
        "employmentRate": 80,
        "averageSalary": "25000 ETB"
      },
      {
        "id": "uuid",
        "name": "Electrical Engineering",
        "totalAlumni": 280,
        "employedCount": 210,
        "employmentRate": 75,
        "averageSalary": "22000 ETB"
      }
    ]
  }
}
```

---

## 6. Bulk Operations Endpoints

### POST /admin/users/bulk-action
**Purpose:** Perform bulk actions on multiple users (activate, deactivate, delete)
**Access:** ADMIN
**Required by:** UserManagement.tsx (Bulk Actions feature)
**Current Status:** Not documented
**Suggested Request:**
```json
POST /admin/users/bulk-action
{
  "userIds": ["uuid1", "uuid2", "uuid3"],
  "action": "ACTIVATE" // or DEACTIVATE, DELETE
}
```

---

## 7. Role Management Endpoints

### GET /admin/roles
**Purpose:** List all roles with their permissions and user counts
**Access:** ADMIN
**Required by:** RoleManagement.tsx
**Current Status:** Frontend has full role management UI but no backend endpoints
**Suggested Response:**
```json
{
  "success": true,
  "data": {
    "roles": [
      {
        "id": "uuid",
        "name": "ADMIN",
        "description": "Full system governance, security, and administrative control",
        "userCount": 18,
        "permissions": {
          "view_users": true,
          "create_users": true,
          "edit_users": true,
          "manage_roles": true,
          "suspend_users": true
        }
      }
    ]
  }
}
```

### PUT /admin/roles/:id/permissions
**Purpose:** Update permissions for a specific role
**Access:** ADMIN
**Required by:** RoleManagement.tsx
**Current Status:** Not documented
**Suggested Request:**
```json
PUT /admin/roles/:id/permissions
{
  "permissions": {
    "view_users": true,
    "create_users": true,
    "edit_users": true
  }
}
```

---

## 8. Jobs Management Endpoints

### GET /admin/jobs
**Purpose:** List all job postings with approval status (admin-specific for management)
**Access:** ADMIN
**Required by:** JobsManagement.tsx
**Current Status:** `GET /jobs` exists in API documentation for public job search, but admin-specific endpoint for managing/approving jobs is missing
**Suggested Response:**
```json
{
  "success": true,
  "data": {
    "jobs": [
      {
        "id": "uuid",
        "title": "Senior Software Engineer",
        "company": "Tech Corp",
        "status": "PENDING_APPROVAL",
        "applicationsCount": 15
      }
    ],
    "pendingApprovalCount": 47
  }
}
```

### PUT /admin/jobs/:id/approve
**Purpose:** Approve a job posting
**Access:** ADMIN
**Required by:** JobsManagement.tsx
**Current Status:** Not documented
```

---

## 9. Notifications Endpoints

### GET /admin/notifications
**Purpose:** Get system notifications for admin (admin-specific notification center)
**Access:** ADMIN
**Required by:** NotificationCenter.tsx
**Current Status:** `POST /notifications/` and `PUT /notifications/:id/read` exist in API documentation for general notifications, but admin-specific endpoint for viewing admin notifications is missing
**Suggested Response:**
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "uuid",
        "type": "VERIFICATION_REQUEST",
        "title": "New verification request",
        "isRead": false,
        "createdAt": "2024-06-11T09:00:00Z"
      }
    ],
    "unreadCount": 5
  }
}
```

---

## 10. Reports Center Endpoints

### GET /admin/reports
**Purpose:** List available reports
**Access:** ADMIN
**Required by:** ReportsCenter.tsx
**Current Status:** Not documented
**Suggested Response:**
```json
{
  "success": true,
  "data": {
    "reports": [
      {
        "id": "uuid",
        "name": "Monthly Employment Report",
        "type": "EMPLOYMENT",
        "lastGenerated": "2024-06-01T00:00:00Z"
      }
    ]
  }
}
```

---

## 11. System Settings Endpoints

### GET /admin/settings
**Purpose:** Get system-wide settings
**Access:** ADMIN
**Required by:** SystemSettings.tsx
**Current Status:** Not documented
**Suggested Response:**
```json
{
  "success": true,
  "data": {
    "settings": {
      "siteName": "ASTU Alumni Management System",
      "maintenanceMode": false,
      "registrationEnabled": true
    }
  }
}
```

### PUT /admin/settings
**Purpose:** Update system settings
**Access:** ADMIN
**Required by:** SystemSettings.tsx
**Current Status:** Not documented
```

---

## 12. Backup & Security Endpoints

### POST /admin/backup/create
**Purpose:** Create system backup
**Access:** ADMIN
**Required by:** BackupSecurity.tsx
**Current Status:** Not documented
**Suggested Response:**
```json
{
  "success": true,
  "data": {
    "backupId": "uuid",
    "filename": "backup-2024-06-11.sql",
    "createdAt": "2024-06-11T12:00:00Z"
  }
}
```

---

## 13. Super Admin Modules Endpoints

### GET /admin/modules
**Purpose:** List available super admin modules
**Access:** ADMIN
**Required by:** SuperAdminModules.tsx
**Current Status:** Not documented
**Suggested Response:**
```json
{
  "success": true,
  "data": {
    "modules": [
      {
        "id": "uuid",
        "name": "Content Management",
        "status": "ACTIVE"
      }
    ]
  }
}
```

---

## Summary of Missing Endpoints

| Endpoint | Purpose | Priority |
|----------|---------|----------|
| GET /auth/admin/users | List users with filters | HIGH |
| PUT /auth/admin/users/:id | Update user details | HIGH |
| DELETE /auth/admin/users/:id | Delete user | HIGH |
| GET /audit/logs | View audit logs | HIGH |
| GET /admin/pending-actions | Get pending actions | MEDIUM |
| GET /admin/weekly-registrations | Weekly registration stats | MEDIUM |
| GET /analytics/geographic | Geographic distribution | MEDIUM |
| GET /analytics/time-to-hire | Time-to-hire statistics | MEDIUM |
| GET /departments/stats | All departments stats | MEDIUM |
| POST /admin/users/bulk-action | Bulk user operations | HIGH |
| GET /admin/roles | List roles with permissions | HIGH |
| PUT /admin/roles/:id/permissions | Update role permissions | HIGH |
| GET /admin/jobs | List job postings | HIGH |
| PUT /admin/jobs/:id/approve | Approve job | HIGH |
| GET /admin/notifications | Get notifications | MEDIUM |
| GET /admin/reports | List reports | MEDIUM |
| GET /admin/settings | Get system settings | HIGH |
| PUT /admin/settings | Update settings | HIGH |
| POST /admin/backup/create | Create backup | HIGH |
| GET /admin/modules | List super admin modules | LOW |
