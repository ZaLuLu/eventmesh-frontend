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
  surname?: string
  stageName?: string
  height?: string
  eyes?: string
  sex?: string
  className?: string
  interactive?: boolean
  initialSide?: 'front' | 'back'
}

/**
 * Authentic Retro-Brutalist Identity Card
 * Modeled after tactile Korean/Japanese creative collective ID cards
 * Features:
 * - Vintage warm ivory cardstock (#F4F1EA)
 * - Dot-matrix pixel gradient typography ("IDENTITY CARD")
 * - Halftone starburst & watermark background
 * - Portrait photo frame with barcode & issue date
 * - Biometric fingerprint stamp & cursive pen signature
 * - Seamless 3D flip to Back Face with huge pixel "EVENTMESH" typography
 * - 100% Mobile fluid: adapts from 320px mobile to 460px desktop
 */
export const StudentIDCard2D: React.FC<StudentIDCard2DProps> = ({
  name = 'Aditya Narayan',
  registrationNumber = 'EM-2026-0814',
  degreeBranch = 'Computer Science & Systems',
  semester = 6,
  email = 'attendee@example.com',
  role = 'MEMBER',
  campus = 'Central Campus',
  dateOfBirth = '03/01/2004',
  dateOfIssue = '01/01/2026',
  surname,
  stageName,
  height = "176cm (5'9\")",
  eyes = 'BROWN',
  sex = 'M',
  avatarUrl,
  className = '',
  interactive = true,
  initialSide = 'front',
}) => {
  const [side, setSide] = useState<'front' | 'back'>(initialSide)
  const [copied, setCopied] = useState(false)

  // Name splitting for Surname and First Name
  const parts = name.trim().split(/\s+/)
  const inferredSurname = surname || (parts.length > 1 ? parts[parts.length - 1].toUpperCase() : 'NARAYAN')
  const inferredFirstName = parts.length > 1 ? parts.slice(0, -1).join(' ').toUpperCase() : parts[0].toUpperCase()
  const displayStageName = stageName || (parts[0] || 'MEMBER').toUpperCase()

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
      className={`relative select-none cursor-pointer group w-full max-w-[460px] h-[240px] sm:h-[290px] shrink-0 ${className}`}
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
          className="absolute inset-0 w-full h-full rounded-[20px] sm:rounded-[24px] bg-[#F4F1EA] text-neutral-900 border-2 border-neutral-800/90 shadow-[0_12px_36px_rgba(0,0,0,0.18)] p-3 sm:p-5 flex flex-col justify-between overflow-hidden"
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
          }}
        >
          {/* Halftone Starburst & Watermark Background */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.05] overflow-hidden">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="card-dot-grid" width="8" height="8" patternUnits="userSpaceOnUse">
                  <circle cx="2" cy="2" r="1.1" fill="#000000" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#card-dot-grid)" />
            </svg>
          </div>

          {/* Star Flower Halftone Graphic Behind Header */}
          <div className="absolute right-3 top-1 pointer-events-none opacity-30">
            <svg className="w-12 h-12 sm:w-[74px] sm:h-[74px]" viewBox="0 0 100 100" fill="none">
              <g fill="#FF6B35">
                {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle, i) => (
                  <circle
                    key={i}
                    cx={50 + 26 * Math.cos((angle * Math.PI) / 180)}
                    cy={50 + 26 * Math.sin((angle * Math.PI) / 180)}
                    r="7"
                  />
                ))}
                <circle cx="50" cy="50" r="13" fill="#FFA500" />
              </g>
            </svg>
          </div>

          {/* Faint Watermark Text (Matching reference image "SOUPASTA" across center) */}
          <div className="absolute right-3 top-12 sm:top-16 pointer-events-none opacity-[0.08] font-mono font-black text-3xl sm:text-5xl tracking-widest text-[#FF4500] rotate-[-5deg] select-none">
            EVENTMESH
          </div>

          {/* TOP SECTION: PHOTO (LEFT) & HEADER / METADATA (RIGHT) */}
          <div className="flex gap-2.5 sm:gap-4 relative z-10">
            {/* LEFT: Portrait Photograph */}
            <div className="shrink-0 flex flex-col items-start">
              <div className="w-[82px] sm:w-[108px] h-[104px] sm:h-[136px] rounded-lg bg-neutral-200 border-2 border-neutral-700/80 overflow-hidden shadow-sm relative flex items-center justify-center">
                <img
                  src={
                    avatarUrl ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
                  }
                  alt={name}
                  className="w-full h-full object-cover contrast-[1.08] saturate-95"
                />

                {/* Subtle photo scanline effect */}
                <div
                  className="absolute inset-0 pointer-events-none opacity-15"
                  style={{
                    backgroundImage: 'linear-gradient(rgba(0,0,0,0.3) 50%, transparent 50%)',
                    backgroundSize: '100% 3px',
                  }}
                />
              </div>

              {/* Barcode Strip with glitchy matrix digits in center (Matching Reference Image) */}
              <div className="mt-1 sm:mt-1.5 w-[82px] sm:w-[108px]">
                <div className="h-4 sm:h-5 w-full relative bg-neutral-900 rounded-[2px] overflow-hidden flex items-center px-1">
                  {/* Outer barcode bars */}
                  <div className="w-full h-full flex items-center justify-between">
                    {[3, 1, 2, 4, 1, 2, 1, 3, 2, 1, 4, 1, 2, 3, 1, 2, 4, 2, 1, 3, 1, 4, 2, 1, 3].map(
                      (w, idx) => (
                        <div
                          key={idx}
                          className="h-full bg-[#F4F1EA]"
                          style={{ width: `${w * 1.1}px` }}
                        />
                      )
                    )}
                  </div>
                  {/* Central QR/Matrix code box embedded like reference */}
                  <div className="absolute inset-y-0.5 left-1/2 -translate-x-1/2 w-8 sm:w-10 bg-neutral-900 border border-[#F4F1EA]/60 flex items-center justify-center">
                    <span className="font-mono text-[6px] sm:text-[7.5px] font-black tracking-widest text-[#F4F1EA]">
                      EM·0814
                    </span>
                  </div>
                </div>
                <p className="text-[6.5px] sm:text-[7.5px] font-mono text-neutral-600 mt-0.5 tracking-wider text-left">
                  DATE OF ISSUE {dateOfIssue}
                </p>
              </div>
            </div>

            {/* RIGHT: Header & Student Bio Info */}
            <div className="flex-1 min-w-0 flex flex-col justify-between">
              {/* Retro Dot-Matrix "IDENTITY CARD" Title */}
              <div>
                <div className="flex items-center justify-between">
                  {/* SVG Halftone Masked Title */}
                  <div className="relative">
                    <svg
                      className="w-[150px] sm:w-[210px] h-[20px] sm:h-[28px] overflow-visible"
                      viewBox="0 0 210 28"
                    >
                      <defs>
                        <linearGradient id="id-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#FF2A00" />
                          <stop offset="50%" stopColor="#FF6D00" />
                          <stop offset="100%" stopColor="#FFB300" />
                        </linearGradient>
                        <pattern id="dot-matrix-pat" x="0" y="0" width="3.5" height="3.5" patternUnits="userSpaceOnUse">
                          <circle cx="1.75" cy="1.75" r="1.3" fill="url(#id-grad)" />
                        </pattern>
                        <mask id="text-mask">
                          <text
                            x="0"
                            y="22"
                            fontFamily="'Courier New', 'JetBrains Mono', monospace"
                            fontWeight="900"
                            fontSize="23"
                            letterSpacing="1.5"
                            fill="#FFFFFF"
                          >
                            IDENTITY CARD
                          </text>
                        </mask>
                      </defs>
                      <rect width="210" height="28" fill="url(#dot-matrix-pat)" mask="url(#text-mask)" />
                      <text
                        x="0"
                        y="22"
                        fontFamily="'Courier New', 'JetBrains Mono', monospace"
                        fontWeight="900"
                        fontSize="23"
                        letterSpacing="1.5"
                        fill="url(#id-grad)"
                        opacity="0.3"
                      >
                        IDENTITY CARD
                      </text>
                    </svg>
                  </div>

                  {/* Flip hint pill */}
                  <span className="inline-flex items-center gap-1 text-[7.5px] sm:text-[8.5px] font-mono uppercase bg-neutral-900/5 hover:bg-neutral-900/10 text-neutral-600 px-1.5 py-0.5 rounded border border-neutral-300">
                    <ArrowsClockwise size={9} /> Flip
                  </span>
                </div>

                {/* Primary Metadata Table: SURNAME & STAGE NAME */}
                <div className="grid grid-cols-2 gap-1.5 sm:gap-2 mt-1 sm:mt-2 font-mono">
                  <div>
                    <span className="text-[7.5px] sm:text-[8.5px] text-neutral-500 uppercase tracking-widest block font-bold leading-tight">
                      SURNAME
                    </span>
                    <span className="text-[10px] sm:text-xs font-black text-neutral-900 tracking-wider uppercase truncate block">
                      {inferredSurname}
                    </span>
                  </div>
                  <div>
                    <span className="text-[7.5px] sm:text-[8.5px] text-neutral-500 uppercase tracking-widest block font-bold leading-tight">
                      STAGE NAME
                    </span>
                    <span className="text-[10px] sm:text-xs font-black text-neutral-900 tracking-wider uppercase truncate block">
                      {displayStageName}
                    </span>
                  </div>
                </div>

                {/* NAME & DATE OF BIRTH */}
                <div className="grid grid-cols-2 gap-1.5 sm:gap-2 mt-1 sm:mt-1.5 font-mono">
                  <div>
                    <span className="text-[7.5px] sm:text-[8.5px] text-neutral-500 uppercase tracking-widest block font-bold leading-tight">
                      NAME
                    </span>
                    <span className="text-[9px] sm:text-xs font-black text-neutral-900 tracking-tight sm:tracking-wider uppercase truncate block">
                      {name.toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <span className="text-[7.5px] sm:text-[8.5px] text-neutral-500 uppercase tracking-widest block font-bold leading-tight">
                      DATE OF BIRTH
                    </span>
                    <span className="text-[9.5px] sm:text-xs font-black text-neutral-900 tracking-wider uppercase truncate block">
                      {dateOfBirth}
                    </span>
                  </div>
                </div>

                {/* SEX | EYES | HEIGHT */}
                <div className="grid grid-cols-3 gap-1 sm:gap-1.5 mt-1 sm:mt-2 font-mono border-t border-neutral-300/80 pt-1 sm:pt-1.5">
                  <div>
                    <span className="text-[7px] sm:text-[8px] text-neutral-500 uppercase tracking-wider block font-bold leading-tight">
                      SEX
                    </span>
                    <span className="text-[8.5px] sm:text-[11px] font-black text-neutral-900 uppercase block">
                      {sex}
                    </span>
                  </div>
                  <div>
                    <span className="text-[7px] sm:text-[8px] text-neutral-500 uppercase tracking-wider block font-bold leading-tight">
                      EYES
                    </span>
                    <span className="text-[8.5px] sm:text-[11px] font-black text-neutral-900 uppercase block truncate">
                      {eyes}
                    </span>
                  </div>
                  <div>
                    <span className="text-[7px] sm:text-[8px] text-neutral-500 uppercase tracking-wider block font-bold leading-tight">
                      HEIGHT
                    </span>
                    <span className="text-[8.5px] sm:text-[11px] font-black text-neutral-900 uppercase block truncate">
                      {height}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* BOTTOM SECTION: FINGERPRINT (LEFT) | SIGNATURE (CENTER) | DESIGNED BY (RIGHT) */}
          <div className="relative z-10 pt-1 border-t border-neutral-300 flex items-center justify-between font-mono">
            {/* Authentic Ink Thumbprint Stamp */}
            <div className="flex flex-col items-start">
              <span className="text-[6.5px] sm:text-[7.5px] text-neutral-500 uppercase tracking-widest block font-bold leading-tight mb-0.5">
                FINGERPRINT
              </span>
              <div className="w-5 sm:w-6 h-6 sm:h-7 shrink-0 relative flex items-center justify-center opacity-85">
                {/* Detailed vector ink thumbprint matching reference image */}
                <svg viewBox="0 0 36 46" className="w-full h-full fill-none stroke-neutral-700 stroke-[1.3] stroke-linecap-round">
                  <path d="M 18 5 C 12 5 8 10 8 17 C 8 25 10 32 11 40" strokeDasharray="3 1" />
                  <path d="M 18 9 C 14 9 11 13 11 18 C 11 26 13 34 15 42" />
                  <path d="M 18 13 C 16 13 14 15 14 19 C 14 26 16 33 18 43" strokeDasharray="4 1" />
                  <path d="M 18 16 C 20 16 21 18 21 21 C 21 27 20 34 19 42" />
                  <path d="M 18 9 C 22 9 25 13 25 19 C 25 27 23 34 22 41" strokeDasharray="3 1.5" />
                  <path d="M 18 5 C 24 5 28 10 28 18 C 28 27 26 35 24 42" />
                  <path d="M 5 22 C 5 14 11 3 18 3 C 25 3 31 14 31 22 C 31 32 28 39 26 43" strokeDasharray="2 1" />
                  <path d="M 3 26 C 3 14 9 1 18 1 C 27 1 33 14 33 26 C 33 36 30 42 28 45" strokeDasharray="3 2" />
                </svg>
              </div>
            </div>

            {/* Realistic Cursive Fountain Pen Signature */}
            <div className="flex flex-col items-center">
              <span className="text-[6.5px] sm:text-[7.5px] text-neutral-500 uppercase tracking-widest block font-bold leading-tight mb-0.5">
                SIGNATURE
              </span>
              <div className="h-5 sm:h-6 flex items-center justify-center">
                <svg className="w-[64px] sm:w-[80px] h-[18px] sm:h-[24px] overflow-visible" viewBox="0 0 100 32">
                  <path
                    d="M 6 24 C 16 10, 24 4, 30 14 C 34 20, 28 28, 42 16 C 50 8, 56 12, 64 22 C 72 14, 82 8, 94 18"
                    fill="none"
                    stroke="#111111"
                    strokeWidth="1.9"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M 26 8 L 48 24"
                    fill="none"
                    stroke="#111111"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>

            {/* ID & Stacked "DESIGNED BY CRESCENDO / EVENTMESH" */}
            <div className="flex flex-col items-end text-right">
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-neutral-900/5 hover:bg-neutral-900/10 text-neutral-800 text-[7px] sm:text-[8px] font-mono font-bold transition-colors border border-neutral-300 mb-0.5"
                title="Copy Registration ID"
              >
                {copied ? (
                  <>
                    <Check size={8} className="text-emerald-600" weight="bold" />
                    <span className="text-emerald-700">{registrationNumber}</span>
                  </>
                ) : (
                  <>
                    <Copy size={8} />
                    <span>{registrationNumber}</span>
                  </>
                )}
              </button>
              <div className="text-[6px] sm:text-[7px] text-neutral-500 uppercase tracking-wider leading-tight">
                <span>DESIGNED BY</span>
                <span className="block font-black text-neutral-800">CRESCENDO</span>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* BACK FACE                                                                 */}
        {/* ========================================================================= */}
        <div
          className="absolute inset-0 w-full h-full rounded-[20px] sm:rounded-[24px] bg-[#F4F1EA] text-neutral-900 border-2 border-neutral-800/90 shadow-[0_12px_36px_rgba(0,0,0,0.18)] p-4 sm:p-6 flex flex-col items-center justify-between overflow-hidden"
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          {/* Halftone Dot Grid Texture */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.06]">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="card-dot-grid-back" width="8" height="8" patternUnits="userSpaceOnUse">
                  <circle cx="2" cy="2" r="1.1" fill="#000000" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#card-dot-grid-back)" />
            </svg>
          </div>

          {/* Halftone Starbursts on Sides */}
          <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-30">
            <svg className="w-12 h-12 sm:w-[68px] sm:h-[68px]" viewBox="0 0 100 100" fill="none">
              <g fill="#FF6B35">
                {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle, i) => (
                  <circle
                    key={i}
                    cx={50 + 26 * Math.cos((angle * Math.PI) / 180)}
                    cy={50 + 26 * Math.sin((angle * Math.PI) / 180)}
                    r="7"
                  />
                ))}
                <circle cx="50" cy="50" r="12" fill="#FFA500" />
              </g>
            </svg>
          </div>

          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-30">
            <svg className="w-12 h-12 sm:w-[68px] sm:h-[68px]" viewBox="0 0 100 100" fill="none">
              <g fill="#FF6B35">
                {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle, i) => (
                  <circle
                    key={i}
                    cx={50 + 26 * Math.cos((angle * Math.PI) / 180)}
                    cy={50 + 26 * Math.sin((angle * Math.PI) / 180)}
                    r="7"
                  />
                ))}
                <circle cx="50" cy="50" r="12" fill="#FFA500" />
              </g>
            </svg>
          </div>

          {/* Top disclaimer */}
          <div className="relative z-10 w-full flex items-center justify-between text-[7px] sm:text-[8px] font-mono text-neutral-500 uppercase">
            <span>OFFICIAL CAMPUS ADMISSION PASS</span>
            <span className="flex items-center gap-1">
              <ArrowsClockwise size={9} /> FLIP TO FRONT
            </span>
          </div>

          {/* Centered Massive Pixel / Dot-Matrix Logo (Matching User Reference "SOUPASTA") */}
          <div className="relative z-10 text-center my-auto">
            <div className="relative inline-block">
              {/* Star Flower Accent on Logo Corner */}
              <div className="absolute -left-6 -top-4 pointer-events-none opacity-40">
                <svg className="w-8 h-8 sm:w-10 sm:h-10" viewBox="0 0 100 100" fill="#FF8C00">
                  <polygon points="50,5 64,36 98,38 72,61 80,95 50,77 20,95 28,61 2,38 36,36" />
                </svg>
              </div>
              <div className="absolute -right-6 -bottom-3 pointer-events-none opacity-40">
                <svg className="w-8 h-8 sm:w-10 sm:h-10" viewBox="0 0 100 100" fill="#FF8C00">
                  <polygon points="50,5 64,36 98,38 72,61 80,95 50,77 20,95 28,61 2,38 36,36" />
                </svg>
              </div>

              {/* Massive Halftone Dot-Matrix Logo */}
              <svg
                className="w-[240px] sm:w-[340px] h-[42px] sm:h-[60px] overflow-visible"
                viewBox="0 0 340 60"
              >
                <defs>
                  <linearGradient id="back-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FF2600" />
                    <stop offset="45%" stopColor="#FF6D00" />
                    <stop offset="100%" stopColor="#FFA000" />
                  </linearGradient>
                  <pattern id="back-dot-pat" x="0" y="0" width="4.5" height="4.5" patternUnits="userSpaceOnUse">
                    <circle cx="2.25" cy="2.25" r="1.65" fill="url(#back-grad)" />
                  </pattern>
                  <mask id="back-text-mask">
                    <text
                      x="170"
                      y="46"
                      textAnchor="middle"
                      fontFamily="'Courier New', 'JetBrains Mono', monospace"
                      fontWeight="900"
                      fontSize="44"
                      letterSpacing="5"
                      fill="#FFFFFF"
                    >
                      EVENTMESH
                    </text>
                  </mask>
                </defs>
                <rect width="340" height="60" fill="url(#back-dot-pat)" mask="url(#back-text-mask)" />
                <text
                  x="170"
                  y="46"
                  textAnchor="middle"
                  fontFamily="'Courier New', 'JetBrains Mono', monospace"
                  fontWeight="900"
                  fontSize="44"
                  letterSpacing="5"
                  fill="url(#back-grad)"
                  opacity="0.35"
                >
                  EVENTMESH
                </text>
              </svg>
            </div>
          </div>

          {/* Magnetic Stripe / Tech Security Band at bottom */}
          <div className="relative z-10 w-full flex items-center justify-between border-t border-neutral-300 pt-1.5 sm:pt-2 font-mono text-[7px] sm:text-[8px] text-neutral-500">
            <span>SECURE-REG: {registrationNumber}</span>
            <span>PROPERTY OF EVENTMESH COLLECTIVE</span>
          </div>
        </div>
      </div>
    </div>
  )
}
