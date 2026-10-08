# ASTU-AMS — SCALABILITY ARCHITECTURE

**System Target**: Adama Science and Technology University (ASTU) Alumni Management System  
**Scaling Capacity**: 100,000+ Registered Alumni | 5,000+ Concurrent Users | 1,000+ req/sec Peak Burst Capacity  
**Architecture Model**: Distributed Modular Monolith with Stateless Node.js API Tier, Shared Redis Cache, PostgreSQL Primary/Replica Topology, and Asynchronous Worker Pools.

---

## 1. EXECUTIVE SUMMARY

The **ASTU Alumni Management System (ASTU-AMS)** is engineered for enterprise-grade university and national graduate data platform deployment. To achieve reliable horizontal scalability without introducing unnecessary microservice complexity, ASTU-AMS adopts a **stateless, share-nothing API architecture**.

```
                           +------------------------+
                           |  Internet / End Users  |
                           +-----------+------------+
                                       |
                                       v
                           +------------------------+
                           |   Cloudflare / WAF     |
                           +-----------+------------+
                                       |
                                       v
                           +------------------------+
                           | NGINX / ALB Load Balancer|
                           +-----------+------------+
                                       |
                 +---------------------+---------------------+
                 |                     |                     |
                 v                     v                     v
          +--------------+      +--------------+      +--------------+
          | API Node #1  |      | API Node #2  |      | API Node #3  |
          +-------+------+      +-------+------+      +-------+------+
                  |                     |                     |
                  +---------------------+---------------------+
                                       |
                      +----------------+----------------+
                      |                                 |
                      v                                 v
             +------------------+              +------------------+
             | Redis Cluster    |              | BullMQ Workers   |
             | (Cache & Bus)    |              | (Background Jobs)|
             +--------+---------+              +--------+---------+
                      |                                 |
                      +----------------+----------------+
                                       |
                                       v
             +--------------------------------------------------+
             | PostgreSQL Primary Database (Neon / AWS RDS)      |
             +-------------------------+------------------------+
                                       |
                                       v
             +--------------------------------------------------+
             | PostgreSQL Read Replicas (Analytics & Exports)   |
             +--------------------------------------------------+
```

---

## 2. SCALABILITY TARGETS & CAPACITY MATRIX

| Metric Tier | Minimum Baseline | Target Capacity | Future Scale Target | Implementation Strategy |
| :--- | :---: | :---: | :---: | :--- |
| **Registered Alumni** | 10,000 | 100,000+ | 500,000+ | PostgreSQL B-Tree indexed queries, schema optimization |
| **Concurrent Active Users** | 1,000 | 5,000 | 25,000 | Stateless JWT auth, Node.js cluster mode, NGINX load balancing |
| **Sustained Throughput** | 100 req/sec | 500 req/sec | 2,500 req/sec | Redis multi-layer caching, connection pooling |
| **Burst Peak Throughput** | 500 req/sec | 1,000 req/sec | 5,000 req/sec | Rate limiting, async job queuing for expensive operations |
| **Average Read Latency (P95)** | < 300 ms | < 150 ms | < 50 ms | Redis cache-aside, cursor-based database pagination |
| **Average Write Latency (P95)**| < 500 ms | < 250 ms | < 100 ms | Offloaded background worker writes for non-blocking operations |

---

## 3. STATELESS API TIER DESIGN

1. **Share-Nothing Architecture**:
   - API instances store zero session state in local memory or local file systems.
   - All session identity is embedded in cryptographically signed JWT tokens or shared Redis token revocation stores.
   - File uploads (resumes, logos, transcript documents) bypass API disk storage and stream directly to S3-compatible Object Storage (AWS S3 or MinIO).

2. **Node.js Process Scaling**:
   - Each API container/node executes in PM2 cluster mode or Kubernetes deployment replicas matching available vCPU cores.
   - Graceful shutdown handles `SIGTERM`/`SIGINT` signals by connection draining within 15 seconds.

3. **Stateless Health Monitoring**:
   - Standard `/api/health` endpoints evaluate liveness and readiness independently per node.

---

## 4. DATABASE SCALABILITY & READ REPLICATION

1. **Connection Pooling**:
   - Built-in Prisma ORM connection management combined with external connection proxying (PgBouncer or Neon Connection Pooling).
   - Maximum 100 connections allocated across pool instances with aggressive idle timeout recycling (10,000ms).

2. **CQRS (Command Query Responsibility Segregation) Strategy**:
   - **Write Operations** (Alumni registration, survey response submissions, employer verifications) hit the **PostgreSQL Primary Node**.
   - **Heavy Read Operations** (University analytics, Ministry reporting, complex job filtering) route to **PostgreSQL Read Replicas**.

3. **Pagination & Query Limits**:
   - Mandatory query limit parameter (`take: Math.min(limit, 100)`).
   - Cursor-based pagination (`cursor: { id }`) implemented on high-volume tables (`AuditLog`, `AlumniProfile`, `JobApplication`).

---

## 5. ASYNCHRONOUS BACKGROUND WORKER ARCHITECTURE

To prevent long-running tasks from starving API event loop threads:

1. **Queue Infrastructure**:
   - Built on **Redis + BullMQ**.
   - Dedicated queues for `emails`, `sms_notifications`, `bulk_imports`, `pdf_reports`, and `ai_analysis`.

2. **Job Decoupling**:
   - Synchronous HTTP requests (e.g., CSV upload) validate schema and publish job descriptors (`{ jobId, payload }`) to Redis.
   - API returns immediately with HTTP 202 Accepted and progress tracking token.
   - Independent **Worker Instances** poll Redis queues, perform chunked execution, update status in PostgreSQL, and trigger real-time updates via WebSockets/SSE.

---

## 6. ETHIOPIAN ENVIRONMENT OPTIMIZATIONS

1. **Low-Bandwidth Optimization**:
   - Gzip/Brotli HTTP compression on all text payloads.
   - Lazy-loading route bundles (`React.lazy`).
   - Lightweight payload JSON format stripping unused fields.

2. **Network Intermittent Resilience**:
   - Client-side request deduplication and offline form state preservation.
   - Automatic retry strategy with exponential backoff on client HTTP client.
