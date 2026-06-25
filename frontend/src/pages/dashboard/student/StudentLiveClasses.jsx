import { Link } from 'react-router-dom';

import { useEffect } from 'react';

import { useDispatch, useSelector } from 'react-redux';

import { useTranslation } from 'react-i18next';

import { FiVideo, FiBell, FiCalendar } from 'react-icons/fi';

import { fetchNotifications } from '../../../store/slices/notificationSlice';

import { formatDateTime } from '../../../utils/helpers';

import { getSessionRoomSlug } from '../../../utils/jitsi';

import { useStudentEnrollments } from '../../../hooks/useStudentDashboard';

import { LiveStatusBadge } from '../../../components/dashboard/student/studentUi';



const StudentLiveClasses = () => {

  const { t } = useTranslation();

  const dispatch = useDispatch();

  const { list: notifications } = useSelector((state) => state.notifications);

  const { liveSessions, loading, error } = useStudentEnrollments();



  useEffect(() => {

    dispatch(fetchNotifications());

  }, [dispatch]);



  const liveNow = liveSessions.filter((s) => s.status === 'live');

  const upcoming = liveSessions.filter((s) => s.status === 'scheduled');

  const past = liveSessions.filter((s) => s.status === 'ended' || s.status === 'cancelled');

  const liveAlerts = notifications.filter((n) => n.type === 'live_session').slice(0, 5);



  if (loading) {

    return <div className="animate-pulse h-64 bg-muted rounded-xl" />;

  }



  const SessionRow = ({ session }) => (

    <div className="card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">

      <div className="min-w-0">

        <div className="flex flex-wrap items-center gap-2 mb-1">

          <h3 className="font-semibold text-foreground">{session.title}</h3>

          <LiveStatusBadge status={session.status} />

        </div>

        <p className="text-sm text-muted-foreground">

          {session.courseTitle} • {formatDateTime(session.scheduledAt)}

          {session.duration ? ` • ${t('common.minutesShort', { count: session.duration })}` : ''}

        </p>

        {session.description && (

          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{session.description}</p>

        )}

      </div>

      <div className="flex flex-wrap gap-2 shrink-0">

        {session.status === 'live' && getSessionRoomSlug(session) && (

          <Link to={`/live/${getSessionRoomSlug(session)}`} className="btn-primary text-sm py-2 px-4">

            {t('live.joinLive')}

          </Link>

        )}

        {session.status === 'scheduled' && (

          <span className="text-xs text-muted-foreground px-3 py-2 rounded-lg bg-muted/50">

            {t('common.startsAt', { date: formatDateTime(session.scheduledAt) })}

          </span>

        )}

      </div>

    </div>

  );



  return (

    <div className="space-y-8">

      <div>

        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">

          <FiVideo className="w-6 h-6 text-primary" />

          {t('dashboard.student.liveClassesTitle')}

        </h1>

        <p className="text-muted-foreground mt-1">

          {t('dashboard.student.liveClassesSubtitle')}

        </p>

      </div>



      {error && (

        <div className="card p-4 text-sm text-destructive-muted-foreground">{error}</div>

      )}



      {liveAlerts.length > 0 && (

        <section className="card p-6 border-primary/20 bg-accent/30">

          <h2 className="text-sm font-bold uppercase tracking-wider text-primary flex items-center gap-2 mb-3">

            <FiBell className="w-4 h-4" />

            {t('dashboard.student.newLiveNotifications')}

          </h2>

          <ul className="space-y-2">

            {liveAlerts.map((n) => (

              <li key={n._id} className="text-sm">

                <p className="font-medium text-foreground">{n.title}</p>

                <p className="text-muted-foreground">{n.message}</p>

                {n.link && (

                  <Link to={n.link} className="text-primary text-xs hover:underline">

                    {t('dashboard.student.joinSession')}

                  </Link>

                )}

              </li>

            ))}

          </ul>

        </section>

      )}



      {liveSessions.length === 0 ? (

        <div className="card p-10 text-center text-muted-foreground">

          <FiCalendar className="w-12 h-12 mx-auto mb-3 opacity-50" />

          <p>{t('dashboard.student.noLiveClasses')}</p>

        </div>

      ) : (

        <div className="space-y-8">

          {liveNow.length > 0 && (

            <section>

              <h2 className="text-sm font-bold uppercase tracking-wider text-primary mb-3">{t('live.liveNow')}</h2>

              <div className="space-y-3">

                {liveNow.map((s) => <SessionRow key={s._id} session={s} />)}

              </div>

            </section>

          )}

          {upcoming.length > 0 && (

            <section>

              <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3">{t('live.upcoming')}</h2>

              <div className="space-y-3">

                {upcoming.map((s) => <SessionRow key={s._id} session={s} />)}

              </div>

            </section>

          )}

          {past.length > 0 && (

            <section>

              <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3">{t('live.past')}</h2>

              <div className="space-y-3">

                {past.map((s) => <SessionRow key={s._id} session={s} />)}

              </div>

            </section>

          )}

        </div>

      )}

    </div>

  );

};



export default StudentLiveClasses;

