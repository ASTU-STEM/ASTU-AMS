# ASTU-AMS — MONITORING & ALERTING SPECIFICATION

**System Component**: Adama Science and Technology University (ASTU) Alumni Management System  
**Integration Stack**: Prometheus Metrics Exporter + Grafana Dashboard + PostgreSQL System Telemetry  
**Target SLAs**: 99.9% Uptime | P95 API Latency < 300ms | 0 Security Bypass Incidents

---

## 1. KEY TELEMETRY METRICS

| Metric Name | Type | Description | Alert Condition |
| :--- | :--- | :--- | :--- |
| `http_requests_total` | Counter | Total HTTP requests by path, method, and status code | N/A |
| `http_request_duration_seconds` | Histogram | Request latency distribution across endpoints | P95 > 500ms over 5 mins |
| `db_connection_pool_active` | Gauge | Active connections currently in PostgreSQL pool | > 85% pool capacity |
| `redis_connected_clients` | Gauge | Active Redis client connections | Sudden drop to 0 |
| `bullmq_queue_waiting_jobs` | Gauge | Backlogged asynchronous background tasks | > 500 queued jobs |
| `owasp_security_probes_blocked` | Counter | WAF blocked malicious payloads | Spike > 50 probes/min |

---

## 2. AUTOMATED ALERT RULES

```yaml
groups:
  - name: astu_ams_alerts
    rules:
      - alert: HighAPIErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) / rate(http_requests_total[5m]) > 0.05
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "API Error rate exceeds 5% on ASTU-AMS backend"

      - alert: PostgreSQLConnectionExhaustion
        expr: db_connection_pool_active / 100 > 0.90
        for: 1m
        labels:
          severity: warning
        annotations:
          summary: "PostgreSQL pool reaching connection limits"

      - alert: SecurityBruteForceSpike
        expr: increase(owasp_security_probes_blocked[5m]) > 100
        for: 1m
        labels:
          severity: high
        annotations:
          summary: "Potential DDoS or Brute-Force probe detected by WAF"
```
