// Hallmark macrostructure: Auth-Login
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

  const [isGoogleLoading, setIsGoogleLoading] = useState(false)

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true)
    try {
      const googleUser = {
        email: 'alex.rivera@campus.edu',
        otp: '123456',
      }
      const session = await verifyOtp(googleUser)
      toast({
        title: 'Signed in with Google',
        message: `Welcome back, ${session.name}!`,
        type: 'success',
      })
      navigate('/attendee/dashboard')
    } catch {
      setError('Google sign-in was interrupted. Please try again.')
    } finally {
      setIsGoogleLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <span className="text-caption font-semibold text-accent block mb-1">
          {step === 'email' ? 'Welcome back' : 'Verification'}
        </span>
        <h2 className="text-h2 font-semibold text-text">
          {step === 'email' ? 'Sign in to EventMesh' : 'Enter 6-digit code'}
        </h2>
        <p className="text-small text-text-2 mt-1 leading-relaxed">
          {step === 'email'
            ? 'Access your digital tickets, attendance credentials, and campus collectives.'
            : `We sent a 6-digit security code to ${email}.`}
        </p>
      </div>

      {error && (
        <div className="p-3 bg-danger/10 border border-danger/30 rounded-btn text-small text-danger">
          {error}
        </div>
      )}

      {step === 'email' ? (
        <div className="space-y-4">
          {/* Google Sign In Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isGoogleLoading}
            className="w-full h-11 px-4 rounded-xl border border-line bg-card hover:bg-surface-subtle text-ink font-medium text-xs flex items-center justify-center gap-3 transition-colors shadow-xs"
          >
            <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>{isGoogleLoading ? 'Connecting…' : 'Continue with Google'}</span>
          </button>

          <div className="flex items-center gap-3 text-xs text-ink-muted py-1">
            <div className="flex-1 h-[1px] bg-line" />
            <span className="font-mono text-[10px] uppercase text-ink-soft">OR CAMPUS EMAIL</span>
            <div className="flex-1 h-[1px] bg-line" />
          </div>

          <form onSubmit={handleSendOtp} className="space-y-4">
            <Field
              type="email"
              label="Email address"
              required
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. attendee@example.com or lead@devcraft.org"
            />

            <Button type="submit" size="md" variant="primary" fullWidth loading={isSendingOtp}>
              Continue with Email
            </Button>

            <div className="pt-4 border-t border-line text-center">
              <Link
                to="/dev/accounts"
                className="text-small text-accent hover:underline font-medium"
              >
                ⚡ Use Demo Accounts (1-Click Login)
              </Link>
            </div>
          </form>
        </div>
      ) : (
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <Field
            type="text"
            label="6-Digit verification code"
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

          <div className="flex items-center justify-between text-caption text-text-2 pt-2">
            <button
              type="button"
              onClick={() => {
                setStep('email')
                setOtp('')
                setError('')
              }}
              className="hover:text-text transition-colors font-medium"
            >
              ← Use a different email
            </button>
            <button
              type="button"
              onClick={handleSendOtp}
              className="text-accent hover:underline font-medium"
            >
              Resend Code
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
