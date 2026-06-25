import {
  BookOpen,
  Languages,
  Calculator,
  Atom,
  FlaskConical,
  Dna,
  Code2,
  Terminal,
  Globe,
  BarChart3,
  GraduationCap,
  Briefcase,
  PenTool,
  Music,
  Palette,
  Target,
  Type,
  Cpu,
} from 'lucide-react';

/** @typedef {{ icon: import('lucide-react').LucideIcon; gradient: string; shadow: string; badge: string }} SubjectTheme */

const DEFAULT_THEME = {
  icon: GraduationCap,
  gradient: 'linear-gradient(135deg, #5BA4E6 0%, #8FC5F7 55%, #3E8DD6 100%)',
  shadow: '0 8px 24px rgba(91, 164, 230, 0.22)',
  badge: 'bg-primary/10 text-primary border-primary/20',
};

/** @type {Record<string, SubjectTheme>} */
export const SUBJECT_THEMES = {
  english: {
    icon: BookOpen,
    gradient: 'linear-gradient(135deg, #EAF4FF 0%, #5BA4E6 100%)',
    shadow: '0 8px 24px rgba(91, 164, 230, 0.22)',
    badge: 'bg-primary/10 text-primary border-primary/20',
  },
  french: {
    icon: Languages,
    gradient: 'linear-gradient(135deg, #DCEEFF 0%, #3E8DD6 100%)',
    shadow: '0 8px 24px rgba(62, 141, 214, 0.22)',
    badge: 'bg-accent text-accent-foreground border-border',
  },
  arabic: {
    icon: Type,
    gradient: 'linear-gradient(135deg, #EAF4FF 0%, #8FC5F7 100%)',
    shadow: '0 8px 24px rgba(143, 197, 247, 0.3)',
    badge: 'bg-secondary/40 text-foreground border-secondary/50',
  },
  languages: {
    icon: Languages,
    gradient: 'linear-gradient(135deg, #EAF4FF 0%, #DCEEFF 100%)',
    shadow: '0 8px 24px rgba(91, 164, 230, 0.15)',
    badge: 'bg-accent text-accent-foreground border-border',
  },
  mathematics: {
    icon: Calculator,
    gradient: 'linear-gradient(135deg, #FFD27A 0%, #E8B85C 100%)',
    shadow: '0 8px 24px rgba(255, 210, 122, 0.28)',
    badge: 'bg-highlight/15 text-foreground border-highlight/25',
  },
  physics: {
    icon: Atom,
    gradient: 'linear-gradient(135deg, #5BA4E6 0%, #3E8DD6 100%)',
    shadow: '0 8px 24px rgba(91, 164, 230, 0.22)',
    badge: 'bg-primary/10 text-primary border-primary/20',
  },
  chemistry: {
    icon: FlaskConical,
    gradient: 'linear-gradient(135deg, #DCEEFF 0%, #5BA4E6 100%)',
    shadow: '0 8px 24px rgba(91, 164, 230, 0.2)',
    badge: 'bg-primary/10 text-primary border-primary/20',
  },
  biology: {
    icon: Dna,
    gradient: 'linear-gradient(135deg, #A8DCC4 0%, #7CC6A6 100%)',
    shadow: '0 8px 24px rgba(124, 198, 166, 0.28)',
    badge: 'bg-success/15 text-success border-success/25',
  },
  programming: {
    icon: Code2,
    gradient: 'linear-gradient(135deg, #1E3A5F 0%, #334155 100%)',
    shadow: '0 8px 24px rgba(30, 58, 95, 0.3)',
    badge: 'bg-foreground/10 text-foreground border-foreground/20',
  },
  javascript: {
    icon: Code2,
    gradient: 'linear-gradient(135deg, #FFD27A 0%, #FBBF24 100%)',
    shadow: '0 8px 24px rgba(255, 210, 122, 0.28)',
    badge: 'bg-highlight/15 text-foreground border-highlight/25',
  },
  python: {
    icon: Terminal,
    gradient: 'linear-gradient(135deg, #8FC5F7 0%, #5BA4E6 100%)',
    shadow: '0 8px 24px rgba(91, 164, 230, 0.22)',
    badge: 'bg-secondary/40 text-foreground border-secondary/50',
  },
  'web development': {
    icon: Globe,
    gradient: 'linear-gradient(135deg, #EAF4FF 0%, #5BA4E6 100%)',
    shadow: '0 8px 24px rgba(91, 164, 230, 0.22)',
    badge: 'bg-accent text-accent-foreground border-border',
  },
  marketing: {
    icon: BarChart3,
    gradient: 'linear-gradient(135deg, #5BA4E6 0%, #FFD27A 100%)',
    shadow: '0 8px 24px rgba(91, 164, 230, 0.2)',
    badge: 'bg-primary/10 text-primary border-primary/20',
  },
  business: {
    icon: Briefcase,
    gradient: 'linear-gradient(135deg, #F8FBFF 0%, #F1F7FD 100%)',
    shadow: '0 8px 24px rgba(30, 58, 95, 0.08)',
    badge: 'bg-muted text-muted-foreground border-border',
  },
  design: {
    icon: PenTool,
    gradient: 'linear-gradient(135deg, #EAF4FF 0%, #DCEEFF 100%)',
    shadow: '0 8px 24px rgba(143, 197, 247, 0.2)',
    badge: 'bg-accent text-accent-foreground border-border',
  },
  music: {
    icon: Music,
    gradient: 'linear-gradient(135deg, #5BA4E6 0%, #8FC5F7 100%)',
    shadow: '0 8px 24px rgba(91, 164, 230, 0.22)',
    badge: 'bg-primary/10 text-primary border-primary/20',
  },
  art: {
    icon: Palette,
    gradient: 'linear-gradient(135deg, #FFD27A 0%, #FBBF24 100%)',
    shadow: '0 8px 24px rgba(255, 210, 122, 0.28)',
    badge: 'bg-highlight/15 text-foreground border-highlight/25',
  },
  'test preparation': {
    icon: Target,
    gradient: 'linear-gradient(135deg, #5BA4E6 0%, #7CC6A6 100%)',
    shadow: '0 8px 24px rgba(91, 164, 230, 0.22)',
    badge: 'bg-primary/10 text-primary border-primary/20',
  },
  science: {
    icon: Cpu,
    gradient: 'linear-gradient(135deg, #A8DCC4 0%, #7CC6A6 100%)',
    shadow: '0 8px 24px rgba(124, 198, 166, 0.28)',
    badge: 'bg-success/15 text-success border-success/25',
  },
};

const ALIASES = {
  math: 'mathematics',
  maths: 'mathematics',
  'test prep': 'test preparation',
  'test preparation': 'test preparation',
  coding: 'programming',
  code: 'programming',
  js: 'javascript',
  'web dev': 'web development',
  'web development': 'web development',
  frontend: 'web development',
  backend: 'programming',
};

/**
 * @param {string | null | undefined} subject
 * @returns {string}
 */
export const normalizeSubjectKey = (subject) => {
  if (!subject || typeof subject !== 'string') return 'default';
  const normalized = subject.trim().toLowerCase();
  if (SUBJECT_THEMES[normalized]) return normalized;
  if (ALIASES[normalized]) return ALIASES[normalized];
  if (normalized.includes('javascript') || normalized.includes('js ')) return 'javascript';
  if (normalized.includes('python')) return 'python';
  if (normalized.includes('web')) return 'web development';
  if (normalized.includes('market')) return 'marketing';
  if (normalized.includes('english')) return 'english';
  if (normalized.includes('french')) return 'french';
  if (normalized.includes('arabic')) return 'arabic';
  if (normalized.includes('math')) return 'mathematics';
  if (normalized.includes('physic')) return 'physics';
  if (normalized.includes('chem')) return 'chemistry';
  if (normalized.includes('bio')) return 'biology';
  if (normalized.includes('program')) return 'programming';
  return normalized;
};

/**
 * @param {string | null | undefined} subject
 * @returns {SubjectTheme}
 */
export const getSubjectTheme = (subject) => {
  const key = normalizeSubjectKey(subject);
  return SUBJECT_THEMES[key] || DEFAULT_THEME;
};

export { DEFAULT_THEME };
