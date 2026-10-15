/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Semantic palette from REDESIGN_TEMPLATE.md
        paper: {
          DEFAULT: 'var(--paper)',
          2: 'var(--paper-2)',
        },
        card: 'var(--card)',
        ink: {
          DEFAULT: 'var(--ink)',
          soft: 'var(--ink-soft)',
          muted: 'var(--ink-muted)',
        },
        ember: {
          DEFAULT: 'var(--ember)',
          hover: 'var(--ember-hover)',
          soft: 'var(--ember-soft)',
        },
        cobalt: {
          DEFAULT: 'var(--ember)',
          hover: 'var(--ember-hover)',
          soft: 'var(--ember-soft)',
        },
        purple: {
          DEFAULT: 'var(--color-accent)',
          hover: 'var(--color-accent-hover)',
          light: 'var(--purple-light)',
          dark: 'var(--color-accent-active)',
          soft: 'var(--color-accent-soft)',
        },
        lavender: {
          DEFAULT: '#EDE9FE',
          light: '#F5F3FF',
          dark: '#DDD6FE',
          border: '#C4B5FD',
        },

        // Sticker Accent Palette
        pink: {
          DEFAULT: '#FF5C8A',
          soft: '#FFEAF1',
        },
        mint: {
          DEFAULT: '#7FD8B8',
          soft: '#EDFAF5',
        },
        mustard: {
          DEFAULT: '#F2B84B',
          soft: '#FDF7EB',
        },
        tangerine: {
          DEFAULT: '#FF6B35',
          soft: '#FFF0EA',
        },
        sky: {
          DEFAULT: '#8EC5FF',
          soft: '#EFF6FF',
        },
        lime: {
          DEFAULT: '#D4F25A',
          soft: '#F8FDE6',
        },

        // Dedicated Admin Palette
        admin: {
          bg: 'var(--color-canvas)',
          surface: 'var(--color-surface)',
          text: 'var(--color-ink)',
          accent: 'var(--color-accent)',
          border: 'var(--color-line)',
          muted: 'var(--color-ink-muted)',
        },

        // Semantic CSS Custom Variable Mappings
        bg: 'var(--paper)',
        surface: 'var(--card)',
        'surface-sunken': 'var(--paper-2)',
        subtle: 'var(--paper-2)',
        line: 'var(--line)',
        text: 'var(--ink)',
        'text-2': 'var(--ink-soft)',
        'text-3': 'var(--ink-muted)',
        accent: {
          DEFAULT: 'var(--color-accent)',
          hover: 'var(--color-accent-hover)',
          soft: 'var(--color-accent-soft)',
        },
        'on-accent': 'var(--color-on-accent)'
        , 'surface-subtle': 'var(--color-surface-hover)'
        , 'line-strong': 'var(--color-line-strong)',
        success: 'var(--color-success)',
        warning: 'var(--color-warning)',
        danger: 'var(--color-danger)',
      },
      fontFamily: {
        display: ['var(--font-sans)'], accent: ['var(--font-sans)'], sans: ['var(--font-sans)'], body: ['var(--font-sans)'], mono: ['var(--font-mono)', 'monospace'],
      },
      fontSize: {
        caption: ['0.75rem', { lineHeight: '1rem' }],
        small: ['0.875rem', { lineHeight: '1.4' }],
        btn: ['0.9375rem', { lineHeight: '1.3', fontWeight: '600' }],
        body: ['1rem', { lineHeight: '1.5' }],
        'card-title': ['1.25rem', { lineHeight: '1.25', fontWeight: '700' }],
        h3: ['1.125rem', { lineHeight: '1.5rem', fontWeight: '600' }],
        h2: ['1.75rem', { lineHeight: '2.25rem', letterSpacing: '-0.02em' }],
        h1: ['clamp(1.5rem, 3vw, 1.75rem)', { lineHeight: '1.3', letterSpacing: '-0.02em' }],
        hero: ['clamp(1.75rem, 4vw, 2.25rem)', { lineHeight: '1.22', letterSpacing: '-0.02em' }],
        section: ['clamp(1.75rem, 3.5vw, 2.5rem)', { lineHeight: '1.1' }],
      },
      boxShadow: {
        none: 'none', offset: 'none', 'offset-sm': 'none', 'offset-lg': 'none',
        'offset-cobalt': 'none', 'offset-lime': 'none', card: 'none', soft: 'none',
        floating: 'var(--shadow-raised)',
      },
      borderRadius: {
        sm: 'var(--radius-small)', DEFAULT: 'var(--radius-control)', md: 'var(--radius-control)',
        lg: 'var(--radius-card)', ticket: 'var(--radius-card)', poster: 'var(--radius-poster, 18px)',
        input: 'var(--radius-control)', panel: 'var(--radius-panel, 24px)', full: '9999px', pill: '9999px',
      },
      maxWidth: {
        container: '1280px',
      },
    },
  },
  plugins: [],
}
