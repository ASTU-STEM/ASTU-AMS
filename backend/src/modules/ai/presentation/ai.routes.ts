import { Router } from 'express';
import multer from 'multer';
import { AIController } from './ai.controller';
import { KnowledgeController } from './knowledge.controller';
import { authenticateJWT } from '../../../core/middleware/auth.middleware';
import { requireRoles } from '../../../core/middleware/role.middleware';
import { Role } from '@prisma/client';
import { asyncHandler } from '../../../core/utils/asyncHandler';

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB limit
  fileFilter: (_req, file, cb) => {
    const allowed = ['application/pdf', 'text/plain', 'text/markdown', 'application/octet-stream'];
    const ext = file.originalname.split('.').pop()?.toLowerCase();
    if (allowed.includes(file.mimetype) || ['pdf', 'txt', 'md', 'doc', 'docx'].includes(ext || '')) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, text, and markdown documents are supported.'));
    }
  },
});

// ─── Unauthenticated Public Landing Page Chatbot Endpoints ───
router.post('/public-chat', asyncHandler(AIController.publicChat));
router.post('/public-chat-stream', asyncHandler(AIController.publicChatStream));

// ─── Authenticated Knowledge Management (Alumni Office, Admin, Registrar) ───
router.use(authenticateJWT);

router.post(
  '/knowledge/upload',
  requireRoles([Role.ADMIN, Role.ALUMNI_OFFICE, Role.REGISTRAR]),
  upload.single('file'),
  asyncHandler(KnowledgeController.uploadDocument)
);
router.post(
  '/knowledge/faq',
  requireRoles([Role.ADMIN, Role.ALUMNI_OFFICE, Role.REGISTRAR]),
  asyncHandler(KnowledgeController.createFaqEntry)
);
router.get(
  '/knowledge/documents',
  requireRoles([Role.ADMIN, Role.ALUMNI_OFFICE, Role.REGISTRAR]),
  asyncHandler(KnowledgeController.listDocuments)
);
router.get(
  '/knowledge/documents/:id',
  requireRoles([Role.ADMIN, Role.ALUMNI_OFFICE, Role.REGISTRAR]),
  asyncHandler(KnowledgeController.getDocumentDetails)
);
router.patch(
  '/knowledge/documents/:id/status',
  requireRoles([Role.ADMIN, Role.ALUMNI_OFFICE, Role.REGISTRAR]),
  asyncHandler(KnowledgeController.updateStatus)
);
router.delete(
  '/knowledge/documents/:id',
  requireRoles([Role.ADMIN, Role.ALUMNI_OFFICE, Role.REGISTRAR]),
  asyncHandler(KnowledgeController.deleteDocument)
);
router.post(
  '/knowledge/test-chat',
  requireRoles([Role.ADMIN, Role.ALUMNI_OFFICE, Role.REGISTRAR]),
  asyncHandler(KnowledgeController.adminTestQuery)
);

// ─── Admin / Alumni Office / Registrar AI Endpoints ───
router.post('/chat', requireRoles([Role.ADMIN, Role.ALUMNI_OFFICE, Role.REGISTRAR]), asyncHandler(AIController.chat));
router.post('/insights', requireRoles([Role.ADMIN, Role.ALUMNI_OFFICE, Role.REGISTRAR]), asyncHandler(AIController.generateInsightsSummary));
router.post('/reports/executive', requireRoles([Role.ADMIN, Role.ALUMNI_OFFICE, Role.REGISTRAR]), asyncHandler(AIController.generateExecutiveReport));
router.post('/reports/tracer', requireRoles([Role.ADMIN, Role.ALUMNI_OFFICE, Role.REGISTRAR]), asyncHandler(AIController.generateTracerReport));
router.post('/reports/accreditation', requireRoles([Role.ADMIN, Role.ALUMNI_OFFICE, Role.REGISTRAR]), asyncHandler(AIController.generateAccreditationReport));
router.post('/reports/curriculum', requireRoles([Role.ADMIN, Role.ALUMNI_OFFICE, Role.REGISTRAR]), asyncHandler(AIController.generateCurriculumReport));
router.get('/workflows', requireRoles([Role.ADMIN, Role.ALUMNI_OFFICE, Role.REGISTRAR]), asyncHandler(AIController.listMoeWorkflows));
router.post('/workflows/execute', requireRoles([Role.ADMIN, Role.ALUMNI_OFFICE, Role.REGISTRAR]), asyncHandler(AIController.executeMoeWorkflow));

export default router;

