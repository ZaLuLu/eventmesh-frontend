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
  PaymentsApi,
  PayoutsApi,
  SystemApi,
} from '../../ports'
import {
  Organization,
  Organizer,
  Event,
  EventBrowseResponse,
  VisibleEventRead,
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
  PayoutAccount,
  PayoutAccountCreate,
  SettlementRecord,
  FeeQuote,
  OrderCreateRequest,
  OrderCreateResponse,
  PaymentStatusResponse,
  InAppNotification,
  InAppNotificationListResponse,
  InvitationCreate,
  InvitationRead,
  InvitationCreatedResponse,
  ProposalCreate,
  ProposalRead,
  ProposalReview,
  OrganizationBalance,
  WithdrawalRequest,
  WithdrawalRequestCreate,
  OrganizerEarningsSummary,
  PlatformOverview,
  InstitutionCandidate,
  PlatformAuditLog,
  PlatformOrganizationItem,
  AdminWithdrawalReviewPayload,
  RefundOrderRequest,
  RefundOrderResponse,
  SyncRun,
  TriggerSyncRequest,
  TriggerSyncResponse,
  TestEmailRequest,
  TestEmailResponse,
  ProfileRead,
  OnboardingSubmitPayload,
  ProfileUpdatePayload,
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
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') return defaultValue
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${key}`)
    return raw ? JSON.parse(raw) : defaultValue
  } catch {
    return defaultValue
  }
}

function setStored<T>(key: string, value: T): void {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') return
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
const SCHEMA_VERSION = 'v11_ctu_suraj_naik_architecture'

const SEED_PAYOUT_ACCOUNTS: Record<string, PayoutAccount> = {
  'apex-design-lab': {
    id: 'payout-acc-001',
    organization_id: 'org-club-1',
    vendor_id: 'CF_VND_APEX_DESIGN',
    account_holder_name: 'Apex Design Collective',
    bank_name: 'HDFC Bank',
    ifsc_code: 'HDFC0001234',
    account_number_masked: '••••••••8912',
    status: 'VERIFIED',
    created_at: '2026-09-15T10:00:00Z',
    updated_at: '2026-09-15T10:00:00Z',
  },
  'cyber-security-alliance': {
    id: 'payout-acc-002',
    organization_id: 'org-club-2',
    vendor_id: 'CF_VND_CYBER_SEC',
    account_holder_name: 'Cyber Security Alliance',
    bank_name: 'ICICI Bank',
    ifsc_code: 'ICIC0004321',
    account_number_masked: '••••••••4532',
    status: 'VERIFIED',
    created_at: '2026-09-20T11:30:00Z',
    updated_at: '2026-09-20T11:30:00Z',
  },
}

const SEED_SETTLEMENTS: SettlementRecord[] = [
  {
    id: 'settle-001',
    cf_settlement_id: 'CF_SETTLE_98214',
    vendor_id: 'CF_VND_APEX_DESIGN',
    amount_cents: 1425000,
    amount_inr: 14250.0,
    currency: 'INR',
    status: 'SUCCESS',
    utr: 'UTR98765432101',
    settled_at: '2026-10-14T14:30:00Z',
    created_at: '2026-10-14T10:00:00Z',
  },
  {
    id: 'settle-002',
    cf_settlement_id: 'CF_SETTLE_98102',
    vendor_id: 'CF_VND_APEX_DESIGN',
    amount_cents: 890000,
    amount_inr: 8900.0,
    currency: 'INR',
    status: 'SUCCESS',
    utr: 'UTR98765432102',
    settled_at: '2026-10-11T16:15:00Z',
    created_at: '2026-10-11T12:00:00Z',
  },
  {
    id: 'settle-003',
    cf_settlement_id: 'CF_SETTLE_98005',
    vendor_id: 'CF_VND_APEX_DESIGN',
    amount_cents: 475000,
    amount_inr: 4750.0,
    currency: 'INR',
    status: 'PENDING',
    utr: null,
    settled_at: null,
    created_at: '2026-10-15T09:00:00Z',
  },
]

const SEED_IN_APP_NOTIFICATIONS: InAppNotification[] = [
  {
    id: 'ian-001',
    user_id: 'usr-admin',
    type: 'payout_kyc_approved',
    organization_id: 'org-club-1',
    title: 'Payout Account Verified',
    message: 'Cashfree Easy Split vendor verification complete. Instant automated splits are active for paid ticket tiers.',
    data: { vendor_id: 'CF_VND_APEX_DESIGN', status: 'VERIFIED' },
    is_read: false,
    read_at: null,
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'ian-002',
    user_id: 'usr-admin',
    type: 'settlement_processed',
    organization_id: 'org-club-1',
    title: 'Settlement Dispatched (₹14,250)',
    message: 'Automated marketplace split settlement CF_SETTLE_98214 has been reconciled and transferred via UTR98765432101.',
    data: { settlement_id: 'CF_SETTLE_98214', amount_inr: 14250.0 },
    is_read: false,
    read_at: null,
    created_at: new Date(Date.now() - 3600000 * 18).toISOString(),
  },
  {
    id: 'ian-003',
    user_id: 'usr-admin',
    type: 'pass_purchased',
    organization_id: 'org-club-1',
    title: 'New Paid Registration',
    message: 'Student registered for AI & Design Systems Summit 2026 (Tier 1 Pass, ₹249.00).',
    data: { event_slug: 'ai-design-systems-summit-2026', ticket_code: 'PASS-89127' },
    is_read: true,
    read_at: new Date(Date.now() - 3600000 * 24).toISOString(),
    created_at: new Date(Date.now() - 3600000 * 25).toISOString(),
  },
  {
    id: 'ian-004',
    user_id: 'usr-admin',
    type: 'pass_confirmed',
    organization_id: 'org-club-1',
    title: 'Pass Issued: Grand Turing Hackathon 2026',
    message: 'Your admission pass with cryptographic QR code is active. Ready for check-in at Systems Lab.',
    data: { event_slug: 'the-grand-turing-hackathon-2026', ticket_code: 'TURING-2026-VIP' },
    is_read: false,
    read_at: null,
    created_at: new Date(Date.now() - 3600000 * 1).toISOString(),
  },
  {
    id: 'ian-005',
    user_id: 'usr-admin',
    type: 'reminder',
    organization_id: 'org-club-1',
    title: 'Tomorrow at 10:00 AM: Keynote Session',
    message: 'AI & Design Systems Summit opening keynote starts tomorrow. Add to calendar to avoid delays.',
    data: { event_slug: 'ai-design-systems-summit-2026' },
    is_read: false,
    read_at: null,
    created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    id: 'ian-006',
    user_id: 'usr-admin',
    type: 'announcement',
    organization_id: 'org-club-1',
    title: 'Association Notice: Fall Project Submissions',
    message: 'Final project repository links must be submitted before Sunday 11:59 PM for faculty evaluation.',
    data: {},
    is_read: true,
    read_at: new Date(Date.now() - 3600000 * 30).toISOString(),
    created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
  },
]

const SEED_INVITATIONS: (InvitationRead & { token?: string })[] = [
  {
    id: 'inv-seed-001',
    organization_id: 'org-club-1',
    organization_name: 'Design Systems Club',
    organization_slug: 'design-systems-club',
    role: 'co_admin',
    recipient_email: 'designer@apex.edu',
    invited_by_id: 'usr-admin',
    invited_by_name: 'Alex Rivera',
    status: 'pending',
    expires_at: new Date(Date.now() + 86400000 * 6).toISOString(),
    created_at: new Date(Date.now() - 86400000).toISOString(),
    token: 'tok_demo_invitation_dsc_2026',
  },
]

const SEED_PROPOSALS: ProposalRead[] = [
  {
    id: 'prop-seed-001',
    parent_organization_id: 'org-1',
    parent_organization_name: 'Apex Institute of Technology',
    parent_organization_slug: 'apex-institute',
    proposed_organization_id: 'org-club-3',
    proposed_organization_name: 'Quantum Computing Research Cell',
    proposed_organization_slug: 'quantum-computing-research-cell',
    proposer_id: 'usr_dev_001',
    proposer_name: 'Alex Rivera',
    status: 'pending',
    reason: 'Interdisciplinary research club dedicated to quantum algorithms and hackathons.',
    reviewed_by_id: null,
    reviewed_at: null,
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
]

class MockDataStore {
  organization: Organization
  clubs: Organizer[]
  events: Event[]
  registrations: Registration[]
  certificates: Certificate[]
  announcements: Announcement[]
  notifications: Notification[]
  inAppNotifications: InAppNotification[]
  payoutAccounts: Record<string, PayoutAccount>
  settlements: SettlementRecord[]
  invitations: (InvitationRead & { token?: string })[]
  proposals: ProposalRead[]
  auditLogs: AuditLog[]
  syncRuns: SyncRun[]
  currentSession: UserSession | null

  constructor() {
    const defaultSyncRuns: SyncRun[] = [
      {
        id: 'sync-01',
        status: 'success',
        mode: 'incremental',
        citiesCount: 23,
        eventsIngested: 48,
        startedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
        completedAt: new Date(Date.now() - 3600000 * 4 + 180000).toISOString(),
        triggeredBy: 'cron@eventmesh.internal',
        logExcerpt: 'Harvested 23 cities: BLR (18), BOM (12), DEL (9), HYD (5), MAA (4). 48 new events indexed.',
      },
      {
        id: 'sync-02',
        status: 'success',
        mode: 'full',
        citiesCount: 23,
        eventsIngested: 142,
        startedAt: new Date(Date.now() - 86400000).toISOString(),
        completedAt: new Date(Date.now() - 86400000 + 720000).toISOString(),
        triggeredBy: 'admin@eventmesh.internal',
        logExcerpt: 'Full catalog reconciliation. 142 hackathons and conferences synced.',
      },
      {
        id: 'sync-03',
        status: 'failed',
        mode: 'incremental',
        citiesCount: 23,
        eventsIngested: 0,
        startedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        completedAt: new Date(Date.now() - 86400000 * 2 + 60000).toISOString(),
        triggeredBy: 'cron@eventmesh.internal',
        logExcerpt: 'Upstream gateway timeout on PNQ aggregator node.',
      },
    ]

    const currentVer = getStored<string>('schema_version', '')
    if (currentVer !== SCHEMA_VERSION) {
      // Auto-reset store on seed or schema version change (Audit F-19)
      this.organization = SEED_ORGANIZATION
      this.clubs = SEED_CLUBS
      this.events = SEED_EVENTS
      this.registrations = SEED_REGISTRATIONS
      this.certificates = SEED_CERTIFICATES
      this.announcements = SEED_ANNOUNCEMENTS
      this.notifications = SEED_NOTIFICATIONS
      this.inAppNotifications = SEED_IN_APP_NOTIFICATIONS
      this.payoutAccounts = { ...SEED_PAYOUT_ACCOUNTS }
      this.settlements = [...SEED_SETTLEMENTS]
      this.invitations = [...SEED_INVITATIONS]
      this.proposals = [...SEED_PROPOSALS]
      this.auditLogs = SEED_AUDIT_LOGS
      this.syncRuns = defaultSyncRuns
      this.currentSession = SEED_DEMO_USERS[0]
      setStored('schema_version', SCHEMA_VERSION)
      this.save()
    } else {
      this.organization = getStored('org', SEED_ORGANIZATION)
      this.clubs = getStored('clubs', SEED_CLUBS)
      this.events = getStored('events', SEED_EVENTS)
      this.registrations = getStored('registrations', SEED_REGISTRATIONS)
      this.certificates = getStored('certificates', SEED_CERTIFICATES)
      this.announcements = getStored('announcements', SEED_ANNOUNCEMENTS)
      this.notifications = getStored('notifications', SEED_NOTIFICATIONS)
      this.inAppNotifications = getStored('in_app_notifications', SEED_IN_APP_NOTIFICATIONS)
      this.payoutAccounts = getStored('payout_accounts', SEED_PAYOUT_ACCOUNTS)
      this.settlements = getStored('settlements', SEED_SETTLEMENTS)
      this.invitations = getStored('invitations', SEED_INVITATIONS)
      this.proposals = getStored('proposals', SEED_PROPOSALS)
      this.auditLogs = getStored('audit_logs', SEED_AUDIT_LOGS)
      this.syncRuns = getStored('sync_runs', defaultSyncRuns)
      this.currentSession = getStored('session', SEED_DEMO_USERS[0])
    }
  }

  save() {
    setStored('schema_version', SCHEMA_VERSION)
    setStored('org', this.organization)
    setStored('clubs', this.clubs)
    setStored('events', this.events)
    setStored('registrations', this.registrations)
    setStored('certificates', this.certificates)
    setStored('announcements', this.announcements)
    setStored('notifications', this.notifications)
    setStored('in_app_notifications', this.inAppNotifications)
    setStored('payout_accounts', this.payoutAccounts)
    setStored('settlements', this.settlements)
    setStored('invitations', this.invitations)
    setStored('proposals', this.proposals)
    setStored('audit_logs', this.auditLogs)
    setStored('sync_runs', this.syncRuns)
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
    this.inAppNotifications = [...SEED_IN_APP_NOTIFICATIONS]
    this.payoutAccounts = { ...SEED_PAYOUT_ACCOUNTS }
    this.settlements = [...SEED_SETTLEMENTS]
    this.auditLogs = SEED_AUDIT_LOGS
    this.currentSession = SEED_DEMO_USERS[0]
    setStored('schema_version', SCHEMA_VERSION)
    this.save()
  }
}

export const mockStore = new MockDataStore()

// -------------------------------------------------------------
// ADAPTER IMPLEMENTATIONS
// -------------------------------------------------------------

export const mockEventsApi: EventsApi = {
  async getBrowseEvents(params = {}): Promise<EventBrowseResponse> {
    await simulateLatency()
    let filtered = [...mockStore.events].filter((e) => e.status !== 'draft')

    if (params.category && params.category !== 'ALL' && params.category !== 'all') {
      const cat = params.category.toLowerCase()
      filtered = filtered.filter(
        (e) =>
          e.category.toLowerCase().includes(cat) ||
          e.type.toLowerCase().includes(cat) ||
          (e.tags && e.tags.some((t) => t.toLowerCase().includes(cat)))
      )
    }

    if (params.source && params.source !== 'ALL') {
      const s = params.source.toLowerCase()
      filtered = filtered.filter((e) => (e.provider || 'eventmesh').toLowerCase() === s)
    }

    if (params.city && params.city !== 'ALL') {
      const c = params.city.toLowerCase()
      filtered = filtered.filter((e) => {
        const city = (e.venue?.city || e.venue?.address || '').toLowerCase()
        const tags = (e.tags || []).map((t) => t.toLowerCase())
        return city.includes(c) || tags.includes(c)
      })
    }

    if (params.free !== undefined) {
      filtered = filtered.filter((e) => params.free ? (e.isFree || e.price === 0) : (!e.isFree && (e.price || 0) > 0))
    }

    if (params.online !== undefined) {
      filtered = filtered.filter((e) => Boolean(e.isOnline) === params.online)
    }

    if (params.q) {
      const q = params.q.toLowerCase()
      filtered = filtered.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q) ||
          (e.organizerName && e.organizerName.toLowerCase().includes(q)) ||
          (e.provider && e.provider.toLowerCase().includes(q)) ||
          (e.venue?.city && e.venue.city.toLowerCase().includes(q)) ||
          (e.tags && e.tags.some((t) => t.toLowerCase().includes(q)))
      )
    }

    const offset = params.offset || 0
    const limit = params.limit || 20
    const sliced = filtered.slice(offset, offset + limit)
    const next_offset = offset + limit < filtered.length ? offset + limit : null

    const items: VisibleEventRead[] = sliced.map((e) => ({
      id: e.id,
      kind: e.kind || 'native',
      title: e.title,
      slug: e.slug || null,
      description: e.description || null,
      start_time: e.startsAt,
      end_time: e.endsAt || null,
      is_online: Boolean(e.isOnline),
      venue: e.venue?.name || null,
      city: e.venue?.city || (e.venue?.address ? e.venue.address.split(',')[0] : null),
      category: e.category || null,
      is_free: Boolean(e.isFree || e.price === 0),
      price_cents: e.price != null ? Math.round(e.price * 100) : null,
      currency: e.currency || 'INR',
      image_url: e.poster || e.banner || null,
      provider: e.provider || 'eventmesh',
      url: e.sourceUrl || null,
      sources: [e.provider || 'eventmesh'],
      timezone: e.timezone || 'Asia/Kolkata',
      audience_type: 'open',
    }))

    return {
      total: filtered.length,
      items,
      next_offset,
    }
  },

  async getEvents(filter): Promise<PaginatedResult<Event>> {
    await simulateLatency()
    let filtered = [...mockStore.events].filter((e) => e.status !== 'draft')

    if (filter?.category && filter.category !== 'all' && filter.category !== 'ALL') {
      if (filter.category === 'completed') {
        filtered = filtered.filter((e) => e.status === 'completed')
      } else if (filter.category === 'club_events') {
        filtered = filtered.filter((e) => e.category === 'club_events')
      } else {
        const cat = filter.category.toLowerCase()
        filtered = filtered.filter(
          (e) =>
            e.category.toLowerCase().includes(cat) ||
            e.type.toLowerCase().includes(cat) ||
            (e.tags && e.tags.some((t) => t.toLowerCase().includes(cat)))
        )
      }
    }

    if (filter?.source && filter.source !== 'ALL') {
      const s = filter.source.toLowerCase()
      filtered = filtered.filter((e) => (e.provider || 'eventmesh').toLowerCase() === s)
    }

    if (filter?.city && filter.city !== 'ALL') {
      const c = filter.city.toLowerCase()
      filtered = filtered.filter((e) => {
        const city = (e.venue?.city || e.venue?.address || '').toLowerCase()
        const tags = (e.tags || []).map((t) => t.toLowerCase())
        return city.includes(c) || tags.includes(c)
      })
    }

    if (filter?.free !== undefined) {
      filtered = filtered.filter((e) => filter.free ? (e.isFree || e.price === 0) : (!e.isFree && (e.price || 0) > 0))
    }

    if (filter?.online !== undefined) {
      filtered = filtered.filter((e) => Boolean(e.isOnline) === filter.online)
    }

    if (filter?.clubId) {
      filtered = filtered.filter((e) => e.organizerId === filter.clubId)
    }

    if (filter?.status && filter.status !== 'all') {
      filtered = filtered.filter((e) => e.status === filter.status)
    }

    if (filter?.dateFilter && filter.dateFilter !== 'all') {
      const now = new Date()
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0)
      const startOfTomorrow = new Date(startOfToday.getTime() + 24 * 3600 * 1000)

      if (filter.dateFilter === 'today') {
        filtered = filtered.filter((e) => {
          const d = new Date(e.startsAt)
          return d >= startOfToday && d < startOfTomorrow
        })
      } else if (filter.dateFilter === 'weekend') {
        const weekendStart = new Date(startOfToday)
        if (startOfToday.getDay() === 0) {
          weekendStart.setDate(startOfToday.getDate() - 1)
        } else {
          weekendStart.setDate(startOfToday.getDate() + ((6 - startOfToday.getDay() + 7) % 7))
        }
        const weekendEnd = new Date(weekendStart)
        weekendEnd.setDate(weekendStart.getDate() + 2)
        filtered = filtered.filter((e) => {
          const d = new Date(e.startsAt)
          return d >= weekendStart && d < weekendEnd
        })
      } else if (filter.dateFilter === 'next-week') {
        const nextMonday = new Date(startOfToday)
        const daysUntilMon = (8 - startOfToday.getDay()) % 7 || 7
        nextMonday.setDate(startOfToday.getDate() + daysUntilMon)
        const followingMonday = new Date(nextMonday)
        followingMonday.setDate(nextMonday.getDate() + 7)
        filtered = filtered.filter((e) => {
          const d = new Date(e.startsAt)
          return d >= nextMonday && d < followingMonday
        })
      } else if (filter.dateFilter === 'upcoming') {
        filtered = filtered.filter((e) => new Date(e.startsAt) >= startOfToday)
      } else if (filter.dateFilter === 'past') {
        filtered = filtered.filter((e) => new Date(e.startsAt) < startOfToday)
      }
    }

    if (filter?.search) {
      const q = filter.search.toLowerCase()
      filtered = filtered.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q) ||
          (e.organizerName && e.organizerName.toLowerCase().includes(q)) ||
          (e.provider && e.provider.toLowerCase().includes(q)) ||
          (e.venue?.city && e.venue.city.toLowerCase().includes(q)) ||
          (e.venue?.name && e.venue.name.toLowerCase().includes(q)) ||
          (e.tags && e.tags.some((t) => t.toLowerCase().includes(q)))
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

  async listPromoted(): Promise<Event[]> {
    await simulateLatency()
    return mockStore.events
      .filter((e) => e.status === 'published' || e.status === 'live')
      .filter((e) => Boolean(e.promotion?.label || e.isSignature))
      .sort((a, b) => {
        const pA = a.promotion?.priority ?? (a.isSignature ? 10 : 0)
        const pB = b.promotion?.priority ?? (b.isSignature ? 10 : 0)
        return pB - pA
      })
      .slice(0, 5)
  },

  async listNewest(params?: { limit?: number; cursor?: string }): Promise<PaginatedResult<Event>> {
    await simulateLatency()
    const limit = params?.limit || 10
    const cursor = params?.cursor ? Number(params.cursor) : 0
    const published = mockStore.events
      .filter((e) => e.status === 'published' || e.status === 'live')
      .sort((a, b) => {
        const timeA = new Date(a.publishedAt || a.startsAt).getTime()
        const timeB = new Date(b.publishedAt || b.startsAt).getTime()
        return timeB - timeA
      })
    const slice = published.slice(cursor, cursor + limit)
    const nextCursor = cursor + limit < published.length ? String(cursor + limit) : undefined
    return {
      items: slice,
      nextCursor,
      totalCount: published.length,
    }
  },

  async list(params?: {
    category?: string
    date?: string
    free?: boolean
    q?: string
    sort?: string
    cursor?: string
    limit?: number
  }): Promise<PaginatedResult<Event>> {
    await simulateLatency()
    let items = mockStore.events.filter((e) => e.status !== 'draft')

    // Category filter
    if (params?.category && params.category !== 'all') {
      const cat = params.category.toLowerCase()
      items = items.filter(
        (e) =>
          e.category.toLowerCase() === cat ||
          e.type.toLowerCase() === cat ||
          (e.tags && e.tags.some((t) => t.toLowerCase() === cat))
      )
    }

    // Search query
    if (params?.q) {
      const query = params.q.toLowerCase().trim()
      items = items.filter(
        (e) =>
          e.title.toLowerCase().includes(query) ||
          e.description.toLowerCase().includes(query) ||
          (e.organizerName && e.organizerName.toLowerCase().includes(query)) ||
          (e.club?.name && e.club.name.toLowerCase().includes(query)) ||
          (e.tags && e.tags.some((t) => t.toLowerCase() === query))
      )
    }

    // Free filter
    if (params?.free) {
      items = items.filter((e) => e.isFree === true || e.price === 0 || !e.features?.paid)
    }

    // Date filter
    if (params?.date && params.date !== 'all') {
      const now = new Date()
      if (params.date === 'today') {
        const todayStr = now.toISOString().slice(0, 10)
        items = items.filter((e) => e.startsAt.startsWith(todayStr))
      } else if (params.date === 'this-weekend' || params.date === 'weekend') {
        const inSevenDays = new Date(now.getTime() + 7 * 24 * 3600 * 1000)
        items = items.filter((e) => {
          const d = new Date(e.startsAt)
          return d >= now && d <= inSevenDays
        })
      } else if (params.date === 'this-month') {
        const nextMonth = new Date(now.getTime() + 30 * 24 * 3600 * 1000)
        items = items.filter((e) => {
          const d = new Date(e.startsAt)
          return d >= now && d <= nextMonth
        })
      }
    }

    // Sort order
    if (params?.sort === 'date-asc') {
      items.sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime())
    } else if (params?.sort === 'date-desc') {
      items.sort((a, b) => new Date(b.startsAt).getTime() - new Date(a.startsAt).getTime())
    } else if (params?.sort === 'popularity') {
      items.sort((a, b) => (b.registrationsCount || 0) - (a.registrationsCount || 0))
    } else if (params?.sort === 'newest') {
      items.sort(
        (a, b) =>
          new Date(b.publishedAt || b.startsAt).getTime() -
          new Date(a.publishedAt || a.startsAt).getTime()
      )
    }

    const limit = params?.limit || 12
    const cursor = params?.cursor ? Number(params.cursor) : 0
    const paged = items.slice(cursor, cursor + limit)
    const nextCursor = cursor + limit < items.length ? String(cursor + limit) : undefined

    return {
      items: paged,
      nextCursor,
      totalCount: items.length,
    }
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
      registrationsCount: 0,
      club: {
        id: club.id,
        name: club.name,
        color: club.color,
        verified: true,
      },
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

  async cancelEvent(id: string): Promise<Event> {
    await simulateLatency()
    const index = mockStore.events.findIndex((e) => e.id === id)
    if (index === -1) throw new Error('Event not found')

    mockStore.events[index].status = 'cancelled'
    mockStore.save()
    return mockStore.events[index]
  },

  async archiveEvent(id: string): Promise<Event> {
    await simulateLatency()
    const index = mockStore.events.findIndex((e) => e.id === id)
    if (index === -1) throw new Error('Event not found')

    mockStore.events[index].status = 'archived'
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
  async lookupTeam(eventSlug: string, teamCode: string) {
    await simulateLatency()
    const code = teamCode.trim().toUpperCase()
    const found = mockStore.registrations.find(
      (r) => (r.team as any)?.teamCode?.toUpperCase() === code || (r.team as any)?.team_code?.toUpperCase() === code
    )
    if (found && found.team) {
      return {
        team_code: code,
        team_name: found.team.teamName,
        leader_name: found.team.leaderName,
        leader_id: found.userId,
        members: [
          {
            user_id: found.userId,
            name: found.team.leaderName,
            email: found.team.leaderEmail,
            role: 'Team Lead',
            status: 'Joined',
          },
          ...(found.team.members || []).map((m: any, i: number) => ({
            user_id: `mem-${i}`,
            name: m.name,
            email: m.email,
            role: m.role || 'Member',
            status: 'Joined',
          })),
        ],
        min_size: 2,
        max_size: 4,
        is_full: ((found.team.members?.length || 0) + 1) >= 4,
      }
    }
    if (code.startsWith('EM-') || code.startsWith('HACK-') || code.length >= 4) {
      return {
        team_code: code,
        team_name: 'Alpha Innovators',
        leader_name: 'Priya Sharma',
        leader_id: 'usr-lead-1',
        members: [
          {
            user_id: 'usr-lead-1',
            name: 'Priya Sharma',
            email: 'priya@example.com',
            role: 'Team Lead',
            status: 'Joined',
          },
        ],
        min_size: 2,
        max_size: 4,
        is_full: false,
      }
    }
    throw new Error('Team not found')
  },

  async register(payload: RegisterPayload): Promise<Registration> {
    await simulateLatency()
    const evt = mockStore.events.find((e) => e.id === payload.eventId || (payload.eventSlug && e.slug === payload.eventSlug))
    if (!evt) throw new Error('Event not found')

    // Decrement seatsLeft
    if (evt.seatsLeft != null && evt.seatsLeft > 0) {
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
      status: evt.seatsLeft === 0 && evt.waitlistEnabled ? 'waitlisted' : 'registered',
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
    const userId = mockStore.currentSession?.id || 'usr-suraj'
    const userEmail = mockStore.currentSession?.email || 'ceosuraj@email.com'
    return mockStore.registrations.filter((r) => r.userId === userId || r.userEmail === userEmail)
  },

  async cancelMyRegistration(registrationId: string): Promise<boolean> {
    await simulateLatency()
    const reg = mockStore.registrations.find((r) => r.id === registrationId)
    if (!reg) return false
    reg.status = 'cancelled'
    const evt = mockStore.events.find((e) => e.id === reg.eventId)
    if (evt && evt.seatsLeft != null) {
      evt.seatsLeft += 1
    }
    mockStore.save()
    return true
  },

  async joinWaitlist(eventId: string, answers = {}): Promise<Registration> {
    await simulateLatency()
    const evt = mockStore.events.find((e) => e.id === eventId)
    if (!evt) throw new Error('Event not found')

    const user = mockStore.currentSession || {
      id: `usr-${Date.now()}`,
      name: 'Aditya Narayan',
      email: 'attendee@campus.edu',
    }

    const regId = `reg-wait-${Date.now()}`
    const ticketCode = `WAIT-${Math.floor(100000 + Math.random() * 900000)}`

    const newReg: Registration = {
      id: regId,
      eventId: evt.id,
      userId: user.id,
      userEmail: user.email,
      userName: user.name,
      answers,
      status: 'waitlisted',
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

  async getTicketPass(registrationId: string): Promise<{ token: string; status: 'intact' | 'checked_in'; otp: string; checkedInAt?: string }> {
    await simulateLatency()
    const reg = mockStore.registrations.find((r) => r.id === registrationId)
    if (!reg) throw new Error('Registration not found')

    const tokenPayload = {
      v: 2,
      ticketId: reg.id,
      code: reg.ticketCode,
      eventId: reg.eventId,
      sig: `SIG_EVENTMESH_${reg.id.slice(0, 6)}_${Date.now()}`,
    }
    const token = btoa(JSON.stringify(tokenPayload))
    const otp = String(
      Math.abs(reg.ticketCode.split('').reduce((acc, c) => acc * 31 + c.charCodeAt(0), 7) % 900000) + 100000
    )

    return {
      token,
      status: reg.status === 'checked_in' ? 'checked_in' : 'intact',
      otp,
      checkedInAt: reg.checkedInAt,
    }
  },
}

export const mockCheckinApi: CheckinApi = {
  async checkinWithToken(token: string, eventId?: string): Promise<CheckinResult> {
    await simulateLatency()
    try {
      const decoded = JSON.parse(atob(token))
      const ticketCode = decoded.code || decoded.ticketId
      return this.checkinTicket(ticketCode, eventId)
    } catch {
      return { success: false, message: 'Invalid QR signature or corrupted ticket payload.' }
    }
  },

  async checkinTicket(ticketCode: string, eventId?: string): Promise<CheckinResult> {
    await simulateLatency()
    const reg = mockStore.registrations.find(
      (r) =>
        (r.ticketCode.toUpperCase() === ticketCode.trim().toUpperCase() || r.id === ticketCode.trim()) &&
        (!eventId || r.eventId === eventId)
    )

    if (!reg) {
      return { success: false, message: 'Invalid ticket pass. No matching registration found.' }
    }

    if (reg.status === 'checked_in') {
      return {
        success: false,
        alreadyAdmitted: true,
        registration: reg,
        admittedAt: reg.checkedInAt,
        message: `Ticket already admitted at ${new Date(reg.checkedInAt || '').toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      }
    }

    if (reg.status === 'cancelled') {
      return {
        success: false,
        registration: reg,
        message: 'This registration has been cancelled by the attendee.',
      }
    }

    reg.status = 'checked_in'
    reg.checkedInAt = new Date().toISOString()
    reg.checkedInBy = mockStore.currentSession?.id || 'volunteer'
    mockStore.save()

    return {
      success: true,
      registration: reg,
      admittedAt: reg.checkedInAt,
      message: `Admitted successfully: ${reg.userName} (${reg.eventTitle || 'Event'})`,
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

  async getMyNotifications(): Promise<Notification[]> {
    await simulateLatency()
    return [...mockStore.notifications]
  },

  async getInAppNotifications(unreadOnly?: boolean): Promise<InAppNotificationListResponse> {
    await simulateLatency()
    let items = [...mockStore.inAppNotifications]
    if (unreadOnly) {
      items = items.filter((n) => !n.is_read)
    }
    const unreadCount = mockStore.inAppNotifications.filter((n) => !n.is_read).length
    return {
      total: items.length,
      unread_count: unreadCount,
      total_unread: unreadCount,
      items,
    }
  },

  async getUnreadCount(): Promise<number> {
    await simulateLatency()
    return mockStore.inAppNotifications.filter((n) => !n.is_read).length
  },

  async markNotificationRead(id: string): Promise<boolean> {
    await simulateLatency()
    const notif = mockStore.notifications.find((n) => n.id === id)
    if (notif) notif.read = true
    const ian = mockStore.inAppNotifications.find((n) => n.id === id)
    if (ian) {
      ian.is_read = true
      ian.read_at = new Date().toISOString()
    }
    mockStore.save()
    return true
  },

  async markAllNotificationsRead(): Promise<boolean> {
    await simulateLatency()
    mockStore.notifications.forEach((n) => {
      n.read = true
    })
    mockStore.inAppNotifications.forEach((n) => {
      n.is_read = true
      n.read_at = new Date().toISOString()
    })
    mockStore.save()
    return true
  },
}

export const mockPaymentsApi: PaymentsApi = {
  async getFeeQuote(baseAmountCents: number): Promise<FeeQuote> {
    await simulateLatency()
    const orgRate = 5.0
    const attRate = 3.0
    const txRate = 0.0

    const platformFeeCents = Math.round(baseAmountCents * (attRate / 100.0))
    const taxAmountCents = txRate > 0 ? Math.round(platformFeeCents * (txRate / 100.0)) : 0
    const totalPayableCents = baseAmountCents + platformFeeCents + taxAmountCents
    const organizerCommCents = Math.round(baseAmountCents * (orgRate / 100.0))
    const organizerShareCents = baseAmountCents - organizerCommCents
    const platformGrossCents = organizerCommCents + platformFeeCents + taxAmountCents

    return {
      base_amount_cents: baseAmountCents,
      platform_fee_cents: platformFeeCents,
      organizer_commission_cents: organizerCommCents,
      tax_amount_cents: taxAmountCents,
      total_payable_cents: totalPayableCents,
      organizer_share_cents: organizerShareCents,
      platform_gross_cents: platformGrossCents,
      base_amount_inr: Math.round(baseAmountCents) / 100.0,
      platform_fee_inr: Math.round(platformFeeCents) / 100.0,
      organizer_commission_inr: Math.round(organizerCommCents) / 100.0,
      tax_amount_inr: Math.round(taxAmountCents) / 100.0,
      total_payable_inr: Math.round(totalPayableCents) / 100.0,
      organizer_share_inr: Math.round(organizerShareCents) / 100.0,
      platform_gross_inr: Math.round(platformGrossCents) / 100.0,
      organizer_commission_rate: orgRate,
      attendee_fee_rate: attRate,
      tax_rate: txRate,
    }
  },

  async createOrder(payload: OrderCreateRequest): Promise<OrderCreateResponse> {
    await simulateLatency()
    let amountCents = 24900
    if (payload.event_slug) {
      const ev = mockStore.events.find((e) => e.slug === payload.event_slug)
      if (ev && ev.price) {
        amountCents = Math.round(ev.price * 100)
      }
    }
    const quote = await mockPaymentsApi.getFeeQuote(amountCents)
    return {
      order_id: `order_cf_${Date.now()}`,
      payment_session_id: `session_${Date.now()}`,
      amount_cents: quote.total_payable_cents,
      currency: 'INR',
      status: 'PENDING',
      environment: 'sandbox',
    }
  },

  async getOrderStatus(orderId: string): Promise<PaymentStatusResponse> {
    await simulateLatency()
    return {
      order_id: orderId,
      status: 'PAID',
      amount_cents: 25647,
      currency: 'INR',
      payment_type: 'event_registration',
      is_paid: true,
      ticket_code: `PASS-${Math.floor(100000 + Math.random() * 900000)}`,
      registration_status: 'confirmed',
    }
  },

  async refundOrder(orderId: string, payload?: RefundOrderRequest): Promise<RefundOrderResponse> {
    await simulateLatency()
    const reg = mockStore.registrations.find((r) => r.orderId === orderId || r.id === orderId)
    if (reg) {
      reg.refundStatus = 'refunded'
      reg.status = 'cancelled'
      mockStore.save()
    }
    return {
      status: 'refunded',
      refund_id: `RFD-${orderId.slice(-6).toUpperCase()}`,
      amount_inr: payload?.refund_amount_cents
        ? payload.refund_amount_cents / 100
        : reg?.paidAmountCents
        ? reg.paidAmountCents / 100
        : 499,
    }
  },
}

export const mockPayoutsApi: PayoutsApi = {
  async getPayoutAccount(orgSlug: string): Promise<PayoutAccount | null> {
    await simulateLatency()
    const target = mockStore.payoutAccounts[orgSlug]
    return target || null
  },

  async registerPayoutAccount(orgSlug: string, payload: PayoutAccountCreate): Promise<PayoutAccount> {
    await simulateLatency()
    const last4 = payload.account_number.slice(-4)
    const record: PayoutAccount = {
      id: `payout-acc-${Date.now()}`,
      organization_id: `org-${orgSlug}`,
      vendor_id: `CF_VND_${orgSlug.toUpperCase().replace(/[^A-Z0-9]/g, '_')}`,
      account_holder_name: payload.account_holder_name,
      bank_name: payload.bank_name || 'Bank of Baroda',
      ifsc_code: payload.ifsc_code.toUpperCase(),
      account_number_masked: `••••••••${last4}`,
      status: 'VERIFIED',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    mockStore.payoutAccounts[orgSlug] = record
    
    // Add notification
    const notif: InAppNotification = {
      id: `ian-${Date.now()}`,
      user_id: mockStore.currentSession?.id || 'usr-admin',
      type: 'payout_kyc_approved',
      organization_id: `org-${orgSlug}`,
      title: 'Bank Account Linked & Verified',
      message: `Cashfree vendor ${record.vendor_id} linked with ${record.bank_name} (${record.account_number_masked}). Split payouts active.`,
      is_read: false,
      read_at: null,
      created_at: new Date().toISOString(),
    }
    mockStore.inAppNotifications.unshift(notif)
    mockStore.save()
    return record
  },

  async listSettlements(_orgSlug: string): Promise<SettlementRecord[]> {
    await simulateLatency()
    return [...mockStore.settlements]
  },

  async getPayoutBalance(orgSlug: string): Promise<OrganizationBalance> {
    await simulateLatency()
    const target = mockStore.payoutAccounts[orgSlug]
    return {
      organization_id: `org-${orgSlug}`,
      gross_sales_cents: 8500000,
      organizer_share_cents: 8075000,
      settled_cents: 5500000,
      refunded_cents: 0,
      pending_withdrawals_cents: 0,
      paid_withdrawals_cents: 5500000,
      available_balance_cents: 2575000,
      available_balance_inr: 25750.0,
      currency: 'INR',
      payout_account_configured: Boolean(target),
      payout_account_status: target?.status || (target ? 'VERIFIED' : null),
      masked_bank_account: target?.account_number_masked || null,
      account_holder_name: target?.account_holder_name || null,
      bank_name: target?.bank_name || null,
      ifsc_code: target?.ifsc_code || null,
    }
  },

  async listWithdrawals(orgSlug: string): Promise<WithdrawalRequest[]> {
    await simulateLatency()
    return (mockStore as any).withdrawals || [
      {
        id: 'wd-seed-1',
        request_id: 'WDR-20261015-8942',
        organization_id: `org-${orgSlug}`,
        amount: 55000.0,
        amount_cents: 5500000,
        currency: 'INR',
        status: 'PAID',
        payout_details_snapshot: { bank_name: 'HDFC Bank', account_number_masked: '••••4829' },
        admin_notes: 'Processed via Cashfree Payout transfer',
        utr_reference: 'CFUTR2026101509823471',
        requested_at: '2026-10-15T10:00:00Z',
        paid_at: '2026-10-15T14:30:00Z',
        created_at: '2026-10-15T10:00:00Z',
      },
    ]
  },

  async requestWithdrawal(orgSlug: string, payload: WithdrawalRequestCreate): Promise<WithdrawalRequest> {
    await simulateLatency()
    const target = mockStore.payoutAccounts[orgSlug]
    const amountInr = payload.amount || (payload.amount_cents ? payload.amount_cents / 100 : 25750)
    const newReq: WithdrawalRequest = {
      id: `wd-${Date.now()}`,
      request_id: `WDR-${Date.now().toString().slice(-8)}`,
      organization_id: `org-${orgSlug}`,
      amount: amountInr,
      amount_cents: Math.round(amountInr * 100),
      currency: 'INR',
      status: 'PENDING',
      payout_details_snapshot: target
        ? { bank_name: target.bank_name, account_number_masked: target.account_number_masked }
        : {},
      admin_notes: payload.notes || null,
      requested_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    }
    const store = mockStore as any
    if (!store.withdrawals) {
      store.withdrawals = []
    }
    store.withdrawals.unshift(newReq)
    return newReq
  },

  async getEarningsSummary(_orgSlug: string): Promise<OrganizerEarningsSummary> {
    await simulateLatency()
    return {
      gross_revenue: 85000,
      gross_revenue_cents: 8500000,
      platform_fee: 4250,
      platform_fee_cents: 425000,
      pg_fee: 1700,
      pg_fee_cents: 170000,
      net_earnings: 79050,
      net_earnings_cents: 7905000,
      total_withdrawn: 55000,
      total_withdrawn_cents: 5500000,
      pending_withdrawal: 0,
      pending_withdrawal_cents: 0,
      available_balance: 24050,
      available_balance_cents: 2405000,
      has_active_request: false,
      events_breakdown: [],
    }
  },

  async adminListWithdrawals(status?: string): Promise<WithdrawalRequest[]> {
    await simulateLatency()
    const all: WithdrawalRequest[] = (mockStore as any).withdrawals || [
      {
        id: 'w-mock-01',
        request_id: 'REQ-20261022-001',
        organization_id: 'org-1',
        organization_name: 'Apex Student Council',
        organization_slug: 'apex-council',
        amount: 8500,
        amount_cents: 850000,
        currency: 'INR',
        status: 'PENDING',
        payout_details_snapshot: {
          account_type: 'BANK_ACCOUNT',
          account_holder_name: 'Apex Student Gymkhana',
          bank_name: 'HDFC Bank',
          masked_account_number: '••••••••8819',
          ifsc_code: 'HDFC0000123',
        },
        requester_id: 'usr-1',
        requester_email: 'treasurer@apex.edu',
        requester_name: 'Aditya Narayan',
        bank_name: 'HDFC Bank',
        masked_bank_account: '••••••••8819',
        ifsc_code: 'HDFC0000123',
        account_holder_name: 'Apex Student Gymkhana',
        requested_at: new Date(Date.now() - 3600000 * 4).toISOString(),
        created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
      },
      {
        id: 'w-mock-02',
        request_id: 'REQ-20261020-004',
        organization_id: 'org-2',
        organization_name: 'Coding & Algorithms Club',
        organization_slug: 'cp-club',
        amount: 14200,
        amount_cents: 1420000,
        currency: 'INR',
        status: 'PAID',
        payout_details_snapshot: {
          account_type: 'BANK_ACCOUNT',
          account_holder_name: 'CP Club Activity Fund',
          bank_name: 'State Bank of India',
          masked_account_number: '••••••••4190',
          ifsc_code: 'SBIN0001423',
        },
        requester_id: 'usr-2',
        requester_email: 'lead@cpclub.org',
        requester_name: 'Sameer Kulkarni',
        bank_name: 'State Bank of India',
        masked_bank_account: '••••••••4190',
        ifsc_code: 'SBIN0001423',
        account_holder_name: 'CP Club Activity Fund',
        utr_reference: 'UTR99882211004',
        requested_at: new Date(Date.now() - 86400000 * 2).toISOString(),
        paid_at: new Date(Date.now() - 86400000).toISOString(),
        created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
      },
    ]
    if (status && status !== 'ALL') {
      return all.filter((w) => w.status === status)
    }
    return all
  },

  async adminReviewWithdrawal(withdrawalId: string, payload: AdminWithdrawalReviewPayload): Promise<WithdrawalRequest> {
    await simulateLatency()
    const all: WithdrawalRequest[] = this.adminListWithdrawals ? await this.adminListWithdrawals() : []
    const match = all.find((w) => w.id === withdrawalId || w.request_id === withdrawalId)
    if (match) {
      if (payload.action === 'pay') {
        match.status = 'PAID'
        match.utr_reference = payload.transfer_reference || 'UTR-LOCAL-MOCK'
        match.paid_at = new Date().toISOString()
      } else if (payload.action === 'reject') {
        match.status = 'REJECTED'
        match.rejection_reason = payload.reason || 'Verification criteria not met'
      } else if (payload.action === 'approve') {
        match.status = 'APPROVED'
      }
      return match
    }
    return {
      id: withdrawalId,
      request_id: `REQ-${Date.now()}`,
      organization_id: 'org-1',
      amount: 5000,
      amount_cents: 500000,
      currency: 'INR',
      status: payload.action === 'pay' ? 'PAID' : payload.action === 'reject' ? 'REJECTED' : 'APPROVED',
      payout_details_snapshot: {},
      utr_reference: payload.transfer_reference,
      rejection_reason: payload.reason,
      requested_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    }
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
  async getAuditLogs(_scope): Promise<AuditLog[]> {
    await simulateLatency()
    return [...mockStore.auditLogs]
  },

  async getPlatformAuditLogs(params): Promise<PlatformAuditLog[]> {
    await simulateLatency()
    let items: PlatformAuditLog[] = mockStore.auditLogs.map((log) => ({
      id: log.id,
      actor_id: log.actorId,
      actor_name: log.actorName,
      actor_email: `${log.actorRole.toLowerCase()}@eventmesh.org`,
      action: log.action,
      entity_type: log.entity,
      entity_id: log.entityId,
      target_organization_id: 'org-1',
      target_organization_name: 'Apex Student Council',
      safe_metadata: { role: log.actorRole, origin: 'console' },
      created_at: log.at,
    }))

    if (params?.entityType && params.entityType !== 'ALL') {
      items = items.filter((i) => i.entity_type.toLowerCase() === params.entityType?.toLowerCase())
    }
    return items
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

  async becomeOrganizer(): Promise<any> {
    await simulateLatency()
    if (mockStore.currentSession) {
      mockStore.currentSession.role = 'club_admin'
      mockStore.save()
    }
    return { role: 'organizer' }
  },

  async completeOnboarding(payload: OnboardingSubmitPayload): Promise<ProfileRead> {
    await simulateLatency()
    const currentSession = mockStore.currentSession || SEED_DEMO_USERS[0]
    const names = (payload.display_name || currentSession.name).split(' ')
    const updatedProfile: ProfileRead = {
      id: currentSession.id,
      email: currentSession.email,
      handle: currentSession.email.split('@')[0],
      display_name: payload.display_name || currentSession.name,
      avatar_url: payload.avatar_url || currentSession.avatar || null,
      first_name: payload.first_name || names[0] || 'Suraj',
      middle_name: null,
      last_name: payload.last_name || names.slice(1).join(' ') || 'Naik',
      date_of_birth: null,
      phone: payload.phone || currentSession.phone || '+91 98765 43210',
      location: payload.degree_branch
        ? payload.semester
          ? `${payload.degree_branch} · Sem ${payload.semester}`
          : payload.degree_branch
        : currentSession.branch || 'Computer Science & Engineering',
      college_email: currentSession.email,
      college_id: payload.student_id || currentSession.studentId || 'CTU-2026-0814',
      student_id: payload.student_id || currentSession.studentId || 'CTU-2026-0814',
      institution_name: payload.institution_name || currentSession.campus || 'Central Technological University (CTU)',
      onboarding_completed: true,
      institution_verified: true,
      institution_verified_at: new Date().toISOString(),
      role: 'registered',
      is_organizer: currentSession.role === 'org_admin',
    }
    mockStore.currentSession = {
      ...currentSession,
      name: updatedProfile.display_name!,
      avatar: updatedProfile.avatar_url || undefined,
      phone: updatedProfile.phone || undefined,
      studentId: updatedProfile.student_id || undefined,
      registrationNumber: updatedProfile.student_id || undefined,
      institutionName: updatedProfile.institution_name || undefined,
      campus: updatedProfile.institution_name || undefined,
      branch: updatedProfile.location || undefined,
      degreeBranch: updatedProfile.location || undefined,
      onboarding_completed: true,
    }
    mockStore.save()
    try {
      localStorage.setItem('eventmesh_session', JSON.stringify(mockStore.currentSession))
      localStorage.setItem('eventmesh_onboarding_completed', 'true')
    } catch {}
    return updatedProfile
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

  async listInvitations(slug: string): Promise<InvitationRead[]> {
    await simulateLatency()
    return mockStore.invitations.filter((i) => i.organization_slug === slug || !i.organization_slug)
  },

  async createInvitation(slug: string, payload: InvitationCreate): Promise<InvitationCreatedResponse> {
    await simulateLatency()
    const token = `tok_inv_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`
    const newInv: InvitationRead & { token: string } = {
      id: `inv-${Date.now()}`,
      organization_id: mockStore.organization.id,
      organization_name: mockStore.organization.name,
      organization_slug: slug,
      role: payload.role || 'co_admin',
      recipient_email: payload.recipient_email || null,
      invited_by_id: mockStore.currentSession?.id || 'usr-admin',
      invited_by_name: mockStore.currentSession?.name || 'Administrator',
      status: 'pending',
      expires_at: new Date(Date.now() + 86400000 * (payload.expires_in_days || 7)).toISOString(),
      created_at: new Date().toISOString(),
      token,
    }
    mockStore.invitations.unshift(newInv)
    mockStore.save()
    return {
      ...newInv,
      invite_url: `${window.location.origin}/invite/${token}`,
    }
  },

  async revokeInvitation(slug: string, invitationId: string): Promise<InvitationRead> {
    await simulateLatency()
    const inv = mockStore.invitations.find((i) => i.id === invitationId)
    if (inv) {
      inv.status = 'revoked'
      mockStore.save()
      return inv
    }
    throw new Error('Invitation not found')
  },

  async acceptInvitation(token: string): Promise<InvitationRead> {
    await simulateLatency()
    const inv = mockStore.invitations.find((i) => i.token === token || i.id === token)
    if (!inv) {
      // Create a mock fallback invitation for token testing
      const accepted: InvitationRead = {
        id: `inv-accepted-${Date.now()}`,
        organization_id: mockStore.organization.id,
        organization_name: mockStore.organization.name,
        organization_slug: mockStore.organization.slug,
        role: 'co_admin',
        recipient_email: mockStore.currentSession?.email || 'admin@apex.edu',
        invited_by_id: 'usr-admin',
        invited_by_name: 'Lead Administrator',
        status: 'accepted',
        expires_at: new Date(Date.now() + 86400000).toISOString(),
        created_at: new Date().toISOString(),
      }
      return accepted
    }
    inv.status = 'accepted'
    mockStore.save()
    return inv
  },

  async createProposal(parentSlug: string, payload: ProposalCreate): Promise<ProposalRead> {
    await simulateLatency()
    const newProp: ProposalRead = {
      id: `prop-${Date.now()}`,
      parent_organization_id: mockStore.organization.id,
      parent_organization_name: mockStore.organization.name,
      parent_organization_slug: parentSlug,
      proposed_organization_id: `org-prop-${Date.now()}`,
      proposed_organization_name: payload.name,
      proposed_organization_slug: payload.slug || payload.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      proposer_id: mockStore.currentSession?.id || 'usr_dev_001',
      proposer_name: mockStore.currentSession?.name || 'Alex Rivera',
      status: 'pending',
      reason: payload.reason || payload.description || null,
      reviewed_by_id: null,
      reviewed_at: null,
      created_at: new Date().toISOString(),
    }
    mockStore.proposals.unshift(newProp)
    mockStore.save()
    return newProp
  },

  async listMyProposals(): Promise<ProposalRead[]> {
    await simulateLatency()
    return [...mockStore.proposals]
  },

  async listOrgProposals(slug: string): Promise<ProposalRead[]> {
    await simulateLatency()
    return mockStore.proposals.filter(
      (p) => p.parent_organization_slug === slug || !p.parent_organization_slug
    )
  },

  async reviewProposal(proposalId: string, review: ProposalReview): Promise<ProposalRead> {
    await simulateLatency()
    const prop = mockStore.proposals.find((p) => p.id === proposalId)
    if (!prop) {
      throw new Error('Proposal not found')
    }
    prop.status = review.action === 'approve' ? 'approved' : 'rejected'
    prop.reviewed_by_id = mockStore.currentSession?.id || 'usr-admin'
    prop.reviewed_at = new Date().toISOString()
    mockStore.save()
    return prop
  },

  async getPlatformOverview(): Promise<PlatformOverview> {
    await simulateLatency()
    return {
      pending_proposals_count: mockStore.proposals.filter((p) => p.status === 'pending').length || 2,
      pending_withdrawals_count: ((mockStore as any).withdrawals || []).filter((w: any) => w.status === 'PENDING').length || 1,
      verified_organizations_count: 8,
      verified_institutions_count: 3,
      total_organizations_count: 12,
    }
  },

  async getInstitutionCandidates(): Promise<InstitutionCandidate[]> {
    await simulateLatency()
    return [
      {
        id: 'inst-cand-1',
        name: 'Apex Institute of Technology',
        slug: 'apex-institute',
        status: 'active',
        is_institution: true,
        domains: ['apex.edu.in', 'apex.ac.in'],
        contact_email: 'admin@apex.edu.in',
        owner_id: 'usr-1',
        owner_email: 'dean@apex.edu.in',
        created_at: '2026-09-01T00:00:00Z',
      },
    ]
  },

  async verifyInstitution(slug: string, domains: string[]): Promise<InstitutionCandidate> {
    await simulateLatency()
    return {
      id: `inst-${slug}`,
      name: slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      slug,
      status: 'active',
      is_institution: true,
      institution_verified_at: new Date().toISOString(),
      institution_verified_by_email: 'platform.admin@eventmesh.xyz',
      domains,
      owner_id: 'usr-admin',
      created_at: new Date().toISOString(),
    }
  },

  async rejectInstitution(slug: string, reason?: string): Promise<InstitutionCandidate> {
    await simulateLatency()
    return {
      id: `inst-${slug}`,
      name: slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      slug,
      status: 'rejected',
      is_institution: false,
      institution_rejection_reason: reason || 'Domain verification criteria not met',
      institution_rejected_at: new Date().toISOString(),
      domains: [],
      owner_id: 'usr-admin',
      created_at: new Date().toISOString(),
    }
  },

  async revokeInstitution(slug: string, reason?: string): Promise<InstitutionCandidate> {
    await simulateLatency()
    return {
      id: `inst-${slug}`,
      name: slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      slug,
      status: 'active',
      is_institution: false,
      institution_rejection_reason: reason || 'Administrative verification revocation',
      institution_rejected_at: new Date().toISOString(),
      domains: [],
      owner_id: 'usr-admin',
      created_at: new Date().toISOString(),
    }
  },

  async getPlatformOrganizations(status?: string): Promise<PlatformOrganizationItem[]> {
    await simulateLatency()
    const items: PlatformOrganizationItem[] = [
      {
        id: 'org-1',
        name: 'Apex Institute of Technology',
        slug: 'apex-institute',
        status: 'verified',
        type: 'college',
        is_institution: true,
        is_platform_root: false,
        owner_id: 'usr-1',
        owner_email: 'director@apex.edu',
        owner_name: 'Dr. R. Ramanathan',
        created_at: '2026-08-15T00:00:00Z',
        event_count: 24,
        member_count: 142,
      },
      {
        id: 'org-2',
        name: 'Apex Student Council',
        slug: 'apex-council',
        status: 'verified',
        type: 'club',
        is_institution: false,
        is_platform_root: false,
        parent_organization_id: 'org-1',
        parent_name: 'Apex Institute of Technology',
        parent_slug: 'apex-institute',
        owner_id: 'usr-2',
        owner_email: 'president@apex.edu',
        owner_name: 'Aarav Deshmukh',
        created_at: '2026-08-20T00:00:00Z',
        event_count: 14,
        member_count: 48,
      },
      {
        id: 'org-3',
        name: 'Coding & Competitive Programming Club',
        slug: 'cp-club',
        status: 'verified',
        type: 'club',
        is_institution: false,
        is_platform_root: false,
        parent_organization_id: 'org-1',
        parent_name: 'Apex Institute of Technology',
        parent_slug: 'apex-institute',
        owner_id: 'usr-3',
        owner_email: 'lead@cpclub.org',
        owner_name: 'Sameer Kulkarni',
        created_at: '2026-09-01T00:00:00Z',
        event_count: 8,
        member_count: 86,
      },
      {
        id: 'org-4',
        name: 'Robotics & Hardware Society',
        slug: 'robotics-society',
        status: 'pending',
        type: 'club',
        is_institution: false,
        is_platform_root: false,
        parent_organization_id: 'org-1',
        parent_name: 'Apex Institute of Technology',
        parent_slug: 'apex-institute',
        owner_id: 'usr-4',
        owner_email: 'hardware@apex.edu',
        owner_name: 'Pooja Patel',
        created_at: '2026-10-18T00:00:00Z',
        event_count: 0,
        member_count: 12,
      },
    ]
    if (status && status !== 'ALL') {
      return items.filter((o) => o.status === status)
    }
    return items
  },

  async listPlatformProposals(status?: string): Promise<ProposalRead[]> {
    await simulateLatency()
    return mockStore.proposals.filter((p) => !status || status === 'ALL' || p.status === status)
  },

  async reviewPlatformProposal(proposalId: string, review: ProposalReview): Promise<ProposalRead> {
    if (!this.reviewProposal) throw new Error('reviewProposal not implemented')
    return this.reviewProposal(proposalId, review)
  },
}

export const mockSystemApi: SystemApi = {
  async listSyncRuns(): Promise<SyncRun[]> {
    await simulateLatency()
    return mockStore.syncRuns || []
  },
  async triggerSync(payload?: TriggerSyncRequest): Promise<TriggerSyncResponse> {
    await simulateLatency()
    const newRun: SyncRun = {
      id: `sync-${Date.now()}`,
      status: 'running',
      mode: payload?.mode || 'incremental',
      citiesCount: payload?.targetCities?.length || 23,
      eventsIngested: 14,
      startedAt: new Date().toISOString(),
      completedAt: null,
      triggeredBy: mockStore.currentSession?.email || 'admin@eventmesh.internal',
      logExcerpt: 'Crawler worker dispatched to 23 city edge workers.',
    }
    mockStore.syncRuns.unshift(newRun)
    mockStore.save()
    setTimeout(() => {
      newRun.status = 'success'
      newRun.completedAt = new Date().toISOString()
      newRun.eventsIngested = 32
      newRun.logExcerpt = 'Harvest completed: 32 technical hackathons and meetups ingested.'
      mockStore.save()
    }, 2000)
    return {
      status: 'started',
      runId: newRun.id,
      message: 'Crawler sync across 23 cities initiated successfully.',
    }
  },
  async sendTestEmail(payload: TestEmailRequest): Promise<TestEmailResponse> {
    await simulateLatency()
    return {
      status: 'delivered',
      messageId: `msg_${Date.now()}`,
      recipient: payload.recipient,
      template: payload.template,
      sentAt: new Date().toISOString(),
    }
  },
}


