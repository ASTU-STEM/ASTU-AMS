import { Router } from 'express';
import { EmployerController } from './employer.controller';
import { authenticateJWT } from '../../../core/middleware/auth.middleware';
import { requireRoles } from '../../../core/middleware/role.middleware';
import { Role } from '@prisma/client';
import { asyncHandler } from '../../../core/utils/asyncHandler';
import multer from 'multer';

const upload = multer({ dest: 'uploads/resumes' });
const router = Router();

router.use(authenticateJWT);

// Alumni/Public job views & application
router.get('/jobs', requireRoles([Role.ALUMNI, Role.ADMIN]), asyncHandler(EmployerController.searchJobs));
router.post('/jobs/:jobId/apply', requireRoles([Role.ALUMNI, Role.ADMIN]), upload.single('resume'), asyncHandler(EmployerController.applyForJob));

// Dashboard (Employer, Admin, Registrar, Department Head for analytics)
router.get('/dashboard', requireRoles([Role.EMPLOYER, Role.ADMIN, Role.REGISTRAR, Role.DEPARTMENT_HEAD]), asyncHandler(EmployerController.getDashboardStats));

// Talent Search Engine (Employer and Admin)
router.get('/talent', requireRoles([Role.EMPLOYER, Role.ADMIN]), asyncHandler(EmployerController.searchTalent));
router.get('/talent/:alumniId', requireRoles([Role.EMPLOYER, Role.ADMIN]), asyncHandler(EmployerController.getAlumnusProfile));
router.post('/talent/:alumniId/message', requireRoles([Role.EMPLOYER, Role.ADMIN]), asyncHandler(EmployerController.messageAlumni));
router.post('/talent/:alumniId/request-cv', requireRoles([Role.EMPLOYER, Role.ADMIN]), asyncHandler(EmployerController.requestCv));

// Profile
router.post('/profile', requireRoles([Role.EMPLOYER, Role.ADMIN]), asyncHandler(EmployerController.createProfile));
router.get('/profile', requireRoles([Role.EMPLOYER, Role.ADMIN, Role.REGISTRAR]), asyncHandler(EmployerController.getProfile));
router.put('/profile', requireRoles([Role.EMPLOYER, Role.ADMIN]), asyncHandler(EmployerController.updateProfile));
router.delete('/profile', requireRoles([Role.EMPLOYER, Role.ADMIN]), asyncHandler(EmployerController.deleteProfile));

// Jobs Management
router.post('/jobs', requireRoles([Role.EMPLOYER, Role.ADMIN]), asyncHandler(EmployerController.createJob));
router.get('/my-jobs', requireRoles([Role.EMPLOYER, Role.ADMIN]), asyncHandler(EmployerController.getMyJobs));
router.put('/jobs/:jobId', requireRoles([Role.EMPLOYER, Role.ADMIN]), asyncHandler(EmployerController.updateJob));
router.delete('/jobs/:jobId', requireRoles([Role.EMPLOYER, Role.ADMIN]), asyncHandler(EmployerController.deleteJob));
router.post('/jobs/:jobId/publish', requireRoles([Role.EMPLOYER, Role.ADMIN]), asyncHandler(EmployerController.publishJob));
router.post('/jobs/:jobId/close', requireRoles([Role.EMPLOYER, Role.ADMIN]), asyncHandler(EmployerController.closeJob));
router.post('/jobs/:jobId/reopen', requireRoles([Role.EMPLOYER, Role.ADMIN]), asyncHandler(EmployerController.reopenJob));

// Applications Management
router.get('/applications', requireRoles([Role.EMPLOYER, Role.ADMIN]), asyncHandler(EmployerController.getApplications));
router.get('/applications/:applicationId', requireRoles([Role.EMPLOYER, Role.ADMIN]), asyncHandler(EmployerController.getApplicationDetail));
router.patch('/applications/:applicationId/status', requireRoles([Role.EMPLOYER, Role.ADMIN]), asyncHandler(EmployerController.updateApplicationStatus));
router.put('/applications/:applicationId/status', requireRoles([Role.EMPLOYER, Role.ADMIN]), asyncHandler(EmployerController.updateApplicationStatus));

// Interviews Management
router.post('/interviews', requireRoles([Role.EMPLOYER, Role.ADMIN]), asyncHandler(EmployerController.scheduleInterview));
router.get('/interviews', requireRoles([Role.EMPLOYER, Role.ADMIN]), asyncHandler(EmployerController.getEmployerInterviews));
router.put('/interviews/:interviewId', requireRoles([Role.EMPLOYER, Role.ADMIN]), asyncHandler(EmployerController.updateInterview));
router.delete('/interviews/:interviewId', requireRoles([Role.EMPLOYER, Role.ADMIN]), asyncHandler(EmployerController.cancelInterview));

// Feedback System
router.post('/feedback', requireRoles([Role.EMPLOYER, Role.ADMIN]), asyncHandler(EmployerController.submitFeedback));
router.post('/feedback/by-name', requireRoles([Role.EMPLOYER, Role.ADMIN]), asyncHandler(EmployerController.submitFeedbackByName));
router.get('/feedback', requireRoles([Role.EMPLOYER, Role.ADMIN, Role.REGISTRAR]), asyncHandler(EmployerController.getMyFeedbacks));

// Direct Messaging
router.get('/messages', requireRoles([Role.EMPLOYER, Role.ADMIN]), asyncHandler(EmployerController.getMessages));
router.post('/messages', requireRoles([Role.EMPLOYER, Role.ADMIN]), asyncHandler(EmployerController.sendMessage));

// Logo Upload
const logoUpload = multer({ dest: 'uploads/logos' });
router.post('/profile/logo', requireRoles([Role.EMPLOYER, Role.ADMIN]), logoUpload.single('logo'), asyncHandler(EmployerController.uploadLogo));

export default router;
