import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useQueryClient } from '@tanstack/react-query'
import { X, Check } from '@/design-system/Icon'
import { Button } from '@/design-system/primitives/Button'
import { Field } from '@/design-system/primitives/Field'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/design-system/primitives/Toast'
import { api } from '@/api'

interface ProfileDetailsModalProps {
  isOpen: boolean
  onClose: () => void
}

export const ProfileDetailsModal: React.FC<ProfileDetailsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { session } = useAuth()
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [registrationNumber, setRegistrationNumber] = useState('')
  const [degreeBranch, setDegreeBranch] = useState('')
  const [campus, setCampus] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  // Initialize from session and local cached memory
  useEffect(() => {
    if (session) {
      const s = session as any
      if (session.name) setName(session.name)
      if (s.phone) setPhone(s.phone)
      if (s.registrationNumber || s.studentId) setRegistrationNumber(s.registrationNumber || s.studentId)
      if (s.degreeBranch || s.branch) setDegreeBranch(s.degreeBranch || s.branch)
      if (s.campus || s.institutionName) setCampus(s.campus || s.institutionName)
    }

    try {
      const saved = localStorage.getItem('eventmesh_student_profile')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed.phone) setPhone((prev) => prev || parsed.phone)
        if (parsed.regNumber) setRegistrationNumber((prev) => prev || parsed.regNumber)
        if (parsed.branch) setDegreeBranch((prev) => prev || parsed.branch)
        if (parsed.collegeName) setCampus((prev) => prev || parsed.collegeName)
      }
    } catch {}

    // Also query backend profile if session exists
    if (session) {
      api.auth.getProfile?.()
        .then((p) => {
          if (p) {
            if (p.display_name) setName((prev) => prev || p.display_name || '')
            if (p.phone) setPhone((prev) => prev || p.phone || '')
            if (p.student_id) setRegistrationNumber((prev) => prev || p.student_id || '')
            if (p.location) setDegreeBranch((prev) => prev || p.location || '')
            if ((p as any).branch) setDegreeBranch((prev) => prev || (p as any).branch || '')
            if (p.institution_name) setCampus((prev) => prev || p.institution_name || '')
          }
        })
        .catch(() => {})
    }
  }, [session, isOpen])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      // 1. Save to local storage for instant offline/offline autofill memory
      try {
        localStorage.setItem(
          'eventmesh_student_profile',
          JSON.stringify({
            phone,
            regNumber: registrationNumber,
            branch: degreeBranch,
            collegeName: campus,
          })
        )
      } catch {}

      // 2. Persist to backend database profile
      if (session) {
        await api.auth.updateProfile?.({
          display_name: name || undefined,
          phone: phone || undefined,
          student_id: registrationNumber || undefined,
          location: degreeBranch || undefined,
          institution_name: campus || undefined,
        })
      }

      // 3. Invalidate auth query to refresh all session-dependent views
      await queryClient.invalidateQueries({ queryKey: ['auth', 'session'] })

      toast({
        title: 'Profile Updated',
        message: 'Your attendee details will now automatically pre-fill on every event checkout.',
        type: 'success',
      })

      onClose()
    } catch (err: any) {
      toast({
        title: 'Save failed',
        message: err?.detail || err?.message || 'Could not update profile details.',
        type: 'error',
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none"
          role="dialog"
          aria-modal="true"
          aria-label="Edit Profile Details"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60"
          />

          {/* Modal Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="relative w-full max-w-lg bg-surface border border-line rounded-3xl shadow-xl overflow-hidden z-10"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 pb-4 border-b border-line">
              <div>
                <h3 className="text-lg font-bold text-ink">Attendee Profile Details</h3>
                <p className="text-xs text-ink-soft">
                  Stored securely to auto-fill event registrations and ticket passes.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-full text-ink-muted hover:text-ink hover:bg-surface-subtle transition-colors"
                aria-label="Close dialog"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <Field
                id="profile-name"
                name="name"
                label="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Suraj Nayak"
                required
              />

              <div className="space-y-1">
                <Field
                  id="profile-phone"
                  name="phone"
                  label="Phone Number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +91 98765 43210"
                  required
                />
                <p className="text-[11px] text-ink-muted">
                  Used for SMS passes, Cashfree gateway receipts, and entry updates.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field
                  id="profile-reg"
                  name="registrationNumber"
                  label="Student Reg. No. / USN"
                  value={registrationNumber}
                  onChange={(e) => setRegistrationNumber(e.target.value)}
                  placeholder="e.g. 1RV22CS099"
                />

                <Field
                  id="profile-branch"
                  name="degreeBranch"
                  label="Academic Branch"
                  value={degreeBranch}
                  onChange={(e) => setDegreeBranch(e.target.value)}
                  placeholder="e.g. Computer Science"
                />
              </div>

              <Field
                id="profile-campus"
                name="campus"
                label="College / Campus Name"
                value={campus}
                onChange={(e) => setCampus(e.target.value)}
                placeholder="e.g. Apex Institute of Technology"
              />

              {/* Action Buttons */}
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-line">
                <Button
                  type="button"
                  variant="ghost"
                  size="dense"
                  onClick={onClose}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="dense"
                  loading={isSaving}
                  className="bg-ink hover:bg-accent text-paper font-semibold"
                >
                  <Check size={16} className="mr-1.5" />
                  Save to Profile
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
