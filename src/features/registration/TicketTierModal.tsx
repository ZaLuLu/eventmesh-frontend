import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  X,
  Ticket,
  Check,
  Zap,
  Users,
  ShieldCheck,
  Sparkles,
  ArrowRight,
} from 'lucide-react'
import { Event } from '@/api'
import { Button } from '@/design-system/primitives/Button'

export interface TicketTierModalProps {
  isOpen: boolean
  onClose: () => void
  event: Event
}

interface Tier {
  id: string
  name: string
  price: string
  tag?: string
  description: string
  spotsLeft: number
  features: string[]
}

export const TicketTierModal: React.FC<TicketTierModalProps> = ({
  isOpen,
  onClose,
  event,
}) => {
  const navigate = useNavigate()
  const [selectedTierId, setSelectedTierId] = useState('tier-general')

  if (!isOpen) return null

  const tiers: Tier[] = [
    {
      id: 'tier-general',
      name: 'General Attendee Pass',
      price: 'Free',
      description: 'Full access to keynote stages, open workshops & exhibition showcases.',
      spotsLeft: 42,
      features: ['Stage access', 'Digital pass with QR', 'Digital certificate on check-in'],
    },
    {
      id: 'tier-builder',
      name: 'Builder / Hacker Pass',
      price: 'Free',
      tag: 'Most Popular',
      description: 'Dedicated hackathon seat, mentor queue & cloud platform sponsor credits.',
      spotsLeft: 14,
      features: [
        'All General Pass perks',
        'Workstation & high-speed Wi-Fi',
        'Submission portal access',
        'Cloud API vouchers',
      ],
    },
    {
      id: 'tier-vip',
      name: 'VIP & Team Lead Pass',
      price: 'Free',
      tag: 'Fast Filling',
      description: 'Priority gate entry terminal, reserved front seating & speaker lounge access.',
      spotsLeft: 6,
      features: [
        'Fast-track gate terminal',
        'Reserved auditorium seating',
        'Speaker lounge mixer',
        'Executive physical credential kit',
      ],
    },
  ]

  const handleProceed = () => {
    navigate(`/events/${event.slug}/register?tier=${selectedTierId}`)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl rounded-3xl bg-white border border-slate-200 shadow-2xl p-6 sm:p-8 overflow-hidden">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          aria-label="Close dialog"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="mb-6 pr-8">
          <div className="flex items-center gap-2 text-xs font-bold text-brand-red uppercase tracking-wider mb-1">
            <Ticket className="h-4 w-4" />
            <span>Select Ticket Tier</span>
          </div>
          <h2 className="font-display font-extrabold text-2xl text-slate-900 leading-tight">
            {event.title}
          </h2>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Choose your registration category to receive your instant digital QR pass
          </p>
        </div>

        {/* Tier Cards */}
        <div className="space-y-3 mb-6">
          {tiers.map((tier) => {
            const isSelected = selectedTierId === tier.id
            return (
              <div
                key={tier.id}
                role="button"
                tabIndex={0}
                onClick={() => setSelectedTierId(tier.id)}
                className={`relative p-4 rounded-2xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'border-brand-red bg-red-50/40 shadow-sm ring-1 ring-brand-red/50'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                }`}
              >
                <div className="flex items-start justify-between gap-4 mb-1">
                  <div className="flex items-center gap-2">
                    <span className="font-display font-bold text-base text-slate-900">
                      {tier.name}
                    </span>
                    {tier.tag && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-brand-red text-white shadow-2xs">
                        {tier.tag}
                      </span>
                    )}
                  </div>

                  <span className="font-extrabold text-sm text-slate-900">
                    {tier.price}
                  </span>
                </div>

                <p className="text-xs text-slate-600 mb-2 leading-relaxed">
                  {tier.description}
                </p>

                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                    ⚡ Only {tier.spotsLeft} passes remaining
                  </span>

                  <span className="text-slate-400 font-medium">
                    {tier.features.length} perks included
                  </span>
                </div>
              </div>
            )
          })}
        </div>

        {/* Modal Actions */}
        <div className="flex items-center gap-3">
          <Button variant="secondary" size="md" onClick={onClose} fullWidth>
            Cancel
          </Button>

          <Button variant="gradient" size="md" onClick={handleProceed} fullWidth arrow>
            Continue to Registration
          </Button>
        </div>
      </div>
    </div>
  )
}
