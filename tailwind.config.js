/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        surface: 'var(--surface)',
        subtle: 'var(--subtle)',
        line: 'var(--line)',
        text: 'var(--text)',
        'text-2': 'var(--text-2)',
        'text-3': 'var(--text-3)',
        accent: {
          DEFAULT: 'var(--accent)',
          hover: 'var(--accent-hover)',
          soft: 'var(--accent-soft)',
        },
        'on-accent': 'var(--on-accent)',
        success: 'var(--success)',
        warning: 'var(--warning)',
        danger: 'var(--danger)',
        // Admin Scope Specifics
        sidebar: 'var(--sidebar)',
        'admin-accent': 'var(--admin-accent)',
        'admin-accent-hover': 'var(--admin-accent-hover)',
      },
      fontFamily: {
        sans: ['"Inter Variable"', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        body: ['"Inter Variable"', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['"Inter Variable"', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      fontSize: {
        caption: ['0.8125rem', { lineHeight: '1.4' }], // 13px
        small: ['0.875rem', { lineHeight: '1.4' }],    // 14px
        btn: ['0.9375rem', { lineHeight: '1.3', fontWeight: '600' }], // 15px
        body: ['1rem', { lineHeight: '1.55' }],         // 16px
        h3: ['1.125rem', { lineHeight: '1.3', fontWeight: '600' }],   // 18px
      },
      boxShadow: {
        none: 'none',
        floating: '0 4px 16px rgba(27, 26, 25, 0.08)',
      },
      borderRadius: {
        sm: '8px',
        DEFAULT: '10px',
        md: '10px',
        lg: '14px',
        panel: '14px',
        full: '9999px',
      },
      maxWidth: {
        container: '1280px',
      },
    },
  },
  plugins: [],
}
