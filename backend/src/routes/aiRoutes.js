import { Router } from 'express';
import {
  getAIStatus,
  generalChat,
  smartSearch,
  getRecommendations,
  courseAssistant,
  generateQuiz,
  studyPlanner,
  chatbot,
  summarizeContent,
} from '../controllers/aiController.js';
import {
  listConversations,
  createConversation,
  getConversation,
  deleteConversation,
} from '../controllers/aiConversationController.js';
import { protect } from '../middleware/auth.js';
import { optionalAuth } from '../middleware/auth.js';

const router = Router();

router.get('/status', getAIStatus);
router.get('/conversations', protect, listConversations);
router.post('/conversations', protect, createConversation);
router.get('/conversations/:id', protect, getConversation);
router.delete('/conversations/:id', protect, deleteConversation);
router.post('/chat', optionalAuth, generalChat);
router.post('/smart-search', optionalAuth, smartSearch);
router.post('/chatbot', optionalAuth, chatbot);
router.get('/recommendations', protect, getRecommendations);
router.post('/assistant', optionalAuth, courseAssistant);
router.post('/generate-quiz', protect, generateQuiz);
router.post('/study-planner', protect, studyPlanner);
router.post('/summarize', protect, summarizeContent);

export default router;
