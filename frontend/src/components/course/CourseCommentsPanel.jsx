import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiSend, FiMessageSquare, FiLoader } from 'react-icons/fi';
import { discussionAPI } from '../../api/index';
import { formatDateTime } from '../../utils/helpers';
import { resolveMediaUrl } from '../../utils/mediaUrl';
import EmptyState from './EmptyState';

const Avatar = ({ user, size = 'md' }) => {
  const sizes = { md: 'h-10 w-10 text-sm', sm: 'h-8 w-8 text-xs' };
  const avatarUrl = user?.avatar ? resolveMediaUrl(user.avatar) : '';

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt=""
        className={`${sizes[size]} rounded-full object-cover shrink-0 ring-2 ring-primary/15`}
      />
    );
  }

  return (
    <div
      className={`${sizes[size]} rounded-full bg-primary/10 text-primary font-semibold flex items-center justify-center shrink-0 ring-2 ring-primary/15`}
    >
      {user?.name?.charAt(0)?.toUpperCase() || '?'}
    </div>
  );
};

const TeacherBadge = () => (
  <span className="inline-flex items-center rounded-md bg-accent px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-accent-foreground ring-1 ring-primary/15">
    Instructor
  </span>
);

const CommentBody = ({ comment, isReply = false }) => (
  <div className={`flex gap-3 ${isReply ? 'pl-0' : ''}`}>
    <Avatar user={comment.user} size={isReply ? 'sm' : 'md'} />
    <div className="flex-1 min-w-0">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <span className="font-semibold text-foreground text-sm">{comment.user?.name}</span>
        {comment.isTeacherReply && <TeacherBadge />}
        <span className="text-xs text-muted-foreground">{formatDateTime(comment.createdAt)}</span>
      </div>
      <p className="mt-1.5 text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap break-words">
        {comment.content}
      </p>
    </div>
  </div>
);

const ReplyForm = ({ onSubmit, submitting, placeholder = 'Write a reply…' }) => {
  const [text, setText] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || submitting) return;
    await onSubmit(trimmed);
    setText('');
  };

  return (
    <form onSubmit={handleSubmit} className="mt-3 flex flex-col sm:flex-row gap-2">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={2}
        placeholder={placeholder}
        className="input-field flex-1 min-h-[72px] resize-y text-sm"
        maxLength={2000}
      />
      <button
        type="submit"
        disabled={submitting || !text.trim()}
        className="btn-primary inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm shrink-0 disabled:opacity-50"
      >
        {submitting ? <FiLoader className="w-4 h-4 animate-spin" /> : <FiSend className="w-4 h-4" />}
        Reply
      </button>
    </form>
  );
};

const DiscussionThread = ({ thread, isCourseTeacher, onReply, replyingId }) => (
  <article className="rounded-xl border border-border/80 bg-background p-4 sm:p-5 ring-1 ring-border/20">
    <CommentBody comment={thread} />

    {thread.replies?.length > 0 && (
      <div className="mt-4 ml-4 sm:ml-6 pl-4 border-l-2 border-secondary/40 space-y-4">
        {thread.replies.map((reply) => (
          <CommentBody key={reply._id} comment={reply} isReply />
        ))}
      </div>
    )}

    {isCourseTeacher && (
      <div className="mt-4 ml-4 sm:ml-6 pl-4 border-l-2 border-secondary/40">
        <ReplyForm
          onSubmit={(content) => onReply(thread._id, content)}
          submitting={replyingId === thread._id}
          placeholder="Write your reply to this student…"
        />
      </div>
    )}
  </article>
);

const CourseCommentsPanel = ({
  courseId,
  isAuthenticated,
  isEnrolled,
  isCourseTeacher,
  onCountChange,
}) => {
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [replyingId, setReplyingId] = useState(null);

  const loadDiscussions = useCallback(async () => {
    try {
      setError('');
      const { data } = await discussionAPI.getAll(courseId);
      setThreads(data.data || []);
      onCountChange?.(data.count ?? data.data?.length ?? 0);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load discussion');
    } finally {
      setLoading(false);
    }
  }, [courseId, onCountChange]);

  useEffect(() => {
    setLoading(true);
    loadDiscussions();
  }, [loadDiscussions]);

  const canPost = isAuthenticated && (isEnrolled || isCourseTeacher);

  const handlePost = async (e) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || submitting) return;

    setSubmitting(true);
    setError('');
    try {
      await discussionAPI.create(courseId, trimmed);
      setText('');
      await loadDiscussions();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReply = async (commentId, content) => {
    setReplyingId(commentId);
    setError('');
    try {
      await discussionAPI.reply(courseId, commentId, content);
      await loadDiscussions();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post reply');
    } finally {
      setReplyingId(null);
    }
  };

  return (
    <div className="space-y-5">
      {canPost ? (
        <form
          onSubmit={handlePost}
          className="rounded-xl border border-primary/15 bg-accent/40 p-4 sm:p-5"
        >
          <label htmlFor="course-comment" className="block text-sm font-semibold text-foreground mb-2">
            Ask a question or leave a comment
          </label>
          <textarea
            id="course-comment"
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            placeholder="What would you like to know about this course?"
            className="input-field w-full min-h-[88px] resize-y text-sm"
            maxLength={2000}
          />
          <div className="mt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <p className="text-xs text-muted-foreground">
              Your question will be sent to the course instructor.
            </p>
            <button
              type="submit"
              disabled={submitting || !text.trim()}
              className="btn-primary inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm shrink-0 disabled:opacity-50"
            >
              {submitting ? (
                <FiLoader className="w-4 h-4 animate-spin" />
              ) : (
                <FiSend className="w-4 h-4" />
              )}
              Send
            </button>
          </div>
        </form>
      ) : !isAuthenticated ? (
        <div className="rounded-xl border border-dashed border-primary/20 bg-accent/30 p-4 text-center text-sm text-muted-foreground">
          <Link to="/login" className="text-primary font-semibold hover:underline">
            Sign in
          </Link>{' '}
          to ask a question or join the discussion.
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-primary/20 bg-accent/30 p-4 text-sm text-muted-foreground">
          Enroll in this course to ask questions and participate in the discussion.
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-destructive-muted bg-destructive-muted/50 px-4 py-3 text-sm text-destructive-muted-foreground">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground gap-2">
          <FiLoader className="w-5 h-5 animate-spin" />
          <span className="text-sm">Loading discussion…</span>
        </div>
      ) : threads.length === 0 ? (
        <EmptyState
          icon={FiMessageSquare}
          title="No questions yet"
          description="Be the first to ask the instructor a question about this course."
        />
      ) : (
        <div className="space-y-4">
          {threads.map((thread) => (
            <DiscussionThread
              key={thread._id}
              thread={thread}
              isCourseTeacher={isCourseTeacher}
              onReply={handleReply}
              replyingId={replyingId}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CourseCommentsPanel;
