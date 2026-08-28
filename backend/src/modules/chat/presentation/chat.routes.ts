import { Router } from 'express';
import { UnifiedChatController } from './chat.controller';
import { authenticateJWT } from '../../../core/middleware/auth.middleware';
import { asyncHandler } from '../../../core/utils/asyncHandler';

const router = Router();

router.use(authenticateJWT);

router.get('/contacts', asyncHandler(UnifiedChatController.getContacts));
router.get('/threads', asyncHandler(UnifiedChatController.getThreads));
router.post('/send', asyncHandler(UnifiedChatController.sendMessage));
router.post('/request-cv', asyncHandler(UnifiedChatController.requestCv));
router.post('/read', asyncHandler(UnifiedChatController.markAsRead));
router.delete('/message/:messageId', asyncHandler(UnifiedChatController.deleteMessage));
router.delete('/thread/:partnerId', asyncHandler(UnifiedChatController.deleteThread));

export default router;
