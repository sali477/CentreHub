import { useEffect, useMemo, useState } from 'react';

import { Link, useParams } from 'react-router-dom';

import { useSelector } from 'react-redux';

import { useTranslation } from 'react-i18next';

import { FiUsers, FiArrowLeft, FiLoader, FiExternalLink } from 'react-icons/fi';

import { liveSessionAPI } from '../api/index';

import {

  buildJitsiEmbedUrl,

  buildJitsiMeetingUrl,

  getSessionRoomSlug,

} from '../utils/jitsi';



const STATUS_STYLES = {

  scheduled: 'bg-accent text-accent-foreground',

  live: 'bg-primary text-primary-foreground',

  ended: 'bg-muted text-muted-foreground',

  cancelled: 'bg-destructive-muted text-destructive-muted-foreground',

};



const LiveSession = () => {

  const { t } = useTranslation();

  const { roomId } = useParams();

  const { user } = useSelector((state) => state.auth);



  const [session, setSession] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState('');

  const [iframeLoaded, setIframeLoaded] = useState(false);



  useEffect(() => {

    let cancelled = false;



    const loadSession = async () => {

      setLoading(true);

      setError('');

      setIframeLoaded(false);



      try {

        const { data } = await liveSessionAPI.getByRoom(roomId);

        const sessionData = data.data;

        if (cancelled) return;



        setSession(sessionData);



        if (sessionData._id) {

          try {

            await liveSessionAPI.join(sessionData._id);

          } catch {

            /* attendance tracking optional */

          }

        }

      } catch (err) {

        if (!cancelled) {

          setError(err.response?.data?.message || t('live.notFound'));

        }

      } finally {

        if (!cancelled) setLoading(false);

      }

    };



    loadSession();

    return () => {

      cancelled = true;

    };

  }, [roomId, t]);



  const roomSlug = getSessionRoomSlug(session);

  const meetingUrl = session?.meetingUrl || (roomSlug ? buildJitsiMeetingUrl(roomSlug) : '');



  const embedUrl = useMemo(

    () => buildJitsiEmbedUrl(roomSlug, { displayName: user?.name }),

    [roomSlug, user?.name]

  );



  const participantCount = session?.participants?.length || 0;



  if (loading) {

    return (

      <div className="min-h-screen bg-surface-elevated flex items-center justify-center text-surface-elevated-foreground gap-2">

        <FiLoader className="w-5 h-5 animate-spin" />

        <span>{t('live.loadingSession')}</span>

      </div>

    );

  }



  if (error || !session || !roomSlug) {

    return (

      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 text-center">

        <p className="text-foreground font-semibold mb-2">{t('live.unableToJoin')}</p>

        <p className="text-muted-foreground mb-6">{error || t('live.sessionUnavailable')}</p>

        <Link to="/" className="btn-primary inline-flex items-center gap-2">

          <FiArrowLeft className="w-4 h-4" /> {t('common.backToHome')}

        </Link>

      </div>

    );

  }



  const cannotJoin = session.status === 'ended' || session.status === 'cancelled';

  const statusLabel = t(`live.status.${session.status}`, { defaultValue: session.status });



  return (

    <div className="min-h-screen bg-surface-elevated text-surface-elevated-foreground flex flex-col">

      <header className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-surface-elevated-muted border-b border-border shrink-0">

        <div className="min-w-0">

          <div className="flex flex-wrap items-center gap-2">

            <h1 className="font-bold truncate">{session.title}</h1>

            <span

              className={`text-xs px-2 py-0.5 rounded-full capitalize shrink-0 ${STATUS_STYLES[session.status] || STATUS_STYLES.scheduled}`}

            >

              {statusLabel}

            </span>

          </div>

          <p className="text-muted-foreground text-xs mt-0.5 truncate">

            {session.course?.title}

            {session.description ? ` • ${session.description}` : ''}

          </p>

        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground shrink-0">

          <span className="inline-flex items-center gap-1">

            <FiUsers className="w-3.5 h-3.5" />

            {t('common.joinedCount', { count: participantCount })}

          </span>

          {!cannotJoin && meetingUrl && (

            <a

              href={meetingUrl}

              target="_blank"

              rel="noopener noreferrer"

              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border bg-muted/40 hover:bg-muted transition-colors text-foreground"

            >

              <FiExternalLink className="w-3.5 h-3.5" /> {t('live.openInTab')}

            </a>

          )}

          <Link

            to="/"

            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border bg-muted/40 hover:bg-muted transition-colors text-foreground"

          >

            <FiArrowLeft className="w-3.5 h-3.5" /> {t('common.leave')}

          </Link>

        </div>

      </header>



      {cannotJoin ? (

        <div className="flex-1 flex flex-col items-center justify-center px-4 text-center">

          <p className="text-lg font-semibold mb-2">{t('live.sessionEnded')}</p>

          <p className="text-muted-foreground mb-6">

            {t('live.sessionEndedDesc')}

          </p>

          <Link to="/" className="btn-primary">{t('live.returnHome')}</Link>

        </div>

      ) : (

        <div className="flex-1 min-h-0 relative bg-black">

          {!iframeLoaded && (

            <div className="absolute inset-0 flex flex-col items-center justify-center bg-surface-elevated z-10 gap-3">

              <FiLoader className="w-8 h-8 animate-spin text-primary" />

              <p className="text-sm text-muted-foreground">{t('live.connectingJitsi')}</p>

              {meetingUrl && (

                <a

                  href={meetingUrl}

                  target="_blank"

                  rel="noopener noreferrer"

                  className="text-sm text-primary hover:underline inline-flex items-center gap-1"

                >

                  <FiExternalLink className="w-4 h-4" />

                  {t('live.troubleOpenTab')}

                </a>

              )}

            </div>

          )}

          <iframe

            key={embedUrl}

            src={embedUrl}

            title={session.title}

            className="w-full h-full border-0"

            style={{ minHeight: 'calc(100vh - 4rem)' }}

            allow="camera; microphone; fullscreen; display-capture; autoplay; clipboard-write"

            allowFullScreen

            onLoad={() => setIframeLoaded(true)}

          />

        </div>

      )}

    </div>

  );

};



export default LiveSession;

