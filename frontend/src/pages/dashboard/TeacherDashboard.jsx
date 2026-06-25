import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

import { motion } from 'framer-motion';
import {
  FiBook, FiUsers, FiVideo, FiFileText, FiStar, FiCheckCircle, FiHome, FiCopy, FiEdit2, FiPlus,
  FiMessageSquare,
} from 'react-icons/fi';
import useMyTeacher from '../../hooks/useMyTeacher';
import TeacherSetupBanner from './teacher/TeacherSetupBanner';
import JoinCenterForm from './teacher/JoinCenterForm';
import { formatDateTime } from '../../utils/helpers';
import { discussionAPI } from '../../api/index';

const EMPTY_STATS = {
  totalCourses: 0,
  totalStudents: 0,
  upcomingSessions: 0,
  rating: 0,
};

const TeacherDashboard = () => {
  const { t } = useTranslation();
  const { user } = useSelector((state) => state.auth);
  const { teacher, sessions, stats, loading, refresh } = useMyTeacher();
  const [studentQuestions, setStudentQuestions] = useState([]);
  const isNewTeacher = !teacher;
  const activeStats = stats || EMPTY_STATS;

  useEffect(() => {
    if (!teacher) {
      setStudentQuestions([]);
      return;
    }
    discussionAPI
      .getTeacherDiscussions()
      .then(({ data }) => setStudentQuestions((data.data || []).slice(0, 5)))
      .catch(() => setStudentQuestions([]));
  }, [teacher]);

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 bg-muted rounded w-1/3" />
        <div className="grid grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-muted rounded-xl" />)}
        </div>
      </div>
    );
  }

  const quickLinks = [
    { to: '/dashboard/teacher/courses', label: t('dashboard.teacher.myCourses'), icon: FiBook, desc: t('dashboard.teacher.coursesCount', { count: activeStats.totalCourses }), state: { createCourse: activeStats.totalCourses === 0 } },
    { to: '/dashboard/teacher/students', label: t('dashboard.teacher.studentsLabel'), icon: FiUsers, desc: t('dashboard.teacher.studentsEnrolled', { count: activeStats.totalStudents }) },
    { to: '/dashboard/teacher/live', label: t('dashboard.teacher.nav.live'), icon: FiVideo, desc: t('dashboard.teacher.upcomingCount', { count: activeStats.upcomingSessions }) },
    { to: '/dashboard/teacher/content', label: t('dashboard.teacher.nav.content'), icon: FiFileText, desc: t('dashboard.teacher.contentDesc') },
  ];

  const upcoming = (sessions || [])
    .filter((s) => s.status === 'scheduled' && new Date(s.scheduledAt) >= new Date())
    .slice(0, 3);

  const courses = teacher?.courses || [];

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">{teacher?.user?.name || user?.name || t('dashboard.teacher.title')}</h1>
            {teacher?.isVerified && (
              <span className="badge-verified flex items-center gap-1">
                <FiCheckCircle className="w-3 h-3" /> {t('common.verified')}
              </span>
            )}
          </div>
          <p className="text-muted-foreground">
            {isNewTeacher
              ? t('dashboard.teacher.welcomeNew')
              : teacher.center
                ? t('dashboard.teacher.teachingAt', { name: teacher.center.name })
                : t('dashboard.teacher.independent')}
          </p>
        </div>
        {teacher && (
          <div className="flex flex-wrap gap-2">
            <Link to="/dashboard/teacher/profile" className="btn-primary text-sm inline-flex items-center gap-2">
              <FiEdit2 className="w-4 h-4" /> {t('dashboard.teacher.editProfile')}
            </Link>
            <Link to={`/teachers/${teacher._id}`} className="btn-secondary text-sm">
              {t('dashboard.teacher.viewPublicProfile')}
            </Link>
          </div>
        )}
      </div>

      {isNewTeacher && <TeacherSetupBanner onComplete={refresh} />}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { icon: FiBook, label: t('dashboard.teacher.coursesLabel'), value: activeStats.totalCourses, color: 'text-primary', bg: 'bg-accent' },
          { icon: FiUsers, label: t('dashboard.teacher.studentsLabel'), value: activeStats.totalStudents, color: 'text-primary', bg: 'bg-accent' },
          { icon: FiVideo, label: t('dashboard.teacher.upcomingLive'), value: activeStats.upcomingSessions, color: 'text-primary', bg: 'bg-accent' },
          { icon: FiStar, label: t('dashboard.teacher.ratingLabel'), value: (activeStats.rating || 0).toFixed(1), color: 'text-primary', bg: 'bg-accent' },
        ].map(({ icon: Icon, label, value, color, bg }, i) => (
          <motion.div key={label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }} className="card p-5">
            <div className={`w-10 h-10 ${bg} rounded-lg flex items-center justify-center mb-3`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-sm text-muted-foreground">{label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {quickLinks.map(({ to, label, icon: Icon, desc, state }) => (
          <Link key={to} to={to} state={state} className="card p-5 hover:shadow-md transition-shadow group">
            <Icon className="w-6 h-6 text-primary mb-2 group-hover:scale-110 transition-transform" />
            <h3 className="font-semibold">{label}</h3>
            <p className="text-sm text-muted-foreground">{desc}</p>
          </Link>
        ))}
      </div>

      {teacher?.center && (
        <div className="card p-4 mb-6 bg-accent">
          <div className="flex items-start gap-3">
            <FiHome className="w-5 h-5 text-primary mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">{t('dashboard.teacher.affiliatedCenter')}</p>
              <p className="font-semibold">{teacher.center.name}</p>
              {teacher.teacherCode && (
                <div className="mt-3 p-3 bg-card rounded-lg border border-border">
                  <p className="text-xs text-muted-foreground mb-1">{t('dashboard.teacher.teacherCodeHint')}</p>
                  <div className="flex items-center gap-2">
                    <code className="text-lg font-bold text-accent-foreground tracking-wider">{teacher.teacherCode}</code>
                    <button
                      type="button"
                      onClick={() => navigator.clipboard.writeText(teacher.teacherCode)}
                      className="p-1.5 rounded hover:bg-accent text-primary"
                      title={t('dashboard.teacher.copyCode')}
                    >
                      <FiCopy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {(!teacher || !teacher.center) && (
        <div className="card p-6 mb-6">
          <h2 className="font-semibold mb-2">{t('dashboard.teacher.joinCenter')}</h2>
          <p className="text-sm text-muted-foreground mb-4">
            {isNewTeacher
              ? t('dashboard.teacher.joinCenterNewHint')
              : t('dashboard.teacher.joinCenterHint')}
          </p>
          {!isNewTeacher && <JoinCenterForm onSuccess={refresh} compact />}
        </div>
      )}

      <div className="card p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">{t('dashboard.teacher.myCourses')}</h2>
          <Link
            to="/dashboard/teacher/courses"
            state={{ createCourse: courses.length === 0 }}
            className="text-primary text-sm hover:underline"
          >
            {courses.length > 0 ? t('dashboard.student.viewAll') : t('common.addCourse')}
          </Link>
        </div>
        {courses.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <FiBook className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm mb-3">{t('dashboard.teacher.noCourses')}</p>
            {teacher ? (
              <Link
                to="/dashboard/teacher/courses"
                state={{ createCourse: true }}
                className="btn-primary inline-flex items-center gap-2 text-sm"
              >
                <FiPlus /> {t('dashboard.teacher.createFirstCourse')}
              </Link>
            ) : (
              <p className="text-xs">{t('dashboard.teacher.completeProfileCourses')}</p>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {courses.slice(0, 5).map((course) => (
              <div
                key={course._id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-2 border-b border-border last:border-0"
              >
                <div>
                  <p className="font-medium text-sm">{course.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {course.subject} • {course.isPublished ? t('common.published') : t('common.draft')}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Link
                    to="/dashboard/teacher/courses"
                    state={{ editCourseId: course._id }}
                    className="btn-primary text-sm flex items-center gap-1 py-1.5 px-3"
                  >
                    <FiEdit2 className="w-3.5 h-3.5" /> {t('common.edit')}
                  </Link>
                  <Link
                    to={`/courses/${course._id}`}
                    className="btn-secondary text-sm py-1.5 px-3"
                  >
                    {t('common.view')}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {teacher && (
        <div className="card p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold flex items-center gap-2">
              <FiMessageSquare className="w-4 h-4 text-primary" />
              {t('dashboard.teacher.studentQuestions')}
            </h2>
          </div>
          {studentQuestions.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t('dashboard.teacher.noQuestions')}</p>
          ) : (
            <div className="space-y-3">
              {studentQuestions.map((question) => (
                <div
                  key={question._id}
                  className="py-3 border-b border-border last:border-0"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground line-clamp-2">
                        {question.content}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {question.user?.name} • {question.course?.title} • {formatDateTime(question.createdAt)}
                        {question.replies?.length > 0 && (
                          <span> • {t('common.replies', { count: question.replies.length })}</span>
                        )}
                      </p>
                    </div>
                    <Link
                      to={`/courses/${question.course?._id}?tab=comments`}
                      className="btn-secondary text-sm py-1.5 px-3 shrink-0"
                    >
                      {t('common.reply')}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="card p-6">
        <h2 className="font-semibold mb-4">{t('dashboard.teacher.upcomingSessions')}</h2>
        {upcoming.length === 0 ? (
          <div className="text-sm text-muted-foreground">
            <p>{t('dashboard.teacher.noUpcomingSessions')}</p>
            {teacher ? (
              <Link to="/dashboard/teacher/live" className="text-primary hover:underline mt-1 inline-block">
                {t('dashboard.teacher.scheduleFromLive')}
              </Link>
            ) : (
              <p className="text-xs mt-1">{t('dashboard.teacher.completeProfileLive')}</p>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {upcoming.map((session) => (
              <div key={session._id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div>
                  <p className="font-medium text-sm">{session.title}</p>
                  <p className="text-xs text-muted-foreground">{session.course?.title} • {formatDateTime(session.scheduledAt)}</p>
                </div>
                <Link to="/dashboard/teacher/live" className="text-primary text-sm hover:underline">{t('common.manage')}</Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherDashboard;
