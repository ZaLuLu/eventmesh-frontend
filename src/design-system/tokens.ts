export const TOKENS = {
  // Architectural Prussian Blueprint Tokens
  champion: '#08101E',
  champion2: '#0D192E',
  lavender: '#0D192E',
  lavender100: '#11223D',
  lavender200: '#162C4E',
  lavender300: '#1A2E4C',
  violet: '#38BDF8',
  violetHover: '#0EA5E9',

  // Canvas & Surfaces (Prussian Blueprint Drafting)
  bg: '#08101E',
  surface: '#0D192E',
  subtle: '#11223D',
  line: '#1A2E4C',

  // Text
  text: '#FFFFFF',
  text2: '#94A3B8',
  text3: '#64748B',
  onDark: '#FFFFFF',
  onDark2: '#94A3B8',

  // Status (Matte Ink)
  success: '#16A34A',
  warning: '#D97706',
  danger: '#DC2626',
  verified: '#38BDF8',

  // Accent Mappings: Matte Sky Cyan
  accent: '#38BDF8',
  accentHover: '#0EA5E9',
  accentSoft: 'rgba(56, 189, 248, 0.12)',
  onAccent: '#08101E',

  // Shadow (Subtle paper elevation, zero neon blur)
  cardShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
  floatingShadow: '0 8px 30px rgba(0, 0, 0, 0.5)',

  // Border Radii
  radiusSmall: '8px',
  radiusInput: '14px',
  radiusPanel: '18px',
  radiusCardInner: '22px',
  radiusCardRow: '24px',
  radiusCardOuter: '28px',
  radiusPill: '9999px',

  // Admin Scope
  adminBg: '#F3F5F6',
  adminSurface: '#FFFFFF',
  adminSidebar: '#0F1A24',
  adminAccent: '#17645F',
  adminAccentHover: '#0F4F4B',
  adminLine: '#E0E3E6',
  adminSubtle: '#E8ECEE',

  // Curated Club Palettes
  curatedPalettes: [
    { name: 'Lavender Tonic', hex: '#C8BEFA' },
    { name: 'Royal Violet', hex: '#5B47D6' },
    { name: 'Champion Dark', hex: '#151130' },
    { name: 'Emerald', hex: '#1E7A4C' },
    { name: 'Terracotta', hex: '#C66A4A' },
    { name: 'Deep Sage', hex: '#6F8468' },
    { name: 'Deep Teal', hex: '#17645F' },
    { name: 'Crimson', hex: '#B42318' },
    { name: 'Amber Ochre', hex: '#A85F00' },
  ],
} as const
