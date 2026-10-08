# ASTU-AMS — QUEUE ARCHITECTURE

**System Component**: Adama Science and Technology University (ASTU) Alumni Management System  
**Document Purpose**: Asynchronous Job Queuing, Worker Lifecycle & Dead-Letter Queue (DLQ) Topology  
**Technology Stack**: Redis 7.0 + BullMQ Worker Framework

---

## 1. ASYNCHRONOUS WORKER ARCHITECTURE

```
                      +-----------------------------+
                      |   API Express Controller    |
                      +--------------+--------------+
                                     |
                                     v
                      +-----------------------------+
                      |    BullMQ Job Producer      |
                      |   (enqueue heavy payload)   |
                      +--------------+--------------+
                                     |
                                     v
                      +-----------------------------+
                      |  Redis Queue Storage (RDB)  |
                      +--------------+--------------+
                                     |
               +---------------------+---------------------+
               |                     |                     |
               v                     v                     v
        +--------------+      +--------------+      +--------------+
        | Email Worker |      | Export Worker|      |  AI Worker   |
        +--------------+      +--------------+      +--------------+
```

---

## 2. QUEUE TAXONOMY & PRIORITY LEVELS

| Queue Name | Concurrency | Priority | Job Types | Retry Policy |
| :--- | :---: | :---: | :--- | :--- |
| `high-priority-queue` | 10 workers | 1 (Critical) | Password Reset OTP, 2FA Verification, Emergency Alerts | 3 attempts, exponential backoff (1s, 2s, 4s) |
| `notifications-queue` | 5 workers | 2 (High) | Welcome emails, Job application notifications, Survey reminders | 5 attempts, backoff with jitter (5s, 15s, 45s) |
| `bulk-import-queue` | 2 workers | 3 (Normal) | Registrar student record CSV/Excel imports, Data reconciliation | 2 attempts, manual dead-letter review |
| `analytics-queue` | 2 workers | 4 (Low) | Tracer study aggregations, Monthly report PDFs, AI skill audits | 3 attempts, backoff (30s, 60s, 120s) |

---

## 3. DEAD-LETTER QUEUE (DLQ) & FAILURE ISOLATION

1. **Failure Handling**:
   - If a worker job exceeds maximum retry attempts, BullMQ automatically routes the job payload to `astu-dlq:{queue_name}`.
   - DLQ entries record full stack traces, input payloads, attempt timestamps, and execution context.

2. **Idempotency Requirement**:
   - Every background job payload MUST supply a unique `idempotencyKey` (e.g., `survey_reminder_{alumniId}_{surveyId}`).
   - Workers query key state before execution to prevent duplicate email generation or duplicate database record creation.
