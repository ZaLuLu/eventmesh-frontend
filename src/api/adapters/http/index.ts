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
import { ApiError } from '../../contracts'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://eventmesh-api.onrender.com'

function getAuthToken(): string | null {
  try {
    return localStorage.getItem('eventmesh_auth_token')
  } catch {
    return null
  }
}

async function fetchWithRetry(url: string, options: RequestInit = {}, retries = 2): Promise<Response> {
  const token = getAuthToken()
  const headers = new Headers(options.headers || {})
  headers.set('Content-Type', 'application/json')
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
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
  getEvents: (filter) => {
    const params = new URLSearchParams()
    if (filter?.category) params.set('category', filter.category)
    if (filter?.clubId) params.set('clubId', filter.clubId)
    if (filter?.status) params.set('status', filter.status)
    if (filter?.search) params.set('search', filter.search)
    return requestJson(`/events?${params.toString()}`)
  },
  getEventBySlug: (slug) => requestJson(`/events/slug/${slug}`),
  getEventById: (id) => requestJson(`/events/${id}`),
  getUpcomingRail: () => requestJson('/events/upcoming'),
  getFeaturedEvents: () => requestJson('/events/featured'),
  getSimilarEvents: (id, category) => requestJson(`/events/${id}/similar?category=${category}`),
}

export const httpEventsAdminApi: EventsAdminApi = {
  getAdminEvents: (scope) => requestJson(`/admin/events?clubId=${scope.clubId || ''}`),
  createEvent: (event) => requestJson('/admin/events', { method: 'POST', body: JSON.stringify(event) }),
  updateEvent: (id, updates) => requestJson(`/admin/events/${id}`, { method: 'PATCH', body: JSON.stringify(updates) }),
  deleteEvent: (id) => requestJson(`/admin/events/${id}`, { method: 'DELETE' }),
  publishEvent: (id) => requestJson(`/admin/events/${id}/publish`, { method: 'POST' }),
  submitForApproval: (id) => requestJson(`/admin/events/${id}/submit-approval`, { method: 'POST' }),
  approveEvent: (id) => requestJson(`/admin/events/${id}/approve`, { method: 'POST' }),
}

export const httpFormsApi: FormsApi = {
  getFormSchema: (eventId) => requestJson(`/events/${eventId}/form`),
  updateFormSchema: (eventId, schema) =>
    requestJson(`/admin/events/${eventId}/form`, { method: 'PUT', body: JSON.stringify({ schema }) }),
}

export const httpRegistrationsApi: RegistrationsApi = {
  register: (payload) => requestJson('/registrations', { method: 'POST', body: JSON.stringify(payload) }),
  getRegistrations: (filter) => {
    const params = new URLSearchParams()
    if (filter.eventId) params.set('eventId', filter.eventId)
    if (filter.clubId) params.set('clubId', filter.clubId)
    if (filter.status) params.set('status', filter.status)
    if (filter.search) params.set('search', filter.search)
    return requestJson(`/admin/registrations?${params.toString()}`)
  },
  updateStatus: (id, status) =>
    requestJson(`/admin/registrations/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  getMyRegistrations: () => requestJson('/me/registrations'),
}

export const httpCheckinApi: CheckinApi = {
  checkinTicket: (ticketCode, eventId) =>
    requestJson('/admin/checkin', { method: 'POST', body: JSON.stringify({ ticketCode, eventId }) }),
  undoCheckin: (registrationId) =>
    requestJson(`/admin/checkin/${registrationId}/undo`, { method: 'POST' }),
  getCheckinStats: (eventId) => requestJson(`/admin/events/${eventId}/checkin-stats`),
}

export const httpCertificatesApi: CertificatesApi = {
  getCertificates: (filter) => requestJson(`/admin/certificates?eventId=${filter.eventId || ''}`),
  getMyCertificates: () => requestJson('/me/certificates'),
  generateCertificates: (eventId, recipientIds, templateId) =>
    requestJson(`/admin/events/${eventId}/certificates/generate`, {
      method: 'POST',
      body: JSON.stringify({ recipientIds, templateId }),
    }),
  verifyCertificate: (certificateId) => requestJson(`/verify/${certificateId}`),
}

export const httpAnnouncementsApi: AnnouncementsApi = {
  getAnnouncements: (filter) => {
    const params = new URLSearchParams()
    if (filter?.organizerId) params.set('clubId', filter.organizerId)
    if (filter?.kind) params.set('kind', filter.kind)
    return requestJson(`/announcements?${params.toString()}`)
  },
  createAnnouncement: (ann) => requestJson('/admin/announcements', { method: 'POST', body: JSON.stringify(ann) }),
  deleteAnnouncement: (id) => requestJson(`/admin/announcements/${id}`, { method: 'DELETE' }),
}

export const httpNotificationsApi: NotificationsApi = {
  getNotifications: (filter) => requestJson(`/admin/notifications?clubId=${filter?.clubId || ''}`),
  sendNotification: (notif) => requestJson('/admin/notifications', { method: 'POST', body: JSON.stringify(notif) }),
}

export const httpClubsApi: ClubsApi = {
  getClubs: () => requestJson('/clubs'),
  getClubBySlug: (slug) => requestJson(`/clubs/slug/${slug}`),
  getClubById: (id) => requestJson(`/clubs/${id}`),
  updateClub: (id, updates) => requestJson(`/admin/clubs/${id}`, { method: 'PATCH', body: JSON.stringify(updates) }),
  toggleFollow: (id) => requestJson(`/clubs/${id}/follow`, { method: 'POST' }),
}

export const httpGalleryApi: GalleryApi = {
  getGallery: (clubId) => requestJson(`/gallery?clubId=${clubId || ''}`),
  addGalleryItem: (item) => requestJson('/admin/gallery', { method: 'POST', body: JSON.stringify(item) }),
  removeGalleryItem: (id) => requestJson(`/admin/gallery/${id}`, { method: 'DELETE' }),
}

export const httpAnalyticsApi: AnalyticsApi = {
  getStats: (scope) => requestJson(`/admin/analytics?clubId=${scope.clubId || ''}`),
}

export const httpAuditApi: AuditApi = {
  getAuditLogs: (scope) => requestJson(`/admin/audit?clubId=${scope.clubId || ''}`),
}

export const httpUsersRolesApi: UsersRolesApi = {
  getUsers: (orgId) => requestJson(`/admin/users?orgId=${orgId}`),
  updateRole: (userId, role, clubId) =>
    requestJson(`/admin/users/${userId}/role`, { method: 'PATCH', body: JSON.stringify({ role, clubId }) }),
}

export const httpAuthApi: AuthApi = {
  sendOtp: (email) => requestJson('/auth/otp/send', { method: 'POST', body: JSON.stringify({ email }) }),
  verifyOtp: async (email, otp) => {
    const session = await requestJson<any>('/auth/otp/verify', { method: 'POST', body: JSON.stringify({ email, otp }) })
    if (session.token) {
      localStorage.setItem('eventmesh_auth_token', session.token)
    }
    return session
  },
  getSession: () => requestJson('/auth/session'),
  logout: async () => {
    localStorage.removeItem('eventmesh_auth_token')
  },
  switchDemoAccount: () => {
    throw new Error('switchDemoAccount is only available in mock mode.')
  },
}

export const httpSearchApi: SearchApi = {
  search: (query) => requestJson(`/search?q=${encodeURIComponent(query)}`),
}

export const httpOrganizationsApi: OrganizationsApi = {
  getOrganization: (idOrSlug) => requestJson(`/organizations/${idOrSlug || 'current'}`),
  updateOrganization: (id, updates) =>
    requestJson(`/admin/organization/${id}`, { method: 'PATCH', body: JSON.stringify(updates) }),
}
