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
      toast({ title: 'Access Code Sent', message: res.message, type: 'info' })
      setStep('otp')
    } catch {
      setError('Failed to send verification code. Please try again.')
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
        title: 'Signed In',
        message: `Welcome back, ${session.name}!`,
        type: 'success',
      })
      if (['platform_admin', 'org_admin', 'club_admin', 'volunteer'].includes(session.role)) {
        navigate('/admin')
      } else {
        navigate('/attendee/dashboard')
      }
    } catch {
      setError('Invalid or expired verification code.')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <span className="text-xs font-bold text-gradient-feral uppercase tracking-wider block mb-1">
          {step === 'email' ? 'Welcome Back' : 'Verification'}
        </span>
        <h2 className="font-display font-bold text-2xl text-slate-900 tracking-tight">
          {step === 'email' ? 'Sign In to EventMesh' : 'Enter 6-Digit Code'}
        </h2>
        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
          {step === 'email'
            ? 'Enter your email address to receive an instant verification code.'
            : `We sent a 6-digit security code to ${email}.`}
        </p>
      </div>

      {error && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 shadow-neo-sm rounded-2xl text-xs font-medium text-rose-700">
          {error}
        </div>
      )}

      {step === 'email' ? (
        <form onSubmit={handleSendOtp} className="space-y-4">
          <Field
            type="email"
            label="Email Address"
            required
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="e.g. attendee@example.com or lead@cpclub.org"
          />

          <Button type="submit" size="md" variant="primary" fullWidth arrow loading={isSendingOtp}>
            Continue with Email
          </Button>

          <div className="pt-4 border-t border-slate-200/60 text-center">
            <Link
              to="/dev/accounts"
              className="text-xs text-indigo-600 hover:text-indigo-700 hover:underline font-semibold"
            >
              ⚡ Use Demo Accounts (1-Click Login)
            </Link>
          </div>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <Field
            type="text"
            label="6-Digit Verification Code"
            required
            autoFocus
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
            placeholder="e.g. 123456"
            helpText="Dev Note: Any 6 digits will work in development mode."
          />

          <Button type="submit" size="md" variant="primary" fullWidth loading={isVerifyingOtp}>
            Verify & Sign In
          </Button>

          <div className="flex items-center justify-between text-xs text-slate-500 pt-2">
            <button
              type="button"
              onClick={() => {
                setStep('email')
                setOtp('')
                setError('')
              }}
              className="hover:text-indigo-600 transition-colors font-medium"
            >
              ← Use a different email
            </button>
            <button
              type="button"
              onClick={handleSendOtp}
              className="text-indigo-600 hover:text-indigo-700 hover:underline font-semibold"
            >
              Resend Code
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
