import React from 'react'
import { create } from 'zustand'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, AlertCircle, Info, X } from 'lucide-react'

export interface ToastItem {
  id: string
  title: string
  message?: string
  type?: 'success' | 'error' | 'info'
  duration?: number
  onUndo?: () => void
}

interface ToastStore {
  toasts: ToastItem[]
  addToast: (toast: Omit<ToastItem, 'id'>) => string
  removeToast: (id: string) => void
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  addToast: (toast) => {
    const id = Math.random().toString(36).substring(2, 9)
    const newToast: ToastItem = { ...toast, id }
    set((state) => ({ toasts: [...state.toasts, newToast] }))

    const duration = toast.duration || (toast.onUndo ? 6000 : 4000)
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }))
    }, duration)

    return id
  },
  removeToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}))

export function useToast() {
  const addToast = useToastStore((s) => s.addToast)
  const removeToast = useToastStore((s) => s.removeToast)

  return {
    toast: (opts: Omit<ToastItem, 'id'>) => addToast(opts),
    success: (title: string, message?: string) =>
      addToast({ title, message, type: 'success' }),
    error: (title: string, message?: string) =>
      addToast({ title, message, type: 'error' }),
    info: (title: string, message?: string) =>
      addToast({ title, message, type: 'info' }),
    undoToast: (title: string, onUndo: () => void, message?: string) =>
      addToast({ title, message, type: 'info', onUndo }),
    dismiss: removeToast,
  }
}

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToastStore()

  return (
    <div
      aria-live="polite"
      className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none"
    >
      <AnimatePresence>
        {toasts.map((t) => {
          const typeIcons = {
            success: <Check className="h-4 w-4 text-emerald-700" />,
            error: <AlertCircle className="h-4 w-4 text-[#A32828]" />,
            info: <Info className="h-4 w-4 text-ink" />,
          }

          return (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 16, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="pointer-events-auto bg-paper text-ink border-2 border-ink p-4 flex items-start gap-3"
            >
              <div className="mt-0.5 flex-shrink-0">
                {typeIcons[t.type || 'info']}
              </div>

              <div className="flex-1">
                <p className="font-body text-xs font-bold uppercase tracking-caps text-ink">
                  {t.title}
                </p>
                {t.message && (
                  <p className="font-body text-xs text-ink-60 mt-0.5">
                    {t.message}
                  </p>
                )}
                {t.onUndo && (
                  <button
                    type="button"
                    onClick={() => {
                      t.onUndo?.()
                      removeToast(t.id)
                    }}
                    className="mt-2 font-mono text-[11px] font-semibold uppercase tracking-widecaps underline hover:text-[#A32828]"
                  >
                    Undo action
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => removeToast(t.id)}
                className="text-ink-60 hover:text-ink p-1"
                aria-label="Dismiss toast"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
