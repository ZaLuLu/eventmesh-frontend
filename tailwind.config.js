/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Campus Funk Primary Public Palette
        paper: {
          DEFAULT: '#F6F1E7',
          2: '#EFE8D9',
        },
        card: '#FFFDF8',
        ink: {
          DEFAULT: '#151130',
          soft: '#4A4668',
          muted: '#6B6885',
        },
        cobalt: {
          DEFAULT: '#0047FF',
          hover: '#0037CC',
          soft: 'rgba(0, 71, 255, 0.08)',
        },
        lavender: {
          DEFAULT: '#C8BEFA',
          light: '#F0EDFD',
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
          bg: '#0F0D1F',
          surface: '#181530',
          text: '#F6F1E7',
          accent: '#D4F25A',
          border: '#2D2852',
          muted: '#8D87B0',
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
          DEFAULT: 'var(--cobalt)',
          hover: '#0037CC',
          soft: 'rgba(0, 71, 255, 0.08)',
        },
        'on-accent': '#FFFFFF',
        success: '#16A34A',
        warning: '#D97706',
        danger: '#DC2626',
      },
      fontFamily: {
        display: ['"Bricolage Grotesque Variable"', '"Bricolage Grotesque"', 'system-ui', 'sans-serif'],
        accent: ['"Instrument Serif"', 'serif'],
        sans: ['Geist', 'system-ui', '-apple-system', 'sans-serif'],
        body: ['Geist', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      fontSize: {
        caption: ['0.8125rem', { lineHeight: '1.4' }],
        small: ['0.875rem', { lineHeight: '1.4' }],
        btn: ['0.9375rem', { lineHeight: '1.3', fontWeight: '600' }],
        body: ['1rem', { lineHeight: '1.5' }],
        'card-title': ['1.25rem', { lineHeight: '1.25', fontWeight: '700' }],
        h3: ['1.25rem', { lineHeight: '1.25', fontWeight: '700' }],
        h2: ['clamp(2rem, 4.5vw, 3.5rem)', { lineHeight: '1.05', letterSpacing: '-0.02em' }],
        h1: ['clamp(2.5rem, 7vw, 6rem)', { lineHeight: '0.95', letterSpacing: '-0.03em' }],
        hero: ['clamp(3.5rem, 11vw, 10rem)', { lineHeight: '0.92', letterSpacing: '-0.03em' }],
        section: ['clamp(1.75rem, 3.5vw, 2.5rem)', { lineHeight: '1.1' }],
      },
      boxShadow: {
        none: 'none',
        offset: '3px 3px 0 #151130',
        'offset-sm': '2px 2px 0 #151130',
        'offset-lg': '5px 5px 0 #151130',
        'offset-cobalt': '3px 3px 0 #0047FF',
        'offset-lime': '3px 3px 0 #D4F25A',
        // Compatibility fallbacks
        card: '3px 3px 0 #151130',
        soft: '3px 3px 0 #151130',
        floating: '4px 4px 0 #151130',
      },
      borderRadius: {
        sm: '8px',
        DEFAULT: '12px',
        md: '12px',
        lg: '16px',
        ticket: '16px',
        poster: '20px',
        input: '14px',
        panel: '16px',
        full: '9999px',
        pill: '9999px',
      },
      maxWidth: {
        container: '1320px',
      },
    },
  },
  plugins: [],
}
