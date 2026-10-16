// Hallmark macrostructure: Overlay-NotificationInbox
import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Bell, Check, Sparkle, Megaphone, Clock, Certificate, Ticket } from '@/design-system/Icon'
import { Popover, PopoverContent, PopoverTrigger } from '@/design-system/ui/popover'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/api'
import { formatRelativeDays } from '@/lib/format'
import { Notification } from '@/api'

/**
 * NotificationInbox: Campus In-App Notification Center (Audit F-04).
 * Desktop popover & mobile accessible panel showing announcements,
 * waitlist promotions, schedule reminders, and credential awards.
 */
export const NotificationInbox: React.FC<{ className?: string }> = ({ className = '' }) => {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()

  const { data: notifications = [] } = useQuery<Notification[]>({
    queryKey: ['notifications', 'my'],
    queryFn: async () => {
      if (api.notifications.getMyNotifications) {
        return api.notifications.getMyNotifications()
      }
      return api.notifications.getNotifications()
    },
  })

  const markReadMutation = useMutation({
    mutationFn: async (id: string) => {
      if (api.notifications.markNotificationRead) {
        return api.notifications.markNotificationRead(id)
      }
      return true
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      if (api.notifications.markAllNotificationsRead) {
        return api.notifications.markAllNotificationsRead()
      }
      return true
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })

  const unreadCount = notifications.filter((n) => !(n.read ?? (n as any).is_read)).length

  const getNotificationIcon = (kind?: string, type?: string) => {
    const k = kind || type || ''
    if (k.includes('payout') || k.includes('settle')) {
      return <Sparkle size={16} weight="bold" className="text-accent" />
    }
    if (k.includes('pass') || k.includes('ticket') || k === 'waitlist_promoted') {
      return <Ticket size={16} weight="bold" className="text-mint" />
    }
    if (k === 'certificate_issued') {
      return <Certificate size={16} weight="bold" className="text-mustard" />
    }
    if (k === 'reminder') {
      return <Clock size={16} weight="bold" className="text-sky" />
    }
    return <Megaphone size={16} weight="bold" className="text-accent" />
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={`relative p-2 rounded-full border border-ink/15 hover:border-ink/40 text-ink/80 hover:text-ink transition-colors flex items-center justify-center ${className}`}
          aria-label={`Notifications, ${unreadCount} unread`}
        >
          <Bell size={18} weight={unreadCount > 0 ? 'fill' : 'bold'} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-pink text-white text-[10px] font-mono font-bold flex items-center justify-center border border-ink shadow-xs">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-[360px] sm:w-[400px] p-0 bg-card border-[1.5px] border-ink rounded-ticket shadow-offset-lg z-50 overflow-hidden"
      >
        {/* Header Strip */}
        <div className="p-4 bg-paper-2 border-b border-ink/15 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-display font-bold text-base text-ink">Notifications</span>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[11px] font-mono font-bold bg-pink text-white">
                {unreadCount} new
              </span>
            )}
          </div>

          {unreadCount > 0 && (
            <button
              type="button"
              onClick={() => markAllReadMutation.mutate()}
              className="text-xs font-mono font-semibold text-cobalt hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Check size={14} weight="bold" />
              <span>Mark all read</span>
            </button>
          )}
        </div>

        {/* Notifications List */}
        <div className="max-h-[380px] overflow-y-auto divide-y divide-ink/10">
          {notifications.length === 0 ? (
            <div className="p-8 text-center space-y-2">
              <Sparkle size={28} weight="duotone" className="mx-auto text-ink/30" />
              <p className="text-sm font-sans font-medium text-ink-soft">
                All caught up! No recent alerts.
              </p>
            </div>
          ) : (
            notifications.slice(0, 15).map((n) => {
              const isRead = Boolean(n.read ?? (n as any).is_read)
              const bodyText = n.body || (n as any).message || ''
              const timestamp = n.sentAt || (n as any).created_at || new Date().toISOString()
              const eventSlug = n.eventId || (n as any).data?.event_slug
              return (
                <div
                  key={n.id}
                  onClick={() => {
                    if (!isRead) markReadMutation.mutate(n.id)
                  }}
                  className={`p-3.5 flex items-start gap-3 transition-colors cursor-pointer hover:bg-surface-subtle ${
                    isRead ? 'opacity-70 bg-card' : 'bg-surface-subtle/50 font-medium'
                  }`}
                >
                  <div className="p-2 rounded-full bg-card border border-line flex-shrink-0 mt-0.5">
                    {getNotificationIcon((n as any).kind, (n as any).type)}
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-xs sm:text-sm font-sans font-bold text-ink truncate">
                        {n.title}
                      </h4>
                      <span className="text-[10px] font-mono text-ink-soft flex-shrink-0">
                        {formatRelativeDays(timestamp)}
                      </span>
                    </div>

                    <p className="text-xs text-ink-soft line-clamp-2 leading-relaxed">
                      {bodyText}
                    </p>

                    {eventSlug && (
                      <Link
                        to={`/events/${eventSlug}`}
                        onClick={() => setOpen(false)}
                        className="inline-block text-[11px] font-mono font-semibold text-accent hover:underline pt-0.5"
                      >
                        View event details →
                      </Link>
                    )}
                  </div>

                  {!isRead && (
                    <span className="w-2 h-2 rounded-full bg-accent flex-shrink-0 mt-2" />
                  )}
                </div>
              )
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-2.5 bg-paper-2 border-t border-ink/15 text-center">
          <Link
            to="/announcements"
            onClick={() => setOpen(false)}
            className="text-xs font-mono font-bold text-ink-soft hover:text-ink hover:underline"
          >
            Browse Association Feed & Notices →
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  )
}
