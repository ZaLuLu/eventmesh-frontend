// Hallmark macrostructure: AdminConsole-Roles
import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api, InvitationRead, OrgRoleType } from '@/api'
import { useClubs } from '@/hooks/useClubs'
import { useOrg } from '@/hooks/useOrg'
import { useToast } from '@/design-system/primitives/Toast'
import { Button } from '@/design-system/primitives/Button'
import { Modal } from '@/design-system/primitives/Modal'
import {
  Copy,
  Check,
  Trash,
  Clock,
  ShieldCheck,
  EnvelopeSimple,
  Link as LinkIcon,
} from '@/design-system/Icon'
import { UserPlus } from '@phosphor-icons/react'

export const AdminRolesPage: React.FC = () => {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const { data: clubs = [] } = useClubs()
  const { organization } = useOrg()
  const orgSlug = organization?.slug || 'apex-institute'

  const [activeTab, setActiveTab] = useState<'staff' | 'invitations'>('staff')

  // Users / Roles Query
  const { data: users = [], isLoading: isLoadingUsers } = useQuery({
    queryKey: ['admin-users-roles'],
    queryFn: () => api.usersRoles.getUsers('org-1'),
  })

  // Invitations Query
  const { data: invitations = [], isLoading: isLoadingInvs } = useQuery<InvitationRead[]>({
    queryKey: ['admin-invitations', orgSlug],
    queryFn: async () => {
      if (api.organizations.listInvitations) {
        return api.organizations.listInvitations(orgSlug)
      }
      return []
    },
    enabled: activeTab === 'invitations',
  })

  const updateRoleMutation = useMutation({
    mutationFn: ({ userId, role, clubId }: { userId: string; role: string; clubId?: string }) =>
      api.usersRoles.updateRole(userId, role, clubId),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['admin-users-roles'] })
      toast({
        title: 'Role Assignment Saved',
        message: `Updated privileges for ${res.name}.`,
        type: 'success',
      })
    },
  })

  // Create Invitation State & Mutation
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)
  const [inviteRole, setInviteRole] = useState<OrgRoleType>('co_admin')
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteDays, setInviteDays] = useState(7)
  const [createdInviteUrl, setCreatedInviteUrl] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const createInvitationMutation = useMutation({
    mutationFn: async () => {
      if (!api.organizations.createInvitation) throw new Error('Not implemented')
      return api.organizations.createInvitation(orgSlug, {
        role: inviteRole,
        recipient_email: inviteEmail.trim() ? inviteEmail.trim() : null,
        expires_in_days: Number(inviteDays),
      })
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['admin-invitations'] })
      setCreatedInviteUrl(res.invite_url)
      toast({
        title: 'Invitation Created',
        message: 'Share the link with the new team member.',
        type: 'success',
      })
    },
    onError: (err: any) => {
      toast({
        title: 'Invitation Failed',
        message: err?.message || 'Could not create invitation.',
        type: 'error',
      })
    },
  })

  const revokeInvitationMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!api.organizations.revokeInvitation) throw new Error('Not implemented')
      return api.organizations.revokeInvitation(orgSlug, id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-invitations'] })
      toast({ title: 'Invitation Revoked', message: 'The link is no longer valid.', type: 'info' })
    },
  })

  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url)
    setCopied(true)
    toast({ title: 'Copied to Clipboard', message: 'Invitation URL ready to share.', type: 'info' })
    setTimeout(() => setCopied(false), 2000)
  }

  const handleRoleChange = (userId: string, newRole: string, currentClubId?: string) => {
    updateRoleMutation.mutate({ userId, role: newRole, clubId: currentClubId })
  }

  const handleClubChange = (userId: string, currentRole: string, newClubId: string) => {
    updateRoleMutation.mutate({ userId, role: currentRole, clubId: newClubId })
  }

  return (
    <div className="space-y-6">
      {/* Header with Title & Action */}
      <div className="pb-4 border-b border-line flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-caption font-mono font-bold text-accent uppercase tracking-wider block mb-1">
            Governance & Staff Access
          </span>
          <h1 className="text-h2 font-semibold text-text tracking-tight">
            Roles & Access Management
          </h1>
          <p className="text-small text-text-2 mt-0.5">
            Configure permission scopes, invite new coordinators, and audit active authorization levels.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => {
              setCreatedInviteUrl(null)
              setInviteEmail('')
              setIsInviteModalOpen(true)
            }}
            className="gap-2 bg-accent text-on-accent font-semibold text-xs py-2 px-3.5 shadow-offset-xs"
          >
            <UserPlus size={16} weight="bold" />
            <span>Invite Staff Member</span>
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-line">
        <button
          type="button"
          onClick={() => setActiveTab('staff')}
          className={`pb-3 px-3 text-xs font-mono font-bold uppercase tracking-wider transition-colors border-b-2 ${
            activeTab === 'staff'
              ? 'border-accent text-accent'
              : 'border-transparent text-text-3 hover:text-text'
          }`}
        >
          Active Directory ({users.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('invitations')}
          className={`pb-3 px-3 text-xs font-mono font-bold uppercase tracking-wider transition-colors border-b-2 flex items-center gap-1.5 ${
            activeTab === 'invitations'
              ? 'border-accent text-accent'
              : 'border-transparent text-text-3 hover:text-text'
          }`}
        >
          <span>Staff Invitations</span>
          {invitations.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-xs bg-subtle text-text-2 font-mono">
              {invitations.length}
            </span>
          )}
        </button>
      </div>

      {/* Tab 1: Active Staff Directory */}
      {activeTab === 'staff' && (
        <div className="bg-surface border border-line rounded-panel overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-line bg-subtle text-caption font-medium text-text-2 sticky top-0">
                <th className="py-3 px-4 font-semibold">Staff Member</th>
                <th className="py-3 px-4 font-semibold">Assigned Role</th>
                <th className="py-3 px-4 font-semibold">Club Scope</th>
                <th className="py-3 px-4 text-right font-semibold">Scope Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line text-small">
              {isLoadingUsers ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-small text-text-3">
                    Reading staff directory...
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="h-[52px] hover:bg-subtle/50 transition-colors">
                    <td className="py-2.5 px-4">
                      <p className="font-medium text-text text-small">{u.name}</p>
                      <p className="text-caption text-text-3 font-mono">{u.email}</p>
                    </td>

                    <td className="py-2.5 px-4">
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value, u.clubId)}
                        className="bg-surface border border-line rounded-btn p-1.5 text-small text-text focus:outline-none focus:border-accent"
                      >
                        <option value="platform_admin">Platform Admin</option>
                        <option value="org_admin">Org Admin</option>
                        <option value="club_admin">Club Admin</option>
                        <option value="volunteer">Volunteer</option>
                        <option value="attendee">Attendee</option>
                      </select>
                    </td>

                    <td className="py-2.5 px-4">
                      {u.role === 'club_admin' ? (
                        <select
                          value={u.clubId || ''}
                          onChange={(e) => handleClubChange(u.id, u.role, e.target.value)}
                          className="bg-surface border border-line rounded-btn p-1.5 text-small text-text focus:outline-none focus:border-accent"
                        >
                          <option value="">Select Club...</option>
                          {clubs.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className="text-caption text-text-3">
                          {u.role === 'platform_admin' || u.role === 'org_admin'
                            ? 'Global (All Clubs)'
                            : 'None'}
                        </span>
                      )}
                    </td>

                    <td className="py-2.5 px-4 text-right text-caption text-text-3">
                      {u.role === 'platform_admin' && 'Sovereign universal privileges'}
                      {u.role === 'org_admin' && 'Full organization governance'}
                      {u.role === 'club_admin' && `Scoped strictly to ${u.clubName || 'club'}`}
                      {u.role === 'volunteer' && 'Check-in terminal access'}
                      {u.role === 'attendee' && 'Public member'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 2: Staff Invitations Queue */}
      {activeTab === 'invitations' && (
        <div className="space-y-4">
          <div className="bg-surface border border-line rounded-panel overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-line bg-subtle text-caption font-medium text-text-2">
                  <th className="py-3 px-4 font-semibold">Recipient / Target</th>
                  <th className="py-3 px-4 font-semibold">Role</th>
                  <th className="py-3 px-4 font-semibold">Invited By</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold">Expires</th>
                  <th className="py-3 px-4 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line text-small">
                {isLoadingInvs ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-small text-text-3">
                      Checking active invitations...
                    </td>
                  </tr>
                ) : invitations.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-small text-text-3">
                      No active invitations found. Click &quot;Invite Staff Member&quot; to generate an invitation link.
                    </td>
                  </tr>
                ) : (
                  invitations.map((inv) => {
                    const isPending = inv.status === 'pending'
                    const isAccepted = inv.status === 'accepted'
                    const isRevoked = inv.status === 'revoked'
                    const isExpired = new Date(inv.expires_at) < new Date()

                    return (
                      <tr key={inv.id} className="h-[52px] hover:bg-subtle/50 transition-colors">
                        <td className="py-2.5 px-4 font-medium text-text">
                          {inv.recipient_email ? (
                            <span className="font-mono text-xs">{inv.recipient_email}</span>
                          ) : (
                            <span className="text-text-3 italic font-mono text-xs">Anyone with link</span>
                          )}
                        </td>

                        <td className="py-2.5 px-4">
                          <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-accent/15 text-accent uppercase">
                            {inv.role}
                          </span>
                        </td>

                        <td className="py-2.5 px-4 text-caption text-text-2">
                          {inv.invited_by_name || 'Administrator'}
                        </td>

                        <td className="py-2.5 px-4">
                          {isAccepted ? (
                            <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-mint/15 text-mint uppercase">
                              Accepted
                            </span>
                          ) : isRevoked ? (
                            <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-subtle text-text-3 uppercase">
                              Revoked
                            </span>
                          ) : isExpired ? (
                            <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-coral/15 text-coral uppercase">
                              Expired
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-warning/15 text-warning uppercase">
                              Pending
                            </span>
                          )}
                        </td>

                        <td className="py-2.5 px-4 text-caption text-text-3 font-mono">
                          {new Date(inv.expires_at).toLocaleDateString()}
                        </td>

                        <td className="py-2.5 px-4 text-right">
                          {isPending && !isExpired && (
                            <div className="flex items-center justify-end gap-2">
                              {inv.organization_slug && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleCopy(`${window.location.origin}/invite/${inv.id}`)
                                  }
                                  className="p-1.5 text-text-2 hover:text-accent hover:bg-subtle rounded-btn transition-colors"
                                  title="Copy invite URL"
                                >
                                  <LinkIcon size={16} />
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => revokeInvitationMutation.mutate(inv.id)}
                                className="p-1.5 text-text-2 hover:text-coral hover:bg-coral/10 rounded-btn transition-colors"
                                title="Revoke invitation"
                              >
                                <Trash size={16} />
                              </button>
                            </div>
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

      {/* Create Invitation Modal */}
      <Modal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        title="Invite New Staff Member"
        surface="admin"
      >
        <div className="p-6 space-y-5">
          {createdInviteUrl ? (
            <div className="space-y-4">
              <div className="p-4 rounded-[10px] bg-mint/10 border border-mint/25 text-mint text-xs font-semibold flex items-center gap-2">
                <Check size={18} weight="bold" />
                <span>Invitation link created successfully!</span>
              </div>

              <div className="space-y-1.5">
                <label className="text-caption font-bold text-text-2 uppercase font-mono">
                  Shareable Link
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={createdInviteUrl}
                    className="flex-1 h-10 px-3 bg-subtle border border-line rounded-btn font-mono text-xs text-text select-all"
                  />
                  <Button
                    onClick={() => handleCopy(createdInviteUrl)}
                    className="gap-1.5 bg-ink text-paper text-xs py-2 px-3"
                  >
                    {copied ? <Check size={14} weight="bold" /> : <Copy size={14} weight="bold" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </Button>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <Button
                  onClick={() => setIsInviteModalOpen(false)}
                  className="bg-accent text-on-accent text-xs font-semibold"
                >
                  Done
                </Button>
              </div>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                createInvitationMutation.mutate()
              }}
              className="space-y-4"
            >
              <div className="space-y-1.5">
                <label className="block text-caption font-semibold text-text">
                  Role Authorization
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as OrgRoleType)}
                  className="w-full h-10 px-3 bg-surface border border-line rounded-btn text-small text-text focus:outline-none focus:border-accent"
                >
                  <option value="co_admin">Co-Admin (Can manage events, staff, and settings)</option>
                  <option value="manager">Manager (Can manage events and registrations)</option>
                  <option value="member">Staff Member / Volunteer (Desk check-ins)</option>
                </select>
                <p className="text-caption text-text-3">Determines permissions granted when the invitation is claimed.</p>
              </div>

              <div className="space-y-1.5">
                <label className="block text-caption font-semibold text-text">
                  Recipient Email (Optional)
                </label>
                <div className="relative">
                  <input
                    type="email"
                    placeholder="coordinator@campus.edu"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="w-full h-10 px-3 pr-9 bg-surface border border-line rounded-btn text-small text-text placeholder:text-text-3 focus:outline-none focus:border-accent font-mono"
                  />
                  <EnvelopeSimple
                    size={16}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-3 pointer-events-none"
                  />
                </div>
                <p className="text-caption text-text-3">If specified, only this email can claim this link. Leave blank for a reusable single-use link.</p>
              </div>

              <div className="space-y-1.5">
                <label className="block text-caption font-semibold text-text">
                  Link Expiration
                </label>
                <select
                  value={inviteDays}
                  onChange={(e) => setInviteDays(Number(e.target.value))}
                  className="w-full h-10 px-3 bg-surface border border-line rounded-btn text-small text-text focus:outline-none focus:border-accent font-mono"
                >
                  <option value={3}>3 Days</option>
                  <option value={7}>7 Days (Standard)</option>
                  <option value={14}>14 Days</option>
                  <option value={30}>30 Days</option>
                </select>
                <p className="text-caption text-text-3">Number of days before this link expires.</p>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setIsInviteModalOpen(false)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createInvitationMutation.isPending}
                  className="gap-2 bg-accent text-on-accent text-xs font-semibold"
                >
                  {createInvitationMutation.isPending ? (
                    <div className="w-4 h-4 border-2 border-on-accent border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <UserPlus size={16} weight="bold" />
                      <span>Generate Invite Link</span>
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}
        </div>
      </Modal>
    </div>
  )
}
