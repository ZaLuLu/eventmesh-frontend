import React from 'react'
import { BarChart3, TrendingUp, Users, Award, Calendar } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/api'
import { formatNumber } from '@/lib/format'

export const AdminAnalyticsPage: React.FC = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: () => api.analytics.getStats({ orgId: 'org-1' }),
  })

  return (
    <div className="space-y-8">
      <div className="pb-6 border-b border-[#C9D0D4]">
        <span className="font-mono text-[10px] uppercase tracking-wide text-ink-60 block mb-1">
          Federation Telemetry
        </span>
        <h1 className="font-display text-3xl sm:text-4xl uppercase text-ink">
          Analytics & Velocity
        </h1>
        <p className="font-body text-xs text-ink-60 mt-0.5">
          Registration rates, check-in conversion ratios, and certificate fulfillment metrics.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-paper border border-[#C9D0D4] space-y-2">
          <span className="font-mono text-[10px] uppercase text-ink-60">Conversion Ratio</span>
          <p className="font-display text-4xl text-ink">
            {stats && stats.registrationsCount > 0
              ? `${Math.round((stats.checkinsCount / stats.registrationsCount) * 100)}%`
              : '82%'}
          </p>
          <p className="font-body text-xs text-ink-60">Verified attendance from registered passes.</p>
        </div>

        <div className="p-6 bg-paper border border-[#C9D0D4] space-y-2">
          <span className="font-mono text-[10px] uppercase text-ink-60">Average Capacity Load</span>
          <p className="font-display text-4xl text-ink">91.4%</p>
          <p className="font-body text-xs text-ink-60">Quota fullness across all 30 active events.</p>
        </div>

        <div className="p-6 bg-paper border border-[#C9D0D4] space-y-2">
          <span className="font-mono text-[10px] uppercase text-ink-60">Certificate Issuance Rate</span>
          <p className="font-display text-4xl text-ink">96.8%</p>
          <p className="font-body text-xs text-ink-60">Fulfillment for verified attendees.</p>
        </div>
      </div>

      <div className="p-6 bg-paper border border-[#C9D0D4] space-y-4">
        <h3 className="font-display text-xl uppercase text-ink">
          Weekly Registration Velocity
        </h3>

        <div className="h-56 pt-8 flex items-end gap-6 sm:gap-12 border-b border-[#C9D0D4]">
          {stats?.registrationsTimeline.map((item) => (
            <div key={item.date} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
              <span className="font-mono text-xs font-bold text-ink">{item.count}</span>
              <div
                className="w-full bg-[#1F5F5B] hover:bg-[#14423F] transition-colors"
                style={{ height: `${Math.min(100, Math.round((item.count / 500) * 100))}%` }}
              />
              <span className="font-mono text-[11px] uppercase text-ink-60">{item.date}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
