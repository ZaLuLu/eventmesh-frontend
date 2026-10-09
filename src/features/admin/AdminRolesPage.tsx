import React from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/api'
import { useClubs } from '@/hooks/useClubs'
import { useToast } from '@/design-system/primitives/Toast'

export const AdminRolesPage: React.FC = () => {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const { data: clubs = [] } = useClubs()

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['admin-users-roles'],
    queryFn: () => api.usersRoles.getUsers('org-1'),
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

  const handleRoleChange = (userId: string, newRole: string, currentClubId?: string) => {
    updateRoleMutation.mutate({ userId, role: newRole, clubId: currentClubId })
  }

  const handleClubChange = (userId: string, currentRole: string, newClubId: string) => {
    updateRoleMutation.mutate({ userId, role: currentRole, clubId: newClubId })
  }

  return (
    <div className="space-y-4">
      <div className="pb-4 border-b border-line">
        <span className="text-caption font-semibold text-accent block mb-0.5">
          Governance & Permissions Access
        </span>
        <h1 className="text-h2 font-semibold text-text">
          Roles & Staff Privileges
        </h1>
        <p className="text-small text-text-2 mt-0.5">
          Assign platform administrators, organization chairs, club leads, and check-in volunteers.
        </p>
      </div>

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
            {isLoading ? (
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
    </div>
  )
}
