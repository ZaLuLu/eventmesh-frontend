import React from 'react'
import { useNavigate } from 'react-router-dom'
import { RefreshCw, Check } from 'lucide-react'
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
    <div className="w-full bg-bg text-text min-h-screen py-8 sm:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
        <div className="border-b border-line pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-caption font-semibold text-accent block mb-1">
              Development Environment
            </span>
            <h1 className="text-h2 font-semibold text-text">
              Developer Personas & Role Switcher
            </h1>
            <p className="text-small text-text-2 mt-1 max-w-xl">
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
        <div className="p-6 rounded-panel bg-surface border border-line flex items-center justify-between">
          <div>
            <span className="text-caption font-semibold text-accent block mb-1">
              Currently active persona
            </span>
            <p className="text-xl font-semibold text-text">
              {session?.name || 'Anonymous Visitor'}
            </p>
            <p className="text-small text-text-2 mt-0.5">
              Role: <span className="font-medium text-text">{session?.role || 'None'}</span>{' '}
              {session?.clubName ? `· Club: ${session.clubName}` : ''}
            </p>
          </div>

          <span className="h-3 w-3 bg-success rounded-full flex-shrink-0" />
        </div>

        {/* Personas Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {SEED_DEMO_USERS.map((user) => {
            const isCurrent = session?.id === user.id

            return (
              <div
                key={user.id}
                className={`p-6 rounded-panel border transition-colors flex flex-col justify-between space-y-4 bg-surface ${
                  isCurrent ? 'border-accent bg-accent-soft/20' : 'border-line hover:border-text-3'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2.5 py-0.5 rounded-full text-caption font-medium bg-subtle text-text">
                      {user.role.replace('_', ' ')}
                    </span>
                    {isCurrent && (
                      <span className="text-caption font-semibold text-accent flex items-center gap-1">
                        <Check className="h-3.5 w-3.5" /> Active
                      </span>
                    )}
                  </div>

                  <h3 className="text-h3 font-semibold text-text">
                    {user.name}
                  </h3>

                  <p className="text-caption text-text-3 mt-1 font-mono">
                    {user.email}
                  </p>

                  <p className="text-small text-text-2 mt-2 leading-relaxed">
                    {user.clubName
                      ? `Associated with ${user.clubName}`
                      : `Global ${user.role.replace('_', ' ')} permissions`}
                  </p>
                </div>

                <Button
                  size="sm"
                  variant={isCurrent ? 'secondary' : 'primary'}
                  fullWidth
                  onClick={() => handleSelectAccount(user.role, user.clubId)}
                >
                  {isCurrent ? `Active: ${user.name}` : `Switch to ${user.name}`}
                </Button>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
