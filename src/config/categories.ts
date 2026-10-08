export interface CategoryOption {
  id: string
  label: string
  description?: string
}

export const CATEGORIES: CategoryOption[] = [
  { id: 'all', label: 'All' },
  { id: 'workshop', label: 'Workshops', description: 'Hands-on technical masterclasses' },
  { id: 'hackathon', label: 'Hackathons', description: 'Intensive building and problem-solving sprints' },
  { id: 'competition', label: 'Competitions', description: 'Competitive programming and technical contests' },
  { id: 'talk', label: 'Talks', description: 'Keynotes, fireside chats and industry dialogues' },
  { id: 'technical', label: 'Technical', description: 'Deep-dive engineering symposiums' },
  { id: 'club_events', label: 'Club Events', description: 'Community mixers and internal showcases' },
  { id: 'completed', label: 'Completed', description: 'Archived events with results and galleries' },
]

export const EVENT_TYPES = [
  'workshop',
  'hackathon',
  'competition',
  'talk',
  'other',
] as const

export type EventType = (typeof EVENT_TYPES)[number]
