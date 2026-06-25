import asyncHandler from 'express-async-handler';
import Course from '../models/Course.js';
import CourseComment from '../models/CourseComment.js';
import Teacher from '../models/Teacher.js';
import Enrollment from '../models/Enrollment.js';
import Notification from '../models/Notification.js';

const USER_FIELDS = 'name avatar role';

const loadCourse = async (courseId) => {
  const course = await Course.findById(courseId).populate('teacher');
  if (!course) {
    const error = new Error('Course not found');
    error.statusCode = 404;
    throw error;
  }
  if (!course.teacher) {
    const error = new Error('Course has no assigned teacher');
    error.statusCode = 400;
    throw error;
  }
  return course;
};

const isCourseTeacherUser = async (course, userId) => {
  const teacher = await Teacher.findOne({ user: userId });
  return Boolean(teacher && course.teacher._id.toString() === teacher._id.toString());
};

const canPostQuestion = async (course, user) => {
  if (user.role === 'admin') return true;
  if (await isCourseTeacherUser(course, user._id)) return true;

  const enrollment = await Enrollment.findOne({
    student: user._id,
    course: course._id,
    status: { $in: ['active', 'completed'] },
  });

  return Boolean(enrollment);
};

const notifyUser = async ({ userId, title, message, courseId, metadata = {} }) => {
  if (!userId) return;

  await Notification.create({
    user: userId,
    title,
    message,
    type: 'course_discussion',
    link: `/courses/${courseId}?tab=comments`,
    metadata,
  });
};

const nestDiscussions = (topLevel, replies) => {
  const repliesByParent = replies.reduce((acc, reply) => {
    const key = reply.parentComment.toString();
    if (!acc[key]) acc[key] = [];
    acc[key].push(reply);
    return acc;
  }, {});

  return topLevel.map((comment) => ({
    ...comment.toObject(),
    replies: repliesByParent[comment._id.toString()] || [],
  }));
};

// @desc    Get course Q&A threads
// @route   GET /api/courses/:id/discussions
export const getCourseDiscussions = asyncHandler(async (req, res) => {
  const course = await loadCourse(req.params.id);

  const topLevel = await CourseComment.find({
    course: course._id,
    parentComment: null,
  })
    .populate('user', USER_FIELDS)
    .populate({
      path: 'teacher',
      select: 'user',
      populate: { path: 'user', select: USER_FIELDS },
    })
    .sort('-createdAt');

  const parentIds = topLevel.map((c) => c._id);
  const replies = parentIds.length
    ? await CourseComment.find({ parentComment: { $in: parentIds } })
        .populate('user', USER_FIELDS)
        .sort('createdAt')
    : [];

  res.json({
    success: true,
    count: topLevel.length,
    data: nestDiscussions(topLevel, replies),
  });
});

// @desc    Post a course question or comment
// @route   POST /api/courses/:id/discussions
export const createCourseDiscussion = asyncHandler(async (req, res) => {
  const content = (req.body.content || req.body.comment || '').trim();

  if (!content) {
    res.status(400);
    throw new Error('Comment is required');
  }

  const course = await loadCourse(req.params.id);

  if (!(await canPostQuestion(course, req.user))) {
    res.status(403);
    throw new Error('Enroll in this course to post questions');
  }

  const comment = await CourseComment.create({
    course: course._id,
    user: req.user._id,
    teacher: course.teacher._id,
    content,
    parentComment: null,
    isTeacherReply: false,
  });

  const populated = await CourseComment.findById(comment._id)
    .populate('user', USER_FIELDS)
    .populate({
      path: 'teacher',
      select: 'user',
      populate: { path: 'user', select: USER_FIELDS },
    });

  const teacherUserId = course.teacher.user;
  if (teacherUserId && teacherUserId.toString() !== req.user._id.toString()) {
    await notifyUser({
      userId: teacherUserId,
      title: 'New course question',
      message: `${req.user.name} asked a question in "${course.title}"`,
      courseId: course._id,
      metadata: { courseId: course._id, commentId: comment._id },
    });
  }

  res.status(201).json({
    success: true,
    data: { ...populated.toObject(), replies: [] },
  });
});

// @desc    Reply to a course question (teacher only)
// @route   POST /api/courses/:id/discussions/:commentId/replies
export const replyToCourseDiscussion = asyncHandler(async (req, res) => {
  const content = (req.body.content || '').trim();

  if (!content) {
    res.status(400);
    throw new Error('Reply is required');
  }

  const course = await loadCourse(req.params.id);

  const parent = await CourseComment.findOne({
    _id: req.params.commentId,
    course: course._id,
    parentComment: null,
  });

  if (!parent) {
    res.status(404);
    throw new Error('Question not found');
  }

  const isTeacher = await isCourseTeacherUser(course, req.user._id);
  if (!isTeacher && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Only the course teacher can reply');
  }

  const reply = await CourseComment.create({
    course: course._id,
    user: req.user._id,
    teacher: course.teacher._id,
    content,
    parentComment: parent._id,
    isTeacherReply: true,
  });

  const populated = await CourseComment.findById(reply._id).populate('user', USER_FIELDS);

  if (parent.user.toString() !== req.user._id.toString()) {
    await notifyUser({
      userId: parent.user,
      title: 'Teacher replied to your question',
      message: `${req.user.name} replied in "${course.title}"`,
      courseId: course._id,
      metadata: {
        courseId: course._id,
        commentId: parent._id,
        replyId: reply._id,
      },
    });
  }

  res.status(201).json({ success: true, data: populated });
});

// @desc    Get all discussions for courses taught by current teacher
// @route   GET /api/teachers/my/discussions
export const getTeacherDiscussions = asyncHandler(async (req, res) => {
  const teacher = await Teacher.findOne({ user: req.user._id });
  if (!teacher) {
    res.status(404);
    throw new Error('Teacher profile not found');
  }

  const topLevel = await CourseComment.find({
    teacher: teacher._id,
    parentComment: null,
  })
    .populate('user', USER_FIELDS)
    .populate('course', 'title slug')
    .sort('-createdAt')
    .limit(100);

  const parentIds = topLevel.map((c) => c._id);
  const replies = parentIds.length
    ? await CourseComment.find({ parentComment: { $in: parentIds } })
        .populate('user', USER_FIELDS)
        .sort('createdAt')
    : [];

  res.json({
    success: true,
    count: topLevel.length,
    data: nestDiscussions(topLevel, replies),
  });
});
