import React from 'react'
import { CheckSquare, Check, X } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/api'
import { Button } from '@/design-system/primitives/Button'
import { formatDate } from '@/lib/dates'
import { useToast } from '@/design-system/primitives/Toast'

export const AdminApprovalsPage: React.FC = () => {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const { data: events = [], isLoading } = useQuery({
    queryKey: ['admin-approvals'],
    queryFn: () => api.eventsAdmin.getAdminEvents({ orgId: 'org-1' }),
  })

  const inReviewEvents = events.filter((e) => e.status === 'in_review')

  const approveMutation = useMutation({
    mutationFn: (id: string) => api.eventsAdmin.approveEvent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-approvals'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'events'] })
      toast({ title: 'Event Approved', message: 'The event has been approved and published live.', type: 'success' })
    },
  })

  return (
    <div className="space-y-6">
      <div className="pb-6 border-b border-[#C9D0D4]">
        <span className="font-mono text-[10px] uppercase tracking-wide text-ink-60 block mb-1">
          Editorial Review Pipeline
        </span>
        <h1 className="font-display text-3xl sm:text-4xl uppercase text-ink">
          Event Approvals Queue
        </h1>
        <p className="font-body text-xs text-ink-60 mt-0.5">
          Curatorial approval queue for club submissions requiring organization confirmation.
        </p>
      </div>

      <div className="bg-paper border border-[#C9D0D4] p-6 space-y-4">
        {isLoading ? (
          <p className="font-mono text-xs uppercase text-ink-60 py-4">Checking approval queue...</p>
        ) : inReviewEvents.length === 0 ? (
          <div className="py-12 text-center font-mono text-xs uppercase text-ink-60">
            ✓ No events currently pending editorial approval. All submissions processed.
          </div>
        ) : (
          <div className="divide-y divide-[#C9D0D4]">
            {inReviewEvents.map((evt) => (
              <div key={evt.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="h-2 w-2 inline-block" style={{ backgroundColor: evt.organizerColor }} />
                    <span className="font-mono text-[10px] uppercase font-semibold text-ink-60">
                      {evt.organizerName} · {evt.category}
                    </span>
                  </div>
                  <h3 className="font-display text-xl uppercase text-ink">{evt.title}</h3>
                  <p className="font-mono text-xs text-ink-60 mt-0.5">
                    {formatDate(evt.startsAt)} · {evt.venue.name} · Capacity: {evt.capacity}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    surface="admin"
                    size="sm"
                    loading={approveMutation.isPending}
                    icon={<Check className="h-4 w-4" />}
                    onClick={() => approveMutation.mutate(evt.id)}
                  >
                    Approve & Publish
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
