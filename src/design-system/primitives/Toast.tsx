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
      className="fixed bottom-6 right-6 z-[60] flex flex-col gap-2.5 max-w-sm sm:max-w-md w-full px-4 sm:px-0 pointer-events-none"
    >
      <AnimatePresence>
        {toasts.map((t) => {
          const typeIcons = {
            success: (
              <div className="h-6 w-6 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0">
                <Check className="h-3.5 w-3.5 text-emerald-400" weight="bold" />
              </div>
            ),
            error: (
              <div className="h-6 w-6 rounded-full bg-rose-500/15 border border-rose-500/30 flex items-center justify-center shrink-0">
                <WarningCircle className="h-3.5 w-3.5 text-rose-400" weight="bold" />
              </div>
            ),
            info: (
              <div className="h-6 w-6 rounded-full bg-violet-500/15 border border-violet-500/30 flex items-center justify-center shrink-0">
                <Info className="h-3.5 w-3.5 text-violet-400" weight="bold" />
              </div>
            ),
          }

          return (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 16, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="pointer-events-auto bg-[#0D0E12] text-white rounded-[12px] sm:rounded-full border border-white/15 shadow-2xl py-2.5 px-4 flex items-center gap-3"
            >
              <div className="shrink-0">{typeIcons[t.type || 'info']}</div>

              <div className="flex-1 min-w-0 pr-1 text-left">
                <p className="font-semibold text-xs sm:text-sm text-white leading-tight truncate">
                  {t.title}
                </p>
                {t.message && (
                  <p className="text-[11px] text-slate-300 mt-0.5 line-clamp-2 leading-snug">
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
              </div>

              {t.onUndo && (
                <button
                  type="button"
                  onClick={() => {
                    t.onUndo?.()
                    removeToast(t.id)
                  }}
                  className="text-xs font-semibold text-violet-400 hover:text-violet-300 underline underline-offset-2 shrink-0 cursor-pointer transition-colors"
                >
                  Undo
                </button>
              )}

              <button
                type="button"
                onClick={() => removeToast(t.id)}
                className="text-slate-400 hover:text-white p-1 rounded-md transition-colors shrink-0 cursor-pointer"
                aria-label="Dismiss toast"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
