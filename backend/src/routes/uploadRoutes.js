import { Router } from 'express';
import {
  uploadImage,
  createVideoLesson,
  uploadPDF,
  createPdfLesson,
  createQuiz,
  createExam,
  deleteUpload,
  getUploadStatus,
} from '../controllers/uploadController.js';
import { upload } from '../middleware/upload.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/roleCheck.js';

const router = Router();

router.use(protect, authorize('teacher', 'center_owner', 'admin'));

router.get('/status', getUploadStatus);
router.post('/image', upload.single('file'), uploadImage);
router.post('/video', createVideoLesson);
router.post('/pdf-link', createPdfLesson);
router.post('/pdf', upload.single('file'), uploadPDF);
router.post('/quiz', createQuiz);
router.post('/exam', createExam);
router.delete('/:publicId', deleteUpload);

export default router;
