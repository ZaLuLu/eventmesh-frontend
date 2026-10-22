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
  InvitationAccept,
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
  free?: boolean
  city?: string
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
  cancelEvent?(id: string): Promise<Event>
  archiveEvent?(id: string): Promise<Event>
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
  cancelMyRegistration?(registrationId: string): Promise<boolean>
  joinWaitlist?(eventId: string, answers?: Record<string, any>): Promise<Registration>
  getTicketPass?(registrationId: string): Promise<{ token: string; status: 'intact' | 'checked_in'; otp: string; checkedInAt?: string }>
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
  getMyEvents?(): Promise<{
    upcoming: Event[]
    ongoing: Event[]
    previous: Event[]
    past: Event[]
  }>
}

export interface CheckinResult {
  success: boolean
  registration?: Registration
  message: string
  admittedAt?: string
  alreadyAdmitted?: boolean
}

export interface CheckinStats {
  totalRegistered: number
  totalCheckedIn: number
  percentage: number
}

export interface CheckinApi {
  checkinTicket(ticketCode: string, eventId?: string): Promise<CheckinResult>
  checkinWithToken?(token: string, eventId?: string): Promise<CheckinResult>
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
  getMyNotifications?(): Promise<Notification[]>
  getInAppNotifications?(unreadOnly?: boolean): Promise<InAppNotificationListResponse>
  getUnreadCount?(): Promise<number>
  markNotificationRead?(id: string): Promise<boolean>
  markAllNotificationsRead?(): Promise<boolean>
}

export interface PaymentsApi {
  getFeeQuote(baseAmountCents: number): Promise<FeeQuote>
  createOrder(payload: OrderCreateRequest): Promise<OrderCreateResponse>
  getOrderStatus(orderId: string): Promise<PaymentStatusResponse>
  refundOrder?(orderId: string, payload?: RefundOrderRequest): Promise<RefundOrderResponse>
}

export interface PayoutsApi {
  getPayoutAccount(orgSlug: string): Promise<PayoutAccount | null>
  registerPayoutAccount(orgSlug: string, payload: PayoutAccountCreate): Promise<PayoutAccount>
  listSettlements(orgSlug: string): Promise<SettlementRecord[]>
  getPayoutBalance?(orgSlug: string): Promise<OrganizationBalance>
  listWithdrawals?(orgSlug: string): Promise<WithdrawalRequest[]>
  requestWithdrawal?(orgSlug: string, payload: WithdrawalRequestCreate): Promise<WithdrawalRequest>
  getEarningsSummary?(orgSlug: string): Promise<OrganizerEarningsSummary>
  adminListWithdrawals?(status?: string, limit?: number, offset?: number): Promise<WithdrawalRequest[]>
  adminReviewWithdrawal?(withdrawalId: string, payload: AdminWithdrawalReviewPayload): Promise<WithdrawalRequest>
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
  getAuditLogs(scope?: { orgId?: string; clubId?: string }): Promise<AuditLog[]>
  getPlatformAuditLogs?(params?: { limit?: number; offset?: number; entityType?: string }): Promise<PlatformAuditLog[]>
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
  deleteAccount?(): Promise<void>
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

  // Staff Invitations
  listInvitations?(slug: string): Promise<InvitationRead[]>
  createInvitation?(slug: string, payload: InvitationCreate): Promise<InvitationCreatedResponse>
  revokeInvitation?(slug: string, invitationId: string): Promise<InvitationRead>
  acceptInvitation?(token: string): Promise<InvitationRead>

  // Organization Proposals
  createProposal?(parentSlug: string, payload: ProposalCreate): Promise<ProposalRead>
  listMyProposals?(): Promise<ProposalRead[]>
  listOrgProposals?(slug: string): Promise<ProposalRead[]>
  reviewProposal?(proposalId: string, review: ProposalReview): Promise<ProposalRead>

  // Platform SuperAdmin
  getPlatformOverview?(): Promise<PlatformOverview>
  getInstitutionCandidates?(): Promise<InstitutionCandidate[]>
  verifyInstitution?(slug: string, domains: string[]): Promise<InstitutionCandidate>
  rejectInstitution?(slug: string, reason?: string): Promise<InstitutionCandidate>
  getPlatformOrganizations?(status?: string): Promise<PlatformOrganizationItem[]>
  listPlatformProposals?(status?: string): Promise<ProposalRead[]>
  reviewPlatformProposal?(proposalId: string, review: ProposalReview): Promise<ProposalRead>
}

export interface SystemApi {
  listSyncRuns(): Promise<SyncRun[]>
  triggerSync(payload?: TriggerSyncRequest): Promise<TriggerSyncResponse>
  sendTestEmail(payload: TestEmailRequest): Promise<TestEmailResponse>
}


