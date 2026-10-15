import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { X, ArrowsClockwise } from '@/design-system/Icon'
import { Cube, IdentificationCard } from '@phosphor-icons/react'
import { Lanyard, StudentIDCard2D, generateStudentIDTexture } from '@/design-system/3d'
import { useAuth } from '@/hooks/useAuth'
import { useMyRegistrations } from '@/hooks/useRegistrations'
import { formatDate } from '@/lib/dates'

interface LanyardProfileOverlayProps {
  isOpen: boolean
  onClose: () => void
}

export const LanyardProfileOverlay: React.FC<LanyardProfileOverlayProps> = ({ isOpen, onClose }) => {
  const { session } = useAuth()
  const { data: registrations = [] } = useMyRegistrations()
  const [viewMode, setViewMode] = useState<'3d' | '2d'>('2d')
  const [isFlipped, setIsFlipped] = useState(false)

  // Derive genuine attended events from confirmed checked_in registrations
  const attendedEvents = useMemo(() => {
    return registrations
      .filter((r) => r.status === 'checked_in')
      .map((r) => ({
        title: r.eventTitle || 'Campus Session',
        date: r.checkedInAt ? formatDate(r.checkedInAt) : formatDate(r.createdAt),
        clubName: '',
      }))
  }, [registrations])

  // Derive earned badges from genuine attended categories
  const earnedBadges = useMemo(() => {
    if (attendedEvents.length === 0) return []
    return [`${attendedEvents.length} Sessions Attended`]
  }, [attendedEvents])

  // Generate textures for 3D physics Lanyard
  const studentData = useMemo(() => {
    return {
      name: session?.name || 'EventMesh member',
      registrationNumber: (session as any)?.registrationNumber || '',
      degreeBranch: (session as any)?.degreeBranch || '',
      semester: (session as any)?.semester,
      email: session?.email || '',
      role: session?.role?.replace('_', ' ') || 'Attendee',
      campus: (session as any)?.campus || '',
      attendedEvents,
      earnedBadges,
    }
  }, [session, attendedEvents, earnedBadges])

  const frontTexture = useMemo(() => {
    if (!isOpen || viewMode !== '3d') return ''
    return generateStudentIDTexture(studentData, 'front')
  }, [studentData, isOpen, viewMode])

  const backTexture = useMemo(() => {
    if (!isOpen || viewMode !== '3d') return ''
    return generateStudentIDTexture(studentData, 'back')
  }, [studentData, isOpen, viewMode])

  // Escape key handler
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center select-none"
          role="dialog"
          aria-modal="true"
          aria-label="Student Identity Lanyard"
        >
          {/* Frosted Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/75"
          />

          {/* Floating Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="fixed top-6 right-6 z-50 p-2.5 rounded-full bg-card hover:bg-surface-subtle text-ink border border-line transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            aria-label="Close profile pass"
          >
            <X size={20} weight="bold" />
          </button>

          {/* Top Controls Bar */}
          <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-3 py-1.5 rounded-full bg-card border border-line text-xs text-ink">
            <span className="font-mono text-[11px] text-white/80 pr-1">CAMPUS PASS</span>
            <div className="h-3 w-[1px] bg-white/20" />
            <button
              type="button"
              onClick={() => setViewMode(viewMode === '3d' ? '2d' : '3d')}
              className="px-2.5 py-1 rounded-full bg-surface-subtle hover:bg-paper-2 transition-colors flex items-center gap-1 font-mono text-[11px]"
            >
              {viewMode === '3d' ? (
                <>
                  <IdentificationCard size={13} weight="bold" /> Switch to 2D
                </>
              ) : (
                <>
                  <Cube size={13} weight="bold" /> Switch to 3D
                </>
              )}
            </button>
          </div>

          {/* Center Stage Container */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative z-10 w-full max-w-xl h-[560px] sm:h-[620px] flex flex-col items-center justify-center p-4"
          >
            {viewMode === '3d' ? (
              <div className="w-full h-full flex flex-col items-center justify-center relative">
                {/* 3D Physics Lanyard Canvas */}
                <div className="w-full h-[480px] sm:h-[540px] flex items-center justify-center">
                  {frontTexture && backTexture && (
                    <Lanyard
                      frontImage={frontTexture}
                      backImage={backTexture}
                      cardColor="var(--card)"
                      finish="matte"
                      orientation="portrait"
                      strapColor="var(--accent)"
                      size={0.92}
                      strapLength={0.34}
                      intro={false}
                      breeze={0.03}
                      className="w-full h-full"
                    />
                  )}
                </div>

                {/* Interaction Hint */}
                <p className="mt-[-10px] text-center font-mono text-[11px] text-white/60 tracking-wider">
                  Drag with mouse or touch to swing & inspect reverse attendance
                </p>
              </div>
            ) : (
              /* 2D Accessible Card Fallback */
              <div className="w-full flex flex-col items-center justify-center space-y-4">
                <div className="relative">
                  <StudentIDCard2D
                    name={studentData.name}
                    registrationNumber={studentData.registrationNumber}
                    degreeBranch={studentData.degreeBranch}
                    semester={studentData.semester}
                    email={studentData.email}
                    role={studentData.role}
                    campus={studentData.campus}
                  />
                </div>

                <div className="text-center font-mono text-xs text-white/70">
                  <span>Verified Registrations: {attendedEvents.length} admitted sessions</span>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export default LanyardProfileOverlay
