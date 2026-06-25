import { Router } from 'express';
import { groqChat } from '../controllers/chatController.js';

const router = Router();

router.post('/', groqChat);

export default router;
