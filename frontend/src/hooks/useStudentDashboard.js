import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { enrollmentAPI } from '../api/index';
import { getSessionRoomSlug } from '../utils/jitsi';

export const useStudentEnrollments = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refresh = useCallback(() => {
    setLoading(true);
    setError('');
    return enrollmentAPI
      .getMy()
      .then(({ data }) => setEnrollments(data.data || []))
      .catch((err) => {
        setError(err.response?.data?.message || 'Failed to load enrollments');
        setEnrollments([]);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const stats = useMemo(() => {
    const completed = enrollments.filter((e) => e.status === 'completed').length;
    const active = enrollments.filter((e) => e.status === 'active').length;
    const avgProgress =
      enrollments.length > 0
        ? Math.round(
            enrollments.reduce((acc, e) => acc + (e.progress?.percentage || 0), 0) /
              enrollments.length
          )
        : 0;

    return { completed, active, avgProgress, total: enrollments.length };
  }, [enrollments]);

  const liveSessions = useMemo(() => {
    const sessions = [];
    enrollments.forEach((enrollment) => {
      const course = enrollment.course;
      if (!course?.liveSessions?.length) return;
      course.liveSessions.forEach((session) => {
        const sessionId = session._id || session.id;
        if (!sessionId) return;
        sessions.push({
          ...session,
          _id: sessionId,
          courseTitle: course.title,
          courseId: course._id,
        });
      });
    });
    return sessions.sort(
      (a, b) => new Date(a.scheduledAt || 0) - new Date(b.scheduledAt || 0)
    );
  }, [enrollments]);

  const assignments = useMemo(() => {
    const items = [];
    enrollments.forEach((enrollment) => {
      const course = enrollment.course;
      if (!course) return;
      const progress = enrollment.progress || {};
      const completedQuizzes = (progress.completedQuizzes || []).map(String);
      const completedExams = (progress.completedExams || []).map(String);

      (course.quizzes || []).forEach((quiz) => {
        const id = quiz._id?.toString();
        items.push({
          id: `quiz-${id}`,
          type: 'quiz',
          title: quiz.title,
          courseTitle: course.title,
          courseId: course._id,
          itemId: id,
          dueDate: null,
          status: completedQuizzes.includes(id) ? 'submitted' : 'pending',
          link: `/courses/${course._id}/quiz/${id}`,
          meta: `${quiz.timeLimit || 30} min`,
        });
      });

      (course.exams || []).forEach((exam) => {
        const id = exam._id?.toString();
        items.push({
          id: `exam-${id}`,
          type: 'exam',
          title: exam.title,
          courseTitle: course.title,
          courseId: course._id,
          itemId: id,
          dueDate: exam.scheduledAt || null,
          status: completedExams.includes(id) ? 'submitted' : 'pending',
          link: `/courses/${course._id}/exam/${id}`,
          meta: `${exam.duration || 60} min • Pass ${exam.passingScore || 60}%`,
        });
      });
    });

    return items.sort((a, b) => {
      if (!a.dueDate && !b.dueDate) return 0;
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate) - new Date(b.dueDate);
    });
  }, [enrollments]);

  const calendarEvents = useMemo(() => {
    const events = [];

    liveSessions.forEach((session) => {
      if (!session.scheduledAt) return;
      events.push({
        id: `live-${session._id}`,
        type: 'live',
        title: session.title,
        date: session.scheduledAt,
        courseTitle: session.courseTitle,
        status: session.status,
        link: session.status === 'live' && getSessionRoomSlug(session)
          ? `/live/${getSessionRoomSlug(session)}`
          : null,
      });
    });

    enrollments.forEach((enrollment) => {
      const course = enrollment.course;
      if (!course) return;

      (course.quizzes || []).forEach((quiz) => {
        const id = quiz._id?.toString();
        if (!id) return;
        events.push({
          id: `quiz-${id}`,
          type: 'quiz',
          title: quiz.title,
          date: quiz.createdAt || quiz.updatedAt,
          courseTitle: course.title,
          link: `/courses/${course._id}/quiz/${id}`,
        });
      });

      (course.exams || []).forEach((exam) => {
        const id = exam._id?.toString();
        if (!id || !exam.scheduledAt) return;
        events.push({
          id: `exam-${id}`,
          type: 'exam',
          title: exam.title,
          date: exam.scheduledAt,
          courseTitle: course.title,
          link: `/courses/${course._id}/exam/${id}`,
        });
      });
    });

    return events
      .filter((e) => e.date)
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [liveSessions, enrollments]);

  return {
    enrollments,
    loading,
    error,
    refresh,
    stats,
    liveSessions,
    assignments,
    calendarEvents,
  };
};

export const useStudentWelcome = () => {
  const { user } = useSelector((state) => state.auth);
  return user?.name?.split(' ')[0] || 'Student';
};
