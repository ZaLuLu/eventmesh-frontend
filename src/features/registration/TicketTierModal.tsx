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
      <div className="relative w-full max-w-xl rounded-3xl bg-[#EEF2F6] border border-white/80 shadow-neo-card p-6 sm:p-8 overflow-hidden">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-500 hover:text-slate-800 bg-[#EEF2F6] shadow-neo-sm hover:shadow-neo-inset border border-white/60 transition-all"
          aria-label="Close dialog"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="mb-6 pr-8">
          <div className="flex items-center gap-2 text-xs font-bold text-gradient-feral uppercase tracking-wider mb-1">
            <Ticket className="h-4 w-4 text-indigo-500" />
            <span>Select Ticket Tier</span>
          </div>
          <h2 className="font-display font-bold text-2xl text-slate-900 leading-tight">
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
                className={`relative p-4 rounded-2xl border transition-all cursor-pointer bg-[#EEF2F6] ${
                  isSelected
                    ? 'border-indigo-500/50 shadow-neo-card ring-2 ring-indigo-500/30'
                    : 'border-white/80 shadow-neo-sm hover:shadow-neo-card'
                }`}
              >
                <div className="flex items-start justify-between gap-4 mb-1">
                  <div className="flex items-center gap-2">
                    <span className="font-display font-bold text-base text-slate-900">
                      {tier.name}
                    </span>
                    {tier.tag && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold text-white bg-gradient-to-r from-indigo-500 to-pink-500 shadow-neo-sm">
                        {tier.tag}
                      </span>
                    )}
                  </div>

                  <span className="font-bold text-sm text-slate-900">
                    {tier.price}
                  </span>
                </div>

                <p className="text-xs text-slate-600 mb-2 leading-relaxed">
                  {tier.description}
                </p>

                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-amber-700 bg-[#EEF2F6] shadow-neo-inset border border-amber-200/60 px-2.5 py-0.5 rounded-full">
                    ⚡ Only {tier.spotsLeft} passes remaining
                  </span>

                  <span className="text-slate-500 font-medium">
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

          <Button variant="primary" size="md" onClick={handleProceed} fullWidth arrow>
            Continue to Registration
          </Button>
        </div>
      </div>
    </div>
  )
}
