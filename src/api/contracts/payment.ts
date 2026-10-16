import { z } from 'zod'

export const PaymentTypeSchema = z.enum([
  'event_registration',
  'organizer_subscription',
])
export type PaymentType = z.infer<typeof PaymentTypeSchema>

export const PaymentStatusSchema = z.enum([
  'PENDING',
  'PAID',
  'FAILED',
  'CANCELLED',
  'REFUNDED',
])
export type PaymentStatus = z.infer<typeof PaymentStatusSchema>

export const PayoutAccountCreateSchema = z.object({
  account_number: z.string().min(5).max(40),
  account_holder_name: z.string().min(2).max(120),
  ifsc_code: z.string().min(4).max(20),
  bank_name: z.string().max(100).optional(),
  pan: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN format. Must be 10 characters (e.g. ABCDE1234F)').optional(),
  business_type: z.enum(['INDIVIDUAL', 'PROPRIETORSHIP', 'PRIVATE_LIMITED']).default('INDIVIDUAL'),
  email: z.string().email().optional(),
  phone: z.string().optional(),
})
export type PayoutAccountCreate = z.infer<typeof PayoutAccountCreateSchema>

export const PayoutAccountSchema = z.object({
  id: z.string(),
  organization_id: z.string(),
  vendor_id: z.string(),
  account_holder_name: z.string(),
  bank_name: z.string().nullable().optional(),
  ifsc_code: z.string(),
  account_number_masked: z.string(),
  status: z.string(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
})
export type PayoutAccount = z.infer<typeof PayoutAccountSchema>

export const SettlementRecordSchema = z.object({
  id: z.string(),
  cf_settlement_id: z.string(),
  vendor_id: z.string(),
  amount_cents: z.number(),
  amount_inr: z.number(),
  currency: z.string().default('INR'),
  status: z.string(),
  utr: z.string().nullable().optional(),
  settled_at: z.string().nullable().optional(),
  created_at: z.string().optional(),
})
export type SettlementRecord = z.infer<typeof SettlementRecordSchema>

export const FeeQuoteRequestSchema = z.object({
  base_amount_cents: z.number().int().nonnegative(),
})
export type FeeQuoteRequest = z.infer<typeof FeeQuoteRequestSchema>

export const FeeQuoteResponseSchema = z.object({
  base_amount_cents: z.number(),
  platform_fee_cents: z.number(),
  organizer_commission_cents: z.number(),
  tax_amount_cents: z.number(),
  total_payable_cents: z.number(),
  organizer_share_cents: z.number(),
  platform_gross_cents: z.number(),
  base_amount_inr: z.number(),
  platform_fee_inr: z.number(),
  organizer_commission_inr: z.number(),
  tax_amount_inr: z.number(),
  total_payable_inr: z.number(),
  organizer_share_inr: z.number(),
  platform_gross_inr: z.number(),
  organizer_commission_rate: z.number(),
  attendee_fee_rate: z.number(),
  tax_rate: z.number(),
})
export type FeeQuote = z.infer<typeof FeeQuoteResponseSchema>

export const OrderCreateRequestSchema = z.object({
  type: PaymentTypeSchema.default('event_registration'),
  event_slug: z.string().optional(),
  event_id: z.string().optional(),
  plan_id: z.string().optional(),
  organization_id: z.string().optional(),
  return_url: z.string().optional(),
})
export type OrderCreateRequest = z.infer<typeof OrderCreateRequestSchema>

export const OrderCreateResponseSchema = z.object({
  order_id: z.string(),
  payment_session_id: z.string().nullable().optional(),
  amount_cents: z.number(),
  currency: z.string().default('INR'),
  status: z.string(),
  environment: z.string().default('sandbox'),
})
export type OrderCreateResponse = z.infer<typeof OrderCreateResponseSchema>

export const PaymentStatusResponseSchema = z.object({
  order_id: z.string(),
  status: z.string(),
  amount_cents: z.number(),
  currency: z.string().default('INR'),
  payment_type: z.string(),
  is_paid: z.boolean(),
  event_slug: z.string().nullable().optional(),
  ticket_code: z.string().nullable().optional(),
  registration_status: z.string().nullable().optional(),
  metadata: z.record(z.any()).nullable().optional(),
})
export type PaymentStatusResponse = z.infer<typeof PaymentStatusResponseSchema>
