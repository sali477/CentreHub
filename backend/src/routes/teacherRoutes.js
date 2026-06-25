import { Router } from 'express';
import {
  getTeachers,
  getTeacher,
  getMyTeacher,
  getTeacherByCode,
  createTeacherProfile,
  joinCenter,
  createIndependentAcademy,
  updateTeacher,
  getTeacherStudents,
} from '../controllers/teacherController.js';
import { getTeacherDiscussions } from '../controllers/discussionController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/roleCheck.js';

const router = Router();

router.get('/', getTeachers);
router.get('/my', protect, authorize('teacher', 'admin'), getMyTeacher);
router.get('/my/discussions', protect, authorize('teacher', 'admin'), getTeacherDiscussions);
router.get('/code/:teacherCode', getTeacherByCode);
router.get('/:id', getTeacher);
router.get('/:id/students', protect, authorize('teacher', 'admin'), getTeacherStudents);
router.post('/', protect, createTeacherProfile);
router.post('/join-center', protect, authorize('teacher', 'student'), joinCenter);
router.post('/independent-academy', protect, authorize('teacher'), createIndependentAcademy);
router.put('/:id', protect, authorize('teacher', 'admin'), updateTeacher);

export default router;
