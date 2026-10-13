import React, { useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { X } from 'lucide-react'

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

  const isDark = surface === 'dark'

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className={`fixed inset-0 ${isDark ? 'bg-black/80 backdrop-blur-md' : 'bg-text/40'}`}
            aria-hidden="true"
          />

          {/* Modal surface */}
          <motion.div
            role="dialog"
            aria-modal="true"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className={`relative z-10 w-full ${maxWidth} max-h-[90vh] overflow-y-auto ${
              isDark
                ? 'bg-[#0C0A1A] text-slate-100 border border-white/15 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)]'
                : 'bg-surface text-text border border-line shadow-floating'
            } rounded-panel p-6 sm:p-8 flex flex-col gap-6`}
          >
            <div className={`flex items-start justify-between gap-4 border-b ${isDark ? 'border-white/10' : 'border-line'} pb-4`}>
              <div>
                {subtitle && (
                  <span className={`text-caption font-medium block mb-1 ${isDark ? 'text-indigo-300/80 font-mono text-[11px] uppercase tracking-wider' : 'text-text-2'}`}>
                    {subtitle}
                  </span>
                )}
                {title && (
                  <h3 className={`font-bold text-xl sm:text-2xl tracking-tight ${isDark ? 'text-white' : 'text-text'}`}>
                    {title}
                  </h3>
                )}
              </div>

              <button
                type="button"
                onClick={onClose}
                className={`p-2 rounded-[8px] border transition-colors duration-150 ${
                  isDark
                    ? 'border-white/10 hover:bg-white/10 text-slate-400 hover:text-white'
                    : 'border-line hover:bg-subtle text-text-2 hover:text-text'
                }`}
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
