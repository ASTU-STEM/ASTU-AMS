# File Tree: src

**Generated:** 6/1/2026, 12:49:02 AM
**Root Path:** `c:\Users\sebon\OneDrive\Desktop\ASTU-AMS\backend\src`

```
├── 📁 core
│   ├── 📁 config
│   │   ├── 📄 db.ts
│   │   └── 📄 env.ts
│   ├── 📁 errors
│   │   └── 📄 ApiError.ts
│   ├── 📁 middleware
│   │   ├── 📄 auth.middleware.ts
│   │   ├── 📄 error.middleware.ts
│   │   └── 📄 role.middleware.ts
│   ├── 📁 types
│   └── 📁 utils
│       ├── 📄 asyncHandler.ts
│       ├── 📄 jwt.utils.ts
│       ├── 📄 logger.utils.ts
│       └── 📄 response.utils.ts
├── 📁 modules
│   ├── 📁 alumni
│   │   ├── 📁 application
│   │   │   ├── 📁 dto
│   │   │   ├── 📁 ports
│   │   │   │   ├── 📄 IAlumniProfileRepository.ts
│   │   │   │   ├── 📄 IAuditLogger.ts
│   │   │   │   ├── 📄 IDocumentRequestRepository.ts
│   │   │   │   └── 📄 IWorkExperienceRepository.ts
│   │   │   └── 📁 use-cases
│   │   │       ├── 📄 DocumentRequests.ts
│   │   │       ├── 📄 GetAlumniProfile.ts
│   │   │       ├── 📄 ManageWorkExperience.ts
│   │   │       ├── 📄 UpdateAlumniProfile.ts
│   │   │       └── 📄 UploadAlumniFiles.ts
│   │   ├── 📁 domain
│   │   │   ├── 📁 entities
│   │   │   │   └── 📄 Alumni.ts
│   │   │   ├── 📁 errors
│   │   │   │   └── 📄 AlumniErrors.ts
│   │   │   ├── 📁 events
│   │   │   └── 📁 value-objects
│   │   ├── 📁 infrastructure
│   │   │   ├── 📁 repositories
│   │   │   │   ├── 📄 PrismaAlumniProfileRepository.ts
│   │   │   │   ├── 📄 PrismaAuditLogger.ts
│   │   │   │   ├── 📄 PrismaDocumentRequestRepository.ts
│   │   │   │   └── 📄 PrismaWorkExperienceRepository.ts
│   │   │   ├── 📁 services
│   │   │   └── 📁 storage
│   │   ├── 📁 presentation
│   │   │   ├── 📁 controllers
│   │   │   ├── 📁 routes
│   │   │   ├── 📁 validators
│   │   │   ├── 📄 alumni.controller.ts
│   │   │   ├── 📄 alumni.routes.ts
│   │   │   └── 📄 alumni.validation.ts
│   │   └── 📁 tests
│   │       └── 📁 application
│   │           └── 📁 use-cases
│   │               ├── 📄 DocumentRequests.test.ts
│   │               ├── 📄 GetAlumniProfile.test.ts
│   │               ├── 📄 ManageWorkExperience.test.ts
│   │               ├── 📄 UpdateAlumniProfile.test.ts
│   │               └── 📄 UploadAlumniFiles.test.ts
│   ├── 📁 analytics
│   │   ├── 📁 application
│   │   │   ├── 📁 dto
│   │   │   ├── 📁 ports
│   │   │   │   └── 📄 IAnalyticsRepository.ts
│   │   │   └── 📁 use-cases
│   │   │       └── 📄 GetAnalyticsReport.ts
│   │   ├── 📁 domain
│   │   │   ├── 📁 entities
│   │   │   │   └── 📄 Analytics.ts
│   │   │   ├── 📁 errors
│   │   │   │   └── 📄 AnalyticsErrors.ts
│   │   │   ├── 📁 events
│   │   │   └── 📁 value-objects
│   │   ├── 📁 infrastructure
│   │   │   ├── 📁 repositories
│   │   │   │   └── 📄 PrismaAnalyticsRepository.ts
│   │   │   ├── 📁 services
│   │   │   └── 📁 storage
│   │   ├── 📁 presentation
│   │   │   ├── 📁 controllers
│   │   │   ├── 📁 routes
│   │   │   ├── 📁 validators
│   │   │   ├── 📄 analytics.controller.ts
│   │   │   └── 📄 analytics.routes.ts
│   │   └── 📁 tests
│   │       └── 📁 application
│   │           └── 📁 use-cases
│   │               └── 📄 GetAnalyticsReport.test.ts
│   ├── 📁 auth
│   │   ├── 📁 application
│   │   │   ├── 📁 dto
│   │   │   ├── 📁 ports
│   │   │   │   ├── 📄 IAuditLogRepository.ts
│   │   │   │   └── 📄 IUserRepository.ts
│   │   │   └── 📁 use-cases
│   │   │       ├── 📄 ActivateAlumni.ts
│   │   │       ├── 📄 LoginUser.ts
│   │   │       ├── 📄 LogoutUser.ts
│   │   │       ├── 📄 RefreshToken.ts
│   │   │       └── 📄 RegisterEmployer.ts
│   │   ├── 📁 domain
│   │   │   ├── 📁 entities
│   │   │   │   ├── 📄 AuditLog.ts
│   │   │   │   └── 📄 User.ts
│   │   │   ├── 📁 errors
│   │   │   │   └── 📄 AuthErrors.ts
│   │   │   ├── 📁 events
│   │   │   └── 📁 value-objects
│   │   ├── 📁 infrastructure
│   │   │   ├── 📁 repositories
│   │   │   │   ├── 📄 PrismaAuditLogRepository.ts
│   │   │   │   └── 📄 PrismaUserRepository.ts
│   │   │   ├── 📁 services
│   │   │   └── 📁 storage
│   │   ├── 📁 presentation
│   │   │   ├── 📁 controllers
│   │   │   ├── 📁 routes
│   │   │   ├── 📁 validators
│   │   │   ├── 📄 auth.controller.ts
│   │   │   ├── 📄 auth.routes.ts
│   │   │   └── 📄 auth.validation.ts
│   │   └── 📁 tests
│   │       └── 📁 application
│   │           └── 📁 use-cases
│   │               └── 📄 LoginUser.test.ts
│   ├── 📁 department
│   │   ├── 📁 application
│   │   │   ├── 📁 ports
│   │   │   │   ├── 📄 IAlumniDepartmentRepository.ts
│   │   │   │   ├── 📄 IDepartmentHeadRepository.ts
│   │   │   │   └── 📄 IDepartmentRepository.ts
│   │   │   └── 📁 use-cases
│   │   │       └── 📄 DepartmentLookups.ts
│   │   ├── 📁 domain
│   │   │   ├── 📁 entities
│   │   │   │   └── 📄 Department.ts
│   │   │   └── 📁 errors
│   │   │       └── 📄 DepartmentErrors.ts
│   │   ├── 📁 infrastructure
│   │   │   └── 📁 repositories
│   │   │       ├── 📄 PrismaAlumniDepartmentRepository.ts
│   │   │       ├── 📄 PrismaDepartmentHeadRepository.ts
│   │   │       └── 📄 PrismaDepartmentRepository.ts
│   │   ├── 📁 presentation
│   │   │   ├── 📄 department.controller.ts
│   │   │   └── 📄 department.routes.ts
│   │   └── 📁 tests
│   │       └── 📁 application
│   │           └── 📁 use-cases
│   │               └── 📄 DepartmentLookups.test.ts
│   ├── 📁 documents
│   │   ├── 📁 application
│   │   │   ├── 📁 ports
│   │   │   │   └── 📄 IDocumentRequestRepository.ts
│   │   │   └── 📁 use-cases
│   │   │       └── 📄 ManageDocuments.ts
│   │   ├── 📁 domain
│   │   │   ├── 📁 entities
│   │   │   │   └── 📄 Document.ts
│   │   │   └── 📁 errors
│   │   │       └── 📄 DocumentErrors.ts
│   │   ├── 📁 infrastructure
│   │   │   └── 📁 repositories
│   │   │       └── 📄 PrismaDocumentRequestRepository.ts
│   │   ├── 📁 presentation
│   │   │   ├── 📄 documents.controller.ts
│   │   │   ├── 📄 documents.routes.ts
│   │   │   └── 📄 documents.validation.ts
│   │   └── 📁 tests
│   │       └── 📁 application
│   │           └── 📁 use-cases
│   │               └── 📄 ManageDocuments.test.ts
│   ├── 📁 employer
│   │   ├── 📁 application
│   │   │   ├── 📁 dto
│   │   │   ├── 📁 ports
│   │   │   │   ├── 📄 IEmployerProfileRepository.ts
│   │   │   │   ├── 📄 IJobApplicationRepository.ts
│   │   │   │   └── 📄 IJobRepository.ts
│   │   │   └── 📁 use-cases
│   │   │       ├── 📄 ManageEmployerProfile.ts
│   │   │       ├── 📄 ManageJobApplications.ts
│   │   │       └── 📄 ManageJobs.ts
│   │   ├── 📁 domain
│   │   │   ├── 📁 entities
│   │   │   │   └── 📄 Employer.ts
│   │   │   ├── 📁 errors
│   │   │   │   └── 📄 EmployerErrors.ts
│   │   │   ├── 📁 events
│   │   │   └── 📁 value-objects
│   │   ├── 📁 infrastructure
│   │   │   ├── 📁 repositories
│   │   │   │   ├── 📄 PrismaEmployerProfileRepository.ts
│   │   │   │   ├── 📄 PrismaJobApplicationRepository.ts
│   │   │   │   └── 📄 PrismaJobRepository.ts
│   │   │   ├── 📁 services
│   │   │   └── 📁 storage
│   │   ├── 📁 presentation
│   │   │   ├── 📁 controllers
│   │   │   ├── 📁 routes
│   │   │   ├── 📁 validators
│   │   │   ├── 📄 employer.controller.ts
│   │   │   ├── 📄 employer.routes.ts
│   │   │   └── 📄 employer.validation.ts
│   │   └── 📁 tests
│   │       └── 📁 application
│   │           └── 📁 use-cases
│   │               ├── 📄 ManageEmployerProfile.test.ts
│   │               ├── 📄 ManageJobApplications.test.ts
│   │               └── 📄 ManageJobs.test.ts
│   ├── 📁 notifications
│   │   ├── 📁 application
│   │   │   ├── 📁 ports
│   │   │   │   └── 📄 INotificationRepository.ts
│   │   │   └── 📁 use-cases
│   │   │       └── 📄 ManageNotifications.ts
│   │   ├── 📁 domain
│   │   │   ├── 📁 entities
│   │   │   │   └── 📄 Notification.ts
│   │   │   └── 📁 errors
│   │   │       └── 📄 NotificationErrors.ts
│   │   ├── 📁 infrastructure
│   │   │   └── 📁 repositories
│   │   │       └── 📄 PrismaNotificationRepository.ts
│   │   ├── 📁 presentation
│   │   │   ├── 📄 notifications.controller.ts
│   │   │   ├── 📄 notifications.routes.ts
│   │   │   └── 📄 notifications.validation.ts
│   │   └── 📁 tests
│   │       └── 📁 application
│   │           └── 📁 use-cases
│   │               └── 📄 ManageNotifications.test.ts
│   ├── 📁 registrar
│   │   ├── 📁 application
│   │   │   ├── 📁 dto
│   │   │   ├── 📁 ports
│   │   │   │   ├── 📄 IGraduateRecordRepository.ts
│   │   │   │   ├── 📄 IRegistrarAlumniRepository.ts
│   │   │   │   └── 📄 ISyncLogRepository.ts
│   │   │   └── 📁 use-cases
│   │   │       ├── 📄 GraduateLookups.ts
│   │   │       ├── 📄 ImportGraduateData.ts
│   │   │       └── 📄 ManageAlumniStatus.ts
│   │   ├── 📁 domain
│   │   │   ├── 📁 entities
│   │   │   │   └── 📄 Registrar.ts
│   │   │   ├── 📁 errors
│   │   │   │   └── 📄 RegistrarErrors.ts
│   │   │   ├── 📁 events
│   │   │   └── 📁 value-objects
│   │   ├── 📁 infrastructure
│   │   │   ├── 📁 repositories
│   │   │   │   ├── 📄 PrismaGraduateRecordRepository.ts
│   │   │   │   ├── 📄 PrismaRegistrarAlumniRepository.ts
│   │   │   │   └── 📄 PrismaSyncLogRepository.ts
│   │   │   ├── 📁 services
│   │   │   └── 📁 storage
│   │   ├── 📁 presentation
│   │   │   ├── 📁 controllers
│   │   │   ├── 📁 routes
│   │   │   ├── 📁 validators
│   │   │   ├── 📄 registrar.controller.ts
│   │   │   ├── 📄 registrar.routes.ts
│   │   │   └── 📄 registrar.validation.ts
│   │   └── 📁 tests
│   │       └── 📁 application
│   │           └── 📁 use-cases
│   │               ├── 📄 GraduateLookups.test.ts
│   │               ├── 📄 ImportGraduateData.test.ts
│   │               └── 📄 ManageAlumniStatus.test.ts
│   └── 📁 surveys
│       ├── 📁 application
│       │   ├── 📁 ports
│       │   │   ├── 📄 ISurveyRepository.ts
│       │   │   └── 📄 ISurveyResponseRepository.ts
│       │   └── 📁 use-cases
│       │       ├── 📄 ManageSurveys.ts
│       │       └── 📄 SubmitSurveyResponse.ts
│       ├── 📁 domain
│       │   ├── 📁 entities
│       │   │   └── 📄 Survey.ts
│       │   └── 📁 errors
│       │       └── 📄 SurveyErrors.ts
│       ├── 📁 infrastructure
│       │   └── 📁 repositories
│       │       ├── 📄 PrismaSurveyRepository.ts
│       │       └── 📄 PrismaSurveyResponseRepository.ts
│       ├── 📁 presentation
│       │   ├── 📄 surveys.controller.ts
│       │   ├── 📄 surveys.routes.ts
│       │   └── 📄 surveys.validation.ts
│       └── 📁 tests
│           └── 📁 application
│               └── 📁 use-cases
│                   ├── 📄 ManageSurveys.test.ts
│                   └── 📄 SubmitSurveyResponse.test.ts
├── 📄 app.ts
└── 📄 server.ts
```

---
*Generated by FileTree Pro Extension*