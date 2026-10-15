import React, { useId, useRef } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { X } from '@phosphor-icons/react'

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  subtitle?: string
  children: React.ReactNode
  maxWidth?: string
  surface?: 'public' | 'admin' | 'dark'
  placement?: 'center' | 'bottom' | 'left'
}

/** Compatibility wrapper: existing callers gain naming, focus containment and restoration. */
export const Modal: React.FC<ModalProps> = ({
  isOpen, onClose, title, subtitle, children, maxWidth = 'max-w-xl',
  surface = 'public', placement = 'center',
}) => {
  const descriptionId = useId()
  const returnFocus = useRef<HTMLElement | null>(null)
  const position = placement === 'left'
    ? 'inset-y-0 left-0 w-[min(90vw,320px)] rounded-none'
    : placement === 'bottom'
      ? 'bottom-0 left-1/2 -translate-x-1/2 w-full max-h-[90dvh] rounded-t-[var(--radius-dialog)]'
      : 'left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] max-h-[90dvh] rounded-[var(--radius-dialog)]'
  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => { if (!open) onClose() }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-[var(--color-backdrop)]" />
        <Dialog.Content
          data-theme={surface === 'dark' ? 'dark' : undefined}
          aria-describedby={subtitle ? descriptionId : undefined}
          onOpenAutoFocus={() => { returnFocus.current = document.activeElement as HTMLElement }}
          onCloseAutoFocus={(event) => {
            // Controlled callers generally have an external trigger, not Dialog.Trigger.
            if (returnFocus.current?.isConnected) {
              event.preventDefault()
              returnFocus.current.focus()
            }
          }}
          className={`fixed z-50 ${position} ${maxWidth} overflow-y-auto border border-line bg-card p-5 text-ink shadow-floating sm:p-6`}
        >
          <div className="mb-5 flex items-start justify-between gap-4 border-b border-line pb-4">
            <div className="min-w-0">
              <Dialog.Title className={title ? 'text-lg font-semibold' : 'sr-only'}>{title || 'Dialog'}</Dialog.Title>
              {subtitle && <Dialog.Description id={descriptionId} className="mt-1 text-sm text-ink-soft">{subtitle}</Dialog.Description>}
            </div>
            <Dialog.Close className="flex h-11 w-11 shrink-0 items-center justify-center rounded-input text-ink-soft hover:bg-surface-subtle" aria-label="Close dialog">
              <X size={20} aria-hidden="true" />
            </Dialog.Close>
          </div>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
