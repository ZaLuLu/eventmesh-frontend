import React, { useState } from 'react'
import { Copy, Check, ArrowsClockwise } from '@phosphor-icons/react'

export interface StudentIDCard2DProps {
  name: string
  registrationNumber: string
  degreeBranch?: string
  semester?: number
  email?: string
  role?: string
  campus?: string
  bloodGroup?: string
  emergencyPhone?: string
  avatarUrl?: string
  dateOfBirth?: string
  dateOfIssue?: string
  className?: string
  interactive?: boolean
  initialSide?: 'front' | 'back'
  onAvatarClick?: () => void
}

/**
 * Modern Collegiate Student Identification Pass
 * Styled strictly with EventMesh website design tokens:
 * - 1:1 Aspect-square avatar photo box
 * - Student name in authentic cursive signature font directly below the photo
 * - Website-native theme tokens (bg-card, border-line, text-ink, text-accent)
 * - Seamless 3D flip to back face with bold 'eventmesh' and student signature
 */
export const StudentIDCard2D: React.FC<StudentIDCard2DProps> = ({
  name = 'Aditya Narayan',
  registrationNumber = 'EM-2026-0814',
  degreeBranch = 'Computer Science & Engineering',
  semester = 6,
  email = 'attendee@example.com',
  role = 'STUDENT PASSHOLDER',
  campus = 'Central University Campus',
  dateOfBirth = '03/01/2004',
  dateOfIssue = '01/01/2026',
  avatarUrl,
  className = '',
  interactive = true,
  initialSide = 'front',
  onAvatarClick,
}) => {
  const [side, setSide] = useState<'front' | 'back'>(initialSide)
  const [copied, setCopied] = useState(false)

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!registrationNumber) return
    await navigator.clipboard.writeText(registrationNumber)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleFlip = () => {
    if (!interactive) return
    setSide((s) => (s === 'front' ? 'back' : 'front'))
  }

  return (
    <div
      className={`relative select-none cursor-pointer group w-full max-w-[460px] h-[250px] sm:h-[285px] shrink-0 ${className}`}
      style={{ perspective: 1200 }}
      onClick={handleFlip}
      title="Click card to flip between Front and Back"
    >
      <div
        className="relative w-full h-full transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
        style={{
          transformStyle: 'preserve-3d',
          transform: side === 'back' ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        {/* ========================================================================= */}
        {/* FRONT FACE                                                                */}
        {/* ========================================================================= */}
        <div
          className="absolute inset-0 w-full h-full rounded-[20px] sm:rounded-[24px] bg-card text-ink border-2 border-line/90 shadow-[0_12px_32px_rgba(0,0,0,0.08)] p-3 sm:p-5 flex flex-col justify-between overflow-hidden"
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
          }}
        >
          {/* Subtle Halftone Background Dot Grid */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.035] dark:opacity-[0.06] overflow-hidden">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="card-dot-pattern" width="8" height="8" patternUnits="userSpaceOnUse">
                  <circle cx="2" cy="2" r="1.1" fill="currentColor" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#card-dot-pattern)" />
            </svg>
          </div>

          {/* Watermark accent */}
          <div className="absolute -right-4 -bottom-6 pointer-events-none opacity-[0.04] dark:opacity-[0.06] font-display font-black text-6xl sm:text-7xl tracking-tighter text-ink select-none">
            EMESH
          </div>

          {/* TOP SECTION: 1:1 PHOTO & SIGNATURE (LEFT) + METADATA (RIGHT) */}
          <div className="flex gap-3 sm:gap-4 relative z-10">
            {/* LEFT: 1:1 Square Photo + Signature Below */}
            <div className="shrink-0 flex flex-col items-center">
              <div
                onClick={(e) => {
                  if (onAvatarClick) {
                    e.stopPropagation()
                    onAvatarClick()
                  }
                }}
                className="w-[84px] sm:w-[104px] aspect-square rounded-xl bg-surface-subtle border-2 border-line/80 overflow-hidden shadow-xs relative flex items-center justify-center group/photo"
              >
                <img
                  src={
                    avatarUrl ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
                  }
                  alt={name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover/photo:scale-105"
                />
                {onAvatarClick && (
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/photo:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-[9px] font-mono text-white font-semibold uppercase tracking-wider">
                      Edit
                    </span>
                  </div>
                )}
              </div>

              {/* Dynamic Name Signature below 1:1 Image */}
              <div className="mt-1.5 w-[84px] sm:w-[104px] text-center border-t border-line/80 pt-1">
                <span className="text-[6.5px] sm:text-[7.5px] font-mono uppercase tracking-widest text-ink-muted block font-semibold leading-tight">
                  SIGNATURE
                </span>
                <span
                  className="block text-base sm:text-lg text-ink font-bold leading-tight truncate rotate-[-2.5deg] mt-0.5 select-none"
                  style={{ fontFamily: "'Caveat', cursive, sans-serif" }}
                >
                  {name}
                </span>
              </div>
            </div>

            {/* RIGHT: Header & Student Bio Info */}
            <div className="flex-1 min-w-0 flex flex-col justify-between">
              {/* Card Header & Flip Pill */}
              <div className="flex items-center justify-between border-b border-line/60 pb-1.5">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-accent" />
                  <span className="font-display font-bold text-xs sm:text-sm tracking-tight text-ink uppercase">
                    eventmesh
                  </span>
                  <span className="font-mono text-[9px] text-ink-muted">· PASS</span>
                </div>

                <span className="inline-flex items-center gap-1 text-[7.5px] sm:text-[8.5px] font-mono uppercase bg-surface-subtle text-ink-soft hover:text-ink px-1.5 py-0.5 rounded-full border border-line transition-colors">
                  <ArrowsClockwise size={9} /> Flip
                </span>
              </div>

              {/* Student Name */}
              <div className="mt-1.5">
                <span className="text-[7px] sm:text-[8px] font-mono uppercase tracking-widest text-ink-muted block font-bold leading-tight">
                  NAME
                </span>
                <span className="text-xs sm:text-sm font-display font-bold text-ink tracking-tight uppercase truncate block">
                  {name}
                </span>
              </div>

              {/* Reg No & Issue Date */}
              <div className="grid grid-cols-2 gap-2 mt-1 sm:mt-1.5 font-mono">
                <div>
                  <span className="text-[7px] sm:text-[8px] uppercase tracking-wider text-ink-muted block font-bold leading-tight">
                    REG NUMBER
                  </span>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="inline-flex items-center gap-1 text-[9.5px] sm:text-[11px] font-bold text-ink hover:text-accent transition-colors font-mono tracking-tight"
                    title="Click to copy registration number"
                  >
                    <span>{registrationNumber}</span>
                    {copied ? (
                      <Check size={9} className="text-emerald-500" weight="bold" />
                    ) : (
                      <Copy size={9} className="text-ink-muted" />
                    )}
                  </button>
                </div>
                <div>
                  <span className="text-[7px] sm:text-[8px] uppercase tracking-wider text-ink-muted block font-bold leading-tight">
                    DATE OF ISSUE
                  </span>
                  <span className="text-[9.5px] sm:text-[11px] font-bold text-ink tracking-tight block">
                    {dateOfIssue}
                  </span>
                </div>
              </div>

              {/* Degree / Branch */}
              <div className="mt-1 font-mono">
                <span className="text-[7px] sm:text-[8px] uppercase tracking-wider text-ink-muted block font-bold leading-tight">
                  PROGRAM / DEPARTMENT
                </span>
                <span className="text-[9px] sm:text-[10.5px] font-semibold text-ink-soft truncate block">
                  {degreeBranch || 'Undergraduate Member'}
                </span>
              </div>
            </div>
          </div>

          {/* BOTTOM SECTION: Status pill + Campus verification */}
          <div className="relative z-10 pt-2 border-t border-line/80 flex items-center justify-between font-mono text-[8px] sm:text-[9px]">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                {role}
              </span>
            </div>

            <div className="text-right text-ink-muted truncate max-w-[200px]">
              <span>{campus}</span>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* BACK FACE                                                                 */}
        {/* ========================================================================= */}
        <div
          className="absolute inset-0 w-full h-full rounded-[20px] sm:rounded-[24px] bg-card text-ink border-2 border-line/90 shadow-[0_12px_32px_rgba(0,0,0,0.08)] p-4 sm:p-6 flex flex-col justify-between items-center text-center overflow-hidden"
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          {/* Subtle Halftone Background Dot Grid */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.035] dark:opacity-[0.06]">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="card-dot-back" width="8" height="8" patternUnits="userSpaceOnUse">
                  <circle cx="2" cy="2" r="1.1" fill="currentColor" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#card-dot-back)" />
            </svg>
          </div>

          {/* Top disclaimer & flip prompt */}
          <div className="relative z-10 w-full flex items-center justify-between text-[7.5px] sm:text-[8.5px] font-mono text-ink-muted uppercase border-b border-line/60 pb-1.5">
            <span>CENTRAL CAMPUS ADMISSION NETWORK</span>
            <span className="inline-flex items-center gap-1 text-ink-soft">
              <ArrowsClockwise size={9} /> FLIP TO FRONT
            </span>
          </div>

          {/* Center Brand & Signature Addition */}
          <div className="relative z-10 my-auto flex flex-col items-center justify-center">
            {/* Bold eventmesh typography matching website */}
            <h2 className="font-display text-3xl sm:text-4xl font-black tracking-[-0.03em] text-ink flex items-center gap-1">
              <span>eventmesh</span>
              <span className="w-2.5 h-2.5 rounded-full bg-accent inline-block ml-0.5" />
            </h2>

            {/* Student's name below eventmesh in the same signature cursive font */}
            <div className="mt-2 text-center">
              <span className="text-[7.5px] sm:text-[8.5px] font-mono uppercase tracking-widest text-ink-muted block font-semibold">
                OFFICIAL PASSHOLDER SIGNATURE
              </span>
              <span
                className="block text-2xl sm:text-3xl text-accent font-bold leading-tight rotate-[-2deg] my-1 select-none"
                style={{ fontFamily: "'Caveat', cursive, sans-serif" }}
              >
                {name}
              </span>
            </div>
          </div>

          {/* Bottom Security & Affiliation */}
          <div className="relative z-10 w-full flex items-center justify-between border-t border-line/80 pt-2 font-mono text-[7.5px] sm:text-[8.5px] text-ink-muted">
            <span className="truncate">REG: {registrationNumber}</span>
            <span>AUTHORIZED ADMISSION PASS</span>
          </div>
        </div>
      </div>
    </div>
  )
}
