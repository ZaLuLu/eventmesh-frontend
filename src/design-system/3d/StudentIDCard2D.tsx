import React, { useState } from 'react'
import { Copy, Check } from '@phosphor-icons/react'

export interface StudentIDCard2DProps {
  name: string
  registrationNumber: string
  degreeBranch: string
  semester?: number
  email: string
  role?: string
  campus?: string
  bloodGroup?: string
  emergencyPhone?: string
  className?: string
}

export const StudentIDCard2D: React.FC<StudentIDCard2DProps> = ({
  name, registrationNumber, degreeBranch, semester, email, role = 'ATTENDEE',
  campus, className = '',
}) => {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    if (!registrationNumber) return
    await navigator.clipboard.writeText(registrationNumber)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 2000)
  }
  const initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || 'EM'
  return (
    <div className={'w-[min(100%,320px)] overflow-hidden rounded-panel border border-line bg-card text-ink ' + className}>
      <div className="border-b border-line bg-ink px-5 py-4 text-paper"><p className="text-sm font-semibold tracking-tight">eventmesh</p><p className="mt-1 font-mono text-[10px] uppercase tracking-widest opacity-75">{campus || 'Member identity'}</p></div>
      <div className="p-5">
        <div className="grid h-16 w-16 place-items-center rounded-poster bg-accent-soft text-xl font-semibold text-accent">{initials}</div>
        <h2 className="mt-4 text-xl font-semibold">{name || 'EventMesh member'}</h2>
        <p className="mt-1 text-sm text-ink-soft">{role}</p>
        {degreeBranch && <p className="mt-3 text-xs text-ink-soft">{degreeBranch}{semester ? ' · Semester ' + semester : ''}</p>}
        {email && <p className="mt-2 truncate text-xs text-ink-soft">{email}</p>}
        <div className="mt-5 flex items-center justify-between gap-3 border-t border-line pt-4 font-mono text-xs">
          <span className="min-w-0 truncate">{registrationNumber || 'Registration ID unavailable'}</span>
          {registrationNumber && <button type="button" onClick={copy} aria-label="Copy registration ID" className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-line hover:bg-surface-subtle">{copied ? <Check size={16} /> : <Copy size={16} />}</button>}
        </div>
      </div>
    </div>
  )
}
