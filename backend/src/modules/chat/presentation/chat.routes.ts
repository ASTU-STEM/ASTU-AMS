import { Router } from 'express';
import { Role } from '@prisma/client';
import { UnifiedChatController } from './chat.controller';
import { authenticateJWT } from '../../../core/middleware/auth.middleware';
import { requireRoles } from '../../../core/middleware/role.middleware';
import { asyncHandler } from '../../../core/utils/asyncHandler';

const router = Router();

router.use(authenticateJWT);

// A CV request is recruiter-authored outreach. Restricting it stops any signed-in
// alumnus from using the endpoint to mail arbitrary members of the platform.
const recruiterRoles = [Role.EMPLOYER, Role.ADMIN, Role.SUPER_ADMIN, Role.ALUMNI_OFFICE, Role.REGISTRAR];

router.get('/contacts', asyncHandler(UnifiedChatController.getContacts));
router.get('/threads', asyncHandler(UnifiedChatController.getThreads));
router.post('/send', asyncHandler(UnifiedChatController.sendMessage));
router.post('/request-cv', requireRoles(recruiterRoles), asyncHandler(UnifiedChatController.requestCv));
router.post('/meeting-invite', asyncHandler(UnifiedChatController.sendMeetingInvite));
router.post('/read', asyncHandler(UnifiedChatController.markAsRead));
router.delete('/message/:messageId', asyncHandler(UnifiedChatController.deleteMessage));
router.delete('/thread/:partnerId', asyncHandler(UnifiedChatController.deleteThread));

export default router;
