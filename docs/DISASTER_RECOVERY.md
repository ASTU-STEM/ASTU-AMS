# ASTU-AMS — DISASTER RECOVERY PLAN

**System Component**: Adama Science and Technology University (ASTU) Alumni Management System  
**Recovery Targets**: RPO (Recovery Point Objective) < 15 Minutes | RTO (Recovery Time Objective) < 1 Hour  
**Governance Standard**: ISO 27031 / Enterprise Business Continuity Framework

---

## 1. RPO & RTO RECOVERY SLA MATRIX

| Incident Scenario | Target RPO | Target RTO | Disaster Recovery Strategy |
| :--- | :---: | :---: | :--- |
| **Primary DB Corruption** | < 5 Mins | < 15 Mins | Point-In-Time-Recovery (PITR) via Neon WAL streaming archives |
| **Complete Data Center Failure**| < 15 Mins | < 45 Mins | Failover DNS to Secondary AWS Region / Cloud Instance |
| **Redis Cache Outage** | 0 Mins | < 2 Mins | Re-spin Redis container; application degrades gracefully to DB |
| **Ransomware / Malicious Wipe** | < 1 Hour | < 2 Hours | Restore cold encrypted offsite S3 backup snapshot |

---

## 2. DISASTER RECOVERY STEPS

### Scenario A: PostgreSQL Primary Database Failover
1. Incident Commander activates DR protocol upon receiving consecutive 5xx error alerts.
2. Verify primary instance unreachability (`GET /health/database` times out).
3. Promote Read-Replica or trigger Neon automated failover endpoint:
   ```bash
   npx prisma migrate status --schema=backend/prisma/schema.prisma
   ```
4. Update database connection string environment variable (`DATABASE_URL`).
5. Restart API instances (`pm2 reload all` or Kubernetes pod rollout).
6. Perform sanity validation on `/health/ready`.
