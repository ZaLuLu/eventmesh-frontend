import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ShieldCheck, UserCheck, RefreshCw, ArrowRight } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { SEED_DEMO_USERS } from '@/api/adapters/mock/seedData'
import { mockStore } from '@/api/adapters/mock'
import { Button } from '@/design-system/primitives/Button'
import { useToast } from '@/design-system/primitives/Toast'

export const DevAccountsPage: React.FC = () => {
  const navigate = useNavigate()
  const { session, switchDemoAccount } = useAuth()
  const { toast } = useToast()

  const handleSelectAccount = async (role: string, clubId?: string) => {
    try {
      const user = await switchDemoAccount({ role, clubId })
      toast({
        title: 'Demo Identity Activated',
        message: `Now acting as ${user.name} (${user.role}).`,
        type: 'success',
      })
      if (['platform_admin', 'org_admin', 'club_admin', 'volunteer'].includes(user.role)) {
        navigate('/admin')
      } else {
        navigate('/me')
      }
    } catch (err) {
      toast({ title: 'Switch failed', type: 'error' })
    }
  }

  const handleResetData = () => {
    if (mockStore) {
      mockStore.reset()
      toast({
        title: 'Mock Database Reset',
        message: 'All 30 events, clubs, registrations, and certificates restored to seed defaults.',
        type: 'info',
      })
      window.location.reload()
    }
  }

  return (
    <div className="w-full bg-paper text-ink min-h-screen py-12 sm:py-20">
      <div className="px-[4vw] max-w-4xl mx-auto space-y-10">
        <div className="border-b border-ink-15 pb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="font-mono text-[11px] uppercase tracking-widecaps text-ink-60 block mb-2">
              Development & Evaluation Environment
            </span>
            <h1 className="font-display text-4xl sm:text-6xl uppercase text-ink">
              Dev Accounts Matrix
            </h1>
            <p className="font-body text-sm sm:text-base text-ink-60 mt-2 max-w-xl">
              Switch instantaneous personas across platform admin, organization president, independent club leads, check-in volunteers, and attendees.
            </p>
          </div>

          <Button
            variant="secondary"
            size="sm"
            icon={<RefreshCw className="h-4 w-4" />}
            onClick={handleResetData}
          >
            Reset Seed Data
          </Button>
        </div>

        {/* Current Active Persona */}
        <div className="p-6 border-2 border-ink bg-paper-deep/30 flex items-center justify-between">
          <div>
            <span className="font-mono text-[10px] uppercase text-ink-60 block mb-1">
              Currently Activated Identity
            </span>
            <p className="font-display text-2xl uppercase text-ink">
              {session?.name || 'Anonymous Visitor'}
            </p>
            <p className="font-mono text-xs uppercase text-ink-60 mt-0.5">
              Role: {session?.role || 'None'} {session?.clubName ? `· Club: ${session.clubName}` : ''}
            </p>
          </div>

          <span className="h-3 w-3 bg-emerald-600 rounded-full" />
        </div>

        {/* Personas Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {SEED_DEMO_USERS.map((user) => {
            const isCurrent = session?.id === user.id

            return (
              <div
                key={user.id}
                className={`p-6 border-2 transition-all flex flex-col justify-between space-y-6 ${
                  isCurrent ? 'border-ink bg-paper shadow-none' : 'border-ink-15 hover:border-ink bg-paper'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between font-mono text-[10px] uppercase mb-2">
                    <span className="font-bold text-ink bg-paper-deep px-2 py-0.5 border border-ink-15">
                      {user.role.replace('_', ' ')}
                    </span>
                    {user.clubName && (
                      <span className="flex items-center gap-1.5 font-semibold text-ink">
                        <span
                          className="h-2 w-2 inline-block"
                          style={{ backgroundColor: user.clubColor }}
                        />
                        {user.clubName}
                      </span>
                    )}
                  </div>

                  <h3 className="font-display text-2xl uppercase text-ink">{user.name}</h3>
                  <p className="font-mono text-xs text-ink-60 mt-1">{user.email}</p>

                  <p className="font-body text-xs text-ink-60 mt-3">
                    {user.role === 'platform_admin' &&
                      'Superuser: complete sovereign control across all clubs, settings, and audits.'}
                    {user.role === 'org_admin' &&
                      'President: full organization governance, approvals, analytics, and all clubs.'}
                    {user.role === 'club_admin' &&
                      `Scoped Admin: isolated control strictly over ${user.clubName}. Cannot view or edit other clubs.`}
                    {user.role === 'volunteer' &&
                      'Mobile scanner desk: fast ticket check-in and attendance counting.'}
                    {user.role === 'attendee' &&
                      'Member: browse, register, inspect access passes, and download certificates.'}
                  </p>
                </div>

                <div>
                  <Button
                    variant={isCurrent ? 'secondary' : 'primary'}
                    size="sm"
                    fullWidth
                    disabled={isCurrent}
                    onClick={() => handleSelectAccount(user.role, user.clubId)}
                  >
                    {isCurrent ? 'Active Persona' : 'Switch To This Account'}
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
