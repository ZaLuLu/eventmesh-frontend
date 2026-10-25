import { useCallback, useEffect, useState } from 'react';
import { api } from '../lib/apiClient';
import { formatEventDate } from '../utils/formatDate';
import { Button, Field, Segmented, TextInput, TextArea } from './components/fields';

const errorStyle = { color: '#ff6b6b', fontSize: 13, marginTop: 8 };
const okStyle = { color: '#4ade80', fontSize: 13, marginTop: 8 };

function formatINR(amount) {
  return `₹${Number(amount || 0).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function StatusBadge({ status }) {
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
      {s === 'PAID' ? 'Paid / Settled' : s === 'PENDING' ? 'Pending Disburse' : s}
    </span>
  );
}

export function AdminWithdrawalsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL'); // 'ALL' | 'PENDING' | 'PAID' | 'REJECTED'
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Mark as Paid Modal State
  const [payTarget, setPayTarget] = useState(null);
  const [utrReference, setUtrReference] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [submittingPay, setSubmittingPay] = useState(false);
  const [payError, setPayError] = useState('');

  // Reject Modal State
  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [submittingReject, setSubmittingReject] = useState(false);
  const [rejectError, setRejectError] = useState('');

  const loadRequests = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = filter === 'ALL' ? {} : { status: filter };
      const data = await api.adminListWithdrawals(params);
      setRequests(data || []);
    } catch (err) {
      setError(err.message || 'Failed to load administrator withdrawal requests.');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const handleOpenPay = (req) => {
    setPayTarget(req);
    setUtrReference('');
    setAdminNotes('');
    setPayError('');
  };

  const handleConfirmPay = async (e) => {
    e.preventDefault();
    if (!utrReference.trim()) {
      setPayError('Bank UTR or transaction reference number is required.');
      return;
    }

    setSubmittingPay(true);
    setPayError('');
    try {
      await api.adminPayWithdrawal(payTarget.request_id, {
        utr_reference: utrReference.trim(),
        admin_notes: adminNotes.trim() || undefined,
      });
      setSuccess(`Withdrawal ${payTarget.request_id} successfully marked as PAID!`);
      setPayTarget(null);
      await loadRequests();
    } catch (err) {
      setPayError(err.message || 'Failed to mark withdrawal as paid.');
    } finally {
      setSubmittingPay(false);
    }
  };

  const handleOpenReject = (req) => {
    setRejectTarget(req);
    setRejectionReason('');
    setRejectError('');
  };

  const handleConfirmReject = async (e) => {
    e.preventDefault();
    if (!rejectionReason.trim()) {
      setRejectError('Please specify a rejection reason for the organizer.');
      return;
    }

    setSubmittingReject(true);
    setRejectError('');
    try {
      await api.adminRejectWithdrawal(rejectTarget.request_id, {
        rejection_reason: rejectionReason.trim(),
      });
      setSuccess(`Withdrawal ${rejectTarget.request_id} rejected. Funds restored to organizer balance.`);
      setRejectTarget(null);
      await loadRequests();
    } catch (err) {
      setRejectError(err.message || 'Failed to reject withdrawal request.');
    } finally {
      setSubmittingReject(false);
    }
  };

  return (
    <div style={{ maxWidth: 1160, margin: '0 auto' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 24,
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h1 style={{ fontSize: 26, fontWeight: 700, margin: 0, letterSpacing: '-0.02em' }}>
              Payout Disbursements
            </h1>
            <span
              className="mono"
              style={{
                fontSize: 11,
                padding: '2px 8px',
                borderRadius: 6,
                background: 'rgba(168, 85, 247, 0.15)',
                color: '#c084fc',
                border: '1px solid rgba(168, 85, 247, 0.3)',
                fontWeight: 600,
              }}
            >
              ADMIN
            </span>
          </div>
          <p style={{ margin: '6px 0 0', color: 'var(--fg-2)', fontSize: 14 }}>
            Review organizer withdrawal requests, execute bank/UPI transfers, and record bank UTR reference numbers.
          </p>
        </div>

        <Button
          variant="secondary"
          onClick={loadRequests}
          disabled={loading}
          style={{ fontSize: 13 }}
        >
          {loading ? 'Refreshing…' : '↻ Refresh'}
        </Button>
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

      {/* Filter Tabs */}
      <div style={{ marginBottom: 20 }}>
        <Segmented
          options={[
            { value: 'ALL', label: 'All Requests' },
            { value: 'PENDING', label: '⏳ Pending Action' },
            { value: 'PAID', label: '✓ Paid / Disbursed' },
            { value: 'REJECTED', label: '✕ Rejected' },
          ]}
          value={filter}
          onChange={setFilter}
        />
      </div>

      {/* Requests Table */}
      <div
        style={{
          borderRadius: 16,
          background: 'var(--bg-2)',
          border: '1px solid var(--line-2)',
          overflow: 'hidden',
        }}
      >
        {loading ? (
          <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--fg-3)' }}>
            Loading withdrawal requests…
          </div>
        ) : requests.length === 0 ? (
          <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--fg-3)' }}>
            No withdrawal requests match the selected filter.
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
                  <th style={{ padding: '14px 18px' }}>Request ID</th>
                  <th style={{ padding: '14px 18px' }}>Organizer / Event</th>
                  <th style={{ padding: '14px 18px' }}>Amount</th>
                  <th style={{ padding: '14px 18px' }}>Bank / UPI Details</th>
                  <th style={{ padding: '14px 18px' }}>Requested At</th>
                  <th style={{ padding: '14px 18px' }}>Status</th>
                  <th style={{ padding: '14px 18px' }}>UTR / Reference</th>
                  <th style={{ padding: '14px 18px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((r) => {
                  const snap = r.payout_details_snapshot || {};
                  const isPending = r.status === 'PENDING' || r.status === 'APPROVED' || r.status === 'PROCESSING';
                  const isUpi = snap.account_type === 'UPI';

                  return (
                    <tr
                      key={r.id}
                      style={{
                        borderBottom: '1px solid var(--line)',
                        transition: 'background 0.15s ease',
                      }}
                    >
                      <td style={{ padding: '16px 18px' }}>
                        <span className="mono" style={{ fontSize: 12, fontWeight: 600 }}>
                          {r.request_id}
                        </span>
                      </td>

                      <td style={{ padding: '16px 18px' }}>
                        <div style={{ fontWeight: 600, color: 'var(--fg)' }}>
                          {r.organization_name || 'Organization'}
                        </div>
                        {r.organization_slug && (
                          <div style={{ fontSize: 11.5, color: 'var(--fg-3)' }}>
                            @{r.organization_slug}
                          </div>
                        )}
                        {r.event_title && (
                          <div style={{ fontSize: 12, color: 'var(--accent)', marginTop: 2 }}>
                            🎟️ {r.event_title}
                          </div>
                        )}
                      </td>

                      <td style={{ padding: '16px 18px', fontWeight: 700, fontSize: 14 }}>
                        {formatINR(r.amount)}
                      </td>

                      <td style={{ padding: '16px 18px', color: 'var(--fg-2)' }}>
                        <div style={{ fontWeight: 600, color: 'var(--fg)' }}>
                          {snap.account_holder_name || 'Recipient'}
                        </div>
                        {isUpi ? (
                          <div className="mono" style={{ fontSize: 12, color: '#38bdf8' }}>
                            UPI: {snap.vpa || '—'}
                          </div>
                        ) : (
                          <>
                            <div className="mono" style={{ fontSize: 12 }}>
                              A/C: {snap.account_number_masked || snap.account_number || '—'}
                            </div>
                            <div className="mono" style={{ fontSize: 11.5, color: 'var(--accent)' }}>
                              IFSC: {snap.ifsc_code || '—'} {snap.bank_name ? `(${snap.bank_name})` : ''}
                            </div>
                          </>
                        )}
                      </td>

                      <td style={{ padding: '16px 18px', color: 'var(--fg-2)', whiteSpace: 'nowrap' }}>
                        {formatEventDate(r.requested_at || r.created_at)}
                      </td>

                      <td style={{ padding: '16px 18px' }}>
                        <StatusBadge status={r.status} />
                      </td>

                      <td style={{ padding: '16px 18px' }}>
                        {r.utr_reference ? (
                          <span
                            className="mono"
                            style={{
                              fontSize: 12,
                              color: '#4ade80',
                              fontWeight: 600,
                              background: 'rgba(74, 222, 128, 0.08)',
                              padding: '3px 8px',
                              borderRadius: 6,
                              border: '1px solid rgba(74, 222, 128, 0.25)',
                            }}
                          >
                            {r.utr_reference}
                          </span>
                        ) : (
                          <span style={{ color: 'var(--fg-3)', fontSize: 12 }}>—</span>
                        )}
                      </td>

                      <td style={{ padding: '16px 18px', textAlign: 'right' }}>
                        {isPending ? (
                          <div style={{ display: 'inline-flex', gap: 8 }}>
                            <Button
                              variant="secondary"
                              onClick={() => handleOpenReject(r)}
                              style={{
                                fontSize: 12,
                                padding: '6px 12px',
                                color: '#f87171',
                                borderColor: 'rgba(239, 68, 68, 0.3)',
                              }}
                            >
                              Reject
                            </Button>
                            <Button
                              variant="primary"
                              onClick={() => handleOpenPay(r)}
                              style={{
                                fontSize: 12,
                                padding: '6px 14px',
                                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                borderColor: '#059669',
                              }}
                            >
                              Disburse & Pay ✓
                            </Button>
                          </div>
                        ) : (
                          <span style={{ fontSize: 12, color: 'var(--fg-3)' }}>Processed</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Mark as Paid Modal */}
      {payTarget && (
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
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Record Manual Payout (UTR)</h3>
              <button
                type="button"
                onClick={() => setPayTarget(null)}
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
              Confirm that you have manually transferred <strong>{formatINR(payTarget.amount)}</strong> via bank transfer/UPI and enter the transaction UTR number.
            </p>

            <div
              style={{
                padding: '12px 14px',
                borderRadius: 10,
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--line)',
                marginBottom: 18,
                fontSize: 12.5,
              }}
            >
              <div style={{ fontWeight: 600, color: 'var(--fg)', marginBottom: 2 }}>
                Organizer: {payTarget.organization_name || 'Organization'}
              </div>
              <div style={{ color: 'var(--fg-2)' }}>
                Destination:{' '}
                {payTarget.payout_details_snapshot?.account_type === 'UPI'
                  ? `UPI: ${payTarget.payout_details_snapshot?.vpa}`
                  : `A/C: ${payTarget.payout_details_snapshot?.account_number_masked || payTarget.payout_details_snapshot?.account_number} (${payTarget.payout_details_snapshot?.ifsc_code})`}
              </div>
            </div>

            {payError && <p style={errorStyle}>{payError}</p>}

            <form onSubmit={handleConfirmPay}>
              <Field
                label="Bank UTR / Transaction Reference Number *"
                hint="Provided by your netbanking portal (e.g. HDFCN261021009876, CMS12345678)"
              >
                <TextInput
                  value={utrReference}
                  onChange={setUtrReference}
                  placeholder="Enter 12-22 char UTR number"
                  required
                />
              </Field>

              <Field label="Admin Notes (Optional)" hint="Internal note or payment method details">
                <TextInput
                  value={adminNotes}
                  onChange={setAdminNotes}
                  placeholder="e.g. Transferred via HDFC Corporate NetBanking"
                />
              </Field>

              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 20 }}>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setPayTarget(null)}
                  disabled={submittingPay}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={submittingPay}
                  style={{
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    borderColor: '#059669',
                  }}
                >
                  {submittingPay ? 'Recording…' : 'Mark as PAID ✓'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectTarget && (
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
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#f87171' }}>
                Reject Withdrawal Request
              </h3>
              <button
                type="button"
                onClick={() => setRejectTarget(null)}
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
              Rejecting will automatically restore <strong>{formatINR(rejectTarget.amount)}</strong> back to the organizer's withdrawable balance.
            </p>

            {rejectError && <p style={errorStyle}>{rejectError}</p>}

            <form onSubmit={handleConfirmReject}>
              <Field
                label="Rejection Reason *"
                hint="This explanation will be visible to the organizer on their dashboard"
              >
                <TextArea
                  value={rejectionReason}
                  onChange={setRejectionReason}
                  placeholder="e.g. Bank IFSC code does not match beneficiary name; please update your account details."
                  rows={3}
                  required
                />
              </Field>

              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 20 }}>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setRejectTarget(null)}
                  disabled={submittingReject}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={submittingReject}
                  style={{
                    background: '#dc2626',
                    borderColor: '#b91c1c',
                  }}
                >
                  {submittingReject ? 'Rejecting…' : 'Reject & Restore Funds'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
