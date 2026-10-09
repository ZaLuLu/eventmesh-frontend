import React from 'react'
import { Check } from 'lucide-react'
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
    <div className="space-y-4">
      <div className="pb-4 border-b border-line">
        <span className="text-caption font-semibold text-accent block mb-0.5">
          Editorial Review Pipeline
        </span>
        <h1 className="text-h2 font-semibold text-text">
          Event Approvals Queue
        </h1>
        <p className="text-small text-text-2 mt-0.5">
          Curatorial approval queue for club submissions requiring organization confirmation.
        </p>
      </div>

      <div className="bg-surface border border-line rounded-panel p-5 space-y-3">
        {isLoading ? (
          <p className="text-small text-text-3 py-4 text-center">Checking approval queue...</p>
        ) : inReviewEvents.length === 0 ? (
          <div className="py-12 text-center text-small text-text-3">
            ✓ No events currently pending editorial approval. All submissions processed.
          </div>
        ) : (
          <div className="divide-y divide-line">
            {inReviewEvents.map((evt) => (
              <div key={evt.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="h-2 w-2 rounded-full inline-block" style={{ backgroundColor: evt.organizerColor }} />
                    <span className="text-caption font-medium text-text-3">
                      {evt.organizerName} · {evt.category}
                    </span>
                  </div>
                  <h3 className="text-h3 font-semibold text-text">{evt.title}</h3>
                  <p className="text-caption text-text-2 mt-0.5">
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
