import React, { useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { X } from '@phosphor-icons/react'

export interface SheetProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  subtitle?: string
  children: React.ReactNode
  surface?: 'public' | 'admin'
}

export const Sheet: React.FC<SheetProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  surface = 'public',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      window.addEventListener('keydown', handleKeyDown)
    }
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          {/* Backdrop: Frosted ambient wash */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60"
            aria-hidden="true"
          />

          {/* Sheet Surface: Modern-minimal bottom sheet */}
          <motion.div
            role="dialog"
            aria-modal="true"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ duration: 0.25, ease: [0.2, 0.8, 0.2, 1] }}
            className="relative z-10 w-full max-w-2xl max-h-[88vh] overflow-y-auto bg-card text-ink rounded-t-3xl border-t border-line shadow-2xl p-6 sm:p-8 flex flex-col gap-5"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-4 border-b border-line pb-4">
              <div>
                {subtitle && (
                  <span className="font-mono text-xs uppercase tracking-wider text-accent block mb-1">
                    {subtitle}
                  </span>
                )}
                {title && (
                  <h3 className="font-sans font-semibold text-xl text-ink">
                    {title}
                  </h3>
                )}
              </div>

              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-surface-subtle text-ink-soft hover:text-ink transition-colors duration-150"
                aria-label="Close sheet"
              >
                <X size={20} weight="bold" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
