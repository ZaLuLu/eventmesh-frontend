import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { PrintMark } from './PrintMark'
import { stampSound } from './sound'
import { type StampStatus, type StampInk, STAMP_INKS } from './types'
import { Button } from '@/design-system/primitives/Button'
import { Check, X } from '@phosphor-icons/react'
import './stamp.css'

export interface StampActionOverlayProps {
  isOpen: boolean
  onClose: () => void
  status: StampStatus
  ink?: StampInk
  title?: string
  subtitle?: string
  dateText?: string
  documentContent?: React.ReactNode
  onComplete?: () => void
  autoCloseDelay?: number
}

/**
 * 3D Physical Desk Stamp Celebration Modal / Overlay.
 * Directly reverse engineered from mortspace/stamp:
 * - 3D perspective stage with dynamic air swoosh
 * - Physical rubber stamp head impact with sub-bass thump
 * - Tactile document recoil / desk shake
 * - High-fidelity SVG turbulence ink mark imprint
 * - Paper lift chime
 */
export const StampActionOverlay: React.FC<StampActionOverlayProps> = ({
  isOpen,
  onClose,
  status,
  ink,
  title,
  subtitle,
  dateText,
  documentContent,
  onComplete,
  autoCloseDelay,
}) => {
  const [stamped, setStamped] = useState(false)
  const [shaking, setShaking] = useState(false)
  const [stampHeadVisible, setStampHeadVisible] = useState(false)

  useEffect(() => {
    if (!isOpen) {
      setStamped(false)
      setShaking(false)
      setStampHeadVisible(false)
      return
    }

    // Sequence the physical stamp animation
    setStampHeadVisible(true)
    stampSound.playSwoosh(0.5)

    // Stamp impacts desk at 420ms
    const impactTimer = setTimeout(() => {
      setStamped(true)
      setShaking(true)
      stampSound.playThump(1.0)
    }, 420)

    // Reset card shake after recoil
    const shakeResetTimer = setTimeout(() => {
      setShaking(false)
    }, 850)

    // Stamp lifts away with chime at 750ms
    const chimeTimer = setTimeout(() => {
      stampSound.playChime(0.4)
    }, 750)

    // Finish stamp cycle
    const finishTimer = setTimeout(() => {
      setStampHeadVisible(false)
      if (onComplete) onComplete()
    }, 1000)

    let autoCloseTimer: NodeJS.Timeout | null = null
    if (autoCloseDelay) {
      autoCloseTimer = setTimeout(() => {
        onClose()
      }, autoCloseDelay)
    }

    return () => {
      clearTimeout(impactTimer)
      clearTimeout(shakeResetTimer)
      clearTimeout(chimeTimer)
      clearTimeout(finishTimer)
      if (autoCloseTimer) clearTimeout(autoCloseTimer)
    }
  }, [isOpen, onComplete, autoCloseDelay, onClose])

  if (!isOpen) return null

  const inkConfig = ink ? STAMP_INKS[ink] : undefined

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/70 backdrop-blur-md">
        {/* Backdrop click to dismiss */}
        <div className="absolute inset-0" onClick={onClose} />

        {/* 3D Stage Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 8 }}
          transition={{ duration: 0.2, ease: [0.2, 0.8, 0.2, 1] }}
          className="relative z-10 max-w-lg w-full bg-surface border border-line rounded-panel shadow-floating overflow-hidden perspective-stamp-stage"
        >
          {/* Header Bar */}
          <div className="px-5 py-3.5 border-b border-line flex items-center justify-between bg-paper-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-accent animate-pulse" />
              <span className="text-caption font-mono uppercase tracking-wider text-accent font-semibold">
                {title || 'Credential Verification'}
              </span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1 text-text-3 hover:text-text rounded-btn transition-colors"
              aria-label="Close"
            >
              <X size={16} weight="bold" />
            </button>
          </div>

          {/* Main Document / Ticket Preview Canvas */}
          <div className="p-6 relative">
            <div
              className={`relative bg-paper rounded-panel border border-line p-5 shadow-sm transition-transform duration-150 ${
                shaking ? 'animate-desk-shake' : ''
              }`}
            >
              {/* Optional Custom Content or Standard Pass Layout */}
              {documentContent ? (
                documentContent
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-3 border-b border-line">
                    <div>
                      <p className="text-caption text-text-3 font-mono">DOCUMENT NO.</p>
                      <p className="font-mono font-bold text-accent text-sm">EM-PASS-9821</p>
                    </div>
                    <div className="text-right">
                      <p className="text-caption text-text-3 font-mono">STATUS</p>
                      <p className="font-mono font-semibold text-text text-sm capitalize">{status}</p>
                    </div>
                  </div>
                  <div className="py-2">
                    <p className="text-small text-text-2">
                      Verified and logged through EventMesh protocol.
                    </p>
                  </div>
                </div>
              )}

              {/* Ink Print Mark Overlay */}
              {stamped && (
                <div className="absolute right-6 bottom-5 z-20 pointer-events-none">
                  <PrintMark
                    print={{
                      status,
                      ink,
                      subtitle,
                      dateText,
                      rotate: -4.5,
                    }}
                    animate={true}
                    scale={1.05}
                  />
                </div>
              )}
            </div>

            {/* 3D Physical Stamp Plunging Head (Visual Simulator) */}
            {stampHeadVisible && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-30">
                <div className="animate-stamp-slam flex flex-col items-center">
                  {/* Stamp Wood & Chrome Handle */}
                  <div className="w-10 h-24 rounded-full bg-gradient-to-b from-amber-900 via-amber-800 to-amber-950 border border-amber-950/40 shadow-2xl relative">
                    <div className="absolute top-2 inset-x-2 h-4 rounded-full bg-white/20" />
                  </div>
                  {/* Chrome Neck Collar */}
                  <div className="w-16 h-3 rounded-t-sm bg-gradient-to-r from-slate-400 via-slate-100 to-slate-400 border border-slate-400" />
                  {/* Heavy Rubber Stamp Plinth */}
                  <div
                    className="w-48 h-12 rounded-lg border-2 shadow-2xl flex items-center justify-center"
                    style={{
                      backgroundColor: inkConfig?.color || '#242426',
                      borderColor: inkConfig?.border || '#101012',
                    }}
                  >
                    <span className="font-mono text-xs font-bold text-white tracking-widest uppercase">
                      EVENTMESH STAMP
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="px-5 py-3.5 border-t border-line bg-paper-2 flex items-center justify-between">
            <span className="text-caption text-text-3 font-mono">
              {stamped ? 'Stamped & Verified' : 'Applying credential...'}
            </span>
            <Button
              surface="admin"
              variant="primary"
              size="sm"
              icon={<Check size={16} weight="bold" />}
              onClick={onClose}
            >
              Continue
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
