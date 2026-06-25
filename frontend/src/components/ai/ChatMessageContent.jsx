import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const ChatMessageContent = ({ content, isUser = false }) => {
  if (!content) return null;

  return (
    <div className={`chat-markdown text-sm ${isUser ? 'chat-markdown-user' : ''}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className={isUser ? 'underline text-primary-foreground/90' : 'text-primary underline'}
            >
              {children}
            </a>
          ),
          code: ({ inline, className, children }) => {
            const lang = className?.replace('language-', '') || '';
            if (inline) {
              return (
                <code
                  className={
                    isUser
                      ? 'px-1 py-0.5 rounded bg-card/20 text-primary-foreground font-mono text-xs'
                      : 'px-1 py-0.5 rounded bg-muted text-accent-foreground font-mono text-xs'
                  }
                >
                  {children}
                </code>
              );
            }
            return (
              <div className="my-2 rounded-lg overflow-hidden border border-border">
                {lang && (
                  <div className="px-3 py-1 bg-surface-elevated-muted text-muted-foreground text-xs font-mono">{lang}</div>
                )}
                <pre className="p-3 bg-surface-elevated text-surface-elevated-foreground overflow-x-auto text-xs leading-relaxed">
                  <code className="font-mono">{children}</code>
                </pre>
              </div>
            );
          },
          pre: ({ children }) => <>{children}</>,
          p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
          ul: ({ children }) => <ul className="list-disc pl-5 mb-2 space-y-1">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal pl-5 mb-2 space-y-1">{children}</ol>,
          h1: ({ children }) => <h1 className="text-base font-bold mb-2 mt-1">{children}</h1>,
          h2: ({ children }) => <h2 className="text-sm font-bold mb-2 mt-1">{children}</h2>,
          h3: ({ children }) => <h3 className="text-sm font-semibold mb-1 mt-1">{children}</h3>,
          blockquote: ({ children }) => (
            <blockquote
              className={`border-l-4 pl-3 my-2 italic ${
                isUser ? 'border-card/40' : 'border-primary/30 text-muted-foreground'
              }`}
            >
              {children}
            </blockquote>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto my-2">
              <table className="min-w-full text-xs border border-border rounded">{children}</table>
            </div>
          ),
          th: ({ children }) => (
            <th className="border border-border px-2 py-1 bg-muted font-semibold text-left">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border border-border px-2 py-1">{children}</td>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default ChatMessageContent;
