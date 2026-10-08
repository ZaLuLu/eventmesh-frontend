import {
  EventsApi,
  EventsAdminApi,
  FormsApi,
  RegistrationsApi,
  CheckinApi,
  CertificatesApi,
  AnnouncementsApi,
  NotificationsApi,
  ClubsApi,
  GalleryApi,
  AnalyticsApi,
  AuditApi,
  UsersRolesApi,
  AuthApi,
  SearchApi,
  OrganizationsApi,
  RegisterPayload,
  CheckinResult,
  CheckinStats,
  DashboardStats,
  UserRoleRecord,
  SearchResults,
} from '../../ports'
import {
  Organization,
  Organizer,
  Event,
  Registration,
  RegistrationStatus,
  Certificate,
  CertificateVerificationResult,
  Announcement,
  Notification,
  AuditLog,
  UserSession,
  FormField,
  OrganizerGalleryItem,
  PaginatedResult,
} from '../../contracts'
import { SEED_ORGANIZATION, SEED_CLUBS, SEED_DEMO_USERS } from './seedData'
import {
  SEED_EVENTS,
  SEED_REGISTRATIONS,
  SEED_CERTIFICATES,
  SEED_ANNOUNCEMENTS,
  SEED_NOTIFICATIONS,
  SEED_AUDIT_LOGS,
} from './seedEvents'

const STORAGE_PREFIX = 'eventmesh_mock_'

function getStored<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${key}`)
    return raw ? JSON.parse(raw) : defaultValue
  } catch {
    return defaultValue
  }
}

function setStored<T>(key: string, value: T): void {
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify(value))
  } catch (err) {
    console.error(`Failed to store mock key ${key}:`, err)
  }
}

async function simulateLatency(): Promise<void> {
  const latencyMs = Number(import.meta.env.VITE_MOCK_LATENCY) || 350
  if (latencyMs <= 0) return
  const jitter = Math.floor(Math.random() * 200)
  return new Promise((resolve) => setTimeout(resolve, latencyMs + jitter))
}

// -------------------------------------------------------------
// IN-MEMORY / LOCALSTORAGE STORE
// -------------------------------------------------------------
class MockDataStore {
  organization: Organization = getStored('org', SEED_ORGANIZATION)
  clubs: Organizer[] = getStored('clubs', SEED_CLUBS)
  events: Event[] = getStored('events', SEED_EVENTS)
  registrations: Registration[] = getStored('registrations', SEED_REGISTRATIONS)
  certificates: Certificate[] = getStored('certificates', SEED_CERTIFICATES)
  announcements: Announcement[] = getStored('announcements', SEED_ANNOUNCEMENTS)
  notifications: Notification[] = getStored('notifications', SEED_NOTIFICATIONS)
  auditLogs: AuditLog[] = getStored('audit_logs', SEED_AUDIT_LOGS)
  currentSession: UserSession | null = getStored('session', SEED_DEMO_USERS[0]) // Default platform admin for initial exploration

  save() {
    setStored('org', this.organization)
    setStored('clubs', this.clubs)
    setStored('events', this.events)
    setStored('registrations', this.registrations)
    setStored('certificates', this.certificates)
    setStored('announcements', this.announcements)
    setStored('notifications', this.notifications)
    setStored('audit_logs', this.auditLogs)
    setStored('session', this.currentSession)
  }

  reset() {
    this.organization = SEED_ORGANIZATION
    this.clubs = SEED_CLUBS
    this.events = SEED_EVENTS
    this.registrations = SEED_REGISTRATIONS
    this.certificates = SEED_CERTIFICATES
    this.announcements = SEED_ANNOUNCEMENTS
    this.notifications = SEED_NOTIFICATIONS
    this.auditLogs = SEED_AUDIT_LOGS
    this.currentSession = SEED_DEMO_USERS[0]
    this.save()
  }
}

export const mockStore = new MockDataStore()

// -------------------------------------------------------------
// ADAPTER IMPLEMENTATIONS
// -------------------------------------------------------------

export const mockEventsApi: EventsApi = {
  async getEvents(filter): Promise<PaginatedResult<Event>> {
    await simulateLatency()
    let filtered = [...mockStore.events].filter((e) => e.status !== 'draft')

    if (filter?.category && filter.category !== 'all') {
      if (filter.category === 'completed') {
        filtered = filtered.filter((e) => e.status === 'completed')
      } else if (filter.category === 'club_events') {
        filtered = filtered.filter((e) => e.category === 'club_events')
      } else {
        filtered = filtered.filter(
          (e) =>
            e.category.toLowerCase() === filter.category?.toLowerCase() ||
            e.type.toLowerCase() === filter.category?.toLowerCase()
        )
      }
    }

    if (filter?.clubId) {
      filtered = filtered.filter((e) => e.organizerId === filter.clubId)
    }

    if (filter?.status && filter.status !== 'all') {
      filtered = filtered.filter((e) => e.status === filter.status)
    }

    if (filter?.search) {
      const q = filter.search.toLowerCase()
      filtered = filtered.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q) ||
          (e.organizerName && e.organizerName.toLowerCase().includes(q))
      )
    }

    return {
      items: filtered,
      totalCount: filtered.length,
    }
  },

  async getEventBySlug(slug: string): Promise<Event | null> {
    await simulateLatency()
    return mockStore.events.find((e) => e.slug === slug) || null
  },

  async getEventById(id: string): Promise<Event | null> {
    await simulateLatency()
    return mockStore.events.find((e) => e.id === id) || null
  },

  async getUpcomingRail(): Promise<Event[]> {
    await simulateLatency()
    return mockStore.events
      .filter((e) => e.status === 'published' || e.status === 'live')
      .slice(0, 8)
  },

  async getFeaturedEvents(): Promise<Event[]> {
    await simulateLatency()
    return mockStore.events
      .filter((e) => e.isSignature || e.status === 'published')
      .slice(0, 4)
  },

  async getSimilarEvents(eventId: string, category: string): Promise<Event[]> {
    await simulateLatency()
    return mockStore.events
      .filter((e) => e.id !== eventId && (e.category === category || e.isSignature))
      .slice(0, 3)
  },
}

export const mockEventsAdminApi: EventsAdminApi = {
  async getAdminEvents(scope): Promise<Event[]> {
    await simulateLatency()
    let evts = [...mockStore.events]
    if (scope.clubId) {
      // STRICT Club scoping: Club A sees only Club A events
      evts = evts.filter((e) => e.organizerId === scope.clubId)
    }
    return evts
  },

  async createEvent(eventData): Promise<Event> {
    await simulateLatency()
    const id = `evt-${Date.now()}`
    const club = mockStore.clubs.find((c) => c.id === eventData.organizerId) || mockStore.clubs[0]

    const newEvent: Event = {
      id,
      slug: (eventData.title || 'untitled').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      orgId: eventData.orgId || 'org-1',
      organizerId: club.id,
      organizerName: club.name,
      organizerColor: club.color,
      title: eventData.title || 'Untitled Event',
      subtitle: eventData.subtitle || '',
      category: eventData.category || 'workshop',
      type: eventData.type || 'workshop',
      tags: eventData.tags || [club.name],
      description: eventData.description || 'Curated event description.',
      poster: eventData.poster || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
      banner: eventData.banner,
      venue: eventData.venue || { name: 'Campus Main Auditorium' },
      startsAt: eventData.startsAt || new Date(Date.now() + 86400000 * 7).toISOString(),
      endsAt: eventData.endsAt || new Date(Date.now() + 86400000 * 7 + 14400000).toISOString(),
      eligibility: eventData.eligibility || 'Open to all members',
      capacity: eventData.capacity || 100,
      seatsLeft: eventData.capacity || 100,
      waitlistEnabled: eventData.waitlistEnabled ?? true,
      registrationOpensAt: eventData.registrationOpensAt || new Date().toISOString(),
      registrationClosesAt: eventData.registrationClosesAt || new Date(Date.now() + 86400000 * 6).toISOString(),
      schedule: eventData.schedule || [],
      people: eventData.people || [],
      rules: eventData.rules || [],
      contact: eventData.contact || { name: 'Lead Coordinator', email: 'contact@eventmesh.xyz' },
      certificateInfo: eventData.certificateInfo || 'Verifiable Certificate of Attendance',
      features: eventData.features || { certificate: true, checkin: true, paid: false, team: false },
      teamConfig: eventData.teamConfig,
      formSchema: eventData.formSchema || [],
      status: eventData.status || 'draft',
      results: [],
      photos: [],
      isSignature: eventData.isSignature || false,
      createdAt: new Date().toISOString(),
    }

    mockStore.events.unshift(newEvent)
    mockStore.auditLogs.unshift({
      id: `aud-${Date.now()}`,
      actorId: mockStore.currentSession?.id || 'usr-anon',
      actorName: mockStore.currentSession?.name || 'Administrator',
      actorRole: mockStore.currentSession?.role || 'admin',
      action: 'event.create',
      entity: 'event',
      entityId: id,
      diff: { title: newEvent.title },
      at: new Date().toISOString(),
    })
    mockStore.save()
    return newEvent
  },

  async updateEvent(id: string, updates: Partial<Event>): Promise<Event> {
    await simulateLatency()
    const index = mockStore.events.findIndex((e) => e.id === id)
    if (index === -1) throw new Error('Event not found')

    const updated = { ...mockStore.events[index], ...updates, updatedAt: new Date().toISOString() }
    mockStore.events[index] = updated
    mockStore.auditLogs.unshift({
      id: `aud-${Date.now()}`,
      actorId: mockStore.currentSession?.id || 'usr-anon',
      actorName: mockStore.currentSession?.name || 'Administrator',
      actorRole: mockStore.currentSession?.role || 'admin',
      action: 'event.update',
      entity: 'event',
      entityId: id,
      at: new Date().toISOString(),
    })
    mockStore.save()
    return updated
  },

  async deleteEvent(id: string): Promise<void> {
    await simulateLatency()
    mockStore.events = mockStore.events.filter((e) => e.id !== id)
    mockStore.save()
  },

  async publishEvent(id: string): Promise<Event> {
    await simulateLatency()
    const index = mockStore.events.findIndex((e) => e.id === id)
    if (index === -1) throw new Error('Event not found')

    mockStore.events[index].status = 'published'
    mockStore.auditLogs.unshift({
      id: `aud-${Date.now()}`,
      actorId: mockStore.currentSession?.id || 'usr-anon',
      actorName: mockStore.currentSession?.name || 'Administrator',
      actorRole: mockStore.currentSession?.role || 'admin',
      action: 'event.publish',
      entity: 'event',
      entityId: id,
      diff: { status: 'published' },
      at: new Date().toISOString(),
    })
    mockStore.save()
    return mockStore.events[index]
  },

  async submitForApproval(id: string): Promise<Event> {
    await simulateLatency()
    const index = mockStore.events.findIndex((e) => e.id === id)
    if (index === -1) throw new Error('Event not found')

    mockStore.events[index].status = 'in_review'
    mockStore.save()
    return mockStore.events[index]
  },

  async approveEvent(id: string): Promise<Event> {
    await simulateLatency()
    const index = mockStore.events.findIndex((e) => e.id === id)
    if (index === -1) throw new Error('Event not found')

    mockStore.events[index].status = 'published'
    mockStore.save()
    return mockStore.events[index]
  },
}

export const mockFormsApi: FormsApi = {
  async getFormSchema(eventId: string): Promise<FormField[]> {
    await simulateLatency()
    const evt = mockStore.events.find((e) => e.id === eventId)
    return evt?.formSchema || []
  },

  async updateFormSchema(eventId: string, schema: FormField[]): Promise<FormField[]> {
    await simulateLatency()
    const index = mockStore.events.findIndex((e) => e.id === eventId)
    if (index !== -1) {
      mockStore.events[index].formSchema = schema
      mockStore.save()
    }
    return schema
  },
}

export const mockRegistrationsApi: RegistrationsApi = {
  async register(payload: RegisterPayload): Promise<Registration> {
    await simulateLatency()
    const evt = mockStore.events.find((e) => e.id === payload.eventId)
    if (!evt) throw new Error('Event not found')

    // Decrement seatsLeft
    if (evt.seatsLeft > 0) {
      evt.seatsLeft -= 1
    }

    const regId = `reg-${Date.now()}`
    const ticketCode = `TKT-${Math.floor(100000 + Math.random() * 900000)}`

    const user = mockStore.currentSession || {
      id: `usr-${Date.now()}`,
      name: payload.team?.leaderName || 'Aditya Narayan',
      email: payload.team?.leaderEmail || 'attendee@example.com',
    }

    const newReg: Registration = {
      id: regId,
      eventId: evt.id,
      userId: user.id,
      userEmail: user.email,
      userName: user.name,
      answers: payload.answers,
      team: payload.team,
      status: evt.seatsLeft <= 0 && evt.waitlistEnabled ? 'waitlisted' : 'registered',
      ticketCode,
      createdAt: new Date().toISOString(),
      eventTitle: evt.title,
      eventSlug: evt.slug,
      organizerName: evt.organizerName,
      organizerColor: evt.organizerColor,
      eventStartsAt: evt.startsAt,
    }

    mockStore.registrations.unshift(newReg)
    mockStore.save()
    return newReg
  },

  async getRegistrations(filter): Promise<Registration[]> {
    await simulateLatency()
    let regs = [...mockStore.registrations]

    if (filter.eventId) {
      regs = regs.filter((r) => r.eventId === filter.eventId)
    }

    if (filter.clubId) {
      // Scoped: filter registrations by events organized by this club
      const clubEventIds = mockStore.events
        .filter((e) => e.organizerId === filter.clubId)
        .map((e) => e.id)
      regs = regs.filter((r) => clubEventIds.includes(r.eventId))
    }

    if (filter.status) {
      regs = regs.filter((r) => r.status === filter.status)
    }

    if (filter.search) {
      const q = filter.search.toLowerCase()
      regs = regs.filter(
        (r) =>
          r.userName.toLowerCase().includes(q) ||
          r.userEmail.toLowerCase().includes(q) ||
          r.ticketCode.toLowerCase().includes(q)
      )
    }

    return regs
  },

  async updateStatus(id: string, status: RegistrationStatus): Promise<Registration> {
    await simulateLatency()
    const index = mockStore.registrations.findIndex((r) => r.id === id)
    if (index === -1) throw new Error('Registration not found')

    mockStore.registrations[index].status = status
    mockStore.save()
    return mockStore.registrations[index]
  },

  async getMyRegistrations(): Promise<Registration[]> {
    await simulateLatency()
    const userId = mockStore.currentSession?.id || 'usr-att'
    return mockStore.registrations.filter((r) => r.userId === userId)
  },
}

export const mockCheckinApi: CheckinApi = {
  async checkinTicket(ticketCode: string, eventId?: string): Promise<CheckinResult> {
    await simulateLatency()
    const reg = mockStore.registrations.find(
      (r) =>
        r.ticketCode.toUpperCase() === ticketCode.trim().toUpperCase() &&
        (!eventId || r.eventId === eventId)
    )

    if (!reg) {
      return { success: false, message: 'Invalid ticket pass. No matching registration found.' }
    }

    if (reg.status === 'checked_in') {
      return {
        success: false,
        registration: reg,
        message: `Ticket already checked in at ${new Date(reg.checkedInAt || '').toLocaleTimeString()}`,
      }
    }

    reg.status = 'checked_in'
    reg.checkedInAt = new Date().toISOString()
    reg.checkedInBy = mockStore.currentSession?.id || 'volunteer'
    mockStore.save()

    return {
      success: true,
      registration: reg,
      message: `Checked in successfully: ${reg.userName} (${reg.eventTitle || 'Event'})`,
    }
  },

  async undoCheckin(registrationId: string): Promise<boolean> {
    await simulateLatency()
    const reg = mockStore.registrations.find((r) => r.id === registrationId)
    if (!reg) return false

    reg.status = 'registered'
    reg.checkedInAt = undefined
    reg.checkedInBy = undefined
    mockStore.save()
    return true
  },

  async getCheckinStats(eventId: string): Promise<CheckinStats> {
    await simulateLatency()
    const regs = mockStore.registrations.filter((r) => r.eventId === eventId)
    const checkedIn = regs.filter((r) => r.status === 'checked_in')
    return {
      totalRegistered: regs.length,
      totalCheckedIn: checkedIn.length,
      percentage: regs.length > 0 ? Math.round((checkedIn.length / regs.length) * 100) : 0,
    }
  },
}

export const mockCertificatesApi: CertificatesApi = {
  async getCertificates(filter): Promise<Certificate[]> {
    await simulateLatency()
    let certs = [...mockStore.certificates]
    if (filter.eventId) {
      certs = certs.filter((c) => c.eventId === filter.eventId)
    }
    return certs
  },

  async getMyCertificates(): Promise<Certificate[]> {
    await simulateLatency()
    const userEmail = mockStore.currentSession?.email || 'attendee@example.com'
    return mockStore.certificates.filter((c) => c.recipientEmail === userEmail)
  },

  async generateCertificates(
    eventId: string,
    recipientIds: string[],
    templateId: string = 'standard_editorial'
  ): Promise<Certificate[]> {
    await simulateLatency()
    const evt = mockStore.events.find((e) => e.id === eventId)
    if (!evt) throw new Error('Event not found')

    const newCerts: Certificate[] = []
    const baseNumber = 1250 + mockStore.certificates.length

    for (let i = 0; i < recipientIds.length; i++) {
      const reg = mockStore.registrations.find((r) => r.id === recipientIds[i])
      if (!reg) continue

      const certId = `TA-2026-${String(baseNumber + i).padStart(6, '0')}`
      const cert: Certificate = {
        id: `cert-${Date.now()}-${i}`,
        certificateId: certId,
        eventId: evt.id,
        registrationId: reg.id,
        recipientName: reg.userName,
        recipientEmail: reg.userEmail,
        eventTitle: evt.title,
        organizerName: evt.organizerName || 'Technical Association',
        templateId: templateId as any,
        issuedAt: new Date().toISOString(),
        verifyUrl: `https://eventmesh.xyz/verify/${certId}`,
        status: 'valid',
        metadata: {
          role: 'Verified Attendee',
        },
      }
      newCerts.push(cert)
    }

    mockStore.certificates.unshift(...newCerts)
    mockStore.save()
    return newCerts
  },

  async verifyCertificate(certificateId: string): Promise<CertificateVerificationResult> {
    await simulateLatency()
    const cleanId = certificateId.trim().toUpperCase()
    const cert = mockStore.certificates.find((c) => c.certificateId.toUpperCase() === cleanId)

    if (!cert) {
      return {
        certificateId: cleanId,
        isValid: false,
        verifiedAt: new Date().toISOString(),
        message: 'No official certificate record found matching this identifier.',
      }
    }

    return {
      certificateId: cert.certificateId,
      isValid: cert.status === 'valid',
      recipientName: cert.recipientName,
      eventTitle: cert.eventTitle,
      organizerName: cert.organizerName,
      issuedAt: cert.issuedAt,
      verifiedAt: new Date().toISOString(),
      templateId: cert.templateId,
      message:
        cert.status === 'valid'
          ? 'Cryptographically authenticated record registered by the Technical Association.'
          : 'This certificate has been revoked by the issuing authority.',
    }
  },
}

export const mockAnnouncementsApi: AnnouncementsApi = {
  async getAnnouncements(filter): Promise<Announcement[]> {
    await simulateLatency()
    let list = [...mockStore.announcements]
    if (filter?.organizerId) {
      list = list.filter((a) => a.organizerId === filter.organizerId || !a.organizerId)
    }
    if (filter?.kind) {
      list = list.filter((a) => a.kind === filter.kind)
    }
    // Pinned first, then date descending
    return list.sort((a, b) => {
      if (a.pinned && !b.pinned) return -1
      if (!a.pinned && b.pinned) return 1
      return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    })
  },

  async createAnnouncement(data): Promise<Announcement> {
    await simulateLatency()
    const id = `ann-${Date.now()}`
    const club = mockStore.clubs.find((c) => c.id === data.organizerId)

    const newAnn: Announcement = {
      id,
      orgId: data.orgId || 'org-1',
      organizerId: club?.id,
      organizerName: club?.name,
      organizerColor: club?.color,
      kind: data.kind || 'general',
      title: data.title || 'Untitled Announcement',
      body: data.body || '',
      pinned: data.pinned ?? false,
      publishedAt: new Date().toISOString(),
    }

    mockStore.announcements.unshift(newAnn)
    mockStore.save()
    return newAnn
  },

  async deleteAnnouncement(id: string): Promise<void> {
    await simulateLatency()
    mockStore.announcements = mockStore.announcements.filter((a) => a.id !== id)
    mockStore.save()
  },
}

export const mockNotificationsApi: NotificationsApi = {
  async getNotifications(filter): Promise<Notification[]> {
    await simulateLatency()
    let list = [...mockStore.notifications]
    if (filter?.clubId) {
      list = list.filter((n) => n.organizerId === filter.clubId)
    }
    return list
  },

  async sendNotification(data): Promise<Notification> {
    await simulateLatency()
    const id = `notif-${Date.now()}`
    const newNotif: Notification = {
      id,
      orgId: data.orgId || 'org-1',
      organizerId: data.organizerId,
      organizerName: data.organizerName,
      eventId: data.eventId,
      eventTitle: data.eventTitle,
      title: data.title || 'Notification',
      body: data.body || '',
      audience: data.audience || { type: 'all' },
      includes: data.includes || { poster: false, registrationLink: false, contact: false },
      channel: data.channel || 'email',
      sentAt: new Date().toISOString(),
      sentBy: mockStore.currentSession?.name || 'Administrator',
      stats: {
        recipientsCount: 1450,
        deliveredCount: 1438,
        openedCount: 920,
      },
    }

    mockStore.notifications.unshift(newNotif)
    mockStore.save()
    return newNotif
  },
}

export const mockClubsApi: ClubsApi = {
  async getClubs(): Promise<Organizer[]> {
    await simulateLatency()
    return [...mockStore.clubs]
  },

  async getClubBySlug(slug: string): Promise<Organizer | null> {
    await simulateLatency()
    return mockStore.clubs.find((c) => c.slug === slug) || null
  },

  async getClubById(id: string): Promise<Organizer | null> {
    await simulateLatency()
    return mockStore.clubs.find((c) => c.id === id) || null
  },

  async updateClub(id: string, updates: Partial<Organizer>): Promise<Organizer> {
    await simulateLatency()
    const index = mockStore.clubs.findIndex((c) => c.id === id)
    if (index === -1) throw new Error('Club not found')

    mockStore.clubs[index] = { ...mockStore.clubs[index], ...updates }
    mockStore.save()
    return mockStore.clubs[index]
  },

  async toggleFollow(id: string): Promise<boolean> {
    await simulateLatency()
    const club = mockStore.clubs.find((c) => c.id === id)
    if (!club) return false

    club.isFollowed = !club.isFollowed
    club.followersCount += club.isFollowed ? 1 : -1
    mockStore.save()
    return club.isFollowed
  },
}

export const mockGalleryApi: GalleryApi = {
  async getGallery(clubId?: string): Promise<OrganizerGalleryItem[]> {
    await simulateLatency()
    if (clubId) {
      const club = mockStore.clubs.find((c) => c.id === clubId)
      return club?.gallery || []
    }
    return mockStore.clubs.flatMap((c) => c.gallery)
  },

  async addGalleryItem(item): Promise<OrganizerGalleryItem> {
    await simulateLatency()
    const newItem: OrganizerGalleryItem = {
      id: `g-${Date.now()}`,
      ...item,
    }
    if (mockStore.clubs[0]) {
      mockStore.clubs[0].gallery.push(newItem)
      mockStore.save()
    }
    return newItem
  },

  async removeGalleryItem(id: string): Promise<void> {
    await simulateLatency()
    mockStore.clubs.forEach((c) => {
      c.gallery = c.gallery.filter((g) => g.id !== id)
    })
    mockStore.save()
  },
}

export const mockAnalyticsApi: AnalyticsApi = {
  async getStats(scope): Promise<DashboardStats> {
    await simulateLatency()
    const evts = mockStore.events.filter((e) => !scope.clubId || e.organizerId === scope.clubId)
    const clubEventIds = evts.map((e) => e.id)
    const regs = mockStore.registrations.filter((r) => clubEventIds.includes(r.eventId))
    const checkedIns = regs.filter((r) => r.status === 'checked_in')
    const certs = mockStore.certificates.filter((c) => clubEventIds.includes(c.eventId))
    const notifs = mockStore.notifications.filter(
      (n) => !scope.clubId || n.organizerId === scope.clubId
    )

    return {
      eventsCount: evts.length,
      upcomingCount: evts.filter((e) => e.status === 'published').length,
      registrationsCount: regs.length,
      checkinsCount: checkedIns.length,
      certificatesCount: certs.length,
      notificationsCount: notifs.length,
      registrationsTimeline: [
        { date: '10/01', count: 45 },
        { date: '10/02', count: 120 },
        { date: '10/03', count: 90 },
        { date: '10/04', count: 210 },
        { date: '10/05', count: 340 },
        { date: '10/06', count: 290 },
        { date: '10/07', count: 480 },
      ],
    }
  },
}

export const mockAuditApi: AuditApi = {
  async getAuditLogs(scope): Promise<AuditLog[]> {
    await simulateLatency()
    return [...mockStore.auditLogs]
  },
}

export const mockUsersRolesApi: UsersRolesApi = {
  async getUsers(orgId: string): Promise<UserRoleRecord[]> {
    await simulateLatency()
    return [
      { id: 'usr-plat', name: 'Sovereign Administrator', email: 'admin@platform.com', role: 'platform_admin' },
      { id: 'usr-org', name: 'Aarav Deshmukh (President)', email: 'president@ta.org', role: 'org_admin' },
      { id: 'usr-cluba', name: 'Sameer Kulkarni', email: 'lead@cpclub.org', role: 'club_admin', clubId: 'club-cp', clubName: 'CP Club' },
      { id: 'usr-clubb', name: 'Nikhil Menon', email: 'lead@aionai.org', role: 'club_admin', clubId: 'club-ai', clubName: 'AIONAI' },
      { id: 'usr-vol', name: 'Maya Joshi', email: 'volunteer@ta.org', role: 'volunteer' },
      { id: 'usr-att', name: 'Aditya Narayan', email: 'attendee@example.com', role: 'attendee' },
    ]
  },

  async updateRole(userId: string, role: string, clubId?: string): Promise<UserRoleRecord> {
    await simulateLatency()
    const club = mockStore.clubs.find((c) => c.id === clubId)
    return {
      id: userId,
      name: 'Updated User',
      email: 'user@example.com',
      role,
      clubId,
      clubName: club?.name,
    }
  },
}

export const mockAuthApi: AuthApi = {
  async sendOtp(email: string): Promise<{ success: boolean; message: string }> {
    await simulateLatency()
    return {
      success: true,
      message: `A 6-digit access code has been dispatched to ${email}. (In mock mode, enter any 6 digits such as 123456).`,
    }
  },

  async verifyOtp(email: string, otp: string): Promise<UserSession> {
    await simulateLatency()
    // Match demo account if exists, else synthesize attendee session
    const match = SEED_DEMO_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase())
    const session: UserSession = match || {
      id: `usr-${Date.now()}`,
      name: email.split('@')[0].toUpperCase(),
      email,
      role: 'attendee',
      orgId: 'org-1',
    }

    mockStore.currentSession = session
    mockStore.save()
    return session
  },

  async getSession(): Promise<UserSession | null> {
    await simulateLatency()
    return mockStore.currentSession
  },

  async logout(): Promise<void> {
    await simulateLatency()
    mockStore.currentSession = null
    mockStore.save()
  },

  async switchDemoAccount(role: string, clubId?: string): Promise<UserSession> {
    await simulateLatency()
    const match = SEED_DEMO_USERS.find((u) => {
      if (role === 'club_admin' && clubId) {
        return u.role === 'club_admin' && u.clubId === clubId
      }
      return u.role === role
    })

    if (!match) throw new Error(`Demo account for ${role} not found`)
    mockStore.currentSession = match
    mockStore.save()
    return match
  },
}

export const mockSearchApi: SearchApi = {
  async search(query: string): Promise<SearchResults> {
    await simulateLatency()
    const q = query.trim().toLowerCase()
    if (!q) return { events: [], clubs: [], announcements: [] }

    const events = mockStore.events
      .filter((e) => e.title.toLowerCase().includes(q) || e.description.toLowerCase().includes(q))
      .slice(0, 5)
      .map((e) => ({
        id: e.id,
        title: e.title,
        subtitle: `${e.organizerName} · ${e.category.toUpperCase()}`,
        category: 'events' as const,
        url: `/events/${e.slug}`,
        badge: e.status.toUpperCase(),
      }))

    const clubs = mockStore.clubs
      .filter((c) => c.name.toLowerCase().includes(q) || c.about.toLowerCase().includes(q))
      .slice(0, 5)
      .map((c) => ({
        id: c.id,
        title: c.name,
        subtitle: `${c.followersCount} Followers`,
        category: 'clubs' as const,
        url: `/clubs/${c.slug}`,
      }))

    const announcements = mockStore.announcements
      .filter((a) => a.title.toLowerCase().includes(q) || a.body.toLowerCase().includes(q))
      .slice(0, 5)
      .map((a) => ({
        id: a.id,
        title: a.title,
        subtitle: a.kind.toUpperCase(),
        category: 'announcements' as const,
        url: '/announcements',
      }))

    return { events, clubs, announcements }
  },
}

export const mockOrganizationsApi: OrganizationsApi = {
  async getOrganization(): Promise<Organization> {
    await simulateLatency()
    return mockStore.organization
  },

  async updateOrganization(id: string, updates: Partial<Organization>): Promise<Organization> {
    await simulateLatency()
    mockStore.organization = { ...mockStore.organization, ...updates }
    mockStore.save()
    return mockStore.organization
  },
}
