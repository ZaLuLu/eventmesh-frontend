/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: '#FAFAF9',
        surface: '#FFFFFF',
        'surface-subtle': '#F4F4F5',
        'surface-elevated': '#FFFFFF',
        paper: 'var(--paper)',
        ink: 'var(--ink)',
        'ink-60': 'var(--ink-60)',
        'ink-15': 'var(--ink-15)',
        'paper-deep': 'var(--paper-deep)',
        premium: 'var(--premium)',
        event: 'var(--event)',
        'on-event': 'var(--on-event)',
        
        // Entertainment & Ambient Accents
        brand: {
          red: '#E50914',
          blue: '#2563EB',
          pink: '#FF2E93',
          purple: '#7928CA',
          amber: '#F59E0B',
          emerald: '#10B981',
          cyan: '#00F0FF',
        },

        // Admin Console
        'admin-canvas': 'var(--admin-canvas)',
        'admin-sidebar': 'var(--admin-sidebar)',
        'admin-accent': 'var(--admin-accent)',
        'admin-on-accent': 'var(--admin-on-accent)',
        'admin-border': 'var(--admin-border)',
      },
      fontFamily: {
        display: ['Outfit', 'system-ui', 'sans-serif'],
        body: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        heading: ['"Bebas Neue"', 'Outfit', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'subtle': '0 1px 2px 0 rgba(0, 0, 0, 0.04)',
        'card': '0 4px 20px -2px rgba(0, 0, 0, 0.05), 0 2px 6px -1px rgba(0, 0, 0, 0.02)',
        'card-hover': '0 12px 32px -4px rgba(0, 0, 0, 0.08), 0 4px 12px -2px rgba(0, 0, 0, 0.04)',
        'ambient': '0 16px 40px -10px var(--ambient-color, rgba(37, 99, 235, 0.15))',
        'glow-red': '0 10px 30px -5px rgba(229, 9, 20, 0.25)',
        'glow-blue': '0 10px 30px -5px rgba(37, 99, 235, 0.25)',
        'glow-purple': '0 10px 30px -5px rgba(121, 40, 202, 0.25)',
      },
      borderRadius: {
        'sm': '6px',
        DEFAULT: '8px',
        'md': '10px',
        'lg': '12px',
        'xl': '16px',
        '2xl': '20px',
        '3xl': '28px',
        'full': '9999px',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 4s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        }
      }
    },
  },
  plugins: [],
}
