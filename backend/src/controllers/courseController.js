import asyncHandler from 'express-async-handler';
import Course from '../models/Course.js';
import Teacher from '../models/Teacher.js';
import Center from '../models/Center.js';
import { searchCourses as runCourseSearch } from '../services/searchService.js';

const resolveCourseType = (body) => {
  if (body.courseType === 'paid' || body.courseType === 'free') return body.courseType;
  if (body.isFree === false || (body.price && Number(body.price) > 0)) return 'paid';
  return 'free';
};

const buildCourseData = (body, { teacher, centerId, isIndependent }) => {
  const courseType = isIndependent ? resolveCourseType(body) : resolveCourseType(body);

  return {
    title: body.title,
    description: body.description,
    subject: body.subject,
    level: body.level,
    thumbnail: body.thumbnail,
    tags: body.tags,
    isPublished: body.isPublished ?? false,
    teacher: teacher._id,
    center: centerId,
    isIndependent,
    courseType,
    price: courseType === 'paid' ? Number(body.price) : 0,
    currency: body.currency || 'MAD',
  };
};

const canManageCourse = async (req, course) => {
  if (req.user.role === 'admin') return true;

  const teacher = await Teacher.findOne({ user: req.user._id });
  if (!teacher) return false;

  if (course.teacher._id.toString() !== teacher._id.toString()) return false;

  if (course.center) {
    const courseCenterId = course.center._id?.toString() || course.center.toString();
    return teacher.center?.toString() === courseCenterId;
  }

  return !teacher.center;
};

// @desc    Get all courses
// @route   GET /api/courses
export const getCourses = asyncHandler(async (req, res) => {
  const hasCenterFilter = Boolean(req.query.center);

  const result = await runCourseSearch({
    search: req.query.search,
    limit: req.query.limit || 10,
    page: req.query.page || 1,
    subject: req.query.subject,
    center: req.query.center,
    teacher: req.query.teacher,
    sort: req.query.sort,
    independentOnly: !hasCenterFilter,
  });

  res.json({
    success: true,
    count: result.count,
    total: result.total,
    page: result.page,
    pages: result.pages,
    data: result.data,
  });
});

// @desc    Get single course with content
// @route   GET /api/courses/:id
export const getCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id)
    .populate({
      path: 'teacher',
      populate: { path: 'user', select: 'name avatar email' },
    })
    .populate('center', 'name logo address')
    .populate('videos')
    .populate('pdfs')
    .populate('quizzes', '-attempts')
    .populate('exams', '-attempts')
    .populate('liveSessions');

  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }

  res.json({ success: true, data: course });
});

// @desc    Create course
// @route   POST /api/courses
export const createCourse = asyncHandler(async (req, res) => {
  let teacher;
  let centerId = null;
  let isIndependent = false;

  if (req.user.role === 'center_owner') {
    const center = await Center.findOne({ owner: req.user._id, isActive: true });
    if (!center) {
      res.status(403);
      throw new Error('You must have a center to create courses');
    }
    if (!req.body.teacher) {
      res.status(400);
      throw new Error('Teacher ID is required');
    }
    teacher = await Teacher.findById(req.body.teacher);
    if (!teacher || teacher.center?.toString() !== center._id.toString()) {
      res.status(403);
      throw new Error('Teacher does not belong to your center');
    }
    centerId = center._id;
    isIndependent = false;
  } else {
    teacher = await Teacher.findOne({ user: req.user._id });
    if (!teacher) {
      res.status(403);
      throw new Error('Teacher profile required to create courses');
    }

    if (teacher.center) {
      centerId = teacher.center;
      isIndependent = false;
    } else {
      isIndependent = true;
      centerId = null;
    }
  }

  const courseData = buildCourseData(req.body, { teacher, centerId, isIndependent });

  if (courseData.courseType === 'paid' && (!courseData.price || courseData.price <= 0)) {
    res.status(400);
    throw new Error('Paid courses require a price greater than 0');
  }

  const course = await Course.create(courseData);

  teacher.courses.push(course._id);
  await teacher.save();

  if (centerId) {
    await Center.findByIdAndUpdate(centerId, {
      $push: { courses: course._id },
    });
  }

  res.status(201).json({ success: true, data: course });
});

// @desc    Update course
// @route   PUT /api/courses/:id
export const updateCourse = asyncHandler(async (req, res) => {
  let course = await Course.findById(req.params.id).populate('teacher');

  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }

  const allowed = await canManageCourse(req, course);

  if (!allowed) {
    res.status(403);
    throw new Error('Not authorized to manage this course');
  }

  const isIndependent = course.isIndependent;
  const courseType = isIndependent ? resolveCourseType(req.body) : 'free';
  const price = courseType === 'paid' ? Number(req.body.price) : 0;

  if (courseType === 'paid' && (!price || price <= 0)) {
    res.status(400);
    throw new Error('Paid courses require a price greater than 0');
  }

  const updates = {
    title: req.body.title ?? course.title,
    description: req.body.description ?? course.description,
    subject: req.body.subject ?? course.subject,
    level: req.body.level ?? course.level,
    thumbnail: req.body.thumbnail ?? course.thumbnail,
    tags: req.body.tags ?? course.tags,
    isPublished: req.body.isPublished ?? course.isPublished,
    courseType,
    price,
    isFree: courseType !== 'paid',
  };

  course = await Course.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true,
  });

  res.json({ success: true, data: course });
});

// @desc    Delete course
// @route   DELETE /api/courses/:id
export const deleteCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id).populate('teacher');

  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }

  const allowed = await canManageCourse(req, course);

  if (!allowed) {
    res.status(403);
    throw new Error('Not authorized to manage this course');
  }

  course.isPublished = false;
  await course.save();

  res.json({ success: true, message: 'Course unpublished' });
});

// @desc    Add comment to course (stored as review with comment only)
// @route   POST /api/courses/:id/comments
export const addCourseComment = asyncHandler(async (req, res) => {
  const Review = (await import('../models/Review.js')).default;

  const review = await Review.create({
    user: req.user._id,
    course: req.params.id,
    rating: req.body.rating || 5,
    comment: req.body.comment,
  });

  const populated = await review.populate('user', 'name avatar');

  res.status(201).json({ success: true, data: populated });
});
