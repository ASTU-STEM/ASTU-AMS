# ASTU-AMS — DATABASE SCALABILITY & OPTIMIZATION

**System Component**: Adama Science and Technology University (ASTU) Alumni Management System  
**Engine**: Managed PostgreSQL 16.2 + Prisma ORM  
**Target Dataset**: 100,000+ Alumni Records | Multi-Tenant Department Analytics | Audit Logs

---

## 1. INDEXING STRATEGY & COMPOSITE INDEXES

To eliminate full table scans on high-traffic tables, ASTU-AMS enforces targeted B-Tree composite indexing:

```sql
-- High-Volume Audit Logs Index
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_log_action_created 
ON "AuditLog" ("action", "createdAt" DESC);

-- Alumni Search & Filtering Composite Index
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_alumni_search 
ON "AlumniProfile" ("departmentId", "graduationYear", "employmentStatus");

-- Job Listings Filtering Index
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_job_status_expiry 
ON "Job" ("status", "deadline" DESC);

-- Tracer Response Aggregation Index
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tracer_response_survey 
ON "TracerResponse" ("surveyId", "completedAt");
```

---

## 2. N+1 QUERY ELIMINATION RULES

Prisma ORM default relationships can suffer from N+1 query patterns if iterating inside async loops. ASTU-AMS enforces explicit field selection and batching:

```typescript
// BAD (N+1 Pattern):
const alumni = await prisma.alumniProfile.findMany();
for (const a of alumni) {
  const jobs = await prisma.jobApplication.findMany({ where: { alumniId: a.id } });
}

// GOOD (Optimized Batch Join):
const alumniWithJobs = await prisma.alumniProfile.findMany({
  take: 50,
  select: {
    id: true,
    firstName: true,
    lastName: true,
    jobApplications: {
      select: { id: true, status: true, appliedAt: true }
    }
  }
});
```

---

## 3. ZERO-DOWNTIME MIGRATION PROTOCOL

1. **Non-Destructive Migrations**:
   - Column deletions (`DROP COLUMN`) and rename operations (`RENAME COLUMN`) are strictly forbidden in automated CI deployment scripts.

2. **Five-Step Expand-Contract Pattern**:
   - **Step 1**: Add new column as nullable (`ALTER TABLE ... ADD COLUMN new_col TYPE ...`).
   - **Step 2**: Deploy code supporting reads/writes to both old and new columns.
   - **Step 3**: Backfill historical rows asynchronously in batches of 1,000.
   - **Step 4**: Switch application primary reads/writes to `new_col`.
   - **Step 5**: Drop `old_col` in a subsequent maintenance cycle.
