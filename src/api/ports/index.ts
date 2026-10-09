import {
  Event,
  EventStatus,
  Organizer,
  Organization,
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
  VisibleEventRead,
  EventBrowseParams,
  EventBrowseResponse,
  EventRead,
  OrganizationRead,
  MemberRead,
  CreateOrgPayload,
  CreateSubOrgPayload,
  CreateClubPayload,
  RegistrationRead,
  AttendeeRead,
  ProfileRead,
  ProfileUpdatePayload,
} from '../contracts'

export interface EventsFilter {
  category?: string
  clubId?: string
  type?: string
  status?: EventStatus | 'all'
  dateFilter?: 'today' | 'weekend' | 'upcoming' | 'all'
  search?: string
  cursor?: string
  limit?: number
}

export interface EventsApi {
  getEvents(filter?: EventsFilter): Promise<PaginatedResult<Event>>
  getBrowseEvents?(params?: EventBrowseParams): Promise<EventBrowseResponse>
  getEventBySlug(slug: string): Promise<Event | null>
  getEventById(id: string): Promise<Event | null>
  getUpcomingRail(): Promise<Event[]>
  getFeaturedEvents(): Promise<Event[]>
  getSimilarEvents(eventId: string, category: string): Promise<Event[]>
  listPromoted(): Promise<Event[]>
  listNewest(params?: { limit?: number; cursor?: string }): Promise<PaginatedResult<Event>>
  list(params?: {
    category?: string
    date?: string
    free?: boolean
    q?: string
    sort?: string
    cursor?: string
    limit?: number
  }): Promise<PaginatedResult<Event>>
}

export interface EventsAdminApi {
  getAdminEvents(scope: { orgId: string; clubId?: string }): Promise<Event[]>
  getOrganizationEvents?(slug: string): Promise<EventRead[]>
  createOrgEvent?(slug: string, event: any): Promise<EventRead>
  updateOrgEvent?(slug: string, eventId: string, updates: any): Promise<EventRead>
  deleteOrgEvent?(slug: string, eventId: string): Promise<void>
  eventLifecycleAction?(slug: string, eventId: string, action: string): Promise<EventRead>
  createEvent(event: Partial<Event>): Promise<Event>
  updateEvent(id: string, updates: Partial<Event>): Promise<Event>
  deleteEvent(id: string): Promise<void>
  publishEvent(id: string): Promise<Event>
  submitForApproval(id: string): Promise<Event>
  approveEvent(id: string): Promise<Event>
}


export interface FormsApi {
  getFormSchema(eventId: string): Promise<FormField[]>
  updateFormSchema(eventId: string, schema: FormField[]): Promise<FormField[]>
}

export interface RegisterPayload {
  eventId: string
  answers: Record<string, any>
  team?: {
    teamName: string
    leaderName: string
    leaderEmail: string
    members: { name: string; email: string; role?: string }[]
  }
}

export interface RegistrationsApi {
  register(payload: RegisterPayload): Promise<Registration>
  registerPass?(eventSlug: string): Promise<RegistrationRead>
  cancelRegistration?(eventSlug: string): Promise<void>
  getEventAttendees?(eventSlug: string): Promise<AttendeeRead[]>
  getRegistrations(filter: {
    eventId?: string
    clubId?: string
    orgId?: string
    status?: RegistrationStatus
    search?: string
  }): Promise<Registration[]>
  updateStatus(id: string, status: RegistrationStatus): Promise<Registration>
  getMyRegistrations(): Promise<Registration[]>
}

export interface CheckinResult {
  success: boolean
  registration?: Registration
  message: string
}

export interface CheckinStats {
  totalRegistered: number
  totalCheckedIn: number
  percentage: number
}

export interface CheckinApi {
  checkinTicket(ticketCode: string, eventId?: string): Promise<CheckinResult>
  undoCheckin(registrationId: string): Promise<boolean>
  getCheckinStats(eventId: string): Promise<CheckinStats>
}

export interface CertificatesApi {
  getCertificates(filter: { eventId?: string; clubId?: string }): Promise<Certificate[]>
  getMyCertificates(): Promise<Certificate[]>
  generateCertificates(
    eventId: string,
    recipientIds: string[],
    templateId?: string
  ): Promise<Certificate[]>
  verifyCertificate(certificateId: string): Promise<CertificateVerificationResult>
}

export interface AnnouncementsApi {
  getAnnouncements(filter?: {
    orgId?: string
    organizerId?: string
    kind?: string
  }): Promise<Announcement[]>
  createAnnouncement(announcement: Partial<Announcement>): Promise<Announcement>
  deleteAnnouncement(id: string): Promise<void>
}

export interface NotificationsApi {
  getNotifications(filter?: { orgId: string; clubId?: string }): Promise<Notification[]>
  sendNotification(notification: Partial<Notification>): Promise<Notification>
}

export interface ClubsApi {
  getClubs(): Promise<Organizer[]>
  getClubBySlug(slug: string): Promise<Organizer | null>
  getClubById(id: string): Promise<Organizer | null>
  updateClub(id: string, updates: Partial<Organizer>): Promise<Organizer>
  toggleFollow(id: string): Promise<boolean>
}

export interface GalleryApi {
  getGallery(clubId?: string): Promise<OrganizerGalleryItem[]>
  addGalleryItem(item: Omit<OrganizerGalleryItem, 'id'>): Promise<OrganizerGalleryItem>
  removeGalleryItem(id: string): Promise<void>
}

export interface DashboardStats {
  eventsCount: number
  upcomingCount: number
  registrationsCount: number
  checkinsCount: number
  certificatesCount: number
  notificationsCount: number
  registrationsTimeline: { date: string; count: number }[]
}

export interface AnalyticsApi {
  getStats(scope: { orgId: string; clubId?: string }): Promise<DashboardStats>
}

export interface AuditApi {
  getAuditLogs(scope: { orgId: string; clubId?: string }): Promise<AuditLog[]>
}

export interface UserRoleRecord {
  id: string
  name: string
  email: string
  role: string
  clubId?: string
  clubName?: string
}

export interface UsersRolesApi {
  getUsers(orgId: string): Promise<UserRoleRecord[]>
  updateRole(userId: string, role: string, clubId?: string): Promise<UserRoleRecord>
}

export interface AuthApi {
  sendOtp(email: string): Promise<{ success: boolean; message: string }>
  verifyOtp(email: string, otp: string): Promise<UserSession>
  getSession(): Promise<UserSession | null>
  logout(): Promise<void>
  switchDemoAccount(role: string, clubId?: string): Promise<UserSession>
  getProfile?(): Promise<ProfileRead | null>
  updateProfile?(payload: ProfileUpdatePayload): Promise<ProfileRead>
  becomeOrganizer?(): Promise<ProfileRead>
}

export interface SearchResultItem {
  id: string
  title: string
  subtitle?: string
  category: 'events' | 'clubs' | 'announcements'
  url: string
  badge?: string
}

export interface SearchResults {
  events: SearchResultItem[]
  clubs: SearchResultItem[]
  announcements: SearchResultItem[]
}

export interface SearchApi {
  search(query: string): Promise<SearchResults>
}

export interface OrganizationsApi {
  getOrganization(idOrSlug?: string): Promise<Organization>
  getOrganizationBySlug?(slug: string): Promise<OrganizationRead | null>
  getOrganizations?(): Promise<OrganizationRead[]>
  getInstitutions?(): Promise<OrganizationRead[]>
  createOrganization?(payload: CreateOrgPayload): Promise<OrganizationRead>
  getSubOrganizations?(slug: string): Promise<OrganizationRead[]>
  createSubOrganization?(slug: string, payload: CreateSubOrgPayload): Promise<OrganizationRead>
  getClubs?(slug: string): Promise<OrganizationRead[]>
  createClub?(slug: string, payload: CreateClubPayload): Promise<OrganizationRead>
  getMembers?(slug: string): Promise<MemberRead[]>
  addMember?(slug: string, payload: { user_id: string; role: 'member' | 'manager' }): Promise<MemberRead>
  removeMember?(slug: string, userId: string): Promise<void>
  updateOrganization(id: string, updates: Partial<Organization>): Promise<Organization>
}

