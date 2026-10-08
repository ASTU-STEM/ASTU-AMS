# ASTU-AMS — PRODUCTION OPERATIONAL RUNBOOK

**System Component**: Adama Science and Technology University (ASTU) Alumni Management System  
**Target Operations**: System Deployment, Operational Maintenance, Emergency Response Procedures  
**Primary Operators**: ASTU System Administrators & ICT SRE Engineers

---

## 1. STANDARD OPERATIONAL PROCEDURES

### 1.1 First-Time Production Deployment
1. Verify prerequisite infrastructure (PostgreSQL 16, Redis 7, Node.js 20).
2. Configure `.env` environment variables using validated non-default production secrets.
3. Execute database migration setup:
   ```bash
   cd backend
   npx prisma migrate deploy
   ```
4. Build frontend & backend production artifacts:
   ```bash
   cd backend && npm run build
   cd ../frontend && npm run build
   ```
5. Start Node.js cluster processes under PM2 or Docker Compose:
   ```bash
   pm2 start ecosystem.config.js --env production
   ```

---

## 2. EMERGENCY OPERATIONAL PROCEDURES

### 2.1 Malicious IP Lockout Protocol
1. Log into ASTU ICT Operations Portal at `/ict/security-soc`.
2. Navigate to **Blocked & Blacklisted IPs**.
3. Input target malicious IP (e.g. `197.156.92.14`) and select **Block Suspicious IP**.
4. WAF will immediately drop matching HTTP requests across all API node instances.

### 2.2 Break Glass Emergency Access Elevation
1. Enter `/ict/security-soc`.
2. Select **Break Glass Emergency Access**.
3. Enter justification details (e.g., `Emergency database maintenance during critical outages`).
4. System issues elevated temporary session token with automatic 30-minute expiration timer.
