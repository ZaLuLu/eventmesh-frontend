/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Champion & Lavender Core Tokens
        champion: {
          DEFAULT: '#151130',
          2: '#1E1846',
        },
        lavender: {
          DEFAULT: '#E6E4F3',
          100: '#F5F4FA',
          200: '#ECEAF5',
          300: '#D9D5EB',
        },
        violet: {
          DEFAULT: '#5B47D6',
          hover: '#4A38BF',
        },
        'on-dark': '#F3F0FF',
        'on-dark-2': '#BDB6E0',
        verified: '#1FA34A',

        // Semantic Canvas Tokens
        bg: '#F7F5FD',
        surface: '#FFFFFF',
        'surface-sunken': '#F1EEFE',
        subtle: '#F1EEFE',
        line: '#E3DFF3',
        ink: {
          DEFAULT: '#151130',
          muted: '#4B4670',
          subtle: '#6C6790',
        },
        text: '#151130',
        'text-2': '#4B4670',
        'text-3': '#6C6790',
        accent: {
          DEFAULT: '#5B47D6',
          hover: '#4A38BF',
          soft: '#F1EEFE',
        },
        'on-accent': '#FFFFFF',
        success: '#1E7A4C',
        warning: '#A85F00',
        danger: '#B42318',

        // Admin Scope Specifics
        sidebar: 'var(--sidebar)',
        'admin-accent': 'var(--admin-accent)',
        'admin-accent-hover': 'var(--admin-accent-hover)',
      },
      fontFamily: {
        sans: ['"Inter Variable"', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        body: ['"Inter Variable"', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['"Instrument Serif"', 'Georgia', 'serif'],
        display: ['"Instrument Serif"', 'Georgia', 'serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      fontSize: {
        caption: ['0.8125rem', { lineHeight: '1.4' }], // 13px (strict minimum)
        small: ['0.875rem', { lineHeight: '1.4' }],    // 14px
        btn: ['0.9375rem', { lineHeight: '1.3', fontWeight: '600' }], // 15px
        body: ['1rem', { lineHeight: '1.55' }],         // 16px
        'card-title': ['1.1875rem', { lineHeight: '1.3', fontWeight: '600' }], // 19px
        h3: ['1.25rem', { lineHeight: '1.3', fontWeight: '600' }],   // 20px
        section: ['clamp(1.75rem, 3.5vw, 2.5rem)', { lineHeight: '1.15' }],
        promo: ['clamp(2.5rem, 6vw, 4.5rem)', { lineHeight: '1.02' }],
      },
      boxShadow: {
        none: 'none',
        card: '0 10px 30px rgba(21, 17, 48, 0.08)',
        soft: '0 10px 30px rgba(21, 17, 48, 0.08)',
        floating: '0 4px 16px rgba(21, 17, 48, 0.08)',
      },
      borderRadius: {
        sm: '8px',
        DEFAULT: '10px',
        md: '10px',
        lg: '14px',
        input: '14px',
        panel: '18px',
        'card-inner': '22px',
        'card-row': '24px',
        'card-outer': '28px',
        full: '9999px',
        pill: '9999px',
      },
      maxWidth: {
        container: '1280px',
      },
    },
  },
  plugins: [],
}
