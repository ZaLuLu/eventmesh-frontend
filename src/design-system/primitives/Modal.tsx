import React, { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  subtitle?: string
  children: React.ReactNode
  maxWidth?: string
  surface?: 'public' | 'admin'
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

  const bgColor = surface === 'admin' ? 'bg-[#EEF2F6]' : 'bg-[#EEF2F6]'

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
            aria-hidden="true"
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.96, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className={`relative z-10 w-full ${maxWidth} max-h-[90vh] overflow-y-auto ${bgColor} text-slate-900 rounded-3xl neo-card border border-white/80 shadow-2xl p-6 sm:p-8 flex flex-col gap-6`}
          >
            <div className="flex items-start justify-between gap-4 border-b border-slate-200/80 pb-4">
              <div>
                {subtitle && (
                  <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-indigo-600 block mb-1">
                    {subtitle}
                  </span>
                )}
                {title && (
                  <h3 className="font-display font-bold text-2xl sm:text-3xl text-slate-900 tracking-tight">
                    {title}
                  </h3>
                )}
              </div>

              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-full neo-pill hover:shadow-neo-sm text-slate-500 hover:text-slate-800 transition-colors"
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
