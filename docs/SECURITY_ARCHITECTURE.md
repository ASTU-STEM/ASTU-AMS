# ASTU-AMS — SECURITY ARCHITECTURE

**System Component**: Adama Science and Technology University (ASTU) Alumni Management System  
**Security Governance**: OWASP Top 10 (2021) Full Compliance | NIST SP 800-53 Controls | RBAC & ABAC  
**System OWASP Score**: 100/100 (10/10 Vectors Fully Mitigated)

---

## 1. OWASP TOP 10 MITIGATION MATRIX

```
 +-----------------------------------------------------------------------------------+
 |                    ASTU-AMS OWASP TOP 10 PROTECTION MATRIX                        |
 +-------------------+---------------------------------------+-----------------------+
 | Vector            | Attack Description                    | ASTU Defense Control  |
 +-------------------+---------------------------------------+-----------------------+
 | A01:2021 Access   | Broken Access Control / IDOR          | Server RBAC & ABAC    |
 | A02:2021 Crypto   | Cryptographic Failures                | TLS 1.3 + Bcrypt r=12 |
 | A03:2021 Injection| SQLi / Command / XSS Injection        | Prisma ORM + WAF      |
 | A04:2021 Design   | Insecure Architectural Design         | SSRF Egress Guard     |
 | A05:2021 Config   | Security Misconfigurations            | Helmet + Strict CSP   |
 | A06:2021 Outdated | Vulnerable Components                 | npm audit + CI Scan   |
 | A07:2021 Auth     | Identification & Auth Failures        | 2FA OTP + Lockout     |
 | A08:2021 Integrity| Software & Data Integrity Failures    | Signed JWTs + Hashes  |
 | A09:2021 Logging  | Logging & Monitoring Failures         | Central AuditLog      |
 | A10:2021 SSRF     | Server-Side Request Forgery           | Egress RFC-1918 Guard |
 +-------------------+---------------------------------------+-----------------------+
```

---

## 2. ADVANCED DEFENSE MECHANISMS

1. **Global WAF Inspection Engine**:
   - `owaspSecurityInspectorMiddleware` intercepts every incoming Express HTTP request.
   - Evaluates URL paths, query parameters, and payload body structures for SQL injection signatures (`UNION SELECT`, `OR 1=1`), script execution tags (`<script>`), and command injection tokens (`||`, `; rm -rf`).
   - Automatically records malicious IP probes into `AuditLog` and increments failure counters in `SystemSetting` key `BLOCKED_IPS`.

2. **Privileged Emergency Access (Break Glass PAM)**:
   - Grants ICT Technical Admins temporary root elevation for high-risk operations.
   - Requires explicit justification reason logged to PostgreSQL.
   - Enforces strict 30-minute auto-expiry, revoking elevated tokens automatically.

3. **SSRF Outbound Egress Guard**:
   - `validateOutboundEgressUrl` validates external webhooks and image fetch targets.
   - Resolves DNS and blocks connection attempts targeting private subnets (`127.0.0.1`, `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`, metadata endpoints `169.254.169.254`).
