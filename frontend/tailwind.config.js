/** @type {import('tailwindcss').Config} */

export default {

  content: ['./index.html', './src/**/*.{js,jsx}'],

  darkMode: 'class',

  safelist: [

    'bg-background',

    'text-foreground',

    'bg-card',

    'text-card-foreground',

    'bg-muted',

    'text-muted-foreground',

    'bg-primary',

    'text-primary-foreground',

    'bg-secondary',

    'text-secondary-foreground',

    'bg-accent',

    'text-accent-foreground',

    'bg-highlight',

    'text-highlight-foreground',

    'border-border',

    'bg-destructive',

    'text-destructive-foreground',

    'bg-destructive-muted',

    'text-destructive-muted-foreground',

    'shadow-premium',

    'shadow-premium-lg',

    'bg-surface-elevated',

    'bg-surface-elevated-muted',

    'text-surface-elevated-foreground',

    'overlay-backdrop',

  ],

  theme: {

    extend: {

      colors: {

        background: 'var(--background)',

        foreground: 'var(--foreground)',

        primary: {

          DEFAULT: 'var(--primary)',

          foreground: 'var(--primary-foreground)',

          50: '#F8FBFF',

          100: '#EAF4FF',

          200: '#DCEEFF',

          300: '#8FC5F7',

          400: '#6BB4EE',

          500: '#5BA4E6',

          600: '#3E8DD6',

          700: '#2E76B8',

          800: '#1E5A94',

          900: '#1E3A5F',

        },

        secondary: {

          DEFAULT: 'var(--secondary)',

          foreground: 'var(--secondary-foreground)',

        },

        muted: {

          DEFAULT: 'var(--muted)',

          foreground: 'var(--muted-foreground)',

        },

        card: {

          DEFAULT: 'var(--card)',

          foreground: 'var(--card-foreground)',

        },

        border: 'var(--border)',

        accent: {

          DEFAULT: 'var(--accent)',

          foreground: 'var(--accent-foreground)',

        },

        highlight: {

          DEFAULT: 'var(--highlight)',

          foreground: 'var(--highlight-foreground)',

        },

        gold: {

          DEFAULT: 'var(--gold)',

          foreground: 'var(--foreground)',

        },

        success: {

          DEFAULT: 'var(--success)',

          foreground: 'var(--success-foreground)',

        },

        'card-white': 'var(--card-white)',

        'card-cream': 'var(--card-cream)',

        'card-emerald': 'var(--card-emerald)',

        'card-indigo': 'var(--card-indigo)',

        'card-nude-green': 'var(--card-nude-green)',

        'card-nude-blue': 'var(--card-nude-blue)',

        'card-neutral-blue': 'var(--card-neutral-blue)',

        'card-pink': 'var(--card-pink)',

        'card-peach': 'var(--card-peach)',

        'card-lavender': 'var(--card-lavender)',

        'card-mint': 'var(--card-mint)',

        destructive: {

          DEFAULT: 'var(--destructive)',

          foreground: 'var(--destructive-foreground)',

          muted: 'var(--destructive-muted)',

          'muted-foreground': 'var(--destructive-muted-foreground)',

        },

        ring: 'var(--ring)',

        'surface-elevated': {

          DEFAULT: 'var(--surface-elevated)',

          muted: 'var(--surface-elevated-muted)',

          foreground: 'var(--surface-elevated-foreground)',

        },

        surface: {

          50: 'var(--background)',

          100: 'var(--muted)',

          200: 'var(--border)',

        },

      },

      fontFamily: {

        sans: ['var(--font-geist-sans)', 'Inter', 'system-ui', 'sans-serif'],

      },

      backgroundImage: {

        'gradient-brand': 'var(--gradient-brand)',

        'gradient-growth': 'var(--gradient-growth)',

      },

      boxShadow: {

        soft: '0 2px 15px -3px rgb(15 11 23 / 0.07), 0 4px 6px -4px rgb(15 11 23 / 0.04)',

        'soft-lg': '0 10px 40px -10px rgb(15 11 23 / 0.1)',

        glow: '0 0 28px -4px rgb(91 164 230 / 0.35)',

        premium: 'var(--shadow-premium)',

        'premium-lg': 'var(--shadow-premium-lg)',

      },

      borderRadius: {

        '2xl': '1rem',

        '3xl': '1.25rem',

      },

    },

  },

  plugins: [],

};

