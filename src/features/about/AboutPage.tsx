import React from 'react'
import { Award, Target, Eye, Users, Mail, Phone, MapPin } from 'lucide-react'
import { useOrg } from '@/hooks/useOrg'
import { BRAND_CONFIG } from '@/config/brand'

export const AboutPage: React.FC = () => {
  const { organization, isLoading } = useOrg()

  if (isLoading || !organization) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center p-8">
        <span className="font-mono text-xs uppercase tracking-widecaps text-ink-60">
          Loading Federation Charter...
        </span>
      </div>
    )
  }

  // Monthly activity chart data for flat editorial visual
  const activityData = [
    { month: 'JUN', events: 2 },
    { month: 'JUL', events: 4 },
    { month: 'AUG', events: 6 },
    { month: 'SEP', events: 11 },
    { month: 'OCT', events: 7 },
  ]
  const maxEvents = 12

  return (
    <div className="w-full bg-paper text-ink min-h-screen">
      {/* Editorial Header */}
      <div className="px-[4vw] pt-12 pb-8 border-b border-ink-15">
        <span className="font-mono text-[11px] uppercase tracking-widecaps text-ink-60 block mb-2">
          Charter & Organization Profile
        </span>
        <h1 className="font-display text-5xl sm:text-7xl uppercase text-ink">
          {organization.name}
        </h1>
        <p className="font-body text-lg text-ink-60 max-w-2xl mt-3">
          {organization.tagline}
        </p>
      </div>

      {/* Vision & Mission Grid */}
      <section className="px-[4vw] py-14 border-b border-ink-15 grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="space-y-4">
          <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-widecaps text-ink-60">
            <Eye className="h-4 w-4" />
            <span>Foundational Vision</span>
          </div>
          <p className="font-display text-2xl sm:text-3xl uppercase leading-tight text-ink">
            {organization.vision}
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-widecaps text-ink-60">
            <Target className="h-4 w-4" />
            <span>Charter Mission</span>
          </div>
          <p className="font-body text-base sm:text-lg text-ink leading-relaxed">
            {organization.mission}
          </p>
        </div>
      </section>

      {/* Core Objectives */}
      <section className="px-[4vw] py-14 border-b border-ink-15">
        <span className="font-mono text-[11px] uppercase tracking-widecaps text-ink-60 block mb-6">
          Institutional Directives & Objectives
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          {organization.objectives.map((obj, idx) => (
            <div key={idx} className="p-6 border border-ink-15 bg-paper-deep/20 space-y-3">
              <span className="font-mono text-sm font-bold text-ink">
                0{idx + 1}
              </span>
              <p className="font-body text-base text-ink leading-relaxed">{obj}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Annual Activity Chart */}
      <section className="px-[4vw] py-14 border-b border-ink-15">
        <span className="font-mono text-[11px] uppercase tracking-widecaps text-ink-60 block mb-6">
          Annual Activity Cadence (Symposiums & Hackathons)
        </span>

        <div className="border border-ink-15 p-6 bg-paper-deep/30">
          <div className="h-48 flex items-end gap-6 sm:gap-12 pt-8 pb-2 border-b border-ink">
            {activityData.map((d) => {
              const heightPct = Math.round((d.events / maxEvents) * 100)
              return (
                <div key={d.month} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  <span className="font-mono text-[11px] font-bold text-ink opacity-0 group-hover:opacity-100 transition-opacity">
                    {d.events}
                  </span>
                  <div
                    className="w-full bg-ink group-hover:bg-admin-accent transition-colors"
                    style={{ height: `${heightPct}%` }}
                  />
                  <span className="font-mono text-[10px] uppercase text-ink-60 font-semibold">
                    {d.month}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Governance & Coordinators */}
      <section className="px-[4vw] py-14 border-b border-ink-15">
        <span className="font-mono text-[11px] uppercase tracking-widecaps text-ink-60 block mb-8">
          Executive Directorate & Coordinators
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {organization.coordinators.map((c, i) => (
            <div key={i} className="border border-ink-15 p-6 space-y-4 bg-paper">
              {c.photo && (
                <img
                  src={c.photo}
                  alt={c.name}
                  className="w-20 h-20 object-cover border border-ink"
                />
              )}
              <div>
                <span className="font-mono text-[10px] uppercase text-ink-60 font-semibold block">
                  {c.role}
                </span>
                <h4 className="font-display text-2xl uppercase text-ink mt-1">
                  {c.name}
                </h4>
                {c.bio && (
                  <p className="font-body text-xs text-ink-60 mt-2">{c.bio}</p>
                )}
              </div>
            </div>
          ))}

          {organization.officeBearers.map((b, i) => (
            <div key={`ob-${i}`} className="border border-ink-15 p-6 space-y-4 bg-paper">
              {b.photo && (
                <img
                  src={b.photo}
                  alt={b.name}
                  className="w-20 h-20 object-cover border border-ink"
                />
              )}
              <div>
                <span className="font-mono text-[10px] uppercase text-ink-60 font-semibold block">
                  {b.role}
                </span>
                <h4 className="font-display text-2xl uppercase text-ink mt-1">
                  {b.name}
                </h4>
                {b.bio && (
                  <p className="font-body text-xs text-ink-60 mt-2">{b.bio}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Achievements List */}
      <section className="px-[4vw] py-14 border-b border-ink-15">
        <span className="font-mono text-[11px] uppercase tracking-widecaps text-ink-60 block mb-6">
          Institutional Distinctions
        </span>

        <ul className="space-y-4 max-w-4xl">
          {organization.achievements.map((ach, idx) => (
            <li key={idx} className="flex items-start gap-4 p-4 border border-ink-15 bg-paper-deep/20 font-body text-base text-ink">
              <Award className="h-5 w-5 text-ink flex-shrink-0 mt-0.5" />
              <span>{ach}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Official Inquiries & Contact */}
      <section className="px-[4vw] py-14">
        <span className="font-mono text-[11px] uppercase tracking-widecaps text-ink-60 block mb-6">
          Secretariat Contact
        </span>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-xs uppercase">
          <div className="p-5 border border-ink-15 space-y-1">
            <span className="text-ink-60 flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5" /> Email Dispatch
            </span>
            <p className="font-semibold text-ink text-sm">curation@eventmesh.xyz</p>
          </div>
          <div className="p-5 border border-ink-15 space-y-1">
            <span className="text-ink-60 flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5" /> Operations Desk
            </span>
            <p className="font-semibold text-ink text-sm">+91 80 2345 6789</p>
          </div>
          <div className="p-5 border border-ink-15 space-y-1">
            <span className="text-ink-60 flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" /> Physical Headquarters
            </span>
            <p className="font-semibold text-ink text-sm">Central Academic Complex, Engineering Pavilion</p>
          </div>
        </div>
      </section>
    </div>
  )
}
