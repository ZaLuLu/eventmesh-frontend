/**
 * EventMesh Club Color Mapping Matrix
 * Governs PosterArt tinting, calendar dots, sticker chips, and chart bars.
 * Section 6.2 Specification.
 */
import { StickerColor } from './primitives/Sticker'

export interface ClubTheme {
  name: string
  color: string
  hex: string
  textColor: string
  borderColor: string
  tokenVar: string
  token: StickerColor
}

export const CLUB_COLORS: Record<string, ClubTheme> = {
  'cp-club': {
    name: 'CP Club',
    color: '#0047FF',
    hex: '#0047FF',
    textColor: '#FFFFFF',
    borderColor: '#0037CC',
    tokenVar: 'var(--cobalt)',
    token: 'cobalt',
  },
  'aionai': {
    name: 'AIONAI',
    color: '#C8BEFA',
    hex: '#C8BEFA',
    textColor: '#151130',
    borderColor: '#A899E6',
    tokenVar: 'var(--lavender)',
    token: 'lavender',
  },
  'birds': {
    name: 'BIRDS',
    color: '#7FD8B8',
    hex: '#7FD8B8',
    textColor: '#151130',
    borderColor: '#5BB894',
    tokenVar: 'var(--mint)',
    token: 'mint',
  },
  'devcraft': {
    name: 'DevCraft',
    color: '#FF6B35',
    hex: '#FF6B35',
    textColor: '#FFFFFF',
    borderColor: '#E0531E',
    tokenVar: 'var(--tangerine)',
    token: 'tangerine',
  },
  'robocrafters': {
    name: 'Robocrafters',
    color: '#F2B84B',
    hex: '#F2B84B',
    textColor: '#151130',
    borderColor: '#D49D33',
    tokenVar: 'var(--mustard)',
    token: 'mustard',
  },
  'cyberguard': {
    name: 'CyberGuard',
    color: '#151130',
    hex: '#151130',
    textColor: '#D4F25A',
    borderColor: '#D4F25A',
    tokenVar: 'var(--ink)',
    token: 'ink',
  },
  'nexiot': {
    name: 'NexIoT',
    color: '#8EC5FF',
    hex: '#8EC5FF',
    textColor: '#151130',
    borderColor: '#6BA8EB',
    tokenVar: 'var(--sky)',
    token: 'sky',
  },
  'pixelforge': {
    name: 'PixelForge',
    color: '#FF5C8A',
    hex: '#FF5C8A',
    textColor: '#FFFFFF',
    borderColor: '#E63D6D',
    tokenVar: 'var(--pink)',
    token: 'pink',
  },
  'foss-society': {
    name: 'FOSS Society',
    color: '#D4F25A',
    hex: '#D4F25A',
    textColor: '#151130',
    borderColor: '#B2CE39',
    tokenVar: 'var(--lime)',
    token: 'lime',
  },
}

/**
 * Resolve theme for a club slug or name, with fallback to electric cobalt.
 */
export function getClubTheme(clubSlugOrName: string | undefined): ClubTheme {
  if (!clubSlugOrName) {
    return CLUB_COLORS['cp-club']
  }
  const normalized = clubSlugOrName.toLowerCase().replace(/\s+/g, '-')
  if (CLUB_COLORS[normalized]) {
    return CLUB_COLORS[normalized]
  }

  // Partial match fallback
  for (const [key, theme] of Object.entries(CLUB_COLORS)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return theme
    }
  }

  return CLUB_COLORS['cp-club']
}
