import React from 'react'
import { Link } from 'react-router-dom'
import { ShieldWarning, House, LockKey } from '@/design-system/Icon'
import { Sticker } from '@/design-system/primitives/Sticker'

// Hallmark macrostructure: System-State-403
export const ForbiddenPage: React.FC = () => {
  return (
    <div className="w-full min-h-[70vh] flex flex-col items-center justify-center p-6 text-center select-none">
      <div className="max-w-md w-full bg-card border-[1.5px] border-ink rounded-ticket p-8 shadow-offset-lg space-y-6">
        <div className="flex justify-center">
          <Sticker color="pink" size="md" tilt={2} icon={<LockKey size={14} weight="bold" />}>
            Access Restricted · 403
          </Sticker>
        </div>

        <div className="space-y-2">
          <h1 className="font-display font-extrabold text-4xl sm:text-5xl text-ink tracking-tight">
            Restricted <span className="font-accent italic text-pink">zone</span>
          </h1>
          <p className="text-ink-soft text-sm sm:text-base font-sans leading-relaxed">
            Your active role does not have authorization to view this administrative console or operating desk.
          </p>
        </div>

        {/* Security context notice */}
        <div className="bg-paper-2 border border-ink/15 rounded-lg p-3 text-left text-xs font-mono text-ink-soft space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-ink">
            <ShieldWarning size={15} weight="bold" className="text-pink" />
            <span>RBAC Verification Notice</span>
          </div>
          <p className="text-[11px] leading-normal">
            Front-end route restrictions are UX-level indicators. Privilege boundaries are cryptographically enforced by the association backend gateway.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link to="/" className="btn-funk-primary w-full sm:w-auto px-6 py-2.5 text-sm font-bold flex items-center justify-center gap-2">
            <House size={16} weight="bold" />
            <span>Return to Home</span>
          </Link>
          <Link to="/attendee/dashboard" className="btn-funk-secondary w-full sm:w-auto px-6 py-2.5 text-sm font-bold">
            <span>Attendee Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
