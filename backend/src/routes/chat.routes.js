import { Router } from 'express';
import { getConversation, listConversations } from '../controllers/chat.controller.js';
import { verifyJWT } from '../middleware/auth.middleware.js';

const router = Router();

router.use(verifyJWT);
router.get('/', listConversations);
router.get('/:otherUserId', getConversation);

export default router;
