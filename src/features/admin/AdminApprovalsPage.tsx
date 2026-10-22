import React, { useState } from 'react'
import {
  Check,
  X,
  Buildings,
  Plus,
  ShieldCheck,
  ArrowRight,
  GraduationCap,
  Globe,
  Bank,
  CheckCircle,
  CurrencyInr,
  MagnifyingGlass,
  Funnel,
  CreditCard,
  User,
  Calendar,
  Users,
} from '@phosphor-icons/react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/hooks/useAuth'
import { useOrg } from '@/hooks/useOrg'
import {
  api,
  ProposalRead,
  ProposalCreate,
  PlatformOverview,
  InstitutionCandidate,
  WithdrawalRequest,
  PlatformOrganizationItem,
} from '@/api'
import { Button } from '@/design-system/primitives/Button'
import { Badge } from '@/design-system/primitives/Badge'
import { Modal } from '@/design-system/primitives/Modal'
import { formatDate } from '@/lib/dates'
import { useToast } from '@/design-system/primitives/Toast'

export const AdminApprovalsPage: React.FC = () => {
  const { session } = useAuth()
  const { organization } = useOrg()
  const orgSlug = organization?.slug || 'apex-institute'
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const [activeTab, setActiveTab] = useState<
    'events' | 'proposals' | 'institutions' | 'withdrawals' | 'directory'
  >('events')

  // Platform Overview Query (Main Admin metrics)
  const { data: overview } = useQuery<PlatformOverview | null>({
    queryKey: ['platform-overview'],
    queryFn: async () => {
      if (api.organizations.getPlatformOverview) {
        return api.organizations.getPlatformOverview()
      }
      return null
    },
  })

  // Events Approvals Query
  const { data: events = [], isLoading: isLoadingEvents } = useQuery({
    queryKey: ['admin-approvals', session?.orgId],
    queryFn: () => api.eventsAdmin.getAdminEvents({ orgId: session?.orgId || 'org-1' }),
  })

  const inReviewEvents = events.filter((e) => e.status === 'in_review' || e.status === 'submitted')

  // Proposals Query
  const { data: proposals = [], isLoading: isLoadingProposals } = useQuery<ProposalRead[]>({
    queryKey: ['admin-proposals', orgSlug],
    queryFn: async () => {
      if (api.organizations.listPlatformProposals) {
        return api.organizations.listPlatformProposals()
      }
      if (api.organizations.listOrgProposals) {
        return api.organizations.listOrgProposals(orgSlug)
      }
      if (api.organizations.listMyProposals) {
        return api.organizations.listMyProposals()
      }
      return []
    },
    enabled: activeTab === 'proposals',
  })

  const pendingProposals = proposals.filter((p) => p.status === 'pending')

  // Institutions Candidates Query
  const { data: institutions = [], isLoading: isLoadingInstitutions } = useQuery<InstitutionCandidate[]>({
    queryKey: ['admin-institutions'],
    queryFn: async () => {
      if (api.organizations.getInstitutionCandidates) {
        return api.organizations.getInstitutionCandidates()
      }
      return []
    },
    enabled: activeTab === 'institutions',
  })

  // Withdrawals Queue Query
  const [withdrawalFilter, setWithdrawalFilter] = useState<string>('ALL')
  const { data: withdrawals = [], isLoading: isLoadingWithdrawals } = useQuery<WithdrawalRequest[]>({
    queryKey: ['admin-withdrawals', withdrawalFilter],
    queryFn: async () => {
      if (api.payouts.adminListWithdrawals) {
        return api.payouts.adminListWithdrawals(withdrawalFilter === 'ALL' ? undefined : withdrawalFilter)
      }
      return []
    },
    enabled: activeTab === 'withdrawals',
  })

  // Platform Organization Directory Query
  const [directoryFilter, setDirectoryFilter] = useState<string>('ALL')
  const [directorySearch, setDirectorySearch] = useState<string>('')
  const { data: platformOrgs = [], isLoading: isLoadingDirectory } = useQuery<PlatformOrganizationItem[]>({
    queryKey: ['admin-platform-organizations', directoryFilter],
    queryFn: async () => {
      if (api.organizations.getPlatformOrganizations) {
        return api.organizations.getPlatformOrganizations(directoryFilter === 'ALL' ? undefined : directoryFilter)
      }
      return []
    },
    enabled: activeTab === 'directory',
  })

  // Event Mutations
  const approveMutation = useMutation({
    mutationFn: (id: string) => api.eventsAdmin.approveEvent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-approvals'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'events'] })
      toast({ title: 'Event Approved', message: 'The event has been approved and published live.', type: 'success' })
    },
  })

  const rejectMutation = useMutation({
    mutationFn: (id: string) => api.eventsAdmin.updateEvent(id, { status: 'draft' } as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-approvals'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'events'] })
      toast({ title: 'Returned to Draft', message: 'Event was returned to draft for edits.', type: 'info' })
    },
  })

  // Proposal Review Mutation
  const reviewProposalMutation = useMutation({
    mutationFn: ({ proposalId, action, reason }: { proposalId: string; action: 'approve' | 'reject'; reason?: string }) => {
      if (api.organizations.reviewPlatformProposal) {
        return api.organizations.reviewPlatformProposal(proposalId, { action, reason })
      }
      if (!api.organizations.reviewProposal) throw new Error('Not implemented')
      return api.organizations.reviewProposal(proposalId, { action, reason })
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['admin-proposals'] })
      queryClient.invalidateQueries({ queryKey: ['platform-overview'] })
      toast({
        title: vars.action === 'approve' ? 'Proposal Approved' : 'Proposal Rejected',
        message: `The organization proposal has been ${vars.action === 'approve' ? 'approved and activated' : 'rejected'}.`,
        type: vars.action === 'approve' ? 'success' : 'info',
      })
    },
    onError: (err: any) => {
      toast({ title: 'Action Failed', message: err?.message || 'Could not review proposal.', type: 'error' })
    },
  })

  // Propose New Sub-Org Modal State
  const [isProposeModalOpen, setIsProposeModalOpen] = useState(false)
  const [proposedName, setProposedName] = useState('')
  const [proposedEmail, setProposedEmail] = useState('')
  const [proposedReason, setProposedReason] = useState('')

  const createProposalMutation = useMutation({
    mutationFn: async (payload: ProposalCreate) => {
      if (!api.organizations.createProposal) throw new Error('Not implemented')
      return api.organizations.createProposal(orgSlug, payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-proposals'] })
      setIsProposeModalOpen(false)
      setProposedName('')
      setProposedEmail('')
      setProposedReason('')
      toast({
        title: 'Proposal Submitted',
        message: 'Your proposal has been routed to institutional administrators for review.',
        type: 'success',
      })
    },
    onError: (err: any) => {
      toast({ title: 'Submission Failed', message: err?.message || 'Could not submit proposal.', type: 'error' })
    },
  })

  const verifyInstitutionMutation = useMutation({
    mutationFn: ({ slug, domains }: { slug: string; domains: string[] }) => {
      if (!api.organizations.verifyInstitution) throw new Error('Not implemented')
      return api.organizations.verifyInstitution(slug, domains)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-institutions'] })
      queryClient.invalidateQueries({ queryKey: ['platform-overview'] })
      toast({ title: 'Institution Verified', message: 'The organization has been granted institutional status.', type: 'success' })
    },
    onError: (err: any) => {
      toast({ title: 'Verification Failed', message: err?.message || 'Could not verify institution.', type: 'error' })
    },
  })

  const rejectInstitutionMutation = useMutation({
    mutationFn: ({ slug, reason }: { slug: string; reason?: string }) => {
      if (!api.organizations.rejectInstitution) throw new Error('Not implemented')
      return api.organizations.rejectInstitution(slug, reason)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-institutions'] })
      queryClient.invalidateQueries({ queryKey: ['platform-overview'] })
      toast({ title: 'Candidate Rejected', message: 'Institution status was declined.', type: 'info' })
    },
    onError: (err: any) => {
      toast({ title: 'Action Failed', message: err?.message || 'Could not reject candidate.', type: 'error' })
    },
  })

  // Withdrawal Review Mutation (Superadmin payout disburse / reject)
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<WithdrawalRequest | null>(null)
  const [actionModal, setActionModal] = useState<'pay' | 'reject' | null>(null)
  const [utrReference, setUtrReference] = useState('')
  const [rejectionReason, setRejectionReason] = useState('')

  const reviewWithdrawalMutation = useMutation({
    mutationFn: ({
      withdrawalId,
      action,
      reason,
      transfer_reference,
    }: {
      withdrawalId: string
      action: 'approve' | 'reject' | 'pay'
      reason?: string
      transfer_reference?: string
    }) => {
      if (!api.payouts.adminReviewWithdrawal) throw new Error('Not implemented')
      return api.payouts.adminReviewWithdrawal(withdrawalId, { action, reason, transfer_reference })
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['admin-withdrawals'] })
      queryClient.invalidateQueries({ queryKey: ['platform-overview'] })
      toast({
        title: vars.action === 'pay' ? 'Payout Disbursed & Marked Paid' : vars.action === 'approve' ? 'Withdrawal Approved' : 'Withdrawal Declined',
        message:
          vars.action === 'pay'
            ? `Bank UTR transaction ${vars.transfer_reference} recorded successfully.`
            : vars.action === 'approve'
            ? 'Approved for payout processing.'
            : 'Funds returned to organizer available balance.',
        type: vars.action === 'pay' ? 'success' : 'info',
      })
      setSelectedWithdrawal(null)
      setActionModal(null)
      setUtrReference('')
      setRejectionReason('')
    },
    onError: (err: any) => {
      toast({ title: 'Transaction Failed', message: err?.message || 'Could not process withdrawal.', type: 'error' })
    },
  })

  const filteredDirectory = platformOrgs.filter((org) => {
    if (!directorySearch.trim()) return true
    const term = directorySearch.toLowerCase()
    return (
      org.name.toLowerCase().includes(term) ||
      org.slug.toLowerCase().includes(term) ||
      (org.owner_email && org.owner_email.toLowerCase().includes(term)) ||
      (org.owner_name && org.owner_name.toLowerCase().includes(term))
    )
  })

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="pb-4 border-b border-line flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-caption font-mono font-bold text-accent uppercase tracking-wider block mb-1">
            Governance & Editorial Pipeline
          </span>
          <h1 className="text-h2 font-semibold text-text tracking-tight">
            Curatorial Approvals & Governance Queue
          </h1>
          <p className="text-small text-text-2 mt-0.5">
            Review event drafts, organization proposals, institutional clearances, and revenue disbursement requests.
          </p>
        </div>

        {activeTab === 'proposals' && (
          <Button
            onClick={() => setIsProposeModalOpen(true)}
            className="gap-2 bg-accent text-on-accent text-xs font-semibold py-2 px-3.5 shadow-offset-xs self-start sm:self-auto"
          >
            <Plus size={16} weight="bold" />
            <span>Propose New Club / Sub-Org</span>
          </Button>
        )}
      </div>

      {/* Platform Overview Metrics Cards */}
      {overview && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 bg-surface border border-line rounded-panel space-y-1">
            <span className="text-[11px] font-mono text-text-3 font-semibold uppercase">Pending Proposals</span>
            <p className="text-xl font-bold text-accent tabular-nums">{overview.pending_proposals_count}</p>
          </div>
          <div className="p-4 bg-surface border border-line rounded-panel space-y-1">
            <span className="text-[11px] font-mono text-text-3 font-semibold uppercase">Pending Withdrawals</span>
            <p className="text-xl font-bold text-text tabular-nums">{overview.pending_withdrawals_count}</p>
          </div>
          <div className="p-4 bg-surface border border-line rounded-panel space-y-1">
            <span className="text-[11px] font-mono text-text-3 font-semibold uppercase">Verified Orgs</span>
            <p className="text-xl font-bold text-text tabular-nums">{overview.verified_organizations_count}</p>
          </div>
          <div className="p-4 bg-surface border border-line rounded-panel space-y-1">
            <span className="text-[11px] font-mono text-text-3 font-semibold uppercase">Verified Institutions</span>
            <p className="text-xl font-bold text-success tabular-nums">{overview.verified_institutions_count}</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-line overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('events')}
          className={`pb-3 px-3 text-xs font-mono font-bold uppercase tracking-wider transition-colors border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'events'
              ? 'border-accent text-accent'
              : 'border-transparent text-text-3 hover:text-text'
          }`}
        >
          <span>Event Submissions</span>
          {inReviewEvents.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-accent text-on-accent font-mono font-bold">
              {inReviewEvents.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('proposals')}
          className={`pb-3 px-3 text-xs font-mono font-bold uppercase tracking-wider transition-colors border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'proposals'
              ? 'border-accent text-accent'
              : 'border-transparent text-text-3 hover:text-text'
          }`}
        >
          <span>Org & Club Proposals</span>
          {pendingProposals.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-accent text-on-accent font-mono font-bold">
              {pendingProposals.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('institutions')}
          className={`pb-3 px-3 text-xs font-mono font-bold uppercase tracking-wider transition-colors border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'institutions'
              ? 'border-accent text-accent'
              : 'border-transparent text-text-3 hover:text-text'
          }`}
        >
          <span>Institutional Clearance</span>
          {institutions.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-surface-subtle border border-line text-text-2 font-mono font-bold">
              {institutions.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('withdrawals')}
          className={`pb-3 px-3 text-xs font-mono font-bold uppercase tracking-wider transition-colors border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'withdrawals'
              ? 'border-accent text-accent'
              : 'border-transparent text-text-3 hover:text-text'
          }`}
        >
          <span>Disbursement Queue</span>
          {overview?.pending_withdrawals_count ? (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-danger text-on-danger font-mono font-bold">
              {overview.pending_withdrawals_count}
            </span>
          ) : null}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('directory')}
          className={`pb-3 px-3 text-xs font-mono font-bold uppercase tracking-wider transition-colors border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'directory'
              ? 'border-accent text-accent'
              : 'border-transparent text-text-3 hover:text-text'
          }`}
        >
          <span>Platform Directory</span>
        </button>
      </div>

      {/* Tab 1: Event Submissions */}
      {activeTab === 'events' && (
        <div className="bg-surface border border-line rounded-panel p-5 space-y-3">
          {isLoadingEvents ? (
            <p className="text-small text-text-3 py-8 text-center">Checking editorial event queue...</p>
          ) : inReviewEvents.length === 0 ? (
            <div className="py-12 text-center text-small text-text-3">
              ✓ No events currently pending editorial approval. All submissions processed.
            </div>
          ) : (
            <div className="divide-y divide-line">
              {inReviewEvents.map((evt) => (
                <div key={evt.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="h-2 w-2 rounded-full inline-block" style={{ backgroundColor: evt.organizerColor }} />
                      <span className="text-caption font-medium text-text-3">
                        {evt.organizerName} · {evt.category}
                      </span>
                    </div>
                    <h3 className="text-h3 font-semibold text-text">{evt.title}</h3>
                    <p className="text-caption text-text-2 mt-0.5">
                      {formatDate(evt.startsAt)} · {evt.venue.name} · Capacity: {evt.capacity}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      surface="admin"
                      variant="secondary"
                      size="sm"
                      loading={rejectMutation.isPending}
                      onClick={() => rejectMutation.mutate(evt.id)}
                    >
                      Return to Draft
                    </Button>
                    <Button
                      surface="admin"
                      variant="primary"
                      size="sm"
                      loading={approveMutation.isPending}
                      icon={<Check size={16} weight="bold" />}
                      onClick={() => approveMutation.mutate(evt.id)}
                    >
                      Approve & Publish
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Organization & Club Proposals */}
      {activeTab === 'proposals' && (
        <div className="space-y-4">
          <div className="bg-surface border border-line rounded-panel p-5 space-y-3">
            {isLoadingProposals ? (
              <p className="text-small text-text-3 py-8 text-center">Loading organization proposals...</p>
            ) : proposals.length === 0 ? (
              <div className="py-12 text-center text-small text-text-3">
                ✓ No organization charters currently awaiting approval.
              </div>
            ) : (
              <div className="divide-y divide-line">
                {proposals.map((prop) => {
                  const isPending = prop.status === 'pending'
                  const isApproved = prop.status === 'approved'
                  const isRejected = prop.status === 'rejected'

                  return (
                    <div key={prop.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1 max-w-xl">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-accent uppercase font-mono tracking-wider">
                            {prop.parent_organization_name || 'Campus Root'}
                          </span>
                          <span className="text-text-3 text-xs">→</span>
                          <Badge variant={isApproved ? 'success' : isRejected ? 'danger' : 'iris'}>
                            {prop.status.toUpperCase()}
                          </Badge>
                        </div>

                        <h3 className="text-h3 font-semibold text-text">
                          {prop.proposed_organization_name}
                        </h3>

                        <p className="text-caption text-text-3 font-mono">
                          Proposer: {prop.proposer_name || prop.proposer_id} · Submitted {new Date(prop.created_at).toLocaleDateString()}
                        </p>

                        {prop.reason && (
                          <div className="p-3 mt-2 bg-subtle border border-line rounded-card text-caption text-text-2">
                            <span className="font-semibold block text-text mb-0.5">Charter Statement:</span>
                            {prop.reason}
                          </div>
                        )}
                      </div>

                      {isPending && (
                        <div className="flex items-center gap-2 self-start sm:self-auto">
                          <Button
                            surface="admin"
                            variant="secondary"
                            size="dense"
                            onClick={() => {
                              const reason = prompt('Reason for rejection:')
                              if (reason !== null) {
                                reviewProposalMutation.mutate({ proposalId: prop.id, action: 'reject', reason })
                              }
                            }}
                          >
                            Decline
                          </Button>
                          <Button
                            surface="admin"
                            variant="primary"
                            size="dense"
                            onClick={() => reviewProposalMutation.mutate({ proposalId: prop.id, action: 'approve' })}
                          >
                            Approve Charter
                          </Button>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Institutional Clearance */}
      {activeTab === 'institutions' && (
        <div className="bg-surface border border-line rounded-panel p-5 space-y-4">
          <div>
            <h2 className="text-h3 font-semibold text-text">Campus Institutional Roster & Clearance</h2>
            <p className="text-caption text-text-3 mt-0.5">
              Colleges and university entities eligible for domain auto-verification and student edition gates.
            </p>
          </div>

          {isLoadingInstitutions ? (
            <p className="text-small text-text-3 py-8 text-center">Loading institution registry...</p>
          ) : institutions.length === 0 ? (
            <div className="py-12 text-center text-small text-text-3">
              ✓ No universities currently awaiting clearance.
            </div>
          ) : (
            <div className="divide-y divide-line">
              {institutions.map((inst) => (
                <div key={inst.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-accent" />
                      <h3 className="text-h3 font-semibold text-text">{inst.name}</h3>
                      <Badge variant={inst.is_institution ? 'success' : 'neutral'}>
                        {inst.is_institution ? 'VERIFIED INSTITUTION' : 'CANDIDATE'}
                      </Badge>
                    </div>

                    <p className="text-caption text-text-3 font-mono">
                      Slug: /{inst.slug} · Admin Contact: {inst.contact_email || inst.owner_email || 'Not provided'}
                    </p>

                    <div className="flex items-center gap-1.5 flex-wrap pt-1">
                      <span className="text-[11px] font-mono text-text-3">Verified Domains:</span>
                      {inst.domains.length > 0 ? (
                        inst.domains.map((dom) => (
                          <span
                            key={dom}
                            className="px-2 py-0.5 bg-subtle border border-line rounded font-mono text-[10px] text-text font-bold"
                          >
                            @{dom}
                          </span>
                        ))
                      ) : (
                        <span className="text-[11px] text-text-3 italic">No email domains registered</span>
                      )}
                    </div>
                  </div>

                  {!inst.is_institution && (
                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      <Button
                        surface="admin"
                        variant="secondary"
                        size="dense"
                        onClick={() => {
                          const reason = prompt('Reason for rejection:')
                          if (reason) rejectInstitutionMutation.mutate({ slug: inst.slug, reason })
                        }}
                      >
                        Decline
                      </Button>
                      <Button
                        surface="admin"
                        variant="primary"
                        size="dense"
                        onClick={() => {
                          const domainsStr = prompt('Enter comma-separated domains to verify for this campus:', 'apex.edu.in, apex.ac.in')
                          if (domainsStr) {
                            const domains = domainsStr.split(',').map((d) => d.trim()).filter(Boolean)
                            verifyInstitutionMutation.mutate({ slug: inst.slug, domains })
                          }
                        }}
                      >
                        Grant Institutional Clearance
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Withdrawal Disbursements Queue (Superadmin) */}
      {activeTab === 'withdrawals' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 overflow-x-auto">
              <Funnel className="w-3.5 h-3.5 text-text-3 mr-1" />
              {['ALL', 'PENDING', 'APPROVED', 'PAID', 'REJECTED'].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setWithdrawalFilter(st)}
                  className={`px-3 py-1.5 rounded-full text-caption font-medium transition-all ${
                    withdrawalFilter === st
                      ? 'bg-accent text-accent-contrast shadow-sm font-semibold'
                      : 'bg-surface text-text-2 hover:bg-subtle border border-line'
                  }`}
                >
                  {st === 'ALL' ? 'All Requests' : st}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-surface border border-line rounded-panel overflow-x-auto shadow-sm">
            <table className="w-full text-left border-collapse min-w-[760px]">
              <thead>
                <tr className="border-b border-line bg-subtle text-caption font-semibold text-text-2 sticky top-0">
                  <th className="py-3 px-4">Request & Date</th>
                  <th className="py-3 px-4">Club Organization</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Bank Destination</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line text-small">
                {isLoadingWithdrawals ? (
                  <tr>
                    <td colSpan={6} className="py-16 text-center text-small text-text-3">
                      Loading organizer withdrawal ledger...
                    </td>
                  </tr>
                ) : withdrawals.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-16 text-center text-small text-text-3">
                      ✓ No withdrawal requests found matching status "{withdrawalFilter}".
                    </td>
                  </tr>
                ) : (
                  withdrawals.map((w) => {
                    const snap = w.payout_details_snapshot || {}
                    const bankName = w.bank_name || snap.bank_name || 'Bank Transfer'
                    const accNum = w.masked_bank_account || snap.masked_account_number || snap.account_number_masked || '••••'
                    const ifsc = w.ifsc_code || snap.ifsc_code || ''

                    return (
                      <tr key={w.id} className="h-[56px] hover:bg-subtle/40 transition-colors">
                        <td className="py-2.5 px-4">
                          <p className="font-mono text-xs font-bold text-text">{w.request_id || w.id.slice(0, 8)}</p>
                          <p className="text-[11px] text-text-3">
                            {new Date(w.requested_at || w.created_at).toLocaleDateString()}
                          </p>
                        </td>

                        <td className="py-2.5 px-4">
                          <p className="font-semibold text-text">{w.organization_name || w.organization_id}</p>
                          <p className="text-[11px] text-text-3 font-mono">
                            By: {w.requester_name || w.requester_email || 'Organizer'}
                          </p>
                        </td>

                        <td className="py-2.5 px-4 font-mono font-bold text-accent">
                          ₹{w.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>

                        <td className="py-2.5 px-4 text-caption font-mono">
                          <p className="text-text font-semibold">{bankName}</p>
                          <p className="text-text-3">{accNum} {ifsc ? `· ${ifsc}` : ''}</p>
                        </td>

                        <td className="py-2.5 px-4">
                          <Badge
                            variant={
                              w.status === 'PAID'
                                ? 'success'
                                : w.status === 'REJECTED'
                                ? 'danger'
                                : w.status === 'APPROVED'
                                ? 'iris'
                                : 'warning'
                            }
                          >
                            {w.status}
                          </Badge>
                          {w.utr_reference && (
                            <p className="text-[10px] font-mono text-text-3 mt-0.5">UTR: {w.utr_reference}</p>
                          )}
                        </td>

                        <td className="py-2.5 px-4 text-right">
                          {w.status === 'PENDING' || w.status === 'APPROVED' ? (
                            <div className="flex items-center justify-end gap-1.5">
                              <Button
                                surface="admin"
                                variant="secondary"
                                size="dense"
                                onClick={() => {
                                  setSelectedWithdrawal(w)
                                  setActionModal('reject')
                                }}
                              >
                                Decline
                              </Button>
                              <Button
                                surface="admin"
                                variant="primary"
                                size="dense"
                                onClick={() => {
                                  setSelectedWithdrawal(w)
                                  setActionModal('pay')
                                }}
                              >
                                Disburse & Mark Paid
                              </Button>
                            </div>
                          ) : (
                            <span className="text-[11px] font-mono text-text-3">Settled</span>
                          )}
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 5: Master Platform Organization Directory */}
      {activeTab === 'directory' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 overflow-x-auto">
              <Funnel className="w-3.5 h-3.5 text-text-3 mr-1" />
              {['ALL', 'verified', 'pending', 'archived'].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setDirectoryFilter(st)}
                  className={`px-3 py-1.5 rounded-full text-caption font-medium transition-all ${
                    directoryFilter === st
                      ? 'bg-accent text-accent-contrast shadow-sm font-semibold'
                      : 'bg-surface text-text-2 hover:bg-subtle border border-line'
                  }`}
                >
                  {st === 'ALL' ? 'All Organizations' : st.charAt(0).toUpperCase() + st.slice(1)}
                </button>
              ))}
            </div>

            <div className="relative min-w-[240px]">
              <MagnifyingGlass className="w-4 h-4 text-text-3 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search club name, slug, or owner..."
                value={directorySearch}
                onChange={(e) => setDirectorySearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-small bg-surface border border-line rounded-input focus:outline-none focus:border-accent text-text placeholder:text-text-3"
              />
            </div>
          </div>

          <div className="bg-surface border border-line rounded-panel overflow-x-auto shadow-sm">
            <table className="w-full text-left border-collapse min-w-[760px]">
              <thead>
                <tr className="border-b border-line bg-subtle text-caption font-semibold text-text-2 sticky top-0">
                  <th className="py-3 px-4">Organization / Club</th>
                  <th className="py-3 px-4">Affiliation & Type</th>
                  <th className="py-3 px-4">Owner Contact</th>
                  <th className="py-3 px-4">Events</th>
                  <th className="py-3 px-4">Members</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line text-small">
                {isLoadingDirectory ? (
                  <tr>
                    <td colSpan={6} className="py-16 text-center text-small text-text-3">
                      Loading master organization directory...
                    </td>
                  </tr>
                ) : filteredDirectory.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-16 text-center text-small text-text-3">
                      No organizations matching search query.
                    </td>
                  </tr>
                ) : (
                  filteredDirectory.map((org) => (
                    <tr key={org.id} className="h-[54px] hover:bg-subtle/40 transition-colors">
                      <td className="py-2.5 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-accent/10 text-accent flex items-center justify-center font-bold text-xs">
                            {org.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-text">{org.name}</p>
                            <p className="text-[11px] text-text-3 font-mono">/{org.slug}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-2.5 px-4 text-caption">
                        <span className="font-semibold text-text uppercase text-[10px] tracking-wide block">
                          {org.type || 'Club'}
                        </span>
                        <span className="text-text-3 text-[11px]">
                          {org.parent_name ? `Parent: ${org.parent_name}` : org.is_institution ? 'Collegiate Institution' : 'Independent'}
                        </span>
                      </td>

                      <td className="py-2.5 px-4 text-caption">
                        <p className="text-text font-medium">{org.owner_name || 'Admin'}</p>
                        <p className="text-text-3 font-mono text-[11px]">{org.owner_email || '—'}</p>
                      </td>

                      <td className="py-2.5 px-4 font-mono font-semibold text-text">
                        {org.event_count}
                      </td>

                      <td className="py-2.5 px-4 font-mono font-semibold text-text">
                        {org.member_count}
                      </td>

                      <td className="py-2.5 px-4">
                        <Badge
                          variant={
                            org.status === 'verified'
                              ? 'success'
                              : org.status === 'pending'
                              ? 'warning'
                              : 'neutral'
                          }
                        >
                          {org.status.toUpperCase()}
                        </Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Disburse Modal */}
      {selectedWithdrawal && actionModal === 'pay' && (
        <Modal
          isOpen={Boolean(selectedWithdrawal && actionModal === 'pay')}
          onClose={() => {
            setSelectedWithdrawal(null)
            setActionModal(null)
          }}
          title="Disburse Funds & Record UTR Transfer"
        >
          <div className="space-y-4 text-small">
            <div className="p-3 bg-subtle rounded-card space-y-1.5 font-mono text-caption">
              <div className="flex justify-between">
                <span className="text-text-3">Organizer:</span>
                <span className="font-bold text-text">{selectedWithdrawal.organization_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-3">Disbursement Amount:</span>
                <span className="font-bold text-accent text-sm">
                  ₹{selectedWithdrawal.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-3">Destination:</span>
                <span className="text-text">
                  {selectedWithdrawal.bank_name || selectedWithdrawal.payout_details_snapshot?.bank_name} (
                  {selectedWithdrawal.masked_bank_account || selectedWithdrawal.payout_details_snapshot?.masked_account_number})
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-caption font-semibold text-text block">
                Bank UTR / IMPS Transfer Reference <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. UTR2026102209182348"
                value={utrReference}
                onChange={(e) => setUtrReference(e.target.value)}
                className="w-full h-10 px-3 bg-surface border border-line rounded-input font-mono text-small text-text focus:outline-none focus:border-accent uppercase"
              />
              <p className="text-caption text-text-3">
                This transaction code will be recorded in the immutable ledger and sent to the club treasurer.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="secondary"
                size="dense"
                onClick={() => {
                  setSelectedWithdrawal(null)
                  setActionModal(null)
                }}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="dense"
                disabled={!utrReference.trim() || reviewWithdrawalMutation.isPending}
                loading={reviewWithdrawalMutation.isPending}
                onClick={() => {
                  reviewWithdrawalMutation.mutate({
                    withdrawalId: selectedWithdrawal.id,
                    action: 'pay',
                    transfer_reference: utrReference.trim(),
                  })
                }}
              >
                Confirm Payout & Seal UTR
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Decline Withdrawal Modal */}
      {selectedWithdrawal && actionModal === 'reject' && (
        <Modal
          isOpen={Boolean(selectedWithdrawal && actionModal === 'reject')}
          onClose={() => {
            setSelectedWithdrawal(null)
            setActionModal(null)
          }}
          title="Decline Withdrawal Request"
        >
          <div className="space-y-4 text-small">
            <p className="text-text-2">
              Declining this request will immediately refund ₹{selectedWithdrawal.amount.toLocaleString()} back to the
              organizer's available wallet balance.
            </p>

            <div className="space-y-1.5">
              <label className="text-caption font-semibold text-text block">
                Decline Rationale <span className="text-danger">*</span>
              </label>
              <textarea
                rows={3}
                placeholder="e.g. Bank IFSC code does not match registered campus gymkhana account..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full p-3 bg-surface border border-line rounded-input text-small text-text focus:outline-none focus:border-accent"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="secondary"
                size="dense"
                onClick={() => {
                  setSelectedWithdrawal(null)
                  setActionModal(null)
                }}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="dense"
                disabled={!rejectionReason.trim() || reviewWithdrawalMutation.isPending}
                loading={reviewWithdrawalMutation.isPending}
                onClick={() => {
                  reviewWithdrawalMutation.mutate({
                    withdrawalId: selectedWithdrawal.id,
                    action: 'reject',
                    reason: rejectionReason.trim(),
                  })
                }}
              >
                Decline & Refund Balance
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Propose Club Modal */}
      <Modal
        isOpen={isProposeModalOpen}
        onClose={() => setIsProposeModalOpen(false)}
        title="Propose Sub-Organization / Club Charter"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault()
            createProposalMutation.mutate({
              name: proposedName,
              contact_email: proposedEmail || undefined,
              reason: proposedReason,
            })
          }}
          className="space-y-4"
        >
          <div className="space-y-1.5">
            <label className="block text-caption font-semibold text-text">
              Proposed Organization Name <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Apex Autonomous Robotics Society"
              value={proposedName}
              onChange={(e) => setProposedName(e.target.value)}
              required
              className="w-full h-10 px-3 bg-surface border border-line rounded-btn text-small text-text focus:outline-none focus:border-accent"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-caption font-semibold text-text">
              Official Contact Email
            </label>
            <input
              type="email"
              placeholder="robotics@campus.edu"
              value={proposedEmail}
              onChange={(e) => setProposedEmail(e.target.value)}
              className="w-full h-10 px-3 bg-surface border border-line rounded-btn text-small text-text focus:outline-none focus:border-accent font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-caption font-semibold text-text">
              Charter & Purpose Statement <span className="text-danger">*</span>
            </label>
            <textarea
              rows={4}
              placeholder="Provide a detailed rationale and proposed faculty advisor/lead..."
              value={proposedReason}
              onChange={(e) => setProposedReason(e.target.value)}
              required
              className="w-full p-3 bg-surface border border-line rounded-btn text-small text-text focus:outline-none focus:border-accent"
            />
            <p className="text-caption text-text-3">
              Explain the core mission, target audience, and planned activities for institutional clearance.
            </p>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsProposeModalOpen(false)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createProposalMutation.isPending || !proposedName.trim()}
              className="gap-2 bg-accent text-on-accent text-xs font-semibold"
            >
              {createProposalMutation.isPending ? (
                <div className="w-4 h-4 border-2 border-on-accent border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <ShieldCheck size={16} weight="bold" />
                  <span>Submit Proposal</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
