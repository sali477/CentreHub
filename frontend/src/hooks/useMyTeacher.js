import { useState, useEffect, useCallback, useMemo } from 'react';
import { teacherAPI, liveSessionAPI } from '../api/index';

export const useMyTeacher = () => {
  const [teacher, setTeacher] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await teacherAPI.getMy();
      const teacherData = data.data;
      setTeacher(teacherData);

      if (teacherData?._id) {
        const { data: sessionsData } = await liveSessionAPI.getAll({ mine: true });
        setSessions(sessionsData.data || []);
      } else {
        setSessions([]);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load teacher profile');
      setTeacher(null);
      setSessions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const stats = useMemo(() => {
    if (!teacher) return null;
    const courses = teacher.courses || [];
    const studentIds = new Set();
    courses.forEach((course) => {
      (course.enrolledStudents || []).forEach((s) => studentIds.add(s._id));
    });
    const upcomingSessions = (sessions || []).filter(
      (s) => s.status === 'scheduled' && new Date(s.scheduledAt) >= new Date()
    ).length;

    return {
      totalCourses: courses.length,
      totalStudents: studentIds.size,
      rating: teacher.rating || 0,
      numReviews: teacher.numReviews || 0,
      upcomingSessions,
      hasCenter: Boolean(teacher.center),
    };
  }, [teacher, sessions]);

  return { teacher, sessions, stats, loading, error, refresh, setTeacher };
};

export default useMyTeacher;
