export interface LabelConfig {
  organization: string
  organizer: string
  organizerPlural: string
  member: string
  memberPlural: string
  coordinators: string
  studentCoordinators: string
  audienceSegments: string[]
  ticketTerm: string
  certificateTerm: string
  checkinTerm: string
}

export const LABELS: LabelConfig = {
  organization: 'Technical Association',
  organizer: 'Club',
  organizerPlural: 'Clubs',
  member: 'Student',
  memberPlural: 'Students',
  coordinators: 'Lead Coordinators',
  studentCoordinators: 'Organizing Leads',
  audienceSegments: [
    'Technical Faculty',
    'Core Members',
    'Junior Cohort',
    'Senior Fellows',
    'Open Collective',
  ],
  ticketTerm: 'Access Pass',
  certificateTerm: 'Verifiable Certificate',
  checkinTerm: 'Check-in Desk',
}

export function formatLabel(template: string, customLabels: Partial<LabelConfig> = {}): string {
  const merged = { ...LABELS, ...customLabels }
  return template
    .replace(/{organizer}/g, merged.organizer)
    .replace(/{organizers}/g, merged.organizerPlural)
    .replace(/{member}/g, merged.member)
    .replace(/{members}/g, merged.memberPlural)
    .replace(/{organization}/g, merged.organization)
}
