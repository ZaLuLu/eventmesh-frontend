import { useCallback, useEffect, useState } from 'react';
import { api } from '../lib/apiClient';
import { formatEventDate } from '../utils/formatDate';
import { useOrganizer } from './OrganizerContext';
import { Button, Field, Segmented, Select, TextInput } from './components/fields';

const errorStyle = { color: '#ff6b6b', fontSize: 13, marginTop: 8 };
const okStyle = { color: '#4ade80', fontSize: 13, marginTop: 8 };

function formatINR(amount) {
  return `₹${Number(amount || 0).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function WithdrawalStatusBadge({ status }) {
  const s = String(status || '').toUpperCase();
  const isPaid = s === 'PAID';
  const isPending = s === 'PENDING' || s === 'APPROVED' || s === 'PROCESSING';
  const isRejected = s === 'REJECTED';

  const color = isPaid ? '#4ade80' : isPending ? '#fbbf24' : isRejected ? '#ef4444' : 'var(--fg-3)';
  const bg = isPaid
    ? 'rgba(74, 222, 128, 0.12)'
    : isPending
    ? 'rgba(251, 191, 36, 0.12)'
    : isRejected
    ? 'rgba(239, 68, 68, 0.12)'
    : 'rgba(255, 255, 255, 0.05)';
  const border = isPaid
    ? 'rgba(74, 222, 128, 0.3)'
    : isPending
    ? 'rgba(251, 191, 36, 0.3)'
    : isRejected
    ? 'rgba(239, 68, 68, 0.3)'
    : 'var(--line)';

  const label = isPaid
    ? 'Paid / Disbursed'
    : isPending
    ? s === 'PROCESSING'
      ? 'Processing Transfer'
      : 'Pending Review'
    : isRejected
    ? 'Rejected / Restored'
    : s;

  return (
    <span
      className="mono"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '3px 10px',
        borderRadius: 8,
        fontSize: 11,
        letterSpacing: '0.05em',
        textTransform: 'uppercase',
        fontWeight: 600,
        background: bg,
        border: `1px solid ${border}`,
        color: color,
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: color,
        }}
      />
      {label}
    </span>
  );
}

export function PayoutsPage() {
  const { currentOrg, currentSlug } = useOrganizer();
  const [account, setAccount] = useState(null);
  const [summary, setSummary] = useState(null);
  const [withdrawals, setWithdrawals] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Destination settings editing
  const [editingDestination, setEditingDestination] = useState(false);
  const [savingDestination, setSavingDestination] = useState(false);
  const [destType, setDestType] = useState('BANK_ACCOUNT'); // 'BANK_ACCOUNT' | 'UPI'
  const [accountHolder, setAccountHolder] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [confirmAccountNumber, setConfirmAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [vpa, setVpa] = useState('');
  const [destError, setDestError] = useState('');
  const [destSuccess, setDestSuccess] = useState('');

  // Withdrawal Request Modal
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawEventId, setWithdrawEventId] = useState('');
  const [withdrawNotes, setWithdrawNotes] = useState('');
  const [withdrawing, setWithdrawing] = useState(false);
  const [withdrawError, setWithdrawError] = useState('');

  const loadData = useCallback(async (isSilent = false) => {
    if (!currentSlug) return;
    if (!isSilent) setLoading(true);
    else setRefreshing(true);
    setError('');

    try {
      const [acc, earnSummary, withList, evts] = await Promise.all([
        api.getPayoutAccount(currentSlug).catch((err) => (err.status === 404 ? null : null)),
        api.getEarningsSummary(currentSlug).catch(() => null),
        api.listWithdrawals(currentSlug).catch(() => []),
        api.listOrgEvents(currentSlug).catch(() => []),
      ]);

      setAccount(acc);
      setSummary(earnSummary);
      setWithdrawals(withList || []);
      setEvents(evts || []);

      if (acc) {
        setDestType(acc.account_type || 'BANK_ACCOUNT');
        setAccountHolder(acc.account_holder_name || '');
        setBankName(acc.bank_name || '');
        setIfscCode(acc.ifsc_code || '');
        setVpa(acc.vpa || '');
      } else {
        setEditingDestination(true);
      }
    } catch (err) {
      setError(err.message || 'Failed to load earnings and payout details.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [currentSlug]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSaveDestination = async (e) => {
    e.preventDefault();
    setDestError('');
    setDestSuccess('');

    if (destType === 'BANK_ACCOUNT') {
      if (!accountHolder.trim()) {
        setDestError('Account holder name is required.');
        return;
      }
      if (accountNumber !== confirmAccountNumber) {
        setDestError('Bank account numbers do not match. Please verify carefully.');
        return;
      }
      if (accountNumber.trim().length < 8) {
        setDestError('Please provide a valid bank account number.');
        return;
      }
      if (ifscCode.trim().length !== 11) {
        setDestError('IFSC code must be exactly 11 characters (e.g., HDFC0001234).');
        return;
      }
    } else {
      if (!accountHolder.trim()) {
        setDestError('Recipient name is required.');
        return;
      }
      if (!vpa.trim() || !vpa.includes('@')) {
        setDestError('Please enter a valid UPI ID (e.g., organizer@okhdfcbank).');
        return;
      }
    }

    setSavingDestination(true);
    try {
      const payload = {
        account_type: destType,
        account_holder_name: accountHolder.trim(),
        bank_name: destType === 'BANK_ACCOUNT' ? bankName.trim() || undefined : undefined,
        account_number: destType === 'BANK_ACCOUNT' ? accountNumber.trim() : undefined,
        ifsc_code: destType === 'BANK_ACCOUNT' ? ifscCode.trim().toUpperCase() : undefined,
        vpa: destType === 'UPI' ? vpa.trim() : undefined,
      };

      const updated = await api.registerPayoutAccount(currentSlug, payload);
      setAccount(updated);
      setDestSuccess('Payout destination details saved successfully!');
      setEditingDestination(false);
      setAccountNumber('');
      setConfirmAccountNumber('');
    } catch (err) {
      setDestError(err.message || 'Failed to save payout destination.');
    } finally {
      setSavingDestination(false);
    }
  };

  const handleOpenWithdrawModal = () => {
    if (!account) {
      setDestError('Please configure your payout destination before requesting a withdrawal.');
      setEditingDestination(true);
      return;
    }
    setWithdrawAmount(summary?.available_balance ? String(summary.available_balance) : '');
    setWithdrawEventId('');
    setWithdrawNotes('');
    setWithdrawError('');
    setShowWithdrawModal(true);
  };

  const handleSubmitWithdrawal = async (e) => {
    e.preventDefault();
    setWithdrawError('');

    const amt = parseFloat(withdrawAmount);
    if (isNaN(amt) || amt <= 0) {
      setWithdrawError('Please enter a valid withdrawal amount.');
      return;
    }

    if (summary && amt > summary.available_balance) {
      setWithdrawError(
        `Amount cannot exceed your available balance (${formatINR(summary.available_balance)}).`
      );
      return;
    }

    setWithdrawing(true);
    try {
      await api.requestWithdrawal(currentSlug, {
        amount: amt,
        event_id: withdrawEventId || undefined,
        notes: withdrawNotes.trim() || undefined,
      });

      setShowWithdrawModal(false);
      setSuccess('Withdrawal request submitted! Our team will process your payout transfer shortly.');
      await loadData(true);
    } catch (err) {
      setWithdrawError(err.message || 'Failed to submit withdrawal request.');
    } finally {
      setWithdrawing(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--fg-2)' }}>
        <p>Loading earnings and payout records…</p>
      </div>
    );
  }

  const availableBalance = summary?.available_balance || 0;
  const grossRevenue = summary?.gross_revenue || 0;
  const platformFee = summary?.platform_fee || 0;
  const netEarnings = summary?.net_earnings || 0;
  const totalWithdrawn = summary?.total_withdrawn || 0;
  const pendingWithdrawal = summary?.pending_withdrawal || 0;
  const hasActiveRequest = summary?.has_active_request || false;

  return (
    <div style={{ maxWidth: 1080, margin: '0 auto' }}>
      {/* Page Title & Actions */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 28,
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, margin: '0 0 6px', letterSpacing: '-0.02em' }}>
            Earnings & Withdrawals
          </h1>
          <p style={{ margin: 0, color: 'var(--fg-2)', fontSize: 14 }}>
            Direct Cashfree primary collection. Monitor gross ticket revenue, track platform fees, and request manual bank/UPI disbursements.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <Button
            variant="secondary"
            onClick={() => loadData(true)}
            disabled={refreshing}
            style={{ fontSize: 13 }}
          >
            {refreshing ? 'Refreshing…' : '↻ Refresh Balance'}
          </Button>
          <Button
            variant="primary"
            onClick={handleOpenWithdrawModal}
            disabled={availableBalance <= 0 || hasActiveRequest || !account}
            style={{
              fontSize: 13,
              fontWeight: 600,
              background: availableBalance > 0 && !hasActiveRequest ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : undefined,
              borderColor: availableBalance > 0 && !hasActiveRequest ? '#059669' : undefined,
            }}
          >
            Request Withdrawal ↗
          </Button>
        </div>
      </div>

      {error && (
        <div
          style={{
            padding: '12px 16px',
            borderRadius: 10,
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#ef4444',
            marginBottom: 20,
            fontSize: 13,
          }}
        >
          {error}
        </div>
      )}

      {success && (
        <div
          style={{
            padding: '12px 16px',
            borderRadius: 10,
            background: 'rgba(74, 222, 128, 0.1)',
            border: '1px solid rgba(74, 222, 128, 0.3)',
            color: '#4ade80',
            marginBottom: 20,
            fontSize: 13,
          }}
        >
          {success}
        </div>
      )}

      {/* Active Request Notification Banner */}
      {hasActiveRequest && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 18px',
            borderRadius: 12,
            background: 'rgba(251, 191, 36, 0.08)',
            border: '1px solid rgba(251, 191, 36, 0.25)',
            marginBottom: 24,
            gap: 16,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 20 }}>⏳</span>
            <div>
              <div style={{ fontWeight: 600, fontSize: 13.5, color: '#fbbf24' }}>
                Withdrawal In Progress ({formatINR(pendingWithdrawal)})
              </div>
              <div style={{ fontSize: 12.5, color: 'var(--fg-2)' }}>
                You have a withdrawal request under review. Our administrators will transfer funds and update the bank UTR reference.
              </div>
            </div>
          </div>
          <span className="mono" style={{ fontSize: 12, color: '#fbbf24', fontWeight: 600 }}>
            PROCESSING
          </span>
        </div>
      )}

      {/* 5 Financial Metric Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
          gap: 14,
          marginBottom: 28,
        }}
      >
        {/* Total Revenue */}
        <div
          style={{
            padding: '18px 20px',
            borderRadius: 14,
            background: 'var(--bg-2)',
            border: '1px solid var(--line-2)',
          }}
        >
          <div className="mono" style={{ fontSize: 11, color: 'var(--fg-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
            Total Sales
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--fg)', letterSpacing: '-0.02em' }}>
            {formatINR(grossRevenue)}
          </div>
          <div style={{ fontSize: 11.5, color: 'var(--fg-3)', marginTop: 4 }}>
            100% gateway collection
          </div>
        </div>

        {/* Platform Fees */}
        <div
          style={{
            padding: '18px 20px',
            borderRadius: 14,
            background: 'var(--bg-2)',
            border: '1px solid var(--line-2)',
          }}
        >
          <div className="mono" style={{ fontSize: 11, color: 'var(--fg-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
            Platform Fees
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#f87171', letterSpacing: '-0.02em' }}>
            {formatINR(platformFee)}
          </div>
          <div style={{ fontSize: 11.5, color: 'var(--fg-3)', marginTop: 4 }}>
            Commissions & charges
          </div>
        </div>

        {/* Net Earnings */}
        <div
          style={{
            padding: '18px 20px',
            borderRadius: 14,
            background: 'var(--bg-2)',
            border: '1px solid var(--line-2)',
          }}
        >
          <div className="mono" style={{ fontSize: 11, color: 'var(--fg-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
            Net Revenue
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--fg)', letterSpacing: '-0.02em' }}>
            {formatINR(netEarnings)}
          </div>
          <div style={{ fontSize: 11.5, color: 'var(--fg-3)', marginTop: 4 }}>
            Organizer net share
          </div>
        </div>

        {/* Total Withdrawn */}
        <div
          style={{
            padding: '18px 20px',
            borderRadius: 14,
            background: 'var(--bg-2)',
            border: '1px solid var(--line-2)',
          }}
        >
          <div className="mono" style={{ fontSize: 11, color: 'var(--fg-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
            Total Paid Out
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#38bdf8', letterSpacing: '-0.02em' }}>
            {formatINR(totalWithdrawn)}
          </div>
          <div style={{ fontSize: 11.5, color: 'var(--fg-3)', marginTop: 4 }}>
            Disbursed to bank / UPI
          </div>
        </div>

        {/* Available Withdrawable Balance - Glow Card */}
        <div
          style={{
            padding: '18px 20px',
            borderRadius: 14,
            background: 'linear-gradient(145deg, rgba(16, 185, 129, 0.08) 0%, rgba(5, 150, 105, 0.16) 100%)',
            border: '1px solid rgba(16, 185, 129, 0.35)',
            boxShadow: '0 4px 20px rgba(16, 185, 129, 0.06)',
            position: 'relative',
          }}
        >
          <div className="mono" style={{ fontSize: 11, color: '#34d399', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8, fontWeight: 600 }}>
            Available Balance
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#10b981', letterSpacing: '-0.02em' }}>
            {formatINR(availableBalance)}
          </div>
          <div style={{ fontSize: 11.5, color: '#6ee7b7', marginTop: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>Ready for withdrawal</span>
            {pendingWithdrawal > 0 && (
              <span className="mono" style={{ color: '#fbbf24', fontSize: 11 }}>
                ({formatINR(pendingWithdrawal)} pending)
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Grid: Payout Destination Settings & Fast Withdrawal Action */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 24, marginBottom: 36 }}>
        {/* Destination Account Card */}
        <div
          style={{
            borderRadius: 16,
            background: 'var(--bg-2)',
            border: '1px solid var(--line-2)',
            padding: 24,
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 18,
              flexWrap: 'wrap',
              gap: 12,
            }}
          >
            <div>
              <h3 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 600 }}>
                Payout Destination (Bank / UPI)
              </h3>
              <p style={{ margin: 0, fontSize: 13, color: 'var(--fg-2)' }}>
                Funds will be transferred to this destination when your withdrawal request is approved.
              </p>
            </div>
            {!editingDestination && (
              <Button
                variant="secondary"
                onClick={() => setEditingDestination(true)}
                style={{ fontSize: 12.5 }}
              >
                {account ? '✏️ Edit Details' : '+ Add Bank/UPI Details'}
              </Button>
            )}
          </div>

          {destSuccess && <p style={okStyle}>{destSuccess}</p>}
          {destError && <p style={errorStyle}>{destError}</p>}

          {!editingDestination && account ? (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: 16,
                padding: '16px 20px',
                borderRadius: 12,
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--line)',
              }}
            >
              <div>
                <div style={{ fontSize: 11.5, color: 'var(--fg-3)', marginBottom: 4 }}>Destination Type</div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>
                  {account.account_type === 'UPI' ? 'UPI Virtual Payment Address' : 'Bank Account (IMPS/NEFT)'}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 11.5, color: 'var(--fg-3)', marginBottom: 4 }}>Recipient Name</div>
                <div style={{ fontSize: 14, fontWeight: 500 }}>
                  {account.account_holder_name}
                </div>
              </div>
              {account.account_type === 'UPI' ? (
                <div>
                  <div style={{ fontSize: 11.5, color: 'var(--fg-3)', marginBottom: 4 }}>UPI VPA</div>
                  <div className="mono" style={{ fontSize: 14, color: 'var(--accent)', fontWeight: 600 }}>
                    {account.vpa}
                  </div>
                </div>
              ) : (
                <>
                  <div>
                    <div style={{ fontSize: 11.5, color: 'var(--fg-3)', marginBottom: 4 }}>Account Number</div>
                    <div className="mono" style={{ fontSize: 14, fontWeight: 600 }}>
                      {account.account_number_masked || '******'}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11.5, color: 'var(--fg-3)', marginBottom: 4 }}>IFSC Code</div>
                    <div className="mono" style={{ fontSize: 14, fontWeight: 600, color: 'var(--accent)' }}>
                      {account.ifsc_code}
                    </div>
                  </div>
                  {account.bank_name && (
                    <div>
                      <div style={{ fontSize: 11.5, color: 'var(--fg-3)', marginBottom: 4 }}>Bank Name</div>
                      <div style={{ fontSize: 14 }}>{account.bank_name}</div>
                    </div>
                  )}
                </>
              )}
            </div>
          ) : editingDestination ? (
            <form onSubmit={handleSaveDestination} style={{ marginTop: 12 }}>
              <div style={{ marginBottom: 18 }}>
                <Segmented
                  options={[
                    { value: 'BANK_ACCOUNT', label: '🏦 Bank Account (IMPS/NEFT)' },
                    { value: 'UPI', label: '⚡ UPI ID (VPA)' },
                  ]}
                  value={destType}
                  onChange={setDestType}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
                <Field
                  label={destType === 'BANK_ACCOUNT' ? 'Account Holder Name' : 'Recipient Name'}
                  hint="Must match your official bank records"
                >
                  <TextInput
                    value={accountHolder}
                    onChange={setAccountHolder}
                    placeholder="e.g. John Doe / Tech Club Org"
                    required
                  />
                </Field>

                {destType === 'UPI' ? (
                  <Field label="UPI ID / VPA" hint="Payments will route directly via UPI 24x7">
                    <TextInput
                      value={vpa}
                      onChange={setVpa}
                      placeholder="e.g. username@okaxis or org@upi"
                      required
                    />
                  </Field>
                ) : (
                  <>
                    <Field label="Bank Name (Optional)" hint="e.g. HDFC Bank, ICICI Bank">
                      <TextInput
                        value={bankName}
                        onChange={setBankName}
                        placeholder="e.g. HDFC Bank"
                      />
                    </Field>
                    <Field label="Account Number" hint="Your savings or current bank account">
                      <TextInput
                        type="password"
                        value={accountNumber}
                        onChange={setAccountNumber}
                        placeholder="Enter full account number"
                        required
                      />
                    </Field>
                    <Field label="Confirm Account Number" hint="Re-type to prevent typos">
                      <TextInput
                        value={confirmAccountNumber}
                        onChange={setConfirmAccountNumber}
                        placeholder="Re-enter account number"
                        required
                      />
                    </Field>
                    <Field label="IFSC Code" hint="11-character Indian Financial System Code">
                      <TextInput
                        value={ifscCode}
                        onChange={(val) => setIfscCode(val.toUpperCase())}
                        placeholder="e.g. HDFC0001234"
                        maxLength={11}
                        required
                      />
                    </Field>
                  </>
                )}
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 16, justifyContent: 'flex-end' }}>
                {account && (
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      setEditingDestination(false);
                      setDestError('');
                    }}
                    disabled={savingDestination}
                  >
                    Cancel
                  </Button>
                )}
                <Button type="submit" variant="primary" disabled={savingDestination}>
                  {savingDestination ? 'Saving…' : 'Save Payout Details'}
                </Button>
              </div>
            </form>
          ) : (
            <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--fg-3)' }}>
              No payout destination configured. Click above to add your Bank or UPI details.
            </div>
          )}
        </div>
      </div>

      {/* Withdrawal Request Modal */}
      {showWithdrawModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)',
            display: 'grid',
            placeItems: 'center',
            zIndex: 100,
            padding: 16,
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: 480,
              background: 'var(--bg)',
              border: '1px solid var(--line-2)',
              borderRadius: 18,
              padding: 26,
              boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Request Fund Withdrawal</h3>
              <button
                type="button"
                onClick={() => setShowWithdrawModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--fg-3)',
                  cursor: 'pointer',
                  fontSize: 18,
                }}
              >
                ✕
              </button>
            </div>

            <p style={{ margin: '0 0 16px', fontSize: 13, color: 'var(--fg-2)', lineHeight: 1.5 }}>
              Enter the amount you wish to withdraw to your linked destination. Our admin team will verify and transfer funds via NEFT/IMPS/UPI.
            </p>

            {withdrawError && <p style={errorStyle}>{withdrawError}</p>}

            <form onSubmit={handleSubmitWithdrawal}>
              <Field
                label="Withdrawal Amount (₹)"
                hint={`Available Withdrawable Balance: ${formatINR(availableBalance)}`}
              >
                <div style={{ display: 'flex', gap: 8 }}>
                  <TextInput
                    type="number"
                    step="0.01"
                    min="1"
                    max={availableBalance}
                    value={withdrawAmount}
                    onChange={setWithdrawAmount}
                    placeholder="Enter amount in ₹"
                    required
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setWithdrawAmount(String(availableBalance))}
                    style={{ whiteSpace: 'nowrap', fontSize: 12 }}
                  >
                    All ({formatINR(availableBalance)})
                  </Button>
                </div>
              </Field>

              {events.length > 0 && (
                <Field label="Associate with Event (Optional)" hint="Tag this withdrawal to a specific event ledger">
                  <Select
                    value={withdrawEventId}
                    onChange={setWithdrawEventId}
                    options={[
                      { value: '', label: 'General / All Events Balance' },
                      ...events.map((ev) => ({
                        value: ev.id,
                        label: `${ev.title} (${formatEventDate(ev.start_time)})`,
                      })),
                    ]}
                  />
                </Field>
              )}

              <Field label="Organizer Notes / Reference (Optional)">
                <TextInput
                  value={withdrawNotes}
                  onChange={setWithdrawNotes}
                  placeholder="e.g. Ticket revenue tranche 1"
                  maxLength={250}
                />
              </Field>

              {/* Destination Summary in Modal */}
              <div
                style={{
                  padding: '12px 14px',
                  borderRadius: 10,
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--line)',
                  marginBottom: 20,
                  fontSize: 12.5,
                }}
              >
                <div style={{ color: 'var(--fg-3)', marginBottom: 4 }}>Transfer Destination:</div>
                <div style={{ fontWeight: 600 }}>
                  {account?.account_type === 'UPI'
                    ? `UPI: ${account.vpa}`
                    : `${account?.account_holder_name} · ${account?.account_number_masked || 'Account'} (${account?.ifsc_code})`}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowWithdrawModal(false)}
                  disabled={withdrawing}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" disabled={withdrawing}>
                  {withdrawing ? 'Submitting…' : 'Confirm Withdrawal Request'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Withdrawal History Table */}
      <div
        style={{
          borderRadius: 16,
          background: 'var(--bg-2)',
          border: '1px solid var(--line-2)',
          overflow: 'hidden',
          marginBottom: 36,
        }}
      >
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid var(--line)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>Withdrawal History</h3>
            <p style={{ margin: '4px 0 0', fontSize: 12.5, color: 'var(--fg-2)' }}>
              Past and pending organizer payout disbursements
            </p>
          </div>
          <span className="mono" style={{ fontSize: 12, color: 'var(--fg-3)' }}>
            {withdrawals.length} {withdrawals.length === 1 ? 'request' : 'requests'}
          </span>
        </div>

        {withdrawals.length === 0 ? (
          <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--fg-3)' }}>
            No withdrawal requests submitted yet. When your ticket sales accumulate, request payouts here.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr
                  className="mono"
                  style={{
                    borderBottom: '1px solid var(--line)',
                    background: 'rgba(255, 255, 255, 0.02)',
                    color: 'var(--fg-3)',
                    textAlign: 'left',
                    fontSize: 11,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  <th style={{ padding: '12px 18px' }}>Request ID</th>
                  <th style={{ padding: '12px 18px' }}>Date</th>
                  <th style={{ padding: '12px 18px' }}>Amount</th>
                  <th style={{ padding: '12px 18px' }}>Destination</th>
                  <th style={{ padding: '12px 18px' }}>Status</th>
                  <th style={{ padding: '12px 18px' }}>Bank UTR / Ref</th>
                  <th style={{ padding: '12px 18px' }}>Admin Notes</th>
                </tr>
              </thead>
              <tbody>
                {withdrawals.map((w) => {
                  const snap = w.payout_details_snapshot || {};
                  const isUpi = snap.account_type === 'UPI';
                  const destLabel = isUpi
                    ? `UPI: ${snap.vpa || '—'}`
                    : `${snap.account_number_masked || snap.masked_account_number || 'A/C'} (${snap.ifsc_code || '—'})`;

                  return (
                    <tr
                      key={w.id}
                      style={{
                        borderBottom: '1px solid var(--line)',
                        transition: 'background 0.15s ease',
                      }}
                    >
                      <td style={{ padding: '14px 18px' }}>
                        <span className="mono" style={{ fontSize: 12, fontWeight: 600 }}>
                          {w.request_id}
                        </span>
                      </td>
                      <td style={{ padding: '14px 18px', color: 'var(--fg-2)', whiteSpace: 'nowrap' }}>
                        {formatEventDate(w.requested_at || w.created_at)}
                      </td>
                      <td style={{ padding: '14px 18px', fontWeight: 700 }}>
                        {formatINR(w.amount)}
                      </td>
                      <td style={{ padding: '14px 18px', color: 'var(--fg-2)' }}>
                        <div>{destLabel}</div>
                        {snap.account_holder_name && (
                          <div style={{ fontSize: 11.5, color: 'var(--fg-3)' }}>{snap.account_holder_name}</div>
                        )}
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <WithdrawalStatusBadge status={w.status} />
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        {w.utr_reference ? (
                          <span
                            className="mono"
                            style={{
                              fontSize: 12,
                              color: '#4ade80',
                              fontWeight: 600,
                              background: 'rgba(74, 222, 128, 0.08)',
                              padding: '2px 8px',
                              borderRadius: 6,
                              border: '1px solid rgba(74, 222, 128, 0.25)',
                            }}
                          >
                            {w.utr_reference}
                          </span>
                        ) : (
                          <span style={{ color: 'var(--fg-3)', fontSize: 12 }}>—</span>
                        )}
                      </td>
                      <td style={{ padding: '14px 18px', color: 'var(--fg-2)', maxWidth: 220 }}>
                        {w.admin_notes || w.rejection_reason || <span style={{ color: 'var(--fg-3)' }}>—</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Granular Event Breakdown (if events exist) */}
      {summary?.events_breakdown && summary.events_breakdown.length > 0 && (
        <div
          style={{
            borderRadius: 16,
            background: 'var(--bg-2)',
            border: '1px solid var(--line-2)',
            padding: 24,
          }}
        >
          <h3 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 600 }}>Event Revenue Breakdown</h3>
          <p style={{ margin: '0 0 18px', fontSize: 12.5, color: 'var(--fg-2)' }}>
            Transparent breakdown of gross ticket sales, platform commissions, and net organizer earnings by event.
          </p>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr
                  className="mono"
                  style={{
                    borderBottom: '1px solid var(--line)',
                    background: 'rgba(255, 255, 255, 0.02)',
                    color: 'var(--fg-3)',
                    textAlign: 'left',
                    fontSize: 11,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  <th style={{ padding: '10px 14px' }}>Event</th>
                  <th style={{ padding: '10px 14px' }}>Tickets Sold</th>
                  <th style={{ padding: '10px 14px' }}>Gross Revenue</th>
                  <th style={{ padding: '10px 14px' }}>Platform Commission</th>
                  <th style={{ padding: '10px 14px' }}>Net Earnings</th>
                </tr>
              </thead>
              <tbody>
                {summary.events_breakdown.map((item) => {
                  const ev = events.find((e) => String(e.id) === String(item.event_id));
                  const title = ev ? ev.title : `Event #${item.event_id.slice(0, 8)}`;

                  return (
                    <tr key={item.event_id} style={{ borderBottom: '1px solid var(--line)' }}>
                      <td style={{ padding: '12px 14px', fontWeight: 600 }}>{title}</td>
                      <td style={{ padding: '12px 14px', color: 'var(--fg-2)' }}>{item.orders_count || item.ticket_sales_count || 0}</td>
                      <td style={{ padding: '12px 14px' }}>{formatINR(item.gross_revenue || item.gross_amount)}</td>
                      <td style={{ padding: '12px 14px', color: '#f87171' }}>{formatINR(item.fees || item.platform_fee)}</td>
                      <td style={{ padding: '12px 14px', fontWeight: 700, color: '#10b981' }}>
                        {formatINR(item.net_revenue || item.net_amount)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
