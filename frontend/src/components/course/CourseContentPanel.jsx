import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  FiPlay,
  FiFileText,
  FiHelpCircle,
  FiClipboard,
  FiVideo,
  FiCheck,
  FiExternalLink,
  FiLock,
} from 'react-icons/fi';
import { getEntityId } from '../../utils/entityId';
import { resolveMediaUrl } from '../../utils/mediaUrl';
import { getSessionRoomSlug } from '../../utils/jitsi';
import EmptyState from './EmptyState';
import CourseCommentsPanel from './CourseCommentsPanel';

const panelMotion = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -6 },
  transition: { duration: 0.22 },
};

const SectionHeader = ({ title, description, count, itemsLabel }) => (
  <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 mb-6 pb-4 border-b border-border/80">
    <div>
      <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">{title}</h2>
      {description && (
        <p className="text-sm text-muted-foreground mt-1.5 max-w-2xl">{description}</p>
      )}
    </div>
    {count != null && (
      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground shrink-0">
        {count} {itemsLabel}
      </span>
    )}
  </div>
);

const LessonNumber = ({ index, completed }) => (
  <div
    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
      completed
        ? 'bg-primary/10 text-primary ring-1 ring-primary/15'
        : 'bg-accent text-accent-foreground'
    }`}
  >
    {completed ? <FiCheck className="w-4 h-4" /> : index}
  </div>
);

const CourseContentPanel = ({
  activeTab,
  course,
  courseId,
  enrollment,
  isAuthenticated,
  isEnrolled,
  isCourseTeacher,
  canAccessContent,
  videoError,
  onOpenVideo,
  canOpenVideo,
  onCommentCountChange,
}) => {
  const { t } = useTranslation();
  const itemsLabel = (count) => t(count === 1 ? 'common.item' : 'common.items');

  return (
  <div className="rounded-2xl border border-border/80 bg-card shadow-premium ring-1 ring-border/30 min-h-[360px] overflow-hidden">
    <AnimatePresence mode="wait">
      <motion.div key={activeTab} {...panelMotion} className="p-5 sm:p-6 lg:p-8">
        {activeTab === 'videos' && (
          <>
            <SectionHeader
              title={t('coursePage.content.videoCurriculum')}
              description={t('coursePage.content.videoDesc')}
              count={course.videos?.length || 0}
              itemsLabel={itemsLabel(course.videos?.length || 0)}
            />
            {videoError && (
              <div className="mb-4 p-3.5 rounded-xl bg-destructive-muted text-destructive-muted-foreground text-sm border border-destructive-muted flex items-start gap-2">
                <FiLock className="w-4 h-4 shrink-0 mt-0.5" />
                {videoError}
              </div>
            )}
            {!course.videos?.length ? (
              <EmptyState
                icon={FiPlay}
                title={t('coursePage.content.noVideos')}
                description={t('coursePage.content.noVideosDesc')}
              />
            ) : (
              <div className="divide-y divide-border/80 rounded-xl border border-border/80 overflow-hidden bg-background/50">
                {course.videos.map((video, i) => {
                  const accessible = canOpenVideo(video);
                  const completed = enrollment?.progress?.completedVideos?.includes(video._id);
                  return (
                    <button
                      key={video._id}
                      type="button"
                      onClick={() => onOpenVideo(video)}
                      disabled={!accessible}
                      className={`w-full flex items-center gap-4 p-4 sm:p-5 text-left transition-colors ${
                        accessible
                          ? 'hover:bg-accent/50 cursor-pointer'
                          : 'opacity-55 cursor-not-allowed bg-muted/40'
                      }`}
                    >
                      <LessonNumber index={i + 1} completed={completed} />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-foreground text-sm sm:text-base">
                          {video.title}
                        </h4>
                        <p className="text-xs text-muted-foreground mt-1 flex flex-wrap items-center gap-2">
                          {accessible ? (
                            <>
                              <span className="inline-flex items-center gap-1 text-primary font-medium">
                                <FiExternalLink className="w-3 h-3" /> {t('coursePage.content.openLesson')}
                              </span>
                            </>
                          ) : (
                            <span className="inline-flex items-center gap-1">
                              <FiLock className="w-3 h-3" /> {t('coursePage.content.enrollToUnlock')}
                            </span>
                          )}
                          {video.isPreview && !isEnrolled && (
                            <span className="px-1.5 py-0.5 rounded bg-accent text-accent-foreground text-[10px] font-bold uppercase">
                              {t('coursePage.content.preview')}
                            </span>
                          )}
                        </p>
                      </div>
                      {accessible && (
                        <div className="hidden sm:flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary shrink-0">
                          <FiPlay className="w-4 h-4 ml-0.5" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </>
        )}

        {activeTab === 'pdfs' && (
          <>
            <SectionHeader
              title={t('coursePage.content.lessonsMaterials')}
              description={t('coursePage.content.lessonsDesc')}
              count={course.pdfs?.length || 0}
              itemsLabel={itemsLabel(course.pdfs?.length || 0)}
            />
            {!course.pdfs?.length ? (
              <EmptyState
                icon={FiFileText}
                title={t('coursePage.content.noMaterials')}
                description={t('coursePage.content.noMaterialsDesc')}
              />
            ) : (
              <div className="divide-y divide-border/80 rounded-xl border border-border/80 overflow-hidden bg-background/50">
                {course.pdfs.map((pdf, i) =>
                  canAccessContent ? (
                    <a
                      key={pdf._id}
                      href={resolveMediaUrl(pdf.url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-4 p-4 sm:p-5 hover:bg-accent/50 transition-colors"
                    >
                      <LessonNumber index={i + 1} completed={false} />
                      <span className="font-medium text-foreground flex-1">{pdf.title}</span>
                      <FiExternalLink className="w-4 h-4 text-primary shrink-0" />
                    </a>
                  ) : (
                    <div
                      key={pdf._id}
                      className="flex items-center gap-4 p-4 sm:p-5 text-muted-foreground bg-muted/40"
                    >
                      <LessonNumber index={i + 1} completed={false} />
                      <span className="flex-1">{pdf.title}</span>
                      <FiLock className="w-4 h-4 shrink-0" />
                    </div>
                  )
                )}
              </div>
            )}
          </>
        )}

        {activeTab === 'quizzes' && (
          <>
            <SectionHeader
              title={t('coursePage.content.quizzesTitle')}
              description={t('coursePage.content.quizzesDesc')}
              count={course.quizzes?.length || 0}
              itemsLabel={itemsLabel(course.quizzes?.length || 0)}
            />
            {!course.quizzes?.length ? (
              <EmptyState
                icon={FiHelpCircle}
                title={t('coursePage.content.noQuizzes')}
                description={t('coursePage.content.noQuizzesDesc')}
              />
            ) : (
              <div className="space-y-3">
                {course.quizzes.map((quiz, i) => {
                  const quizId = getEntityId(quiz);
                  const quizPath = quizId ? `/courses/${courseId}/quiz/${quizId}` : null;
                  return (
                    <div
                      key={quizId || quiz.title}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl border border-border/80 hover:border-primary/30 hover:shadow-premium transition-all bg-background ring-1 ring-border/20"
                    >
                      <div className="flex items-start gap-4">
                        <LessonNumber index={i + 1} completed={false} />
                        <div>
                          <h4 className="font-semibold text-foreground">{quiz.title}</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {quiz.questions?.length || 0} questions • {quiz.timeLimit || 30} min
                          </p>
                        </div>
                      </div>
                      {!quizPath ? (
                        <span className="text-sm text-muted-foreground">{t('coursePage.content.unavailable')}</span>
                      ) : !isAuthenticated ? (
                        <Link
                          to="/login"
                          state={{ from: { pathname: quizPath } }}
                          className="btn-primary text-sm py-2.5 px-5 shrink-0 rounded-xl"
                        >
                          {t('common.signIn')}
                        </Link>
                      ) : (
                        <Link to={quizPath} className="btn-primary text-sm py-2.5 px-5 shrink-0 rounded-xl">
                          {t('coursePage.content.startQuiz')}
                        </Link>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {activeTab === 'exams' && (
          <>
            <SectionHeader
              title="Exams"
              description="Formal assessments to validate your mastery."
              count={course.exams?.length || 0}
            />
            {!course.exams?.length ? (
              <EmptyState
                icon={FiClipboard}
                title="No exams scheduled"
                description="Exam details will appear here when available."
              />
            ) : (
              <div className="space-y-3">
                {course.exams.map((exam, i) => {
                  const examId = getEntityId(exam);
                  const examPath = examId ? `/courses/${courseId}/exam/${examId}` : null;
                  return (
                    <div
                      key={examId || exam.title}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl border border-border/80 hover:border-primary/30 hover:shadow-premium transition-all bg-background ring-1 ring-border/20"
                    >
                      <div className="flex items-start gap-4">
                        <LessonNumber index={i + 1} completed={false} />
                        <div>
                          <h4 className="font-semibold text-foreground">{exam.title}</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {exam.duration} min • Pass score: {exam.passingScore}%
                          </p>
                        </div>
                      </div>
                      {!examPath ? (
                        <span className="text-sm text-muted-foreground">Unavailable</span>
                      ) : !isAuthenticated ? (
                        <Link
                          to="/login"
                          state={{ from: { pathname: examPath } }}
                          className="btn-primary text-sm py-2.5 px-5 shrink-0 rounded-xl"
                        >
                          Sign in
                        </Link>
                      ) : (
                        <Link to={examPath} className="btn-primary text-sm py-2.5 px-5 shrink-0 rounded-xl">
                          Start exam
                        </Link>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {activeTab === 'live' && (
          <>
            <SectionHeader
              title={t('coursePage.content.liveSessionsTitle')}
              description={t('coursePage.content.liveSessionsDesc')}
              count={course.liveSessions?.length || 0}
              itemsLabel={itemsLabel(course.liveSessions?.length || 0)}
            />
            {!course.liveSessions?.length ? (
              <EmptyState
                icon={FiVideo}
                title={t('coursePage.content.noLiveSessions')}
                description={t('coursePage.content.noLiveSessionsDesc')}
              />
            ) : (
              <div className="space-y-3">
                {course.liveSessions.map((session) => {
                  const isLive = session.status === 'live';
                  const isUpcoming = session.status === 'scheduled';
                  const isEnded = session.status === 'ended' || session.status === 'cancelled';
                  return (
                  <div
                    key={session._id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl border border-border/80 bg-background ring-1 ring-border/20"
                  >
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-semibold text-foreground">{session.title}</h4>
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full capitalize ${
                            isLive
                              ? 'bg-primary text-primary-foreground'
                              : isUpcoming
                                ? 'bg-accent text-accent-foreground'
                                : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {t(`live.status.${session.status}`, { defaultValue: session.status })}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {new Date(session.scheduledAt).toLocaleString()}
                        {session.duration ? ` • ${session.duration} min` : ''}
                      </p>
                    </div>
                    {isLive && getSessionRoomSlug(session) && (
                      <Link
                        to={`/live/${getSessionRoomSlug(session)}`}
                        className="inline-flex items-center justify-center gap-2 py-2.5 px-5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold shrink-0 hover:opacity-95 transition-opacity"
                      >
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75" />
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary" />
                        </span>
                        {t('live.joinLive')}
                      </Link>
                    )}
                    {isUpcoming && (
                      <span className="text-sm text-muted-foreground shrink-0">
                        Starts {new Date(session.scheduledAt).toLocaleString()}
                      </span>
                    )}
                    {isEnded && (
                      <span className="text-sm text-muted-foreground shrink-0 capitalize">
                        Session {session.status}
                      </span>
                    )}
                  </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {activeTab === 'comments' && (
          <>
            <SectionHeader
              title={t('coursePage.content.commentsTitle')}
              description={t('coursePage.content.commentsDesc')}
              count={undefined}
            />
            <CourseCommentsPanel
              courseId={courseId}
              isAuthenticated={isAuthenticated}
              isEnrolled={isEnrolled}
              isCourseTeacher={isCourseTeacher}
              onCountChange={onCommentCountChange}
            />
          </>
        )}
      </motion.div>
    </AnimatePresence>
  </div>
  );
};

export default CourseContentPanel;
