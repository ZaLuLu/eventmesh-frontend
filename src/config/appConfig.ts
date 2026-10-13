/**
 * Centralized Application Configuration
 * Handles campus domains, localization defaults, and feature flags.
 */

export interface CampusLocation {
  id: string
  name: string
  location: string
}

export interface AppConfig {
  institutionName: string
  campusEmailDomains: string[]
  campuses: CampusLocation[]
  currency: {
    code: string
    symbol: string
    locale: string
  }
  timezone: string
}

export const APP_CONFIG: AppConfig = {
  institutionName: 'Campus Technical University',
  // Configurable campus email domains (Indian colleges + general academic)
  campusEmailDomains: ['ac.in', 'edu.in', 'campus.ac.in', 'college.edu', 'university.edu.in'],
  campuses: [
    { id: 'main', name: 'Main Campus', location: 'Bangalore' },
  ],
  currency: {
    code: 'INR',
    symbol: '₹',
    locale: 'en-IN',
  },
  timezone: 'Asia/Kolkata',
}

export const appConfig = APP_CONFIG

/**
 * Validates whether an email belongs to a recognized campus domain.
 */
export function isCampusEmail(email: string): boolean {
  if (!email || !email.includes('@')) return false
  const domain = email.split('@')[1].toLowerCase()
  return APP_CONFIG.campusEmailDomains.some(
    (allowed) => domain === allowed || domain.endsWith(`.${allowed}`)
  )
}

/**
 * Check if the application is configured with more than one campus.
 * Prevents redundant campus dropdowns for single-institution deployments (Audit F-09).
 */
export function hasMultipleCampuses(): boolean {
  return APP_CONFIG.campuses.length > 1
}
