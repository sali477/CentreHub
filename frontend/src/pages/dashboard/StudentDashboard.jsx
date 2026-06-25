import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import {
  FiBook, FiCheckCircle, FiTrendingUp, FiVideo, FiBell, FiClock,
} from 'react-icons/fi';
import { fetchNotifications } from '../../store/slices/notificationSlice';
import { formatDateTime } from '../../utils/helpers';
import CourseCard from '../../components/courses/CourseCard';
import { aiAPI } from '../../api/index';
import { useStudentEnrollments, useStudentWelcome } from '../../hooks/useStudentDashboard';
import StudentJoinByCode from '../../components/dashboard/student/StudentJoinByCode';
import { StatCard, ProgressBar, LiveStatusBadge } from '../../components/dashboard/student/studentUi';
import { getSessionRoomSlug } from '../../utils/jitsi';

const StudentDashboard = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const welcomeName = useStudentWelcome();
  const { list: notifications } = useSelector((state) => state.notifications);
  const [recommendations, setRecommendations] = useState({ courses: [] });

  const {
    enrollments,
    loading,
    error,
    refresh,
    stats,
    liveSessions,
  } = useStudentEnrollments();

  useEffect(() => {
    dispatch(fetchNotifications());
    aiAPI.recommendations().then(({ data }) => setRecommendations(data.data)).catch(() => {});
  }, [dispatch]);

  const liveNotifications = notifications.filter((n) => n.type === 'live_session').slice(0, 3);
  const upcomingLive = liveSessions.filter((s) => s.status === 'scheduled' || s.status === 'live').slice(0, 4);
  const recentEnrollments = enrollments.slice(0, 4);
  const continueLearning = enrollments
    .filter((e) => e.status === 'active' && (e.progress?.percentage || 0) < 100)
    .sort((a, b) => (b.progress?.percentage || 0) - (a.progress?.percentage || 0))
    .slice(0, 3);

  if (loading) {
    return <div className="animate-pulse h-64 bg-muted rounded-xl" />;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
          {t('dashboard.student.welcome', { name: welcomeName })}
        </h1>
        <p className="text-muted-foreground mt-1">
          {t('dashboard.student.overviewSubtitle')}
        </p>
      </div>

      {error && (
        <div className="card p-4 text-sm text-destructive-muted-foreground border border-destructive/20">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={FiBook} label={t('dashboard.student.enrolledCourses')} value={stats.total} />
        <StatCard icon={FiCheckCircle} label={t('dashboard.student.completed')} value={stats.completed} />
        <StatCard icon={FiTrendingUp} label={t('dashboard.student.avgProgress')} value={`${stats.avgProgress}%`} />
        <StatCard icon={FiVideo} label={t('dashboard.student.liveClasses')} value={liveSessions.length} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <section className="xl:col-span-2 card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <FiVideo className="w-5 h-5 text-primary" />
              {t('dashboard.student.upcomingLive')}
            </h2>
            <Link to="/dashboard/student/live" className="text-sm text-primary hover:underline">
              {t('dashboard.student.viewAll')}
            </Link>
          </div>
          {upcomingLive.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t('dashboard.student.noUpcomingLive')}</p>
          ) : (
            <div className="space-y-3">
              {upcomingLive.map((session) => (
                <div
                  key={session._id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-border bg-muted/30"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium text-foreground truncate">{session.title}</p>
                      <LiveStatusBadge status={session.status} />
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {session.courseTitle} • {formatDateTime(session.scheduledAt)}
                    </p>
                  </div>
                  {session.status === 'live' && getSessionRoomSlug(session) && (
                    <Link
                      to={`/live/${getSessionRoomSlug(session)}`}
                      className="btn-primary text-sm py-2 px-4 shrink-0 inline-flex items-center justify-center"
                    >
                      {t('live.joinLive')}
                    </Link>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="card p-6">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-4">
            <FiBell className="w-5 h-5 text-primary" />
            {t('dashboard.student.liveNotifications')}
          </h2>
          {liveNotifications.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t('dashboard.student.noLiveAlerts')}</p>
          ) : (
            <ul className="space-y-3">
              {liveNotifications.map((notif) => (
                <li key={notif._id} className="text-sm border-b border-border pb-3 last:border-0">
                  <p className="font-medium text-foreground">{notif.title}</p>
                  <p className="text-muted-foreground mt-0.5 line-clamp-2">{notif.message}</p>
                  {notif.link && (
                    <Link to={notif.link} className="text-primary text-xs mt-1 inline-block hover:underline">
                      {t('live.openInTab')}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          )}
          <Link to="/notifications" className="text-sm text-primary hover:underline mt-4 inline-block">
            {t('dashboard.student.allNotifications')}
          </Link>
        </section>
      </div>

      <section className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <FiClock className="w-5 h-5 text-primary" />
            {t('dashboard.student.continueLearning')}
          </h2>
          <Link to="/dashboard/student/courses" className="text-sm text-primary hover:underline">
            {t('dashboard.student.myCourses')}
          </Link>
        </div>
        {continueLearning.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {t('dashboard.student.caughtUp')}
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {continueLearning.map((enrollment) => (
              <Link
                key={enrollment._id}
                to={`/courses/${enrollment.course?._id}`}
                className="rounded-xl border border-border p-4 hover:border-primary/30 hover:shadow-premium transition-all bg-card"
              >
                <p className="font-semibold text-foreground line-clamp-2">
                  {enrollment.course?.title}
                </p>
                <p className="text-xs text-muted-foreground mt-1 capitalize">{enrollment.status}</p>
                <div className="mt-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-semibold text-primary">
                      {enrollment.progress?.percentage || 0}%
                    </span>
                  </div>
                  <ProgressBar value={enrollment.progress?.percentage} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="card p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">{t('dashboard.student.progressSummary')}</h2>
        {enrollments.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {t('dashboard.student.noCourses')}{' '}
            <Link to="/courses" className="text-primary hover:underline">{t('dashboard.student.browseCourses')}</Link>
          </p>
        ) : (
          <div className="space-y-4">
            {enrollments.slice(0, 5).map((enrollment) => (
              <div key={enrollment._id} className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex-1 min-w-0">
                  <Link
                    to={`/courses/${enrollment.course?._id}`}
                    className="font-medium text-foreground hover:text-primary transition-colors truncate block"
                  >
                    {enrollment.course?.title}
                  </Link>
                  <p className="text-xs text-muted-foreground capitalize">{enrollment.status}</p>
                </div>
                <div className="w-full sm:w-48">
                  <ProgressBar value={enrollment.progress?.percentage} />
                  <p className="text-xs text-muted-foreground mt-1 text-right">
                    {enrollment.progress?.percentage || 0}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {recentEnrollments.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-4">{t('dashboard.student.recentActivity')}</h2>
          <div className="space-y-2">
            {recentEnrollments.map((enrollment) => (
              <div key={enrollment._id} className="card p-4 flex items-center justify-between gap-3 text-sm">
                <span className="text-muted-foreground">
                  {t('dashboard.student.enrolledIn')}{' '}
                  <span className="text-foreground font-medium">{enrollment.course?.title}</span>
                </span>
                <span className="text-xs text-muted-foreground shrink-0">
                  {formatDateTime(enrollment.enrolledAt || enrollment.createdAt)}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      <StudentJoinByCode onEnrolled={refresh} />

      {recommendations.courses?.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-4">{t('dashboard.student.recommended')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendations.courses.map((course, i) => (
              <CourseCard key={course._id} course={course} index={i} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default StudentDashboard;
