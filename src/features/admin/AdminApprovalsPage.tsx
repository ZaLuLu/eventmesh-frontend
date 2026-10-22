import React, { useState } from 'react'
import { Check, X, Buildings, Plus, ShieldCheck, ArrowRight, GraduationCap, Globe, Bank, CheckCircle } from '@phosphor-icons/react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/hooks/useAuth'
import { useOrg } from '@/hooks/useOrg'
import { api, ProposalRead, ProposalCreate, PlatformOverview, InstitutionCandidate } from '@/api'
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

  const [activeTab, setActiveTab] = useState<'events' | 'proposals' | 'institutions'>('events')

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
      if (!api.organizations.reviewProposal) throw new Error('Not implemented')
      return api.organizations.reviewProposal(proposalId, { action, reason })
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['admin-proposals'] })
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

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="pb-4 border-b border-line flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-caption font-mono font-bold text-accent uppercase tracking-wider block mb-1">
            Governance & Editorial Pipeline
          </span>
          <h1 className="text-h2 font-semibold text-text tracking-tight">
            Curatorial Approvals Queue
          </h1>
          <p className="text-small text-text-2 mt-0.5">
            Review event drafts, sub-organization charters, and institutional verification candidates.
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
                    <div
                      key={prop.id}
                      className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="space-y-1.5 max-w-2xl">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-accent uppercase">
                            {prop.proposed_organization_slug || 'club-proposal'}
                          </span>
                          <span className="text-text-3">·</span>
                          {isPending ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-warning/15 text-warning uppercase">
                              Pending Review
                            </span>
                          ) : isApproved ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-mint/15 text-mint uppercase">
                              Approved
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-coral/15 text-coral uppercase">
                              Rejected
                            </span>
                          )}
                        </div>

                        <h3 className="text-h3 font-semibold text-text">
                          {prop.proposed_organization_name || 'Proposed Sub-Organization'}
                        </h3>

                        {prop.reason && (
                          <p className="text-small text-text-2 leading-relaxed">
                            {prop.reason}
                          </p>
                        )}

                        <div className="text-caption text-text-3 font-mono pt-1 flex flex-wrap items-center gap-3">
                          <span>Proposer: {prop.proposer_name || 'Coordinator'}</span>
                          <span>·</span>
                          <span>Parent Org: {prop.parent_organization_name || orgSlug}</span>
                          <span>·</span>
                          <span>Date: {new Date(prop.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>

                      {isPending && (
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Button
                            surface="admin"
                            variant="secondary"
                            size="sm"
                            loading={reviewProposalMutation.isPending}
                            onClick={() =>
                              reviewProposalMutation.mutate({
                                proposalId: prop.id,
                                action: 'reject',
                                reason: 'Does not meet curriculum criteria at this time.',
                              })
                            }
                          >
                            Reject
                          </Button>
                          <Button
                            surface="admin"
                            variant="primary"
                            size="sm"
                            loading={reviewProposalMutation.isPending}
                            icon={<Check size={16} weight="bold" />}
                            onClick={() =>
                              reviewProposalMutation.mutate({
                                proposalId: prop.id,
                                action: 'approve',
                              })
                            }
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

      {/* Tab 3: Institutional Clearance & Domain Verification */}
      {activeTab === 'institutions' && (
        <div className="bg-surface border border-line rounded-panel p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-line">
            <div>
              <h2 className="text-h3 font-semibold text-text">Institution Candidates & Verified Roots</h2>
              <p className="text-small text-text-2">
                Authorize apex campus institutions and verify affiliated academic domain namespaces.
              </p>
            </div>
            <span className="text-xs font-mono text-text-3">{institutions.length} candidates registered</span>
          </div>

          {isLoadingInstitutions ? (
            <div className="p-8 text-center text-text-3 font-mono text-xs">Loading institutional candidates...</div>
          ) : institutions.length === 0 ? (
            <div className="p-8 text-center text-text-3">
              No institution verification candidates pending review.
            </div>
          ) : (
            <div className="divide-y divide-line">
              {institutions.map((inst) => (
                <div key={inst.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1.5 max-w-xl">
                    <div className="flex items-center gap-2.5">
                      <h3 className="font-semibold text-base text-text">{inst.name}</h3>
                      {inst.is_institution ? (
                        <Badge variant="success" size="sm">Verified Institution</Badge>
                      ) : (
                        <Badge variant="warning" size="sm">Candidate</Badge>
                      )}
                    </div>
                    <p className="text-xs text-text-2">
                      Slug: <span className="font-mono text-text">{inst.slug}</span>
                      {inst.contact_email && <span> &bull; Contact: {inst.contact_email}</span>}
                    </p>
                    <div className="flex items-center gap-1.5 flex-wrap pt-1">
                      <span className="text-xs text-text-3 font-medium">Domains:</span>
                      {inst.domains.length > 0 ? (
                        inst.domains.map((dom) => (
                          <span key={dom} className="text-xs font-mono px-2 py-0.5 rounded bg-surface-subtle border border-line text-text">
                            {dom}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-text-3 italic">No domain rules registered</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {!inst.is_institution ? (
                      <>
                        <Button
                          surface="admin"
                          variant="secondary"
                          size="sm"
                          loading={rejectInstitutionMutation.isPending}
                          onClick={() => rejectInstitutionMutation.mutate({ slug: inst.slug })}
                        >
                          Decline
                        </Button>
                        <Button
                          surface="admin"
                          variant="primary"
                          size="sm"
                          loading={verifyInstitutionMutation.isPending}
                          icon={<ShieldCheck size={16} weight="bold" />}
                          onClick={() =>
                            verifyInstitutionMutation.mutate({
                              slug: inst.slug,
                              domains: inst.domains.length > 0 ? inst.domains : [`${inst.slug}.edu`],
                            })
                          }
                        >
                          Verify Institution
                        </Button>
                      </>
                    ) : (
                      <div className="flex items-center gap-1 text-xs text-success font-semibold">
                        <CheckCircle size={15} weight="fill" />
                        <span>Charter Verified</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Propose Club Modal */}
      <Modal
        isOpen={isProposeModalOpen}
        onClose={() => setIsProposeModalOpen(false)}
        title="Propose Child Organization or Club"
        surface="admin"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault()
            createProposalMutation.mutate({
              name: proposedName,
              contact_email: proposedEmail.trim() || undefined,
              reason: proposedReason.trim() || undefined,
            })
          }}
          className="p-6 space-y-4"
        >
          <div className="space-y-1.5">
            <label className="block text-caption font-semibold text-text">
              Club / Organization Name <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Autonomous Robotics Society"
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
