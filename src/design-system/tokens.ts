export const TOKENS = {
  // Champion & Lavender Palette
  champion: '#151130',
  champion2: '#1E1846',
  lavender: '#C8BEFA',
  lavender100: '#F1EEFE',
  lavender200: '#E4DFFC',
  lavender300: '#D6CEFB',
  violet: '#5B47D6',
  violetHover: '#4A38BF',

  // Canvas & Surfaces
  bg: '#F7F5FD',
  surface: '#FFFFFF',
  subtle: '#F1EEFE',
  line: '#E3DFF3',

  // Text
  text: '#151130',
  text2: '#4B4670',
  text3: '#6C6790',
  onDark: '#F3F0FF',
  onDark2: '#BDB6E0',

  // Status
  success: '#1E7A4C',
  warning: '#A85F00',
  danger: '#B42318',
  verified: '#1FA34A',

  // Backward compatibility alias
  accent: '#5B47D6',
  accentHover: '#4A38BF',
  accentSoft: '#F1EEFE',
  onAccent: '#FFFFFF',

  // Shadow
  cardShadow: '0 10px 30px rgba(21, 17, 48, 0.08)',
  floatingShadow: '0 4px 16px rgba(21, 17, 48, 0.08)',

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
