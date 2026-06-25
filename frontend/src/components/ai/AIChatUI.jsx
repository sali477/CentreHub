import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FiSend,
  FiTrash2,
  FiZap,
  FiBook,
  FiFileText,
  FiCalendar,
  FiHelpCircle,
  FiPlus,
  FiCopy,
  FiCheck,
  FiMenu,
  FiMessageSquare,
  FiX,
  FiMaximize2,
} from 'react-icons/fi';
import ChatMessageContent from './ChatMessageContent';
import {
  COURSE_QUICK_ACTIONS,
  COURSE_ACTION_TEXT,
  formatRelativeTime,
} from './chatConstants';

export const TypingIndicator = () => (
  <div className="flex items-center gap-1.5 px-4 py-3" aria-label="AI is typing">
    <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:0ms]" />
    <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:150ms]" />
    <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:300ms]" />
  </div>
);

const MessageBubble = ({ msg }) => {
  const [copied, setCopied] = useState(false);
  const isUser = msg.role === 'user';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(msg.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className={`group flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`relative max-w-[min(92%,720px)] ${isUser ? '' : 'pr-8'}`}>
        <div
          className={`rounded-2xl px-3 py-2.5 sm:px-4 ${
            isUser
              ? 'bg-primary text-primary-foreground rounded-br-md shadow-premium'
              : msg.error
                ? 'bg-destructive-muted text-destructive-muted-foreground border border-destructive-muted rounded-bl-md'
                : 'bg-card text-foreground border border-border shadow-premium rounded-bl-md'
          }`}
        >
          <ChatMessageContent content={msg.content} isUser={isUser} />
        </div>
        <button
          type="button"
          onClick={handleCopy}
          title="Copy message"
          className={`absolute top-1 ${
            isUser ? 'left-0 -translate-x-full pr-1' : 'right-0'
          } p-1.5 rounded-lg text-muted-foreground hover:text-muted-foreground hover:bg-muted opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity`}
        >
          {copied ? <FiCheck className="w-3.5 h-3.5 text-primary" /> : <FiCopy className="w-3.5 h-3.5" />}
        </button>
      </div>
    </div>
  );
};

const ConversationSidebar = ({
  chat,
  sidebarOpen,
  onCloseSidebar,
  showClose,
  className = '',
}) => {
  const {
    isAuthenticated,
    conversations,
    loadingConversations,
    conversationId,
    startNewChat,
    selectConversation,
    deleteConversation,
  } = chat;

  if (!isAuthenticated) {
    return (
      <aside className={`${className} border-r border-border bg-muted p-4`}>
        <p className="text-sm text-muted-foreground">
          <Link to="/login" className="text-primary font-medium hover:underline">
            Sign in
          </Link>{' '}
          to save multiple chats and sync history across devices.
        </p>
      </aside>
    );
  }

  return (
    <aside
      className={`${className} shrink-0 border-r border-border bg-muted flex flex-col`}
    >
      <div className="p-3 border-b border-border flex items-center gap-2">
        <button
          type="button"
          onClick={() => startNewChat()}
          className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-card border border-border text-sm font-medium text-foreground hover:bg-muted"
        >
          <FiPlus className="w-4 h-4" />
          New chat
        </button>
        {showClose && (
          <button
            type="button"
            onClick={onCloseSidebar}
            className="p-2 rounded-lg hover:bg-muted lg:hidden"
          >
            <FiX className="w-4 h-4" />
          </button>
        )}
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {loadingConversations && (
          <div className="flex justify-center py-6">
            <span className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        )}
        {!loadingConversations && conversations.length === 0 && (
          <p className="text-xs text-muted-foreground px-2 py-4 text-center">No chats yet — start one!</p>
        )}
        {conversations.map((c) => (
          <div
            key={c._id}
            role="button"
            tabIndex={0}
            onClick={() => {
              selectConversation(c._id);
              onCloseSidebar?.();
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                selectConversation(c._id);
                onCloseSidebar?.();
              }
            }}
            className={`w-full text-left px-3 py-2.5 rounded-lg text-sm group flex items-start gap-2 cursor-pointer ${
              conversationId === c._id
                ? 'bg-accent text-accent-foreground'
                : 'hover:bg-card text-foreground'
            }`}
          >
            <FiMessageSquare className="w-4 h-4 shrink-0 mt-0.5 opacity-60" />
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{c.title || 'New chat'}</p>
              <p className="text-[10px] text-muted-foreground truncate">
                {c.courseTitle ? `${c.courseTitle} • ` : ''}
                {formatRelativeTime(c.updatedAt)}
              </p>
            </div>
            <button
              type="button"
              onClick={(e) => deleteConversation(c._id, e)}
              className="opacity-0 group-hover:opacity-100 p-1 hover:text-destructive-muted-foreground shrink-0"
              title="Delete chat"
            >
              <FiTrash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </aside>
  );
};

/**
 * @param {'page'|'widget'} variant
 */
const AIChatUI = ({
  variant = 'page',
  chat,
  sidebarOpen = false,
  onSidebarOpenChange,
  headerExtra = null,
  onClose,
  onExpand,
  expanded = false,
}) => {
  const {
    user,
    isAuthenticated,
    messages,
    input,
    setInput,
    loading,
    loadingHistory,
    courseMode,
    setCourseMode,
    setActiveCourseId,
    effectiveCourseTitle,
    effectiveCourseId,
    pageCourseId,
    enableCourseMode,
    sendMessage,
    handleSubmit,
    messagesScrollRef,
    messagesEndRef,
    inputRef,
    startNewChat,
  } = chat;

  const isPage = variant === 'page';
  const showCourseBanner = pageCourseId && !courseMode && !isPage;

  const quickActionIcons = {
    summarize: FiFileText,
    'study-plan': FiCalendar,
    quiz: FiHelpCircle,
    explain: FiBook,
  };

  return (
    <div
      className={
        isPage
          ? 'flex h-full w-full min-h-0 overflow-hidden'
          : 'flex flex-1 min-h-0 h-full w-full overflow-hidden'
      }
    >
      {isPage && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-20 md:hidden"
          onClick={() => onSidebarOpenChange?.(false)}
          aria-hidden
        />
      )}

      {(isPage || sidebarOpen) && (
        <ConversationSidebar
          chat={chat}
          sidebarOpen={sidebarOpen}
          onCloseSidebar={() => onSidebarOpenChange?.(false)}
          showClose={!isPage || sidebarOpen}
          className={
            isPage
              ? `w-64 lg:w-72 z-30 ${
                  sidebarOpen
                    ? 'fixed left-0 top-16 bottom-0 shadow-xl md:relative md:top-auto md:shadow-none flex'
                    : 'hidden md:flex'
                }`
              : sidebarOpen
                ? 'absolute inset-y-0 left-0 w-64 z-10 shadow-lg'
                : 'hidden'
          }
        />
      )}

      <div className="flex-1 flex flex-col min-w-0 min-h-0 h-full overflow-hidden bg-card relative">
        <div className="bg-gradient-brand text-primary-foreground px-3 sm:px-5 py-3.5 flex items-center justify-between shrink-0 gap-2 shadow-premium">
          <div className="flex items-center gap-2 min-w-0">
            {!isPage && isAuthenticated && (
              <button
                type="button"
                onClick={() => onSidebarOpenChange?.(true)}
                className="p-2 rounded-lg hover:bg-card/15 shrink-0"
                title="Chat history"
              >
                <FiMenu className="w-5 h-5" />
              </button>
            )}
            {isPage && isAuthenticated && (
              <button
                type="button"
                onClick={() => onSidebarOpenChange?.(true)}
                className="p-2 rounded-lg hover:bg-card/15 shrink-0 md:hidden"
                title="Chat history"
              >
                <FiMenu className="w-5 h-5" />
              </button>
            )}
            <div className="w-9 h-9 bg-card/20 rounded-xl flex items-center justify-center shrink-0">
              <FiZap className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="font-semibold text-sm sm:text-base">AI Assistant</h2>
              <p className="text-xs text-primary-foreground/80 truncate">
                {courseMode && effectiveCourseTitle
                  ? `Course: ${effectiveCourseTitle}`
                  : 'Ask me anything'}
                {user?.name ? ` • ${user.name}` : ''}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-0.5 shrink-0">
            {headerExtra}
            {isPage && (
              <span className="hidden sm:inline text-xs text-primary-foreground/70 mr-1">Also in floating chat ↘</span>
            )}
            {!isPage && onExpand && (
              <button
                type="button"
                onClick={onExpand}
                className="p-2 rounded-lg hover:bg-card/15"
                title={expanded ? 'Minimize' : 'Expand'}
              >
                <FiMaximize2 className="w-4 h-4" />
              </button>
            )}
            {!isPage && isAuthenticated && (
              <button
                type="button"
                onClick={() => startNewChat()}
                className="p-2 rounded-lg hover:bg-card/15 hidden sm:block"
                title="New chat"
              >
                <FiPlus className="w-4 h-4" />
              </button>
            )}
            {onClose && (
              <button type="button" onClick={onClose} className="p-2 rounded-lg hover:bg-card/15">
                <FiX className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {!isAuthenticated && (
          <div className="px-4 py-2 bg-accent text-accent-foreground text-xs border-b border-border shrink-0">
            Sign in to save your chats in the cloud and use multiple conversations.
          </div>
        )}

        {showCourseBanner && (
          <div className="px-3 py-2 border-b border-border bg-accent/80 shrink-0 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={enableCourseMode}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-medium hover:opacity-90"
            >
              <FiBook className="w-3.5 h-3.5" />
              Ask AI about this course
            </button>
            <span className="text-[10px] text-muted-foreground">Optional — general questions need no course context</span>
          </div>
        )}

        {courseMode && (
          <div className="px-3 py-1.5 border-b border-border bg-accent text-accent-foreground text-xs shrink-0 flex items-center justify-between">
            <span>Course context {effectiveCourseTitle ? `: ${effectiveCourseTitle}` : 'on'}</span>
            <button
              type="button"
              onClick={() => {
                setCourseMode(false);
                setActiveCourseId(null);
              }}
              className="text-primary hover:underline"
            >
              Turn off
            </button>
          </div>
        )}

        <div
          ref={messagesScrollRef}
          className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden overscroll-contain bg-surface-50"
        >
          <div
            className={`p-3 sm:p-6 space-y-4 min-h-0 ${
              isPage ? 'max-w-4xl mx-auto w-full' : ''
            }`}
          >
            {loadingHistory ? (
              <div className="flex justify-center py-12">
                <span className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              </div>
            ) : (
              messages.map((msg, i) => (
                <MessageBubble key={`${i}-${msg.role}-${msg.content?.slice(0, 20)}`} msg={msg} />
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
        </div>

        <div className="shrink-0 border-t border-border bg-card z-10">
          <div className={`p-3 sm:p-4 ${isPage ? 'max-w-4xl mx-auto w-full' : ''}`}>
          {courseMode && effectiveCourseId && (
            <div className="flex gap-1.5 overflow-x-auto pb-2 mb-2">
              {COURSE_QUICK_ACTIONS.map(({ id, label, action }) => {
                const Icon = quickActionIcons[action] || FiBook;
                return (
                  <button
                    key={id}
                    type="button"
                    disabled={loading}
                    onClick={() => sendMessage(COURSE_ACTION_TEXT[action], action)}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-accent text-accent-foreground text-xs font-medium whitespace-nowrap hover:bg-accent disabled:opacity-50"
                  >
                    <Icon className="w-3 h-3" />
                    {label}
                  </button>
                );
              })}
            </div>
          )}
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
              placeholder="Message CentreHub AI..."
              disabled={loading}
              className="input-field flex-1 text-sm py-2.5 resize-none max-h-32 min-h-[44px]"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="btn-primary p-2.5 shrink-0 h-[44px] disabled:opacity-50 flex items-center justify-center"
              aria-label="Send message"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-card/40 border-t-white rounded-full animate-spin" />
              ) : (
                <FiSend className="w-5 h-5" />
              )}
            </button>
          </form>
          <p className="text-[10px] text-muted-foreground mt-1.5 text-center">
            Shift+Enter for new line • CentreHub AI can make mistakes — verify important facts
          </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIChatUI;
