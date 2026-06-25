import {

  FiPlay,

  FiFileText,

  FiHelpCircle,

  FiVideo,

  FiMessageSquare,

} from 'react-icons/fi';



export const COURSE_NAV_ITEMS = [

  { id: 'videos', labelKey: 'coursePage.nav.videos', icon: FiPlay },

  { id: 'pdfs', labelKey: 'coursePage.nav.lessons', icon: FiFileText },

  { id: 'quizzes', labelKey: 'coursePage.nav.quizzes', icon: FiHelpCircle },

  { id: 'live', labelKey: 'coursePage.nav.liveSessions', icon: FiVideo },

  { id: 'comments', labelKey: 'coursePage.nav.comments', icon: FiMessageSquare },

];



export const COURSE_AI_SUGGESTIONS = [

  'What are the key topics in this course?',

  'How should I prepare for the final exam?',

  'Explain the hardest concept in simple terms.',

  'What should I study first as a beginner?',

];



export const COURSE_AI_QUICK_ACTIONS = [

  {

    id: 'explain-lesson',

    label: 'Explain lesson',

    action: 'explain',

    prompt: 'Explain the current lesson topics in this course with simple examples.',

  },

  {

    id: 'summarize',

    label: 'Summarize chapter',

    action: 'summarize',

    prompt: 'Summarize this course and highlight the main chapters I should focus on.',

  },

  {

    id: 'quiz',

    label: 'Generate quiz',

    action: 'quiz',

    prompt: 'Generate 5 practice quiz questions with answers based on this course.',

  },

  {

    id: 'solve',

    label: 'Solve exercise',

    action: 'chat',

    prompt: 'Help me solve a typical exercise from this course step by step.',

  },

  {

    id: 'teacher',

    label: 'Ask teacher',

    action: 'chat',

    prompt: 'What questions should I ask my teacher to get the most from this course?',

  },

];

