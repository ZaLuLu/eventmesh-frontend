import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/design-system/primitives/Button'
import { Field } from '@/design-system/primitives/Field'
import { useToast } from '@/design-system/primitives/Toast'

export const LoginPage: React.FC = () => {
  const navigate = useNavigate()
  const { toast } = useToast()
  const { sendOtp, verifyOtp, isSendingOtp, isVerifyingOtp } = useAuth()

  const [step, setStep] = useState<'email' | 'otp'>('email')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!email.trim() || !email.includes('@')) {
      setError('Please provide a valid email address.')
      return
    }

    try {
      const res = await sendOtp(email)
      toast({ title: 'Access Code Dispatched', message: res.message, type: 'info' })
      setStep('otp')
    } catch {
      setError('Failed to dispatch access code. Please try again.')
    }
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (otp.trim().length !== 6) {
      setError('Please enter the 6-digit numeric access code.')
      return
    }

    try {
      const session = await verifyOtp({ email, otp })
      toast({
        title: 'Identity Confirmed',
        message: `Authenticated as ${session.name}.`,
        type: 'success',
      })
      if (['platform_admin', 'org_admin', 'club_admin', 'volunteer'].includes(session.role)) {
        navigate('/admin')
      } else {
        navigate('/me')
      }
    } catch {
      setError('Invalid or expired access code.')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <span className="font-mono text-[10px] uppercase tracking-widecaps text-ink-60 block mb-1">
          Sign In
        </span>
        <h2 className="font-display text-3xl uppercase text-ink">
          {step === 'email' ? 'Identification' : 'Verify Code'}
        </h2>
        <p className="font-body text-xs text-ink-60 mt-1">
          {step === 'email'
            ? 'Enter your registered email address to receive an access code.'
            : `Enter the 6-digit code dispatched to ${email}.`}
        </p>
      </div>

      {error && (
        <div className="p-3 bg-[#A32828]/10 border border-[#A32828] font-mono text-xs text-[#A32828]">
          {error}
        </div>
      )}

      {step === 'email' ? (
        <form onSubmit={handleSendOtp} className="space-y-5">
          <Field
            type="email"
            label="Email Address"
            required
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="e.g. attendee@example.com or lead@cpclub.org"
          />

          <Button type="submit" size="md" fullWidth arrow loading={isSendingOtp}>
            Dispatch Access Code
          </Button>

          <div className="pt-4 border-t border-ink-15 text-center">
            <Link
              to="/dev/accounts"
              className="font-mono text-xs uppercase text-ink-60 hover:text-ink underline"
            >
              Or switch demo identity on Dev Matrix →
            </Link>
          </div>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp} className="space-y-5">
          <Field
            type="text"
            label="6-Digit Verification Code"
            required
            autoFocus
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="e.g. 123456"
          />

          <div className="flex gap-3">
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={() => setStep('email')}
            >
              Back
            </Button>
            <Button
              type="submit"
              size="md"
              fullWidth
              loading={isVerifyingOtp}
            >
              Confirm Access
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}
