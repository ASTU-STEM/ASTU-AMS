# ASTU-AMS Backend API Contract v1.0

> **Status:** Implementation Blueprint  
> **Base URL:** `http://localhost:5000/api`  
> **Auth:** JWT Bearer Token (access + refresh token rotation)  
> **Content-Type:** `application/json`

---

## 1. Authentication & Authorization

### Flow
```
Frontend Login Form → POST /api/auth/login → JWT Token Pair Stored
→ Every Request carries Authorization: Bearer <accessToken>
→ On 401 → POST /api/auth/refresh → New Token Pair
→ On Logout → POST /api/auth/logout → Revoke Tokens
```

### Endpoints

#### `POST /api/auth/login`
Authenticate any user (alumni, employer, registrar, admin).

**Request:**
```json
{
  "emailOrStudentId": "abebe@astu.edu.et",
  "password": "SecureP@ss123",
  "rememberMe": false
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "alum-001",
      "email": "abebe@astu.edu.et",
      "fullName": "Abebe Bikila",
      "role": "ALUMNI",
      "studentId": "ATR/1234/23",
      "department": "Computer Science",
      "avatarUrl": null
    },
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "dGhpcyBpcyBhIHJlZnJl..."
  }
}
```

**Error (401):**
```json
{
  "success": false,
  "message": "Invalid email/student ID or password"
}
```

---

#### `POST /api/auth/register`
Alumni self-registration (pending approval).

**Request:**
```json
{
  "fullName": "Abebe Bikila",
  "studentId": "ATR/1234/23",
  "email": "abebe@astu.edu.et",
  "password": "SecureP@ss123",
  "confirmPassword": "SecureP@ss123",
  "department": "Computer Science",
  "batch": "2023",
  "phone": "+251911123456",
  "activationCode": "ASTU-2024-ACT-XXXX"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Registration submitted successfully. Pending admin approval."
}
```

---

#### `POST /api/auth/refresh`
Refresh expired access token.

**Request:**
```json
{
  "refreshToken": "dGhpcyBpcyBhIHJlZnJl..."
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "bmV3IHJlZnJl..."
  }
}
```

---

#### `POST /api/auth/logout`
Invalidate current session.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

#### `GET /api/auth/me`
Get current authenticated user profile.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "alum-001",
    "email": "abebe@astu.edu.et",
    "fullName": "Abebe Bikila",
    "role": "ALUMNI",
    "studentId": "ATR/1234/23",
    "department": "Computer Science",
    "avatarUrl": "https://storage.astu.edu.et/avatars/alum-001.jpg"
  }
}
```

---

#### `POST /api/auth/forgot-password`
Request password reset link.

**Request:**
```json
{
  "email": "abebe@astu.edu.et"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Password reset link sent to your email"
}
```

---

#### `POST /api/auth/reset-password`
Reset password using token from email.

**Request:**
```json
{
  "token": "reset-token-from-email",
  "newPassword": "NewSecureP@ss456"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

---

## 2. Alumni Module

#### `GET /api/alumni/me`
Get authenticated alumni's own profile.

**Headers:** `Authorization: Bearer <token>`  
**Role:** `ALUMNI`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "alum-001",
    "userId": "user-001",
    "studentId": "ATR/1234/23",
    "fullName": "Abebe Bikila",
    "email": "abebe@astu.edu.et",
    "phone": "+251911123456",
    "department": "Computer Science",
    "graduationYear": 2023,
    "cgpa": 3.75,
    "currentRole": "Software Engineer",
    "company": "Ethio Telecom",
    "salaryRange": "20,000 - 35,000 ETB",
    "employmentStatus": "Employed Full-Time",
    "location": "Addis Ababa, Ethiopia",
    "bio": "Full-stack developer with 2 years experience...",
    "skills": ["JavaScript", "React", "Python", "Node.js", "Docker"],
    "socialLinks": {
      "linkedin": "https://linkedin.com/in/abebe-bikila",
      "github": "https://github.com/abebebikila",
      "twitter": "https://twitter.com/abebebikila",
      "website": "https://abebebikila.dev"
    },
    "avatarUrl": "https://storage.astu.edu.et/avatars/alum-001.jpg",
    "profileCompletion": 85,
    "isVerified": true,
    "createdAt": "2024-01-15T10:00:00Z",
    "updatedAt": "2026-03-01T14:30:00Z"
  }
}
```

---

#### `PUT /api/alumni/me`
Update alumni profile.

**Headers:** `Authorization: Bearer <token>`  
**Role:** `ALUMNI`

**Request:**
```json
{
  "phone": "+251911123456",
  "currentRole": "Senior Software Engineer",
  "company": "Ethio Telecom",
  "salaryRange": "35,000 - 50,000 ETB",
  "employmentStatus": "Employed Full-Time",
  "location": "Addis Ababa, Ethiopia",
  "bio": "Full-stack developer with 4 years experience...",
  "skills": ["JavaScript", "React", "Python", "Node.js", "Docker", "Kubernetes"],
  "socialLinks": {
    "linkedin": "https://linkedin.com/in/abebe-bikila",
    "github": "https://github.com/abebebikila"
  }
}
```

---

#### `POST /api/alumni/avatar`
Upload profile avatar.

**Headers:** `Authorization: Bearer <token>`  
**Content-Type:** `multipart/form-data`

**Request:** `file` (image/jpeg, image/png, max 5MB)

---

#### `GET /api/alumni/directory`
Browse/search alumni directory.  
**Query params:** `?page=1&limit=20&search=Abebe&department=Computer%20Science&graduationYear=2023&skill=React`

**Headers:** `Authorization: Bearer <token>`  
**Roles:** `ALUMNI`, `EMPLOYER`, `DEPARTMENT_HEAD`, `ADMIN`

---

## 3. Employer Module

#### `GET /api/employers/profile`
Get employer company profile.  
**Role:** `EMPLOYER`

#### `PUT /api/employers/profile`
Update company profile.  
**Role:** `EMPLOYER`

```json
{
  "companyName": "Tech Corp PLC",
  "industry": "Technology",
  "size": "50-200",
  "website": "https://techcorp.et",
  "description": "Leading tech company...",
  "location": "Addis Ababa, Ethiopia",
  "logo": "https://storage...",
  "contactEmail": "hr@techcorp.et",
  "contactPhone": "+251911000000"
}
```

---

#### `GET /api/employers/talent-search`
Search alumni candidates.  
**Query params:** `?skills=React,Python&department=CS&minExperience=2`

---

#### `POST /api/employers/feedback`
Submit graduate competency feedback.  
**Role:** `EMPLOYER`

```json
{
  "graduateId": "alum-001",
  "competencyRating": 4.5,
  "communicationRating": 4.0,
  "technicalRating": 4.5,
  "overallRating": 4.3,
  "comments": "Strong problem-solving skills...",
  "recommendedHire": true
}
```

---

## 4. Job Board Module

#### `GET /api/jobs`
List all published jobs.  
**Query params:** `?page=1&limit=20&search=Engineer&type=FULL_TIME&department=CS&experienceLevel=ENTRY`

#### `GET /api/jobs/:id`
Get job details.

#### `POST /api/jobs`
Create job posting.  
**Role:** `EMPLOYER`, `ADMIN`

```json
{
  "title": "Senior Software Engineer",
  "type": "FULL_TIME",
  "category": "Engineering",
  "department": "Computer Science",
  "description": "We are looking for...",
  "requirements": ["5+ years React", "Node.js", "Cloud"],
  "salaryMin": 35000,
  "salaryMax": 50000,
  "currency": "ETB",
  "location": "Addis Ababa",
  "applicationDeadline": "2026-07-15",
  "experienceLevel": "SENIOR"
}
```

---

#### `PUT /api/jobs/:id`
Update job posting.  
**Roles:** `EMPLOYER` (own jobs), `ADMIN`

#### `DELETE /api/jobs/:id`
Soft-delete job posting.  
**Roles:** `EMPLOYER` (own jobs), `ADMIN`

#### `POST /api/jobs/:id/apply`
Apply to a job.  
**Role:** `ALUMNI`

```json
{
  "coverLetter": "I am excited to apply..."
}
```

#### `GET /api/jobs/:id/applications`
List applications for a job.  
**Roles:** `EMPLOYER` (own jobs), `ADMIN`

#### `PUT /api/applications/:id/status`
Update application status.  
**Roles:** `EMPLOYER` (own jobs), `ADMIN`

```json
{
  "status": "SHORTLISTED",
  "notes": "Impressive background, schedule interview"
}
```

---

## 5. Survey / Tracer Study Module

#### `GET /api/surveys`
List available surveys for current user.  
**Role:** `ALUMNI`

#### `GET /api/surveys/:id`
Get survey questions.

#### `POST /api/surveys/:id/submit`
Submit survey responses.

```json
{
  "responses": [
    { "questionId": "q-001", "answer": "Employed Full-Time" },
    { "questionId": "q-002", "answer": "Software Engineer" },
    { "questionId": "q-003", "answer": "Ethio Telecom" },
    { "questionId": "q-004", "answer": "20,000 - 35,000 ETB" },
    { "questionId": "q-005", "answer": "6 months" }
  ]
}
```

---

#### `GET /api/surveys/admin`
List all surveys (with stats).  
**Roles:** `ADMIN`, `DEPARTMENT_HEAD`, `REGISTRAR`

#### `POST /api/surveys/admin`
Create new survey.  
**Role:** `ADMIN`

```json
{
  "title": "6-Month Graduate Tracer Study 2026",
  "description": "Help us understand your employment status...",
  "targetInterval": 6,
  "targetDepartments": ["Computer Science", "Software Engineering"],
  "targetGraduationYears": ["2025"],
  "questions": [
    {
      "text": "What is your current employment status?",
      "type": "SINGLE_CHOICE",
      "options": ["Employed Full-Time", "Employed Part-Time", "Unemployed", "Student", "Entrepreneur"],
      "required": true
    },
    {
      "text": "Current job title",
      "type": "TEXT",
      "required": false
    }
  ],
  "startDate": "2026-03-01",
  "endDate": "2026-04-30"
}
```

---

#### `GET /api/surveys/:id/responses`
Get survey responses/analytics.  
**Roles:** `ADMIN`, `DEPARTMENT_HEAD`, `REGISTRAR`

---

## 6. Registrar Module

#### `GET /api/registrar/graduates`
List all graduate records.  
**Query params:** `?page=1&limit=20&department=CS&graduationYear=2024&search=Abebe`

**Role:** `REGISTRAR`, `ADMIN`

---

#### `POST /api/registrar/import`
Import graduate records (CSV/Excel).

**Content-Type:** `multipart/form-data`  
**Role:** `REGISTRAR`, `ADMIN`

**Expected CSV Format:**
```csv
studentId,fullName,email,department,graduationYear,cgpa,phone
ATR/1234/23,Abebe Bikila,abebe@astu.edu.et,Computer Science,2023,3.75,+251911123456
```

---

#### `GET /api/registrar/verifications`
List pending verification requests.  
**Role:** `REGISTRAR`, `ADMIN`

#### `PUT /api/registrar/verifications/:id`
Process a verification request.  

```json
{
  "status": "APPROVED",
  "notes": "Credentials verified against SIS records"
}
```

---

#### `GET /api/registrar/document-requests`
List document requests (transcripts, certificates).  
**Role:** `REGISTRAR`, `ADMIN`

#### `PUT /api/registrar/document-requests/:id`
Update document request status.

```json
{
  "status": "PROCESSING",
  "notes": "Document is being prepared"
}
```

---

## 7. Department Module

#### `GET /api/departments/analytics`
Get department-level employment analytics.  
**Roles:** `DEPARTMENT_HEAD`, `ADMIN`

**Query params:** `?department=Computer%20Science&from=2024&to=2026`

**Response:**
```json
{
  "success": true,
  "data": {
    "totalGraduates": 245,
    "employed": 198,
    "employmentRate": 80.8,
    "averageTimeToHire": 4.2,
    "averageSalary": "18,500 ETB",
    "topEmployers": ["Ethio Telecom", "INSA", "Huawei"],
    "salaryDistribution": [
      { "range": "< 5,000", "count": 12, "percentage": 6 },
      { "range": "5,000 - 10,000", "count": 35, "percentage": 18 },
      { "range": "10,000 - 20,000", "count": 68, "percentage": 34 },
      { "range": "20,000 - 35,000", "count": 45, "percentage": 23 },
      { "range": "> 35,000", "count": 38, "percentage": 19 }
    ],
    "monthlyTrend": [
      { "month": "2026-01", "employed": 180, "unemployed": 25, "inEducation": 15 },
      { "month": "2026-02", "employed": 185, "unemployed": 22, "inEducation": 13 }
    ]
  }
}
```

---

#### `GET /api/departments/skill-gaps`
Get skill gap analysis.  
**Roles:** `DEPARTMENT_HEAD`, `ADMIN`

#### `GET /api/departments/employer-feedback`
Get employer feedback aggregated by department.  
**Roles:** `DEPARTMENT_HEAD`, `ADMIN`

#### `GET /api/departments/tracer-reports`
Get tracer study reports for department.  
**Roles:** `DEPARTMENT_HEAD`, `ADMIN`

#### `GET /api/departments/curriculum-insights`
Get curriculum alignment insights based on feedback.  
**Roles:** `DEPARTMENT_HEAD`, `ADMIN`

---

## 8. Analytics Module

#### `GET /api/analytics/employment-rate`
Employment rate by department.  
**Roles:** `ADMIN`, `DEPARTMENT_HEAD`

#### `GET /api/analytics/time-to-hire`
Average time-to-hire by department.  

#### `GET /api/analytics/salary-distribution`
Salary distribution across all departments.  

#### `GET /api/analytics/top-employers`
Top hiring companies.  

#### `GET /api/analytics/skill-gaps`
Cross-department skill gap analysis.  

#### `GET /api/analytics/tracer-response`
Tracer survey response rates.  

#### `GET /api/analytics/dashboard`
Aggregated dashboard data for university leadership.  

---

## 9. Notifications Module

#### `GET /api/notifications`
Get user notifications.  
**Query params:** `?page=1&limit=20&unreadOnly=true`

#### `PUT /api/notifications/:id/read`
Mark notification as read.  

#### `PUT /api/notifications/read-all`
Mark all notifications as read.  

#### `DELETE /api/notifications/:id`
Delete a notification.  

#### `POST /api/notifications/admin`
Create system-wide notification.  
**Role:** `ADMIN`

```json
{
  "title": "Tracer Study 2026",
  "message": "The 6-month tracer survey is now open...",
  "type": "SURVEY",
  "audience": "ALUMNI",
  "channel": "BOTH"
}
```

---

## 10. Events Module

#### `GET /api/events`
List events.  
**Query params:** `?upcoming=true&type=WORKSHOP&page=1&limit=10`

#### `POST /api/events`
Create event.  
**Roles:** `ADMIN`, `EMPLOYER`

```json
{
  "title": "ASTU Career Expo 2026",
  "description": "Annual career fair...",
  "type": "CAREER_FAIR",
  "date": "2026-06-30T09:00:00Z",
  "endDate": "2026-06-30T17:00:00Z",
  "location": "Main Campus, Adama",
  "maxAttendees": 500,
  "registrationDeadline": "2026-06-25T23:59:59Z"
}
```

#### `POST /api/events/:id/register`
Register for event.  
**Role:** `ALUMNI`

#### `GET /api/events/:id/attendees`
List event attendees.  
**Roles:** `ADMIN`, `EMPLOYER` (own events)

---

## 11. Document Requests Module

#### `POST /api/documents/request`
Submit document request.  
**Role:** `ALUMNI`

```json
{
  "type": "TRANSCRIPT",
  "notes": "Need for international university application"
}
```

#### `GET /api/documents/requests`
Get user's document requests.  

#### `POST /api/documents/upload`
Upload signed/stamped document.  
**Role:** `REGISTRAR`

**Content-Type:** `multipart/form-data`

---

## 12. Admin Module

#### `GET /api/admin/users`
List all users.  
**Query params:** `?page=1&limit=20&role=ALUMNI&status=active&search=Abebe`  
**Role:** `ADMIN`

#### `PUT /api/admin/users/:id`
Update user status/role.  

```json
{
  "role": "ALUMNI",
  "isActive": true,
  "department": "Computer Science"
}
```

#### `DELETE /api/admin/users/:id`
Deactivate/delete user.  

#### `GET /api/admin/departments`
List departments.  

#### `POST /api/admin/departments`
Create department.  

#### `GET /api/admin/roles`
List roles & permissions.  

#### `PUT /api/admin/roles/:id`
Update role permissions.  

#### `GET /api/admin/logs`
View system audit logs.  
**Query params:** `?page=1&limit=50&from=2026-01-01&to=2026-06-01&action=login`

#### `GET /api/admin/backup`
Trigger system backup.  

#### `GET /api/admin/settings`
Get system settings.  

#### `PUT /api/admin/settings`
Update system settings.  

---

## 13. Donations Module

#### `GET /api/donations/campaigns`
List active fundraising campaigns.  

#### `POST /api/donations/campaigns`
Create campaign.  
**Role:** `ADMIN`

```json
{
  "title": "ASTU Scholarship Fund 2026",
  "description": "Support underprivileged engineering students...",
  "goal": 5000000,
  "currency": "ETB",
  "category": "Scholarship",
  "endDate": "2026-12-31"
}
```

#### `POST /api/donations/pay`
Process donation via Telebirr.

```json
{
  "campaignId": "camp-001",
  "amount": 5000,
  "currency": "ETB",
  "paymentMethod": "TELEBIRR",
  "anonymous": false
}
```

---

## 14. Messaging Module

#### `GET /api/messages`
Get conversation list.  
**Query params:** `?page=1&limit=20`

#### `GET /api/messages/:conversationId`
Get messages in a conversation.  

#### `POST /api/messages`
Send a message.  

```json
{
  "receiverId": "alum-002",
  "subject": "Mentorship opportunity",
  "body": "Hello, I would like to connect..."
}
```

#### `PUT /api/messages/:id/read`
Mark message as read.  

---

## 15. Mentorship Module

#### `GET /api/mentorship/mentors`
List available mentors.  
**Query params:** `?department=CS&industry=Technology`

#### `POST /api/mentorship/request`
Request mentorship connection.  

```json
{
  "mentorId": "alum-010",
  "message": "I am interested in learning about AI..."
}
```

#### `PUT /api/mentorship/request/:id`
Accept/reject mentorship request.  

```json
{
  "status": "CONNECTED"
}
```

#### `GET /api/mentorship/sessions`
List mentorship sessions.  

#### `POST /api/mentorship/sessions`
Schedule mentorship session.  

```json
{
  "mentorId": "alum-010",
  "date": "2026-06-15T14:00:00Z",
  "duration": 60,
  "topic": "Career guidance in AI",
  "notes": "Discussing career paths..."
}
```

---

## 16. Gallery/Media Module

#### `GET /api/gallery`
List gallery images.  
**Query params:** `?page=1&limit=12&category=Events`

#### `POST /api/gallery`
Upload gallery image.  
**Role:** `ADMIN`

**Content-Type:** `multipart/form-data`

#### `DELETE /api/gallery/:id`
Delete gallery image.  
**Role:** `ADMIN`

---

## 17. Homepage Management Module

#### `GET /api/homepage`
Get homepage content (slides, stats, announcements).  
**Public**

#### `PUT /api/homepage`
Update homepage content.  
**Role:** `ADMIN`

```json
{
  "slides": [
    { "image": "url", "tagline": "...", "title": "...", "description": "..." }
  ],
  "stats": [
    { "label": "Alumni", "value": "1,238+", "icon": "Users" }
  ],
  "announcements": [
    { "title": "...", "content": "...", "type": "Alumni Announcement" }
  ]
}
```

---

## 18. Data Models (Prisma Schema Blueprint)

```prisma
enum UserRole {
  ALUMNI
  EMPLOYER
  REGISTRAR
  DEPARTMENT_HEAD
  ADMIN
  SUPER_ADMIN
}

model User {
  id           String   @id @default(uuid())
  email        String   @unique
  passwordHash String
  firstName    String
  lastName     String
  role         UserRole
  isActive     Boolean  @default(false)
  avatarUrl    String?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  alumniProfile    AlumniProfile?
  employerProfile  EmployerProfile?
  sentMessages     Message[]          @relation("SentMessages")
  receivedMessages Message[]          @relation("ReceivedMessages")
  notifications    Notification[]
  surveyResponses  SurveyResponse[]
  jobApplications  JobApplication[]
  mentorshipMentor Mentorship[]       @relation("Mentor")
  mentorshipMentee Mentorship[]       @relation("Mentee")
  documentRequests DocumentRequest[]
  donations        Donation[]
  eventRegistrations EventRegistration[]
  sessions         Session[]
}

model AlumniProfile {
  id               String   @id @default(uuid())
  userId           String   @unique
  user             User     @relation(fields: [userId], references: [id])
  studentId        String   @unique
  department       String?
  graduationYear   Int?
  cgpa             Float?
  currentRole      String?
  company          String?
  salaryRange      String?
  employmentStatus String?
  phone            String?
  location         String?
  bio              String?
  skills           String[]
  socialLinks      Json?
  profileCompletion Int     @default(0)
  isVerified       Boolean  @default(false)
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
}

model EmployerProfile {
  id           String   @id @default(uuid())
  userId       String   @unique
  user         User     @relation(fields: [userId], references: [id])
  companyName  String
  industry     String?
  size         String?
  website      String?
  description  String?
  logo         String?
  location     String?
  contactEmail String?
  contactPhone String?
  isVerified   Boolean  @default(false)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  jobs         Job[]
  feedback     EmployerFeedback[]
}

model Department {
  id        String   @id @default(uuid())
  name      String   @unique
  code      String   @unique
  headId    String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Job {
  id                 String   @id @default(uuid())
  employerId         String
  employer           EmployerProfile @relation(fields: [employerId], references: [id])
  title              String
  type               JobType
  category           String?
  department         String?
  description        String
  requirements       String[]
  salaryMin          Float?
  salaryMax          Float?
  currency           String   @default("ETB")
  location           String?
  applicationDeadline DateTime?
  experienceLevel    ExperienceLevel
  status             JobStatus @default(PUBLISHED)
  applicationsCount  Int      @default(0)
  postedAt           DateTime @default(now())
  updatedAt          DateTime @updatedAt

  applications JobApplication[]
}

enum JobType { FULL_TIME PART_TIME CONTRACT INTERNSHIP REMOTE }
enum ExperienceLevel { ENTRY MID SENIOR LEAD }
enum JobStatus { DRAFT PUBLISHED CLOSED FILLED }

model JobApplication {
  id         String            @id @default(uuid())
  jobId      String
  job        Job               @relation(fields: [jobId], references: [id])
  userId     String
  user       User              @relation(fields: [userId], references: [id])
  coverLetter String?
  status     ApplicationStatus @default(PENDING)
  notes      String?
  appliedAt  DateTime          @default(now())
  updatedAt  DateTime          @updatedAt
}

enum ApplicationStatus { PENDING REVIEWING SHORTLISTED INTERVIEWED OFFERED ACCEPTED REJECTED WITHDRAWN }

model Survey {
  id                String   @id @default(uuid())
  title             String
  description       String?
  targetInterval    Int?
  targetDepartments String[]
  targetGraduationYears String[]
  startDate         DateTime?
  endDate           DateTime?
  isActive          Boolean  @default(true)
  createdBy         String
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  questions SurveyQuestion[]
  responses SurveyResponse[]
}

model SurveyQuestion {
  id        String   @id @default(uuid())
  surveyId  String
  survey    Survey   @relation(fields: [surveyId], references: [id])
  text      String
  type      QuestionType
  options   String[]
  required  Boolean  @default(true)
  order     Int
}

enum QuestionType { TEXT SINGLE_CHOICE MULTIPLE_CHOICE RATING DROPDOWN DATE }

model SurveyResponse {
  id         String   @id @default(uuid())
  surveyId   String
  survey     Survey   @relation(fields: [surveyId], references: [id])
  userId     String
  user       User     @relation(fields: [userId], references: [id])
  answers    Json
  submittedAt DateTime @default(now())
}

model EmployerFeedback {
  id                 String   @id @default(uuid())
  employerId         String
  employer           EmployerProfile @relation(fields: [employerId], references: [id])
  graduateId         String
  competencyRating   Float?
  communicationRating Float?
  technicalRating    Float?
  overallRating      Float?
  comments           String?
  recommendedHire    Boolean?
  createdAt          DateTime @default(now())
}

model Notification {
  id        String   @id @default(uuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  title     String
  message   String
  type      NotificationType
  isRead    Boolean  @default(false)
  link      String?
  createdAt DateTime @default(now())
}

enum NotificationType { SURVEY JOB EVENT MESSAGE MENTORSHIP DOCUMENT SYSTEM DONATION }

model Event {
  id                  String   @id @default(uuid())
  title               String
  description         String?
  type                EventType
  date                DateTime
  endDate             DateTime?
  location            String?
  maxAttendees        Int?
  registrationDeadline DateTime?
  createdBy           String
  isActive            Boolean  @default(true)
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt

  registrations EventRegistration[]
}

enum EventType { CAREER_FAIR WORKSHOP SEMINAR NETWORKING REUNION WEBINAR }

model EventRegistration {
  id        String   @id @default(uuid())
  eventId   String
  event     Event    @relation(fields: [eventId], references: [id])
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  registeredAt DateTime @default(now())
  attended  Boolean  @default(false)
}

model DocumentRequest {
  id          String         @id @default(uuid())
  userId      String
  user        User           @relation(fields: [userId], references: [id])
  type        DocumentType
  status      DocumentStatus @default(PENDING)
  notes       String?
  fileUrl     String?
  processedBy String?
  createdAt   DateTime       @default(now())
  updatedAt   DateTime       @updatedAt
}

enum DocumentType { TRANSCRIPT CERTIFICATE VERIFICATION_LETTER ENROLLMENT_VERIFICATION RECOMMENDATION }
enum DocumentStatus { PENDING PROCESSING READY DELIVERED REJECTED }

model Message {
  id         String   @id @default(uuid())
  senderId   String
  sender     User     @relation("SentMessages", fields: [senderId], references: [id])
  receiverId String
  receiver   User     @relation("ReceivedMessages", fields: [receiverId], references: [id])
  subject    String?
  body       String
  isRead     Boolean  @default(false)
  createdAt  DateTime @default(now())
}

model Mentorship {
  id           String         @id @default(uuid())
  mentorId     String
  mentor       User           @relation("Mentor", fields: [mentorId], references: [id])
  menteeId     String
  mentee       User           @relation("Mentee", fields: [menteeId], references: [id])
  status       MentorshipStatus @default(PENDING)
  message      String?
  connectedAt  DateTime?
  createdAt    DateTime       @default(now())
  updatedAt    DateTime       @updatedAt

  sessions MentorshipSession[]
}

enum MentorshipStatus { PENDING ACCEPTED REJECTED COMPLETED }

model MentorshipSession {
  id          String   @id @default(uuid())
  mentorshipId String
  mentorship  Mentorship @relation(fields: [mentorshipId], references: [id])
  date        DateTime
  duration    Int?
  topic       String?
  notes       String?
  meetLink    String?
  status      SessionStatus @default(SCHEDULED)
  createdAt   DateTime @default(now())
}

enum SessionStatus { SCHEDULED COMPLETED CANCELLED }

model Donation {
  id          String   @id @default(uuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  campaignId  String?
  amount      Float
  currency    String   @default("ETB")
  paymentMethod String?
  anonymous   Boolean  @default(false)
  status      DonationStatus @default(PENDING)
  createdAt   DateTime @default(now())
}

enum DonationStatus { PENDING COMPLETED FAILED REFUNDED }

model Session {
  id           String   @id @default(uuid())
  userId       String
  user         User     @relation(fields: [userId], references: [id])
  refreshToken String   @unique
  userAgent    String?
  ipAddress    String?
  expiresAt    DateTime
  createdAt    DateTime @default(now())
}

model AuditLog {
  id         String   @id @default(uuid())
  userId     String?
  action     String
  entity     String?
  entityId   String?
  details    Json?
  ipAddress  String?
  createdAt  DateTime @default(now())
}

model SystemSetting {
  id    String @id @default(uuid())
  key   String @unique
  value Json
}
```

---

## 19. Frontend ↔ Backend Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React)                         │
│                                                                 │
│  pages/     →   features/    →   services/    →   API Layer     │
│  (UI Views)     (Components)     (API Calls)     (Axios)        │
│       │              │               │               │          │
│       ▼              ▼               ▼               ▼          │
│  User Action → Dispatch → service.method() → axios.get/post    │
│                                                    │           │
└────────────────────────────────────────────────────┼───────────┘
                                                     │
                                          HTTP (JSON)
                                                     │
┌────────────────────────────────────────────────────┼───────────┐
│                    BACKEND (Node.js/Express)        │           │
│                                                     ▼           │
│  Routes → Controller → Service → Repository → Prisma → DB      │
│    │          │            │           │            │           │
│    ▼          ▼            ▼           ▼            ▼           │
│  Validation  Auth       Business    Database     PostgreSQL    │
│  (Zod/Joi)  (JWT)       Logic       Access                     │
└─────────────────────────────────────────────────────────────────┘
```

### Key Integration Points

| Frontend File | Backend Endpoint | Method |
|---|---|---|
| `features/auth/services/auth.service.ts` | `/api/auth/*` | POST/GET |
| `features/alumni/services/alumni.service.ts` | `/api/alumni/*` | GET/PUT |
| `features/employers/services/employer.service.ts` | `/api/employers/*` | GET/PUT/POST |
| `features/registrar/services/registrar.service.ts` | `/api/registrar/*` | GET/POST/PUT |
| `features/jobs/services/mockJobsData.ts` | `/api/jobs/*` | GET/POST/PUT/DELETE |
| `features/surveys/services/survey.service.ts` | `/api/surveys/*` | GET/POST |
| `features/analytics/` | `/api/analytics/*` | GET |
| `features/notifications/` | `/api/notifications/*` | GET/PUT/DELETE |
| `services/api.ts` | Base Axios instance | All |

---

## 20. Environment Variables

```env
# Backend
PORT=5000
DATABASE_URL="postgresql://user:password@localhost:5432/astu_ams"
JWT_SECRET="your-jwt-secret-key-here"
JWT_EXPIRES_IN="1h"
JWT_REFRESH_EXPIRES_IN="7d"
CORS_ORIGIN="http://localhost:5173"
UPLOAD_DIR="./uploads"
MAX_FILE_SIZE=5242880

# Email (for notifications)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="noreply@astu.edu.et"
SMTP_PASS="your-app-password"

# Telebirr API
TELEBIRR_API_KEY="your-telebirr-api-key"
TELEBIRR_MERCHANT_ID="astu-ams-001"

# Frontend
VITE_API_URL="http://localhost:5000/api"
```

---

## 21. Error Response Format

All API errors follow this structure:

```json
{
  "success": false,
  "message": "Human-readable error message",
  "error": "Machine-readable error code (optional)",
  "errors": [
    {
      "field": "email",
      "message": "Email is required"
    }
  ]
}
```

### HTTP Status Codes Used
- `200` — Success
- `201` — Created
- `400` — Bad Request (validation error)
- `401` — Unauthorized
- `403` — Forbidden (wrong role)
- `404` — Not Found
- `409` — Conflict (duplicate)
- `422` — Unprocessable Entity
- `429` — Too Many Requests
- `500` — Internal Server Error
