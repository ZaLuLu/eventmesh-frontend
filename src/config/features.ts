export interface FeatureFlags {
  waitlist: boolean
  teamRegistration: boolean
  certificates: boolean
  checkin: boolean
  followClubs: boolean
  eventApproval: boolean
  paidTickets: boolean
  reservedSeating: boolean
  emailNotifications: boolean
  whatsapp: boolean
}

export const FEATURES: FeatureFlags = {
  waitlist: true,
  teamRegistration: true,
  certificates: true,
  checkin: true,
  followClubs: true,
  eventApproval: false,
  paidTickets: false,
  reservedSeating: false,
  emailNotifications: true,
  whatsapp: false,
}

export function isFeatureEnabled(flag: keyof FeatureFlags): boolean {
  return FEATURES[flag]
}
