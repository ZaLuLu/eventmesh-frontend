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

  // Border Radii: Modernist Refined
  radiusSmall: '6px',
  radiusInput: '8px',
  radiusPanel: '24px',
  radiusCardInner: '18px',
  radiusCardRow: '14px',
  radiusCardOuter: '24px',
  radiusPill: '9999px',

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
