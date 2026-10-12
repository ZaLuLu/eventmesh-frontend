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
        'on-dark': '#FFFFFF',
        'on-dark-2': '#94A3B8',
        verified: '#38BDF8',

        // Semantic Canvas Tokens (Electric Cobalt & Paper White Reference)
        bg: '#FFFFFF',
        surface: '#FFFFFF',
        'surface-sunken': '#F8FAFC',
        subtle: '#F1F5F9',
        line: '#E2E8F0',
        ink: {
          DEFAULT: '#0A0A0A',
          muted: '#4B5563',
          subtle: '#64748B',
        },
        text: '#0A0A0A',
        'text-2': '#4B5563',
        'text-3': '#64748B',
        accent: {
          DEFAULT: '#0047FF',
          hover: '#0037CC',
          soft: 'rgba(0, 71, 255, 0.08)',
        },
        'on-accent': '#FFFFFF',
        success: '#16A34A',
        warning: '#D97706',
        danger: '#DC2626',

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
