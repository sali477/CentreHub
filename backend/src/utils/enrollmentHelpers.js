import Enrollment from '../models/Enrollment.js';
import Course from '../models/Course.js';
import Center from '../models/Center.js';
import User from '../models/User.js';
import Teacher from '../models/Teacher.js';
import Notification from '../models/Notification.js';

export const createEnrollmentRecord = async (userId, course, { teacherId } = {}) => {
  const existing = await Enrollment.findOne({
    student: userId,
    course: course._id,
  });

  if (existing) {
    const error = new Error('Already enrolled in this course');
    error.statusCode = 400;
    throw error;
  }

  const isPaid = course.courseType === 'paid' || (!course.isFree && course.price > 0);

  if (isPaid) {
    const error = new Error('Payment required. Use /api/payments/create-checkout');
    error.statusCode = 402;
    throw error;
  }

  const enrollment = await Enrollment.create({
    student: userId,
    course: course._id,
    center: course.center,
    payment: {
      amount: 0,
      status: 'paid',
      provider: 'free',
    },
    status: 'active',
  });

  course.enrolledStudents.push(userId);
  course.popularity += 1;
  await course.save();

  await User.findByIdAndUpdate(userId, {
    $addToSet: { enrolledCourses: course._id },
  });

  if (course.center) {
    await Center.findByIdAndUpdate(course.center, {
      $addToSet: { students: userId },
      $inc: { popularity: 1 },
    });
  }

  if (teacherId) {
    await Teacher.findByIdAndUpdate(teacherId, {
      $addToSet: { students: userId },
    });
  }

  await Notification.create({
    user: userId,
    title: 'Enrollment Successful',
    message: `You have enrolled in ${course.title}`,
    type: 'enrollment',
    link: `/courses/${course._id}`,
  });

  return enrollment;
};
