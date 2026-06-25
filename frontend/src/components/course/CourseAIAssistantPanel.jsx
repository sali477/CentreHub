import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiSend, FiZap } from 'react-icons/fi';
import { useAIChat } from '../ai/useAIChat';
import { TypingIndicator } from '../ai/AIChatUI';
import ChatMessageContent from '../ai/ChatMessageContent';
import { COURSE_AI_QUICK_ACTIONS, COURSE_AI_SUGGESTIONS } from './constants';

const MessageBubble = ({ msg }) => {
  const isUser = msg.role === 'user';
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[min(92%,560px)] rounded-2xl px-4 py-3 shadow-premium ${
          isUser
            ? 'bg-primary text-primary-foreground rounded-br-md'
            : msg.error
              ? 'bg-destructive-muted text-destructive-muted-foreground border border-destructive-muted rounded-bl-md'
              : 'bg-card text-foreground border border-border rounded-bl-md'
        }`}
      >
        <ChatMessageContent content={msg.content} isUser={isUser} />
      </div>
    </div>
  );
};

const CourseAIAssistantPanel = ({ courseId, courseTitle }) => {
  const chat = useAIChat({
    active: true,
    pageCourseId: courseId,
    pageCourseTitle: courseTitle,
  });

  const {
    isAuthenticated,
    messages,
    input,
    setInput,
    loading,
    loadingHistory,
    courseMode,
    effectiveCourseTitle,
    enableCourseMode,
    sendMessage,
    handleSubmit,
    messagesScrollRef,
    messagesEndRef,
    inputRef,
  } = chat;

  useEffect(() => {
    if (courseId) {
      enableCourseMode();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- enable once per course
  }, [courseId]);

  return (
    <div className="flex flex-col min-h-[520px] max-h-[min(70vh,640px)] rounded-[20px] border border-border bg-card shadow-premium overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-border bg-gradient-brand text-primary-foreground shrink-0">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-foreground/15">
          <FiZap className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-sm sm:text-base">Course AI Assistant</h3>
          <p className="text-xs text-primary-foreground/80 truncate">
            {courseMode && effectiveCourseTitle
              ? `Context: ${effectiveCourseTitle}`
              : 'Ask anything about this course'}
          </p>
        </div>
        <Link
          to="/ai"
          className="text-xs font-medium text-primary-foreground/90 hover:text-primary-foreground underline shrink-0 hidden sm:inline"
        >
          Full chat
        </Link>
      </div>

      {!isAuthenticated && (
        <div className="px-4 py-2.5 bg-accent text-accent-foreground text-xs border-b border-border">
          <Link to="/login" className="font-semibold underline">Sign in</Link> to save your AI conversations.
        </div>
      )}

      <div className="px-4 py-3 border-b border-border bg-muted/40 shrink-0">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
          Quick actions
        </p>
        <div className="flex flex-wrap gap-2">
          {COURSE_AI_QUICK_ACTIONS.map(({ id, label, action, prompt }) => (
            <button
              key={id}
              type="button"
              disabled={loading}
              onClick={() => sendMessage(prompt, action)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card border border-border text-xs font-medium text-foreground hover:bg-accent hover:border-primary/20 transition-colors disabled:opacity-50"
            >
              <FiZap className="h-3 w-3 text-primary" />
              {label}
            </button>
          ))}
        </div>
      </div>

      <div
        ref={messagesScrollRef}
        className="flex-1 min-h-0 overflow-y-auto overscroll-contain bg-background p-4 sm:p-5 space-y-4"
      >
        {loadingHistory ? (
          <div className="flex justify-center py-12">
            <span className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : (
          messages.map((msg, i) => (
            <MessageBubble key={`${i}-${msg.role}`} msg={msg} />
          ))
        )}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-card border border-border rounded-2xl rounded-bl-md shadow-premium">
              <TypingIndicator />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="shrink-0 border-t border-border bg-card p-4">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
          Suggested questions
        </p>
        <div className="flex flex-wrap gap-2 mb-3">
          {COURSE_AI_SUGGESTIONS.map((q) => (
            <button
              key={q}
              type="button"
              disabled={loading}
              onClick={() => sendMessage(q)}
              className="text-xs px-3 py-1.5 rounded-full bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors disabled:opacity-50"
            >
              {q}
            </button>
          ))}
        </div>
        <form onSubmit={handleSubmit} className="flex gap-2 items-end">
          <textarea
            ref={inputRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            placeholder="Ask about this course..."
            disabled={loading}
            className="input-field flex-1 text-sm py-2.5 resize-none min-h-[44px] max-h-28 rounded-xl"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="btn-primary p-2.5 h-[44px] w-[44px] shrink-0 rounded-xl disabled:opacity-50"
            aria-label="Send"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-primary-foreground/40 border-t-primary-foreground rounded-full animate-spin" />
            ) : (
              <FiSend className="w-5 h-5" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CourseAIAssistantPanel;
