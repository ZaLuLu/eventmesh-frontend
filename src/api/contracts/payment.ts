import { z } from 'zod'

export const PaymentTypeSchema = z.enum([
  'event_registration',
  'organizer_subscription',
  'EVENT_REGISTRATION',
  'ORGANIZER_SUBSCRIPTION',
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

/* =========================================================================
   ORGANIZER BALANCE & WITHDRAWAL REQUEST CONTRACTS
   ========================================================================= */

export const OrganizationBalanceSchema = z.object({
  organization_id: z.string(),
  gross_sales_cents: z.number().default(0),
  organizer_share_cents: z.number().default(0),
  settled_cents: z.number().default(0),
  refunded_cents: z.number().default(0),
  pending_withdrawals_cents: z.number().default(0),
  paid_withdrawals_cents: z.number().default(0),
  available_balance_cents: z.number().default(0),
  available_balance_inr: z.number().default(0),
  currency: z.string().default('INR'),
  payout_account_configured: z.boolean().default(false),
  payout_account_status: z.string().nullable().optional(),
  masked_bank_account: z.string().nullable().optional(),
  account_holder_name: z.string().nullable().optional(),
  bank_name: z.string().nullable().optional(),
  ifsc_code: z.string().nullable().optional(),
})
export type OrganizationBalance = z.infer<typeof OrganizationBalanceSchema>

export const WithdrawalRequestCreateSchema = z.object({
  amount: z.number().positive().optional(),
  amount_cents: z.number().int().positive().optional(),
  event_id: z.string().optional(),
  notes: z.string().max(250).optional(),
  idempotency_key: z.string().optional(),
})
export type WithdrawalRequestCreate = z.infer<typeof WithdrawalRequestCreateSchema>

export const WithdrawalRequestSchema = z.object({
  id: z.string(),
  request_id: z.string(),
  organization_id: z.string(),
  event_id: z.string().nullable().optional(),
  amount: z.number(),
  amount_cents: z.number(),
  currency: z.string().default('INR'),
  status: z.enum(['PENDING', 'APPROVED', 'PROCESSING', 'PAID', 'REJECTED']),
  payout_details_snapshot: z.record(z.any()).default({}),
  admin_notes: z.string().nullable().optional(),
  rejection_reason: z.string().nullable().optional(),
  utr_reference: z.string().nullable().optional(),
  requested_at: z.string(),
  paid_at: z.string().nullable().optional(),
  created_at: z.string(),
  organization_name: z.string().nullable().optional(),
  organization_slug: z.string().nullable().optional(),
  event_title: z.string().nullable().optional(),
  requester_id: z.string().nullable().optional(),
  requester_email: z.string().nullable().optional(),
  requester_name: z.string().nullable().optional(),
  masked_bank_account: z.string().nullable().optional(),
  bank_name: z.string().nullable().optional(),
  ifsc_code: z.string().nullable().optional(),
  account_holder_name: z.string().nullable().optional(),
  available_balance_basis_inr: z.number().nullable().optional(),
})
export type WithdrawalRequest = z.infer<typeof WithdrawalRequestSchema>

export const OrganizerEarningsSummarySchema = z.object({
  gross_revenue: z.number().default(0),
  gross_revenue_cents: z.number().default(0),
  platform_fee: z.number().default(0),
  platform_fee_cents: z.number().default(0),
  pg_fee: z.number().default(0),
  pg_fee_cents: z.number().default(0),
  net_earnings: z.number().default(0),
  net_earnings_cents: z.number().default(0),
  total_withdrawn: z.number().default(0),
  total_withdrawn_cents: z.number().default(0),
  pending_withdrawal: z.number().default(0),
  pending_withdrawal_cents: z.number().default(0),
  available_balance: z.number().default(0),
  available_balance_cents: z.number().default(0),
  has_active_request: z.boolean().default(false),
  events_breakdown: z.array(z.any()).default([]),
})
export type OrganizerEarningsSummary = z.infer<typeof OrganizerEarningsSummarySchema>

export const AdminWithdrawalReviewSchema = z.object({
  action: z.enum(['approve', 'reject', 'pay']),
  reason: z.string().optional(),
  transfer_reference: z.string().optional(),
})
export type AdminWithdrawalReviewPayload = z.infer<typeof AdminWithdrawalReviewSchema>

export const RefundOrderRequestSchema = z.object({
  reason: z.string().optional(),
  refund_amount_cents: z.number().optional(),
})
export type RefundOrderRequest = z.infer<typeof RefundOrderRequestSchema>

export const RefundOrderResponseSchema = z.object({
  status: z.string(),
  refund_id: z.string(),
  amount_inr: z.number(),
})
export type RefundOrderResponse = z.infer<typeof RefundOrderResponseSchema>

