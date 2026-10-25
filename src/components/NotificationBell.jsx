import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/apiClient';
import { useAuth } from '../auth/useAuth';

function formatRelativeTime(dateString) {
  if (!dateString) return '';
  const now = new Date();
  const date = new Date(dateString);
  const diffSec = Math.floor((now - date) / 1000);
  if (diffSec < 60) return 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}h ago`;
  const diffDays = Math.floor(diffHour / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function NotificationBell() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef(null);

  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const res = await api.listNotifications({ limit: 15 });
      setNotifications(res.items || []);
      setUnreadCount(res.unread_count ?? res.total_unread ?? 0);
    } catch {
      // non-blocking
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // 30s poll
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Close dropdown on outside click or escape
  useEffect(() => {
    if (!open) return;
    const handleClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    const handleKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open]);

  const handleMarkRead = async (id, e) => {
    e?.stopPropagation();
    try {
      await api.markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    setLoading(true);
    try {
      await api.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationClick = async (notif) => {
    if (!notif.is_read) {
      handleMarkRead(notif.id);
    }
    setOpen(false);
    if (notif.type === 'org_invitation' && notif.data?.token) {
      navigate(`/invite/${notif.data.token}`);
    } else if (notif.type === 'child_org_proposal') {
      navigate('/organizer/org');
    } else if (notif.type === 'proposal_approved' || notif.type === 'proposal_rejected') {
      navigate('/organizer');
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div ref={containerRef} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Notifications"
        style={{
          background: 'none',
          border: '1px solid var(--line-2)',
          borderRadius: 999,
          width: 36,
          height: 36,
          display: 'grid',
          placeItems: 'center',
          color: 'var(--fg)',
          cursor: 'pointer',
          position: 'relative',
          transition: 'border-color 0.2s',
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
        </svg>
        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: -3,
              right: -3,
              background: 'var(--accent)',
              color: '#000',
              fontSize: 10,
              fontWeight: 700,
              borderRadius: 999,
              padding: '1px 5px',
              minWidth: 16,
              textAlign: 'center',
              boxShadow: '0 0 10px var(--accent-glow)',
            }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            width: 340,
            maxHeight: 460,
            background: 'var(--bg-2)',
            border: '1px solid var(--line-2)',
            borderRadius: 'var(--radius)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
            zIndex: 100,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              padding: '12px 16px',
              borderBottom: '1px solid var(--line)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span style={{ fontSize: 13, fontWeight: 600 }}>Notifications</span>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                disabled={loading}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--accent)',
                  fontSize: 11.5,
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                Mark all read
              </button>
            )}
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '6px 0' }}>
            {notifications.length === 0 ? (
              <div style={{ padding: '36px 16px', textAlign: 'center', color: 'var(--fg-3)', fontSize: 13 }}>
                No notifications yet.
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleNotificationClick(n)}
                  style={{
                    padding: '10px 16px',
                    borderBottom: '1px solid var(--line)',
                    background: n.is_read ? 'transparent' : 'rgba(0, 214, 255, 0.04)',
                    cursor: 'pointer',
                    transition: 'background 0.15s',
                    display: 'flex',
                    gap: 10,
                    alignItems: 'flex-start',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-3)')}
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = n.is_read ? 'transparent' : 'rgba(0, 214, 255, 0.04)')
                  }
                >
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 999,
                      background: n.is_read ? 'transparent' : 'var(--accent)',
                      marginTop: 6,
                      flexShrink: 0,
                    }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 6 }}>
                      <span style={{ fontSize: 13, fontWeight: n.is_read ? 500 : 600, color: 'var(--fg)' }}>
                        {n.title}
                      </span>
                      <span className="mono" style={{ fontSize: 10.5, color: 'var(--fg-3)', flexShrink: 0 }}>
                        {formatRelativeTime(n.created_at)}
                      </span>
                    </div>
                    <p style={{ margin: '3px 0 0', fontSize: 12, color: 'var(--fg-2)', lineHeight: 1.4 }}>
                      {n.message}
                    </p>
                    {n.type === 'org_invitation' && n.data?.token && (
                      <span
                        style={{
                          display: 'inline-block',
                          marginTop: 6,
                          fontSize: 11,
                          color: 'var(--accent)',
                          fontWeight: 500,
                        }}
                      >
                        Accept invitation →
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
