import asyncHandler from 'express-async-handler';
import Teacher from '../models/Teacher.js';
import Center from '../models/Center.js';
import Course from '../models/Course.js';
import User from '../models/User.js';
import { assignTeacherCode, findTeacherByCode } from '../utils/teacherCode.js';

// @desc    Get logged-in teacher profile
// @route   GET /api/teachers/my
export const getMyTeacher = asyncHandler(async (req, res) => {
  let teacher = await Teacher.findOne({ user: req.user._id, isActive: true })
    .populate('user', 'name email avatar phone')
    .populate('center', 'name logo isVerified')
    .populate({
      path: 'courses',
      populate: { path: 'enrolledStudents', select: 'name email avatar createdAt' },
    })
    .populate('students', 'name email avatar createdAt');

  if (teacher?.center) {
    teacher = await assignTeacherCode(teacher);
    teacher = await Teacher.findById(teacher._id)
      .populate('user', 'name email avatar phone')
      .populate('center', 'name logo isVerified')
      .populate({
        path: 'courses',
        populate: { path: 'enrolledStudents', select: 'name email avatar createdAt' },
      })
      .populate('students', 'name email avatar createdAt');
  }

  res.json({ success: true, data: teacher });
});

// @desc    Get all teachers
// @route   GET /api/teachers
export const getTeachers = asyncHandler(async (req, res) => {
  const query = { isActive: true };

  if (req.query.subject) {
    query.subjects = { $in: [req.query.subject] };
  }

  if (req.query.center) {
    query.center = req.query.center;
  }

  const teachers = await Teacher.find(query)
    .populate('user', 'name email avatar')
    .populate('center', 'name logo')
    .populate({
      path: 'courses',
      select: '_id',
      match: { isPublished: true, isIndependent: true },
    })
    .sort(req.query.sort || '-rating');

  res.json({ success: true, count: teachers.length, data: teachers });
});

// @desc    Get single teacher
// @route   GET /api/teachers/:id
export const getTeacher = asyncHandler(async (req, res) => {
  const teacher = await Teacher.findById(req.params.id)
    .populate('user', 'name email avatar phone')
    .populate('center', 'name logo address')
    .populate({
      path: 'courses',
      match: { isPublished: true, isIndependent: true },
    });

  if (!teacher || !teacher.isActive) {
    res.status(404);
    throw new Error('Teacher not found');
  }

  res.json({ success: true, data: teacher });
});

// @desc    Create teacher profile
// @route   POST /api/teachers
export const createTeacherProfile = asyncHandler(async (req, res) => {
  const existing = await Teacher.findOne({ user: req.user._id });
  if (existing) {
    res.status(400);
    throw new Error('Teacher profile already exists');
  }

  const teacher = await Teacher.create({
    user: req.user._id,
    ...req.body,
  });

  if (req.user.role === 'student') {
    await User.findByIdAndUpdate(req.user._id, { role: 'teacher' });
  }

  const populated = await Teacher.findById(teacher._id).populate('user', 'name email avatar');

  res.status(201).json({ success: true, data: populated });
});

// @desc    Join center via invitation code
// @route   POST /api/teachers/join-center
export const joinCenter = asyncHandler(async (req, res) => {
  const code = req.body.invitationCode?.trim().toUpperCase();

  if (!code) {
    res.status(400);
    throw new Error('Invitation code is required');
  }

  const center = await Center.findOne({ invitationCode: code, isActive: true });
  if (!center) {
    res.status(404);
    throw new Error('Invalid invitation code. Check the code and try again.');
  }

  let teacher = await Teacher.findOne({ user: req.user._id });

  if (teacher?.center?.toString() === center._id.toString()) {
    const populated = await Teacher.findById(teacher._id)
      .populate('user', 'name email avatar')
      .populate('center', 'name logo');
    res.json({ success: true, message: 'You are already a member of this center', data: populated });
    return;
  }

  if (!teacher) {
    teacher = await Teacher.create({
      user: req.user._id,
      center: center._id,
      invitationUsed: code,
    });
  } else {
    if (teacher.center) {
      await Center.findByIdAndUpdate(teacher.center, {
        $pull: { teachers: teacher._id },
      });
    }
    teacher.center = center._id;
    teacher.invitationUsed = code;
    await teacher.save();
  }

  if (req.user.role === 'student') {
    await User.findByIdAndUpdate(req.user._id, { role: 'teacher' });
  }

  await Center.findByIdAndUpdate(center._id, {
    $addToSet: { teachers: teacher._id },
  });

  teacher = await assignTeacherCode(teacher);

  const populated = await Teacher.findById(teacher._id)
    .populate('user', 'name email avatar')
    .populate('center', 'name logo');

  res.json({ success: true, data: populated });
});

// @desc    Create independent academy
// @route   POST /api/teachers/independent-academy
export const createIndependentAcademy = asyncHandler(async (req, res) => {
  const teacher = await Teacher.findOne({ user: req.user._id });

  if (!teacher) {
    res.status(404);
    throw new Error('Teacher profile not found');
  }

  teacher.independentAcademy = {
    ...req.body,
    isActive: true,
  };

  await teacher.save();

  res.json({ success: true, data: teacher });
});

// @desc    Update teacher profile
// @route   PUT /api/teachers/:id
export const updateTeacher = asyncHandler(async (req, res) => {
  let teacher = await Teacher.findById(req.params.id);

  if (!teacher) {
    res.status(404);
    throw new Error('Teacher not found');
  }

  if (teacher.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized');
  }

  teacher = await Teacher.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  }).populate('user', 'name email avatar');

  res.json({ success: true, data: teacher });
});

// @desc    Get teacher's students
// @route   GET /api/teachers/:id/students
export const getTeacherStudents = asyncHandler(async (req, res) => {
  const teacher = await Teacher.findById(req.params.id).populate(
    'students',
    'name email avatar'
  );

  if (!teacher) {
    res.status(404);
    throw new Error('Teacher not found');
  }

  res.json({ success: true, data: teacher.students });
});

// @desc    Get teacher and center courses by teacher code
// @route   GET /api/teachers/code/:teacherCode
export const getTeacherByCode = asyncHandler(async (req, res) => {
  const teacher = await findTeacherByCode(req.params.teacherCode);

  if (!teacher || !teacher.center) {
    res.status(404);
    throw new Error('Invalid teacher code or teacher is not linked to a center');
  }

  const courses = await Course.find({
    teacher: teacher._id,
    center: teacher.center._id,
    isPublished: true,
  })
    .select('title description subject level price courseType isFree thumbnail rating enrolledStudents')
    .sort('-createdAt');

  res.json({
    success: true,
    data: {
      teacher: {
        _id: teacher._id,
        teacherCode: teacher.teacherCode,
        user: teacher.user,
        center: teacher.center,
        subjects: teacher.subjects,
      },
      courses,
    },
  });
});
