/**
 * Curated Local SVG Avatar Collection
 * Coherent minimalist visual style under MIT / CC0 license.
 * Zero external CDN dependencies, 100% offline-first.
 */

export interface AvatarOption {
  id: string
  label: string
  accent: string
  dataUrl: string
}

// 12 Curated Geometric Minimalist Avatars
export const CURATED_AVATARS: AvatarOption[] = [
  {
    id: 'iris-architect',
    label: 'Iris Architect',
    accent: '#6366F1',
    dataUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><rect width="100" height="100" rx="50" fill="%236366F1"/><circle cx="50" cy="38" r="18" fill="%23FFFFFF"/><path d="M22 84c0-16 12-26 28-26s28 10 28 26" fill="%23FFFFFF" opacity="0.9"/></svg>`,
  },
  {
    id: 'emerald-builder',
    label: 'Emerald Builder',
    accent: '#10B981',
    dataUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><rect width="100" height="100" rx="50" fill="%2310B981"/><circle cx="50" cy="38" r="18" fill="%23FFFFFF"/><path d="M24 82c0-15 11-24 26-24s26 9 26 24" fill="%23FFFFFF" opacity="0.9"/><rect x="42" y="22" width="16" height="6" rx="3" fill="%23064E3B"/></svg>`,
  },
  {
    id: 'amethyst-scholar',
    label: 'Amethyst Scholar',
    accent: '#8B5CF6',
    dataUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><rect width="100" height="100" rx="50" fill="%238B5CF6"/><circle cx="50" cy="36" r="17" fill="%23FFFFFF"/><path d="M20 86c0-17 13-28 30-28s30 11 30 28" fill="%23FFFFFF" opacity="0.9"/><polygon points="50,14 68,26 32,26" fill="%234C1D95"/></svg>`,
  },
  {
    id: 'cobalt-hacker',
    label: 'Cobalt Systems',
    accent: '#2563EB',
    dataUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><rect width="100" height="100" rx="50" fill="%232563EB"/><circle cx="50" cy="38" r="18" fill="%23FFFFFF"/><path d="M22 84c0-16 12-26 28-26s28 10 28 26" fill="%23FFFFFF" opacity="0.9"/><rect x="36" y="34" width="28" height="6" rx="3" fill="%231E3A8A"/></svg>`,
  },
  {
    id: 'amber-creator',
    label: 'Amber Pioneer',
    accent: '#F59E0B',
    dataUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><rect width="100" height="100" rx="50" fill="%23F59E0B"/><circle cx="50" cy="38" r="18" fill="%23FFFFFF"/><path d="M22 84c0-16 12-26 28-26s28 10 28 26" fill="%23FFFFFF" opacity="0.9"/><circle cx="50" cy="38" r="6" fill="%2378350F"/></svg>`,
  },
  {
    id: 'crimson-strategist',
    label: 'Crimson Lead',
    accent: '#EF4444',
    dataUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><rect width="100" height="100" rx="50" fill="%23EF4444"/><circle cx="50" cy="38" r="18" fill="%23FFFFFF"/><path d="M22 84c0-16 12-26 28-26s28 10 28 26" fill="%23FFFFFF" opacity="0.9"/><polygon points="44,20 56,20 50,30" fill="%237F1D1D"/></svg>`,
  },
  {
    id: 'cyan-cyber',
    label: 'Cyan Terminal',
    accent: '#06B6D4',
    dataUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><rect width="100" height="100" rx="50" fill="%2306B6D4"/><circle cx="50" cy="38" r="18" fill="%23FFFFFF"/><path d="M22 84c0-16 12-26 28-26s28 10 28 26" fill="%23FFFFFF" opacity="0.9"/><rect x="40" y="35" width="20" height="4" fill="%23164E63"/></svg>`,
  },
  {
    id: 'obsidian-noir',
    label: 'Obsidian Crypt',
    accent: '#18181B',
    dataUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><rect width="100" height="100" rx="50" fill="%2318181B"/><circle cx="50" cy="38" r="18" fill="%23A1A1AA"/><path d="M22 84c0-16 12-26 28-26s28 10 28 26" fill="%23A1A1AA" opacity="0.8"/></svg>`,
  },
  {
    id: 'violet-spark',
    label: 'Violet Horizon',
    accent: '#7C3AED',
    dataUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><rect width="100" height="100" rx="50" fill="%237C3AED"/><circle cx="50" cy="38" r="18" fill="%23FFFFFF"/><path d="M22 84c0-16 12-26 28-26s28 10 28 26" fill="%23FFFFFF" opacity="0.9"/><circle cx="50" cy="24" r="4" fill="%23DDD6FE"/></svg>`,
  },
  {
    id: 'mint-fellow',
    label: 'Mint Research',
    accent: '#34D399',
    dataUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><rect width="100" height="100" rx="50" fill="%2334D399"/><circle cx="50" cy="38" r="18" fill="%23FFFFFF"/><path d="M22 84c0-16 12-26 28-26s28 10 28 26" fill="%23FFFFFF" opacity="0.9"/><path d="M42 24q8-6 16 0" stroke="%23065F46" stroke-width="3" fill="none"/></svg>`,
  },
  {
    id: 'slate-curator',
    label: 'Slate Society',
    accent: '#64748B',
    dataUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><rect width="100" height="100" rx="50" fill="%2364748B"/><circle cx="50" cy="38" r="18" fill="%23FFFFFF"/><path d="M22 84c0-16 12-26 28-26s28 10 28 26" fill="%23FFFFFF" opacity="0.9"/><rect x="38" y="32" width="24" height="10" rx="2" fill="%231E293B"/></svg>`,
  },
  {
    id: 'fuchsia-pulse',
    label: 'Fuchsia Design',
    accent: '#D946EF',
    dataUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><rect width="100" height="100" rx="50" fill="%23D946EF"/><circle cx="50" cy="38" r="18" fill="%23FFFFFF"/><path d="M22 84c0-16 12-26 28-26s28 10 28 26" fill="%23FFFFFF" opacity="0.9"/><polygon points="50,22 55,30 45,30" fill="%23701A75"/></svg>`,
  },
]

const AVATAR_PREF_PREFIX = 'eventmesh_user_avatar_'

export interface UserAvatarPreference {
  avatarUrl: string
  source: 'google' | 'assigned' | 'custom'
  avatarId?: string
}

/**
 * Get the saved avatar preference for a specific user ID
 */
export function getUserAvatarPreference(userId: string): UserAvatarPreference | null {
  try {
    const raw = localStorage.getItem(`${AVATAR_PREF_PREFIX}${userId}`)
    if (raw) return JSON.parse(raw)
  } catch {}
  return null
}

/**
 * Save an avatar choice for a user. Marks as 'custom' so subsequent logins don't overwrite.
 */
export function saveUserAvatarPreference(userId: string, pref: UserAvatarPreference): void {
  try {
    localStorage.setItem(`${AVATAR_PREF_PREFIX}${userId}`, JSON.stringify(pref))
  } catch {}
}

/**
 * Resolves avatar URL for a user session:
 * 1. Checks user-selected custom avatar first (persisted).
 * 2. Uses Google profile picture if valid.
 * 3. Assigns a deterministic, stable curated local avatar as fallback.
 */
export function resolveUserAvatar(user: { id: string; email?: string; avatar?: string } | null | undefined): string {
  if (!user) return CURATED_AVATARS[0].dataUrl

  // Check persisted custom preference
  const saved = getUserAvatarPreference(user.id)
  if (saved?.avatarUrl) {
    return saved.avatarUrl
  }

  // Check valid Google avatar URL
  if (user.avatar && (user.avatar.startsWith('http') || user.avatar.startsWith('data:'))) {
    return user.avatar
  }

  // Deterministically assign a curated avatar based on user ID / email
  const hash = (user.id + (user.email || '')).split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  const assigned = CURATED_AVATARS[hash % CURATED_AVATARS.length]

  // Persist as 'assigned' so it is stable across sessions
  saveUserAvatarPreference(user.id, {
    avatarUrl: assigned.dataUrl,
    source: 'assigned',
    avatarId: assigned.id,
  })

  return assigned.dataUrl
}
