/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // High-Contrast Obsidian Stage & Electric Violet Tokens
        champion: {
          DEFAULT: '#0C0A1A',
          2: '#141126',
        },
        lavender: {
          DEFAULT: '#DDD6FE',
          100: '#F3F0FF',
          200: '#E4DFFC',
          300: '#C4B5FD',
        },
        violet: {
          DEFAULT: '#5E4AE3',
          hover: '#4D39D1',
        },
        'on-dark': '#F8FAFC',
        'on-dark-2': '#94A3B8',
        verified: '#10B981',

        // Semantic Canvas Tokens (Crisp Slate Neutrals)
        bg: '#F8F9FC',
        surface: '#FFFFFF',
        'surface-sunken': '#F1F3F9',
        subtle: '#F1F3F9',
        line: '#E2E6EE',
        ink: {
          DEFAULT: '#0F172A',
          muted: '#475569',
          subtle: '#64748B',
        },
        text: '#0F172A',
        'text-2': '#475569',
        'text-3': '#64748B',
        accent: {
          DEFAULT: '#5E4AE3',
          hover: '#4D39D1',
          soft: '#EEF0FD',
        },
        'on-accent': '#FFFFFF',
        success: '#10B981',
        warning: '#F59E0B',
        danger: '#EF4444',

        // Admin Scope Specifics
        sidebar: 'var(--sidebar)',
        'admin-accent': 'var(--admin-accent)',
        'admin-accent-hover': 'var(--admin-accent-hover)',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans Variable"', '"Plus Jakarta Sans"', '"Inter Variable"', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        body: ['"Plus Jakarta Sans Variable"', '"Plus Jakarta Sans"', '"Inter Variable"', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['"Plus Jakarta Sans Variable"', '"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        display: ['"Plus Jakarta Sans Variable"', '"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
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
