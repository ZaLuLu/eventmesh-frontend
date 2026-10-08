import { createTheme } from '@mui/material/styles'

/**
 * Google Material 3 (M3) Official Theme Configuration
 * Streamlined, harmonious tonal palette derived from Google's design system.
 */
export const materialTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1A73E8', // Google Blue (Primary)
      light: '#E8F0FE', // Primary container
      dark: '#1557B0',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#00639B',
      light: '#C2E7FF', // Secondary container
      dark: '#004975',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#F8F9FA', // Google Surface Level 0
      paper: '#FFFFFF',   // Surface Level 1
    },
    text: {
      primary: '#1F1F1F', // Google On-Surface
      secondary: '#5F6368', // Google On-Surface Variant
    },
    divider: '#E1E3E1', // Outline variant
    error: {
      main: '#BA1A1A',
      light: '#FFDAD6',
      contrastText: '#FFFFFF',
    },
    success: {
      main: '#137333',
      light: '#CEEAD6',
      contrastText: '#FFFFFF',
    },
    warning: {
      main: '#E37400',
      light: '#FEEFC3',
      contrastText: '#1F1F1F',
    },
  },
  typography: {
    fontFamily: '"Plus Jakarta Sans", "Roboto", "Segoe UI", -apple-system, sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '2.5rem',
      letterSpacing: '-0.02em',
      color: '#1F1F1F',
    },
    h2: {
      fontWeight: 700,
      fontSize: '2rem',
      letterSpacing: '-0.01em',
      color: '#1F1F1F',
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.5rem',
      color: '#1F1F1F',
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.25rem',
      color: '#1F1F1F',
    },
    body1: {
      fontSize: '0.9375rem',
      lineHeight: 1.6,
      color: '#1F1F1F',
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
      color: '#5F6368',
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
      fontSize: '0.875rem',
    },
  },
  shape: {
    borderRadius: 16, // M3 Medium Shape
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 24, // M3 Full Pill Button
          padding: '8px 20px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 1px 3px 1px rgba(0,0,0,0.15)',
          },
        },
        contained: {
          backgroundColor: '#1A73E8',
          '&:hover': {
            backgroundColor: '#1557B0',
          },
        },
        outlined: {
          borderColor: '#747775',
          color: '#1A73E8',
          '&:hover': {
            backgroundColor: 'rgba(26, 115, 232, 0.04)',
            borderColor: '#1A73E8',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 20, // M3 Card Shape
          border: '1px solid #E1E3E1',
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            transform: 'translateY(-2px)',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8, // M3 Filter Chip
          fontWeight: 500,
          border: '1px solid #C4C7C5',
          backgroundColor: '#FFFFFF',
          '&.MuiChip-filled': {
            backgroundColor: '#E8F0FE',
            color: '#1A73E8',
            borderColor: '#D3E3FD',
            fontWeight: 600,
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFFFFF',
          color: '#1F1F1F',
          boxShadow: 'none',
          borderBottom: '1px solid #E1E3E1',
        },
      },
    },
  },
})
