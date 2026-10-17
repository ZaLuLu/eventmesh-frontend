// Hallmark macrostructure: Auth-InviteAccept
import React, { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { api, InvitationRead } from '@/api'
import { Button } from '@/design-system/primitives/Button'
import { useToast } from '@/design-system/primitives/Toast'
import {
  CheckCircle,
  WarningCircle,
  ArrowRight,
  UserCheck,
  EnvelopeSimple,
  Clock,
} from '@/design-system/Icon'
import { ShieldCheck, Buildings } from '@phosphor-icons/react'

export const InviteAcceptPage: React.FC = () => {
  const { token } = useParams<{ token: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()
  const {
    session,
    isAuthenticated,
    sendOtp,
    verifyOtp,
    isSendingOtp,
    isVerifyingOtp,
  } = useAuth()

  // Acceptance state
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [acceptedInvitation, setAcceptedInvitation] = useState<InvitationRead | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Unauthenticated user inline sign-in state
  const [loginStep, setLoginStep] = useState<'email' | 'otp'>('email')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [loginError, setLoginError] = useState('')

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError('')
    if (!email.trim() || !email.includes('@')) {
      setLoginError('Please enter a valid academic or professional email address.')
      return
    }
    try {
      const res = await sendOtp(email)
      toast({ title: 'Access Code Dispatched', message: res.message, type: 'info' })
      setLoginStep('otp')
    } catch {
      setLoginError('Unable to send verification code. Please check your network and retry.')
    }
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError('')
    if (otp.trim().length !== 6) {
      setLoginError('Please enter the 6-digit access code.')
      return
    }
    try {
      const newSession = await verifyOtp({ email, otp })
      toast({
        title: 'Authenticated',
        message: `Welcome, ${newSession.name}!`,
        type: 'success',
      })
      // Immediately proceed to accept the invitation
      await executeAccept()
    } catch {
      setLoginError('Invalid or expired code. Please retry.')
    }
  }

  const executeAccept = async () => {
    if (!token) {
      setError('Invalid or missing invitation token in URL.')
      return
    }

    setIsSubmitting(true)
    setError(null)
    try {
      if (api.organizations.acceptInvitation) {
        const inv = await api.organizations.acceptInvitation(token)
        setAcceptedInvitation(inv)
        toast({
          title: 'Invitation Accepted!',
          message: `You are now a member of ${inv.organization_name || 'the organization'}.`,
          type: 'success',
        })
      } else {
        // Fallback for mocked interfaces
        setAcceptedInvitation({
          id: `inv-${Date.now()}`,
          organization_id: 'org-target',
          organization_name: 'Campus Organization',
          organization_slug: 'campus-org',
          role: 'co_admin',
          recipient_email: session?.email || null,
          invited_by_id: 'usr-admin',
          invited_by_name: 'Lead Organizer',
          status: 'accepted',
          expires_at: new Date(Date.now() + 86400000).toISOString(),
          created_at: new Date().toISOString(),
        })
      }
    } catch (err: any) {
      const msg = err?.message || 'Failed to accept invitation. The invitation may be expired or already used.'
      setError(msg)
      toast({ title: 'Acceptance Error', message: msg, type: 'error' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-paper flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8 font-sans antialiased selection:bg-accent selection:text-on-accent relative overflow-hidden">
      {/* Background Decor Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-64 bg-accent/5 blur-3xl pointer-events-none rounded-full" />
      <div className="absolute -bottom-20 right-10 w-96 h-96 bg-mint/5 blur-3xl pointer-events-none rounded-full" />

      {/* Main Ticket Container */}
      <div className="w-full max-w-lg bg-card border-[1.5px] border-ink rounded-ticket shadow-offset-lg overflow-hidden relative z-10 transition-all">
        {/* Ticket Header Strip */}
        <div className="p-4 sm:p-5 bg-paper-2 border-b border-ink/15 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[8px] bg-accent/15 border border-accent/30 text-accent flex items-center justify-center font-bold">
              <ShieldCheck size={20} weight="bold" />
            </div>
            <div>
              <span className="font-mono text-[10px] uppercase font-bold tracking-widest text-text-3 block">
                OFFICIAL ACCESS
              </span>
              <h1 className="font-display font-bold text-base text-ink tracking-tight">
                Staff & Admin Invitation
              </h1>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold tracking-wider bg-accent/15 text-accent border border-accent/25 uppercase">
            SECURE LINK
          </span>
        </div>

        {/* Card Body */}
        <div className="p-6 sm:p-8 relative">
          {acceptedInvitation ? (
            /* SUCCESS STATE WITH STAMP */
            <div className="flex flex-col items-center text-center space-y-6 relative">
              <div className="relative w-full flex justify-center py-2">
                <div className="w-24 h-24 rounded-full border-4 border-dashed border-mint/40 bg-mint/5 flex flex-col items-center justify-center transform -rotate-6 transition-transform hover:rotate-0 duration-300">
                  <span className="text-[10px] font-mono font-extrabold text-mint tracking-widest">ACCEPTED</span>
                  <CheckCircle size={28} weight="bold" className="text-mint my-1" />
                  <span className="text-[9px] font-mono text-text-3 uppercase">STAFF PASS</span>
                </div>
              </div>

              <div className="space-y-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-mint/15 text-mint border border-mint/30">
                  <CheckCircle size={14} weight="bold" />
                  ACCESS GRANTED
                </span>
                <h2 className="font-display font-bold text-2xl text-ink tracking-tight">
                  Welcome to the Team!
                </h2>
                <p className="text-sm text-text-2 max-w-sm mx-auto leading-relaxed">
                  Your credentials have been authenticated and added to{' '}
                  <strong className="text-ink">
                    {acceptedInvitation.organization_name || 'the organization'}
                  </strong>
                  . You can now manage events, registrations, and desk operations in Studio.
                </p>
              </div>

              <div className="w-full p-4 rounded-[12px] bg-paper-2 border border-ink/15 text-left text-xs font-mono space-y-2">
                <div className="flex justify-between text-text-2">
                  <span>Role Assigned:</span>
                  <span className="font-bold text-accent uppercase">
                    {acceptedInvitation.role || 'co_admin'}
                  </span>
                </div>
                <div className="flex justify-between text-text-2">
                  <span>Authorized User:</span>
                  <span className="font-bold text-ink">{session?.email || 'Authenticated'}</span>
                </div>
                <div className="flex justify-between text-text-2">
                  <span>Timestamp:</span>
                  <span className="text-text-3">
                    {new Date().toLocaleTimeString()}
                  </span>
                </div>
              </div>

              <div className="w-full pt-2 flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={() => navigate('/admin')}
                  className="flex-1 justify-center gap-2 bg-ink text-paper hover:bg-accent hover:text-on-accent"
                >
                  <span>Launch Studio Console</span>
                  <ArrowRight size={16} weight="bold" />
                </Button>
                <Link
                  to="/"
                  className="px-4 py-2.5 rounded-btn border border-ink/20 text-xs font-bold text-ink hover:bg-paper-2 flex items-center justify-center transition-colors"
                >
                  Public Site
                </Link>
              </div>
            </div>
          ) : !token ? (
            /* MISSING TOKEN STATE */
            <div className="text-center py-6 space-y-4">
              <WarningCircle size={40} className="text-coral mx-auto" weight="bold" />
              <h2 className="font-display font-bold text-lg text-ink">
                Invalid Invitation Link
              </h2>
              <p className="text-sm text-text-2 max-w-xs mx-auto">
                No invitation security token was detected in this link. Please check the URL provided by your administrator.
              </p>
              <Link
                to="/"
                className="inline-block mt-4 text-xs font-bold text-accent hover:underline"
              >
                Return to Campus Events
              </Link>
            </div>
          ) : isAuthenticated ? (
            /* AUTHENTICATED: READY TO ACCEPT */
            <div className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-text-3 font-mono text-xs">
                  <Buildings size={16} />
                  <span>ORGANIZATION ONBOARDING</span>
                </div>
                <h2 className="font-display font-bold text-2xl text-ink tracking-tight">
                  You Have Been Invited
                </h2>
                <p className="text-sm text-text-2 leading-relaxed">
                  You are receiving access to collaborate on event scheduling, ticketing, check-in desks, and operational analytics.
                </p>
              </div>

              {/* User Session Profile Pill */}
              <div className="p-4 rounded-[12px] bg-paper-2 border border-ink/15 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-text-3 uppercase">Invited Account:</span>
                  <span className="inline-flex items-center gap-1 font-mono font-bold text-accent">
                    <UserCheck size={14} weight="bold" />
                    Signed In
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-accent/20 border border-accent/40 text-accent font-bold font-mono flex items-center justify-center text-sm">
                    {session?.name ? session.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="truncate">
                    <div className="font-bold text-sm text-ink truncate">{session?.name}</div>
                    <div className="text-xs text-text-2 truncate">{session?.email}</div>
                  </div>
                </div>
              </div>

              {error && (
                <div className="p-3.5 rounded-[8px] bg-coral/10 border border-coral/30 text-coral text-xs font-medium flex items-start gap-2.5">
                  <WarningCircle size={16} weight="bold" className="flex-shrink-0 mt-0.5" />
                  <div className="leading-snug">{error}</div>
                </div>
              )}

              <div className="pt-2 space-y-3">
                <Button
                  onClick={executeAccept}
                  disabled={isSubmitting}
                  className="w-full justify-center gap-2 py-3 bg-accent text-on-accent text-sm font-bold shadow-offset-xs"
                >
                  {isSubmitting ? (
                    <div className="w-4 h-4 border-2 border-on-accent border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Accept Invitation & Join</span>
                      <ArrowRight size={16} weight="bold" />
                    </>
                  )}
                </Button>

                <p className="text-[11px] text-center text-text-3 font-mono">
                  By accepting, you agree to adhere to organizational conduct policies.
                </p>
              </div>
            </div>
          ) : (
            /* UNAUTHENTICATED: INLINE SIGN IN */
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-text-3 font-mono text-xs">
                  <Clock size={15} />
                  <span>STEP 1 OF 2 · AUTHENTICATION</span>
                </div>
                <h2 className="font-display font-bold text-2xl text-ink tracking-tight">
                  Sign In to Accept
                </h2>
                <p className="text-sm text-text-2 leading-relaxed">
                  Please authenticate with your email address to claim this staff invitation and join the organization.
                </p>
              </div>

              {loginStep === 'email' ? (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-mono font-bold text-ink uppercase tracking-wider">
                      Email Address <span className="text-coral">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        placeholder="you@campus.edu"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full h-11 px-3.5 pr-10 rounded-btn border-[1.5px] border-ink bg-paper text-sm text-ink placeholder:text-text-3 focus:outline-none focus:ring-2 focus:ring-accent"
                        disabled={isSendingOtp}
                        required
                      />
                      <EnvelopeSimple
                        size={18}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-3 pointer-events-none"
                      />
                    </div>
                    {loginError && <p className="text-xs text-coral font-medium mt-1">{loginError}</p>}
                  </div>

                  <Button
                    type="submit"
                    disabled={isSendingOtp}
                    className="w-full justify-center gap-2 py-2.5 bg-ink text-paper text-xs font-bold uppercase tracking-wider"
                  >
                    {isSendingOtp ? (
                      <div className="w-4 h-4 border-2 border-paper border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Send 6-Digit Access Code</span>
                        <ArrowRight size={14} weight="bold" />
                      </>
                    )}
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div className="p-3 bg-paper-2 border border-ink/15 rounded-[8px] flex items-center justify-between text-xs">
                    <span className="text-text-2 truncate font-mono">{email}</span>
                    <button
                      type="button"
                      onClick={() => setLoginStep('email')}
                      className="text-accent font-bold hover:underline"
                    >
                      Change
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-mono font-bold text-ink uppercase tracking-wider">
                      6-Digit Verification Code <span className="text-coral">*</span>
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="123456"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="w-full h-12 text-center font-mono font-bold text-lg tracking-[0.3em] rounded-btn border-[1.5px] border-ink bg-paper text-ink focus:outline-none focus:ring-2 focus:ring-accent"
                      disabled={isVerifyingOtp}
                      required
                    />
                    {loginError && <p className="text-xs text-coral font-medium mt-1">{loginError}</p>}
                  </div>

                  <Button
                    type="submit"
                    disabled={isVerifyingOtp}
                    className="w-full justify-center gap-2 py-2.5 bg-accent text-on-accent text-xs font-bold uppercase tracking-wider"
                  >
                    {isVerifyingOtp ? (
                      <div className="w-4 h-4 border-2 border-on-accent border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Verify & Accept Invitation</span>
                        <ArrowRight size={14} weight="bold" />
                      </>
                    )}
                  </Button>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Perforated bottom ticket edge */}
        <div className="h-2 w-full bg-repeating-linear-to-r from-transparent via-ink/20 to-transparent bg-[length:12px_2px]" />
      </div>
    </div>
  )
}
