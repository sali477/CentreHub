import asyncHandler from 'express-async-handler';
import LiveSession from '../models/LiveSession.js';
import Teacher from '../models/Teacher.js';
import Course from '../models/Course.js';
import Notification from '../models/Notification.js';

const populateSession = (query) =>
  query
    .populate({
      path: 'teacher',
      populate: { path: 'user', select: 'name avatar email' },
    })
    .populate({
      path: 'course',
      select: 'title thumbnail enrolledStudents',
      populate: { path: 'enrolledStudents', select: 'name email avatar' },
    })
    .populate({ path: 'participants.user', select: 'name email avatar' });

const notifyEnrolledStudents = async (courseId, payload) => {
  const course = await Course.findById(courseId).select('enrolledStudents title');
  if (!course?.enrolledStudents?.length) return;

  const notifications = course.enrolledStudents.map((studentId) => ({
    user: studentId,
    ...payload,
  }));

  await Notification.insertMany(notifications);
};

const buildSessionNotification = (session, courseTitle, { isLive = false } = {}) => {
  const when = new Date(session.scheduledAt).toLocaleString();
  const title = isLive ? 'Live session is starting now' : 'New live session scheduled';
  const message = isLive
    ? `"${session.title}" is live now. Tap to join the Jitsi meeting.`
    : `"${session.title}" for ${courseTitle} on ${when}. Meeting link included.`;

  return {
    title,
    message,
    type: 'live_session',
    link: `/live/${session.roomId}`,
    metadata: {
      sessionId: session._id,
      roomId: session.roomId,
      jitsiRoomName: session.jitsiRoomName,
      meetingUrl: session.meetingUrl,
      courseTitle,
    },
  };
};

// @desc    Schedule live session (Jitsi Meet)
// @route   POST /api/live-sessions
export const createLiveSession = asyncHandler(async (req, res) => {
  const teacher = await Teacher.findOne({ user: req.user._id });

  if (!teacher) {
    res.status(403);
    throw new Error('Teacher profile required');
  }

  const session = await LiveSession.create({
    ...req.body,
    teacher: teacher._id,
  });

  await Course.findByIdAndUpdate(req.body.course, {
    $push: { liveSessions: session._id },
  });

  const course = await Course.findById(req.body.course).select('title enrolledStudents');
  if (course) {
    await notifyEnrolledStudents(
      course._id,
      buildSessionNotification(session, course.title)
    );
  }

  const populated = await populateSession(LiveSession.findById(session._id));

  res.status(201).json({ success: true, data: populated });
});

// @desc    Quick-start live session (one click, goes live immediately)
// @route   POST /api/live-sessions/quick
export const quickStartLiveSession = asyncHandler(async (req, res) => {
  const teacher = await Teacher.findOne({ user: req.user._id });

  if (!teacher) {
    res.status(403);
    throw new Error('Teacher profile required');
  }

  const { course: courseId, title, description } = req.body;
  if (!courseId) {
    res.status(400);
    throw new Error('Course is required');
  }

  const course = await Course.findById(courseId).select('title enrolledStudents teacher');
  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }

  const session = await LiveSession.create({
    title: title || `Live: ${course.title}`,
    description: description || '',
    course: courseId,
    teacher: teacher._id,
    scheduledAt: new Date(),
    duration: Number(req.body.duration) || 60,
    status: 'live',
  });

  await Course.findByIdAndUpdate(courseId, {
    $push: { liveSessions: session._id },
  });

  await notifyEnrolledStudents(
    courseId,
    buildSessionNotification(session, course.title, { isLive: true })
  );

  const populated = await populateSession(LiveSession.findById(session._id));

  res.status(201).json({ success: true, data: populated });
});

// @desc    Get live sessions
// @route   GET /api/live-sessions
export const getLiveSessions = asyncHandler(async (req, res) => {
  const filter = {};

  if (req.query.course) filter.course = req.query.course;
  if (req.query.status) filter.status = req.query.status;

  if (req.query.mine === 'true' && req.user) {
    const teacher = await Teacher.findOne({ user: req.user._id });
    if (teacher) filter.teacher = teacher._id;
  } else if (req.query.teacher) {
    filter.teacher = req.query.teacher;
  }

  const sessions = await populateSession(
    LiveSession.find(filter).sort('scheduledAt')
  );

  res.json({ success: true, data: sessions });
});

// @desc    Get live session by room id (Jitsi room slug)
// @route   GET /api/live-sessions/by-room/:roomId
export const getLiveSessionByRoom = asyncHandler(async (req, res) => {
  const { roomId } = req.params;
  const session = await populateSession(
    LiveSession.findOne({
      $or: [{ roomId }, { jitsiRoomName: roomId }],
    })
  );

  if (!session) {
    res.status(404);
    throw new Error('Live session not found');
  }

  res.json({ success: true, data: session });
});

// @desc    Get single live session
// @route   GET /api/live-sessions/:id
export const getLiveSession = asyncHandler(async (req, res) => {
  const session = await populateSession(LiveSession.findById(req.params.id));

  if (!session) {
    res.status(404);
    throw new Error('Live session not found');
  }

  res.json({ success: true, data: session });
});

// @desc    Update session status
// @route   PUT /api/live-sessions/:id/status
export const updateSessionStatus = asyncHandler(async (req, res) => {
  const session = await LiveSession.findById(req.params.id).populate('teacher');

  if (!session) {
    res.status(404);
    throw new Error('Live session not found');
  }

  const teacher = await Teacher.findOne({ user: req.user._id });
  const isTeacher =
    teacher && session.teacher._id.toString() === teacher._id.toString();

  if (!isTeacher && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized');
  }

  const previousStatus = session.status;
  session.status = req.body.status;
  await session.save();

  if (req.body.status === 'live' && previousStatus !== 'live') {
    const course = await Course.findById(session.course).select('title enrolledStudents');
    if (course) {
      await notifyEnrolledStudents(
        course._id,
        buildSessionNotification(session, course.title, { isLive: true })
      );
    }
  }

  const populated = await populateSession(LiveSession.findById(session._id));

  res.json({ success: true, data: populated });
});

// @desc    Join live session (track attendance)
// @route   POST /api/live-sessions/:id/join
export const joinLiveSession = asyncHandler(async (req, res) => {
  const session = await LiveSession.findById(req.params.id);

  if (!session) {
    res.status(404);
    throw new Error('Live session not found');
  }

  const alreadyJoined = session.participants.some(
    (p) => p.user.toString() === req.user._id.toString()
  );

  if (!alreadyJoined) {
    session.participants.push({
      user: req.user._id,
      joinedAt: new Date(),
    });
    await session.save();
  }

  const populated = await populateSession(LiveSession.findById(session._id));

  res.json({
    success: true,
    roomId: session.roomId,
    jitsiRoomName: session.jitsiRoomName,
    meetingUrl: session.meetingUrl,
    data: populated,
  });
});
