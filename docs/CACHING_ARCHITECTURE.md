# ASTU-AMS — CACHING ARCHITECTURE

**System Component**: Adama Science and Technology University (ASTU) Alumni Management System  
**Document Purpose**: Redis Caching Layer Topology, Key Taxonomy & Invalidation Engine  
**Implementation Model**: Cache-Aside Pattern with Automatic TTL & Multi-Tier Invalidation Hooks

---

## 1. CACHING TOPOLOGY

```
                    +------------------------------------+
                    |        API Service Request         |
                    +-----------------+------------------+
                                      |
                                      v
                    +------------------------------------+
                    |  Check Redis Cache (Cache-Aside)   |
                    +--------+------------------+--------+
                             |                  |
                    HIT      |                  | MISS
                             v                  v
                    +----------------+  +----------------+
                    | Return Cached  |  | Query Primary  |
                    | Payload (<5ms) |  | PostgreSQL DB  |
                    +----------------+  +-------+--------+
                                                |
                                                v
                                        +----------------+
                                        | Populate Redis |
                                        | Cache with TTL |
                                        +----------------+
```

---

## 2. CACHE KEY TAXONOMY & EXPIRATION MATRIX

| Data Category | Key Pattern | TTL Duration | Invalidation Event Trigger |
| :--- | :--- | :---: | :--- |
| **System Settings** | `astu:settings:global` | 24 Hours | Modified via Admin Technical Ops / SOC setting update |
| **User Roles & Perms**| `astu:auth:perms:{userId}` | 1 Hour | Admin role changes, permission grant/revoke |
| **Alumni Public Profile**| `astu:alumni:profile:{id}` | 15 Minutes | Profile update, work experience edit |
| **Job Listings Feed** | `astu:jobs:feed:{query_hash}` | 5 Minutes | New job approval, job application, status update |
| **Tracer Aggregates** | `astu:tracer:stats:{year}` | 6 Hours | Survey response submission, manual rebuild command |
| **University Stats** | `astu:stats:dashboard` | 1 Hour | Scheduled metric aggregation job |
| **Token Blacklist** | `astu:auth:revoked:{jti}` | Dynamic (Token exp) | User logout, security breach token revocation |

---

## 3. CACHE STAMPEDE & CONCURRENCY PROTECTION

To protect PostgreSQL against **cache stampedes** (dog-piling) when high-demand keys expire under burst loads:

1. **Distributed Mutex Lock**:
   - API endpoints acquiring cache misses must acquire a temporary Redis lock (`astu:lock:{key}`) before querying PostgreSQL.
   - Secondary concurrent requests wait up to 500ms for the cache to populate before re-attempting cache read.

2. **Probabilistic Early Expiration (XFetch)**:
   - Dynamic TTL calculation triggers background revalidation prior to key expiration when access frequency is high.

---

## 4. CACHE INVALIDATION RULES

```typescript
// Example Cache Invalidation Pattern in ASTU-AMS
export async function invalidateAlumniCache(alumniId: string, departmentId: string) {
  const keys = [
    `astu:alumni:profile:${alumniId}`,
    `astu:stats:department:${departmentId}`,
    `astu:stats:dashboard`
  ];
  await redisClient.del(...keys);
}
```
