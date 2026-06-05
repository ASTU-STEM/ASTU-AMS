# Alumni Management System - Complete Testing Guide

## 🎯 Quick Start

**Server Status:** ✅ Running on http://localhost:5000

---

## 📍 API Endpoints Reference

### Authentication Endpoints

#### 1. Alumni Registration
- **URL:** `POST /api/auth/register`
- **Public:** ✅ Yes
- **Required Headers:** `Content-Type: application/json`

#### 2. Verify Email Code
- **URL:** `POST /api/auth/register/verify-email`
- **Public:** ✅ Yes
- **Required Headers:** `Content-Type: application/json`

#### 3. National ID Verification
- **URL:** `POST /api/auth/register/verify-national-id`
- **Public:** ✅ Yes
- **Required Headers:** `Content-Type: application/json`

#### 4. Login (All Users except Employer)
- **URL:** `POST /api/auth/login`
- **Public:** ✅ Yes
- **Supported Roles:** ADMIN, ALUMNI, REGISTRAR, DEPARTMENT_HEAD

#### 5. Admin Create User
- **URL:** `POST /api/auth/admin/create-user`
- **Protected:** ✅ Yes (ADMIN role required)
- **Required Headers:** `Authorization: Bearer <token>`

#### 6. Employer Login
- **URL:** `POST /api/auth/employer/login`
- **Public:** ✅ Yes

### Registrar Endpoints

#### 7. Fetch Graduating Class
- **URL:** `POST /api/registrar/fetch-graduates/:year`
- **Protected:** ✅ Yes (REGISTRAR/ADMIN roles)
- **Required Headers:** `Authorization: Bearer <token>`
- **URL Parameter:** `year` (e.g., 2023, 2024)

---

## 🧪 Step-by-Step Test Scenarios

### Scenario 1: Complete Alumni Registration Flow

**Step 1: Register Alumni (Create Account)**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "studentId": "STU001",
    "fullName": "Alice Johnson",
    "password": "SecurePass123!",
    "phone": "+251911234567"
  }'
```

**Expected Response (200):**
```json
{
  "success": true,
  "data": {
    "studentId": "STU001",
    "email": "alice@alumni.edu.et",
    "verificationCodeSent": true,
    "message": "Verification code sent to registered student email. Valid for 15 minutes."
  }
}
```

**What Happened:**
- ✅ Found AlumniProfile with studentId=STU001
- ✅ Validated fullName matches profile
- ✅ Generated 6-digit verification code
- ✅ Stored pending password hash
- ✅ Code sent to: alice@alumni.edu.et

---

**Step 2: Verify Email Code (Activate Account)**
```bash
curl -X POST http://localhost:5000/api/auth/register/verify-email \
  -H "Content-Type: application/json" \
  -d '{
    "studentId": "STU001",
    "code": "123456"
  }'
```

**Expected Response (200):**
```json
{
  "success": true,
  "data": {
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "email": "alice@alumni.edu.et",
    "status": "ACTIVE",
    "message": "Alumni account activated successfully. You can now login."
  }
}
```

**What Happened:**
- ✅ Validated code (must be same code from Step 1)
- ✅ Code not expired (within 15 minutes)
- ✅ Created User record with ALUMNI role
- ✅ Linked User to AlumniProfile
- ✅ Set AlumniProfile.status = ACTIVE
- ✅ Alumni account is now active

---

**Step 3: Login with Alumni Account**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alice@alumni.edu.et",
    "password": "SecurePass123!"
  }'
```

**Expected Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "alice@alumni.edu.et",
      "role": "ALUMNI",
      "isActive": true
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**What Happened:**
- ✅ Found User by email
- ✅ Verified password matches
- ✅ User is active
- ✅ Generated JWT tokens
- ✅ Alumni can now access protected endpoints

---

### Scenario 2: National ID Verification (Alternative Flow)

**If alumni forget their password, they can verify via National ID**

```bash
curl -X POST http://localhost:5000/api/auth/register/verify-national-id \
  -H "Content-Type: application/json" \
  -d '{
    "studentId": "STU002",
    "nationalId": "ET-1234567-01",
    "password": "NewSecurePass456!"
  }'
```

**Expected Response (200):**
```json
{
  "success": true,
  "data": {
    "userId": "550e8400-e29b-41d4-a716-446655440001",
    "email": "bob@alumni.edu.et",
    "status": "ACTIVE",
    "message": "National ID verification succeeded. Alumni account activated."
  }
}
```

**What Happened:**
- ✅ Verified national ID with DiditService
- ✅ Compared name from national ID with AlumniProfile
- ✅ Set verificationChannel = 'NATIONAL_ID'
- ✅ Account activated with new password

---

### Scenario 3: Admin Creates Registrar Account

**Admin user creates account for registrar staff**

```bash
curl -X POST http://localhost:5000/api/auth/admin/create-user \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "registrar@astu.edu.et",
    "role": "REGISTRAR"
  }'
```

**Expected Response (200):**
```json
{
  "success": true,
  "data": {
    "userId": "550e8400-e29b-41d4-a716-446655440002",
    "email": "registrar@astu.edu.et",
    "role": "REGISTRAR",
    "temporaryPassword": "Kq7mN2pB9xL",
    "message": "User created successfully. Temporary password sent via email."
  }
}
```

**What Happened:**
- ✅ Verified admin authorization
- ✅ Generated random 12-char password
- ✅ Created User with REGISTRAR role
- ✅ Set isActive = true immediately
- ✅ Credentials sent via email
- ✅ Audit log recorded

---

### Scenario 4: Registrar Fetches Graduate Data

**Registrar syncs graduating class from registrar API**

```bash
curl -X POST http://localhost:5000/api/registrar/fetch-graduates/2023 \
  -H "Authorization: Bearer <REGISTRAR_TOKEN>" \
  -H "Content-Type: application/json"
```

**Expected Response (200):**
```json
{
  "success": true,
  "data": {
    "year": 2023,
    "totalFetched": 2,
    "syncResults": {
      "created": 2,
      "updated": 0,
      "failed": 0
    }
  }
}
```

**What Happened:**
- ✅ Verified registrar authorization
- ✅ Fetched graduates from API for year 2023
- ✅ Created AlumniProfile records
- ✅ Set status = INACTIVE for all
- ✅ Stored: studentId, fullName, email, graduationYear, department

---

## 🔍 Error Test Cases

### Test Case 1: Invalid Student ID
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "studentId": "NONEXISTENT",
    "fullName": "Test User",
    "password": "Password123"
  }'
```

**Expected Response (404):**
```json
{
  "success": false,
  "message": "Student profile not found",
  "error": "PROFILE_NOT_FOUND"
}
```

---

### Test Case 2: Wrong Verification Code
```bash
curl -X POST http://localhost:5000/api/auth/register/verify-email \
  -H "Content-Type: application/json" \
  -d '{
    "studentId": "STU001",
    "code": "000000"
  }'
```

**Expected Response (400):**
```json
{
  "success": false,
  "message": "Invalid verification code",
  "error": "INVALID_CODE"
}
```

---

### Test Case 3: Expired Verification Code
```bash
# Wait 16+ minutes after registration, then:
curl -X POST http://localhost:5000/api/auth/register/verify-email \
  -H "Content-Type: application/json" \
  -d '{
    "studentId": "STU001",
    "code": "123456"
  }'
```

**Expected Response (400):**
```json
{
  "success": false,
  "message": "Verification code has expired",
  "error": "CODE_EXPIRED"
}
```

---

### Test Case 4: Unauthorized Admin Action
```bash
curl -X POST http://localhost:5000/api/auth/admin/create-user \
  -H "Authorization: Bearer <ALUMNI_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@astu.edu.et",
    "role": "REGISTRAR"
  }'
```

**Expected Response (403):**
```json
{
  "success": false,
  "message": "Insufficient permissions",
  "error": "FORBIDDEN"
}
```

---

### Test Case 5: Login with Wrong Password
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alice@alumni.edu.et",
    "password": "WrongPassword123"
  }'
```

**Expected Response (401):**
```json
{
  "success": false,
  "message": "Invalid email or password",
  "error": "INVALID_CREDENTIALS"
}
```

---

## 📊 Data Validation Tests

### Validation Rule 1: Full Name Match
**Must match exactly (case-insensitive, trimmed)**
```bash
# This will FAIL if AlumniProfile.fullName != "Alice Johnson"
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "studentId": "STU001",
    "fullName": "alice  johnson",  # Trimmed, lowercase
    "password": "Password123"
  }'
```

---

### Validation Rule 2: Password Requirements
```bash
# Must meet password strength requirements
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "studentId": "STU001",
    "fullName": "Alice Johnson",
    "password": "123"  # TOO SHORT
  }'
```

**Expected Response (400):**
```json
{
  "success": false,
  "message": "Password must be at least 8 characters",
  "error": "VALIDATION_ERROR"
}
```

---

### Validation Rule 3: Email Format
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "not-an-email",
    "password": "Password123"
  }'
```

**Expected Response (400):**
```json
{
  "success": false,
  "message": "Invalid email format",
  "error": "VALIDATION_ERROR"
}
```

---

## 🔐 Security Tests

### Test Case 1: JWT Token Expiration
After token expires, protected endpoints should return 401:
```bash
# Token expires after 24 hours (configured in .env)
curl -X POST http://localhost:5000/api/registrar/fetch-graduates/2023 \
  -H "Authorization: Bearer <EXPIRED_TOKEN>" \
  -H "Content-Type: application/json"
```

**Expected Response (401):**
```json
{
  "success": false,
  "message": "Token expired",
  "error": "UNAUTHORIZED"
}
```

---

### Test Case 2: Password Not in Response
Verify passwords are never returned in API responses:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alice@alumni.edu.et",
    "password": "SecurePass123!"
  }'
```

**Verify:** Response should NOT contain `password` field ✅

---

### Test Case 3: Verification Code Not in Response
Verify codes are never sent in plaintext responses:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "studentId": "STU001",
    "fullName": "Alice Johnson",
    "password": "Password123"
  }'
```

**Verify:** Response should NOT contain verification code ✅

---

## 📈 Performance Benchmarks

### Expected Response Times
| Endpoint | Response Time |
|----------|---------------|
| Register Alumni | < 500ms |
| Verify Email | < 300ms |
| Login | < 400ms |
| Admin Create User | < 600ms |
| Fetch Graduates | < 1000ms |

### Test with Apache Bench
```bash
# Requires Apache Bench to be installed
ab -n 100 -c 10 http://localhost:5000/api/auth/login
```

---

## 📋 Checklist for Complete Testing

- [ ] Alumni Registration Flow (Steps 1-3)
- [ ] National ID Verification Flow
- [ ] Admin Creates User
- [ ] Registrar Fetches Graduates
- [ ] Invalid Student ID Test
- [ ] Wrong Verification Code Test
- [ ] Expired Code Test
- [ ] Unauthorized Action Test
- [ ] Wrong Password Test
- [ ] Full Name Match Validation
- [ ] Password Requirements Validation
- [ ] Email Format Validation
- [ ] Token Expiration Test
- [ ] Password Not in Response
- [ ] Code Not in Response
- [ ] Performance Benchmarks
- [ ] Database Records Verified
- [ ] Audit Logs Recorded
- [ ] Email Notifications Sent
- [ ] All Status Codes Correct

---

## 🐛 Debugging Tips

### View Server Logs
```bash
# Server logs are printed to console
# Look for [INFO], [ERROR], [WARN] prefixes
```

### Check Database State
```bash
# Use Prisma Studio
npx prisma studio

# Query directly
SELECT * FROM "User" WHERE email = 'alice@alumni.edu.et';
SELECT * FROM "AlumniProfile" WHERE "studentId" = 'STU001';
```

### Test with Different Verification Codes
```bash
# Code must be exactly 6 digits
# Valid: "123456", "000000", "999999"
# Invalid: "12345" (5 digits), "1234567" (7 digits)
```

### Check JWT Token Content
```bash
# Decode JWT at https://jwt.io
# or use online JWT decoder
# Verify: payload contains userId, role, email
```

---

## 🎓 Learning Resources

### API Architecture
- Endpoints follow REST conventions
- Use HTTP verbs correctly (POST for creation)
- Status codes indicate response type

### Authentication Flow
- Registration creates pending state
- Verification activates account
- Login issues JWT tokens
- Tokens expire for security

### Database Relationships
- User → AlumniProfile (one-to-one)
- Department → AlumniProfile (one-to-many)
- User → AuditLog (one-to-many)

---

**Last Updated:** June 2024  
**Status:** Ready for Testing ✅
