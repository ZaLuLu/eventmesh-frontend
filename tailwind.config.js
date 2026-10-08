/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: 'var(--paper)',
        ink: 'var(--ink)',
        'ink-60': 'var(--ink-60)',
        'ink-15': 'var(--ink-15)',
        'paper-deep': 'var(--paper-deep)',
        premium: 'var(--premium)',
        event: 'var(--event)',
        'on-event': 'var(--on-event)',
        'admin-canvas': 'var(--admin-canvas)',
        'admin-sidebar': 'var(--admin-sidebar)',
        'admin-accent': 'var(--admin-accent)',
        'admin-on-accent': 'var(--admin-on-accent)',
        'admin-border': 'var(--admin-border)',
      },
      fontFamily: {
        display: ['var(--font-display)', 'Anton', 'Bebas Neue', 'sans-serif'],
        body: ['var(--font-body)', '"Instrument Sans"', 'Inter', 'sans-serif'],
        mono: ['var(--font-mono)', '"JetBrains Mono"', 'monospace'],
      },
      lineHeight: {
        tighter: '0.84',
      },
      letterSpacing: {
        editorial: '-0.02em',
        caps: '0.06em',
        widecaps: '0.14em',
      },
      transitionTimingFunction: {
        editorial: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      boxShadow: {
        none: 'none',
      },
      borderRadius: {
        none: '0px',
        DEFAULT: '0px',
        sm: '0px',
        md: '0px',
        lg: '0px',
        xl: '0px',
        '2xl': '0px',
        full: '0px',
      }
    },
  },
  plugins: [],
}
