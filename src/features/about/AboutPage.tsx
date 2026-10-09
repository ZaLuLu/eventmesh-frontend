import React from 'react'
import { Target, Eye, Mail, Phone, MapPin } from 'lucide-react'
import { useOrg } from '@/hooks/useOrg'

export const AboutPage: React.FC = () => {
  const { organization, isLoading } = useOrg()

  if (isLoading || !organization) {
    return (
      <div className="min-h-[50vh] bg-bg flex items-center justify-center p-8">
        <div className="flex flex-col items-center gap-3">
          <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          <span className="text-small text-text-2">
            Loading organization profile...
          </span>
        </div>
      </div>
    )
  }

  const activityData = [
    { month: 'Jun', events: 2 },
    { month: 'Jul', events: 4 },
    { month: 'Aug', events: 6 },
    { month: 'Sep', events: 11 },
    { month: 'Oct', events: 7 },
  ]
  const maxEvents = 12

  return (
    <div className="w-full bg-bg text-text min-h-screen pb-16">
      {/* Header Banner */}
      <div className="border-b border-line pb-8 pt-8">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <span className="text-caption font-semibold text-accent block mb-1">
            Organization profile
          </span>
          <h1 className="text-h1 font-semibold text-text">
            {organization.name}
          </h1>
          <p className="text-body text-text-2 max-w-2xl mt-1">
            {organization.tagline}
          </p>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        {/* Vision & Mission Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-panel border border-line bg-surface p-6 sm:p-8 space-y-3">
            <div className="flex items-center gap-2 text-caption font-semibold text-accent">
              <Eye className="h-4 w-4" />
              <span>Foundational vision</span>
            </div>
            <p className="text-h2 font-semibold text-text leading-snug">
              {organization.vision}
            </p>
          </div>

          <div className="rounded-panel border border-line bg-surface p-6 sm:p-8 space-y-3">
            <div className="flex items-center gap-2 text-caption font-semibold text-accent">
              <Target className="h-4 w-4" />
              <span>Core mission</span>
            </div>
            <p className="text-body text-text-2 leading-relaxed">
              {organization.mission}
            </p>
          </div>
        </section>

        {/* Core Objectives */}
        <section className="rounded-panel border border-line bg-surface p-6 sm:p-8 space-y-6">
          <h2 className="text-h2 font-semibold text-text">
            Core objectives & directives
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {organization.objectives.map((obj, idx) => (
              <div key={idx} className="p-4 rounded-panel border border-line bg-subtle space-y-2">
                <span className="w-6 h-6 rounded-full bg-accent-soft text-accent text-caption font-semibold flex items-center justify-center">
                  {idx + 1}
                </span>
                <p className="text-small text-text-2 leading-relaxed">{obj}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Activity Cadence */}
        <section className="rounded-panel border border-line bg-surface p-6 sm:p-8 space-y-6">
          <h2 className="text-h2 font-semibold text-text">
            Activity cadence (events & sessions hosted)
          </h2>

          <div className="p-6 bg-subtle rounded-panel border border-line">
            <div className="h-44 flex items-end gap-6 sm:gap-12 pt-6 pb-2 border-b border-line">
              {activityData.map((d) => {
                const heightPct = Math.round((d.events / maxEvents) * 100)
                return (
                  <div key={d.month} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                    <span className="text-caption font-medium text-text tabular-nums">
                      {d.events}
                    </span>
                    <div
                      className="w-full rounded-t-btn bg-accent"
                      style={{ height: `${heightPct}%` }}
                    />
                    <span className="text-caption text-text-2 font-medium">
                      {d.month}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Coordinators & Leadership */}
        <section className="rounded-panel border border-line bg-surface p-6 sm:p-8 space-y-6">
          <h2 className="text-h2 font-semibold text-text">
            Executive leadership & advisory board
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {organization.coordinators.map((c, i) => (
              <div key={i} className="p-5 rounded-panel border border-line bg-surface space-y-3">
                {c.photo ? (
                  <img
                    src={c.photo}
                    alt={c.name}
                    className="w-16 h-16 rounded-panel object-cover border border-line"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-panel bg-subtle text-accent text-xl font-semibold flex items-center justify-center border border-line">
                    {c.name[0]}
                  </div>
                )}
                <div>
                  <span className="text-caption font-medium text-accent block">
                    {c.role}
                  </span>
                  <h4 className="text-h3 font-semibold text-text mt-0.5">
                    {c.name}
                  </h4>
                  {c.bio && (
                    <p className="text-caption text-text-2 mt-1 leading-relaxed">{c.bio}</p>
                  )}
                </div>
              </div>
            ))}

            {organization.officeBearers.map((b, i) => (
              <div key={`ob-${i}`} className="p-5 rounded-panel border border-line bg-surface space-y-3">
                {b.photo ? (
                  <img
                    src={b.photo}
                    alt={b.name}
                    className="w-16 h-16 rounded-panel object-cover border border-line"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-panel bg-subtle text-accent text-xl font-semibold flex items-center justify-center border border-line">
                    {b.name[0]}
                  </div>
                )}
                <div>
                  <span className="text-caption font-medium text-accent block">
                    {b.role}
                  </span>
                  <h4 className="text-h3 font-semibold text-text mt-0.5">
                    {b.name}
                  </h4>
                  {b.bio && (
                    <p className="text-caption text-text-2 mt-1 leading-relaxed">{b.bio}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Contact info */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 rounded-panel border border-line bg-surface space-y-1">
            <span className="text-caption font-medium text-text-3 flex items-center gap-1.5">
              <Mail className="h-4 w-4 text-accent" /> Contact email
            </span>
            <p className="font-semibold text-text text-small">support@eventmesh.xyz</p>
          </div>
          <div className="p-5 rounded-panel border border-line bg-surface space-y-1">
            <span className="text-caption font-medium text-text-3 flex items-center gap-1.5">
              <Phone className="h-4 w-4 text-accent" /> Operations desk
            </span>
            <p className="font-semibold text-text text-small">+91 80 2345 6789</p>
          </div>
          <div className="p-5 rounded-panel border border-line bg-surface space-y-1">
            <span className="text-caption font-medium text-text-3 flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-accent" /> Location headquarters
            </span>
            <p className="font-semibold text-text text-small">Main Campus Pavilion</p>
          </div>
        </section>
      </div>
    </div>
  )
}
