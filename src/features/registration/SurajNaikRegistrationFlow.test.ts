import { describe, it, expect, beforeEach } from 'vitest'
import {
  mockAuthApi,
  mockEventsApi,
  mockRegistrationsApi,
  mockCheckinApi,
  mockOrganizationsApi,
  mockClubsApi,
  mockStore,
} from '@/api/adapters/mock'
import { RegisterPayload } from '@/api/ports'

describe('Suraj Naik End-to-End Registration, Pass Issuance & Gate Stamp Flow', () => {
  beforeEach(async () => {
    // Reset mock store before each test
    await mockStore.reset()
  })

  it('1. Authenticates Suraj Naik as the active CTU student profile', async () => {
    const session = await mockAuthApi.getSession()
    expect(session).not.toBeNull()
    expect(session?.id).toBe('usr-suraj')
    expect(session?.name).toBe('Suraj Naik')
    expect(session?.email).toBe('ceosuraj@email.com')
    expect(session?.registrationNumber).toBe('CTU-2026-0814')
    expect(session?.degreeBranch).toBe('B.Tech Computer Science & Engineering')
    expect(session?.semester).toBe(6)
    expect(session?.campus).toContain('Central Technological University')
    expect(session?.role).toBe('org_admin')
  })

  it('2. Verifies institutional context: CTU and the 3 curated clubs', async () => {
    const org = await mockOrganizationsApi.getOrganization('ctu-main')
    expect(org.name).toBe('Central Technological University')
    expect(org.slug).toBe('central-technological-university')

    const clubs = await mockClubsApi.getClubs()
    expect(clubs).toHaveLength(3)
    const clubIds = clubs.map((c) => c.id)
    expect(clubIds).toEqual(['club-acm', 'club-robotics', 'club-design'])
  })

  it('3. Successfully registers Suraj Naik for an event, creates ticket pass & manages seat capacity', async () => {
    // 1. Pick first event from catalog
    const eventsResult = await mockEventsApi.getEvents()
    const targetEvent = eventsResult.items[0]
    expect(targetEvent).toBeDefined()
    const initialSeats = targetEvent.seatsLeft ?? 100

    const payload: RegisterPayload = {
      eventId: targetEvent.id,
      eventSlug: targetEvent.slug,
      answers: {
        'f-track': 'Neural Systems & Edge Computing',
        'f-github': 'https://github.com/surajnaik-ctu',
        'f-experience': 'Senior Computer Science builder specializing in distributed clusters.',
      },
      team: {
        teamName: 'CTU Vanguard',
        leaderName: 'Suraj Naik',
        leaderEmail: 'ceosuraj@email.com',
        members: [
          {
            name: 'Suraj Naik',
            email: 'ceosuraj@email.com',
            role: 'Lead Architect',
          },
          {
            name: 'Kavya Raman',
            email: 'kavya@ctu.edu.in',
            role: 'Robotics Engineer',
          },
        ],
      },
    }

    // 2. Execute registration
    const registration = await mockRegistrationsApi.register(payload)

    // Assert Registration & Pass Details
    expect(registration).toBeDefined()
    expect(registration.id).toMatch(/^reg-/)
    expect(registration.userId).toBe('usr-suraj')
    expect(registration.userName).toBe('Suraj Naik')
    expect(registration.userEmail).toBe('ceosuraj@email.com')
    expect(registration.status).toBe('registered')
    expect(registration.ticketCode).toMatch(/^TKT-\d+/)
    expect(registration.eventTitle).toBe(targetEvent.title)
    expect(registration.team?.teamName).toBe('CTU Vanguard')
    expect(registration.team?.members).toHaveLength(2)

    // 3. Verify seat count decremented
    const refreshedEvent = await mockEventsApi.getEventById(targetEvent.id)
    expect(refreshedEvent?.seatsLeft).toBe(initialSeats - 1)

    // 4. Retrieve passes from Attendee Wallet
    const myPasses = await mockRegistrationsApi.getMyRegistrations()
    expect(myPasses.length).toBeGreaterThanOrEqual(1)
    const issuedPass = myPasses.find((p) => p.id === registration.id)
    expect(issuedPass).toBeDefined()
    expect(issuedPass?.ticketCode).toBe(registration.ticketCode)

    // 5. Test Gate Admission Stamp Flow (Simulated QR Check-in)
    const qrPayload = JSON.stringify({
      v: 1,
      ticket: issuedPass!.ticketCode,
      code: issuedPass!.ticketCode,
      event: issuedPass!.eventSlug || issuedPass!.eventId,
      reg: issuedPass!.id,
    })
    expect(qrPayload).toContain(issuedPass!.ticketCode)

    // Check-in via gate scanner
    const checkinResult = await mockCheckinApi.checkinTicket(issuedPass!.ticketCode!, targetEvent.id)
    expect(checkinResult.success).toBe(true)
    expect(checkinResult.registration?.status).toBe('checked_in')
    expect(checkinResult.registration?.checkedInAt).toBeDefined()
    expect(checkinResult.admittedAt).toBeDefined()

    // 6. Test Pass Cancellation & Seat Release
    const passToCancel = issuedPass!
    const seatsBeforeCancel = (await mockEventsApi.getEventById(targetEvent.id))?.seatsLeft ?? 0
    const cancelResult = await mockRegistrationsApi.cancelMyRegistration!(passToCancel.id)
    expect(cancelResult).toBe(true)

    // Verify cancelled state
    const afterCancelPasses = await mockRegistrationsApi.getMyRegistrations()
    const cancelledRecord = afterCancelPasses.find((p) => p.id === passToCancel.id)
    expect(cancelledRecord?.status).toBe('cancelled')

    // Verify seat was returned to pool
    const seatsAfterCancel = (await mockEventsApi.getEventById(targetEvent.id))?.seatsLeft ?? 0
    expect(seatsAfterCancel).toBe(seatsBeforeCancel + 1)
  })
})
