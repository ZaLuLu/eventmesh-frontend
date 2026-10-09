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
} from '../../contracts'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://eventmesh-api.onrender.com'
const V1 = '/api/v1'

function getAuthToken(): string | null {
  try {
    return localStorage.getItem('eventmesh_auth_token')
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

async function fetchWithRetry(url: string, options: RequestInit = {}, retries = 2): Promise<Response> {
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

  try {
    const res = await fetch(url, { ...options, headers })
    if (!res.ok) {
      if (res.status >= 500 && retries > 0) {
        await new Promise((r) => setTimeout(r, 600))
        return fetchWithRetry(url, options, retries - 1)
      }
      let errorPayload: ApiError
      try {
        errorPayload = await res.json()
      } catch {
        errorPayload = {
          code: `HTTP_${res.status}`,
          message: res.statusText || 'An error occurred during request execution.',
        }
      }
      throw errorPayload
    }
    return res
  } catch (err) {
    if (retries > 0 && !(err as ApiError).code) {
      await new Promise((r) => setTimeout(r, 600))
      return fetchWithRetry(url, options, retries - 1)
    }
    throw err
  }
}

async function requestJson<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetchWithRetry(`${BASE_URL}${path}`, options)
  return res.json()
}

export const httpEventsApi: EventsApi = {
  getBrowseEvents: (params = {}) => {
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
    return requestJson<EventBrowseResponse>(`${V1}/events${qs ? `?${qs}` : ''}`)
  },

  getEvents: async (filter) => {
    const query = new URLSearchParams()
    if (filter?.category) query.set('category', filter.category)
    if (filter?.search) query.set('q', filter.search)
    if (filter?.limit) query.set('limit', String(filter.limit))
    if (filter?.dateFilter && filter.dateFilter !== 'all') {
      query.set('date_range', filter.dateFilter === 'weekend' ? 'week' : filter.dateFilter)
    }
    const qs = query.toString()
    const browseRes = await requestJson<EventBrowseResponse>(`${V1}/events${qs ? `?${qs}` : ''}`)
    const items = (browseRes.items || []).map(normalizeBackendEvent)
    return {
      items,
      nextCursor: browseRes.next_offset ? String(browseRes.next_offset) : undefined,
      totalCount: browseRes.total || items.length,
    }
  },

  getEventBySlug: async (slug: string) => {
    try {
      const event = await requestJson<EventRead | VisibleEventRead>(`${V1}/events/${slug}`)
      return normalizeBackendEvent(event)
    } catch {
      return null
    }
  },

  getEventById: async (id: string) => {
    try {
      const event = await requestJson<EventRead | VisibleEventRead>(`${V1}/events/${id}`)
      return normalizeBackendEvent(event)
    } catch {
      return null
    }
  },

  getUpcomingRail: async () => {
    try {
      const res = await requestJson<EventBrowseResponse>(`${V1}/events?limit=8&date_range=week`)
      return (res.items || []).map(normalizeBackendEvent)
    } catch {
      return []
    }
  },

  getFeaturedEvents: async () => {
    try {
      const res = await requestJson<EventBrowseResponse>(`${V1}/events?limit=5`)
      return (res.items || []).map(normalizeBackendEvent)
    } catch {
      return []
    }
  },

  getSimilarEvents: async (_id: string, category: string) => {
    try {
      const res = await requestJson<EventBrowseResponse>(
        `${V1}/events?category=${encodeURIComponent(category)}&limit=4`
      )
      return (res.items || []).map(normalizeBackendEvent)
    } catch {
      return []
    }
  },

  listPromoted: async () => {
    try {
      const res = await requestJson<EventBrowseResponse>(`${V1}/events?limit=5`)
      return (res.items || []).map(normalizeBackendEvent)
    } catch {
      return []
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
      return { items: [], totalCount: 0 }
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
      return {
        items,
        nextCursor: res.next_offset ? String(res.next_offset) : undefined,
        totalCount: res.total || items.length,
      }
    } catch {
      return { items: [], totalCount: 0 }
    }
  },
}

export const httpEventsAdminApi: EventsAdminApi = {
  getOrganizationEvents: (slug: string) =>
    requestJson<EventRead[]>(`${V1}/organizations/${slug}/events`),

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

  getAdminEvents: (scope) =>
    requestJson(`${V1}/organizations/${scope.orgId || 'current'}/events`),

  createEvent: (event) =>
    requestJson(`${V1}/organizations/current/events`, {
      method: 'POST',
      body: JSON.stringify(event),
    }),

  updateEvent: (id, updates) =>
    requestJson(`${V1}/organizations/current/events/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    }),

  deleteEvent: (id) =>
    requestJson(`${V1}/organizations/current/events/${id}`, { method: 'DELETE' }),

  publishEvent: (id) =>
    requestJson(`${V1}/organizations/current/events/${id}/publish`, { method: 'POST' }),

  submitForApproval: (id) =>
    requestJson(`${V1}/organizations/current/events/${id}/submit`, { method: 'POST' }),

  approveEvent: (id) =>
    requestJson(`${V1}/organizations/current/events/${id}/publish`, { method: 'POST' }),
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

  register: async (payload) => {
    // 1-tap pass registration directly with event slug or id
    const slug = (payload as any).eventSlug || payload.eventId
    const read = await requestJson<RegistrationRead>(`${V1}/events/${slug}/register`, {
      method: 'POST',
    })
    return normalizeBackendRegistration(read)
  },

  getRegistrations: async (filter) => {
    if (filter.eventId) {
      const attendees = await requestJson<AttendeeRead[]>(`${V1}/events/${filter.eventId}/registrations`)
      return attendees.map((a, i) =>
        normalizeBackendRegistration({
          id: `att-${i}`,
          user_id: a.user_id,
          userEmail: a.email,
          userName: a.display_name,
          ticketCode: a.student_id || `PASS-${a.user_id.slice(0, 6)}`,
          status: a.status,
          created_at: a.created_at,
        })
      )
    }
    const regs = await requestJson<RegistrationRead[]>(`${V1}/registrations`)
    return regs.map(normalizeBackendRegistration)
  },

  updateStatus: (id, status) =>
    requestJson(`/admin/registrations/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  getMyRegistrations: async () => {
    const list = await requestJson<RegistrationRead[]>(`${V1}/registrations`)
    return list.map(normalizeBackendRegistration)
  },
}

export const httpCheckinApi: CheckinApi = {
  checkinTicket: (ticketCode, eventId) =>
    requestJson('/admin/checkin', {
      method: 'POST',
      body: JSON.stringify({ ticketCode, eventId }),
    }),
  undoCheckin: (registrationId) =>
    requestJson(`/admin/checkin/${registrationId}/undo`, { method: 'POST' }),
  getCheckinStats: (eventId) =>
    requestJson(`/admin/events/${eventId}/checkin-stats`),
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
    requestJson(`/organizations/${idOrSlug || 'current'}`),
  updateOrganization: (id, updates) =>
    requestJson(`/admin/organization/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    }),
}

export const httpClubsApi: ClubsApi = {
  getClubs: () => requestJson('/clubs'),
  getClubBySlug: (slug) => requestJson(`/clubs/slug/${slug}`),
  getClubById: (id) => requestJson(`/clubs/${id}`),
  updateClub: (id, updates) =>
    requestJson(`/admin/clubs/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    }),
  toggleFollow: (id) => requestJson(`/clubs/${id}/follow`, { method: 'POST' }),
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
    requestJson(`/admin/audit?clubId=${scope.clubId || ''}`),
}

export const httpUsersRolesApi: UsersRolesApi = {
  getUsers: (orgId) => requestJson(`/admin/users?orgId=${orgId}`),
  updateRole: (userId, role, clubId) =>
    requestJson(`/admin/users/${userId}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role, clubId }),
    }),
}

export const httpAuthApi: AuthApi = {
  getProfile: () => requestJson<ProfileRead>(`${V1}/users/me`),

  updateProfile: (payload: ProfileUpdatePayload) =>
    requestJson<ProfileRead>(`${V1}/users/me`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),

  becomeOrganizer: () =>
    requestJson<ProfileRead>(`${V1}/users/me/become-organizer`, {
      method: 'POST',
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
    const token = getAuthToken()
    if (!token) return null
    try {
      const profile = await requestJson<ProfileRead>(`${V1}/users/me`)
      return profileToSession(profile)
    } catch {
      return null
    }
  },

  logout: async () => {
    localStorage.removeItem('eventmesh_auth_token')
  },

  switchDemoAccount: () => {
    throw new Error('switchDemoAccount is only available in mock mode.')
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
          url: `/events/${e.slug}`,
          badge: e.category,
        })),
        clubs: [],
        announcements: [],
      }
    } catch {
      return { events: [], clubs: [], announcements: [] }
    }
  },
}
