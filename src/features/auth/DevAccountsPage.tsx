import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ShieldCheck, UserCheck, RefreshCw, ArrowRight, Check } from 'lucide-react'
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
        title: 'Demo Persona Activated',
        message: `Now acting as ${user.name} (${user.role}).`,
        type: 'success',
      })
      if (['platform_admin', 'org_admin', 'club_admin', 'volunteer'].includes(user.role)) {
        navigate('/admin')
      } else {
        navigate('/attendee/dashboard')
      }
    } catch {
      toast({ title: 'Switch failed', type: 'error' })
    }
  }

  const handleResetData = () => {
    if (mockStore) {
      mockStore.reset()
      toast({
        title: 'Mock Database Reset',
        message: 'All events, clubs, registrations, and certificates restored to seed defaults.',
        type: 'info',
      })
      window.location.reload()
    }
  }

  return (
    <div className="w-full bg-canvas text-md-on-surface min-h-screen py-10 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
        <div className="border-b border-[#DADCE0] pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-semibold text-md-primary block mb-1">
              Development Environment
            </span>
            <h1 className="font-display font-bold text-3xl sm:text-4xl text-slate-900 tracking-tight">
              Demo Personas & Role Switcher
            </h1>
            <p className="text-sm text-slate-500 mt-1 max-w-xl font-medium">
              Switch instantaneous personas across platform administrator, organization executive, independent club leads, check-in volunteers, and attendees.
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
        <div className="p-6 rounded-2xl border border-[#D3E3FD] bg-md-primary-container text-md-on-primary-container flex items-center justify-between shadow-subtle">
          <div>
            <span className="text-xs font-semibold text-md-primary uppercase tracking-normal block mb-1">
              Currently Active Persona
            </span>
            <p className="font-display font-bold text-xl sm:text-2xl text-slate-900">
              {session?.name || 'Anonymous Visitor'}
            </p>
            <p className="text-xs text-slate-600 mt-0.5 font-medium">
              Role: {session?.role || 'None'} {session?.clubName ? `· Club: ${session.clubName}` : ''}
            </p>
          </div>

          <span className="h-3 w-3 bg-emerald-500 rounded-full animate-pulse" />
        </div>

        {/* Personas Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {SEED_DEMO_USERS.map((user) => {
            const isCurrent = session?.id === user.id

            return (
              <div
                key={user.id}
                className={`p-6 rounded-2xl border transition-all flex flex-col justify-between space-y-5 ${
                  isCurrent
                    ? 'border-md-primary bg-white shadow-card ring-2 ring-md-primary/20'
                    : 'border-[#DADCE0] hover:border-slate-300 bg-white shadow-subtle hover:shadow-card-hover'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-[#F1F3F4] text-slate-700">
                      {user.role.replace('_', ' ')}
                    </span>
                    {isCurrent && (
                      <span className="text-xs font-bold text-md-primary flex items-center gap-1">
                        <Check className="h-3.5 w-3.5" /> Active
                      </span>
                    )}
                  </div>

                  <h3 className="font-display font-bold text-lg text-slate-900">
                    {user.name}
                  </h3>

                  <p className="text-xs text-slate-500 mt-1 font-mono">
                    {user.email}
                  </p>

                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    {user.clubName ? `Associated with ${user.clubName}` : `Global ${user.role.replace('_', ' ')} permissions`}
                  </p>
                </div>

                <Button
                  size="sm"
                  variant={isCurrent ? 'secondary' : 'primary'}
                  fullWidth
                  onClick={() => handleSelectAccount(user.role, user.clubId)}
                >
                  {isCurrent ? 'Switch Again' : `Switch to ${user.name.split(' ')[0]}`}
                </Button>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
