import React from 'react'
import { Award, Target, Eye, Users, Mail, Phone, MapPin } from 'lucide-react'
import { useOrg } from '@/hooks/useOrg'

export const AboutPage: React.FC = () => {
  const { organization, isLoading } = useOrg()

  if (isLoading || !organization) {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center p-8">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-md-primary border-t-transparent animate-spin" />
          <span className="text-xs font-semibold text-slate-500">
            Loading Organization Profile...
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
    <div className="w-full bg-canvas text-md-on-surface min-h-screen pb-16">
      {/* Header Banner */}
      <div className="bg-white border-b border-[#DADCE0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-10 pb-8">
          <span className="text-xs font-semibold text-md-primary block mb-1">
            Organization Profile
          </span>
          <h1 className="font-display font-bold text-3xl sm:text-4xl text-slate-900 tracking-tight">
            {organization.name}
          </h1>
          <p className="text-sm text-slate-500 max-w-2xl mt-2 font-medium">
            {organization.tagline}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Vision & Mission Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-[#DADCE0] bg-white p-6 sm:p-8 shadow-subtle space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-md-primary">
              <Eye className="h-4 w-4" />
              <span>Foundational Vision</span>
            </div>
            <p className="font-display text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
              {organization.vision}
            </p>
          </div>

          <div className="rounded-2xl border border-[#DADCE0] bg-white p-6 sm:p-8 shadow-subtle space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-md-primary">
              <Target className="h-4 w-4" />
              <span>Core Mission</span>
            </div>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-body">
              {organization.mission}
            </p>
          </div>
        </section>

        {/* Core Objectives */}
        <section className="rounded-2xl border border-[#DADCE0] bg-white p-6 sm:p-8 shadow-subtle space-y-6">
          <h2 className="font-display font-bold text-xl sm:text-2xl text-slate-900 tracking-tight">
            Core Objectives & Directives
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {organization.objectives.map((obj, idx) => (
              <div key={idx} className="p-5 rounded-xl border border-[#DADCE0] bg-[#F8F9FA] space-y-2">
                <span className="w-6 h-6 rounded-full bg-md-primary-container text-md-primary text-xs font-bold flex items-center justify-center">
                  {idx + 1}
                </span>
                <p className="text-sm text-slate-700 leading-relaxed">{obj}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Activity Cadence */}
        <section className="rounded-2xl border border-[#DADCE0] bg-white p-6 sm:p-8 shadow-subtle space-y-6">
          <h2 className="font-display font-bold text-xl sm:text-2xl text-slate-900 tracking-tight">
            Activity Cadence (Events & Sessions Hosted)
          </h2>

          <div className="p-4 bg-[#F8F9FA] rounded-xl border border-[#DADCE0]">
            <div className="h-48 flex items-end gap-6 sm:gap-12 pt-8 pb-2 border-b border-[#DADCE0]">
              {activityData.map((d) => {
                const heightPct = Math.round((d.events / maxEvents) * 100)
                return (
                  <div key={d.month} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                    <span className="text-xs font-bold text-slate-900 opacity-0 group-hover:opacity-100 transition-opacity">
                      {d.events}
                    </span>
                    <div
                      className="w-full rounded-t-lg bg-md-primary-container group-hover:bg-md-primary transition-colors"
                      style={{ height: `${heightPct}%` }}
                    />
                    <span className="text-xs text-slate-500 font-medium">
                      {d.month}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Coordinators & Leadership */}
        <section className="rounded-2xl border border-[#DADCE0] bg-white p-6 sm:p-8 shadow-subtle space-y-6">
          <h2 className="font-display font-bold text-xl sm:text-2xl text-slate-900 tracking-tight">
            Executive Leadership & Advisory Board
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {organization.coordinators.map((c, i) => (
              <div key={i} className="p-5 rounded-xl border border-[#DADCE0] bg-[#F8F9FA] space-y-3">
                {c.photo ? (
                  <img
                    src={c.photo}
                    alt={c.name}
                    className="w-16 h-16 rounded-full object-cover border border-[#DADCE0]"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-md-primary-container text-md-primary text-xl font-bold flex items-center justify-center">
                    {c.name[0]}
                  </div>
                )}
                <div>
                  <span className="text-[11px] font-semibold text-md-primary block">
                    {c.role}
                  </span>
                  <h4 className="font-display font-bold text-lg text-slate-900 mt-0.5">
                    {c.name}
                  </h4>
                  {c.bio && (
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">{c.bio}</p>
                  )}
                </div>
              </div>
            ))}

            {organization.officeBearers.map((b, i) => (
              <div key={`ob-${i}`} className="p-5 rounded-xl border border-[#DADCE0] bg-[#F8F9FA] space-y-3">
                {b.photo ? (
                  <img
                    src={b.photo}
                    alt={b.name}
                    className="w-16 h-16 rounded-full object-cover border border-[#DADCE0]"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-md-primary-container text-md-primary text-xl font-bold flex items-center justify-center">
                    {b.name[0]}
                  </div>
                )}
                <div>
                  <span className="text-[11px] font-semibold text-md-primary block">
                    {b.role}
                  </span>
                  <h4 className="font-display font-bold text-lg text-slate-900 mt-0.5">
                    {b.name}
                  </h4>
                  {b.bio && (
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">{b.bio}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Contact info */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl border border-[#DADCE0] bg-white shadow-subtle space-y-1">
            <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
              <Mail className="h-4 w-4 text-md-primary" /> Contact Email
            </span>
            <p className="font-semibold text-slate-900 text-sm">support@eventmesh.xyz</p>
          </div>
          <div className="p-5 rounded-2xl border border-[#DADCE0] bg-white shadow-subtle space-y-1">
            <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
              <Phone className="h-4 w-4 text-md-primary" /> Operations Desk
            </span>
            <p className="font-semibold text-slate-900 text-sm">+91 80 2345 6789</p>
          </div>
          <div className="p-5 rounded-2xl border border-[#DADCE0] bg-white shadow-subtle space-y-1">
            <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-md-primary" /> Location Headquarters
            </span>
            <p className="font-semibold text-slate-900 text-sm">Main Campus Pavilion</p>
          </div>
        </section>
      </div>
    </div>
  )
}
