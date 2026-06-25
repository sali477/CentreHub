import asyncHandler from 'express-async-handler';
import Enrollment from '../models/Enrollment.js';
import Course from '../models/Course.js';
import LiveSession from '../models/LiveSession.js';
import Quiz from '../models/Quiz.js';
import Exam from '../models/Exam.js';
import { createEnrollmentRecord } from '../utils/enrollmentHelpers.js';
import { findTeacherByCode } from '../utils/teacherCode.js';

// @desc    Enroll in independent course (direct enrollment)
// @route   POST /api/enrollments
export const enrollInCourse = asyncHandler(async (req, res) => {
  const { courseId } = req.body;

  const course = await Course.findById(courseId);
  if (!course || !course.isPublished) {
    res.status(404);
    throw new Error('Course not found');
  }

  if (course.center && !course.isIndependent) {
    res.status(400);
    throw new Error('Center courses require a teacher code. Use POST /api/enrollments/join-by-code');
  }

  const enrollment = await createEnrollmentRecord(req.user._id, course);
  res.status(201).json({ success: true, data: enrollment });
});

// @desc    Enroll in center course using teacher code
// @route   POST /api/enrollments/join-by-code
export const enrollByTeacherCode = asyncHandler(async (req, res) => {
  const { teacherCode, courseId } = req.body;

  if (!teacherCode || !courseId) {
    res.status(400);
    throw new Error('Teacher code and course ID are required');
  }

  const teacher = await findTeacherByCode(teacherCode);
  if (!teacher || !teacher.center) {
    res.status(404);
    throw new Error('Invalid teacher code or teacher is not linked to a center');
  }

  const course = await Course.findOne({
    _id: courseId,
    teacher: teacher._id,
    center: teacher.center._id,
    isPublished: true,
  });

  if (!course) {
    res.status(404);
    throw new Error('Course not found for this teacher');
  }

  const enrollment = await createEnrollmentRecord(req.user._id, course, {
    teacherId: teacher._id,
  });

  res.status(201).json({ success: true, data: enrollment });
});

// @desc    Get user enrollments
// @route   GET /api/enrollments/my
export const getMyEnrollments = asyncHandler(async (req, res) => {
  const enrollments = await Enrollment.find({ student: req.user._id })
    .populate({
      path: 'course',
      populate: [
        { path: 'teacher', populate: { path: 'user', select: 'name avatar' } },
        { path: 'center', select: 'name logo' },
      ],
    })
    .sort('-enrolledAt');

  const courseIds = enrollments.map((e) => e.course?._id).filter(Boolean);

  if (courseIds.length > 0) {
    const [sessions, quizzes, exams] = await Promise.all([
      LiveSession.find({ course: { $in: courseIds } })
        .select('title description scheduledAt duration status roomId jitsiRoomName meetingUrl course')
        .sort('scheduledAt')
        .lean(),
      Quiz.find({ course: { $in: courseIds } })
        .select('title timeLimit description createdAt updatedAt course')
        .lean(),
      Exam.find({ course: { $in: courseIds } })
        .select('title duration passingScore scheduledAt description createdAt course')
        .lean(),
    ]);

    const groupByCourse = (items) => {
      const map = {};
      items.forEach((item) => {
        const cid = item.course.toString();
        if (!map[cid]) map[cid] = [];
        const { course, ...rest } = item;
        map[cid].push(rest);
      });
      return map;
    };

    const sessionsByCourse = groupByCourse(sessions);
    const quizzesByCourse = groupByCourse(quizzes);
    const examsByCourse = groupByCourse(exams);

    enrollments.forEach((enrollment) => {
      if (!enrollment.course) return;
      const cid = enrollment.course._id.toString();
      enrollment.course.set('liveSessions', sessionsByCourse[cid] || []);
      enrollment.course.set('quizzes', quizzesByCourse[cid] || []);
      enrollment.course.set('exams', examsByCourse[cid] || []);
    });
  }

  res.json({ success: true, data: enrollments });
});

// @desc    Update progress
// @route   PUT /api/enrollments/:id/progress
export const updateProgress = asyncHandler(async (req, res) => {
  const enrollment = await Enrollment.findById(req.params.id);

  if (!enrollment) {
    res.status(404);
    throw new Error('Enrollment not found');
  }

  if (enrollment.student.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized');
  }

  const { type, itemId } = req.body;
  const progressField = {
    video: 'completedVideos',
    pdf: 'completedPdfs',
    quiz: 'completedQuizzes',
    exam: 'completedExams',
  }[type];

  if (progressField && itemId) {
    if (!enrollment.progress[progressField].includes(itemId)) {
      enrollment.progress[progressField].push(itemId);
    }
  }

  const course = await Course.findById(enrollment.course);
  const totalItems =
    (course?.videos?.length || 0) +
    (course?.pdfs?.length || 0) +
    (course?.quizzes?.length || 0) +
    (course?.exams?.length || 0);

  const completedItems =
    enrollment.progress.completedVideos.length +
    enrollment.progress.completedPdfs.length +
    enrollment.progress.completedQuizzes.length +
    enrollment.progress.completedExams.length;

  enrollment.progress.percentage =
    totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
  enrollment.progress.lastAccessedAt = new Date();

  if (enrollment.progress.percentage >= 100) {
    enrollment.status = 'completed';
    enrollment.completedAt = new Date();
  }

  await enrollment.save();

  res.json({ success: true, data: enrollment });
});

// @desc    Get enrollment by course
// @route   GET /api/enrollments/course/:courseId
export const getEnrollmentByCourse = asyncHandler(async (req, res) => {
  const enrollment = await Enrollment.findOne({
    student: req.user._id,
    course: req.params.courseId,
  });

  res.json({ success: true, data: enrollment });
});
