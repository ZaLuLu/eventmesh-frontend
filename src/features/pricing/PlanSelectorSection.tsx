import React, { useState } from 'react';
import PixelCard from '../../components/PixelCard';
import './PlanSelectorSection.css';

export interface PlanSelectorSectionProps {
  currentPlan?: 'free' | 'pro' | 'industry';
  onSelectPlan?: (planId: 'free' | 'pro' | 'industry') => void;
  className?: string;
}

export const PlanSelectorSection: React.FC<PlanSelectorSectionProps> = ({
  currentPlan = 'free',
  onSelectPlan,
  className = '',
}) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  const plans = [
    {
      id: 'free' as const,
      name: 'Free Campus',
      tagline: 'Essential access for every enrolled collegiate student.',
      pixelVariant: 'default' as const,
      priceMonthly: '$0',
      priceAnnual: '$0',
      periodLabel: 'forever free',
      features: [
        'Unlimited campus event discovery & registration',
        'Official 2D/3D Student Pass with Apple & Google Wallet',
        'Direct check-in via dynamic encrypted QR code',
        'Attendee group chat & team matching forum',
        'Campus announcements & calendar sync',
      ],
      ctaLabel: currentPlan === 'free' ? 'Current Plan' : 'Downgrade to Free',
      ctaType: 'default' as const,
    },
    {
      id: 'pro' as const,
      name: 'Pro Builder',
      tagline: 'For competitive hackathon builders & active workshop leaders.',
      pixelVariant: 'blue' as const,
      badge: 'MOST POPULAR',
      priceMonthly: '$9',
      priceAnnual: '$7.50',
      periodLabel: billingCycle === 'annual' ? 'per month, billed $90/yr' : 'per month',
      features: [
        'All Free Campus features included',
        'Priority Fast-Track check-in lane at major events',
        'Guaranteed waitlist bump for capped coding labs',
        'Exclusive Pro-only masterclasses & company AMAs',
        'Verified Pro builder badge on collegiate ID pass',
        'Early access to campus career fairs & recruiter drops',
      ],
      ctaLabel: currentPlan === 'pro' ? 'Current Plan' : 'Upgrade to Pro',
      ctaType: 'primary' as const,
    },
    {
      id: 'industry' as const,
      name: 'Industry Partner',
      tagline: 'For startup founders, student reps, and campus recruiters.',
      pixelVariant: 'yellow' as const,
      badge: 'CAREER & SPONSOR',
      priceMonthly: '$29',
      priceAnnual: '$24',
      periodLabel: billingCycle === 'annual' ? 'per month, billed $288/yr' : 'per month',
      features: [
        'All Pro Builder features included',
        'Direct recruiter intro & student portfolio highlights',
        'VIP lounge pass & front-row keynote seating',
        'Host sponsored lightning talks & student tech booths',
        'Custom organization branding on co-hosted event passes',
        'Direct 24/7 organizer concierge support channel',
      ],
      ctaLabel: currentPlan === 'industry' ? 'Current Plan' : 'Partner with Industry',
      ctaType: 'gold' as const,
    },
  ];

  return (
    <section className={`plan-selector ${className}`.trim()}>
      <div className="plan-selector__header">
        <span className="plan-selector__badge">Membership & Pass Tiers</span>
        <h2 className="plan-selector__title">Level Up Your Campus Journey</h2>
        <p className="plan-selector__subtitle">
          Choose the right plan to unlock priority access, builder workshops, and direct recruiter
          connections.
        </p>

        <div className="plan-selector__toggle" role="radiogroup" aria-label="Billing Cycle">
          <button
            type="button"
            className={`plan-selector__toggle-btn ${
              billingCycle === 'monthly' ? 'plan-selector__toggle-btn--active' : ''
            }`}
            onClick={() => setBillingCycle('monthly')}
            aria-checked={billingCycle === 'monthly'}
            role="radio"
          >
            Monthly
          </button>
          <button
            type="button"
            className={`plan-selector__toggle-btn ${
              billingCycle === 'annual' ? 'plan-selector__toggle-btn--active' : ''
            }`}
            onClick={() => setBillingCycle('annual')}
            aria-checked={billingCycle === 'annual'}
            role="radio"
          >
            Annual <span style={{ color: '#059669', fontWeight: 700 }}>(-20%)</span>
          </button>
        </div>
      </div>

      <div className="plan-selector__grid">
        {plans.map((plan) => {
          const price = billingCycle === 'annual' ? plan.priceAnnual : plan.priceMonthly;
          const isGold = plan.ctaType === 'gold';
          const isCurrent = currentPlan === plan.id;

          return (
            <PixelCard
              key={plan.id}
              variant={plan.pixelVariant}
              gap={plan.id === 'pro' ? 8 : 6}
              speed={plan.id === 'pro' ? 40 : 30}
              radius={20}
              trigger="hover"
            >
              <div className="plan-card-content">
                {plan.badge && (
                  <div
                    className={`plan-card__tier-pill ${
                      isGold ? 'plan-card__tier-pill--gold' : ''
                    }`}
                  >
                    {plan.badge}
                  </div>
                )}

                <div>
                  <div className="plan-card__tier-header">
                    <h3 className="plan-card__tier-name">{plan.name}</h3>
                    <p className="plan-card__tier-desc">{plan.tagline}</p>
                  </div>

                  <div className="plan-card__pricing">
                    <span className="plan-card__price">{price}</span>
                    <span className="plan-card__period">/ {plan.periodLabel}</span>
                  </div>

                  <ul className="plan-card__features" aria-label={`${plan.name} features`}>
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="plan-card__feature-item">
                        <span
                          className={`plan-card__feature-icon ${
                            isGold ? 'plan-card__feature-icon--gold' : ''
                          }`}
                          aria-hidden="true"
                        >
                          ✓
                        </span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  type="button"
                  className={`plan-card__cta plan-card__cta--${plan.ctaType}`}
                  onClick={() => onSelectPlan && onSelectPlan(plan.id)}
                  disabled={isCurrent}
                  style={isCurrent ? { opacity: 0.7, cursor: 'default' } : undefined}
                >
                  {plan.ctaLabel}
                </button>
              </div>
            </PixelCard>
          );
        })}
      </div>
    </section>
  );
};

export default PlanSelectorSection;
