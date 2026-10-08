/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Google Material 3 System Colors
        canvas: '#F8F9FA',
        surface: '#FFFFFF',
        'surface-variant': '#F1F3F4',
        'surface-subtle': '#F8F9FA',
        
        md: {
          primary: '#1A73E8',          // Google Blue
          'primary-hover': '#1557B0',
          'primary-container': '#E8F0FE',
          'on-primary-container': '#041E49',
          secondary: '#5F6368',
          'secondary-container': '#F1F3F4',
          surface: '#F8F9FA',
          'surface-card': '#FFFFFF',
          outline: '#DADCE0',
          'outline-variant': '#E8EAED',
          'on-surface': '#1F1F1F',
          'on-surface-variant': '#5F6368',
        },

        // Legacy mappings mapped to clean Material 3 tones
        paper: '#F8F9FA',
        ink: '#1F1F1F',
        'ink-60': '#5F6368',
        'ink-15': '#DADCE0',
        'paper-deep': '#F1F3F4',
        premium: '#E37400',
        event: '#1A73E8',
        'on-event': '#FFFFFF',
        'brand-red': '#1A73E8', // Streamlined to Google Blue!
        'brand-blue': '#1A73E8',
        'brand-pink': '#1A73E8',
        'brand-purple': '#5F6368',

        // Admin Console (Clean Material)
        'admin-canvas': '#F8F9FA',
        'admin-sidebar': '#1F1F1F',
        'admin-accent': '#1A73E8',
        'admin-on-accent': '#FFFFFF',
        'admin-border': '#DADCE0',
      },
      fontFamily: {
        display: ['"Plus Jakarta Sans"', 'Roboto', 'sans-serif'],
        body: ['"Plus Jakarta Sans"', 'Roboto', 'sans-serif'],
        heading: ['"Plus Jakarta Sans"', 'Roboto', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'subtle': '0 1px 2px 0 rgba(60, 64, 67, 0.1)',
        'card': '0 1px 3px 0 rgba(60, 64, 67, 0.15), 0 1px 2px 0 rgba(60, 64, 67, 0.08)',
        'card-hover': '0 4px 12px 0 rgba(60, 64, 67, 0.15)',
        'elevated': '0 8px 24px 0 rgba(60, 64, 67, 0.12)',
      },
      borderRadius: {
        'sm': '6px',
        DEFAULT: '8px',
        'md': '12px',
        'lg': '16px',
        'xl': '20px',
        '2xl': '24px', // M3 Medium Card
        '3xl': '28px', // M3 Large Card / Dialog
        'full': '9999px', // M3 Pill
      },
    },
  },
  plugins: [],
}
