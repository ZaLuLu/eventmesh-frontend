import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from './useAuth';
import { AuthModal } from './AuthModal';
import { api } from '../lib/apiClient';
import { LogoMark } from '../components/UIPrimitives';
import { Button } from '../organizer/components/fields';

export function InviteAcceptPage() {
  const { token } = useParams();
  const { isAuthenticated, user, loading } = useAuth();
  const navigate = useNavigate();

  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null); // { success: bool, message: string, role?: string, slug?: string }
  const [error, setError] = useState('');

  const handleAccept = async () => {
    setSubmitting(true);
    setError('');
    try {
      const res = await api.acceptInvitation(token);
      setResult({
        success: true,
        message: res.message || 'Invitation accepted successfully.',
        role: res.role,
        slug: res.organization_slug,
      });
    } catch (err) {
      setError(err.message || 'Failed to accept invitation.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--bg)',
        display: 'grid',
        placeItems: 'center',
        padding: 24,
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 460,
          background: 'var(--bg-2)',
          border: '1px solid var(--line-2)',
          borderRadius: 'var(--radius)',
          padding: '36px 32px',
          boxShadow: '0 24px 60px rgba(0,0,0,0.5)',
          textAlign: 'center',
        }}
      >
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, textDecoration: 'none', color: 'inherit', marginBottom: 24 }}>
          <LogoMark size={28} />
          <span style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.02em' }}>EventMesh</span>
        </Link>

        <h1 style={{ fontSize: 22, fontWeight: 600, margin: '0 0 10px', letterSpacing: '-0.01em' }}>
          Organization Invitation
        </h1>

        {loading ? (
          <p style={{ color: 'var(--fg-3)', fontSize: 14 }}>Loading account details…</p>
        ) : !isAuthenticated ? (
          <div>
            <p style={{ color: 'var(--fg-2)', fontSize: 14, lineHeight: 1.55, marginBottom: 24 }}>
              You&apos;ve received an invitation to join an organization on EventMesh. Sign in or create an account to accept.
            </p>
            <Button onClick={() => setModalOpen(true)} style={{ width: '100%' }}>
              Sign in / Sign up to accept
            </Button>
            <AuthModal open={modalOpen} onClose={() => setModalOpen(false)} />
          </div>
        ) : result?.success ? (
          <div>
            <div
              style={{
                background: 'rgba(74, 222, 128, 0.1)',
                border: '1px solid rgba(74, 222, 128, 0.3)',
                color: '#4ade80',
                padding: '16px 20px',
                borderRadius: 12,
                fontSize: 14,
                marginBottom: 24,
                lineHeight: 1.5,
              }}
            >
              🎉 {result.message}
              {result.role && (
                <div style={{ marginTop: 6, fontSize: 13, color: 'var(--fg)' }}>
                  Assigned role: <strong>{result.role}</strong>
                </div>
              )}
            </div>
            <Button
              onClick={() => navigate('/organizer')}
              style={{ width: '100%', marginBottom: 12 }}
            >
              Go to Organizer Dashboard →
            </Button>
            <Link to="/" style={{ fontSize: 13, color: 'var(--fg-3)', textDecoration: 'none' }}>
              Back to EventMesh
            </Link>
          </div>
        ) : (
          <div>
            <div
              style={{
                background: 'var(--bg-3)',
                border: '1px solid var(--line)',
                borderRadius: 10,
                padding: '12px 16px',
                marginBottom: 20,
                textAlign: 'left',
              }}
            >
              <div style={{ fontSize: 11, color: 'var(--fg-3)', textTransform: 'uppercase', letterSpacing: '0.08em' }} className="mono">
                Signed in as
              </div>
              <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--fg)', marginTop: 2 }}>
                {user?.email}
              </div>
            </div>

            <p style={{ color: 'var(--fg-2)', fontSize: 13.5, lineHeight: 1.55, marginBottom: 24 }}>
              Accepting this invitation will grant your account organizer access in the specified organization.
            </p>

            {error && (
              <div
                style={{
                  background: 'rgba(255, 107, 107, 0.1)',
                  border: '1px solid rgba(255, 107, 107, 0.3)',
                  color: '#ff6b6b',
                  padding: '12px 16px',
                  borderRadius: 10,
                  fontSize: 13,
                  marginBottom: 20,
                  textAlign: 'left',
                }}
              >
                {error}
              </div>
            )}

            <Button
              onClick={handleAccept}
              disabled={submitting}
              style={{ width: '100%', marginBottom: 14 }}
            >
              {submitting ? 'Accepting…' : 'Accept Invitation'}
            </Button>

            <Link to="/" style={{ fontSize: 13, color: 'var(--fg-3)', textDecoration: 'none' }}>
              Decline or return home
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
