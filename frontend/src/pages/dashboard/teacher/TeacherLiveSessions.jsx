import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FiPlus, FiVideo, FiPlay, FiX, FiCopy, FiUsers, FiZap, FiExternalLink } from 'react-icons/fi';
import { liveSessionAPI } from '../../../api/index';
import useMyTeacher from '../../../hooks/useMyTeacher';
import TeacherSetupBanner from './TeacherSetupBanner';
import { formatDateTime } from '../../../utils/helpers';
import { getSessionRoomSlug } from '../../../utils/jitsi';

const STATUS_COLORS = {
  scheduled: 'bg-accent text-accent-foreground',
  live: 'bg-primary text-primary-foreground',
  ended: 'bg-muted text-muted-foreground',
  cancelled: 'bg-destructive-muted text-destructive-muted-foreground',
};

const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
};

const SessionCard = ({ session, onUpdateStatus }) => {
  const invitedStudents = session.course?.enrolledStudents || [];
  const meetingUrl = session.meetingUrl || `https://meet.jit.si/${session.jitsiRoomName || session.roomId}`;

  const handleCopy = async () => {
    const ok = await copyToClipboard(meetingUrl);
    if (ok) alert('Meeting link copied');
  };

  return (
    <div className="card p-5 space-y-4">
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h3 className="font-semibold text-foreground">{session.title}</h3>
            <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${STATUS_COLORS[session.status] || ''}`}>
              {session.status}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            {session.course?.title} • {formatDateTime(session.scheduledAt)} • {session.duration} min
          </p>
          {session.description && (
            <p className="text-sm text-muted-foreground mt-1">{session.description}</p>
          )}
          <p className="text-xs text-muted-foreground mt-2">
            {session.participants?.length || 0} participant(s) joined
          </p>
        </div>

        <div className="flex flex-wrap gap-2 shrink-0">
          {session.status === 'scheduled' && (
            <>
              <button
                type="button"
                onClick={() => onUpdateStatus(session._id, 'live')}
                className="btn-primary text-sm flex items-center gap-1 py-2"
              >
                <FiPlay /> Start Live
              </button>
              <button
                type="button"
                onClick={() => onUpdateStatus(session._id, 'cancelled')}
                className="btn-secondary text-sm flex items-center gap-1 py-2"
              >
                <FiX /> Cancel
              </button>
            </>
          )}
          {session.status === 'live' && (
            <>
              <Link to={`/live/${getSessionRoomSlug(session)}`} className="btn-primary text-sm flex items-center gap-1 py-2">
                <FiVideo /> Join Live
              </Link>
              <button
                type="button"
                onClick={() => onUpdateStatus(session._id, 'ended')}
                className="btn-secondary text-sm py-2"
              >
                End Session
              </button>
            </>
          )}
          {(session.status === 'scheduled' || session.status === 'live') && (
            <a
              href={meetingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary text-sm flex items-center gap-1 py-2"
            >
              <FiExternalLink /> Open Jitsi
            </a>
          )}
        </div>
      </div>

      {(session.status === 'scheduled' || session.status === 'live') && (
        <div className="rounded-xl border border-border bg-muted/30 p-3 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
              Jitsi meeting link
            </p>
            <p className="text-sm text-primary font-mono truncate">{meetingUrl}</p>
          </div>
          <button type="button" onClick={handleCopy} className="btn-secondary text-sm py-2 px-3 shrink-0 inline-flex items-center gap-1">
            <FiCopy className="w-4 h-4" /> Copy
          </button>
        </div>
      )}

      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1">
          <FiUsers className="w-3.5 h-3.5" />
          Invited students ({invitedStudents.length})
        </p>
        {invitedStudents.length === 0 ? (
          <p className="text-sm text-muted-foreground">No enrolled students yet.</p>
        ) : (
          <ul className="flex flex-wrap gap-2">
            {invitedStudents.map((student) => (
              <li
                key={student._id}
                className="text-xs px-2.5 py-1 rounded-full bg-accent text-accent-foreground"
              >
                {student.name || student.email}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

const TeacherLiveSessions = () => {
  const { t } = useTranslation();
  const { teacher, sessions, loading, refresh } = useMyTeacher();
  const [showForm, setShowForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [quickStarting, setQuickStarting] = useState(false);
  const [form, setForm] = useState({
    title: '', description: '', course: '', scheduledAt: '', duration: 60,
  });

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.course) {
      alert('Please select a course');
      return;
    }
    setCreating(true);
    try {
      await liveSessionAPI.create({
        title: form.title,
        description: form.description,
        course: form.course,
        scheduledAt: new Date(form.scheduledAt).toISOString(),
        duration: Number(form.duration),
      });
      setShowForm(false);
      setForm({ title: '', description: '', course: '', scheduledAt: '', duration: 60 });
      refresh();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to schedule session');
    } finally {
      setCreating(false);
    }
  };

  const handleQuickStart = async () => {
    const courseId = form.course || courses[0]?._id;
    if (!courseId) {
      alert('Create a course first');
      return;
    }
    setQuickStarting(true);
    try {
      const { data } = await liveSessionAPI.quickStart({
        course: courseId,
        title: form.title || undefined,
        description: form.description || undefined,
      });
      refresh();
      if (data?.data) {
        const slug = getSessionRoomSlug(data.data);
        const url = data.data.meetingUrl || (slug ? `https://meet.jit.si/${slug}` : '');
        if (url) {
          window.open(url, '_blank', 'noopener,noreferrer');
        }
        if (slug) {
          window.location.href = `/live/${slug}`;
        }
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to start live session');
    } finally {
      setQuickStarting(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      const { data } = await liveSessionAPI.updateStatus(id, status);
      refresh();
      if (status === 'live' && data?.data) {
        const slug = getSessionRoomSlug(data.data);
        const url = data.data.meetingUrl || (slug ? `https://meet.jit.si/${slug}` : '');
        if (url) {
          window.open(url, '_blank', 'noopener,noreferrer');
        }
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update session');
    }
  };

  if (loading) return <div className="animate-pulse h-64 bg-muted rounded-xl" />;

  const needsSetup = !teacher;
  const courses = teacher?.courses || [];
  const sortedSessions = [...(sessions || [])].sort(
    (a, b) => new Date(b.scheduledAt) - new Date(a.scheduledAt)
  );

  const liveNow = sortedSessions.filter((s) => s.status === 'live');
  const upcoming = sortedSessions.filter((s) => s.status === 'scheduled');
  const past = sortedSessions.filter((s) => s.status === 'ended' || s.status === 'cancelled');

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">{t('dashboard.teacher.nav.live')}</h1>
          <p className="text-muted-foreground">
            Jitsi Meet — video, audio, chat & screen sharing
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleQuickStart}
            disabled={needsSetup || courses.length === 0 || quickStarting}
            className="btn-primary flex items-center gap-2 disabled:opacity-50"
          >
            <FiZap /> {quickStarting ? 'Starting…' : 'Go Live Now'}
          </button>
          <button
            type="button"
            onClick={() => setShowForm(!showForm)}
            className="btn-secondary flex items-center gap-2 disabled:opacity-50"
            disabled={needsSetup || courses.length === 0}
          >
            <FiPlus /> Schedule Session
          </button>
        </div>
      </div>

      {needsSetup && <TeacherSetupBanner onComplete={refresh} />}

      {!needsSetup && courses.length === 0 && (
        <div className="bg-accent text-accent-foreground p-4 rounded-lg mb-4 text-sm">
          Create a course first before scheduling live sessions.
        </div>
      )}

      {!needsSetup && courses.length > 0 && (
        <div className="card p-4 mb-6 flex flex-col sm:flex-row sm:items-end gap-3">
          <div className="flex-1">
            <label className="block text-sm font-medium text-foreground mb-1">Course for quick live</label>
            <select
              className="input-field"
              value={form.course || courses[0]?._id || ''}
              onChange={(e) => setForm({ ...form, course: e.target.value })}
            >
              {courses.map((c) => (
                <option key={c._id} value={c._id}>{c.title}</option>
              ))}
            </select>
          </div>
          <p className="text-xs text-muted-foreground sm:max-w-xs">
            Go Live Now creates a Jitsi room instantly and notifies enrolled students.
          </p>
        </div>
      )}

      {!needsSetup && showForm && (
        <form onSubmit={handleCreate} className="card p-6 mb-6 space-y-4">
          <h2 className="font-semibold">Schedule Live Session</h2>
          <input
            required
            className="input-field"
            placeholder="Session Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <textarea
            className="input-field"
            rows={2}
            placeholder="Description (optional)"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <select
            required
            className="input-field"
            value={form.course}
            onChange={(e) => setForm({ ...form, course: e.target.value })}
          >
            <option value="">Select Course</option>
            {courses.map((c) => (
              <option key={c._id} value={c._id}>{c.title}</option>
            ))}
          </select>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              required
              type="datetime-local"
              className="input-field"
              value={form.scheduledAt}
              onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })}
            />
            <input
              type="number"
              min="15"
              className="input-field"
              placeholder="Duration (minutes)"
              value={form.duration}
              onChange={(e) => setForm({ ...form, duration: e.target.value })}
            />
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={creating} className="btn-primary">
              {creating ? 'Scheduling…' : 'Schedule & notify students'}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">
              Cancel
            </button>
          </div>
        </form>
      )}

      {sortedSessions.length === 0 ? (
        <div className="card p-8 text-center text-muted-foreground">
          <FiVideo className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
          <p>No live sessions yet. Use Go Live Now or schedule a session.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {liveNow.length > 0 && (
            <section>
              <h2 className="text-sm font-bold uppercase tracking-wider text-primary mb-3">Live now</h2>
              <div className="space-y-3">
                {liveNow.map((session) => (
                  <SessionCard key={session._id} session={session} onUpdateStatus={updateStatus} />
                ))}
              </div>
            </section>
          )}

          {upcoming.length > 0 && (
            <section>
              <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3">Upcoming</h2>
              <div className="space-y-3">
                {upcoming.map((session) => (
                  <SessionCard key={session._id} session={session} onUpdateStatus={updateStatus} />
                ))}
              </div>
            </section>
          )}

          {past.length > 0 && (
            <section>
              <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3">Past sessions</h2>
              <div className="space-y-3">
                {past.map((session) => (
                  <SessionCard key={session._id} session={session} onUpdateStatus={updateStatus} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
};

export default TeacherLiveSessions;
