/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Neomorphic Base Pearl Canvas & Surface
        canvas: '#EEF2F6',
        surface: '#EEF2F6',
        'surface-card': '#EEF2F6',
        'surface-variant': '#E5ECF4',
        'surface-subtle': '#F4F7FA',

        // Neomorphic Shadow Targets
        neo: {
          bg: '#EEF2F6',
          card: '#EEF2F6',
          inset: '#E4EBF3',
          border: 'rgba(255, 255, 255, 0.7)',
        },

        // Feral & Vibrant Energetic Chromas
        feral: {
          indigo: '#6366F1',
          violet: '#8B5CF6',
          purple: '#A855F7',
          pink: '#EC4899',
          rose: '#F43F5E',
          amber: '#F59E0B',
          cyan: '#06B6D4',
          emerald: '#10B981',
        },

        // M3 Compatibility aliases mapped to vibrant colors
        md: {
          primary: '#6366F1',          // Electric Indigo
          'primary-hover': '#4F46E5',
          'primary-container': '#EEF2FF',
          'on-primary-container': '#312E81',
          secondary: '#64748B',
          'secondary-container': '#F1F5F9',
          surface: '#EEF2F6',
          'surface-card': '#EEF2F6',
          outline: 'rgba(255, 255, 255, 0.8)',
          'outline-variant': '#CBD5E1',
          'on-surface': '#1E293B',
          'on-surface-variant': '#64748B',
        },

        // Text & Contrast
        paper: '#EEF2F6',
        ink: '#1E293B',
        'ink-60': '#64748B',
        'ink-15': '#CBD5E1',
        'paper-deep': '#E2E8F0',
        premium: '#F59E0B',
        event: '#6366F1',
        'on-event': '#FFFFFF',

        // Admin Console
        'admin-canvas': '#EEF2F6',
        'admin-sidebar': '#0F172A',
        'admin-accent': '#6366F1',
        'admin-on-accent': '#FFFFFF',
        'admin-border': '#E2E8F0',
      },
      fontFamily: {
        display: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        body: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        heading: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        // Neomorphic Dual Light/Dark Shadows
        'neo-sm': '3px 3px 6px rgba(163, 177, 198, 0.35), -3px -3px 6px rgba(255, 255, 255, 0.85)',
        'neo-card': '7px 7px 16px rgba(163, 177, 198, 0.4), -7px -7px 16px rgba(255, 255, 255, 0.9)',
        'neo-card-hover': '11px 11px 24px rgba(163, 177, 198, 0.5), -11px -11px 24px rgba(255, 255, 255, 1)',
        'neo-inset': 'inset 3px 3px 6px rgba(163, 177, 198, 0.45), inset -3px -3px 6px rgba(255, 255, 255, 0.85)',
        'neo-inset-deep': 'inset 4px 4px 8px rgba(163, 177, 198, 0.55), inset -4px -4px 8px rgba(255, 255, 255, 0.9)',
        'neo-glow-indigo': '0 8px 24px -4px rgba(99, 102, 241, 0.4)',
        'neo-glow-pink': '0 8px 24px -4px rgba(236, 72, 153, 0.4)',
        'neo-glow-emerald': '0 8px 24px -4px rgba(16, 185, 129, 0.4)',

        // Fallbacks
        'subtle': '3px 3px 6px rgba(163, 177, 198, 0.35), -3px -3px 6px rgba(255, 255, 255, 0.85)',
        'card': '7px 7px 16px rgba(163, 177, 198, 0.4), -7px -7px 16px rgba(255, 255, 255, 0.9)',
        'card-hover': '11px 11px 24px rgba(163, 177, 198, 0.5), -11px -11px 24px rgba(255, 255, 255, 1)',
        'elevated': '14px 14px 30px rgba(163, 177, 198, 0.55), -14px -14px 30px rgba(255, 255, 255, 1)',
      },
      borderRadius: {
        'sm': '8px',
        DEFAULT: '12px',
        'md': '16px',
        'lg': '20px',
        'xl': '24px',
        '2xl': '28px',
        '3xl': '34px',
        'full': '9999px',
      },
    },
  },
  plugins: [],
}
