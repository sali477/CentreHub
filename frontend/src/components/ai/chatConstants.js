export const WELCOME_MESSAGE = {
  role: 'assistant',
  content: `Hello! I'm your AI assistant — ask me **anything**.

Programming, math, science, languages, writing, career advice, study help, or everyday questions. I answer in **Markdown** with code blocks when useful.

What would you like to know?`,
};

export const GUEST_STORAGE_KEY = 'centrehub-ai-guest-chat';

export const FRIENDLY_CLIENT_ERROR =
  "Something went wrong. Please check your connection and try again.";

export const BACKEND_UNAVAILABLE_MESSAGE =
  'The API server is not running. From the project folder, run **npm run dev** (requires MongoDB), then refresh the page and try again.';

export const COURSE_QUICK_ACTIONS = [
  { id: 'summarize', label: 'Summarize', action: 'summarize' },
  { id: 'study-plan', label: 'Study plan', action: 'study-plan' },
  { id: 'quiz', label: 'Practice Q&A', action: 'quiz' },
  { id: 'explain', label: 'Explain topic', action: 'explain' },
];

export const COURSE_ACTION_TEXT = {
  summarize: 'Summarize this course and highlight the main topics I should focus on.',
  'study-plan': 'Create a practical weekly study plan for this course with daily tasks.',
  quiz: 'Give me 5 practice questions with answers based on this course.',
  explain: 'Explain the key concepts of this course in simple terms with examples.',
};

export const detectCourseId = (pathname) => {
  const match = pathname.match(/\/courses\/([a-f0-9A-F]{24})/);
  return match?.[1] || null;
};

export const formatRelativeTime = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now - d;
  if (diff < 86400000) {
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
};
