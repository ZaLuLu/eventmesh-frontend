export const TOKENS = {
  // Iris & Amethyst Accent Reference Tokens
  champion: '#6366F1',
  champion2: '#4F46E5',
  lavender: '#E0E2FD',
  lavender100: '#F0F2FF',
  lavender200: '#E0E2FD',
  lavender300: '#C7CEFA',
  violet: '#6366F1',
  violetHover: '#4F46E5',

  // Canvas & Surfaces (Iris Obsidian Alabaster Tokens)
  bg: '#FAF9FC',
  surface: '#FEFEFF',
  subtle: '#F3F1F8',
  line: '#E8E5EE',

  // Text (Deep Amethyst Ink)
  text: '#14111D',
  text2: '#6B6578',
  text3: '#9D96AC',
  onDark: '#F4F2F8',
  onDark2: '#9D96AC',

  // Status Signals
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  verified: '#6366F1',

  // Accent Mappings: Electric Iris
  accent: '#6366F1',
  accentHover: '#4F46E5',
  accentSoft: 'rgba(99, 102, 241, 0.08)',
  onAccent: '#FFFFFF',

  // Shadows: Subtle Ambient Elevation (Zero cartoon offset shadows)
  cardShadow: '0 2px 8px -1px rgba(20, 17, 29, 0.05)',
  floatingShadow: '0 8px 30px -4px rgba(20, 17, 29, 0.08)',

  // Border Radii: Modernist Refined
  radiusSmall: '6px',
  radiusInput: '10px',
  radiusPanel: '14px',
  radiusCardInner: '12px',
  radiusCardRow: '14px',
  radiusCardOuter: '16px',
  radiusPill: '9999px',

  // Admin Scope: Obsidian Amethyst
  adminBg: '#0D0B12',
  adminSurface: '#16131F',
  adminSidebar: '#0D0B12',
  adminAccent: '#818CF8',
  adminAccentHover: '#A5B4FC',
  adminLine: '#292338',
  adminSubtle: '#1C1827',

  // Curated Club Palettes (Harmonious Modern-Minimal Palette)
  curatedPalettes: [
    { bg: '#FAF9FC', border: '#E8E5EE', text: '#14111D', accent: '#6366F1', hex: '#6366F1', label: 'Iris Minimal', name: 'Iris Minimal' },
    { bg: '#0D0B12', border: '#292338', text: '#F4F2F8', accent: '#818CF8', hex: '#818CF8', label: 'Obsidian Noir', name: 'Obsidian Noir' },
    { bg: '#F6F5F9', border: '#E2DFEC', text: '#1B1726', accent: '#7C3AED', hex: '#7C3AED', label: 'Royal Violet', name: 'Royal Violet' },
    { bg: '#F8F9FA', border: '#E5E7EB', text: '#111827', accent: '#2563EB', hex: '#2563EB', label: 'Cobalt Slate', name: 'Cobalt Slate' },
    { bg: '#F0FDF4', border: '#DCFCE7', text: '#14532D', accent: '#10B981', hex: '#10B981', label: 'Emerald Mint', name: 'Emerald Mint' },
  ]
} as const
