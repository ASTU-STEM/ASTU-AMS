# ASTU-AMS — API ARCHITECTURE & SPECIFICATION

**System Component**: Adama Science and Technology University (ASTU) Alumni Management System  
**API Standard**: RESTful Express Services with OpenAPI 3.0 Alignment  
**Authentication**: Bearer JWT RSA-256 + Role-Based Access Control (RBAC) Middleware

---

## 1. STANDARDIZED API RESPONSE ENVELOPE

All ASTU-AMS endpoints enforce a predictable, consistent JSON response envelope:

### Success Response (`HTTP 200 OK / 201 Created`)
```json
{
  "success": true,
  "statusCode": 200,
  "requestId": "req_a1b2c3d4e5f6",
  "timestamp": "2026-10-07T02:46:00.000Z",
  "data": {
    "alumniId": "alm_88291039",
    "firstName": "Abebe",
    "lastName": "Bikila",
    "graduationYear": 2022
  },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 1
  }
}
```

### Error Response (`HTTP 400 / 401 / 403 / 404 / 429 / 500`)
```json
{
  "success": false,
  "statusCode": 403,
  "requestId": "req_a1b2c3d4e5f6",
  "timestamp": "2026-10-07T02:46:00.000Z",
  "error": {
    "code": "AUTHORIZATION_ERROR",
    "message": "Insufficient permissions to access this administrative resource.",
    "details": null
  }
}
```

---

## 2. API ENDPOINT REGISTRY

| Endpoint Path | HTTP Method | Min Role Required | Rate Limit | Purpose |
| :--- | :---: | :---: | :---: | :--- |
| `/api/auth/login` | `POST` | Public | 5 req / min | User authentication & JWT issuance |
| `/api/auth/verify-2fa` | `POST` | Public | 3 req / min | TOTP 2FA code verification |
| `/api/alumni/profile` | `GET` | `ALUMNI` | 60 req / min | Retrieve active alumni profile |
| `/api/jobs` | `GET` | Authenticated | 120 req / min | Search & filter job postings |
| `/api/admin/technical-ops/security-status` | `GET` | `ICT_ADMIN` | 60 req / min | SOC OWASP matrix & live telemetry |
| `/api/admin/system/firewall/block-ip` | `POST` | `ICT_ADMIN` | 20 req / min | Dynamic WAF IP restriction update |
| `/api/admin/system/break-glass` | `POST` | `SUPER_ADMIN` | 2 req / hour | Privileged PAM emergency elevation |
