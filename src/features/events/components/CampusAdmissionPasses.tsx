import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Check, ArrowRight, Ticket, Sparkles, ShieldCheck, QrCode } from 'lucide-react'
import { EventAdmissionTicket } from '@/design-system/micro/EventAdmissionTicket'
import { cn } from '@/lib/utils'

export interface PassTier {
  id: string
  name: string
  tag: string
  price: string
  period: string
  description: string
  features: string[]
  isPopular?: boolean
  ctaText: string
}

const PASS_TIERS: PassTier[] = [
  {
    id: 'general',
    name: 'General Campus Pass',
    tag: 'OPEN ADMISSION',
    price: '₹0',
    period: 'FREE ADMISSION',
    description: 'Designed for casual attendees, observers, and campus symposium audiences.',
    features: [
      'Access to all open keynote auditoriums',
      'Exhibition hall demo floor walking',
      'Campus high-speed network access',
      'Digital certificate of participation',
      'Standard turnstile gate check-in',
    ],
    ctaText: 'Select Free Pass',
  },
  {
    id: 'builder',
    name: 'Builder & Hackathon Pass',
    tag: 'FLAGSHIP · VERIFIED BUILDERS',
    price: '₹249',
    period: 'OR FREE WITH .EDU',
    description: 'Full competitive accreditation for 48h hackathons, algorithm sprints, and hands-on labs.',
    features: [
      '48-hour continuous overnight hackathon floor',
      'Algorithmic sprint & system review qualification',
      'Dedicated mentoring sessions with industry engineers',
      'Meal & hydration tokens included across 48h',
      'Priority fast-track NFC / QR turnstile clearance',
    ],
    isPopular: true,
    ctaText: 'Claim Builder Pass',
  },
  {
    id: 'patron',
    name: 'All-Access VIP Patron',
    tag: 'ALL INCLUSIVE',
    price: '₹499',
    period: 'LIMITED TO 50 PASSES',
    description: 'Unrestricted premium access to front-row amphitheatre seats, lounges, and pro-night arenas.',
    features: [
      'Reserved front-row amphitheatre seating',
      'Speaker, scientist & keynote networking lounge',
      'Pro-night music and cultural mainstage front pit',
      'Commemorative engraved physical pass lanyard',
      'Priority access to company hiring recruiters',
    ],
    ctaText: 'Select VIP Pass',
  },
]

export const CampusAdmissionPasses: React.FC<{ className?: string }> = ({ className = '' }) => {
  const [selectedTier, setSelectedTier] = useState<string>('builder')
  const [showLiveTicket, setShowLiveTicket] = useState(false)

  const sampleRegistration = {
    id: 'reg_2026_grand_turing',
    ticketCode: 'MESH-TURING-2026',
    eventTitle: 'The Grand Turing Hackathon 2026',
    eventStartsAt: '2026-10-24T09:00:00Z',
    createdAt: '2026-10-12T10:00:00Z',
    venueName: 'Tech Park Hall A & Mainstage',
    status: 'confirmed',
    userName: 'Aarav Sharma',
    userEmail: 'aarav.sharma@campus.edu',
  }

  return (
    <section
      id="admission"
      aria-label="Campus Admission and Passes"
      className={cn('w-full py-14 sm:py-20 relative select-none border-t border-[#E2E8F0]', className)}
    >
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Unboxed Chapter Header */}
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 pb-8 border-b border-[#E2E8F0] mb-12">
          <div>
            <span className="text-xs font-mono text-[#0047FF] font-semibold tracking-wider block mb-1">
              05 // ADMISSION TIERS & PASSES
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#0A0A0A] tracking-tight font-sans">
              Campus Accreditation & Passes
            </h2>
            <p className="text-sm text-slate-500 font-sans mt-1">
              Instant digital pass issuance with verifiable QR gate credentials.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowLiveTicket(!showLiveTicket)}
            className="inline-flex items-center gap-2 h-9 px-4 border border-[#E2E8F0] bg-[#F8FAFC] hover:border-[#0047FF] text-[#0A0A0A] hover:text-[#0047FF] font-mono text-xs uppercase tracking-wider transition-colors cursor-pointer"
          >
            <Ticket className="w-3.5 h-3.5 text-[#0047FF]" />
            <span>{showLiveTicket ? 'Hide Live Pass' : 'Preview Tactile Pass'}</span>
          </button>
        </div>

        {/* Live Tactile Paper Pass Simulator (Unboxed, zero modals) */}
        {showLiveTicket && (
          <div className="mb-14 p-6 sm:p-10 border border-[#E2E8F0] bg-[#F8FAFC] flex flex-col items-center">
            <div className="text-center mb-6">
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#0047FF] font-bold block mb-1">
                TACTILE DIGITAL PASS DEMONSTRATION
              </span>
              <p className="text-xs text-slate-500 font-mono">
                Interact with the perforation stub to test natural venue gate check-in
              </p>
            </div>

            <EventAdmissionTicket
              registration={sampleRegistration}
              onAdmit={() => console.log('Admitted!')}
            />
          </div>
        )}

        {/* 3-Column Pass Grid (Directly matching Screen 6 of reference moodboard) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10 items-stretch">
          {PASS_TIERS.map((tier) => {
            const isHighlight = tier.isPopular

            return (
              <div
                key={tier.id}
                onClick={() => setSelectedTier(tier.id)}
                className={cn(
                  'flex flex-col justify-between p-6 sm:p-8 transition-all duration-200 cursor-pointer relative',
                  isHighlight
                    ? 'bg-[#0047FF] text-white shadow-xl'
                    : 'bg-white border border-[#E2E8F0] text-[#0A0A0A] hover:border-[#0047FF]'
                )}
              >
                {/* Corner registration ticks */}
                <span className={cn('absolute -top-1.5 -left-1.5 text-xs font-mono pointer-events-none z-20', isHighlight ? 'text-white' : 'text-[#0047FF]')}>┌</span>
                <span className={cn('absolute -top-1.5 -right-1.5 text-xs font-mono pointer-events-none z-20', isHighlight ? 'text-white' : 'text-[#0047FF]')}>┐</span>
                <span className={cn('absolute -bottom-1.5 -left-1.5 text-xs font-mono pointer-events-none z-20', isHighlight ? 'text-white' : 'text-[#0047FF]')}>└</span>
                <span className={cn('absolute -bottom-1.5 -right-1.5 text-xs font-mono pointer-events-none z-20', isHighlight ? 'text-white' : 'text-[#0047FF]')}>┘</span>

                <div>
                  {/* Top Tag */}
                  <div className="flex items-center justify-between mb-4">
                    <span
                      className={cn(
                        'text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 font-bold',
                        isHighlight
                          ? 'bg-white/20 text-white border border-white/30'
                          : 'bg-[#F8FAFC] text-[#0047FF] border border-[#E2E8F0]'
                      )}
                    >
                      {tier.tag}
                    </span>
                  </div>

                  {/* Tier Title */}
                  <h3 className="text-xl sm:text-2xl font-bold font-sans tracking-tight mb-2">
                    {tier.name}
                  </h3>

                  {/* Price */}
                  <div className="flex items-baseline gap-2 mb-4 font-mono">
                    <span className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                      {tier.price}
                    </span>
                    <span className={cn('text-xs uppercase', isHighlight ? 'text-white/80' : 'text-slate-400')}>
                      {tier.period}
                    </span>
                  </div>

                  {/* Description */}
                  <p className={cn('text-xs sm:text-sm leading-relaxed mb-6 font-sans', isHighlight ? 'text-white/90' : 'text-slate-500')}>
                    {tier.description}
                  </p>

                  {/* Feature Checklist */}
                  <div className={cn('pt-6 border-t space-y-3 mb-8', isHighlight ? 'border-white/20' : 'border-[#E2E8F0]')}>
                    <span className={cn('text-[11px] font-mono uppercase tracking-wider font-semibold block', isHighlight ? 'text-white/80' : 'text-slate-400')}>
                      INCLUDED PRIVILEGES
                    </span>

                    {tier.features.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-xs">
                        <Check className={cn('w-4 h-4 shrink-0 mt-0.5', isHighlight ? 'text-white' : 'text-[#0047FF]')} />
                        <span className={isHighlight ? 'text-white/95' : 'text-slate-700'}>
                          {feat}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom Action Button */}
                <Link
                  to="/explore"
                  className={cn(
                    'w-full h-11 flex items-center justify-center gap-2 font-mono text-xs uppercase tracking-wider font-bold transition-all',
                    isHighlight
                      ? 'bg-white text-[#0047FF] hover:bg-slate-100 shadow-md'
                      : 'bg-[#F8FAFC] text-[#0A0A0A] border border-[#E2E8F0] hover:border-[#0047FF] hover:text-[#0047FF]'
                  )}
                >
                  <span>{tier.ctaText}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
