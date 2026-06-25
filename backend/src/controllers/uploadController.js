import asyncHandler from 'express-async-handler';
import Video from '../models/Video.js';
import PDF from '../models/PDF.js';
import Quiz from '../models/Quiz.js';
import Exam from '../models/Exam.js';
import Course from '../models/Course.js';
import {
  storeUploadedFile,
  removeStoredFile,
  isCloudinaryConfigured,
} from '../utils/fileStorage.js';
import { validateVideoUrl } from '../utils/videoUrl.js';

// @desc    Upload image
// @route   POST /api/upload/image
export const uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('No file uploaded');
  }

  const result = await storeUploadedFile(req.file, 'images');

  res.json({
    success: true,
    url: result.url,
    publicId: result.publicId,
    storage: result.storage,
  });
});

// @desc    Add video lesson (Google Drive URL)
// @route   POST /api/upload/video
export const createVideoLesson = asyncHandler(async (req, res) => {
  const { courseId, title, description, url, order, isPreview } = req.body;

  if (!courseId || !title?.trim()) {
    res.status(400);
    throw new Error('Course and title are required');
  }

  const check = validateVideoUrl(url);
  if (!check.valid) {
    res.status(400);
    throw new Error(check.message);
  }

  const course = await Course.findById(courseId);
  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }

  const video = await Video.create({
    title: title.trim(),
    description: description?.trim() || '',
    url: check.url,
    course: courseId,
    order: Number(order) || 0,
    isPreview: isPreview === true || isPreview === 'true',
    uploadedBy: req.user._id,
  });

  await Course.findByIdAndUpdate(courseId, {
    $push: { videos: video._id },
  });

  res.status(201).json({ success: true, data: video });
});

// @desc    Upload PDF
// @route   POST /api/upload/pdf
export const uploadPDF = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('No PDF file received. Choose a .pdf file and try again.');
  }

  if (!req.body.courseId || !req.body.title?.trim()) {
    res.status(400);
    throw new Error('Course and title are required before uploading a PDF.');
  }

  const result = await storeUploadedFile(req.file, 'pdfs');

  const pdf = await PDF.create({
    title: req.body.title,
    description: req.body.description,
    url: result.url,
    cloudinaryId: result.publicId,
    course: req.body.courseId,
    order: req.body.order || 0,
    uploadedBy: req.user._id,
  });

  await Course.findByIdAndUpdate(req.body.courseId, {
    $push: { pdfs: pdf._id },
  });

  res.status(201).json({ success: true, data: pdf, storage: result.storage });
});

// @desc    Add PDF lesson (Google Drive URL)
// @route   POST /api/upload/pdf-link
export const createPdfLesson = asyncHandler(async (req, res) => {
  const { courseId, title, description, url, order } = req.body;

  if (!courseId || !title?.trim()) {
    res.status(400);
    throw new Error('Course and title are required');
  }

  const check = validateVideoUrl(url);
  if (!check.valid) {
    res.status(400);
    throw new Error(check.message);
  }

  const course = await Course.findById(courseId);
  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }

  const pdf = await PDF.create({
    title: title.trim(),
    description: description?.trim() || '',
    url: check.url,
    course: courseId,
    order: Number(order) || 0,
    uploadedBy: req.user._id,
  });

  await Course.findByIdAndUpdate(courseId, {
    $push: { pdfs: pdf._id },
  });

  res.status(201).json({ success: true, data: pdf });
});

// @desc    Create quiz manually
// @route   POST /api/upload/quiz
export const createQuiz = asyncHandler(async (req, res) => {
  const quiz = await Quiz.create({
    ...req.body,
    createdBy: req.user._id,
  });

  await Course.findByIdAndUpdate(req.body.course, {
    $push: { quizzes: quiz._id },
  });

  res.status(201).json({ success: true, data: quiz });
});

// @desc    Create exam manually
// @route   POST /api/upload/exam
export const createExam = asyncHandler(async (req, res) => {
  const exam = await Exam.create({
    ...req.body,
    createdBy: req.user._id,
  });

  await Course.findByIdAndUpdate(req.body.course, {
    $push: { exams: exam._id },
  });

  res.status(201).json({ success: true, data: exam });
});

// @desc    Delete uploaded file
// @route   DELETE /api/upload/:publicId
export const deleteUpload = asyncHandler(async (req, res) => {
  const resourceType = req.query.type || 'image';
  await removeStoredFile(req.params.publicId, resourceType);

  res.json({ success: true, message: 'File deleted' });
});

// @desc    Upload storage status (for dashboard UI)
// @route   GET /api/upload/status
export const getUploadStatus = asyncHandler(async (_req, res) => {
  res.json({
    success: true,
    storage: isCloudinaryConfigured() ? 'cloudinary' : 'local',
    message: isCloudinaryConfigured()
      ? 'Using Cloudinary for file storage'
      : 'Using local disk storage (development mode)',
  });
});
