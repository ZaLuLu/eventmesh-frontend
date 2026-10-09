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

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Flat semi-transparent backdrop without blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-text/40"
            aria-hidden="true"
          />

          {/* Modal surface: solid --surface, 1px hairline --line, 14px radius, floating shadow */}
          <motion.div
            role="dialog"
            aria-modal="true"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className={`relative z-10 w-full ${maxWidth} max-h-[90vh] overflow-y-auto bg-surface text-text rounded-panel border border-line shadow-floating p-6 sm:p-8 flex flex-col gap-6`}
          >
            <div className="flex items-start justify-between gap-4 border-b border-line pb-4">
              <div>
                {subtitle && (
                  <span className="text-caption font-medium text-text-2 block mb-1">
                    {subtitle}
                  </span>
                )}
                {title && (
                  <h3 className="font-semibold text-xl sm:text-2xl text-text tracking-tight">
                    {title}
                  </h3>
                )}
              </div>

              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-[8px] border border-line hover:bg-subtle text-text-2 hover:text-text transition-colors duration-150"
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
