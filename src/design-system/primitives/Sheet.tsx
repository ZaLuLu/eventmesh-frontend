import React, { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

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

  const bgColor = surface === 'admin' ? 'bg-[#E6EAEC]' : 'bg-paper'

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          {/* Backdrop (Flat darkened tint, no backdrop blur) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="fixed inset-0 bg-ink/60"
            aria-hidden="true"
          />

          {/* Sheet Surface */}
          <motion.div
            role="dialog"
            aria-modal="true"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className={`relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto ${bgColor} text-ink border-t-2 border-ink p-6 sm:p-8 flex flex-col gap-6`}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-4 border-b border-ink-15 pb-4">
              <div>
                {subtitle && (
                  <span className="font-mono text-[11px] font-medium uppercase tracking-widecaps text-ink-60 block mb-1">
                    {subtitle}
                  </span>
                )}
                {title && (
                  <h3 className="font-display text-2xl sm:text-3xl text-ink">
                    {title}
                  </h3>
                )}
              </div>

              <button
                type="button"
                onClick={onClose}
                className="p-2 border border-ink-15 hover:border-ink hover:bg-ink hover:text-paper transition-colors duration-150"
                aria-label="Close sheet"
              >
                <X className="h-5 w-5" />
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
