import React, { useState } from 'react'
import { motion } from 'motion/react'
import { Copy, Check, ArrowsClockwise, ShieldCheck, QrCode } from '@phosphor-icons/react'
import { Sticker } from '@/design-system/primitives/Sticker'
import { useToast } from '@/design-system/primitives/Toast'

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
  name,
  registrationNumber,
  degreeBranch,
  semester = 6,
  email,
  role = 'STUDENT PASSHOLDER',
  campus = 'CENTRAL UNIVERSITY CAMPUS',
  bloodGroup = 'O+',
  emergencyPhone = '+91 98765 43210',
  className = '',
}) => {
  const [isFlipped, setIsFlipped] = useState(false)
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()

  const initials = name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  const copyRegNo = (e: React.MouseEvent) => {
    e.stopPropagation()
    navigator.clipboard.writeText(registrationNumber)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast({
      title: 'Registration ID Copied',
      message: `${registrationNumber} copied to clipboard`,
      type: 'info',
    })
  }

  return (
    <div className={`relative flex flex-col items-center select-none ${className}`}>
      {/* Lanyard Top Strap & Metal Clasp Suspension */}
      <div className="flex flex-col items-center z-10 -mb-2.5">
        {/* Woven Cobalt Fabric Ribbon */}
        <div className="w-10 h-14 bg-cobalt border-x-2 border-dashed border-white/30 flex items-center justify-center shadow-sm">
          <span className="text-[7px] text-white/70 font-mono tracking-widest rotate-90 uppercase">
            EVENTMESH
          </span>
        </div>
        {/* Metal Rivet Clamp */}
        <div className="w-12 h-3.5 bg-zinc-300 border-2 border-ink rounded-xs shadow-[1px_1px_0_#151130] flex items-center justify-center">
          <div className="w-2 h-1.5 bg-zinc-500 rounded-full" />
        </div>
        {/* Steel Oval Ring Hook */}
        <div className="w-6 h-4 border-2 border-ink rounded-full -mt-0.5 bg-transparent" />
      </div>

      {/* Flip Card Container with 3D perspective */}
      <div
        className="w-[280px] sm:w-[320px] h-[460px] perspective-[1000px] cursor-pointer"
        onClick={() => setIsFlipped(!isFlipped)}
        role="region"
        aria-label="Student ID Badge"
      >
        <motion.div
          className="relative w-full h-full preserve-3d"
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* ================= FRONT SIDE ================= */}
          <div
            className="absolute inset-0 w-full h-full bg-ink text-paper rounded-[16px] border-2 border-ink shadow-[4px_4px_0_#151130] overflow-hidden flex flex-col justify-between backface-hidden"
            style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
          >
            {/* Top Lanyard Slot Hole & University Header */}
            <div>
              <div className="bg-cobalt p-3.5 text-center relative border-b-2 border-ink">
                {/* Slotted Punch Hole */}
                <div className="w-12 h-2.5 bg-ink/70 rounded-full mx-auto mb-2" />
                <h4 className="font-display font-extrabold text-sm sm:text-base text-white tracking-wide uppercase">
                  EVENTMESH · CAMPUS IDENTITY
                </h4>
                <p className="text-[10px] font-mono text-white/80 tracking-wider uppercase mt-0.5">
                  {campus}
                </p>
              </div>

              {/* Status & Chip Bar */}
              <div className="px-5 pt-4 flex items-center justify-between">
                {/* Brass RFID Chip */}
                <div className="w-10 h-8 rounded-md bg-[#D4AF37] border border-black/40 p-1 flex flex-col justify-around shadow-inner">
                  <div className="w-full h-0.5 bg-black/20" />
                  <div className="w-full h-0.5 bg-black/20" />
                </div>
                {/* Status Sticker */}
                <Sticker color="mint" size="sm" className="font-mono text-[10px] uppercase font-bold tracking-wider">
                  VERIFIED ID ✓
                </Sticker>
              </div>
            </div>

            {/* Photo Avatar & Identity Info */}
            <div className="px-5 flex flex-col items-center text-center space-y-2.5 my-auto">
              {/* Photo Frame */}
              <div className="w-20 h-20 rounded-full border-3 border-cobalt bg-paper text-ink flex items-center justify-center font-display font-black text-2xl shadow-[2px_2px_0_#151130]">
                {initials}
              </div>

              <div>
                <h3 className="font-display font-extrabold text-xl text-paper tracking-tight leading-tight">
                  {name}
                </h3>
                <div className="flex items-center justify-center gap-1.5 mt-1">
                  <span className="font-mono text-xs text-lavender font-semibold">
                    REG: {registrationNumber}
                  </span>
                  <button
                    type="button"
                    onClick={copyRegNo}
                    className="p-1 text-paper/70 hover:text-white transition-colors"
                    title="Copy Registration Number"
                    aria-label="Copy registration number"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-mint" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-0.5">
                <p className="text-xs text-paper/90 font-medium line-clamp-1">
                  {degreeBranch}
                </p>
                <p className="font-mono text-[11px] text-paper/60 uppercase">
                  SEMESTER {semester} · {role}
                </p>
              </div>
            </div>

            {/* Bottom Barcode & Flip Hint */}
            <div className="px-5 pb-4 pt-2 border-t border-white/10 bg-black/20 flex flex-col items-center">
              {/* Barcode Strip */}
              <div className="w-full h-6 flex justify-between items-center px-2 py-0.5 bg-white/90 rounded-xs mb-1">
                {Array.from({ length: 32 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-full bg-ink"
                    style={{ width: `${(i % 3) + 1}px` }}
                  />
                ))}
              </div>
              <div className="w-full flex items-center justify-between text-[10px] font-mono text-paper/60 pt-0.5">
                <span>* EM-{registrationNumber.slice(-4)} *</span>
                <span className="flex items-center gap-1 text-sky">
                  <ArrowsClockwise className="w-3 h-3" /> Flip card
                </span>
              </div>
            </div>
          </div>

          {/* ================= BACK SIDE ================= */}
          <div
            className="absolute inset-0 w-full h-full bg-[#181530] text-paper rounded-[16px] border-2 border-ink shadow-[4px_4px_0_#151130] overflow-hidden flex flex-col justify-between backface-hidden"
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }}
          >
            {/* Top Magnetic Stripe */}
            <div>
              <div className="w-full h-10 bg-black border-b border-cobalt/40 flex items-center justify-center">
                <span className="text-[9px] font-mono text-white/40 tracking-widest uppercase">
                  CAMPUS GATE MAGNETIC STRIPE
                </span>
              </div>

              {/* Facility Access Clearance */}
              <div className="p-4 space-y-2">
                <h5 className="font-display font-bold text-xs uppercase tracking-wider text-paper/80 border-b border-white/10 pb-1">
                  Facility Access
                </h5>
                <div className="space-y-1.5 text-[11px]">
                  <div className="flex items-center justify-between">
                    <span className="text-paper/90">Main Campus & Auditorium</span>
                    <span className="text-mint font-mono font-bold text-[10px]">GRANTED ✓</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-paper/90">Tech Park & Labs</span>
                    <span className="text-mint font-mono font-bold text-[10px]">GRANTED ✓</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-paper/90">Digital Fabrication Arena</span>
                    <span className="text-mint font-mono font-bold text-[10px]">GRANTED ✓</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Medical & ICE Section */}
            <div className="mx-4 p-3 rounded-lg bg-tangerine/10 border border-tangerine/30 space-y-1 text-xs">
              <span className="font-mono text-[10px] font-bold text-tangerine uppercase tracking-wider">
                EMERGENCY CONTACT & MEDICAL
              </span>
              <div className="flex justify-between text-paper/90 text-[11px] pt-0.5">
                <span>Blood: <strong>{bloodGroup}</strong></span>
                <span>ICE: <strong>{emergencyPhone}</strong></span>
              </div>
            </div>

            {/* Official Seal & Flip Action */}
            <div className="p-4 border-t border-white/10 bg-black/20 flex items-center justify-between text-[11px] font-mono text-paper/70">
              <div>
                <p className="font-bold text-mustard">VERIFIED BY EVENTMESH</p>
                <p className="text-[9px] text-paper/50">NON-TRANSFERABLE PASS</p>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  setIsFlipped(false)
                }}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-paper/10 hover:bg-paper/20 text-paper text-xs transition-colors"
                aria-label="Flip back to front"
              >
                <ArrowsClockwise className="w-3.5 h-3.5" /> Back
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default StudentIDCard2D
