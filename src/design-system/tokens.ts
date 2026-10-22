export const TOKENS = {
  // Royal Purple semantic reference tokens
  champion: '#7C3AED',
  champion2: '#6D28D9',
  lavender: '#F3EDFD',
  lavender100: '#FAF8FF',
  lavender200: '#F3EDFD',
  lavender300: '#E9D5FF',
  violet: '#7C3AED',
  violetHover: '#6D28D9',

  // Canvas & Surfaces (Studio Precision Light)
  bg: '#FAF8FF',
  surface: '#FFFFFF',
  subtle: '#F3EDFD',
  line: '#E9D5FF',

  // Text (Precision Slate Ink)
  text: '#120D24',
  text2: '#4E466B',
  text3: '#786F9C',
  onDark: '#FAF8FF',
  onDark2: '#C4B5FD',

  // Status Signals
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  verified: '#10B981',

  // Accent mappings: Royal Purple
  accent: '#7C3AED',
  accentHover: '#6D28D9',
  accentSoft: 'rgba(124, 58, 237, 0.08)',
  onAccent: '#FFFFFF',

  // Shadows: Clean Architectural Micro-Shadows (Zero comic offset shadows)
  cardShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px -1px rgba(0, 0, 0, 0.02)',
  floatingShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04)',

  // Border Radii: 3-Tier Strict Hallmark/Denim Dept Normalization
  radiusSmall: '8px',
  radiusControl: '8px',
  radiusInput: '8px',
  radiusCard: '14px',
  radiusCardRow: '14px',
  radiusCardInner: '14px', // Normalized from 18px (Gate 22)
  radiusCardOuter: '14px', // Normalized from 24px (Gate 22)
  radiusPanel: '14px',     // Normalized from 24px (Gate 22)
  radiusPill: '9999px',

  // Typography Tracking & Pacing Tokens (Denim Dept DNA)
  trackingKicker: '0.25em',
  trackingNav: '0.15em',
  trackingSubheading: '0.08em',
  trackingHeading: '-0.02em',

  // Iconography Tokens (Denim Dept Standard)
  iconStrokeWidth: 1.5,
  iconSizeXs: 14,
  iconSizeSm: 20,
  iconSizeMd: 22,
  iconSizeLg: 24,

  // Perceptual Spring Timing (Denim Dept Physics)
  springSnappy: 'linear(0, 0.0234, 0.0805 4.48%, 0.4865 15.68%, 0.6211 20.16%, 0.7696 26.88%, 0.8064 29.12%, 0.8646, 0.9063, 0.9358, 0.9563 47.04%, 0.9757, 0.9867 60.48%, 0.9941 69.44%, 0.9979 80.64%, 0.9996 98.56%)',
  springSnappyDuration: '0.2988s',
  springGentle: 'linear(0, 0.0033 0.81%, 0.027 2.42%, 0.0916 4.84%, 0.4745 15.32%, 0.6422 20.97%, 0.7175, 0.7789, 0.8283 30.64%, 0.876, 0.9111 38.71%, 0.941, 0.9611 48.39%, 0.9707, 0.978 54.84%, 0.9885 62.1%, 0.9949 70.97%, 0.9982 82.26%, 0.9997 100%)',
  springGentleDuration: '0.4980s',

  // Admin Scope: Obsidian Amethyst
  adminBg: '#0B0814',
  adminSurface: '#1A1333',
  adminSidebar: '#0B0814',
  adminAccent: '#8B5CF6',
  adminAccentHover: '#A78BFA',
  adminLine: '#2B1F4F',
  adminSubtle: '#130E24',

  // Curated Club Palettes (Harmonious Modern-Minimal Palette)
  curatedPalettes: [
    { bg: '#FAF9FC', border: '#E8E5EE', text: '#14111D', accent: '#6366F1', hex: '#6366F1', label: 'Iris Minimal', name: 'Iris Minimal' },
    { bg: '#0B0814', border: '#2B1F4F', text: '#F4F2F8', accent: '#8B5CF6', hex: '#8B5CF6', label: 'Obsidian Noir', name: 'Obsidian Noir' },
    { bg: '#F6F5F9', border: '#E2DFEC', text: '#1B1726', accent: '#7C3AED', hex: '#7C3AED', label: 'Royal Violet', name: 'Royal Violet' },
    { bg: '#F8F9FA', border: '#E5E7EB', text: '#111827', accent: '#2563EB', hex: '#2563EB', label: 'Cobalt Slate', name: 'Cobalt Slate' },
    { bg: '#F0FDF4', border: '#DCFCE7', text: '#14532D', accent: '#10B981', hex: '#10B981', label: 'Emerald Mint', name: 'Emerald Mint' },
  ]
} as const
