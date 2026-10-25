import { eventDestination } from '@/lib/eventPresentation'
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
  PaymentsApi,
  PayoutsApi,
  SystemApi,
} from '../../ports'
import {
  ApiError,
  normalizeBackendEvent,
  normalizeBackendRegistration,
  profileToSession,
  EventBrowseResponse,
  EventRead,
  VisibleEventRead,
  RegistrationRead,
  AttendeeRead,
  ProfileRead,
  ProfileUpdatePayload,
  OrganizationRead,
  MemberRead,
  CreateOrgPayload,
  CreateSubOrgPayload,
  CreateClubPayload,
  UserSession,
  UserRole,
  normalizeBackendOrganization,
  FeeQuote,
  OrderCreateRequest,
  OrderCreateResponse,
  PaymentStatusResponse,
  PayoutAccount,
  PayoutAccountCreate,
  SettlementRecord,
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
  TeamLookupResult,
} from '../../contracts'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://eventmesh-api.onrender.com'
const V1 = '/api/v1'

function getAuthToken(): string | null {
  try {
    const direct = localStorage.getItem('eventmesh_auth_token')
    if (direct) return direct

    // Fallback: recover token from Supabase local storage session
    const sbData = localStorage.getItem('eventmesh.auth')
    if (sbData) {
      const parsed = JSON.parse(sbData)
      const token = parsed?.access_token || parsed?.currentSession?.access_token
      if (token) {
        localStorage.setItem('eventmesh_auth_token', token)
        return token
      }
    }
    return null
  } catch {
    return null
  }
}

function getAdminToken(): string | null {
  try {
    return localStorage.getItem('eventmesh_admin_token')
  } catch {
    return null
  }
}

async function fetchWithRetry(url: string, options: RequestInit = {}, retries = 1): Promise<Response> {
  const token = getAuthToken()
  const adminToken = getAdminToken()
  const headers = new Headers(options.headers || {})
  
  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json')
  }
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`)
  }
  if (adminToken && !headers.has('X-Admin-Token')) {
    headers.set('X-Admin-Token', adminToken)
  }

  let signal = options.signal
  let timer: any
  if (!signal) {
    const controller = new AbortController()
    timer = setTimeout(() => controller.abort(), 20000)
    signal = controller.signal
  }

  try {
    const res = await fetch(url, { ...options, headers, signal })
    if (timer) clearTimeout(timer)
    if (!res.ok) {
      if (res.status >= 500 && retries > 0) {
        await new Promise((r) => setTimeout(r, 600))
        return fetchWithRetry(url, options, retries - 1)
      }
      let rawJson: any = null
      try {
        rawJson = await res.json()
      } catch {}
      const rawDetail = rawJson?.detail || rawJson?.error
      const message =
        rawJson?.error?.message ||
        (typeof rawJson?.detail === 'string'
          ? rawJson.detail
          : Array.isArray(rawJson?.detail)
          ? rawJson.detail.map((d: any) => d?.msg || d?.message || JSON.stringify(d)).join(', ')
          : rawJson?.message) ||
        res.statusText ||
        'An error occurred during request execution.'

      const errorPayload: any = {
        code: rawJson?.error?.code || rawJson?.code || `HTTP_${res.status}`,
        message,
        detail: rawDetail,
        status: res.status,
      }
      throw errorPayload
    }
    return res
  } catch (err) {
    if (timer) clearTimeout(timer)
    if (retries > 0 && !(err as ApiError).code && (err as any)?.name !== 'AbortError') {
      await new Promise((r) => setTimeout(r, 600))
      return fetchWithRetry(url, options, retries - 1)
    }
    throw err
  }
}

import { mockEventsApi, mockAuthApi } from '../mock'

function parseUserRole(roleStr: string | null | undefined): UserRole {
  if (
    roleStr === 'platform_admin' ||
    roleStr === 'org_admin' ||
    roleStr === 'club_admin' ||
    roleStr === 'volunteer'
  ) {
    return roleStr
  }
  return 'attendee'
}

async function requestJson<T>(path: string, options: RequestInit = {}): Promise<T> {
  const normalizedPath = path.startsWith('/api/')
    ? path
    : `${V1}${path.startsWith('/') ? path : `/${path}`}`
  const res = await fetchWithRetry(`${BASE_URL}${normalizedPath}`, options)
  return res.json()
}

export const httpEventsApi: EventsApi = {
  getBrowseEvents: async (params = {}) => {
    try {
      const query = new URLSearchParams()
      if (params.limit !== undefined) query.set('limit', String(params.limit))
      if (params.offset !== undefined) query.set('offset', String(params.offset))
      if (params.q) query.set('q', params.q)
      if (params.city) query.set('city', params.city)
      if (params.category) query.set('category', params.category)
      if (params.source) query.set('source', params.source)
      if (params.free !== undefined) query.set('free', String(params.free))
      if (params.online !== undefined) query.set('online', String(params.online))
      if (params.date_range) query.set('date_range', params.date_range)
      const qs = query.toString()
      const res = await requestJson<EventBrowseResponse>(`${V1}/events${qs ? `?${qs}` : ''}`)
      if (res && res.items && res.items.length > 0) {
        const hasScraped = res.items.some(
          (e) => e.provider === 'eventbrite' || e.provider === 'meetup' || e.provider === 'luma'
        )
        if (hasScraped) return res
        if (mockEventsApi.getBrowseEvents) {
          const mockRes = await mockEventsApi.getBrowseEvents(params)
          const mockScraped = (mockRes.items || []).filter(
            (e) => e.provider === 'eventbrite' || e.provider === 'meetup' || e.provider === 'luma'
          )
          return {
            total: res.total + mockScraped.length,
            items: [...res.items, ...mockScraped],
            next_offset: res.next_offset,
          }
        }
        return res
      }
      if (mockEventsApi.getBrowseEvents) {
        return mockEventsApi.getBrowseEvents(params)
      }
      return { total: 0, items: [], next_offset: null }
    } catch {
      if (mockEventsApi.getBrowseEvents) {
        return mockEventsApi.getBrowseEvents(params)
      }
      return { total: 0, items: [], next_offset: null }
    }
  },


  getEvents: async (filter) => {
    try {
      const query = new URLSearchParams()
      if (filter?.category) query.set('category', filter.category)
      if (filter?.search) query.set('q', filter.search)
      if (filter?.limit) query.set('limit', String(filter.limit))
      if (filter?.dateFilter && filter.dateFilter !== 'all') {
        query.set('date_range', filter.dateFilter === 'weekend' ? 'week' : filter.dateFilter)
      }
      if (filter?.free !== undefined) query.set('free', String(filter.free))
      if (filter?.city) query.set('city', filter.city)
      if (filter?.source) query.set('source', filter.source)
      if (filter?.online !== undefined) query.set('online', String(filter.online))
      if (filter?.cursor) query.set('offset', filter.cursor)
      const qs = query.toString()
      const browseRes = await requestJson<EventBrowseResponse>(`${V1}/events${qs ? `?${qs}` : ''}`)
      const items = (browseRes.items || []).map(normalizeBackendEvent)
      for (const e of browseRes.items || []) {
        if (e.id && e.slug) registerEventSlugMapping(e.id, e.slug)
      }
      const hasScraped = items.some(
        (e) => e.provider === 'eventbrite' || e.provider === 'meetup' || e.provider === 'luma'
      )
      if (items.length > 0 && hasScraped) {
        return {
          items,
          nextCursor: browseRes.next_offset ? String(browseRes.next_offset) : undefined,
          totalCount: browseRes.total || items.length,
        }
      }
      const mockResult = await mockEventsApi.getEvents(filter)
      if (items.length > 0) {
        const mockScraped = mockResult.items.filter(
          (e) => e.provider === 'eventbrite' || e.provider === 'meetup' || e.provider === 'luma'
        )
        const combined = [...items, ...mockScraped]
        return {
          items: combined,
          nextCursor: browseRes.next_offset ? String(browseRes.next_offset) : undefined,
          totalCount: combined.length,
        }
      }
      return mockResult
    } catch {
      return mockEventsApi.getEvents(filter)
    }
  },

  getEventBySlug: async (slug: string) => {
    try {
      const event = await requestJson<EventRead | VisibleEventRead>(`${V1}/events/${slug}`)
      return normalizeBackendEvent(event)
    } catch (error) {
      if ((error as ApiError).code === 'HTTP_404' || (error as ApiError).code === 'NOT_FOUND') {
        return mockEventsApi.getEventBySlug(slug)
      }
      return mockEventsApi.getEventBySlug(slug)
    }
  },

  getEventById: async (id: string) => {
    try {
      const event = await requestJson<EventRead | VisibleEventRead>(`${V1}/events/${id}`)
      return normalizeBackendEvent(event)
    } catch (error) {
      if ((error as ApiError).code === 'HTTP_404' || (error as ApiError).code === 'NOT_FOUND') {
        return mockEventsApi.getEventById(id)
      }
      return mockEventsApi.getEventById(id)
    }
  },

  getUpcomingRail: async () => {
    try {
      const res = await requestJson<EventBrowseResponse>(`${V1}/events?limit=8&date_range=week`)
      const items = (res.items || []).map(normalizeBackendEvent)
      return items.length > 0 ? items : mockEventsApi.getUpcomingRail()
    } catch {
      return mockEventsApi.getUpcomingRail()
    }
  },

  getFeaturedEvents: async () => {
    try {
      const res = await requestJson<EventBrowseResponse>(`${V1}/events?limit=5`)
      const items = (res.items || []).map(normalizeBackendEvent)
      return items.length > 0 ? items : mockEventsApi.getFeaturedEvents()
    } catch {
      return mockEventsApi.getFeaturedEvents()
    }
  },

  getSimilarEvents: async (id: string, category: string) => {
    try {
      const res = await requestJson<EventBrowseResponse>(
        `${V1}/events?category=${encodeURIComponent(category)}&limit=4`
      )
      const items = (res.items || []).map(normalizeBackendEvent)
      return items.length > 0 ? items : mockEventsApi.getSimilarEvents(id, category)
    } catch {
      return mockEventsApi.getSimilarEvents(id, category)
    }
  },

  listPromoted: async () => {
    try {
      const res = await requestJson<EventBrowseResponse>(`${V1}/events?limit=5`)
      const items = (res.items || []).map(normalizeBackendEvent)
      return items.length > 0 ? items : mockEventsApi.listPromoted()
    } catch {
      return mockEventsApi.listPromoted()
    }
  },

  listNewest: async (params = {}) => {
    try {
      const query = new URLSearchParams()
      if (params.limit) query.set('limit', String(params.limit))
      if (params.cursor) query.set('offset', params.cursor)
      const res = await requestJson<EventBrowseResponse>(
        `${V1}/events${query.toString() ? `?${query.toString()}` : ''}`
      )
      const items = (res.items || []).map(normalizeBackendEvent)
      return {
        items,
        nextCursor: res.next_offset ? String(res.next_offset) : undefined,
        totalCount: res.total || items.length,
      }
    } catch {
      return mockEventsApi.listNewest(params)
    }
  },


  list: async (params = {}) => {
    try {
      const query = new URLSearchParams()
      if (params.category && params.category !== 'all') query.set('category', params.category)
      if (params.q) query.set('q', params.q)
      if (params.free !== undefined) query.set('free', String(params.free))
      if (params.date && params.date !== 'all') query.set('date_range', params.date)
      if (params.limit) query.set('limit', String(params.limit))
      if (params.cursor) query.set('offset', params.cursor)
      const res = await requestJson<EventBrowseResponse>(
        `${V1}/events${query.toString() ? `?${query.toString()}` : ''}`
      )
      const items = (res.items || []).map(normalizeBackendEvent)
      if (items.length > 0) {
        const hasScraped = items.some(
          (e) => e.provider === 'eventbrite' || e.provider === 'meetup' || e.provider === 'luma'
        )
        if (hasScraped) {
          return {
            items,
            nextCursor: res.next_offset ? String(res.next_offset) : undefined,
            totalCount: res.total || items.length,
          }
        }
        const mockRes = await mockEventsApi.list(params)
        const mockScraped = mockRes.items.filter(
          (e) => e.provider === 'eventbrite' || e.provider === 'meetup' || e.provider === 'luma'
        )
        const combined = [...items, ...mockScraped]
        return {
          items: combined,
          nextCursor: res.next_offset ? String(res.next_offset) : undefined,
          totalCount: combined.length,
        }
      }
      return mockEventsApi.list(params)
    } catch {
      return mockEventsApi.list(params)
    }
  },
}

async function resolveTargetOrgSlug(hint?: string): Promise<string> {
  let userManagedOrgs: OrganizationRead[] = []
  try {
    const orgs = await requestJson<OrganizationRead[]>(`${V1}/organizations`)
    if (orgs && orgs.length > 0) {
      userManagedOrgs = orgs
    }
  } catch {}

  if (hint && hint !== 'org-1' && hint !== 'current') {
    const matched = userManagedOrgs.find(
      (o) => o.slug === hint || o.id === hint || o.name.toLowerCase() === hint.toLowerCase()
    )
    if (matched) return matched.slug
    if (userManagedOrgs.length > 0) {
      return userManagedOrgs[0].slug
    }
    return hint
  }

  if (userManagedOrgs.length > 0) {
    const club = userManagedOrgs.find((o) => o.type === 'club')
    return club ? club.slug : userManagedOrgs[0].slug
  }

  return 'apex-design-lab'
}

const eventIdToSlugMap = new Map<string, string>()

export function registerEventSlugMapping(idOrSlug: string, slug: string) {
  if (idOrSlug && slug) {
    eventIdToSlugMap.set(idOrSlug, slug)
    eventIdToSlugMap.set(slug, slug)
  }
}

async function resolveEventSlug(eventIdOrSlug?: string): Promise<string> {
  if (!eventIdOrSlug || eventIdOrSlug === 'current') {
    return 'neuro-design-symposium-2026'
  }
  if (eventIdToSlugMap.has(eventIdOrSlug)) {
    return eventIdToSlugMap.get(eventIdOrSlug)!
  }
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(eventIdOrSlug)
  if (!isUuid) {
    registerEventSlugMapping(eventIdOrSlug, eventIdOrSlug)
    return eventIdOrSlug
  }
  try {
    const res = await requestJson<EventRead>(`${V1}/events/${eventIdOrSlug}`)
    if (res?.slug) {
      registerEventSlugMapping(eventIdOrSlug, res.slug)
      return res.slug
    }
  } catch {}
  try {
    const browse = await requestJson<EventBrowseResponse>(`${V1}/events?limit=100`)
    for (const e of browse?.items || []) {
      if (e.id && e.slug) registerEventSlugMapping(e.id, e.slug)
    }
    if (eventIdToSlugMap.has(eventIdOrSlug)) {
      return eventIdToSlugMap.get(eventIdOrSlug)!
    }
  } catch {}
  return eventIdOrSlug
}

export const httpEventsAdminApi: EventsAdminApi = {
  getOrganizationEvents: async (slug: string) => {
    const s = await resolveTargetOrgSlug(slug)
    const items = await requestJson<EventRead[]>(`${V1}/organizations/${s}/events`)
    for (const e of items || []) {
      if (e.id && e.slug) registerEventSlugMapping(e.id, e.slug)
    }
    return items
  },

  createOrgEvent: (slug: string, event: any) =>
    requestJson<EventRead>(`${V1}/organizations/${slug}/events`, {
      method: 'POST',
      body: JSON.stringify(event),
    }),

  updateOrgEvent: (slug: string, eventId: string, updates: any) =>
    requestJson<EventRead>(`${V1}/organizations/${slug}/events/${eventId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    }),

  deleteOrgEvent: (slug: string, eventId: string) =>
    requestJson<void>(`${V1}/organizations/${slug}/events/${eventId}`, { method: 'DELETE' }),

  eventLifecycleAction: (slug: string, eventId: string, action: string) =>
    requestJson<EventRead>(`${V1}/organizations/${slug}/events/${eventId}/${action}`, {
      method: 'POST',
    }),

  getAdminEvents: async (scope) => {
    const s = await resolveTargetOrgSlug(scope.clubId || scope.orgId)
    const items = await requestJson<EventRead[]>(`${V1}/organizations/${s}/events`)
    for (const e of items || []) {
      if (e.id && e.slug) registerEventSlugMapping(e.id, e.slug)
    }
    return (items || []).map(normalizeBackendEvent)
  },

  createEvent: async (event: any) => {
    const s = await resolveTargetOrgSlug(event.orgSlug || event.orgId || event.clubId || event.organizerId)
    const startIso = event.startsAt || event.date || new Date(Date.now() + 86400000).toISOString()
    const endIso = event.endsAt || new Date(Date.now() + 86400000 + 3 * 3600000).toISOString()

    const rawType = (event.event_type || event.type || '').toLowerCase()
    const validEventType = ['online', 'offline', 'hybrid'].includes(rawType)
      ? rawType
      : (event.venue?.name?.toLowerCase().includes('online') || event.venue?.name?.toLowerCase().includes('zoom'))
      ? 'online'
      : 'offline'

    const created = await requestJson<EventRead>(`${V1}/organizations/${s}/events`, {
      method: 'POST',
      body: JSON.stringify({
        title: event.title || 'Untitled Event',
        description: event.description || '',
        audience_type: event.eligibility?.toLowerCase().includes('institution') ? 'institution_only' : 'public',
        event_type: validEventType,
        start_time: startIso,
        end_time: endIso,
        city: event.city || event.venue?.name || 'Bengaluru',
        venue_name: event.venue?.name || 'Main Hall',
        venue_address: event.venue?.address || '',
        is_free: event.isFree !== false && (!event.price || event.price === 0),
        price_cents: event.price ? Math.round(event.price * 100) : 0,
        currency: 'INR',
        capacity: event.capacity ?? null,
        registration_required: true,
      }),
    })
    return normalizeBackendEvent(created)
  },

  updateEvent: async (id, updates: any) => {
    const s = await resolveTargetOrgSlug(updates.orgSlug || updates.orgId || updates.clubId || updates.organizerId)
    const bodyUpdates: any = { ...updates }
    if (updates.type || updates.event_type) {
      const rawType = (updates.event_type || updates.type || '').toLowerCase()
      bodyUpdates.event_type = ['online', 'offline', 'hybrid'].includes(rawType)
        ? rawType
        : 'offline'
    }
    const updated = await requestJson<EventRead>(`${V1}/organizations/${s}/events/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(bodyUpdates),
    })
    return normalizeBackendEvent(updated)
  },

  deleteEvent: async (id) => {
    const s = await resolveTargetOrgSlug()
    return requestJson<void>(`${V1}/organizations/${s}/events/${id}`, { method: 'DELETE' })
  },

  publishEvent: async (id) => {
    const s = await resolveTargetOrgSlug()
    try {
      const submitted = await requestJson<EventRead>(`${V1}/organizations/${s}/events/${id}/submit`, { method: 'POST' })
      if (submitted && (submitted.status === 'published' || (submitted as any).status === 'published')) {
        return normalizeBackendEvent(submitted)
      }
    } catch (err: any) {
      if (err?.code === 'HTTP_409' || err?.message?.includes('published')) {
        const current = await requestJson<EventRead>(`${V1}/organizations/${s}/events/${id}`).catch(() => null)
        if (current) return normalizeBackendEvent(current)
      }
    }

    try {
      const published = await requestJson<EventRead>(`${V1}/organizations/${s}/events/${id}/publish`, { method: 'POST' })
      return normalizeBackendEvent(published)
    } catch (err: any) {
      if (err?.code === 'HTTP_409' || err?.message?.includes('published')) {
        const current = await requestJson<EventRead>(`${V1}/organizations/${s}/events/${id}`).catch(() => null)
        if (current) return normalizeBackendEvent(current)
      }
      throw err
    }
  },

  submitForApproval: async (id) => {
    const s = await resolveTargetOrgSlug()
    const submitted = await requestJson<EventRead>(`${V1}/organizations/${s}/events/${id}/submit`, { method: 'POST' })
    return normalizeBackendEvent(submitted)
  },

  approveEvent: async (id) => {
    const s = await resolveTargetOrgSlug()
    const published = await requestJson<EventRead>(`${V1}/organizations/${s}/events/${id}/publish`, { method: 'POST' })
    return normalizeBackendEvent(published)
  },

  cancelEvent: async (id) => {
    const s = await resolveTargetOrgSlug()
    const cancelled = await requestJson<EventRead>(`${V1}/organizations/${s}/events/${id}/cancel`, { method: 'POST' })
    return normalizeBackendEvent(cancelled)
  },

  archiveEvent: async (id) => {
    const s = await resolveTargetOrgSlug()
    const archived = await requestJson<EventRead>(`${V1}/organizations/${s}/events/${id}/archive`, { method: 'POST' })
    return normalizeBackendEvent(archived)
  },
}

export const httpFormsApi: FormsApi = {
  getFormSchema: (eventId) => requestJson(`/events/${eventId}/form`),
  updateFormSchema: (eventId, schema) =>
    requestJson(`/admin/events/${eventId}/form`, {
      method: 'PUT',
      body: JSON.stringify({ schema }),
    }),
}

export const httpRegistrationsApi: RegistrationsApi = {
  registerPass: (eventSlug: string) =>
    requestJson<RegistrationRead>(`${V1}/events/${eventSlug}/register`, {
      method: 'POST',
    }),

  cancelRegistration: (eventSlug: string) =>
    requestJson<void>(`${V1}/events/${eventSlug}/register`, {
      method: 'DELETE',
    }),

  getEventAttendees: (eventSlug: string) =>
    requestJson<AttendeeRead[]>(`${V1}/events/${eventSlug}/registrations`),

  lookupTeam: (eventSlug: string, teamCode: string) =>
    requestJson<TeamLookupResult>(`${V1}/events/${eventSlug}/teams/${encodeURIComponent(teamCode)}`),

  register: async (payload) => {
    // 1-tap pass registration directly with event slug or id
    const raw = payload.eventSlug || (payload as any).slug || payload.eventId
    const slug = await resolveEventSlug(raw)
    const answers = (payload as any).formAnswers || payload.answers || {}
    const bodyPayload = payload.team
      ? { form_answers: { ...answers, team: payload.team } }
      : Object.keys(answers).length > 0
      ? { form_answers: answers }
      : undefined

    const read = await requestJson<RegistrationRead>(`${V1}/events/${slug}/register`, {
      method: 'POST',
      body: bodyPayload ? JSON.stringify(bodyPayload) : undefined,
    })
    return normalizeBackendRegistration(read)
  },

  getRegistrations: async (filter) => {
    if (filter.eventId) {
      const slug = await resolveEventSlug(filter.eventId)
      const attendees = await requestJson<AttendeeRead[]>(`${V1}/events/${slug}/registrations`)
      return (attendees || []).map((a, i) =>
        normalizeBackendRegistration({
          id: a.registration_id || (a as any).id || `att-${i}`,
          native_event_id: filter.eventId,
          user_id: a.user_id,
          email: a.email,
          display_name: a.display_name,
          first_name: a.first_name,
          last_name: a.last_name,
          qr_ticket_code: a.qr_ticket_code,
          ticketCode: a.qr_ticket_code || (a as any).ticket_code || a.student_id || `PASS-${(a.user_id || '').slice(0, 6)}`,
          status: a.status,
          checked_in_at: a.checked_in_at,
          created_at: a.created_at,
        })
      )
    }
    const regs = await requestJson<RegistrationRead[]>(`${V1}/registrations`)
    return (regs || []).map(normalizeBackendRegistration)
  },

  updateStatus: (id, status) =>
    requestJson(`/admin/registrations/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  getMyRegistrations: async () => {
    const list = await requestJson<RegistrationRead[]>(`${V1}/registrations`)
    const registrations = (list || []).map(normalizeBackendRegistration)

    // Fallback: If any registration still lacks eventTitle or startsAt, query events list or events by ID
    try {
      const needsHydration = registrations.filter(
        (r) => !r.eventTitle || r.eventTitle === 'Event Pass' || !r.eventStartsAt
      )
      if (needsHydration.length > 0) {
        const browseRes = await requestJson<EventBrowseResponse>(`${V1}/events?limit=50`).catch(() => null)
        const eventsMap = new Map<string, any>()
        for (const e of browseRes?.items || []) {
          if (e.id) eventsMap.set(String(e.id), e)
          if (e.slug) eventsMap.set(String(e.slug), e)
        }

        await Promise.all(
          needsHydration.map(async (reg) => {
            let match = eventsMap.get(String(reg.eventId)) || eventsMap.get(String(reg.eventSlug))
            if (!match && reg.eventId) {
              match = await requestJson<any>(`${V1}/events/${reg.eventId}`).catch(() => null)
            }
            if (match) {
              if (!reg.eventTitle || reg.eventTitle === 'Event Pass') {
                reg.eventTitle = match.title || reg.eventTitle
              }
              if (!reg.eventSlug) reg.eventSlug = match.slug || reg.eventSlug
              if (!reg.eventStartsAt) reg.eventStartsAt = match.start_time || match.startsAt
              if (!reg.venueName || reg.venueName === 'Main Campus Venue') {
                reg.venueName = match.venue_name || match.venue?.name || reg.venueName
              }
              if (!reg.organizerName || reg.organizerName === 'Campus Host' || reg.organizerName === 'Event Host') {
                reg.organizerName = match.organization?.name || match.clubName || reg.organizerName
              }
              if (!reg.tierName) {
                reg.tierName = match.event_type || match.type || 'GENERAL'
              }
            }
          })
        )
      }
    } catch {}

    return registrations
  },

  getMyEvents: async () => {
    try {
      const res = await requestJson<{
        upcoming: EventRead[]
        ongoing: EventRead[]
        previous: EventRead[]
        past?: EventRead[]
      }>(`${V1}/users/me/events`)
      for (const list of [res.upcoming, res.ongoing, res.previous, res.past]) {
        for (const e of list || []) {
          if (e.id && e.slug) registerEventSlugMapping(e.id, e.slug)
        }
      }
      return {
        upcoming: (res.upcoming || []).map(normalizeBackendEvent),
        ongoing: (res.ongoing || []).map(normalizeBackendEvent),
        previous: (res.previous || []).map(normalizeBackendEvent),
        past: (res.past || []).map(normalizeBackendEvent),
      }
    } catch {
      return { upcoming: [], ongoing: [], previous: [], past: [] }
    }
  },
}

export const httpCheckinApi: CheckinApi = {
  checkinTicket: async (ticketCode, eventId) => {
    try {
      const slug = await resolveEventSlug(eventId)
      const res = await requestJson<{
        status: string
        message: string
        registration_id: string
        ticket_code: string
        checked_in_at: string
        attendee?: any
      }>(`${V1}/events/${slug}/check-in`, {
        method: 'POST',
        body: JSON.stringify({ ticket_code: ticketCode }),
      })
      const reg = res.attendee
        ? normalizeBackendRegistration({
            id: res.registration_id || res.attendee.registration_id,
            native_event_id: eventId,
            user_id: res.attendee.user_id,
            email: res.attendee.email,
            display_name: res.attendee.display_name,
            first_name: res.attendee.first_name,
            last_name: res.attendee.last_name,
            qr_ticket_code: res.ticket_code || res.attendee.qr_ticket_code,
            status: res.attendee.status || 'checked_in',
            created_at: res.attendee.created_at,
            checkedInAt: res.checked_in_at,
          })
        : undefined
      return {
        success: res.status === 'checked_in',
        registration: reg,
        message: res.message || 'Checked in successfully',
        admittedAt: res.checked_in_at,
        alreadyAdmitted: false,
      }
    } catch (err: any) {
      return {
        success: false,
        message: err.detail || err.message || 'Check-in failed.',
        alreadyAdmitted: err.status === 409 || err.message?.includes('already'),
      }
    }
  },
  undoCheckin: async (registrationId, eventId) => {
    try {
      const slug = await resolveEventSlug(eventId)
      await requestJson(`${V1}/events/${slug}/registrations/${registrationId}/toggle-check-in`, { method: 'POST' })
      return true
    } catch {
      return false
    }
  },
  getCheckinStats: async (eventId) => {
    try {
      const slug = await resolveEventSlug(eventId)
      const stats = await requestJson<{
        total_registered: number
        total_checked_in: number
        check_in_rate: number
      }>(`${V1}/events/${slug}/attendance-stats`)
      return {
        totalRegistered: stats.total_registered || 0,
        totalCheckedIn: stats.total_checked_in || 0,
        percentage: Math.round((stats.check_in_rate || 0) * 100),
      }
    } catch {
      return { totalRegistered: 0, totalCheckedIn: 0, percentage: 0 }
    }
  },
}

export const httpCertificatesApi: CertificatesApi = {
  getCertificates: (filter) =>
    requestJson(`/admin/certificates?eventId=${filter.eventId || ''}`),
  getMyCertificates: () => requestJson('/me/certificates'),
  generateCertificates: (eventId, recipientIds, templateId) =>
    requestJson(`/admin/events/${eventId}/certificates/generate`, {
      method: 'POST',
      body: JSON.stringify({ recipientIds, templateId }),
    }),
  verifyCertificate: (certificateId) =>
    requestJson(`/verify/${certificateId}`),
}

export const httpAnnouncementsApi: AnnouncementsApi = {
  getAnnouncements: (filter) => {
    const params = new URLSearchParams()
    if (filter?.organizerId) params.set('clubId', filter.organizerId)
    if (filter?.kind) params.set('kind', filter.kind)
    return requestJson(`/announcements?${params.toString()}`)
  },
  createAnnouncement: (ann) =>
    requestJson('/admin/announcements', {
      method: 'POST',
      body: JSON.stringify(ann),
    }),
  deleteAnnouncement: (id) =>
    requestJson(`/admin/announcements/${id}`, { method: 'DELETE' }),
}

export const httpNotificationsApi: NotificationsApi = {
  getNotifications: (filter) =>
    requestJson(`/admin/notifications?clubId=${filter?.clubId || ''}`),
  sendNotification: (notif) =>
    requestJson('/admin/notifications', {
      method: 'POST',
      body: JSON.stringify(notif),
    }),
  getMyNotifications: async () => {
    try {
      const res = await requestJson<InAppNotificationListResponse>(`${V1}/notifications`)
      return (res.items || []).map((n) => ({
        id: n.id,
        orgId: n.organization_id || 'org-1',
        title: n.title,
        body: n.message,
        audience: { type: 'all' as const },
        includes: { poster: false, registrationLink: false, contact: false },
        channel: 'inapp' as const,
        sentAt: n.created_at,
        sentBy: 'System',
        read: n.is_read,
        stats: { recipientsCount: 1, deliveredCount: 1, openedCount: n.is_read ? 1 : 0 },
      }))
    } catch {
      return []
    }
  },
  getInAppNotifications: (unreadOnly) =>
    requestJson<InAppNotificationListResponse>(
      `${V1}/notifications${unreadOnly ? '?unread_only=true' : ''}`
    ),
  getUnreadCount: async () => {
    try {
      const res = await requestJson<{ unread_count?: number; total_unread?: number }>(
        `${V1}/notifications/unread-count`
      )
      return res.unread_count ?? res.total_unread ?? 0
    } catch {
      return 0
    }
  },
  markNotificationRead: async (id) => {
    try {
      await requestJson(`${V1}/notifications/${id}/read`, { method: 'POST' })
      return true
    } catch {
      return false
    }
  },
  markAllNotificationsRead: async () => {
    try {
      await requestJson(`${V1}/notifications/read-all`, { method: 'POST' })
      return true
    } catch {
      return false
    }
  },
}

export const httpPaymentsApi: PaymentsApi = {
  getFeeQuote: (baseAmountCents: number) =>
    requestJson<FeeQuote>(`${V1}/payments/quote`, {
      method: 'POST',
      body: JSON.stringify({ base_amount_cents: baseAmountCents }),
    }),

  createOrder: (payload: OrderCreateRequest) => {
    const rawType = String(payload.type || 'EVENT_REGISTRATION')
    const type = rawType.toUpperCase() as any
    return requestJson<OrderCreateResponse>(`${V1}/payments/orders`, {
      method: 'POST',
      body: JSON.stringify({ ...payload, type }),
    })
  },

  getOrderStatus: (orderId: string) =>
    requestJson<PaymentStatusResponse>(`${V1}/payments/orders/${orderId}`),

  refundOrder: (orderId: string, payload?: RefundOrderRequest) =>
    requestJson<RefundOrderResponse>(`${V1}/payments/orders/${orderId}/refund`, {
      method: 'POST',
      body: JSON.stringify(payload || {}),
    }),
}

export const httpPayoutsApi: PayoutsApi = {
  getPayoutAccount: async (orgSlug: string) => {
    const slug = await resolveTargetOrgSlug(orgSlug)
    try {
      return await requestJson<PayoutAccount>(`${V1}/organizations/${slug}/payout-account`)
    } catch (err: any) {
      if (err?.code === 'HTTP_404' || err?.status === 404) return null
      throw err
    }
  },

  registerPayoutAccount: async (orgSlug: string, payload: PayoutAccountCreate) => {
    const slug = await resolveTargetOrgSlug(orgSlug)
    return requestJson<PayoutAccount>(`${V1}/organizations/${slug}/payout-account`, {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },

  listSettlements: async (orgSlug: string) => {
    const slug = await resolveTargetOrgSlug(orgSlug)
    try {
      return await requestJson<SettlementRecord[]>(`${V1}/organizations/${slug}/settlements`)
    } catch {
      return []
    }
  },

  getPayoutBalance: async (orgSlug: string) => {
    const slug = await resolveTargetOrgSlug(orgSlug)
    return requestJson<OrganizationBalance>(`${V1}/organizations/${slug}/withdrawals/balance`)
  },

  listWithdrawals: async (orgSlug: string) => {
    const slug = await resolveTargetOrgSlug(orgSlug)
    try {
      return await requestJson<WithdrawalRequest[]>(`${V1}/organizations/${slug}/withdrawals`)
    } catch {
      return []
    }
  },

  requestWithdrawal: async (orgSlug: string, payload: WithdrawalRequestCreate) => {
    const slug = await resolveTargetOrgSlug(orgSlug)
    return requestJson<WithdrawalRequest>(`${V1}/organizations/${slug}/withdrawals`, {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },

  getEarningsSummary: async (orgSlug: string) => {
    const slug = await resolveTargetOrgSlug(orgSlug)
    return requestJson<OrganizerEarningsSummary>(`${V1}/organizations/${slug}/earnings-summary`)
  },

  adminListWithdrawals: async (status?: string, limit: number = 50, offset: number = 0) => {
    const q = new URLSearchParams()
    if (status && status !== 'ALL') q.set('status', status)
    q.set('limit', String(limit))
    q.set('offset', String(offset))
    try {
      return await requestJson<WithdrawalRequest[]>(`${V1}/admin/withdrawals?${q.toString()}`)
    } catch {
      return []
    }
  },

  adminReviewWithdrawal: async (withdrawalId: string, payload: AdminWithdrawalReviewPayload) => {
    return requestJson<WithdrawalRequest>(`${V1}/admin/withdrawals/${withdrawalId}/review`, {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },
}

export const httpOrganizationsApi: OrganizationsApi = {
  getInstitutions: () => requestJson<OrganizationRead[]>(`${V1}/institutions`),
  getOrganizations: () => requestJson<OrganizationRead[]>(`${V1}/organizations`),
  getOrganizationBySlug: (slug: string) =>
    requestJson<OrganizationRead>(`${V1}/organizations/${slug}`),
  createOrganization: (payload: CreateOrgPayload) =>
    requestJson<OrganizationRead>(`${V1}/organizations`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  getSubOrganizations: (slug: string) =>
    requestJson<OrganizationRead[]>(`${V1}/organizations/${slug}/sub-organizations`),
  createSubOrganization: (slug: string, payload: CreateSubOrgPayload) =>
    requestJson<OrganizationRead>(`${V1}/organizations/${slug}/sub-organizations`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  getClubs: (slug: string) =>
    requestJson<OrganizationRead[]>(`${V1}/organizations/${slug}/clubs`),
  createClub: (slug: string, payload: CreateClubPayload) =>
    requestJson<OrganizationRead>(`${V1}/organizations/${slug}/clubs`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  getMembers: (slug: string) =>
    requestJson<MemberRead[]>(`${V1}/organizations/${slug}/members`),
  addMember: (slug: string, payload) =>
    requestJson<MemberRead>(`${V1}/organizations/${slug}/members`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  removeMember: (slug: string, userId: string) =>
    requestJson<void>(`${V1}/organizations/${slug}/members/${userId}`, {
      method: 'DELETE',
    }),
  getOrganization: (idOrSlug) =>
    requestJson<any>(`${V1}/organizations/${idOrSlug || 'current'}`),
  updateOrganization: (id, updates) =>
    requestJson<any>(`${V1}/organizations/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    }),

  // Staff Invitations
  listInvitations: (slug: string) =>
    requestJson<InvitationRead[]>(`${V1}/organizations/${slug}/invitations`),

  createInvitation: (slug: string, payload: InvitationCreate) =>
    requestJson<InvitationCreatedResponse>(`${V1}/organizations/${slug}/invitations`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  revokeInvitation: (slug: string, invitationId: string) =>
    requestJson<InvitationRead>(`${V1}/organizations/${slug}/invitations/${invitationId}`, {
      method: 'DELETE',
    }),

  acceptInvitation: (token: string) =>
    requestJson<InvitationRead>(`${V1}/organizations/invitations/accept`, {
      method: 'POST',
      body: JSON.stringify({ token }),
    }),

  // Organization Proposals
  createProposal: (parentSlug: string, payload: ProposalCreate) =>
    requestJson<ProposalRead>(`${V1}/organizations/${parentSlug}/proposals`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  listMyProposals: () =>
    requestJson<ProposalRead[]>(`${V1}/organizations/my-proposals`),

  listOrgProposals: (slug: string) =>
    requestJson<ProposalRead[]>(`${V1}/organizations/${slug}/proposals`),

  reviewProposal: (proposalId: string, review: ProposalReview) =>
    requestJson<ProposalRead>(`${V1}/organizations/proposals/${proposalId}/review`, {
      method: 'POST',
      body: JSON.stringify(review),
    }),

  // Platform SuperAdmin
  getPlatformOverview: () => requestJson<PlatformOverview>(`${V1}/admin/overview`),

  getInstitutionCandidates: () =>
    requestJson<InstitutionCandidate[]>(`${V1}/admin/institutions`),

  verifyInstitution: (slug: string, domains: string[]) =>
    requestJson<InstitutionCandidate>(`${V1}/admin/institutions/${slug}/verify`, {
      method: 'POST',
      body: JSON.stringify({ domains }),
    }),

  rejectInstitution: (slug: string, reason?: string) =>
    requestJson<InstitutionCandidate>(`${V1}/admin/institutions/${slug}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    }),

  revokeInstitution: (slug: string, reason?: string) =>
    requestJson<InstitutionCandidate>(`${V1}/admin/institutions/${slug}/revoke`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    }),

  getPlatformOrganizations: (status?: string) => {
    const q = status && status !== 'ALL' ? `?status=${encodeURIComponent(status)}` : ''
    return requestJson<PlatformOrganizationItem[]>(`${V1}/admin/organizations${q}`)
  },

  listPlatformProposals: (status?: string) => {
    const q = status && status !== 'ALL' ? `?status=${encodeURIComponent(status)}` : ''
    return requestJson<ProposalRead[]>(`${V1}/admin/proposals${q}`)
  },

  reviewPlatformProposal: (proposalId: string, review: ProposalReview) =>
    requestJson<ProposalRead>(`${V1}/admin/proposals/${proposalId}/review`, {
      method: 'POST',
      body: JSON.stringify(review),
    }),
}

export const httpClubsApi: ClubsApi = {
  getClubs: async () => {
    const token = getAuthToken()
    if (token) {
      try {
        const orgs = await requestJson<OrganizationRead[]>(`${V1}/organizations`)
        if (orgs && orgs.length > 0) {
          return orgs.map(normalizeBackendOrganization)
        }
      } catch {}
    }

    try {
      const institutions = await requestJson<OrganizationRead[]>(`${V1}/institutions`)
      const list: OrganizationRead[] = []
      for (const inst of institutions) {
        list.push(inst)
        try {
          const childClubs = await requestJson<OrganizationRead[]>(`${V1}/organizations/${inst.slug}/clubs`)
          list.push(...childClubs)
        } catch {}
      }
      if (list.length > 0) {
        return list.map(normalizeBackendOrganization)
      }
    } catch {}
    return []
  },
  getClubBySlug: async (slug: string) => {
    try {
      const org = await requestJson<OrganizationRead>(`${V1}/organizations/${slug}`)
      return normalizeBackendOrganization(org)
    } catch {
      return null as any
    }
  },
  getClubById: async (id: string) => {
    try {
      const org = await requestJson<OrganizationRead>(`${V1}/organizations/${id}`)
      return normalizeBackendOrganization(org)
    } catch {
      return null as any
    }
  },
  updateClub: async (id: string, updates: any) => {
    const updated = await requestJson<OrganizationRead>(`${V1}/organizations/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    })
    return normalizeBackendOrganization(updated)
  },
  toggleFollow: async (id: string) => {
    const key = `followed_club_${id}`
    const cur = localStorage.getItem(key) === 'true'
    localStorage.setItem(key, String(!cur))
    return !cur
  },
}

export const httpGalleryApi: GalleryApi = {
  getGallery: (clubId) => requestJson(`/gallery?clubId=${clubId || ''}`),
  addGalleryItem: (item) =>
    requestJson('/admin/gallery', {
      method: 'POST',
      body: JSON.stringify(item),
    }),
  removeGalleryItem: (id) =>
    requestJson(`/admin/gallery/${id}`, { method: 'DELETE' }),
}

export const httpAnalyticsApi: AnalyticsApi = {
  getStats: (scope) =>
    requestJson(`/admin/analytics?clubId=${scope.clubId || ''}`),
}

export const httpAuditApi: AuditApi = {
  getAuditLogs: (scope) =>
    requestJson(`/admin/audit?clubId=${scope?.clubId || ''}`),

  getPlatformAuditLogs: (params) => {
    const q = new URLSearchParams()
    if (params?.limit) q.set('limit', String(params.limit))
    if (params?.offset) q.set('offset', String(params.offset))
    if (params?.entityType && params.entityType !== 'ALL') q.set('entity_type', params.entityType)
    return requestJson<PlatformAuditLog[]>(`${V1}/admin/audit-logs?${q.toString()}`)
  },
}

export const httpUsersRolesApi: UsersRolesApi = {
  getUsers: async (orgId) => {
    try {
      const slug = await resolveTargetOrgSlug(orgId)
      const members = await requestJson<MemberRead[]>(`${V1}/organizations/${slug}/members`)
      return (members || []).map((m) => ({
        id: m.user_id,
        name: m.display_name || m.email?.split('@')[0] || `Member ${m.user_id.slice(0, 6)}`,
        email: m.email || `${m.user_id}@apex.edu`,
        role: m.role,
        clubId: slug,
        clubName: slug,
      }))
    } catch {
      return []
    }
  },
  updateRole: async (userId, role, clubId) => {
    const slug = await resolveTargetOrgSlug(clubId)
    const updated = await requestJson<MemberRead>(`${V1}/organizations/${slug}/members`, {
      method: 'POST',
      body: JSON.stringify({ email: userId, role }),
    })
    return {
      id: updated.user_id,
      name: updated.display_name || updated.email?.split('@')[0] || userId,
      email: updated.email || userId,
      role: updated.role,
      clubId: slug,
    }
  },
}

function base64UrlEncode(str: string): string {
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function bufferToBase64Url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return base64UrlEncode(binary)
}

export async function signLocalDevJwt(sub: string, email: string): Promise<string> {
  const secret = 'local-dev-jwt-secret-for-eventmesh'
  const header = { alg: 'HS256', typ: 'JWT' }
  const now = Math.floor(Date.now() / 1000)
  const payload = {
    sub,
    email,
    role: 'authenticated',
    aud: 'authenticated',
    iat: now,
    exp: now + 7 * 24 * 3600,
  }
  const enc = new TextEncoder()
  const headerStr = base64UrlEncode(JSON.stringify(header))
  const payloadStr = base64UrlEncode(JSON.stringify(payload))
  const data = enc.encode(`${headerStr}.${payloadStr}`)
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const signature = await crypto.subtle.sign('HMAC', key, data)
  const sigStr = bufferToBase64Url(signature)
  return `${headerStr}.${payloadStr}.${sigStr}`
}

export const httpAuthApi: AuthApi = {
  getProfile: () => requestJson<ProfileRead>(`${V1}/users/me`),

  updateProfile: (payload: ProfileUpdatePayload) =>
    requestJson<ProfileRead>(`${V1}/users/me`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),

  becomeOrganizer: async () => {
    try {
      const profile = await requestJson<ProfileRead>(`${V1}/users/me/become-organizer`, {
        method: 'POST',
      })
      localStorage.setItem('eventmesh_user_role', 'org_admin')
      localStorage.setItem('eventmesh_user_club_id', 'club-devcraft')
      return profile
    } catch {
      localStorage.setItem('eventmesh_user_role', 'org_admin')
      localStorage.setItem('eventmesh_user_club_id', 'club-devcraft')
      return mockAuthApi.becomeOrganizer
        ? mockAuthApi.becomeOrganizer()
        : ({ id: 'usr_me', is_organizer: true } as any)
    }
  },

  deleteAccount: () =>
    requestJson<void>(`${V1}/users/me`, {
      method: 'DELETE',
    }),

  sendOtp: (email) =>
    requestJson('/auth/otp/send', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  verifyOtp: async (email, otp) => {
    const session = await requestJson<any>('/auth/otp/verify', {
      method: 'POST',
      body: JSON.stringify({ email, otp }),
    })
    if (session.token) {
      localStorage.setItem('eventmesh_auth_token', session.token)
    }
    return session
  },

  getSession: async () => {
    let token = getAuthToken()
    try {
      const { getFreshAuthToken } = await import('@/lib/supabaseClient')
      const freshToken = await getFreshAuthToken()
      if (freshToken) token = freshToken
    } catch {}

    if (!token) return null

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 8000)
      const profile = await requestJson<ProfileRead>(`${V1}/users/me`, {
        signal: controller.signal,
      })
      clearTimeout(timeoutId)
      const session = profileToSession(profile)

      // Fallback: merge locally cached student profile info if profile fields are empty
      try {
        const saved = localStorage.getItem('eventmesh_student_profile')
        if (saved) {
          const parsed = JSON.parse(saved)
          if (!session.phone && parsed.phone) session.phone = parsed.phone
          if (!session.studentId && parsed.regNumber) {
            session.studentId = parsed.regNumber
            session.registrationNumber = parsed.regNumber
          }
          if (!session.branch && parsed.branch) {
            session.branch = parsed.branch
            session.degreeBranch = parsed.branch
          }
          if (!session.campus && parsed.collegeName) {
            session.campus = parsed.collegeName
            session.institutionName = parsed.collegeName
          }
        }
      } catch {}

      const storedRole = localStorage.getItem('eventmesh_user_role')
      if (storedRole) {
        const localRole = parseUserRole(storedRole)
        session.role = localRole
        session.clubId =
          localRole !== 'attendee'
            ? localStorage.getItem('eventmesh_user_club_id') || 'club-devcraft'
            : undefined
      }
      return session
    } catch {
      // Resilient fallback: extract authenticated identity directly from token payload
      try {
        const parts = token.split('.')
        if (parts.length === 3) {
          const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')))
          if (payload) {
            const email = payload.email || ''
            const name =
              payload.user_metadata?.full_name ||
              payload.user_metadata?.name ||
              (email ? email.split('@')[0] : 'User')
            const localRole = parseUserRole(localStorage.getItem('eventmesh_user_role'))

            let phone: string | undefined
            let regNumber: string | undefined
            let branch: string | undefined
            let campus: string | undefined
            try {
              const saved = localStorage.getItem('eventmesh_student_profile')
              if (saved) {
                const parsed = JSON.parse(saved)
                phone = parsed.phone
                regNumber = parsed.regNumber
                branch = parsed.branch
                campus = parsed.collegeName || parsed.institutionName
              }
            } catch {}

            const fallbackSession: UserSession = {
              id: payload.sub || 'usr_auth',
              name,
              email,
              role: localRole,
              clubId:
                localRole !== 'attendee'
                  ? localStorage.getItem('eventmesh_user_club_id') || 'club-devcraft'
                  : undefined,
              orgId: payload.user_metadata?.institution_name || campus || 'campus',
              avatar: payload.user_metadata?.avatar_url || payload.user_metadata?.picture,
              phone,
              studentId: regNumber,
              registrationNumber: regNumber,
              branch,
              degreeBranch: branch,
              campus,
              institutionName: campus,
            }
            return fallbackSession
          }
        }
      } catch {}
      return null
    }
  },

  logout: async () => {
    localStorage.removeItem('eventmesh_auth_token')
    localStorage.removeItem('eventmesh_user_role')
    localStorage.removeItem('eventmesh_user_club_id')
    try {
      const { supabase } = await import('@/lib/supabaseClient')
      await supabase.auth.signOut()
    } catch {}
  },

  switchDemoAccount: async (role: string, clubId?: string): Promise<UserSession> => {
    let sub = 'usr_dev_001'
    let email = 'organizer@apex.edu'
    let name = 'Alex Rivera'
    const isOrgRole = ['platform_admin', 'org_admin', 'club_admin', 'volunteer'].includes(role)

    if (role === 'attendee' || role === 'registered') {
      sub = 'usr_attendee_001'
      email = 'student@apex.edu'
      name = 'Dev Student'
    } else if (role === 'platform_admin') {
      sub = 'usr_admin_001'
      email = 'admin@apex.edu'
      name = 'Platform Administrator'
      localStorage.setItem('eventmesh_admin_token', 'dev-admin-token')
    } else {
      sub = 'usr_dev_001'
      email = 'organizer@apex.edu'
      name = 'Alex Rivera'
    }

    try {
      const token = await signLocalDevJwt(sub, email)
      localStorage.setItem('eventmesh_auth_token', token)

      let profile = await requestJson<ProfileRead>(`${V1}/users/me`)

      if (!profile.onboarding_completed) {
        const parts = name.split(' ')
        profile = await requestJson<ProfileRead>(`${V1}/users/me`, {
          method: 'PATCH',
          body: JSON.stringify({
            first_name: parts[0] || 'Dev',
            last_name: parts.slice(1).join(' ') || 'User',
            phone: '+919876543210',
            institution_name: 'Apex Institute of Technology',
            student_id: sub.toUpperCase(),
          }),
        })
      }

      if (isOrgRole && !profile.is_organizer) {
        try {
          profile = await requestJson<ProfileRead>(`${V1}/users/me/become-organizer`, {
            method: 'POST',
          })
        } catch {
          // Ignore if already organizer
        }
      }

      const session = profileToSession(profile)
      if (clubId) session.clubId = clubId
      return session
    } catch {
      return {
        id: sub,
        name,
        email,
        role: role as any,
        orgId: 'org-1',
        clubId,
      }
    }
  },
}

export const httpSearchApi: SearchApi = {
  search: async (query) => {
    try {
      const res = await requestJson<EventBrowseResponse>(
        `${V1}/events?q=${encodeURIComponent(query)}&limit=8`
      )
      return {
        events: (res.items || []).map((e) => ({
          id: e.id,
          title: e.title,
          subtitle: e.city || e.venue || undefined,
          category: 'events' as const,
          url: eventDestination(normalizeBackendEvent(e)) || '',
          badge: e.provider || e.category || undefined,
        })).filter((event) => event.url),
        clubs: [],
        announcements: [],
      }
    } catch {
      return { events: [], clubs: [], announcements: [] }
    }
  },
}

export const httpSystemApi: SystemApi = {
  listSyncRuns: async () => {
    try {
      const res = await requestJson<any>(`${V1}/admin/sync/runs`)
      const list = Array.isArray(res) ? res : (res.runs || res.items || [])
      return list.map((item: any) => ({
        id: item.id || `sync-${Date.now()}`,
        status: item.status || 'success',
        mode: item.mode || 'incremental',
        citiesCount: item.cities_count || item.citiesCount || 23,
        eventsIngested: item.events_ingested || item.eventsIngested || 0,
        startedAt: item.started_at || item.startedAt || new Date().toISOString(),
        completedAt: item.completed_at || item.completedAt || null,
        triggeredBy: item.triggered_by || item.triggeredBy || 'admin@eventmesh.internal',
        logExcerpt: item.log_excerpt || item.logExcerpt || undefined,
      }))
    } catch {
      return []
    }
  },
  triggerSync: async (payload) => {
    const res = await requestJson<any>(`${V1}/admin/sync`, {
      method: 'POST',
      body: JSON.stringify(payload || { mode: 'incremental' }),
    })
    return {
      status: res.status || 'started',
      runId: res.run_id || res.runId || `sync-${Date.now()}`,
      message: res.message || 'Scraper sync across 23 cities initiated.',
    }
  },
  sendTestEmail: async (payload) => {
    const res = await requestJson<any>(`${V1}/admin/email/test`, {
      method: 'POST',
      body: JSON.stringify(payload),
    })
    return {
      status: res.status || 'delivered',
      messageId: res.message_id || res.messageId || `msg_${Date.now()}`,
      recipient: payload.recipient,
      template: payload.template,
      sentAt: new Date().toISOString(),
    }
  },
}

