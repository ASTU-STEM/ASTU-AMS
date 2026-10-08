# ASTU-AMS — OBSERVABILITY ARCHITECTURE

**System Component**: Adama Science and Technology University (ASTU) Alumni Management System  
**Observability Pillars**: Structured Logging, Real-Time Metrics, Distributed Request Tracing  
**Implementation**: OpenTelemetry Protocol (OTEL) Compatible Tracing + Winston Structured Logger + PostgreSQL Telemetry

---

## 1. THREE PILLARS OF OBSERVABILITY

```
                     +----------------------------------+
                     |    ASTU-AMS OBSERVABILITY TIER   |
                     +-----------------+----------------+
                                       |
          +----------------------------+----------------------------+
          |                            |                            |
          v                            v                            v
  +---------------+            +---------------+            +---------------+
  |  LOGGING      |            |  METRICS      |            |  TRACING      |
  |  JSON Structured|          |  Prometheus   |            |  OpenTelemetry|
  |  Request IDs  |            |  P95 Latency  |            |  End-to-End   |
  +---------------+            +---------------+            +---------------+
```

---

## 2. STRUCTURED LOG SPECIFICATION (JSON FORMAT)

All backend Express modules emit structured JSON log entries:

```json
{
  "timestamp": "2026-10-07T02:45:00.123Z",
  "level": "info",
  "requestId": "req_8f92a1b4c3d2e1f0",
  "service": "astu-ams-backend",
  "environment": "production",
  "userId": "usr_99218374",
  "role": "ICT_ADMIN",
  "method": "POST",
  "path": "/api/admin/system/firewall/block-ip",
  "statusCode": 200,
  "durationMs": 14.2,
  "clientIp": "197.156.92.14",
  "userAgent": "Mozilla/5.0...",
  "meta": {
    "action": "BLOCK_SUSPICIOUS_IP",
    "targetIp": "45.133.1.88"
  }
}
```

---

## 3. DISTRIBUTED REQUEST TRACING (`requestId`)

Every HTTP request entering ASTU-AMS is assigned a unique `X-Request-ID` header (or generated via `crypto.randomUUID()`).

1. **Correlation Lifecycle**:
   - HTTP Header `X-Request-ID` -> Express Middleware Context.
   - Attach `requestId` to every database query context, log line, Redis BullMQ background job payload, and downstream external API invocation.
   - SREs and Admins can query all trace logs for a specific request using `IctForensicsAuditPage.tsx`.
