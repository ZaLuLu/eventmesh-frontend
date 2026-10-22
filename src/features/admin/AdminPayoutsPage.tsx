import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Bank,
  CheckCircle,
  Clock,
  WarningCircle,
  ShieldCheck,
  ArrowSquareOut,
  CurrencyInr,
  Sparkle,
  ArrowsClockwise,
  ArrowDownRight,
  Wallet,
  Receipt,
} from '@phosphor-icons/react'
import {
  api,
  PayoutAccount,
  SettlementRecord,
  PayoutAccountCreate,
  OrganizationBalance,
  WithdrawalRequest,
} from '@/api'
import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { usePermission } from '@/hooks/usePermission'
import { Button } from '@/design-system/primitives/Button'
import { Field } from '@/design-system/primitives/Field'
import { Badge } from '@/design-system/primitives/Badge'
import { Modal } from '@/design-system/primitives/Modal'
import { useToast } from '@/design-system/primitives/Toast'
import { formatCurrency, formatDate } from '@/lib/format'

export const AdminPayoutsPage: React.FC = () => {
  const { session } = useAuth()
  const { clubId } = usePermission()
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const orgSlug = clubId || session?.clubId || 'apex-design-lab'

  const [isEditing, setIsEditing] = useState(false)
  const [accountHolderName, setAccountHolderName] = useState('')
  const [bankName, setBankName] = useState('')
  const [accountNumber, setAccountNumber] = useState('')
  const [confirmAccountNumber, setConfirmAccountNumber] = useState('')
  const [ifscCode, setIfscCode] = useState('')
  const [pan, setPan] = useState('')
  const [businessType, setBusinessType] = useState<'INDIVIDUAL' | 'PROPRIETORSHIP' | 'PRIVATE_LIMITED'>('INDIVIDUAL')
  const [formError, setFormError] = useState<string | null>(null)

  // Withdrawal Modal State
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false)
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [withdrawNotes, setWithdrawNotes] = useState('')
  const [withdrawError, setWithdrawError] = useState<string | null>(null)
  const [ledgerTab, setLedgerTab] = useState<'withdrawals' | 'settlements'>('withdrawals')

  // Query Payout Balance Ledger
  const {
    data: balance,
    isLoading: isBalanceLoading,
    refetch: refetchBalance,
  } = useQuery<OrganizationBalance | null>({
    queryKey: ['payout-balance', orgSlug],
    queryFn: async () => {
      if (api.payouts.getPayoutBalance) {
        return api.payouts.getPayoutBalance(orgSlug)
      }
      return null
    },
  })

  // Query Withdrawal Requests Ledger
  const {
    data: withdrawals = [],
    isLoading: isWithdrawalsLoading,
    refetch: refetchWithdrawals,
  } = useQuery<WithdrawalRequest[]>({
    queryKey: ['withdrawals', orgSlug],
    queryFn: async () => {
      if (api.payouts.listWithdrawals) {
        return api.payouts.listWithdrawals(orgSlug)
      }
      return []
    },
  })

  // Query Payout Account
  const {
    data: account,
    isLoading: isAccountLoading,
    refetch: refetchAccount,
  } = useQuery<PayoutAccount | null>({
    queryKey: ['payout-account', orgSlug],
    queryFn: () => api.payouts.getPayoutAccount(orgSlug),
  })

  // Query Settlements
  const {
    data: settlements = [],
    isLoading: isSettlementsLoading,
    refetch: refetchSettlements,
  } = useQuery<SettlementRecord[]>({
    queryKey: ['settlements', orgSlug],
    queryFn: () => api.payouts.listSettlements(orgSlug),
  })

  // Request Withdrawal Mutation
  const withdrawMutation = useMutation({
    mutationFn: async () => {
      if (!api.payouts.requestWithdrawal) throw new Error('Withdrawal API not available')
      const amt = Number(withdrawAmount)
      if (isNaN(amt) || amt <= 0) throw new Error('Please enter a valid withdrawal amount.')
      return api.payouts.requestWithdrawal(orgSlug, {
        amount: amt,
        notes: withdrawNotes.trim() || undefined,
      })
    },
    onSuccess: (newReq) => {
      queryClient.invalidateQueries({ queryKey: ['payout-balance', orgSlug] })
      queryClient.invalidateQueries({ queryKey: ['withdrawals', orgSlug] })
      setIsWithdrawOpen(false)
      setWithdrawAmount('')
      setWithdrawNotes('')
      setWithdrawError(null)
      toast({
        title: 'Withdrawal Requested',
        message: `Request for ₹${newReq.amount.toLocaleString('en-IN')} submitted. Funds will transfer to ${account?.bank_name || 'your bank'}.`,
        type: 'success',
      })
    },
    onError: (err: any) => {
      setWithdrawError(err.message || err.detail || 'Failed to submit withdrawal request.')
    },
  })

  // Register / Update Payout Account Mutation
  const registerMutation = useMutation({
    mutationFn: (payload: PayoutAccountCreate) =>
      api.payouts.registerPayoutAccount(orgSlug, payload),
    onSuccess: (updated) => {
      queryClient.setQueryData(['payout-account', orgSlug], updated)
      queryClient.invalidateQueries({ queryKey: ['payout-account', orgSlug] })
      setIsEditing(false)
      setAccountNumber('')
      setConfirmAccountNumber('')
      setPan('')
      setFormError(null)
      toast({
        title: 'Bank Account Linked',
        message: 'Your account has been submitted to Cashfree Easy Split for automated payouts.',
        type: 'success',
      })
    },
    onError: (err: any) => {
      setFormError(err.message || err.detail || 'Failed to link bank account. Please check your details.')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    if (!accountHolderName.trim()) {
      setFormError('Account holder name is required.')
      return
    }
    if (!accountNumber.trim()) {
      setFormError('Account number is required.')
      return
    }
    if (accountNumber.trim() !== confirmAccountNumber.trim()) {
      setFormError('Account numbers do not match.')
      return
    }
    const cleanIfsc = ifscCode.trim().toUpperCase()
    if (!cleanIfsc || cleanIfsc.length < 5) {
      setFormError('Please enter a valid IFSC code (e.g. HDFC0001234).')
      return
    }
    const cleanPan = pan.trim().toUpperCase()
    if (cleanPan) {
      const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/
      if (!panRegex.test(cleanPan)) {
        setFormError('Invalid PAN format. Must be 10 characters (e.g. ABCDE1234F).')
        return
      }
    }

    registerMutation.mutate({
      account_holder_name: accountHolderName.trim(),
      bank_name: bankName.trim() || undefined,
      account_number: accountNumber.trim(),
      ifsc_code: cleanIfsc,
      pan: cleanPan || undefined,
      business_type: businessType,
    })
  }

  const startEdit = () => {
    if (account) {
      setAccountHolderName(account.account_holder_name)
      setBankName(account.bank_name || '')
      setIfscCode(account.ifsc_code)
    }
    setIsEditing(true)
  }

  // Calculate ledger metrics
  const totalSettledInr = settlements
    .filter((s) => s.status === 'SUCCESS')
    .reduce((acc, s) => acc + s.amount_inr, 0)

  const pendingSettlementInr = settlements
    .filter((s) => s.status === 'PENDING')
    .reduce((acc, s) => acc + s.amount_inr, 0)

  const isVerified = account?.status === 'VERIFIED'

  return (
    <div className="space-y-8 max-w-6xl pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-line">
        <div>
          <span className="text-caption font-semibold text-accent block mb-1">
            Financial Operations & Marketplace
          </span>
          <h1 className="text-h2 font-semibold text-text">
            Payouts & Bank KYC
          </h1>
          <p className="text-small text-text-2 mt-0.5">
            Manage linked bank accounts, Cashfree Easy Split vendor verification, and ticket revenue payouts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/admin/stamp">
            <Button
              surface="admin"
              variant="secondary"
              size="sm"
              icon={<Sparkle size={15} weight="duotone" className="text-accent" />}
            >
              3D Stamp Desk
            </Button>
          </Link>
          <Button
            surface="admin"
            variant="secondary"
            size="sm"
            onClick={() => {
              refetchAccount()
              refetchSettlements()
              refetchBalance()
              refetchWithdrawals()
            }}
            icon={<ArrowsClockwise size={15} />}
          >
            Refresh Ledger
          </Button>

          <Button
            surface="admin"
            variant="primary"
            size="sm"
            disabled={!balance || balance.available_balance_inr <= 0 || !isVerified}
            onClick={() => {
              setWithdrawAmount(balance?.available_balance_inr ? String(balance.available_balance_inr) : '')
              setIsWithdrawOpen(true)
            }}
            icon={<ArrowDownRight size={15} weight="bold" />}
          >
            Withdraw Funds
          </Button>

          {!account && !isEditing && (
            <Button surface="admin" size="sm" onClick={() => setIsEditing(true)}>
              Link Bank Account
            </Button>
          )}
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Available Withdrawable Balance */}
        <div className="p-5 bg-surface border border-accent/30 rounded-panel space-y-1.5 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <p className="text-caption text-text-3 font-medium">Available Balance</p>
            <Badge variant="success" size="sm">Withdrawable</Badge>
          </div>
          <p className="text-2xl font-semibold text-text tabular-nums">
            {formatCurrency(balance?.available_balance_inr ?? 0)}
          </p>
          <p className="text-caption text-text-2 flex items-center justify-between">
            <span>Ready for bank transfer</span>
            {balance && balance.available_balance_inr > 0 && isVerified && (
              <button
                type="button"
                onClick={() => {
                  setWithdrawAmount(String(balance.available_balance_inr))
                  setIsWithdrawOpen(true)
                }}
                className="text-xs font-semibold text-accent hover:underline"
              >
                Withdraw &rarr;
              </button>
            )}
          </p>
        </div>

        {/* Pending Withdrawals */}
        <div className="p-5 bg-surface border border-line rounded-panel space-y-1.5">
          <p className="text-caption text-text-3 font-medium">Pending Withdrawals</p>
          <p className="text-2xl font-semibold text-text tabular-nums">
            {formatCurrency(((balance?.pending_withdrawals_cents ?? 0) / 100) || pendingSettlementInr)}
          </p>
          <p className="text-caption text-text-2">Dispatched to bank within 24h of review</p>
        </div>

        {/* Total Settled */}
        <div className="p-5 bg-surface border border-line rounded-panel space-y-1.5">
          <p className="text-caption text-text-3 font-medium">Total Disbursed (Net)</p>
          <p className="text-2xl font-semibold text-text tabular-nums">
            {formatCurrency(((balance?.paid_withdrawals_cents ?? 0) / 100) || totalSettledInr)}
          </p>
          <p className="text-caption text-success font-medium flex items-center gap-1">
            <CheckCircle size={14} weight="fill" />
            Reconciled via Cashfree Payouts
          </p>
        </div>

        {/* Platform Fee */}
        <div className="p-5 bg-surface border border-line rounded-panel space-y-1.5">
          <p className="text-caption text-text-3 font-medium">Platform Commission</p>
          <p className="text-2xl font-semibold text-text tabular-nums">5.0%</p>
          <p className="text-caption text-text-2">Marketplace fee on ticket sales (95% net to host)</p>
        </div>
      </div>

      {/* KYC Vendor Status Banner */}
      <div className="p-6 bg-surface border border-line rounded-panel space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className={`p-2.5 rounded-lg border ${
              isVerified
                ? 'bg-success-bg border-success-border text-success'
                : account
                ? 'bg-amber-500/10 border-amber-500/20 text-amber-500'
                : 'bg-surface-subtle border-line text-text-3'
            }`}>
              {isVerified ? (
                <ShieldCheck size={24} weight="fill" />
              ) : account ? (
                <Clock size={24} weight="bold" />
              ) : (
                <Bank size={24} weight="bold" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-sans font-semibold text-base text-text">
                  Cashfree Easy Split Vendor Account
                </h3>
                {isVerified ? (
                  <Badge variant="success" size="sm">KYC Verified</Badge>
                ) : account ? (
                  <Badge variant="warning" size="sm">Verification Pending</Badge>
                ) : (
                  <Badge variant="neutral" size="sm">Setup Required</Badge>
                )}
              </div>
              <p className="text-small text-text-2 mt-1">
                {isVerified
                  ? `Vendor ID: ${account?.vendor_id} • Linked to ${account?.bank_name || 'Bank'} (${account?.account_number_masked})`
                  : account
                  ? `Verification in progress for vendor ${account?.vendor_id}. Automated payouts will activate once approved.`
                  : 'Link your club or society bank account with PAN verification to accept paid registrations.'}
              </p>
            </div>
          </div>

          <div>
            {account && !isEditing ? (
              <Button surface="admin" variant="secondary" size="sm" onClick={startEdit}>
                Update Details
              </Button>
            ) : !account && !isEditing ? (
              <Button surface="admin" size="sm" onClick={() => setIsEditing(true)}>
                Onboard Bank Account
              </Button>
            ) : null}
          </div>
        </div>

        {/* Account Details pill if linked */}
        {account && !isEditing && (
          <div className="pt-4 border-t border-line grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-text-3 block mb-0.5">Account Holder</span>
              <span className="font-semibold text-text">{account.account_holder_name}</span>
            </div>
            <div>
              <span className="text-text-3 block mb-0.5">Bank Name</span>
              <span className="font-semibold text-text">{account.bank_name || 'Bank of Record'}</span>
            </div>
            <div>
              <span className="text-text-3 block mb-0.5">Account Number</span>
              <span className="font-mono font-semibold text-text">{account.account_number_masked}</span>
            </div>
            <div>
              <span className="text-text-3 block mb-0.5">IFSC Code</span>
              <span className="font-mono font-semibold text-text">{account.ifsc_code}</span>
            </div>
          </div>
        )}
      </div>

      {/* Bank Account Onboarding / Edit Form */}
      {isEditing && (
        <div className="p-6 bg-surface border border-line rounded-panel space-y-6">
          <div className="flex items-center justify-between border-b border-line pb-4">
            <div>
              <h3 className="font-sans font-semibold text-base text-text">
                {account ? 'Update Payout Bank Account' : 'Link Payout Bank Account'}
              </h3>
              <p className="text-small text-text-2 mt-0.5">
                Funds from paid event passes will be automatically credited to this verified account.
              </p>
            </div>
            <Button surface="admin" variant="secondary" size="sm" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
          </div>

          {formError && (
            <div className="p-3.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-small flex items-center gap-2">
              <WarningCircle size={18} weight="fill" className="shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field
                surface="admin"
                label="Account Holder Name"
                helpText="As registered in official bank records"
                required
                value={accountHolderName}
                onChange={(e) => setAccountHolderName(e.target.value)}
                placeholder="e.g. Apex Design Collective"
              />

              <Field
                surface="admin"
                label="Bank Name"
                helpText="e.g. HDFC Bank, SBI, ICICI"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                placeholder="e.g. HDFC Bank"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field
                surface="admin"
                label="Bank Account Number"
                required
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder="Enter account number"
                className="font-mono"
              />

              <Field
                surface="admin"
                type="password"
                label="Confirm Account Number"
                required
                value={confirmAccountNumber}
                onChange={(e) => setConfirmAccountNumber(e.target.value)}
                placeholder="Re-enter account number"
                className="font-mono"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Field
                surface="admin"
                label="IFSC Code"
                helpText="11-character bank code"
                required
                value={ifscCode}
                onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                placeholder="e.g. HDFC0001234"
                maxLength={11}
                className="font-mono uppercase"
              />

              <Field
                surface="admin"
                label="PAN (Permanent Account Number)"
                helpText="10-character PAN for KYC (ABCDE1234F)"
                value={pan}
                onChange={(e) => setPan(e.target.value.toUpperCase())}
                placeholder="e.g. ABCDE1234F"
                maxLength={10}
                className="font-mono uppercase"
              />

              <div className="w-full flex flex-col gap-1.5">
                <label className="text-small font-medium text-text select-none">
                  Business Entity Type
                </label>
                <select
                  value={businessType}
                  onChange={(e) => setBusinessType(e.target.value as any)}
                  className="w-full bg-surface text-text font-normal border border-line rounded-input px-3.5 h-12 text-small focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  <option value="INDIVIDUAL">Individual / Student Club</option>
                  <option value="PROPRIETORSHIP">Proprietorship / Society</option>
                  <option value="PRIVATE_LIMITED">Private Limited / Institution</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-line">
              <Button
                type="button"
                surface="admin"
                variant="secondary"
                size="sm"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                surface="admin"
                size="sm"
                disabled={registerMutation.isPending}
              >
                {registerMutation.isPending ? 'Linking Account...' : 'Save & Verify Account'}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Settlements & Withdrawals Dual Ledger */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-h3 font-semibold text-text">Financial Ledger & Withdrawals</h2>
            <p className="text-small text-text-2">
              Itemized history of organizer withdrawal transfers, bank UTR references, and Cashfree settlements.
            </p>
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-surface-subtle border border-line rounded-lg text-xs font-semibold">
            <button
              type="button"
              onClick={() => setLedgerTab('withdrawals')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                ledgerTab === 'withdrawals'
                  ? 'bg-surface text-text shadow-sm'
                  : 'text-text-3 hover:text-text'
              }`}
            >
              Withdrawals ({withdrawals.length})
            </button>
            <button
              type="button"
              onClick={() => setLedgerTab('settlements')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                ledgerTab === 'settlements'
                  ? 'bg-surface text-text shadow-sm'
                  : 'text-text-3 hover:text-text'
              }`}
            >
              Settlements ({settlements.length})
            </button>
          </div>
        </div>

        {ledgerTab === 'withdrawals' ? (
          <div className="border border-line rounded-panel overflow-hidden bg-surface">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-surface-subtle border-b border-line text-xs font-semibold text-text-2">
                  <tr>
                    <th className="px-4 py-3">Request ID</th>
                    <th className="px-4 py-3">Requested At</th>
                    <th className="px-4 py-3">Bank Reference / UTR</th>
                    <th className="px-4 py-3">Amount (INR)</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {withdrawals.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-text-3">
                        No withdrawal requests submitted yet. Use the "Withdraw Funds" button above to transfer revenue.
                      </td>
                    </tr>
                  ) : (
                    withdrawals.map((w) => (
                      <tr key={w.id} className="hover:bg-surface-subtle/50 transition-colors">
                        <td className="px-4 py-3.5 font-mono text-xs font-semibold text-text">
                          {w.request_id}
                        </td>
                        <td className="px-4 py-3.5 text-text-2 text-xs">
                          {formatDate(w.requested_at, 'full')}
                        </td>
                        <td className="px-4 py-3.5 font-mono text-xs text-text-2">
                          {w.utr_reference ? (
                            <span className="text-success font-semibold flex items-center gap-1">
                              <CheckCircle size={13} weight="fill" />
                              {w.utr_reference}
                            </span>
                          ) : (
                            <span className="text-text-3">Pending Batch Disbursal</span>
                          )}
                        </td>
                        <td className="px-4 py-3.5 font-semibold text-text tabular-nums">
                          {formatCurrency(w.amount)}
                        </td>
                        <td className="px-4 py-3.5">
                          {w.status === 'PAID' ? (
                            <Badge variant="success" size="sm">Disbursed (PAID)</Badge>
                          ) : w.status === 'PENDING' ? (
                            <Badge variant="warning" size="sm">Review Pending</Badge>
                          ) : w.status === 'PROCESSING' ? (
                            <Badge variant="iris" size="sm">Processing</Badge>
                          ) : (
                            <Badge variant="danger" size="sm">Rejected</Badge>
                          )}
                        </td>
                        <td className="px-4 py-3.5 text-xs text-text-3">
                          {w.rejection_reason || w.admin_notes || '—'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="border border-line rounded-panel overflow-hidden bg-surface">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-surface-subtle border-b border-line text-xs font-semibold text-text-2">
                  <tr>
                    <th className="px-4 py-3">Reference / Settlement ID</th>
                    <th className="px-4 py-3">Date Dispatched</th>
                    <th className="px-4 py-3">UTR Reference</th>
                    <th className="px-4 py-3">Net Payout (INR)</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {settlements.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-text-3">
                        No payout settlements recorded yet. Once ticket sales close, payouts will appear here.
                      </td>
                    </tr>
                  ) : (
                    settlements.map((s) => (
                      <tr key={s.id} className="hover:bg-surface-subtle/50 transition-colors">
                        <td className="px-4 py-3.5 font-mono text-xs font-semibold text-text">
                          {s.cf_settlement_id}
                        </td>
                        <td className="px-4 py-3.5 text-text-2 text-xs">
                          {s.settled_at ? formatDate(s.settled_at, 'full') : 'Processing'}
                        </td>
                        <td className="px-4 py-3.5 font-mono text-xs text-text-2">
                          {s.utr || '—'}
                        </td>
                        <td className="px-4 py-3.5 font-semibold text-text tabular-nums">
                          {formatCurrency(s.amount_inr)}
                        </td>
                        <td className="px-4 py-3.5">
                          {s.status === 'SUCCESS' ? (
                            <Badge variant="success" size="sm">Settled</Badge>
                          ) : s.status === 'PENDING' ? (
                            <Badge variant="warning" size="sm">In Transit</Badge>
                          ) : (
                            <Badge variant="danger" size="sm">{s.status}</Badge>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Withdrawal Request Modal */}
      <Modal
        isOpen={isWithdrawOpen}
        onClose={() => {
          setIsWithdrawOpen(false)
          setWithdrawError(null)
        }}
        title="Request Revenue Withdrawal"
        subtitle="Disburse your verified event ticket revenue directly to your destination bank account."
        surface="admin"
        maxWidth="max-w-lg"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault()
            setWithdrawError(null)
            const amt = Number(withdrawAmount)
            if (!amt || amt <= 0) {
              setWithdrawError('Please enter a valid amount.')
              return
            }
            if (balance && amt > balance.available_balance_inr) {
              setWithdrawError(`Requested amount exceeds available balance (${formatCurrency(balance.available_balance_inr)}).`)
              return
            }
            withdrawMutation.mutate()
          }}
          className="space-y-5"
        >
          {withdrawError && (
            <div className="p-3 bg-danger-bg border border-danger-border rounded-lg text-xs text-danger flex items-start gap-2">
              <WarningCircle size={16} className="shrink-0 mt-0.5" />
              <span>{withdrawError}</span>
            </div>
          )}

          {/* Balance Preview Card */}
          <div className="p-4 rounded-xl bg-surface-subtle border border-line flex items-center justify-between">
            <div>
              <p className="text-xs text-text-3 font-medium">Available Withdrawable Balance</p>
              <p className="text-xl font-bold text-text tabular-nums mt-0.5">
                {formatCurrency(balance?.available_balance_inr ?? 0)}
              </p>
            </div>
            {balance && balance.available_balance_inr > 0 && (
              <Button
                type="button"
                surface="admin"
                variant="secondary"
                size="sm"
                onClick={() => setWithdrawAmount(String(balance.available_balance_inr))}
              >
                Withdraw Full Balance
              </Button>
            )}
          </div>

          {/* Amount Input */}
          <Field
            surface="admin"
            label="Withdrawal Amount (INR)"
            required
            type="number"
            value={withdrawAmount}
            onChange={(e) => setWithdrawAmount(e.target.value)}
            placeholder="e.g. 25000"
            helpText="Funds will be dispatched via NEFT/RTGS/IMPS to your linked bank account."
            min={1}
            max={balance?.available_balance_inr}
          />

          {/* Destination Account Snapshot */}
          <div className="p-3.5 rounded-lg border border-line bg-surface space-y-1 text-xs">
            <span className="font-semibold text-text block text-xs">Transfer Destination:</span>
            <p className="text-text-2">
              {account?.bank_name || 'Bank'} &bull; Acc: {account?.account_number_masked}
            </p>
            <p className="text-text-3 font-mono">
              IFSC: {account?.ifsc_code} &bull; Holder: {account?.account_holder_name}
            </p>
          </div>

          {/* Memo / Notes */}
          <Field
            surface="admin"
            label="Organizer Notes / Memo"
            value={withdrawNotes}
            onChange={(e) => setWithdrawNotes(e.target.value)}
            placeholder="e.g. Hackathon batch 1 disbursement"
            helpText="Optional memo stored in the payout audit ledger."
            maxLength={200}
          />

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-line">
            <Button
              type="button"
              surface="admin"
              variant="secondary"
              size="sm"
              onClick={() => setIsWithdrawOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              surface="admin"
              variant="primary"
              size="sm"
              disabled={withdrawMutation.isPending || !withdrawAmount}
              icon={<ArrowDownRight size={15} weight="bold" />}
            >
              {withdrawMutation.isPending ? 'Submitting Request...' : 'Confirm Withdrawal'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
