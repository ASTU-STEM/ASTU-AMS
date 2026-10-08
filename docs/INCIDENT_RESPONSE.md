# ASTU-AMS — INCIDENT RESPONSE PLAN

**System Component**: Adama Science and Technology University (ASTU) Alumni Management System  
**Framework**: NIST SP 800-61 Rev. 2 Computer Security Incident Handling Guide  
**Escalation Lead**: ASTU ICT Security Operations Center (SOC) Lead

---

## 1. INCIDENT SEVERITY CLASSIFICATION

| Severity Level | Threshold Criteria | Response Time | Notification Targets |
| :--- | :--- | :---: | :--- |
| **SEV-1 (CRITICAL)** | Data breach, unauthorized root/admin access, total system outage | < 15 Mins | ICT Director, Lead SRE, Security SOC Team |
| **SEV-2 (HIGH)** | Core functional failure (Alumni login down, Registrar sync failing) | < 30 Mins | Lead Backend Engineer, System Administrator |
| **SEV-3 (MEDIUM)** | Non-blocking feature failure (PDF report export slow, single UI widget bug) | < 4 Hours | Development Team, QA Team |
| **SEV-4 (LOW)** | Aesthetic layout issue, minor log warning | < 24 Hours | Backlog Triage |

---

## 2. FOUR-PHASE RESPONSE WORKFLOW

```
  +--------------------+      +--------------------+
  | 1. DETECTION       | ---> | 2. CONTAINMENT     |
  | (WAF Alert / SOC)  |      | (Block IP / PAM)   |
  +--------------------+      +--------------------+
                                         |
                                         v
  +--------------------+      +--------------------+
  | 4. POST-MORTEM     | <--- | 3. ERADICATION     |
  | (RCA Report / Fix) |      | (Patch & Restore)  |
  +--------------------+      +--------------------+
```

1. **Detection & Analysis**:
   - Automated triggers via `AuditLog` error frequency, SOC Dashboard status metrics, and WAF probe alerts.
   - Trace exact request execution path using `requestId` correlation tags.

2. **Containment & Mitigation**:
   - **Immediate IP Lockout**: Add attacker IP to `BLOCKED_IPS` system setting using `IctSecuritySocPage.tsx`.
   - **Emergency Access Revocation**: Terminate active admin sessions via `IctPoliciesSessionsPage.tsx`.

3. **Eradication & Recovery**:
   - Deploy code hotfix or pull compromised API container node offline.
   - Verify integrity of PostgreSQL tables using checksum comparison.

4. **Post-Mortem & Incident Logging**:
   - Generate Incident Record under `IctIncidentsPage.tsx`.
   - Document Root Cause Analysis (RCA) and file preventative action items.
