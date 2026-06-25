import { useState, useEffect, useRef, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { aiAPI } from '../../api/index';
import {
  WELCOME_MESSAGE,
  GUEST_STORAGE_KEY,
  FRIENDLY_CLIENT_ERROR,
  BACKEND_UNAVAILABLE_MESSAGE,
} from './chatConstants';

/**
 * Shared ChatGPT-style chat state for the /ai page and floating widget.
 */
export const useAIChat = ({
  active = true,
  pageCourseId = null,
  pageCourseTitle = null,
} = {}) => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [courseMode, setCourseMode] = useState(false);
  const [activeCourseId, setActiveCourseId] = useState(null);
  const [conversationId, setConversationId] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [loadingConversations, setLoadingConversations] = useState(false);

  const messagesScrollRef = useRef(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const effectiveCourseId = courseMode ? activeCourseId || pageCourseId : null;
  const effectiveCourseTitle =
    courseMode && effectiveCourseId === pageCourseId ? pageCourseTitle : null;

  const loadConversations = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoadingConversations(true);
    try {
      const { data } = await aiAPI.listConversations();
      setConversations(data.conversations || []);
    } catch {
      setConversations([]);
    } finally {
      setLoadingConversations(false);
    }
  }, [isAuthenticated]);

  const loadGuestHistory = useCallback(() => {
    try {
      const saved = localStorage.getItem(GUEST_STORAGE_KEY);
      if (saved) setMessages(JSON.parse(saved));
      else setMessages([WELCOME_MESSAGE]);
    } catch {
      setMessages([WELCOME_MESSAGE]);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      loadGuestHistory();
      return;
    }
    setMessages([WELCOME_MESSAGE]);
    setConversationId(null);
    setCourseMode(false);
    setActiveCourseId(null);
  }, [isAuthenticated, loadGuestHistory]);

  useEffect(() => {
    if (!isAuthenticated && messages.length > 0) {
      localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(messages.slice(-50)));
    }
  }, [messages, isAuthenticated]);

  useEffect(() => {
    if (active) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading, active]);

  useEffect(() => {
    if (!active) return;
    if (isAuthenticated) loadConversations();
  }, [active, isAuthenticated, loadConversations]);

  const startNewChat = async (opts = {}) => {
    const { withCourseId } = opts;
    setConversationId(null);
    setMessages([WELCOME_MESSAGE]);
    setCourseMode(!!withCourseId);
    setActiveCourseId(withCourseId || null);

    if (!isAuthenticated) {
      localStorage.removeItem(GUEST_STORAGE_KEY);
      return;
    }

    if (withCourseId) {
      try {
        const { data } = await aiAPI.createConversation({ courseId: withCourseId });
        setConversationId(data.conversation._id);
        setMessages([
          {
            role: 'assistant',
            content: pageCourseTitle
              ? `I'll use **${pageCourseTitle}** as context for this chat. Ask anything about the course or request summaries, study plans, and practice questions.`
              : `Course context is enabled. What would you like to know?`,
          },
        ]);
        await loadConversations();
      } catch {
        /* first send will create conversation */
      }
    }
  };

  const selectConversation = async (id) => {
    if (loading) return;
    setLoadingHistory(true);
    try {
      const { data } = await aiAPI.getConversation(id);
      const conv = data.conversation;
      setConversationId(conv._id);
      setCourseMode(!!conv.courseId);
      setActiveCourseId(conv.courseId ? String(conv.courseId) : null);
      const loaded = (conv.messages || []).map((m) => ({
        role: m.role,
        content: m.content,
      }));
      setMessages(loaded.length > 0 ? loaded : [WELCOME_MESSAGE]);
    } catch {
      setMessages([
        {
          role: 'assistant',
          content: FRIENDLY_CLIENT_ERROR,
          error: true,
        },
      ]);
    } finally {
      setLoadingHistory(false);
    }
  };

  const deleteConversation = async (id, e) => {
    e?.stopPropagation();
    try {
      await aiAPI.deleteConversation(id);
      if (conversationId === id) await startNewChat();
      await loadConversations();
    } catch {
      /* ignore */
    }
  };

  const enableCourseMode = () => {
    if (!pageCourseId) return;
    startNewChat({ withCourseId: pageCourseId });
  };

  const sendMessage = async (text, action = 'chat') => {
    const trimmed = text?.trim();
    if (!trimmed || loading) return;

    const userMsg = { role: 'user', content: trimmed };
    const history = messages.filter((m) => m.role === 'user' || m.role === 'assistant');

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const { data } = await aiAPI.chat({
        message: trimmed,
        conversationId: isAuthenticated ? conversationId || undefined : undefined,
        courseId: effectiveCourseId || undefined,
        action: action !== 'chat' ? action : undefined,
        history: isAuthenticated
          ? undefined
          : history.map((m) => ({ role: m.role, content: m.content })),
      });

      if (data.conversationId && data.conversationId !== conversationId) {
        setConversationId(data.conversationId);
      }
      if (isAuthenticated) loadConversations();

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: data.reply || FRIENDLY_CLIENT_ERROR,
          error: data.success === false,
        },
      ]);
    } catch (err) {
      const isBackendDown =
        err.response?.status === 503 ||
        /backend unavailable|ECONNREFUSED|network error/i.test(
          err.response?.data?.message || err.message || ''
        );
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: isBackendDown
            ? BACKEND_UNAVAILABLE_MESSAGE
            : err.response?.data?.reply ||
              err.response?.data?.message ||
              FRIENDLY_CLIENT_ERROR,
          error: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  return {
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
    effectiveCourseId,
    effectiveCourseTitle,
    conversationId,
    conversations,
    loadingConversations,
    messagesScrollRef,
    messagesEndRef,
    inputRef,
    startNewChat,
    selectConversation,
    deleteConversation,
    enableCourseMode,
    sendMessage,
    handleSubmit,
    loadConversations,
    pageCourseId,
  };
};
