import React from 'react'
import { create } from 'zustand'
import { motion, AnimatePresence } from 'motion/react'
import { Check, WarningCircle, Info, X } from '@phosphor-icons/react'

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
            success: <Check className="h-4 w-4 text-[#8FE3C6] flex-shrink-0" />,
            error: <WarningCircle className="h-4 w-4 text-[#FFA69E] flex-shrink-0" />,
            info: <Info className="h-4 w-4 text-[#E7E4DE] flex-shrink-0" />,
          }

          return (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              transition={{ duration: 0.2 }}
              className="pointer-events-auto bg-ink text-white rounded-[10px] shadow-[4px_4px_0_#000] p-4 flex items-start gap-3 border-2 border-white/20"
            >
              <div className="mt-0.5">
                {typeIcons[t.type || 'info']}
              </div>

              <div className="flex-1 text-small">
                <p className="font-semibold text-white leading-tight">
                  {t.title}
                </p>
                {t.message && (
                  <p className="text-caption text-[#D0CCC6] mt-1">
                    {typeof t.message === 'string'
                      ? t.message
                      : Array.isArray(t.message)
                      ? (t.message as any[])
                          .map((m) =>
                            typeof m === 'object' && m !== null
                              ? m.msg || m.message || JSON.stringify(m)
                              : String(m)
                          )
                          .join(', ')
                      : typeof t.message === 'object' && t.message !== null
                      ? (t.message as any).msg ||
                        (t.message as any).message ||
                        (t.message as any).detail ||
                        JSON.stringify(t.message)
                      : String(t.message)}
                  </p>
                )}
                {t.onUndo && (
                  <button
                    type="button"
                    onClick={() => {
                      t.onUndo?.()
                      removeToast(t.id)
                    }}
                    className="mt-2 text-caption font-semibold text-accent-soft hover:underline block"
                  >
                    Undo action
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => removeToast(t.id)}
                className="text-[#AFAFB0] hover:text-white p-1 rounded transition-colors"
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
