import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { X, Ticket, Check } from 'lucide-react'
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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-text/40"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-xl rounded-panel bg-surface border border-line shadow-floating p-6 sm:p-8 overflow-hidden">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-btn text-text-3 hover:text-text bg-surface hover:bg-subtle border border-line transition-colors"
          aria-label="Close dialog"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Modal Header */}
        <div className="mb-6 pr-8">
          <div className="flex items-center gap-1.5 text-caption font-semibold text-accent mb-1">
            <Ticket className="h-4 w-4" />
            <span>Select Ticket Tier</span>
          </div>
          <h2 className="text-h2 font-semibold text-text leading-tight">
            {event.title}
          </h2>
          <p className="text-small text-text-2 mt-1">
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
                onKeyDown={(e) => e.key === 'Enter' && setSelectedTierId(tier.id)}
                className={`p-4 rounded-panel border transition-colors cursor-pointer ${
                  isSelected
                    ? 'border-accent bg-accent-soft/30'
                    : 'border-line bg-surface hover:border-text-3'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-text text-small">
                        {tier.name}
                      </span>
                      {tier.tag && (
                        <span className="text-caption bg-accent-soft text-accent px-2 py-0.5 rounded-full font-medium">
                          {tier.tag}
                        </span>
                      )}
                    </div>
                    <p className="text-caption text-text-2 mt-1">
                      {tier.description}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-small font-semibold text-text">
                      {tier.price}
                    </span>
                    <span className="block text-caption text-text-3">
                      {tier.spotsLeft} spots left
                    </span>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-line flex flex-wrap gap-x-4 gap-y-1 text-caption text-text-2">
                  {tier.features.map((feat, idx) => (
                    <span key={idx} className="flex items-center gap-1">
                      <Check className="h-3 w-3 text-success" />
                      {feat}
                    </span>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-line">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleProceed}>
            Proceed to Registration
          </Button>
        </div>
      </div>
    </div>
  )
}
