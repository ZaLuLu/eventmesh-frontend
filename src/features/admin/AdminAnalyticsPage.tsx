import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/api'
import { useOrg } from '@/hooks/useOrg'
import { ErrorState, EmptyState } from '@/design-system/primitives/EmptyState'

export const AdminAnalyticsPage: React.FC = () => {
  const { organization } = useOrg()
  const { data: stats, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin-analytics', organization?.id],
    queryFn: () => api.analytics.getStats({ orgId: organization!.id }),
    enabled: Boolean(organization?.id),
  })
  const timeline = stats?.registrationsTimeline || []
  const peak = Math.max(1, ...timeline.map((item) => item.count))
  const attendance = stats && stats.registrationsCount > 0
    ? `${Math.round(stats.checkinsCount / stats.registrationsCount * 100)}%`
    : '—'

  return (
    <div className="space-y-6">
      <header className="border-b border-line pb-4">
        <h1 className="text-[28px] font-semibold text-ink">Analytics</h1>
        <p className="mt-2 text-sm text-ink-soft">Registrations and attendance for {organization?.name || 'your organization'}.</p>
      </header>
      {isError ? <ErrorState title="Analytics unavailable" message="We could not load this organization's figures." onRetry={() => { void refetch() }} />
        : isLoading || !organization ? <p role="status" className="text-sm text-ink-soft">Loading analytics…</p>
        : !stats ? <EmptyState title="No analytics available" description="Figures will appear when they are available." />
        : <>
          <dl className="grid gap-4 sm:grid-cols-3">
            {[
              ['Registrations', stats.registrationsCount],
              ['Check-ins', stats.checkinsCount],
              ['Attendance rate', attendance],
            ].map(([label, value]) => <div key={label} className="rounded-panel border border-line bg-card p-5">
              <dt className="text-sm text-ink-soft">{label}</dt>
              <dd className="mt-2 text-3xl font-semibold tabular-nums text-ink">{value ?? '—'}</dd>
            </div>)}
          </dl>
          {stats.registrationsCount === 0 && <p className="text-sm text-ink-soft">Attendance rate is unavailable until there are registrations.</p>}
          <section className="rounded-panel border border-line bg-card p-5">
            <h2 className="text-lg font-semibold text-ink">Registrations over time</h2>
            {timeline.length ? <div className="mt-5 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <caption className="sr-only">Registration counts by date</caption>
                <thead><tr className="border-b border-line text-ink-soft"><th scope="col" className="pb-3 font-medium">Date</th><th scope="col" className="pb-3 text-right font-medium">Registrations</th><th scope="col"><span className="sr-only">Relative volume</span></th></tr></thead>
                <tbody>{timeline.map((item) => <tr key={item.date} className="border-b border-line last:border-0">
                  <th scope="row" className="py-3 font-normal text-ink">{item.date}</th>
                  <td className="py-3 text-right tabular-nums text-ink">{item.count}</td>
                  <td className="w-1/3 pl-5" aria-hidden="true"><div className="h-2 rounded bg-accent" style={{ width: `${item.count / peak * 100}%` }} /></td>
                </tr>)}</tbody>
              </table>
            </div> : <p className="mt-4 text-sm text-ink-soft">No registration history is available.</p>}
          </section>
        </>}
    </div>
  )
}
