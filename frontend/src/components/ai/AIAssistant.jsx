import { useState, useEffect, useMemo } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMessageCircle, FiExternalLink } from 'react-icons/fi';
import AIChatUI from './AIChatUI';
import { useAIChat } from './useAIChat';
import { detectCourseId } from './chatConstants';

/** Floating ChatGPT-style widget — hidden on /ai full page */
const AIAssistant = () => {
  const { pathname } = useLocation();
  const { current: courseFromStore } = useSelector((state) => state.courses);

  const pageCourseId = useMemo(() => detectCourseId(pathname), [pathname]);
  const pageCourseTitle =
    pageCourseId && courseFromStore?._id === pageCourseId ? courseFromStore.title : null;

  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const chat = useAIChat({
    active: open,
    pageCourseId,
    pageCourseTitle,
  });

  useEffect(() => {
    if (expanded) setSidebarOpen(true);
  }, [expanded]);

  useEffect(() => {
    if (open) {
      setTimeout(() => chat.inputRef.current?.focus(), 300);
    }
  }, [open]);

  if (pathname === '/ai' || pathname.startsWith('/ai/')) {
    return null;
  }

  const panelClass = expanded
    ? 'fixed inset-2 sm:inset-6 z-50'
    : 'fixed bottom-6 right-6 z-50 w-[min(100vw-1rem,440px)] h-[min(90vh,680px)]';

  const headerExtra = (
    <Link
      to="/ai"
      onClick={() => setOpen(false)}
      className="p-2 rounded-lg hover:bg-card/15 hidden sm:flex items-center gap-1 text-xs"
      title="Open full chat page"
    >
      <FiExternalLink className="w-4 h-4" />
    </Link>
  );

  return (
    <>
      <AnimatePresence>
        {!open && (
          <motion.button
            type="button"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            onClick={() => setOpen(true)}
            className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-50 w-14 h-14 bg-gradient-brand hover:shadow-glow text-primary-foreground rounded-2xl shadow-soft-lg flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95"
            title="CentreHub AI"
            aria-label="Open AI assistant"
          >
            <FiMessageCircle className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <>
            {expanded && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/40 z-40"
                onClick={() => setExpanded(false)}
              />
            )}
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.96 }}
              className={`${panelClass} bg-card rounded-2xl sm:rounded-3xl shadow-soft-lg border border-border flex flex-col overflow-hidden`}
            >
              <AIChatUI
                variant="widget"
                chat={chat}
                sidebarOpen={sidebarOpen}
                onSidebarOpenChange={setSidebarOpen}
                headerExtra={headerExtra}
                onClose={() => {
                  setOpen(false);
                  setExpanded(false);
                  setSidebarOpen(false);
                }}
                onExpand={() => setExpanded((e) => !e)}
                expanded={expanded}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIAssistant;
