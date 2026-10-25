import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, Route, Routes, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';
import { useProfile } from '../profile/useProfile';
import { api } from '../lib/apiClient';
import { LogoMark } from '../components/UIPrimitives';
import { NotificationBell } from '../components/NotificationBell';
function formatDateTime(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return String(iso);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

// ── Reusable Minimal Primitives ─────────────────────────────────────────────

function Centered({ children }) {
  return (
    <div style={{ minHeight: '70vh', display: 'grid', placeItems: 'center', padding: 24 }}>
      <div style={{ textAlign: 'center', maxWidth: 440 }}>{children}</div>
    </div>
  );
}

function StatCard({ label, value, subtext, highlight = false, alert = false }) {
  return (
    <div
      style={{
        flex: '1 1 200px',
        background: 'var(--bg-2)',
        border: alert
          ? '1px solid rgba(255, 184, 77, 0.45)'
          : highlight
          ? '1px solid rgba(0, 214, 255, 0.35)'
          : '1px solid var(--line)',
        borderRadius: 14,
        padding: '20px 22px',
        boxShadow: alert ? '0 0 20px rgba(255, 184, 77, 0.08)' : 'none',
      }}
    >
      <div
        className="mono"
        style={{
          fontSize: 10.5,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: alert ? '#ffb84d' : 'var(--fg-3)',
        }}
      >
        {label}
      </div>
      <div style={{ marginTop: 8, display: 'flex', alignItems: 'baseline', gap: 10 }}>
        <span
          style={{
            fontSize: 32,
            fontWeight: 700,
            color: alert ? '#ffb84d' : 'var(--fg)',
            letterSpacing: '-0.02em',
          }}
        >
          {value}
        </span>
      </div>
      {subtext && (
        <div style={{ fontSize: 12, color: 'var(--fg-3)', marginTop: 6 }}>{subtext}</div>
      )}
    </div>
  );
}

function StatusPill({ status }) {
  const s = String(status || '').toLowerCase();
  const styles = {
    pending: { bg: 'rgba(255, 184, 77, 0.12)', border: 'rgba(255, 184, 77, 0.35)', color: '#ffb84d', label: 'Pending Review' },
    approved: { bg: 'rgba(0, 214, 255, 0.12)', border: 'rgba(0, 214, 255, 0.35)', color: 'var(--accent)', label: 'Approved' },
    verified: { bg: 'rgba(74, 222, 128, 0.12)', border: 'rgba(74, 222, 128, 0.35)', color: '#4ade80', label: 'Verified' },
    processing: { bg: 'rgba(251, 191, 36, 0.12)', border: 'rgba(251, 191, 36, 0.35)', color: '#fbbf24', label: 'Processing' },
    paid: { bg: 'rgba(74, 222, 128, 0.12)', border: 'rgba(74, 222, 128, 0.35)', color: '#4ade80', label: 'Paid / Transferred' },
    rejected: { bg: 'rgba(255, 107, 107, 0.12)', border: 'rgba(255, 107, 107, 0.35)', color: '#ff6b6b', label: 'Rejected' },
    failed: { bg: 'rgba(239, 68, 68, 0.12)', border: 'rgba(239, 68, 68, 0.35)', color: '#ef4444', label: 'Failed' },
    archived: { bg: 'rgba(125, 133, 144, 0.12)', border: 'rgba(125, 133, 144, 0.35)', color: '#7d8590', label: 'Archived' },
  };
  const cfg = styles[s] || { bg: 'var(--bg-3)', border: 'var(--line-2)', color: 'var(--fg-2)', label: status };

  return (
    <span
      className="mono"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        fontSize: 10.5,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        fontWeight: 600,
        padding: '3px 8px',
        borderRadius: 999,
        background: cfg.bg,
        border: `1px solid ${cfg.border}`,
        color: cfg.color,
      }}
    >
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: cfg.color }} />
      {cfg.label}
    </span>
  );
}

// ── Top Navigation Bar ───────────────────────────────────────────────────────

function AdminTopBar({ pendingCount, pendingInstitutionsCount, pendingWithdrawalsCount }) {
  const location = useLocation();

  const navLinks = [
    { to: '/admin', label: 'Overview', exact: true },
    {
      to: '/admin/proposals',
      label: 'Applications',
      badge: pendingCount > 0 ? pendingCount : null,
    },
    {
      to: '/admin/institutions',
      label: 'Institutions',
      badge: pendingInstitutionsCount > 0 ? pendingInstitutionsCount : null,
    },
    {
      to: '/admin/withdrawals',
      label: 'Withdrawals',
      badge: pendingWithdrawalsCount > 0 ? pendingWithdrawalsCount : null,
    },
    { to: '/admin/organizations', label: 'Directory & Audit' },
  ];

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 40,
        borderBottom: '1px solid var(--line)',
        background: 'rgba(6, 6, 8, 0.88)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
      }}
    >
      <div
        className="container"
        style={{ display: 'flex', alignItems: 'center', gap: 18, height: 62 }}
      >
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', color: 'inherit' }}>
          <LogoMark size={22} />
          <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-0.01em' }}>EventMesh</span>
        </Link>

        <div
          className="mono"
          style={{
            fontSize: 11,
            color: 'var(--accent)',
            background: 'rgba(0, 214, 255, 0.1)',
            border: '1px solid rgba(0, 214, 255, 0.25)',
            borderRadius: 6,
            padding: '3px 8px',
            fontWeight: 600,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}
        >
          Platform Admin
        </div>

        <nav style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 16 }}>
          {navLinks.map((link) => {
            const isActive = link.exact
              ? location.pathname === link.to
              : location.pathname.startsWith(link.to);
            return (
              <Link
                key={link.to}
                to={link.to}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '7px 13px',
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? 'var(--fg)' : 'var(--fg-2)',
                  background: isActive ? 'var(--bg-2)' : 'transparent',
                  textDecoration: 'none',
                  transition: 'color 0.15s, background 0.15s',
                }}
              >
                {link.label}
                {link.badge && (
                  <span
                    className="mono"
                    style={{
                      background: '#ffb84d',
                      color: '#000',
                      borderRadius: 999,
                      padding: '1px 6px',
                      fontSize: 10,
                      fontWeight: 700,
                    }}
                  >
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div style={{ flex: 1 }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <NotificationBell />
          <Link
            to="/organizer"
            style={{ fontSize: 13, color: 'var(--fg-2)', textDecoration: 'none' }}
          >
            🏛️ Organizer Dashboard
          </Link>
          <Link
            to="/"
            style={{ fontSize: 13, color: 'var(--fg-3)', textDecoration: 'none' }}
          >
            ← Public Site
          </Link>
        </div>
      </div>
    </header>
  );
}

// ── Rejection Modal (Required Reason) ───────────────────────────────────────

function RejectModal({ proposal, onClose, onConfirm, busy }) {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  if (!proposal) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanReason = reason.trim();
    if (!cleanReason) {
      setError('A rejection reason is required so the applicant understands the decision.');
      return;
    }
    onConfirm(proposal.id, cleanReason);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        background: 'rgba(0, 0, 0, 0.72)',
        backdropFilter: 'blur(8px)',
        display: 'grid',
        placeItems: 'center',
        padding: 20,
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 520,
          background: 'var(--bg-2)',
          border: '1px solid var(--line-2)',
          borderRadius: 16,
          padding: 26,
          boxShadow: '0 20px 48px rgba(0, 0, 0, 0.4)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <span style={{ fontSize: 20 }}>⚠️</span>
          <h3 style={{ margin: 0, fontSize: 17, fontWeight: 600 }}>Reject Organization Application</h3>
        </div>

        <p style={{ fontSize: 13.5, color: 'var(--fg-2)', margin: '0 0 16px', lineHeight: 1.5 }}>
          Rejecting <strong style={{ color: 'var(--fg)' }}>{proposal.proposed_organization?.name}</strong>.
          The applicant will be notified with your feedback explaining why the application could not be approved.
        </p>

        {proposal.reason && (
          <div
            style={{
              padding: '10px 14px',
              borderRadius: 8,
              background: 'var(--bg)',
              border: '1px solid var(--line)',
              fontSize: 12.5,
              color: 'var(--fg-2)',
              marginBottom: 16,
            }}
          >
            <div style={{ fontSize: 11, color: 'var(--fg-3)', marginBottom: 4, textTransform: 'uppercase' }}>
              Applicant Statement:
            </div>
            &ldquo;{proposal.reason}&rdquo;
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <label style={{ display: 'block', marginBottom: 16 }}>
            <div style={{ fontSize: 12.5, fontWeight: 500, color: 'var(--fg)', marginBottom: 6 }}>
              Rejection Reason <span style={{ color: '#ff6b6b' }}>*</span>
            </div>
            <textarea
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (error) setError('');
              }}
              rows={4}
              placeholder="Explain why this request is being rejected (e.g. invalid contact information, domain verification required, duplicated community, commercial spam)..."
              required
              className="eventmesh-input"
              style={{ width: '100%', resize: 'vertical', lineHeight: 1.5 }}
              autoFocus
            />
            {error && (
              <div style={{ color: '#ff6b6b', fontSize: 12, marginTop: 6 }}>{error}</div>
            )}
          </label>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <button
              type="button"
              onClick={onClose}
              disabled={busy}
              style={{
                padding: '9px 16px',
                borderRadius: 8,
                background: 'transparent',
                border: '1px solid var(--line-2)',
                color: 'var(--fg)',
                fontSize: 13,
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={busy || !reason.trim()}
              style={{
                padding: '9px 18px',
                borderRadius: 8,
                background: '#ff6b6b',
                color: '#fff',
                border: 'none',
                fontWeight: 600,
                fontSize: 13,
                cursor: busy || !reason.trim() ? 'not-allowed' : 'pointer',
                opacity: busy || !reason.trim() ? 0.6 : 1,
              }}
            >
              {busy ? 'Rejecting…' : 'Confirm Rejection'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── 1. Overview View ────────────────────────────────────────────────────────

function OverviewView({ overview, onNavigateQueue }) {
  if (!overview) {
    return <div style={{ color: 'var(--fg-3)', padding: 24 }}>Loading overview metrics…</div>;
  }

  const root = overview.platform_root || overview.root_organization || {
    name: 'EventMesh Platform Root',
    slug: 'eventmesh',
    status: 'verified',
    owner_email: 'nayaklabs.ai@gmail.com',
  };
  const pendingApps = overview.pending_proposals_count ?? overview.pending_proposals ?? 0;
  const pendingWds = overview.pending_withdrawals_count ?? 0;
  const verifiedInsts = overview.verified_institutions_count ?? 0;
  const totalOrgs = overview.total_organizations_count ?? overview.total_organizations ?? 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: '0 0 6px', letterSpacing: '-0.02em' }}>
          Platform Administration
        </h1>
        <p style={{ color: 'var(--fg-2)', fontSize: 14, margin: 0 }}>
          Manage global organization verifications, institution domain claims, organizer withdrawal requests, and audit logs.
        </p>
      </div>

      {/* Metrics Cards */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <StatCard
          label="Pending Applications"
          value={pendingApps}
          subtext={pendingApps > 0 ? 'Requires admin approval' : 'Queue is all clear'}
          alert={pendingApps > 0}
        />
        <StatCard
          label="Pending Withdrawals"
          value={pendingWds}
          subtext={pendingWds > 0 ? 'Awaiting transfer review' : 'No payout requests'}
          alert={pendingWds > 0}
        />
        <StatCard
          label="Verified Institutions"
          value={verifiedInsts}
          subtext="Colleges & Universities"
          highlight
        />
        <StatCard
          label="Total Organizations"
          value={totalOrgs}
          subtext="Across organization tree"
        />
      </div>

      {/* Platform Root Card */}
      <div
        style={{
          background: 'var(--bg-2)',
          border: '1px solid var(--line)',
          borderRadius: 14,
          padding: '24px 26px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 24 }}>👑</span>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>{root.name}</h3>
                <span
                  className="mono"
                  style={{
                    fontSize: 10,
                    padding: '2px 8px',
                    borderRadius: 999,
                    background: 'rgba(0, 214, 255, 0.12)',
                    border: '1px solid rgba(0, 214, 255, 0.3)',
                    color: 'var(--accent)',
                    fontWeight: 700,
                  }}
                >
                  Platform Root
                </span>
                <StatusPill status={root.status} />
              </div>
              <div style={{ fontSize: 12.5, color: 'var(--fg-3)', marginTop: 4 }}>
                Slug: <code className="mono" style={{ color: 'var(--fg-2)' }}>{root.slug}</code> · ID: {root.id || 'root'}
              </div>
            </div>
          </div>
          <Link
            to={`/org/${root.slug}`}
            target="_blank"
            rel="noreferrer"
            style={{
              fontSize: 12.5,
              color: 'var(--accent)',
              textDecoration: 'none',
              padding: '6px 12px',
              borderRadius: 8,
              border: '1px solid rgba(0, 214, 255, 0.25)',
            }}
          >
            View Public Page ↗
          </Link>
        </div>

        <p style={{ fontSize: 13.5, color: 'var(--fg-2)', margin: '0 0 16px', lineHeight: 1.5 }}>
          EventMesh Platform Root serves as the universal hierarchical apex. Top-level universities, institutions,
          and independent communities branch directly underneath this root.
        </p>

        <div style={{ display: 'flex', gap: 24, fontSize: 13, color: 'var(--fg-2)', borderTop: '1px solid var(--line)', paddingTop: 14 }}>
          <div>
            <strong style={{ color: 'var(--fg)' }}>Platform Admin:</strong> {root.owner_email || 'nayaklabs.ai@gmail.com'}
          </div>
          <div>
            <strong style={{ color: 'var(--fg)' }}>Root Hierarchy:</strong> Apex Parent (parent_organization_id = null)
          </div>
        </div>
      </div>

      {/* Action Shortcut Banner */}
      {pendingApps > 0 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '18px 22px',
            borderRadius: 14,
            background: 'linear-gradient(90deg, rgba(255, 184, 77, 0.12), rgba(255, 184, 77, 0.04))',
            border: '1px solid rgba(255, 184, 77, 0.35)',
          }}
        >
          <div>
            <div style={{ fontWeight: 600, fontSize: 15, color: '#ffb84d' }}>
              {pendingApps} organization {pendingApps === 1 ? 'application requires' : 'applications require'} your review
            </div>
            <div style={{ fontSize: 12.5, color: 'var(--fg-2)', marginTop: 2 }}>
              Applicants are waiting for approval before they can host events and manage their organizations.
            </div>
          </div>
          <button
            type="button"
            onClick={onNavigateQueue}
            style={{
              padding: '10px 18px',
              borderRadius: 999,
              background: '#ffb84d',
              color: '#000',
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              fontSize: 13,
            }}
          >
            Review Queue →
          </button>
        </div>
      )}
    </div>
  );
}

// ── 2. Proposal Review Queue View ───────────────────────────────────────────

function ProposalsQueueView({ proposals, loading, onReview, busyId }) {
  const [filter, setFilter] = useState('pending');
  const [search, setSearch] = useState('');
  const [rejectModalProposal, setRejectModalProposal] = useState(null);

  const filtered = useMemo(() => {
    return (proposals || []).filter((p) => {
      if (filter !== 'all' && p.status !== filter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const orgName = p.proposed_organization?.name?.toLowerCase() || '';
        const proposerName = p.proposer?.full_name?.toLowerCase() || '';
        const proposerEmail = p.proposer?.email?.toLowerCase() || '';
        if (!orgName.includes(q) && !proposerName.includes(q) && !proposerEmail.includes(q)) {
          return false;
        }
      }
      return true;
    });
  }, [proposals, filter, search]);

  const handleApprove = (p) => {
    if (confirm(`Approve organization application for "${p.proposed_organization?.name}"? This will activate the organization and grant co-admin role to ${p.proposer?.email}.`)) {
      onReview(p.id, 'approve');
    }
  };

  const handleRejectConfirm = (proposalId, reason) => {
    onReview(proposalId, 'reject', reason);
    setRejectModalProposal(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 4px', letterSpacing: '-0.02em' }}>
            Organization Applications Queue
          </h1>
          <p style={{ color: 'var(--fg-2)', fontSize: 13.5, margin: 0 }}>
            Every new organization or club creation request requires platform-admin review prior to activation.
          </p>
        </div>

        {/* Filter controls */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <div
            style={{
              display: 'inline-flex',
              padding: 3,
              borderRadius: 10,
              gap: 2,
              background: 'var(--bg-3)',
              border: '1px solid var(--line-2)',
            }}
          >
            {[
              { key: 'pending', label: 'Pending' },
              { key: 'approved', label: 'Approved' },
              { key: 'rejected', label: 'Rejected' },
              { key: 'all', label: 'All' },
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setFilter(tab.key)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 7,
                  border: 'none',
                  background: filter === tab.key ? 'var(--bg-2)' : 'transparent',
                  color: filter === tab.key ? 'var(--fg)' : 'var(--fg-3)',
                  fontSize: 12.5,
                  fontWeight: filter === tab.key ? 600 : 400,
                  cursor: 'pointer',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <input
            type="text"
            placeholder="Search by org or proposer…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="eventmesh-input"
            style={{ width: 220, padding: '7px 12px', fontSize: 12.5 }}
          />
        </div>
      </div>

      {loading && <div style={{ color: 'var(--fg-3)', padding: 24 }}>Loading proposals…</div>}

      {!loading && filtered.length === 0 && (
        <div
          style={{
            border: '1px dashed var(--line-2)',
            borderRadius: 14,
            padding: '48px 24px',
            textAlign: 'center',
            color: 'var(--fg-3)',
          }}
        >
          <div style={{ fontSize: 32, marginBottom: 12 }}>📭</div>
          <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--fg-2)' }}>No proposals in this view</div>
          <p style={{ fontSize: 13, marginTop: 4 }}>
            {filter === 'pending'
              ? 'All caught up! There are no pending organization requests waiting for review.'
              : 'Try adjusting your search or status filter.'}
          </p>
        </div>
      )}

      {/* Proposal Cards List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {filtered.map((p) => {
          const isPending = p.status === 'pending';
          const isBusy = busyId === p.id;

          return (
            <div
              key={p.id}
              style={{
                background: 'var(--bg-2)',
                border: isPending ? '1px solid rgba(255, 184, 77, 0.35)' : '1px solid var(--line)',
                borderRadius: 14,
                padding: '20px 22px',
                display: 'flex',
                flexDirection: 'column',
                gap: 14,
                transition: 'border-color 0.2s',
              }}
            >
              {/* Header row: Org name, status, actions */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  {p.proposed_organization?.avatar_url ? (
                    <img
                      src={p.proposed_organization.avatar_url}
                      alt={p.proposed_organization?.name}
                      style={{ width: 44, height: 44, borderRadius: 10, objectFit: 'cover' }}
                    />
                  ) : (
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 10,
                        background: 'var(--bg-3)',
                        border: '1px solid var(--line-2)',
                        display: 'grid',
                        placeItems: 'center',
                        fontSize: 18,
                        fontWeight: 700,
                        color: 'var(--accent)',
                      }}
                    >
                      {p.proposed_organization?.name?.charAt(0) || 'O'}
                    </div>
                  )}

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>
                        {p.proposed_organization?.name}
                      </h3>
                      <StatusPill status={p.status} />
                    </div>
                    <div style={{ fontSize: 12.5, color: 'var(--fg-3)', marginTop: 3 }}>
                      Slug: <code className="mono" style={{ color: 'var(--fg-2)' }}>{p.proposed_organization?.slug}</code>
                      {p.proposed_organization?.type && (
                        <span> · Type: <strong style={{ color: 'var(--fg-2)' }}>{p.proposed_organization.type}</strong></span>
                      )}
                      {p.parent_organization && (
                        <span> · Hierarchy: Sub-organization of <strong style={{ color: 'var(--fg-2)' }}>{p.parent_organization.name}</strong></span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions for pending items */}
                {isPending && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <button
                      type="button"
                      onClick={() => setRejectModalProposal(p)}
                      disabled={isBusy}
                      style={{
                        padding: '8px 14px',
                        borderRadius: 8,
                        background: 'transparent',
                        border: '1px solid rgba(255, 107, 107, 0.45)',
                        color: '#ff6b6b',
                        fontSize: 12.5,
                        fontWeight: 600,
                        cursor: isBusy ? 'not-allowed' : 'pointer',
                      }}
                    >
                      Reject…
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApprove(p)}
                      disabled={isBusy}
                      style={{
                        padding: '8px 16px',
                        borderRadius: 8,
                        background: '#4ade80',
                        color: '#000',
                        border: 'none',
                        fontSize: 12.5,
                        fontWeight: 700,
                        cursor: isBusy ? 'not-allowed' : 'pointer',
                      }}
                    >
                      {isBusy ? 'Approving…' : 'Approve'}
                    </button>
                  </div>
                )}
              </div>

              {/* Applicant & metadata info */}
              <div
                style={{
                  display: 'flex',
                  gap: 20,
                  fontSize: 12.5,
                  color: 'var(--fg-2)',
                  flexWrap: 'wrap',
                  background: 'var(--bg)',
                  padding: '10px 14px',
                  borderRadius: 10,
                  border: '1px solid var(--line)',
                }}
              >
                <div>
                  <span style={{ color: 'var(--fg-3)' }}>Applicant:</span>{' '}
                  <strong style={{ color: 'var(--fg)' }}>{p.proposer?.full_name || 'Member'}</strong>{' '}
                  ({p.proposer?.email})
                </div>
                {p.proposer?.institution_name && (
                  <div>
                    <span style={{ color: 'var(--fg-3)' }}>Institution:</span>{' '}
                    <strong style={{ color: 'var(--fg)' }}>{p.proposer.institution_name}</strong>
                  </div>
                )}
                <div>
                  <span style={{ color: 'var(--fg-3)' }}>Submitted:</span>{' '}
                  {formatDateTime(p.created_at)}
                </div>
                {p.reviewed_at && (
                  <div>
                    <span style={{ color: 'var(--fg-3)' }}>Reviewed:</span>{' '}
                    {formatDateTime(p.reviewed_at)}
                  </div>
                )}
              </div>

              {/* Applicant's Reason / Statement */}
              {p.reason && (
                <div style={{ fontSize: 13, color: 'var(--fg-2)', lineHeight: 1.5 }}>
                  <div style={{ fontSize: 11, color: 'var(--fg-3)', textTransform: 'uppercase', marginBottom: 3, fontWeight: 600 }}>
                    Applicant Proposal Statement:
                  </div>
                  <div style={{ fontStyle: 'italic', color: 'var(--fg)' }}>
                    &ldquo;{p.reason}&rdquo;
                  </div>
                </div>
              )}

              {/* Rejection Review Reason (if rejected) */}
              {p.status === 'rejected' && p.review_reason && (
                <div
                  style={{
                    padding: '10px 14px',
                    borderRadius: 8,
                    background: 'rgba(255, 107, 107, 0.08)',
                    border: '1px solid rgba(255, 107, 107, 0.25)',
                    fontSize: 13,
                    color: '#ff6b6b',
                  }}
                >
                  <div style={{ fontSize: 11, textTransform: 'uppercase', fontWeight: 700, marginBottom: 2 }}>
                    Admin Rejection Reason:
                  </div>
                  {p.review_reason}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Reject Modal */}
      {rejectModalProposal && (
        <RejectModal
          proposal={rejectModalProposal}
          onClose={() => setRejectModalProposal(null)}
          onConfirm={handleRejectConfirm}
          busy={busyId === rejectModalProposal.id}
        />
      )}
    </div>
  );
}

// ── Institution Verification Modals ──────────────────────────────────────────

function VerifyInstitutionModal({ organization, onClose, onConfirm, busy }) {
  const [domainInput, setDomainInput] = useState(
    (organization?.institution_domains || []).join(', ')
  );
  const [error, setError] = useState('');

  if (!organization) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const rawDomains = domainInput
      .split(',')
      .map((d) => d.trim().toLowerCase())
      .filter(Boolean);

    if (rawDomains.length === 0) {
      setError('Please provide at least one domain (e.g., mit.edu, cs.mit.edu) for institution verification.');
      return;
    }
    onConfirm(organization.slug, rawDomains);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        background: 'rgba(0, 0, 0, 0.72)',
        backdropFilter: 'blur(8px)',
        display: 'grid',
        placeItems: 'center',
        padding: 20,
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 540,
          background: 'var(--bg-2)',
          border: '1px solid var(--line-2)',
          borderRadius: 16,
          padding: 26,
          boxShadow: '0 20px 48px rgba(0, 0, 0, 0.4)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <span style={{ fontSize: 22 }}>🏛️</span>
          <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>
            {organization.is_institution ? 'Update Verified Domains' : 'Verify Institution & Claim Domains'}
          </h3>
        </div>

        <p style={{ fontSize: 13.5, color: 'var(--fg-2)', margin: '0 0 16px', lineHeight: 1.5 }}>
          Verifying <strong style={{ color: 'var(--fg)' }}>{organization.name}</strong> as an accredited institution.
          Verified domains are claimed atomically and bind student/faculty email accounts and sub-organizations exclusively to this institution.
        </p>

        <form onSubmit={handleSubmit}>
          <label style={{ display: 'block', marginBottom: 16 }}>
            <div style={{ fontSize: 12.5, fontWeight: 500, color: 'var(--fg)', marginBottom: 6 }}>
              Institution Domains (comma-separated) <span style={{ color: 'var(--accent)' }}>*</span>
            </div>
            <input
              type="text"
              value={domainInput}
              onChange={(e) => {
                setDomainInput(e.target.value);
                if (error) setError('');
              }}
              placeholder="e.g. stanford.edu, cs.stanford.edu"
              required
              className="eventmesh-input"
              style={{ width: '100%' }}
              autoFocus
            />
            <div style={{ fontSize: 11.5, color: 'var(--fg-3)', marginTop: 6 }}>
              Each domain will be exclusively claimed by this institution. Other organizations cannot claim the same domain.
            </div>
            {error && <div style={{ color: '#ff6b6b', fontSize: 12, marginTop: 6 }}>{error}</div>}
          </label>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <button
              type="button"
              onClick={onClose}
              disabled={busy}
              style={{
                padding: '9px 16px',
                borderRadius: 8,
                background: 'transparent',
                border: '1px solid var(--line-2)',
                color: 'var(--fg)',
                fontSize: 13,
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={busy}
              style={{
                padding: '9px 18px',
                borderRadius: 8,
                background: '#4ade80',
                color: '#000',
                border: 'none',
                fontWeight: 700,
                fontSize: 13,
                cursor: busy ? 'not-allowed' : 'pointer',
              }}
            >
              {busy ? 'Verifying…' : 'Confirm Verification'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function RejectInstitutionModal({ organization, onClose, onConfirm, busy }) {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  if (!organization) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanReason = reason.trim();
    if (!cleanReason) {
      setError('A rejection reason is required.');
      return;
    }
    onConfirm(organization.slug, cleanReason);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        background: 'rgba(0, 0, 0, 0.72)',
        backdropFilter: 'blur(8px)',
        display: 'grid',
        placeItems: 'center',
        padding: 20,
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 500,
          background: 'var(--bg-2)',
          border: '1px solid var(--line-2)',
          borderRadius: 16,
          padding: 26,
          boxShadow: '0 20px 48px rgba(0, 0, 0, 0.4)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <span style={{ fontSize: 20 }}>⚠️</span>
          <h3 style={{ margin: 0, fontSize: 17, fontWeight: 600 }}>Reject Institution Application</h3>
        </div>

        <p style={{ fontSize: 13.5, color: 'var(--fg-2)', margin: '0 0 16px', lineHeight: 1.5 }}>
          Rejecting institution status for <strong style={{ color: 'var(--fg)' }}>{organization.name}</strong>.
          The organization will remain an active community organization, but without accredited university status.
        </p>

        <form onSubmit={handleSubmit}>
          <label style={{ display: 'block', marginBottom: 16 }}>
            <div style={{ fontSize: 12.5, fontWeight: 500, color: 'var(--fg)', marginBottom: 6 }}>
              Rejection Reason <span style={{ color: '#ff6b6b' }}>*</span>
            </div>
            <textarea
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (error) setError('');
              }}
              rows={3}
              placeholder="Explain why institution accreditation could not be granted (e.g. invalid academic documentation, unofficial domain)..."
              required
              className="eventmesh-input"
              style={{ width: '100%', resize: 'vertical' }}
              autoFocus
            />
            {error && <div style={{ color: '#ff6b6b', fontSize: 12, marginTop: 6 }}>{error}</div>}
          </label>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <button
              type="button"
              onClick={onClose}
              disabled={busy}
              style={{
                padding: '9px 16px',
                borderRadius: 8,
                background: 'transparent',
                border: '1px solid var(--line-2)',
                color: 'var(--fg)',
                fontSize: 13,
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={busy || !reason.trim()}
              style={{
                padding: '9px 18px',
                borderRadius: 8,
                background: '#ff6b6b',
                color: '#fff',
                border: 'none',
                fontWeight: 600,
                fontSize: 13,
                cursor: busy || !reason.trim() ? 'not-allowed' : 'pointer',
              }}
            >
              {busy ? 'Rejecting…' : 'Confirm Rejection'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function RevokeInstitutionModal({ organization, onClose, onConfirm, busy }) {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  if (!organization) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanReason = reason.trim();
    if (!cleanReason) {
      setError('A reason is required to revoke institution verification.');
      return;
    }
    onConfirm(organization.slug, cleanReason);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        background: 'rgba(0, 0, 0, 0.72)',
        backdropFilter: 'blur(8px)',
        display: 'grid',
        placeItems: 'center',
        padding: 20,
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 500,
          background: 'var(--bg-2)',
          border: '1px solid var(--line-2)',
          borderRadius: 16,
          padding: 26,
          boxShadow: '0 20px 48px rgba(0, 0, 0, 0.4)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <span style={{ fontSize: 20 }}>🛑</span>
          <h3 style={{ margin: 0, fontSize: 17, fontWeight: 600 }}>Revoke Institution Status</h3>
        </div>

        <p style={{ fontSize: 13.5, color: 'var(--fg-2)', margin: '0 0 16px', lineHeight: 1.5 }}>
          Revoking institution verification from <strong style={{ color: 'var(--fg)' }}>{organization.name}</strong>.
          This will release all currently claimed domains (<code>{(organization.institution_domains || []).join(', ')}</code>)
          and remove the accredited institution badge.
        </p>

        <form onSubmit={handleSubmit}>
          <label style={{ display: 'block', marginBottom: 16 }}>
            <div style={{ fontSize: 12.5, fontWeight: 500, color: 'var(--fg)', marginBottom: 6 }}>
              Revocation Reason <span style={{ color: '#ff6b6b' }}>*</span>
            </div>
            <textarea
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (error) setError('');
              }}
              rows={3}
              placeholder="State the reason for revoking institution accreditation..."
              required
              className="eventmesh-input"
              style={{ width: '100%', resize: 'vertical' }}
              autoFocus
            />
            {error && <div style={{ color: '#ff6b6b', fontSize: 12, marginTop: 6 }}>{error}</div>}
          </label>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <button
              type="button"
              onClick={onClose}
              disabled={busy}
              style={{
                padding: '9px 16px',
                borderRadius: 8,
                background: 'transparent',
                border: '1px solid var(--line-2)',
                color: 'var(--fg)',
                fontSize: 13,
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={busy || !reason.trim()}
              style={{
                padding: '9px 18px',
                borderRadius: 8,
                background: '#ef4444',
                color: '#fff',
                border: 'none',
                fontWeight: 600,
                fontSize: 13,
                cursor: busy || !reason.trim() ? 'not-allowed' : 'pointer',
              }}
            >
              {busy ? 'Revoking…' : 'Revoke Accreditation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Withdrawal Modals ───────────────────────────────────────────────────────

function RejectWithdrawalModal({ withdrawal, onClose, onConfirm, busy }) {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  if (!withdrawal) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanReason = reason.trim();
    if (!cleanReason) {
      setError('A rejection reason is required so the organizer knows why funds were not disbursed.');
      return;
    }
    onConfirm(withdrawal.id, { action: 'reject', reason: cleanReason });
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        background: 'rgba(0, 0, 0, 0.72)',
        backdropFilter: 'blur(8px)',
        display: 'grid',
        placeItems: 'center',
        padding: 20,
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 520,
          background: 'var(--bg-2)',
          border: '1px solid var(--line-2)',
          borderRadius: 16,
          padding: 26,
          boxShadow: '0 20px 48px rgba(0, 0, 0, 0.4)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <span style={{ fontSize: 20 }}>⚠️</span>
          <h3 style={{ margin: 0, fontSize: 17, fontWeight: 600 }}>Reject Withdrawal Request</h3>
        </div>

        <p style={{ fontSize: 13.5, color: 'var(--fg-2)', margin: '0 0 16px', lineHeight: 1.5 }}>
          Rejecting withdrawal request of <strong style={{ color: 'var(--fg)' }}>₹{((withdrawal.amount_cents || 0) / 100).toLocaleString()}</strong> for{' '}
          <strong style={{ color: 'var(--fg)' }}>{withdrawal.organization?.name}</strong>.
          The reserved funds will be immediately released back into the organization’s available balance.
        </p>

        <form onSubmit={handleSubmit}>
          <label style={{ display: 'block', marginBottom: 16 }}>
            <div style={{ fontSize: 12.5, fontWeight: 500, color: 'var(--fg)', marginBottom: 6 }}>
              Rejection Reason <span style={{ color: '#ff6b6b' }}>*</span>
            </div>
            <textarea
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (error) setError('');
              }}
              rows={3}
              placeholder="State the rejection reason (e.g. pending event disputes, incorrect beneficiary name)..."
              required
              className="eventmesh-input"
              style={{ width: '100%', resize: 'vertical' }}
              autoFocus
            />
            {error && <div style={{ color: '#ff6b6b', fontSize: 12, marginTop: 6 }}>{error}</div>}
          </label>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <button
              type="button"
              onClick={onClose}
              disabled={busy}
              style={{
                padding: '9px 16px',
                borderRadius: 8,
                background: 'transparent',
                border: '1px solid var(--line-2)',
                color: 'var(--fg)',
                fontSize: 13,
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={busy || !reason.trim()}
              style={{
                padding: '9px 18px',
                borderRadius: 8,
                background: '#ff6b6b',
                color: '#fff',
                border: 'none',
                fontWeight: 600,
                fontSize: 13,
                cursor: busy || !reason.trim() ? 'not-allowed' : 'pointer',
              }}
            >
              {busy ? 'Rejecting…' : 'Confirm Rejection'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function RecordTransferModal({ withdrawal, onClose, onConfirm, busy }) {
  const [transferRef, setTransferRef] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  if (!withdrawal) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanRef = transferRef.trim();
    if (!cleanRef) {
      setError('A bank transfer reference / UTR number is required to confirm disbursement.');
      return;
    }
    onConfirm(withdrawal.id, {
      action: 'record_transfer',
      transfer_reference: cleanRef,
      notes: notes.trim() || undefined,
    });
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        background: 'rgba(0, 0, 0, 0.72)',
        backdropFilter: 'blur(8px)',
        display: 'grid',
        placeItems: 'center',
        padding: 20,
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 520,
          background: 'var(--bg-2)',
          border: '1px solid var(--line-2)',
          borderRadius: 16,
          padding: 26,
          boxShadow: '0 20px 48px rgba(0, 0, 0, 0.4)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <span style={{ fontSize: 22 }}>💳</span>
          <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>Record Completed Bank Transfer</h3>
        </div>

        <p style={{ fontSize: 13.5, color: 'var(--fg-2)', margin: '0 0 16px', lineHeight: 1.5 }}>
          Disbursement of <strong style={{ color: '#4ade80' }}>₹{((withdrawal.amount_cents || 0) / 100).toLocaleString()}</strong> to{' '}
          <strong style={{ color: 'var(--fg)' }}>{withdrawal.organization?.name}</strong>.
          Destination: <code className="mono">{withdrawal.masked_bank_account}</code>.
        </p>

        <form onSubmit={handleSubmit}>
          <label style={{ display: 'block', marginBottom: 14 }}>
            <div style={{ fontSize: 12.5, fontWeight: 500, color: 'var(--fg)', marginBottom: 6 }}>
              Bank Transfer Reference / UTR <span style={{ color: 'var(--accent)' }}>*</span>
            </div>
            <input
              type="text"
              value={transferRef}
              onChange={(e) => {
                setTransferRef(e.target.value);
                if (error) setError('');
              }}
              placeholder="e.g. CMS29481924820, UTR-HDFC-99214"
              required
              className="eventmesh-input"
              style={{ width: '100%' }}
              autoFocus
            />
            {error && <div style={{ color: '#ff6b6b', fontSize: 12, marginTop: 6 }}>{error}</div>}
          </label>

          <label style={{ display: 'block', marginBottom: 16 }}>
            <div style={{ fontSize: 12.5, fontWeight: 500, color: 'var(--fg)', marginBottom: 6 }}>
              Internal Notes (Optional)
            </div>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Paid via corporate netbanking IMPS batch #44"
              className="eventmesh-input"
              style={{ width: '100%' }}
            />
          </label>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <button
              type="button"
              onClick={onClose}
              disabled={busy}
              style={{
                padding: '9px 16px',
                borderRadius: 8,
                background: 'transparent',
                border: '1px solid var(--line-2)',
                color: 'var(--fg)',
                fontSize: 13,
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={busy}
              style={{
                padding: '9px 18px',
                borderRadius: 8,
                background: '#4ade80',
                color: '#000',
                border: 'none',
                fontWeight: 700,
                fontSize: 13,
                cursor: busy ? 'not-allowed' : 'pointer',
              }}
            >
              {busy ? 'Saving…' : 'Confirm & Mark Paid'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── 3. University & Institution Verification View ───────────────────────────

function InstitutionsView({ institutions, loading, onVerify, onReject, onRevoke, busyId }) {
  const [filter, setFilter] = useState('candidates');
  const [search, setSearch] = useState('');
  const [verifyModalOrg, setVerifyModalOrg] = useState(null);
  const [rejectModalOrg, setRejectModalOrg] = useState(null);
  const [revokeModalOrg, setRevokeModalOrg] = useState(null);

  const filtered = useMemo(() => {
    return (institutions || []).filter((item) => {
      if (filter === 'candidates' && item.is_institution) return false;
      if (filter === 'verified' && !item.is_institution) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const name = item.name?.toLowerCase() || '';
        const slug = item.slug?.toLowerCase() || '';
        const domains = (item.institution_domains || []).join(' ').toLowerCase();
        if (!name.includes(q) && !slug.includes(q) && !domains.includes(q)) return false;
      }
      return true;
    });
  }, [institutions, filter, search]);

  const handleVerifyConfirm = (slug, domains) => {
    onVerify(slug, domains);
    setVerifyModalOrg(null);
  };

  const handleRejectConfirm = (slug, reason) => {
    onReject(slug, reason);
    setRejectModalOrg(null);
  };

  const handleRevokeConfirm = (slug, reason) => {
    onRevoke(slug, reason);
    setRevokeModalOrg(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 4px', letterSpacing: '-0.02em' }}>
            University & Institution Verification
          </h1>
          <p style={{ color: 'var(--fg-2)', fontSize: 13.5, margin: 0 }}>
            Accredit university organizations and atomically claim academic email domains across EventMesh.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <div
            style={{
              display: 'inline-flex',
              padding: 3,
              borderRadius: 10,
              gap: 2,
              background: 'var(--bg-3)',
              border: '1px solid var(--line-2)',
            }}
          >
            {[
              { key: 'candidates', label: 'Candidates & Requests' },
              { key: 'verified', label: 'Verified Institutions' },
              { key: 'all', label: 'All' },
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setFilter(tab.key)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 7,
                  border: 'none',
                  background: filter === tab.key ? 'var(--bg-2)' : 'transparent',
                  color: filter === tab.key ? 'var(--fg)' : 'var(--fg-3)',
                  fontSize: 12.5,
                  fontWeight: filter === tab.key ? 600 : 400,
                  cursor: 'pointer',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <input
            type="text"
            placeholder="Search by name, slug, or domain…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="eventmesh-input"
            style={{ width: 220, padding: '7px 12px', fontSize: 12.5 }}
          />
        </div>
      </div>

      {loading && <div style={{ color: 'var(--fg-3)', padding: 24 }}>Loading institutions…</div>}

      {!loading && filtered.length === 0 && (
        <div
          style={{
            border: '1px dashed var(--line-2)',
            borderRadius: 14,
            padding: '48px 24px',
            textAlign: 'center',
            color: 'var(--fg-3)',
          }}
        >
          <div style={{ fontSize: 32, marginBottom: 12 }}>🏛️</div>
          <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--fg-2)' }}>No institutions in this view</div>
          <p style={{ fontSize: 13, marginTop: 4 }}>
            {filter === 'candidates'
              ? 'No pending institution candidates waiting for accreditation.'
              : 'Try adjusting your search or tab filter.'}
          </p>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {filtered.map((item) => {
          const isVerified = Boolean(item.is_institution);
          const isBusy = busyId === item.slug;
          const domains = item.institution_domains || [];

          return (
            <div
              key={item.id}
              style={{
                background: 'var(--bg-2)',
                border: isVerified ? '1px solid rgba(74, 222, 128, 0.35)' : '1px solid var(--line)',
                borderRadius: 14,
                padding: '20px 22px',
                display: 'flex',
                flexDirection: 'column',
                gap: 14,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  {item.avatar_url ? (
                    <img
                      src={item.avatar_url}
                      alt={item.name}
                      style={{ width: 44, height: 44, borderRadius: 10, objectFit: 'cover' }}
                    />
                  ) : (
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 10,
                        background: 'var(--bg-3)',
                        border: '1px solid var(--line-2)',
                        display: 'grid',
                        placeItems: 'center',
                        fontSize: 18,
                        fontWeight: 700,
                        color: 'var(--accent)',
                      }}
                    >
                      {item.name?.charAt(0) || 'U'}
                    </div>
                  )}

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>{item.name}</h3>
                      <StatusPill status={isVerified ? 'verified' : 'pending'} />
                    </div>
                    <div style={{ fontSize: 12.5, color: 'var(--fg-3)', marginTop: 3 }}>
                      Slug: <code className="mono" style={{ color: 'var(--fg-2)' }}>{item.slug}</code>
                      <span> · Declared Type: <strong style={{ color: 'var(--fg-2)' }}>{item.type || 'community'}</strong></span>
                      {item.parent_name && <span> · Under: <strong style={{ color: 'var(--fg-2)' }}>{item.parent_name}</strong></span>}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {!isVerified ? (
                    <>
                      <button
                        type="button"
                        onClick={() => setRejectModalOrg(item)}
                        disabled={isBusy}
                        style={{
                          padding: '8px 14px',
                          borderRadius: 8,
                          background: 'transparent',
                          border: '1px solid rgba(255, 107, 107, 0.45)',
                          color: '#ff6b6b',
                          fontSize: 12.5,
                          fontWeight: 600,
                          cursor: isBusy ? 'not-allowed' : 'pointer',
                        }}
                      >
                        Reject…
                      </button>
                      <button
                        type="button"
                        onClick={() => setVerifyModalOrg(item)}
                        disabled={isBusy}
                        style={{
                          padding: '8px 16px',
                          borderRadius: 8,
                          background: '#4ade80',
                          color: '#000',
                          border: 'none',
                          fontSize: 12.5,
                          fontWeight: 700,
                          cursor: isBusy ? 'not-allowed' : 'pointer',
                        }}
                      >
                        {isBusy ? 'Saving…' : 'Verify & Claim Domains…'}
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => setVerifyModalOrg(item)}
                        disabled={isBusy}
                        style={{
                          padding: '7px 13px',
                          borderRadius: 8,
                          background: 'var(--bg-3)',
                          border: '1px solid var(--line-2)',
                          color: 'var(--fg-2)',
                          fontSize: 12,
                          cursor: isBusy ? 'not-allowed' : 'pointer',
                        }}
                      >
                        Update Domains…
                      </button>
                      <button
                        type="button"
                        onClick={() => setRevokeModalOrg(item)}
                        disabled={isBusy}
                        style={{
                          padding: '7px 13px',
                          borderRadius: 8,
                          background: 'transparent',
                          border: '1px solid rgba(239, 68, 68, 0.45)',
                          color: '#ef4444',
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: isBusy ? 'not-allowed' : 'pointer',
                        }}
                      >
                        Revoke Status…
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Claimed Domains */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  flexWrap: 'wrap',
                  background: 'var(--bg)',
                  padding: '10px 14px',
                  borderRadius: 10,
                  border: '1px solid var(--line)',
                  fontSize: 12.5,
                }}
              >
                <span style={{ color: 'var(--fg-3)', fontWeight: 600, textTransform: 'uppercase', fontSize: 11 }}>
                  Claimed Domains:
                </span>
                {domains.length === 0 ? (
                  <span style={{ color: 'var(--fg-3)', fontStyle: 'italic' }}>None claimed yet</span>
                ) : (
                  domains.map((dom) => (
                    <span
                      key={dom}
                      className="mono"
                      style={{
                        padding: '2px 8px',
                        borderRadius: 6,
                        background: 'rgba(0, 214, 255, 0.1)',
                        border: '1px solid rgba(0, 214, 255, 0.3)',
                        color: 'var(--accent)',
                        fontSize: 11.5,
                      }}
                    >
                      @{dom}
                    </span>
                  ))
                )}
              </div>

              {/* Verification / Rejection Info */}
              {isVerified && item.institution_verified_at && (
                <div style={{ fontSize: 12, color: 'var(--fg-3)' }}>
                  Verified by admin on <strong style={{ color: 'var(--fg-2)' }}>{formatDateTime(item.institution_verified_at)}</strong>
                </div>
              )}

              {!isVerified && item.institution_rejection_reason && (
                <div
                  style={{
                    padding: '8px 12px',
                    borderRadius: 8,
                    background: 'rgba(255, 107, 107, 0.08)',
                    border: '1px solid rgba(255, 107, 107, 0.25)',
                    fontSize: 12.5,
                    color: '#ff6b6b',
                  }}
                >
                  <strong style={{ textTransform: 'uppercase', fontSize: 10.5 }}>Rejection Reason:</strong>{' '}
                  {item.institution_rejection_reason}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {verifyModalOrg && (
        <VerifyInstitutionModal
          organization={verifyModalOrg}
          onClose={() => setVerifyModalOrg(null)}
          onConfirm={handleVerifyConfirm}
          busy={busyId === verifyModalOrg.slug}
        />
      )}

      {rejectModalOrg && (
        <RejectInstitutionModal
          organization={rejectModalOrg}
          onClose={() => setRejectModalOrg(null)}
          onConfirm={handleRejectConfirm}
          busy={busyId === rejectModalOrg.slug}
        />
      )}

      {revokeModalOrg && (
        <RevokeInstitutionModal
          organization={revokeModalOrg}
          onClose={() => setRevokeModalOrg(null)}
          onConfirm={handleRevokeConfirm}
          busy={busyId === revokeModalOrg.slug}
        />
      )}
    </div>
  );
}

// ── 4. Organizer Withdrawals Review Queue View ──────────────────────────────

function WithdrawalsQueueView({ withdrawals, loading, onReview, busyId }) {
  const [filter, setFilter] = useState('pending');
  const [search, setSearch] = useState('');
  const [rejectModalWd, setRejectModalWd] = useState(null);
  const [recordModalWd, setRecordModalWd] = useState(null);

  const filtered = useMemo(() => {
    return (withdrawals || []).filter((w) => {
      if (filter !== 'all' && w.status !== filter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const orgName = w.organization?.name?.toLowerCase() || '';
        const email = w.requester?.email?.toLowerCase() || '';
        const ref = w.transfer_reference?.toLowerCase() || '';
        if (!orgName.includes(q) && !email.includes(q) && !ref.includes(q)) return false;
      }
      return true;
    });
  }, [withdrawals, filter, search]);

  const handleApprove = (wd) => {
    if (confirm(`Approve withdrawal of ₹${((wd.amount_cents || 0) / 100).toLocaleString()} for ${wd.organization?.name}? This will mark the request ready for bank transfer.`)) {
      onReview(wd.id, { action: 'approve' });
    }
  };

  const handleFail = (wd) => {
    const reason = prompt(`Provide failure reason for withdrawal #${wd.id}:`);
    if (reason && reason.trim()) {
      onReview(wd.id, { action: 'fail', reason: reason.trim() });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 4px', letterSpacing: '-0.02em' }}>
            Organizer Withdrawal Requests
          </h1>
          <p style={{ color: 'var(--fg-2)', fontSize: 13.5, margin: 0 }}>
            Review organizer payout requests, verify available ledger balances, and record completed bank disbursements.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <div
            style={{
              display: 'inline-flex',
              padding: 3,
              borderRadius: 10,
              gap: 2,
              background: 'var(--bg-3)',
              border: '1px solid var(--line-2)',
            }}
          >
            {[
              { key: 'pending', label: 'Pending' },
              { key: 'approved', label: 'Ready / Approved' },
              { key: 'paid', label: 'Paid' },
              { key: 'rejected', label: 'Rejected' },
              { key: 'all', label: 'All' },
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setFilter(tab.key)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 7,
                  border: 'none',
                  background: filter === tab.key ? 'var(--bg-2)' : 'transparent',
                  color: filter === tab.key ? 'var(--fg)' : 'var(--fg-3)',
                  fontSize: 12.5,
                  fontWeight: filter === tab.key ? 600 : 400,
                  cursor: 'pointer',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <input
            type="text"
            placeholder="Search by org, email, UTR…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="eventmesh-input"
            style={{ width: 220, padding: '7px 12px', fontSize: 12.5 }}
          />
        </div>
      </div>

      {loading && <div style={{ color: 'var(--fg-3)', padding: 24 }}>Loading withdrawal requests…</div>}

      {!loading && filtered.length === 0 && (
        <div
          style={{
            border: '1px dashed var(--line-2)',
            borderRadius: 14,
            padding: '48px 24px',
            textAlign: 'center',
            color: 'var(--fg-3)',
          }}
        >
          <div style={{ fontSize: 32, marginBottom: 12 }}>💳</div>
          <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--fg-2)' }}>No withdrawal requests in this view</div>
          <p style={{ fontSize: 13, marginTop: 4 }}>
            {filter === 'pending'
              ? 'All clear! There are no pending withdrawal requests awaiting review.'
              : 'Try adjusting your search or status filter.'}
          </p>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {filtered.map((wd) => {
          const isPending = wd.status === 'pending';
          const isReady = wd.status === 'approved' || wd.status === 'processing';
          const isBusy = busyId === wd.id;

          return (
            <div
              key={wd.id}
              style={{
                background: 'var(--bg-2)',
                border: isPending
                  ? '1px solid rgba(255, 184, 77, 0.35)'
                  : isReady
                  ? '1px solid rgba(0, 214, 255, 0.35)'
                  : '1px solid var(--line)',
                borderRadius: 14,
                padding: '20px 22px',
                display: 'flex',
                flexDirection: 'column',
                gap: 14,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>
                      {wd.organization?.name || 'Organization'}
                    </h3>
                    <StatusPill status={wd.status} />
                  </div>
                  <div style={{ fontSize: 12.5, color: 'var(--fg-3)', marginTop: 3 }}>
                    Slug: <code className="mono" style={{ color: 'var(--fg-2)' }}>{wd.organization?.slug}</code>
                    <span> · Requested by: <strong style={{ color: 'var(--fg-2)' }}>{wd.requester?.email}</strong></span>
                  </div>
                </div>

                {/* Amount & Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--fg)' }}>
                      ₹{((wd.amount_cents || 0) / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--fg-3)' }}>
                      Basis: ₹{((wd.available_balance_basis_cents || 0) / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </div>
                  </div>

                  {isPending && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <button
                        type="button"
                        onClick={() => setRejectModalWd(wd)}
                        disabled={isBusy}
                        style={{
                          padding: '8px 14px',
                          borderRadius: 8,
                          background: 'transparent',
                          border: '1px solid rgba(255, 107, 107, 0.45)',
                          color: '#ff6b6b',
                          fontSize: 12.5,
                          fontWeight: 600,
                          cursor: isBusy ? 'not-allowed' : 'pointer',
                        }}
                      >
                        Reject…
                      </button>
                      <button
                        type="button"
                        onClick={() => handleApprove(wd)}
                        disabled={isBusy}
                        style={{
                          padding: '8px 16px',
                          borderRadius: 8,
                          background: 'var(--accent)',
                          color: '#000',
                          border: 'none',
                          fontSize: 12.5,
                          fontWeight: 700,
                          cursor: isBusy ? 'not-allowed' : 'pointer',
                        }}
                      >
                        {isBusy ? 'Approving…' : 'Approve'}
                      </button>
                    </div>
                  )}

                  {isReady && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <button
                        type="button"
                        onClick={() => handleFail(wd)}
                        disabled={isBusy}
                        style={{
                          padding: '7px 12px',
                          borderRadius: 8,
                          background: 'transparent',
                          border: '1px solid rgba(239, 68, 68, 0.45)',
                          color: '#ef4444',
                          fontSize: 12,
                          cursor: isBusy ? 'not-allowed' : 'pointer',
                        }}
                      >
                        Fail…
                      </button>
                      <button
                        type="button"
                        onClick={() => setRecordModalWd(wd)}
                        disabled={isBusy}
                        style={{
                          padding: '8px 16px',
                          borderRadius: 8,
                          background: '#4ade80',
                          color: '#000',
                          border: 'none',
                          fontSize: 12.5,
                          fontWeight: 700,
                          cursor: isBusy ? 'not-allowed' : 'pointer',
                        }}
                      >
                        {isBusy ? 'Saving…' : 'Record Transfer / Mark Paid…'}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Masked destination info */}
              <div
                style={{
                  display: 'flex',
                  gap: 20,
                  fontSize: 12.5,
                  color: 'var(--fg-2)',
                  flexWrap: 'wrap',
                  background: 'var(--bg)',
                  padding: '10px 14px',
                  borderRadius: 10,
                  border: '1px solid var(--line)',
                }}
              >
                <div>
                  <span style={{ color: 'var(--fg-3)' }}>Destination:</span>{' '}
                  <code className="mono" style={{ color: 'var(--accent)', fontWeight: 600 }}>
                    {wd.masked_bank_account}
                  </code>
                </div>
                <div>
                  <span style={{ color: 'var(--fg-3)' }}>Requested:</span>{' '}
                  {formatDateTime(wd.created_at)}
                </div>
                {wd.reviewed_at && (
                  <div>
                    <span style={{ color: 'var(--fg-3)' }}>Reviewed:</span>{' '}
                    {formatDateTime(wd.reviewed_at)}
                  </div>
                )}
                {wd.completed_at && (
                  <div>
                    <span style={{ color: 'var(--fg-3)' }}>Completed:</span>{' '}
                    {formatDateTime(wd.completed_at)}
                  </div>
                )}
                {wd.transfer_reference && (
                  <div>
                    <span style={{ color: 'var(--fg-3)' }}>Transfer UTR:</span>{' '}
                    <code className="mono" style={{ color: '#4ade80', fontWeight: 700 }}>
                      {wd.transfer_reference}
                    </code>
                  </div>
                )}
              </div>

              {/* Decision reason if present */}
              {wd.decision_reason && (
                <div
                  style={{
                    padding: '8px 12px',
                    borderRadius: 8,
                    background: wd.status === 'rejected' ? 'rgba(255, 107, 107, 0.08)' : 'var(--bg)',
                    border: wd.status === 'rejected' ? '1px solid rgba(255, 107, 107, 0.25)' : '1px solid var(--line)',
                    fontSize: 12.5,
                    color: wd.status === 'rejected' ? '#ff6b6b' : 'var(--fg-2)',
                  }}
                >
                  <strong style={{ textTransform: 'uppercase', fontSize: 10.5 }}>Reviewer Note:</strong>{' '}
                  {wd.decision_reason}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {rejectModalWd && (
        <RejectWithdrawalModal
          withdrawal={rejectModalWd}
          onClose={() => setRejectModalWd(null)}
          onConfirm={(id, payload) => {
            onReview(id, payload);
            setRejectModalWd(null);
          }}
          busy={busyId === rejectModalWd.id}
        />
      )}

      {recordModalWd && (
        <RecordTransferModal
          withdrawal={recordModalWd}
          onClose={() => setRecordModalWd(null)}
          onConfirm={(id, payload) => {
            onReview(id, payload);
            setRecordModalWd(null);
          }}
          busy={busyId === recordModalWd.id}
        />
      )}
    </div>
  );
}

// ── 5. Directory & Immutable Platform Audit Log View ────────────────────────

function OrganizationsDirectoryView({ organizations, auditLogs, loading }) {
  const [activeTab, setActiveTab] = useState('directory'); // 'directory' | 'audit'
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredOrgs = useMemo(() => {
    return (organizations || []).filter((org) => {
      if (statusFilter !== 'all' && org.status !== statusFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const name = org.name?.toLowerCase() || '';
        const slug = org.slug?.toLowerCase() || '';
        const owner = org.owner_email?.toLowerCase() || '';
        if (!name.includes(q) && !slug.includes(q) && !owner.includes(q)) return false;
      }
      return true;
    });
  }, [organizations, statusFilter, search]);

  const filteredLogs = useMemo(() => {
    return (auditLogs || []).filter((log) => {
      if (search.trim()) {
        const q = search.toLowerCase();
        const act = log.action?.toLowerCase() || '';
        const entity = log.entity_type?.toLowerCase() || '';
        const email = log.actor_email?.toLowerCase() || '';
        if (!act.includes(q) && !entity.includes(q) && !email.includes(q)) return false;
      }
      return true;
    });
  }, [auditLogs, search]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 4px', letterSpacing: '-0.02em' }}>
            {activeTab === 'directory' ? 'Organizations Registry' : 'Platform Admin Audit Trail'}
          </h1>
          <p style={{ color: 'var(--fg-2)', fontSize: 13.5, margin: 0 }}>
            {activeTab === 'directory'
              ? 'Hierarchical directory of all root, institution, club, and community organizations across EventMesh.'
              : 'Immutable platform-level log of all administrative decisions, verifications, and financial transfers.'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <div
            style={{
              display: 'inline-flex',
              padding: 3,
              borderRadius: 10,
              gap: 2,
              background: 'var(--bg-3)',
              border: '1px solid var(--line-2)',
            }}
          >
            <button
              type="button"
              onClick={() => setActiveTab('directory')}
              style={{
                padding: '6px 14px',
                borderRadius: 7,
                border: 'none',
                background: activeTab === 'directory' ? 'var(--bg-2)' : 'transparent',
                color: activeTab === 'directory' ? 'var(--fg)' : 'var(--fg-3)',
                fontSize: 12.5,
                fontWeight: activeTab === 'directory' ? 600 : 400,
                cursor: 'pointer',
              }}
            >
              Directory ({organizations?.length || 0})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('audit')}
              style={{
                padding: '6px 14px',
                borderRadius: 7,
                border: 'none',
                background: activeTab === 'audit' ? 'var(--bg-2)' : 'transparent',
                color: activeTab === 'audit' ? 'var(--fg)' : 'var(--fg-3)',
                fontSize: 12.5,
                fontWeight: activeTab === 'audit' ? 600 : 400,
                cursor: 'pointer',
              }}
            >
              Audit Log ({auditLogs?.length || 0})
            </button>
          </div>

          {activeTab === 'directory' && (
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="eventmesh-input"
              style={{ width: 140, padding: '7px 12px', fontSize: 12.5 }}
            >
              <option value="all">All Statuses</option>
              <option value="verified">Verified Only</option>
              <option value="pending">Pending Only</option>
              <option value="rejected">Rejected Only</option>
            </select>
          )}

          <input
            type="text"
            placeholder={activeTab === 'directory' ? 'Search orgs…' : 'Search audit logs…'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="eventmesh-input"
            style={{ width: 220, padding: '7px 12px', fontSize: 12.5 }}
          />
        </div>
      </div>

      {loading && <div style={{ color: 'var(--fg-3)', padding: 24 }}>Loading registry & logs…</div>}

      {/* Directory Tab Content */}
      {!loading && activeTab === 'directory' && (
        <div
          style={{
            background: 'var(--bg-2)',
            border: '1px solid var(--line)',
            borderRadius: 14,
            overflow: 'hidden',
          }}
        >
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--line)', color: 'var(--fg-3)', fontSize: 11.5 }}>
                <th style={{ padding: '14px 18px', fontWeight: 600 }}>Organization</th>
                <th style={{ padding: '14px 18px', fontWeight: 600 }}>Hierarchy</th>
                <th style={{ padding: '14px 18px', fontWeight: 600 }}>Type</th>
                <th style={{ padding: '14px 18px', fontWeight: 600 }}>Status</th>
                <th style={{ padding: '14px 18px', fontWeight: 600 }}>Owner / Admin</th>
                <th style={{ padding: '14px 18px', fontWeight: 600, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrgs.map((org) => {
                const isRoot = org.is_platform_root || org.slug === 'eventmesh';

                return (
                  <tr
                    key={org.id}
                    style={{
                      borderBottom: '1px solid var(--line)',
                      background: isRoot ? 'rgba(0, 214, 255, 0.03)' : 'transparent',
                    }}
                  >
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        {isRoot ? (
                          <span style={{ fontSize: 18 }}>👑</span>
                        ) : org.avatar_url ? (
                          <img
                            src={org.avatar_url}
                            alt=""
                            style={{ width: 28, height: 28, borderRadius: 6, objectFit: 'cover' }}
                          />
                        ) : (
                          <div
                            style={{
                              width: 28,
                              height: 28,
                              borderRadius: 6,
                              background: 'var(--bg-3)',
                              display: 'grid',
                              placeItems: 'center',
                              fontSize: 12,
                              fontWeight: 700,
                            }}
                          >
                            {org.name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--fg)' }}>{org.name}</div>
                          <div className="mono" style={{ fontSize: 11, color: 'var(--fg-3)' }}>
                            {org.slug}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td style={{ padding: '14px 18px' }}>
                      {isRoot ? (
                        <span
                          className="mono"
                          style={{
                            fontSize: 10.5,
                            color: 'var(--accent)',
                            fontWeight: 700,
                            letterSpacing: '0.06em',
                          }}
                        >
                          Apex Root
                        </span>
                      ) : org.parent_name ? (
                        <span style={{ color: 'var(--fg-2)', fontSize: 12.5 }}>
                          ↳ {org.parent_name}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--fg-3)', fontSize: 12 }}>None (Top Level)</span>
                      )}
                    </td>

                    <td style={{ padding: '14px 18px', color: 'var(--fg-2)' }}>
                      {org.is_institution ? (
                        <span style={{ color: 'var(--accent)', fontWeight: 500 }}>Institution</span>
                      ) : (
                        org.type || 'community'
                      )}
                    </td>

                    <td style={{ padding: '14px 18px' }}>
                      <StatusPill status={org.status} />
                    </td>

                    <td style={{ padding: '14px 18px', color: 'var(--fg-2)', fontSize: 12.5 }}>
                      {org.owner_email || '—'}
                    </td>

                    <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                      {org.status === 'verified' && (
                        <Link
                          to={`/org/${org.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            fontSize: 12,
                            color: 'var(--accent)',
                            textDecoration: 'none',
                          }}
                        >
                          View ↗
                        </Link>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Audit Log Tab Content */}
      {!loading && activeTab === 'audit' && (
        <div
          style={{
            background: 'var(--bg-2)',
            border: '1px solid var(--line)',
            borderRadius: 14,
            overflow: 'hidden',
          }}
        >
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--line)', color: 'var(--fg-3)', fontSize: 11.5 }}>
                <th style={{ padding: '14px 18px', fontWeight: 600 }}>Timestamp</th>
                <th style={{ padding: '14px 18px', fontWeight: 600 }}>Actor</th>
                <th style={{ padding: '14px 18px', fontWeight: 600 }}>Action</th>
                <th style={{ padding: '14px 18px', fontWeight: 600 }}>Target Entity</th>
                <th style={{ padding: '14px 18px', fontWeight: 600 }}>Details & Metadata</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: 32, textAlign: 'center', color: 'var(--fg-3)' }}>
                    No audit records found.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const meta = log.safe_metadata || {};
                  return (
                    <tr key={log.id} style={{ borderBottom: '1px solid var(--line)' }}>
                      <td style={{ padding: '14px 18px', whiteSpace: 'nowrap', color: 'var(--fg-3)', fontSize: 12 }}>
                        {formatDateTime(log.created_at)}
                      </td>
                      <td style={{ padding: '14px 18px', color: 'var(--fg-2)', fontSize: 12.5 }}>
                        <span className="mono">{log.actor_email || log.actor_id}</span>
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <span
                          className="mono"
                          style={{
                            fontSize: 11,
                            padding: '3px 8px',
                            borderRadius: 6,
                            background: log.action?.includes('reject') || log.action?.includes('revoke') || log.action?.includes('fail')
                              ? 'rgba(255, 107, 107, 0.12)'
                              : log.action?.includes('paid') || log.action?.includes('verify') || log.action?.includes('approve')
                              ? 'rgba(74, 222, 128, 0.12)'
                              : 'var(--bg-3)',
                            color: log.action?.includes('reject') || log.action?.includes('revoke') || log.action?.includes('fail')
                              ? '#ff6b6b'
                              : log.action?.includes('paid') || log.action?.includes('verify') || log.action?.includes('approve')
                              ? '#4ade80'
                              : 'var(--accent)',
                            fontWeight: 600,
                          }}
                        >
                          {log.action}
                        </span>
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <span className="mono" style={{ fontSize: 12, color: 'var(--fg)' }}>
                          {log.entity_type} #{log.entity_id}
                        </span>
                      </td>
                      <td style={{ padding: '14px 18px', fontSize: 12, color: 'var(--fg-2)' }}>
                        {meta.reason && <span>Reason: &ldquo;{meta.reason}&rdquo; </span>}
                        {meta.transfer_reference && (
                          <span>UTR: <code className="mono" style={{ color: '#4ade80' }}>{meta.transfer_reference}</code> </span>
                        )}
                        {meta.amount_cents && (
                          <span>Amount: ₹{(meta.amount_cents / 100).toLocaleString()} </span>
                        )}
                        {meta.domains && Array.isArray(meta.domains) && (
                          <span>Domains: {meta.domains.join(', ')} </span>
                        )}
                        {meta.destination && <span>Dest: {meta.destination} </span>}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Main Admin Application Component ───────────────────────────────────────

export function AdminApp() {
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useProfile();

  const [overview, setOverview] = useState(null);
  const [proposals, setProposals] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [institutions, setInstitutions] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);

  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [notification, setNotification] = useState(null);

  const isSuperAdmin = profile?.role === 'super_admin';

  const reloadData = useCallback(async () => {
    if (!isAuthenticated || !isSuperAdmin) return;
    setLoading(true);
    try {
      const [ov, propRes, orgRes, instRes, wdRes, logRes] = await Promise.all([
        api.getAdminOverview().catch(() => null),
        api.listAdminProposals({ limit: 100 }).catch(() => ({ proposals: [] })),
        api.listAdminOrganizations({ limit: 100 }).catch(() => ({ organizations: [] })),
        api.listAdminInstitutions({ limit: 100 }).catch(() => ({ institutions: [] })),
        api.listAdminWithdrawals({ limit: 100 }).catch(() => ({ withdrawals: [] })),
        api.listAdminAuditLogs({ limit: 100 }).catch(() => ({ audit_logs: [] })),
      ]);
      setOverview(ov);
      setProposals(propRes?.proposals || []);
      setOrganizations(orgRes?.organizations || []);
      setInstitutions(instRes?.institutions || []);
      setWithdrawals(wdRes?.withdrawals || []);
      setAuditLogs(logRes?.audit_logs || []);
    } catch {
      // Ignored
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, isSuperAdmin]);

  useEffect(() => {
    if (isAuthenticated && isSuperAdmin) {
      reloadData();
    }
  }, [isAuthenticated, isSuperAdmin, reloadData]);

  const handleReviewProposal = async (proposalId, action, reason = null) => {
    setBusyId(proposalId);
    try {
      const payload = { action };
      if (reason) payload.reason = reason;
      await api.reviewAdminProposal(proposalId, payload);
      setNotification({
        type: 'success',
        text: `Proposal ${action === 'approve' ? 'approved' : 'rejected'} successfully.`,
      });
      setTimeout(() => setNotification(null), 4000);
      await reloadData();
    } catch (err) {
      setNotification({
        type: 'error',
        text: err.message || `Failed to ${action} proposal.`,
      });
      setTimeout(() => setNotification(null), 5000);
    } finally {
      setBusyId(null);
    }
  };

  const handleVerifyInstitution = async (slug, domains) => {
    setBusyId(slug);
    try {
      await api.verifyAdminInstitution(slug, { domains });
      setNotification({
        type: 'success',
        text: `Institution verified and ${domains.length} domain(s) claimed successfully.`,
      });
      setTimeout(() => setNotification(null), 4000);
      await reloadData();
    } catch (err) {
      setNotification({
        type: 'error',
        text: err.message || 'Failed to verify institution.',
      });
      setTimeout(() => setNotification(null), 5000);
    } finally {
      setBusyId(null);
    }
  };

  const handleRejectInstitution = async (slug, reason) => {
    setBusyId(slug);
    try {
      await api.rejectAdminInstitution(slug, { reason });
      setNotification({
        type: 'success',
        text: 'Institution application rejected.',
      });
      setTimeout(() => setNotification(null), 4000);
      await reloadData();
    } catch (err) {
      setNotification({
        type: 'error',
        text: err.message || 'Failed to reject institution.',
      });
      setTimeout(() => setNotification(null), 5000);
    } finally {
      setBusyId(null);
    }
  };

  const handleRevokeInstitution = async (slug, reason) => {
    setBusyId(slug);
    try {
      await api.revokeAdminInstitution(slug, { reason });
      setNotification({
        type: 'success',
        text: 'Institution status revoked and claimed domains released.',
      });
      setTimeout(() => setNotification(null), 4000);
      await reloadData();
    } catch (err) {
      setNotification({
        type: 'error',
        text: err.message || 'Failed to revoke institution status.',
      });
      setTimeout(() => setNotification(null), 5000);
    } finally {
      setBusyId(null);
    }
  };

  const handleReviewWithdrawal = async (withdrawalId, payload) => {
    setBusyId(withdrawalId);
    try {
      await api.reviewAdminWithdrawal(withdrawalId, payload);
      setNotification({
        type: 'success',
        text: `Withdrawal request updated to ${payload.action}.`,
      });
      setTimeout(() => setNotification(null), 4000);
      await reloadData();
    } catch (err) {
      setNotification({
        type: 'error',
        text: err.message || `Failed to review withdrawal.`,
      });
      setTimeout(() => setNotification(null), 5000);
    } finally {
      setBusyId(null);
    }
  };

  if (authLoading || profileLoading) {
    return (
      <Centered>
        <p style={{ color: 'var(--fg-2)', fontSize: 14 }}>Verifying admin authorization…</p>
      </Centered>
    );
  }

  if (!isAuthenticated) {
    return (
      <Centered>
        <span style={{ fontSize: 36, marginBottom: 12, display: 'block' }}>🛡️</span>
        <h2 style={{ margin: '0 0 10px', fontWeight: 700 }}>Platform Admin Sign-In</h2>
        <p style={{ color: 'var(--fg-2)', fontSize: 14, marginBottom: 20 }}>
          This area is restricted to EventMesh platform administrators. Sign in with your administrator account to proceed.
        </p>
        <Link
          to="/"
          style={{
            display: 'inline-block',
            padding: '10px 22px',
            borderRadius: 999,
            background: 'var(--accent)',
            color: '#000',
            fontWeight: 700,
            fontSize: 14,
            textDecoration: 'none',
          }}
        >
          Go to Sign In
        </Link>
      </Centered>
    );
  }

  if (!isSuperAdmin) {
    return (
      <Centered>
        <span style={{ fontSize: 40, marginBottom: 14, display: 'block' }}>🚫</span>
        <h2 style={{ margin: '0 0 10px', fontWeight: 700 }}>Access Denied</h2>
        <p style={{ color: 'var(--fg-2)', fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}>
          You do not have platform administrator privileges. This console is restricted to
          users with the <code className="mono" style={{ color: 'var(--accent)' }}>super_admin</code> role.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <Link
            to="/organizer"
            style={{
              padding: '9px 18px',
              borderRadius: 8,
              background: 'var(--bg-2)',
              border: '1px solid var(--line-2)',
              color: 'var(--fg)',
              textDecoration: 'none',
              fontSize: 13,
            }}
          >
            Organizer Dashboard
          </Link>
          <Link
            to="/"
            style={{
              padding: '9px 18px',
              borderRadius: 8,
              background: 'var(--accent)',
              color: '#000',
              fontWeight: 600,
              textDecoration: 'none',
              fontSize: 13,
            }}
          >
            Return Home
          </Link>
        </div>
      </Centered>
    );
  }

  const pendingCount = overview?.pending_proposals_count ?? proposals.filter((p) => p.status === 'pending').length;
  const pendingInstitutionsCount = overview?.pending_institutions_count ?? institutions.filter((i) => !i.is_institution && i.type === 'university').length;
  const pendingWithdrawalsCount = overview?.pending_withdrawals_count ?? withdrawals.filter((w) => w.status === 'pending').length;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--fg)' }}>
      <AdminTopBar
        pendingCount={pendingCount}
        pendingInstitutionsCount={pendingInstitutionsCount}
        pendingWithdrawalsCount={pendingWithdrawalsCount}
      />

      {notification && (
        <div
          style={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 90,
            padding: '12px 20px',
            borderRadius: 10,
            background: notification.type === 'error' ? '#ff6b6b' : '#4ade80',
            color: '#000',
            fontWeight: 600,
            fontSize: 13.5,
            boxShadow: '0 10px 24px rgba(0,0,0,0.3)',
          }}
        >
          {notification.text}
        </div>
      )}

      <main className="container" style={{ padding: '32px 32px 80px', maxWidth: 1100 }}>
        <Routes>
          <Route
            index
            element={
              <OverviewView
                overview={overview}
                onNavigateQueue={() => navigate('/admin/proposals')}
              />
            }
          />
          <Route
            path="proposals"
            element={
              <ProposalsQueueView
                proposals={proposals}
                loading={loading}
                onReview={handleReviewProposal}
                busyId={busyId}
              />
            }
          />
          <Route
            path="institutions"
            element={
              <InstitutionsView
                institutions={institutions}
                loading={loading}
                onVerify={handleVerifyInstitution}
                onReject={handleRejectInstitution}
                onRevoke={handleRevokeInstitution}
                busyId={busyId}
              />
            }
          />
          <Route
            path="withdrawals"
            element={
              <WithdrawalsQueueView
                withdrawals={withdrawals}
                loading={loading}
                onReview={handleReviewWithdrawal}
                busyId={busyId}
              />
            }
          />
          <Route
            path="organizations"
            element={
              <OrganizationsDirectoryView
                organizations={organizations}
                auditLogs={auditLogs}
                loading={loading}
              />
            }
          />
        </Routes>
      </main>
    </div>
  );
}

