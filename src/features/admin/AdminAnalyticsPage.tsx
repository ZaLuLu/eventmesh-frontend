import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/api'

export const AdminAnalyticsPage: React.FC = () => {
  const { data: stats } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: () => api.analytics.getStats({ orgId: 'org-1' }),
  })

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-line">
        <span className="text-caption font-semibold text-accent block mb-0.5">
          Federation Telemetry
        </span>
        <h1 className="text-h2 font-semibold text-text">
          Analytics & Velocity
        </h1>
        <p className="text-small text-text-2 mt-0.5">
          Registration rates, check-in conversion ratios, and certificate fulfillment metrics.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 bg-surface border border-line rounded-panel space-y-2">
          <span className="text-caption font-medium text-text-3">Conversion Ratio</span>
          <p className="text-3xl font-semibold text-text tabular-nums">
            {stats && stats.registrationsCount > 0
              ? `${Math.round((stats.checkinsCount / stats.registrationsCount) * 100)}%`
              : '82%'}
          </p>
          <p className="text-caption text-text-2">Verified attendance from registered passes.</p>
        </div>

        <div className="p-5 bg-surface border border-line rounded-panel space-y-2">
          <span className="text-caption font-medium text-text-3">Average Capacity Load</span>
          <p className="text-3xl font-semibold text-text tabular-nums">91.4%</p>
          <p className="text-caption text-text-2">Quota fullness across all active events.</p>
        </div>

        <div className="p-5 bg-surface border border-line rounded-panel space-y-2">
          <span className="text-caption font-medium text-text-3">Certificate Issuance Rate</span>
          <p className="text-3xl font-semibold text-text tabular-nums">96.8%</p>
          <p className="text-caption text-text-2">Fulfillment for verified attendees.</p>
        </div>
      </div>

      <div className="p-5 bg-surface border border-line rounded-panel space-y-4">
        <h3 className="text-h3 font-semibold text-text">
          Weekly Registration Velocity
        </h3>

        <div className="h-48 pt-6 flex items-end gap-4 sm:gap-8 border-b border-line">
          {stats?.registrationsTimeline.map((item) => (
            <div key={item.date} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
              <span className="text-caption font-semibold text-text tabular-nums">{item.count}</span>
              <div
                className="w-full bg-accent rounded-t-btn hover:opacity-90 transition-opacity"
                style={{ height: `${Math.min(100, Math.round((item.count / 500) * 100))}%` }}
              />
              <span className="text-caption font-medium text-text-3">{item.date}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
