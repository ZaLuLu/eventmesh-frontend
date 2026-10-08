import { describe, it, expect } from 'vitest'
import { can, canAccessAdmin, UserContext } from './permissions'

describe('Central Permissions Engine', () => {
  const platformAdmin: UserContext = {
    id: 'usr-plat',
    name: 'Super Admin',
    email: 'admin@platform.com',
    role: 'platform_admin',
    orgId: 'org-1',
  }

  const orgAdmin: UserContext = {
    id: 'usr-org',
    name: 'TA President',
    email: 'president@ta.org',
    role: 'org_admin',
    orgId: 'org-1',
  }

  const clubAdminA: UserContext = {
    id: 'usr-cluba',
    name: 'CP Club Lead',
    email: 'lead@cpclub.org',
    role: 'club_admin',
    orgId: 'org-1',
    clubId: 'club-cp',
  }

  const clubAdminB: UserContext = {
    id: 'usr-clubb',
    name: 'AIONAI Lead',
    email: 'lead@aionai.org',
    role: 'club_admin',
    orgId: 'org-1',
    clubId: 'club-ai',
  }

  const volunteer: UserContext = {
    id: 'usr-vol',
    name: 'Volunteer Alice',
    email: 'vol@ta.org',
    role: 'volunteer',
    orgId: 'org-1',
    assignedEventIds: ['evt-hackathon'],
  }

  const attendee: UserContext = {
    id: 'usr-att',
    name: 'Participant Bob',
    email: 'bob@example.com',
    role: 'attendee',
    orgId: 'org-1',
  }

  it('platform_admin has universal access', () => {
    expect(can(platformAdmin, 'create_event', { clubId: 'club-cp' })).toBe(true)
    expect(can(platformAdmin, 'manage_roles')).toBe(true)
    expect(can(platformAdmin, 'manage_org_settings')).toBe(true)
    expect(canAccessAdmin(platformAdmin)).toBe(true)
  })

  it('org_admin can manage org-wide features and any club', () => {
    expect(can(orgAdmin, 'manage_clubs')).toBe(true)
    expect(can(orgAdmin, 'approve_event')).toBe(true)
    expect(can(orgAdmin, 'edit_event', { clubId: 'club-cp' })).toBe(true)
    expect(canAccessAdmin(orgAdmin)).toBe(true)
  })

  it('club_admin can manage their own club, but CANNOT access Club B', () => {
    // Club A admin on Club A
    expect(can(clubAdminA, 'create_event', { clubId: 'club-cp' })).toBe(true)
    expect(can(clubAdminA, 'edit_event', { clubId: 'club-cp' })).toBe(true)
    expect(can(clubAdminA, 'view_registrations', { clubId: 'club-cp' })).toBe(true)

    // Club A admin on Club B — STRICTLY DENIED!
    expect(can(clubAdminA, 'create_event', { clubId: 'club-ai' })).toBe(false)
    expect(can(clubAdminA, 'edit_event', { clubId: 'club-ai' })).toBe(false)
    expect(can(clubAdminA, 'view_registrations', { clubId: 'club-ai' })).toBe(false)
    expect(can(clubAdminA, 'generate_certificates', { clubId: 'club-ai' })).toBe(false)

    // Club Admin cannot access org-level governance
    expect(can(clubAdminA, 'manage_clubs')).toBe(false)
    expect(can(clubAdminA, 'manage_roles')).toBe(false)
    expect(can(clubAdminA, 'manage_org_settings')).toBe(false)
  })

  it('volunteer can check in only to assigned events', () => {
    expect(can(volunteer, 'checkin', { eventId: 'evt-hackathon' })).toBe(true)
    expect(can(volunteer, 'checkin', { eventId: 'evt-other' })).toBe(false)
    expect(can(volunteer, 'create_event')).toBe(false)
    expect(canAccessAdmin(volunteer)).toBe(true)
  })

  it('attendee cannot access admin actions or modify events', () => {
    expect(can(attendee, 'create_event')).toBe(false)
    expect(can(attendee, 'checkin')).toBe(false)
    expect(can(attendee, 'register')).toBe(true)
    expect(can(attendee, 'download_my_certificate')).toBe(true)
    expect(canAccessAdmin(attendee)).toBe(false)
  })
})
