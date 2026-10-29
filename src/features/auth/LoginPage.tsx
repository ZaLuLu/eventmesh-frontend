import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, CheckCircle } from '@phosphor-icons/react'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/design-system/primitives/Toast'
import {
  supabase,
  signInWithGoogleIdToken,
  signInWithGoogleOAuth,
} from '@/lib/supabaseClient'
import { SEED_DEMO_USERS } from '@/api/adapters/mock/seedData'

export const LoginPage: React.FC = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const { sendOtp, verifyOtp, isSendingOtp, isVerifyingOtp, switchDemoAccount } = useAuth()

  const [step, setStep] = useState<'email' | 'otp'>('email')
  const [email, setEmail] = useState('')
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', ''])
  const [error, setError] = useState('')
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [gsiLoaded, setGsiLoaded] = useState(false)

  const googleBtnContainerRef = useRef<HTMLDivElement>(null)
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([])

  const navigateAfterAuth = (userSession?: any) => {
    if (['platform_admin', 'org_admin', 'club_admin', 'volunteer'].includes(userSession?.role)) {
      navigate('/admin')
      return
    }

    let completed = Boolean(userSession?.onboarding_completed)
    if (!completed) {
      try {
        const stored = localStorage.getItem('eventmesh_onboarding_completed')
        if (stored === 'true') completed = true
      } catch {}
    }

    if (!completed) {
      navigate('/onboarding')
    } else {
      navigate('/attendee/dashboard')
    }
  }

  // 1. Process incoming OAuth redirect callback
  useEffect(() => {
    const hash = window.location.hash
    const search = window.location.search

    if (hash.includes('access_token=') || search.includes('code=')) {
      setIsGoogleLoading(true)
      supabase.auth
        .getSession()
        .then(({ data: { session }, error: sessionErr }: any) => {
          if (session?.access_token) {
            localStorage.setItem('eventmesh_auth_token', session.access_token)
            const userName =
              session.user.user_metadata?.full_name ||
              session.user.user_metadata?.name ||
              session.user.email?.split('@')[0] ||
              'User'

            queryClient.setQueryData(['auth', 'session'], {
              id: session.user.id || 'usr_auth',
              name: userName,
              email: session.user.email || '',
              role: 'attendee',
              orgId: session.user.user_metadata?.institution_name || 'campus',
              avatar: session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture,
            })
            queryClient.invalidateQueries({ queryKey: ['auth'] }).catch(() => {})
            toast({
              title: 'Signed in with Google',
              message: `Welcome back, ${userName}!`,
              type: 'success',
            })
            window.history.replaceState(null, '', window.location.pathname)
            navigateAfterAuth(session.user)
          } else if (sessionErr) {
            setError(sessionErr.message || 'Google authentication error.')
          }
        })
        .catch((err: any) => {
          setError(err?.message || 'Failed to complete Google authentication.')
        })
        .finally(() => {
          setIsGoogleLoading(false)
        })
    }
  }, [navigate, toast, queryClient])

  // 2. Initialize Google Identity Services
  useEffect(() => {
    const clientId =
      import.meta.env.VITE_GOOGLE_CLIENT_ID ||
      '351870508664-0e94jtlh957f057nbu9nmj761r5nu9s6.apps.googleusercontent.com'

    let mounted = true
    let timer: any

    const setupGoogle = () => {
      const google = (window as any).google
      const container = googleBtnContainerRef.current
      if (!google?.accounts?.id || !container) return false

      try {
        google.accounts.id.initialize({
          client_id: clientId,
          callback: async (response: any) => {
            if (!mounted || !response?.credential) return
            setIsGoogleLoading(true)
            setError('')
            try {
              const res = await signInWithGoogleIdToken(response.credential)
              const user = res.session?.user || res.user
              const userName =
                user?.user_metadata?.full_name ||
                user?.user_metadata?.name ||
                user?.email?.split('@')[0] ||
                'User'

              queryClient.setQueryData(['auth', 'session'], {
                id: user?.id || 'usr_auth',
                name: userName,
                email: user?.email || '',
                role: 'attendee',
                orgId: user?.user_metadata?.institution_name || 'campus',
                avatar: user?.user_metadata?.avatar_url || user?.user_metadata?.picture,
              })

              queryClient.invalidateQueries({ queryKey: ['auth'] }).catch(() => {})

              toast({
                title: 'Signed in with Google',
                message: `Welcome back, ${userName}!`,
                type: 'success',
              })
              navigateAfterAuth(user)
            } catch (err: any) {
              console.error('Google ID token authentication error:', err)
              setError(err?.message || 'Google sign-in was interrupted.')
            } finally {
              if (mounted) setIsGoogleLoading(false)
            }
          },
          auto_select: false,
          cancel_on_tap_outside: true,
        })

        const isDark = document.documentElement.dataset.theme !== 'light'
        container.innerHTML = ''
        google.accounts.id.renderButton(container, {
          type: 'standard',
          theme: isDark ? 'filled_black' : 'outline',
          size: 'large',
          text: 'continue_with',
          shape: 'pill',
          logo_alignment: 'left',
          width: 320,
        })
        setGsiLoaded(true)
        return true
      } catch (err) {
        console.warn('Google Identity Services init failed:', err)
        return false
      }
    }

    if (!setupGoogle()) {
      timer = setInterval(() => {
        if (setupGoogle()) {
          clearInterval(timer)
        }
      }, 100)
    }

    const observer = new MutationObserver(() => {
      setupGoogle()
    })
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    })

    return () => {
      mounted = false
      if (timer) clearInterval(timer)
      observer.disconnect()
    }
  }, [step, navigate, toast, queryClient])

  // 3. Fast 1-Tap Login for Suraj Naik (Test Profile)
  const handleQuickLoginSuraj = async () => {
    setError('')
    try {
      const surajProfile = SEED_DEMO_USERS[0]
      queryClient.setQueryData(['auth', 'session'], surajProfile)
      if (switchDemoAccount) {
        await switchDemoAccount({ role: 'org_admin' })
      }
      toast({
        title: 'Signed in as Suraj Naik',
        message: 'Loaded active student credentials.',
        type: 'success',
      })
      navigate('/attendee/dashboard')
    } catch (err: any) {
      setError(err?.message || 'Could not authenticate test persona.')
    }
  }

  // 4. Email OTP Handlers
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address.')
      return
    }

    try {
      const res = await sendOtp(email)
      toast({ title: 'Code sent', message: res.message, type: 'info' })
      setStep('otp')
      setOtpDigits(['', '', '', '', '', ''])
      setTimeout(() => otpInputRefs.current[0]?.focus(), 50)
    } catch {
      setError('Failed to send verification code. Please try again.')
    }
  }

  const handleDigitChange = (index: number, val: string) => {
    const cleaned = val.replace(/\D/g, '')
    if (!cleaned) {
      const newDigits = [...otpDigits]
      newDigits[index] = ''
      setOtpDigits(newDigits)
      return
    }

    if (cleaned.length > 1) {
      const digitsArr = cleaned.slice(0, 6).split('')
      const newDigits = [...otpDigits]
      for (let i = 0; i < 6; i++) {
        if (digitsArr[i]) {
          newDigits[i] = digitsArr[i]
        }
      }
      setOtpDigits(newDigits)
      const nextIndex = Math.min(digitsArr.length, 5)
      otpInputRefs.current[nextIndex]?.focus()
      return
    }

    const newDigits = [...otpDigits]
    newDigits[index] = cleaned[0]
    setOtpDigits(newDigits)

    if (index < 5) {
      otpInputRefs.current[index + 1]?.focus()
    }
  }

  const handleDigitKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus()
    }
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const otp = otpDigits.join('')
    if (otp.length !== 6) {
      setError('Please enter all 6 digits of the verification code.')
      return
    }

    try {
      const session = await verifyOtp({ email, otp })
      await queryClient.invalidateQueries({ queryKey: ['auth'] })
      toast({
        title: 'Signed In',
        message: `Welcome back, ${session.name}!`,
        type: 'success',
      })
      if (['platform_admin', 'org_admin', 'club_admin', 'volunteer'].includes(session.role)) {
        navigate('/admin')
      } else {
        navigateAfterAuth(session)
      }
    } catch {
      setError('Invalid or expired verification code.')
    }
  }

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true)
    setError('')
    try {
      await signInWithGoogleOAuth()
    } catch (err: any) {
      console.error('Google Sign-In error:', err)
      setError(err?.message || 'Google sign-in was interrupted.')
      setIsGoogleLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Editorial Card Header */}
      <div className="text-center space-y-1.5">
        <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white tracking-tight">
          {step === 'email' ? 'Sign in to EventMesh' : 'Check your email'}
        </h2>
        <p className="text-xs text-slate-600 dark:text-zinc-400">
          {step === 'email'
            ? 'Enter your email to receive a secure access code.'
            : `We sent a 6-digit code to ${email}`}
        </p>
      </div>

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/25 rounded-xl text-xs font-medium text-red-600 dark:text-red-400 text-center">
          {error}
        </div>
      )}

      {step === 'email' ? (
        <div className="space-y-4">
          {/* Official Google Sign In */}
          <div className="w-full flex justify-center min-h-[44px]">
            <div
              ref={googleBtnContainerRef}
              id="google-signin-btn"
              style={{ display: gsiLoaded ? 'flex' : 'none', justifyContent: 'center', width: '100%' }}
            />
            {!gsiLoaded && (
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isGoogleLoading}
                className="w-full h-11 px-4 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-750 text-slate-800 dark:text-zinc-100 font-semibold text-xs flex items-center justify-center gap-2.5 transition-all shadow-xs cursor-pointer active:scale-[0.99] disabled:opacity-60"
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
            )}
          </div>

          {/* Clean Editorial Divider */}
          <div className="relative my-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-zinc-800" />
            </div>
            <div className="relative flex justify-center text-[11px] uppercase tracking-wider font-semibold text-slate-400 dark:text-zinc-500">
              <span className="bg-white dark:bg-[#121218] px-3">or continue with email</span>
            </div>
          </div>

          {/* Email Input Form */}
          <form onSubmit={handleSendOtp} className="space-y-3.5">
            <div className="space-y-1.5">
              <label htmlFor="login-email" className="text-xs font-semibold text-slate-800 dark:text-zinc-200 block">
                Email address
              </label>
              <input
                id="login-email"
                type="email"
                required
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@ctu.edu.in"
                className="w-full h-11 px-3.5 rounded-xl border border-slate-300 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-900 text-slate-900 dark:text-white text-sm font-medium placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:border-indigo-600 focus:bg-white dark:focus:bg-zinc-900 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all shadow-xs"
              />
            </div>

            <button
              type="submit"
              disabled={isSendingOtp}
              className="w-full h-11 rounded-xl bg-slate-950 dark:bg-white text-white dark:text-slate-950 hover:bg-black dark:hover:bg-slate-100 font-semibold text-sm transition-all shadow-sm active:scale-[0.99] disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{isSendingOtp ? 'Sending code…' : 'Continue with Email'}</span>
            </button>
          </form>

          {/* High-Visibility Clean Test Profile Callout */}
          <div className="pt-3 border-t border-slate-100 dark:border-zinc-800/80">
            <button
              type="button"
              onClick={handleQuickLoginSuraj}
              aria-label="Test profile: Suraj Naik (CTU Lead)"
              className="w-full group flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100/90 dark:bg-zinc-900/60 dark:hover:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700/80 hover:border-slate-300 dark:hover:border-zinc-600 transition-all text-left cursor-pointer shadow-xs"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs tracking-wider shadow-xs">
                  SN
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    Suraj Naik <span className="font-normal text-slate-500 dark:text-zinc-400 text-[11px]">(CTU Lead)</span>
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-zinc-400 font-mono">
                    ceosuraj@email.com
                  </div>
                </div>
              </div>
              <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                1-Tap Demo &rarr;
              </span>
            </button>
          </div>
        </div>
      ) : (
        /* Step 2: Segmented 6-Box OTP Verification Form */
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <div className="space-y-2.5">
            <div className="flex items-center justify-center gap-2 sm:gap-2.5">
              {otpDigits.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => (otpInputRefs.current[idx] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleDigitChange(idx, e.target.value)}
                  onKeyDown={(e) => handleDigitKeyDown(idx, e)}
                  className="w-10 h-12 sm:w-11 sm:h-13 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-950 dark:text-white text-center text-lg font-mono font-bold focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/25 outline-none transition-all shadow-xs"
                />
              ))}
            </div>
            <p className="text-[11px] font-mono text-slate-500 dark:text-zinc-400 text-center">
              Dev Mode: Any 6 digits will verify.
            </p>
          </div>

          <button
            type="submit"
            disabled={isVerifyingOtp || otpDigits.join('').length !== 6}
            className="w-full h-11 rounded-xl bg-slate-950 dark:bg-white text-white dark:text-slate-950 hover:bg-black dark:hover:bg-slate-100 font-semibold text-sm transition-all shadow-sm active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
          >
            <CheckCircle size={16} weight="bold" />
            <span>{isVerifyingOtp ? 'Verifying…' : 'Continue'}</span>
          </button>

          <div className="flex items-center justify-between text-xs text-slate-600 dark:text-zinc-400 pt-2 border-t border-slate-200 dark:border-zinc-800">
            <button
              type="button"
              onClick={() => {
                setStep('email')
                setOtpDigits(['', '', '', '', '', ''])
                setError('')
              }}
              className="inline-flex items-center gap-1 hover:text-black dark:hover:text-white transition-colors font-medium cursor-pointer"
            >
              <ArrowLeft size={12} weight="bold" />
              <span>Use different email</span>
            </button>
            <button
              type="button"
              onClick={handleSendOtp}
              className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold cursor-pointer"
            >
              Resend code
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
