import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { EventCard } from '../components/EventCard';
import { api } from '../lib/apiClient';
import { toCardEvent } from '../utils/adaptEvent';
import { useDocumentHead } from '../lib/seo';

export function OrganizationPublicPage() {
  const { slug } = useParams();
  const [data, setData] = useState(null); // OrganizationPublicRead
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    api.getPublicOrganization(slug)
      .then((res) => {
        if (!cancelled) {
          setData(res);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message || 'Organization not found.');
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  useDocumentHead({
    title: data ? `${data.name} · EventMesh` : 'Organization · EventMesh',
    description: data?.description || (data ? `Discover events hosted by ${data.name} on EventMesh.` : 'Organization on EventMesh'),
  });

  const cards = useMemo(() => {
    if (!data?.events) return [];
    return data.events.map((e) =>
      toCardEvent({
        ...e,
        kind: 'native',
        provider: 'eventmesh',
        venue: e.venue_name || e.city,
        is_online: e.is_online ?? (e.event_type === 'online'),
      })
    );
  }, [data?.events]);

  if (loading) {
    return (
      <>
        <Navbar />
        <main style={{ minHeight: '80vh', display: 'grid', placeItems: 'center', color: 'var(--fg-3)' }}>
          Loading organization details…
        </main>
        <Footer />
      </>
    );
  }

  if (error || !data) {
    return (
      <>
        <Navbar />
        <main style={{ minHeight: '80vh', display: 'grid', placeItems: 'center', padding: 24, textAlign: 'center' }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: 12 }}>Organization Not Found</h1>
            <p style={{ color: 'var(--fg-2)', fontSize: 14, marginBottom: 20 }}>
              The organization you are looking for does not exist or is not publicly available.
            </p>
            <Link to="/#discover" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 500 }}>
              ← Discover other events
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const initial = data.name.charAt(0).toUpperCase();

  return (
    <>
      <Navbar />
      <main style={{ minHeight: '85vh', padding: '100px 0 80px' }}>
        <div className="container" style={{ maxWidth: 1080 }}>
          {/* Hierarchy Breadcrumbs */}
          {data.hierarchy && data.hierarchy.length > 1 && (
            <nav
              aria-label="Organization hierarchy"
              style={{
                display: 'flex',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 8,
                marginBottom: 20,
                fontSize: 13,
                color: 'var(--fg-3)',
              }}
            >
              {data.hierarchy.map((crumb, idx) => {
                const isLast = idx === data.hierarchy.length - 1;
                return (
                  <React.Fragment key={crumb.id}>
                    {idx > 0 && <span>›</span>}
                    {isLast ? (
                      <span style={{ color: 'var(--fg)', fontWeight: 500 }}>{crumb.name}</span>
                    ) : (
                      <Link
                        to={`/org/${crumb.slug}`}
                        style={{ color: 'var(--fg-2)', textDecoration: 'none' }}
                        onMouseEnter={(e) => (e.target.style.color = 'var(--accent)')}
                        onMouseLeave={(e) => (e.target.style.color = 'var(--fg-2)')}
                      >
                        {crumb.name}
                      </Link>
                    )}
                  </React.Fragment>
                );
              })}
            </nav>
          )}

          {/* Org Header Card */}
          <div
            style={{
              background: 'var(--bg-2)',
              border: '1px solid var(--line-2)',
              borderRadius: 'var(--radius)',
              padding: '36px 32px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 24,
              flexWrap: 'wrap',
              marginBottom: 44,
            }}
          >
            {data.avatar_url ? (
              <img
                src={data.avatar_url}
                alt={data.name}
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 20,
                  objectFit: 'cover',
                  background: 'var(--bg-3)',
                  border: '1px solid var(--line)',
                }}
              />
            ) : (
              <div
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 20,
                  background: 'linear-gradient(135deg, rgba(0,214,255,0.2), rgba(0,80,255,0.2))',
                  border: '1px solid var(--line-2)',
                  display: 'grid',
                  placeItems: 'center',
                  fontSize: 32,
                  fontWeight: 700,
                  color: 'var(--accent)',
                }}
              >
                {initial}
              </div>
            )}

            <div style={{ flex: 1, minWidth: 260 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, letterSpacing: '-0.02em' }}>
                  {data.name}
                </h1>
                <span
                  className="mono"
                  style={{
                    fontSize: 10.5,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: 'var(--fg-3)',
                    border: '1px solid var(--line-2)',
                    borderRadius: 6,
                    padding: '3px 8px',
                  }}
                >
                  {data.type}
                </span>
                {data.is_institution && (
                  <span
                    className="mono"
                    style={{
                      fontSize: 10,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      color: '#4ade80',
                      border: '1px solid rgba(74,222,128,0.35)',
                      background: 'rgba(74,222,128,0.08)',
                      padding: '3px 8px',
                      borderRadius: 6,
                    }}
                  >
                    Verified institution
                  </span>
                )}
              </div>

              {data.description && (
                <p style={{ margin: '12px 0 0', fontSize: 14.5, color: 'var(--fg-2)', lineHeight: 1.6, maxWidth: 680 }}>
                  {data.description}
                </p>
              )}

              {data.website && (
                <div style={{ marginTop: 14 }}>
                  <a
                    href={data.website.startsWith('http') ? data.website : `https://${data.website}`}
                    target="_blank"
                    rel="noreferrer noopener"
                    style={{
                      fontSize: 13,
                      color: 'var(--accent)',
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 5,
                    }}
                  >
                    Visit website ↗
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Events Section */}
          <section>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 24 }}>
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 600, letterSpacing: '-0.01em' }}>
                Events by {data.name}
              </h2>
              <span className="mono" style={{ fontSize: 12, color: 'var(--fg-3)' }}>
                {cards.length} {cards.length === 1 ? 'event' : 'events'}
              </span>
            </div>

            {cards.length === 0 ? (
              <div
                style={{
                  border: '1px dashed var(--line-2)',
                  borderRadius: 'var(--radius)',
                  padding: '60px 24px',
                  textAlign: 'center',
                  color: 'var(--fg-2)',
                }}
              >
                <p style={{ margin: 0, fontSize: 14 }}>No upcoming public events scheduled by this organization right now.</p>
              </div>
            ) : (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
                  gap: 20,
                }}
              >
                {cards.map((card) => (
                  <EventCard key={card.key} event={card} reveal={false} />
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
