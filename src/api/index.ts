import {
  mockEventsApi,
  mockEventsAdminApi,
  mockFormsApi,
  mockRegistrationsApi,
  mockCheckinApi,
  mockCertificatesApi,
  mockAnnouncementsApi,
  mockNotificationsApi,
  mockClubsApi,
  mockGalleryApi,
  mockAnalyticsApi,
  mockAuditApi,
  mockUsersRolesApi,
  mockAuthApi,
  mockSearchApi,
  mockOrganizationsApi,
  mockStore,
} from './adapters/mock'

import {
  httpEventsApi,
  httpEventsAdminApi,
  httpFormsApi,
  httpRegistrationsApi,
  httpCheckinApi,
  httpCertificatesApi,
  httpAnnouncementsApi,
  httpNotificationsApi,
  httpClubsApi,
  httpGalleryApi,
  httpAnalyticsApi,
  httpAuditApi,
  httpUsersRolesApi,
  httpAuthApi,
  httpSearchApi,
  httpOrganizationsApi,
} from './adapters/http'

const isMock = import.meta.env.VITE_API_MODE !== 'http'

export const api = {
  mode: isMock ? 'mock' : 'http',
  events: isMock ? mockEventsApi : httpEventsApi,
  eventsAdmin: isMock ? mockEventsAdminApi : httpEventsAdminApi,
  forms: isMock ? mockFormsApi : httpFormsApi,
  registrations: isMock ? mockRegistrationsApi : httpRegistrationsApi,
  checkin: isMock ? mockCheckinApi : httpCheckinApi,
  certificates: isMock ? mockCertificatesApi : httpCertificatesApi,
  announcements: isMock ? mockAnnouncementsApi : httpAnnouncementsApi,
  notifications: isMock ? mockNotificationsApi : httpNotificationsApi,
  clubs: isMock ? mockClubsApi : httpClubsApi,
  gallery: isMock ? mockGalleryApi : httpGalleryApi,
  analytics: isMock ? mockAnalyticsApi : httpAnalyticsApi,
  audit: isMock ? mockAuditApi : httpAuditApi,
  usersRoles: isMock ? mockUsersRolesApi : httpUsersRolesApi,
  auth: isMock ? mockAuthApi : httpAuthApi,
  search: isMock ? mockSearchApi : httpSearchApi,
  organizations: isMock ? mockOrganizationsApi : httpOrganizationsApi,
  // Helper for mock reset in dev mode
  mockStore: isMock ? mockStore : null,
}

export * from './contracts'
export * from './ports'
