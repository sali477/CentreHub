import asyncHandler from 'express-async-handler';
import Quiz from '../models/Quiz.js';
import Course from '../models/Course.js';
import Teacher from '../models/Teacher.js';
import Enrollment from '../models/Enrollment.js';

const verifyEnrollment = async (userId, courseId) => {
  return Enrollment.findOne({
    student: userId,
    course: courseId,
    status: { $in: ['active', 'completed'] },
  });
};

const canAccessQuiz = async (user, quiz) => {
  const enrollment = await verifyEnrollment(user._id, quiz.course);
  if (enrollment) {
    return { allowed: true, enrollment, trackProgress: true };
  }

  if (user.role === 'admin') {
    return { allowed: true, enrollment: null, trackProgress: false };
  }

  const course = await Course.findById(quiz.course);
  if (!course) {
    return { allowed: false, enrollment: null, trackProgress: false };
  }

  const teacher = await Teacher.findOne({ _id: course.teacher, user: user._id });
  if (teacher) {
    return { allowed: true, enrollment: null, trackProgress: false };
  }

  return { allowed: false, enrollment: null, trackProgress: false };
};

// @desc    Get quiz for taking (answers hidden)
// @route   GET /api/quizzes/:id
export const getQuiz = asyncHandler(async (req, res) => {
  const quiz = await Quiz.findById(req.params.id);

  if (!quiz) {
    res.status(404);
    throw new Error('Quiz not found');
  }

  const access = await canAccessQuiz(req.user, quiz);
  if (!access.allowed) {
    res.status(403);
    throw new Error('You must be enrolled in this course to take this quiz');
  }

  if (!quiz.questions?.length) {
    res.status(400);
    throw new Error('This quiz has no questions yet');
  }

  const safeQuiz = {
    _id: quiz._id,
    title: quiz.title,
    description: quiz.description,
    course: quiz.course,
    timeLimit: quiz.timeLimit,
    passingScore: quiz.passingScore,
    questions: quiz.questions.map((q, i) => ({
      _id: i,
      question: q.question,
      options: q.options,
      points: q.points,
    })),
    previousAttempts: quiz.attempts
      .filter((a) => a.student.toString() === req.user._id.toString())
      .map((a) => ({
        score: a.score,
        completedAt: a.completedAt,
      })),
  };

  res.json({ success: true, data: safeQuiz });
});

// @desc    Submit quiz answers
// @route   POST /api/quizzes/:id/submit
export const submitQuiz = asyncHandler(async (req, res) => {
  const quiz = await Quiz.findById(req.params.id);

  if (!quiz) {
    res.status(404);
    throw new Error('Quiz not found');
  }

  const access = await canAccessQuiz(req.user, quiz);
  if (!access.allowed) {
    res.status(403);
    throw new Error('You must be enrolled in this course to submit this quiz');
  }

  const { answers } = req.body;
  if (!Array.isArray(answers) || answers.length !== quiz.questions.length) {
    res.status(400);
    throw new Error('Invalid answers format');
  }

  let correct = 0;
  let totalPoints = 0;
  let earnedPoints = 0;

  const results = quiz.questions.map((q, i) => {
    totalPoints += q.points || 1;
    const isCorrect = answers[i] === q.correctAnswer;
    if (isCorrect) {
      correct += 1;
      earnedPoints += q.points || 1;
    }
    return {
      question: q.question,
      options: q.options,
      yourAnswer: answers[i],
      correctAnswer: q.correctAnswer,
      isCorrect,
      explanation: q.explanation,
    };
  });

  const score = Math.round((earnedPoints / totalPoints) * 100);
  const passed = score >= quiz.passingScore;

  quiz.attempts.push({
    student: req.user._id,
    score,
    answers,
    completedAt: new Date(),
  });
  await quiz.save();

  if (
    access.trackProgress &&
    access.enrollment &&
    passed &&
    !access.enrollment.progress.completedQuizzes.includes(quiz._id)
  ) {
    access.enrollment.progress.completedQuizzes.push(quiz._id);
    await access.enrollment.save();
  }

  res.json({
    success: true,
    data: {
      score,
      passed,
      correct,
      total: quiz.questions.length,
      passingScore: quiz.passingScore,
      results,
    },
  });
});
