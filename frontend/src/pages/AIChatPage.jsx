import { useState, useEffect } from 'react';
import AIChatUI from '../components/ai/AIChatUI';
import { useAIChat } from '../components/ai/useAIChat';

const AIChatPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const chat = useAIChat({ active: true });

  useEffect(() => {
    setTimeout(() => chat.inputRef.current?.focus(), 100);
  }, []);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  return (
    <div className="flex-1 min-h-0 overflow-hidden flex flex-col bg-surface-50">
      <AIChatUI
        variant="page"
        chat={chat}
        sidebarOpen={sidebarOpen}
        onSidebarOpenChange={setSidebarOpen}
      />
    </div>
  );
};

export default AIChatPage;
