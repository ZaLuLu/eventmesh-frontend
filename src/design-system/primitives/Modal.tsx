import React, { useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { X } from '@phosphor-icons/react'

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  subtitle?: string
  children: React.ReactNode
  maxWidth?: string
  surface?: 'public' | 'admin' | 'dark'
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'max-w-xl',
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

  const isDark = surface === 'dark' || surface === 'admin'

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop: Solid tactile ink wash, zero synthetic blur (Gate 7 & Mandate 3) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
            className={`fixed inset-0 ${isDark ? 'bg-black/80' : 'bg-ink/50'}`}
            aria-hidden="true"
          />

          {/* Modal surface: Tactile object with hard offset shadow */}
          <motion.div
            role="dialog"
            aria-modal="true"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className={`relative z-10 w-full ${maxWidth} max-h-[90vh] overflow-y-auto ${
              isDark
                ? 'bg-[#181530] text-[#F6F1E7] border-2 border-[#2D2852] shadow-[5px_5px_0_var(--lime)]'
                : 'bg-card text-ink border-2 border-ink shadow-[5px_5px_0_var(--ink)]'
            } rounded-2xl p-6 sm:p-8 flex flex-col gap-6`}
          >
            <div className={`flex items-start justify-between gap-4 border-b ${isDark ? 'border-[#2D2852]' : 'border-ink/15'} pb-4`}>
              <div>
                {subtitle && (
                  <span className={`font-mono text-xs font-semibold uppercase tracking-wider block mb-1 ${isDark ? 'text-indigo-300' : 'text-ink-soft'}`}>
                    {subtitle}
                  </span>
                )}
                {title && (
                  <h3 className={`font-display font-extrabold text-xl sm:text-2xl tracking-tight ${isDark ? 'text-white' : 'text-ink'}`}>
                    {title}
                  </h3>
                )}
              </div>

              <button
                type="button"
                onClick={onClose}
                className={`p-2 rounded-lg border transition-colors duration-150 ${
                  isDark
                    ? 'border-[#2D2852] hover:bg-white/10 text-slate-300 hover:text-white'
                    : 'border-ink/20 hover:bg-paper-2 text-ink hover:text-cobalt'
                }`}
                aria-label="Close modal"
              >
                <X size={18} weight="bold" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
