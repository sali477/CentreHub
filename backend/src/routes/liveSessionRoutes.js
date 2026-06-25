import { Router } from 'express';
import {
  createLiveSession,
  quickStartLiveSession,
  getLiveSessions,
  getLiveSession,
  getLiveSessionByRoom,
  updateSessionStatus,
  joinLiveSession,
} from '../controllers/liveSessionController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/roleCheck.js';

const router = Router();

router.get('/', getLiveSessions);
router.get('/by-room/:roomId', getLiveSessionByRoom);
router.post('/quick', protect, authorize('teacher'), quickStartLiveSession);
router.get('/:id', getLiveSession);
router.post('/', protect, authorize('teacher'), createLiveSession);
router.put('/:id/status', protect, authorize('teacher', 'admin'), updateSessionStatus);
router.post('/:id/join', protect, joinLiveSession);

export default router;
