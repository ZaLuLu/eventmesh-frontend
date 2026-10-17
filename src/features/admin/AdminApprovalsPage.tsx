// Hallmark macrostructure: AdminConsole-Approvals
import React, { useState } from 'react'
import { Check, X, Buildings, Plus, ShieldCheck, ArrowRight } from '@phosphor-icons/react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/hooks/useAuth'
import { useOrg } from '@/hooks/useOrg'
import { api, ProposalRead, ProposalCreate } from '@/api'
import { Button } from '@/design-system/primitives/Button'
import { Modal } from '@/design-system/primitives/Modal'
import { formatDate } from '@/lib/dates'
import { useToast } from '@/design-system/primitives/Toast'

export const AdminApprovalsPage: React.FC = () => {
  const { session } = useAuth()
  const { organization } = useOrg()
  const orgSlug = organization?.slug || 'apex-institute'
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const [activeTab, setActiveTab] = useState<'events' | 'proposals'>('events')

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
            Review event drafts and sub-organization charters awaiting institutional clearance.
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

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-line">
        <button
          type="button"
          onClick={() => setActiveTab('events')}
          className={`pb-3 px-3 text-xs font-mono font-bold uppercase tracking-wider transition-colors border-b-2 flex items-center gap-1.5 ${
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
          className={`pb-3 px-3 text-xs font-mono font-bold uppercase tracking-wider transition-colors border-b-2 flex items-center gap-1.5 ${
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
