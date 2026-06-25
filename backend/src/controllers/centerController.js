import asyncHandler from 'express-async-handler';
import crypto from 'crypto';
import Center from '../models/Center.js';
import Teacher from '../models/Teacher.js';
import Review from '../models/Review.js';
import Enrollment from '../models/Enrollment.js';
import Course from '../models/Course.js';
import { searchCenters as runCenterSearch } from '../services/searchService.js';
import { isNearMeQuery } from '../utils/searchHelpers.js';

const generateInvitationCode = () => {
  return crypto.randomBytes(4).toString('hex').toUpperCase();
};

// @desc    Get all centers with filters
// @route   GET /api/centers
export const getCenters = asyncHandler(async (req, res) => {
  const useGeo =
    req.query.near === 'true' ||
    req.query.nearMe === 'true' ||
    (req.query.lat &&
      req.query.lng &&
      (req.query.useGeo === 'true' || isNearMeQuery(req.query.search)));

  const result = await runCenterSearch({
    search: req.query.search || req.query.q,
    lat: req.query.lat,
    lng: req.query.lng,
    radius: req.query.radius || req.query.distance || 50,
    limit: req.query.limit || 10,
    page: req.query.page || 1,
    subject: req.query.subject,
    rating: req.query.rating,
    price: req.query.price,
    popularity: req.query.popularity,
    city: req.query.city,
    neighborhood: req.query.neighborhood,
    deliveryMode: req.query.deliveryMode,
    sort: req.query.sort,
    useGeo,
  });

  res.json({
    success: true,
    count: result.count,
    total: result.total,
    page: result.page,
    pages: result.pages,
    data: result.data,
    meta: { locationUsed: useGeo },
  });
});

// @desc    Get single center
// @route   GET /api/centers/:id
export const getCenter = asyncHandler(async (req, res) => {
  const center = await Center.findById(req.params.id)
    .populate('owner', 'name email avatar phone')
    .populate({
      path: 'teachers',
      populate: { path: 'user', select: 'name avatar email' },
    });

  if (!center || !center.isActive) {
    res.status(404);
    throw new Error('Center not found');
  }

  const courses = await Course.find({
    center: center._id,
    isPublished: true,
    isIndependent: false,
  })
    .populate({
      path: 'teacher',
      populate: { path: 'user', select: 'name avatar' },
    })
    .sort('-rating -popularity');

  const centerData = center.toObject();
  centerData.courses = courses;

  const reviews = await Review.find({ center: center._id })
    .populate('user', 'name avatar')
    .sort('-createdAt')
    .limit(20);

  res.json({ success: true, data: centerData, reviews });
});

// @desc    Create center
// @route   POST /api/centers
export const createCenter = asyncHandler(async (req, res) => {
  const existingCenter = await Center.findOne({ owner: req.user._id });
  if (existingCenter) {
    res.status(400);
    throw new Error('You already have a center registered');
  }

  const centerData = {
    ...req.body,
    owner: req.user._id,
    invitationCode: generateInvitationCode(),
  };

  if (req.body.latitude && req.body.longitude) {
    centerData.location = {
      type: 'Point',
      coordinates: [parseFloat(req.body.longitude), parseFloat(req.body.latitude)],
    };
  }

  const center = await Center.create(centerData);

  if (req.user.role !== 'center_owner') {
    req.user.role = 'center_owner';
    await req.user.save();
  }

  res.status(201).json({ success: true, data: center });
});

// @desc    Update center
// @route   PUT /api/centers/:id
export const updateCenter = asyncHandler(async (req, res) => {
  let center = await Center.findById(req.params.id);

  if (!center) {
    res.status(404);
    throw new Error('Center not found');
  }

  if (center.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to update this center');
  }

  if (req.body.latitude && req.body.longitude) {
    req.body.location = {
      type: 'Point',
      coordinates: [parseFloat(req.body.longitude), parseFloat(req.body.latitude)],
    };
  }

  center = await Center.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.json({ success: true, data: center });
});

// @desc    Generate new invitation code
// @route   POST /api/centers/:id/invitation-code
export const regenerateInvitationCode = asyncHandler(async (req, res) => {
  const center = await Center.findById(req.params.id);

  if (!center) {
    res.status(404);
    throw new Error('Center not found');
  }

  if (center.owner.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized');
  }

  center.invitationCode = generateInvitationCode();
  await center.save();

  res.json({ success: true, invitationCode: center.invitationCode });
});

// @desc    Get center dashboard stats
// @route   GET /api/centers/:id/stats
export const getCenterStats = asyncHandler(async (req, res) => {
  const center = await Center.findById(req.params.id)
    .populate('courses')
    .populate('teachers')
    .populate('students', 'name email avatar');

  if (!center) {
    res.status(404);
    throw new Error('Center not found');
  }

  if (center.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized');
  }

  const stats = {
    totalCourses: center.courses.length,
    totalTeachers: center.teachers.length,
    totalStudents: center.students.length,
    revenue: center.revenue,
    rating: center.rating,
    numReviews: center.numReviews,
    popularity: center.popularity,
  };

  res.json({ success: true, stats, center });
});

// @desc    Get logged-in owner's center
// @route   GET /api/centers/my
export const getMyCenter = asyncHandler(async (req, res) => {
  const center = await Center.findOne({ owner: req.user._id, isActive: true })
    .populate({
      path: 'teachers',
      populate: { path: 'user', select: 'name email avatar phone' },
    })
    .populate({
      path: 'courses',
      populate: { path: 'teacher', populate: { path: 'user', select: 'name avatar' } },
    })
    .populate('students', 'name email avatar');

  res.json({ success: true, data: center });
});

// @desc    Get center revenue & transactions
// @route   GET /api/centers/:id/revenue
export const getCenterRevenue = asyncHandler(async (req, res) => {
  const center = await Center.findById(req.params.id);

  if (!center) {
    res.status(404);
    throw new Error('Center not found');
  }

  if (center.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized');
  }

  const enrollments = await Enrollment.find({
    center: center._id,
    'payment.status': 'paid',
  })
    .populate('student', 'name email avatar')
    .populate('course', 'title price subject')
    .sort('-payment.paidAt');

  const totalRevenue = enrollments.reduce(
    (sum, e) => sum + (e.payment?.amount || 0),
    0
  );

  const byMonth = await Enrollment.aggregate([
    {
      $match: {
        center: center._id,
        'payment.status': 'paid',
        'payment.paidAt': { $exists: true },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: '$payment.paidAt' },
          month: { $month: '$payment.paidAt' },
        },
        revenue: { $sum: '$payment.amount' },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': -1, '_id.month': -1 } },
    { $limit: 12 },
  ]);

  const byCourse = await Enrollment.aggregate([
    { $match: { center: center._id, 'payment.status': 'paid' } },
    {
      $group: {
        _id: '$course',
        revenue: { $sum: '$payment.amount' },
        enrollments: { $sum: 1 },
      },
    },
    { $sort: { revenue: -1 } },
  ]);

  const courseIds = byCourse.map((c) => c._id);
  const courses = await Course.find({ _id: { $in: courseIds } }).select('title subject');
  const courseMap = Object.fromEntries(courses.map((c) => [c._id.toString(), c]));

  res.json({
    success: true,
    data: {
      totalRevenue,
      centerRevenue: center.revenue,
      transactions: enrollments,
      byMonth: byMonth.map((m) => ({
        label: `${m._id.year}-${String(m._id.month).padStart(2, '0')}`,
        revenue: m.revenue,
        count: m.count,
      })),
      byCourse: byCourse.map((c) => ({
        course: courseMap[c._id?.toString()],
        revenue: c.revenue,
        enrollments: c.enrollments,
      })),
    },
  });
});

// @desc    Remove teacher from center
// @route   DELETE /api/centers/:id/teachers/:teacherId
export const removeTeacherFromCenter = asyncHandler(async (req, res) => {
  const center = await Center.findById(req.params.id);

  if (!center) {
    res.status(404);
    throw new Error('Center not found');
  }

  if (center.owner.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized');
  }

  center.teachers = center.teachers.filter(
    (t) => t.toString() !== req.params.teacherId
  );
  await center.save();

  await Teacher.findByIdAndUpdate(req.params.teacherId, { $unset: { center: 1 } });

  res.json({ success: true, message: 'Teacher removed from center' });
});

// @desc    Delete center
// @route   DELETE /api/centers/:id
export const deleteCenter = asyncHandler(async (req, res) => {
  const center = await Center.findById(req.params.id);

  if (!center) {
    res.status(404);
    throw new Error('Center not found');
  }

  if (center.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized');
  }

  center.isActive = false;
  await center.save();

  res.json({ success: true, message: 'Center deactivated' });
});
