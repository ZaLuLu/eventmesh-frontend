import React, { useState } from 'react'
import { ShieldCheck, UserCheck } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api, UserRoleRecord } from '@/api'
import { useClubs } from '@/hooks/useClubs'
import { Button } from '@/design-system/primitives/Button'
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
    <div className="space-y-6">
      <div className="pb-6 border-b border-[#C9D0D4]">
        <span className="font-mono text-[10px] uppercase tracking-wide text-ink-60 block mb-1">
          Governance & Permissions Access
        </span>
        <h1 className="font-display text-3xl sm:text-4xl uppercase text-ink">
          Roles & Staff Privileges
        </h1>
        <p className="font-body text-xs text-ink-60 mt-0.5">
          Assign platform administrators, organization chairs, club leads, and check-in volunteers.
        </p>
      </div>

      <div className="bg-paper border border-[#C9D0D4] overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="border-b border-[#C9D0D4] bg-[#E6EAEC]/60 font-mono text-[10px] uppercase text-ink-60 tracking-wider">
              <th className="py-3 px-4">Staff Member</th>
              <th className="py-3 px-4">Assigned Role</th>
              <th className="py-3 px-4">Club Scope</th>
              <th className="py-3 px-4 text-right">Scope Description</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#C9D0D4] font-body text-xs">
            {isLoading ? (
              <tr>
                <td colSpan={4} className="py-12 text-center font-mono text-ink-60 uppercase">
                  Reading staff directory...
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id} className="hover:bg-black/5 transition-colors">
                  <td className="py-3.5 px-4">
                    <p className="font-semibold text-ink text-sm">{u.name}</p>
                    <p className="font-mono text-[11px] text-ink-60">{u.email}</p>
                  </td>

                  <td className="py-3.5 px-4">
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u.id, e.target.value, u.clubId)}
                      className="bg-paper border border-[#C9D0D4] p-1.5 font-mono text-xs uppercase focus:outline-none"
                    >
                      <option value="platform_admin">Platform Admin</option>
                      <option value="org_admin">Org Admin</option>
                      <option value="club_admin">Club Admin</option>
                      <option value="volunteer">Volunteer</option>
                      <option value="attendee">Attendee</option>
                    </select>
                  </td>

                  <td className="py-3.5 px-4">
                    {u.role === 'club_admin' ? (
                      <select
                        value={u.clubId || ''}
                        onChange={(e) => handleClubChange(u.id, u.role, e.target.value)}
                        className="bg-paper border border-[#C9D0D4] p-1.5 font-mono text-xs uppercase focus:outline-none"
                      >
                        <option value="">Select Club...</option>
                        {clubs.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className="font-mono text-ink-60 text-[11px]">
                        {u.role === 'platform_admin' || u.role === 'org_admin'
                          ? 'Global (All Clubs)'
                          : 'None'}
                      </span>
                    )}
                  </td>

                  <td className="py-3.5 px-4 text-right font-mono text-[11px] text-ink-60">
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
