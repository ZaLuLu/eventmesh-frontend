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
          {/* Backdrop: Frosted ambient wash */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
            className={`fixed inset-0 backdrop-blur-md ${isDark ? 'bg-black/70' : 'bg-black/30'}`}
            aria-hidden="true"
          />

          {/* Modal surface: Modern-minimal floating surface */}
          <motion.div
            role="dialog"
            aria-modal="true"
            initial={{ opacity: 0, scale: 0.98, y: 4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 4 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className={`relative z-10 w-full ${maxWidth} max-h-[90vh] overflow-y-auto ${
              isDark
                ? 'bg-[#16131F] text-[#F4F2F8] border border-[#292338]'
                : 'bg-card text-ink border border-line shadow-xl'
            } rounded-2xl p-6 sm:p-7 flex flex-col gap-6`}
          >
            <div className={`flex items-start justify-between gap-4 border-b ${isDark ? 'border-[#292338]' : 'border-line'} pb-4`}>
              <div>
                {subtitle && (
                  <span className={`font-mono text-xs uppercase tracking-wider block mb-1 ${isDark ? 'text-accent' : 'text-accent'}`}>
                    {subtitle}
                  </span>
                )}
                {title && (
                  <h3 className={`font-sans font-semibold text-xl tracking-tight ${isDark ? 'text-white' : 'text-ink'}`}>
                    {title}
                  </h3>
                )}
              </div>

              <button
                type="button"
                onClick={onClose}
                className={`p-1.5 rounded-full transition-colors duration-150 ${
                  isDark
                    ? 'hover:bg-white/10 text-zinc-400 hover:text-white'
                    : 'hover:bg-surface-subtle text-ink-soft hover:text-ink'
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
