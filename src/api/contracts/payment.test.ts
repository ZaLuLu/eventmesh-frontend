import { describe, it, expect } from 'vitest'
import {
  PayoutAccountCreateSchema,
  FeeQuoteResponseSchema,
  OrderCreateRequestSchema,
} from './payment'

describe('Payment & Cashfree KYC Contracts', () => {
  it('validates correct PAN format (10 characters: 5 letters, 4 digits, 1 letter)', () => {
    const valid = PayoutAccountCreateSchema.safeParse({
      account_number: '123456789012',
      account_holder_name: 'Apex Collective',
      ifsc_code: 'HDFC0001234',
      pan: 'ABCDE1234F',
      business_type: 'INDIVIDUAL',
    })
    expect(valid.success).toBe(true)
  })

  it('rejects invalid PAN format', () => {
    const invalid = PayoutAccountCreateSchema.safeParse({
      account_number: '123456789012',
      account_holder_name: 'Apex Collective',
      ifsc_code: 'HDFC0001234',
      pan: 'INVALID_PAN',
      business_type: 'INDIVIDUAL',
    })
    expect(invalid.success).toBe(false)
  })

  it('validates financial fee breakdown invariant: organizer_share + platform_gross == total_payable', () => {
    const baseAmountCents = 24900 // ₹249.00
    const orgRate = 5.0
    const attRate = 3.0

    const platformFeeCents = Math.round(baseAmountCents * (attRate / 100.0))
    const taxAmountCents = 0
    const totalPayableCents = baseAmountCents + platformFeeCents + taxAmountCents
    const organizerCommCents = Math.round(baseAmountCents * (orgRate / 100.0))
    const organizerShareCents = baseAmountCents - organizerCommCents
    const platformGrossCents = organizerCommCents + platformFeeCents + taxAmountCents

    expect(organizerShareCents + platformGrossCents).toBe(totalPayableCents)

    const quote = {
      base_amount_cents: baseAmountCents,
      platform_fee_cents: platformFeeCents,
      organizer_commission_cents: organizerCommCents,
      tax_amount_cents: taxAmountCents,
      total_payable_cents: totalPayableCents,
      organizer_share_cents: organizerShareCents,
      platform_gross_cents: platformGrossCents,
      base_amount_inr: baseAmountCents / 100.0,
      platform_fee_inr: platformFeeCents / 100.0,
      organizer_commission_inr: organizerCommCents / 100.0,
      tax_amount_inr: 0,
      total_payable_inr: totalPayableCents / 100.0,
      organizer_share_inr: organizerShareCents / 100.0,
      platform_gross_inr: platformGrossCents / 100.0,
      organizer_commission_rate: orgRate,
      attendee_fee_rate: attRate,
      tax_rate: 0,
    }

    const parsed = FeeQuoteResponseSchema.safeParse(quote)
    expect(parsed.success).toBe(true)
  })

  it('validates order creation payload for event registration', () => {
    const order = OrderCreateRequestSchema.safeParse({
      type: 'event_registration',
      event_slug: 'ai-design-systems-summit-2026',
    })
    expect(order.success).toBe(true)
  })
})
