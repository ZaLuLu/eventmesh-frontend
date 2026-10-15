import React, { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { X, Check } from '@/design-system/Icon'
import { CURATED_AVATARS, saveUserAvatarPreference, getUserAvatarPreference } from '@/lib/avatars'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/design-system/primitives/Toast'
import { cn } from '@/lib/utils'

interface AvatarSelectorModalProps {
  isOpen: boolean
  onClose: () => void
  onAvatarSelected?: (avatarUrl: string) => void
}

export const AvatarSelectorModal: React.FC<AvatarSelectorModalProps> = ({
  isOpen,
  onClose,
  onAvatarSelected,
}) => {
  const { session } = useAuth()
  const { toast } = useToast()

  const currentPref = session ? getUserAvatarPreference(session.id) : null
  const [selectedId, setSelectedId] = useState<string>(currentPref?.avatarId || CURATED_AVATARS[0].id)

  const handleSave = () => {
    if (!session) return
    const chosen = CURATED_AVATARS.find((a) => a.id === selectedId) || CURATED_AVATARS[0]

    saveUserAvatarPreference(session.id, {
      avatarUrl: chosen.dataUrl,
      source: 'custom',
      avatarId: chosen.id,
    })

    if (onAvatarSelected) {
      onAvatarSelected(chosen.dataUrl)
    }

    toast({
      title: 'Avatar Updated',
      message: `Your identity avatar has been saved as ${chosen.label}.`,
      type: 'success',
    })

    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none"
          role="dialog"
          aria-modal="true"
          aria-label="Select Profile Avatar"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/75"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="relative z-10 w-full max-w-md bg-card border border-line rounded-2xl p-6 shadow-xl space-y-6 text-ink"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-line">
              <div>
                <h3 className="font-sans font-bold text-base text-ink">Choose Profile Avatar</h3>
                <p className="text-xs text-ink-soft font-mono">Curated local collection · 100% offline</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-surface-subtle text-ink-soft hover:text-ink transition-colors"
                aria-label="Close dialog"
              >
                <X size={16} weight="bold" />
              </button>
            </div>

            {/* Avatar Grid */}
            <div className="grid grid-cols-4 gap-3 max-h-72 overflow-y-auto p-1">
              {CURATED_AVATARS.map((avatar) => {
                const isSelected = selectedId === avatar.id
                return (
                  <button
                    key={avatar.id}
                    type="button"
                    onClick={() => setSelectedId(avatar.id)}
                    className={cn(
                      'relative p-2 rounded-2xl flex flex-col items-center gap-1.5 transition-all border',
                      isSelected
                        ? 'border-accent bg-accent/5 ring-2 ring-accent/30 shadow-xs'
                        : 'border-line/60 hover:border-line hover:bg-surface-subtle'
                    )}
                  >
                    <img
                      src={avatar.dataUrl}
                      alt={avatar.label}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <span className="text-[10px] font-mono text-ink-soft truncate w-full text-center">
                      {avatar.label.split(' ')[0]}
                    </span>

                    {isSelected && (
                      <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-accent text-white flex items-center justify-center">
                        <Check size={10} weight="bold" />
                      </div>
                    )}
                  </button>
                )
              })}
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex items-center justify-end gap-2 border-t border-line">
              <button
                type="button"
                onClick={onClose}
                className="btn-minimal-secondary px-4 py-2 text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="btn-minimal-primary px-5 py-2 text-xs font-semibold"
              >
                Save Avatar
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export default AvatarSelectorModal
