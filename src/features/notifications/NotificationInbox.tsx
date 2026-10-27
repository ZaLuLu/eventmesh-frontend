// Hallmark macrostructure: Overlay-NotificationInbox
import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Bell,
  Check,
  Sparkle,
  Megaphone,
  Clock,
  Certificate,
  Ticket,
  CalendarPlus,
  ArrowUpRight,
} from '@/design-system/Icon'
import { Popover, PopoverContent, PopoverTrigger } from '@/design-system/ui/popover'
import { Sheet, SheetContent, SheetTrigger } from '@/design-system/ui/sheet'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/api'
import { formatRelativeDays } from '@/lib/format'
import { downloadICS } from '@/lib/ics'
import { useToast } from '@/design-system/primitives/Toast'

type TabType = 'all' | 'passes' | 'alerts'

interface NotificationItemData {
  id: string
  title: string
  body?: string
  message?: string
  sentAt?: string
  created_at?: string
  read?: boolean
  is_read?: boolean
  kind?: string
  type?: string
  eventId?: string
  eventTitle?: string
  data?: {
    event_slug?: string
    ticket_code?: string
    ticket_id?: string
    [key: string]: any
  }
}

export const NotificationInbox: React.FC<{ className?: string }> = ({ className = '' }) => {
  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<TabType>('all')
  const [isMobile, setIsMobile] = useState(false)
  const queryClient = useQueryClient()
  const { success } = useToast()

  // Track responsive viewport for dual-form factor (Desktop Popover vs Mobile Sheet)
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const { data: rawNotifications = [] } = useQuery<any[]>({
    queryKey: ['notifications', 'my'],
    queryFn: async () => {
      if (api.notifications.getInAppNotifications) {
        const res = await api.notifications.getInAppNotifications()
        if (res && res.items && res.items.length > 0) {
          return res.items
        }
      }
      if (api.notifications.getMyNotifications) {
        return api.notifications.getMyNotifications()
      }
      return api.notifications.getNotifications()
    },
  })

  const notifications: NotificationItemData[] = rawNotifications

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

  // Helpers to categorize notifications
  const isPassNotification = (item: NotificationItemData) => {
    const k = (item.kind || item.type || '').toLowerCase()
    const t = (item.title || '').toLowerCase()
    return (
      k.includes('pass') ||
      k.includes('ticket') ||
      k.includes('registration') ||
      k === 'waitlist_promoted' ||
      k === 'certificate_issued' ||
      t.includes('pass') ||
      t.includes('ticket') ||
      t.includes('registration') ||
      t.includes('certificate') ||
      Boolean(item.data?.ticket_code || item.data?.ticket_id)
    )
  }

  const isAlertNotification = (item: NotificationItemData) => {
    const k = (item.kind || item.type || '').toLowerCase()
    const t = (item.title || '').toLowerCase()
    return (
      k.includes('announcement') ||
      k.includes('reminder') ||
      k.includes('payout') ||
      k.includes('settle') ||
      k.includes('alert') ||
      k.includes('general') ||
      t.includes('announcement') ||
      t.includes('reminder') ||
      t.includes('alert') ||
      !isPassNotification(item)
    )
  }

  const unreadCount = notifications.filter((n) => !(n.read ?? n.is_read)).length
  const passCount = notifications.filter(isPassNotification).length
  const alertCount = notifications.filter(isAlertNotification).length

  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === 'passes') return isPassNotification(n)
    if (activeTab === 'alerts') return isAlertNotification(n)
    return true
  })

  const handleDownloadICS = (n: NotificationItemData) => {
    const eventTitle = n.eventTitle || n.title || 'Event'
    const startsAt = n.sentAt || n.created_at || new Date().toISOString()
    const endsAt = new Date(new Date(startsAt).getTime() + 2 * 3600000).toISOString()
    downloadICS({
      title: eventTitle,
      description: n.body || n.message || '',
      startsAt,
      endsAt,
      venueName: 'Campus Venue',
    })
    success('Calendar event saved', `Downloaded .ics for "${eventTitle}"`)
  }

  const renderIcon = (n: NotificationItemData) => {
    const k = (n.kind || n.type || '').toLowerCase()
    if (k.includes('payout') || k.includes('settle')) {
      return (
        <div className="h-8 w-8 rounded-[10px] bg-violet-50 text-violet-600 dark:bg-violet-500/15 dark:text-violet-400 border border-violet-200 dark:border-violet-500/30 flex items-center justify-center shrink-0">
          <Sparkle size={15} weight="bold" />
        </div>
      )
    }
    if (k.includes('pass') || k.includes('ticket') || k === 'waitlist_promoted') {
      return (
        <div className="h-8 w-8 rounded-[10px] bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 flex items-center justify-center shrink-0">
          <Ticket size={15} weight="bold" />
        </div>
      )
    }
    if (k === 'certificate_issued') {
      return (
        <div className="h-8 w-8 rounded-[10px] bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30 flex items-center justify-center shrink-0">
          <Certificate size={15} weight="bold" />
        </div>
      )
    }
    if (k === 'reminder') {
      return (
        <div className="h-8 w-8 rounded-[10px] bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30 flex items-center justify-center shrink-0">
          <Clock size={15} weight="bold" />
        </div>
      )
    }
    return (
      <div className="h-8 w-8 rounded-[10px] bg-purple-50 text-purple-600 dark:bg-purple-500/15 dark:text-purple-400 border border-purple-200 dark:border-purple-500/30 flex items-center justify-center shrink-0">
        <Megaphone size={15} weight="bold" />
      </div>
    )
  }

  const getCategoryLabel = (n: NotificationItemData) => {
    const k = (n.kind || n.type || '').toLowerCase()
    if (k.includes('pass') || k.includes('ticket') || k === 'waitlist_promoted') return 'PASS & TICKET'
    if (k === 'certificate_issued') return 'CREDENTIAL'
    if (k === 'reminder') return 'REMINDER'
    if (k.includes('payout') || k.includes('settle')) return 'FINANCIAL'
    return 'ANNOUNCEMENT'
  }

  // Common inner content rendered inside Desktop Popover or Mobile Sheet
  const renderContent = () => (
    <div className="flex flex-col h-full w-full">
      {/* Top Header */}
      <div className="p-4 bg-slate-50/70 dark:bg-white/[0.02] border-b border-[#E2E8F0] dark:border-white/10 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <h3 className="font-semibold text-sm sm:text-base text-slate-900 dark:text-white tracking-tight">
            Notifications
          </h3>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-violet-50 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300 border border-violet-200 dark:border-violet-800/40">
              {unreadCount} new
            </span>
          )}
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            onClick={() => markAllReadMutation.mutate()}
            disabled={markAllReadMutation.isPending}
            className="text-xs font-medium text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 flex items-center gap-1.5 cursor-pointer transition-colors disabled:opacity-50"
          >
            <Check size={14} weight="bold" />
            <span>Mark all read</span>
          </button>
        )}
      </div>

      {/* Categorized Filter Tabs */}
      <div className="flex items-center gap-1 px-3 py-2 bg-slate-50/40 dark:bg-white/[0.01] border-b border-[#E2E8F0] dark:border-white/10 shrink-0">
        <button
          type="button"
          onClick={() => setActiveTab('all')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-xs font-medium transition-all cursor-pointer ${
            activeTab === 'all'
              ? 'bg-white dark:bg-white/10 text-slate-900 dark:text-white shadow-xs border border-slate-200 dark:border-white/10 font-semibold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <span>All</span>
          <span className="text-[10px] tabular-nums text-slate-400 dark:text-slate-500">
            {notifications.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('passes')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-xs font-medium transition-all cursor-pointer ${
            activeTab === 'passes'
              ? 'bg-white dark:bg-white/10 text-slate-900 dark:text-white shadow-xs border border-slate-200 dark:border-white/10 font-semibold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <span>Passes</span>
          {passCount > 0 && (
            <span className="text-[10px] tabular-nums text-slate-400 dark:text-slate-500">
              {passCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('alerts')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-xs font-medium transition-all cursor-pointer ${
            activeTab === 'alerts'
              ? 'bg-white dark:bg-white/10 text-slate-900 dark:text-white shadow-xs border border-slate-200 dark:border-white/10 font-semibold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <span>Club Alerts</span>
          {alertCount > 0 && (
            <span className="text-[10px] tabular-nums text-slate-400 dark:text-slate-500">
              {alertCount}
            </span>
          )}
        </button>
      </div>

      {/* Notifications List Area */}
      <div className="overflow-y-auto divide-y divide-slate-100 dark:divide-white/5 max-h-[380px] sm:max-h-[420px] flex-1">
        {filteredNotifications.length === 0 ? (
          <div className="p-8 text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center mx-auto text-slate-400">
              <Sparkle size={18} weight="duotone" />
            </div>
            <p className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200">
              All caught up!
            </p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">
              {activeTab === 'passes'
                ? 'No active passes or registration updates.'
                : activeTab === 'alerts'
                ? 'No recent club alerts or broadcasts.'
                : 'No recent alerts or notices.'}
            </p>
          </div>
        ) : (
          filteredNotifications.map((n) => {
            const isRead = Boolean(n.read ?? n.is_read)
            const bodyText = n.body || n.message || ''
            const timestamp = n.sentAt || n.created_at || new Date().toISOString()
            const eventSlug = n.eventId || n.data?.event_slug
            const isPass = isPassNotification(n)

            return (
              <div
                key={n.id}
                onClick={() => {
                  if (!isRead) markReadMutation.mutate(n.id)
                }}
                className={`p-3.5 flex items-start gap-3 transition-colors ${
                  isRead
                    ? 'bg-white dark:bg-transparent hover:bg-slate-50 dark:hover:bg-white/[0.03]'
                    : 'bg-violet-50/40 dark:bg-violet-950/20 hover:bg-violet-50/70 dark:hover:bg-violet-950/30'
                }`}
              >
                {/* Category Icon */}
                {renderIcon(n)}

                {/* Body Details */}
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-[9px] font-mono font-semibold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
                        {getCategoryLabel(n)}
                      </span>
                      {!isRead && (
                        <span className="w-1.5 h-1.5 rounded-full bg-violet-600 dark:bg-violet-400 shrink-0" />
                      )}
                    </div>
                    <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500 shrink-0 tabular-nums">
                      {formatRelativeDays(timestamp)}
                    </span>
                  </div>

                  <h4 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white leading-snug">
                    {n.title}
                  </h4>

                  {bodyText && (
                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                      {bodyText}
                    </p>
                  )}

                  {/* Embedded Direct Action Buttons */}
                  <div className="pt-1.5 flex flex-wrap items-center gap-2">
                    {isPass && (
                      <>
                        <Link
                          to={eventSlug ? `/events/${eventSlug}` : '/wallet'}
                          onClick={() => setOpen(false)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[6px] text-[11px] font-medium bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25 transition-colors"
                        >
                          <Ticket size={12} weight="bold" />
                          <span>View Pass</span>
                        </Link>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDownloadICS(n)
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[6px] text-[11px] font-medium bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/15 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-white/10 transition-colors cursor-pointer"
                        >
                          <CalendarPlus size={12} weight="bold" />
                          <span>Download .ICS</span>
                        </button>
                      </>
                    )}

                    {!isPass && eventSlug && (
                      <Link
                        to={`/events/${eventSlug}`}
                        onClick={() => setOpen(false)}
                        className="inline-flex items-center gap-1 text-[11px] font-medium text-violet-600 dark:text-violet-400 hover:underline"
                      >
                        <span>View Details</span>
                        <ArrowUpRight size={12} weight="bold" />
                      </Link>
                    )}

                    {!isRead && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          markReadMutation.mutate(n.id)
                        }}
                        title="Mark as read"
                        className="ml-auto inline-flex items-center gap-1 px-2 py-0.5 rounded-[6px] text-[10px] font-medium text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                      >
                        <Check size={12} weight="bold" />
                        <span>Read</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Footer Strip */}
      <div className="p-3 bg-slate-50/80 dark:bg-white/[0.02] border-t border-[#E2E8F0] dark:border-white/10 text-center shrink-0">
        <Link
          to="/announcements"
          onClick={() => setOpen(false)}
          className="text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors flex items-center justify-center gap-1"
        >
          <span>Browse Campus Bulletins & Feed</span>
          <ArrowUpRight size={12} weight="bold" />
        </Link>
      </div>
    </div>
  )

  // Trigger Button
  const TriggerButton = (
    <button
      type="button"
      className={`relative h-9 w-9 rounded-xl border flex items-center justify-center transition-colors cursor-pointer ${className}`}
      aria-label={`Notifications, ${unreadCount} unread`}
    >
      <Bell size={18} weight={unreadCount > 0 ? 'fill' : 'bold'} />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-violet-600 text-white text-[10px] font-bold flex items-center justify-center border-2 border-[#0D0E12] shadow-xs leading-none">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </button>
  )

  // Mobile Viewport: Accessible Bottom Slide-Up Sheet
  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>{TriggerButton}</SheetTrigger>
        <SheetContent
          side="bottom"
          className="!p-0 bg-white dark:bg-[#0D0E12] border-t border-[#E2E8F0] dark:border-white/10 rounded-t-[20px] max-h-[85vh] flex flex-col justify-between overflow-hidden z-50 text-slate-900 dark:text-white shadow-2xl"
        >
          {/* Subtle Mobile Drag Pill Handle */}
          <div className="w-10 h-1 rounded-full bg-slate-300 dark:bg-white/20 mx-auto my-2.5 shrink-0" />
          {renderContent()}
        </SheetContent>
      </Sheet>
    )
  }

  // Desktop Viewport: Crisp Anchored Popover
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{TriggerButton}</PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-[420px] max-w-[calc(100vw-32px)] p-0 bg-white dark:bg-[#0D0E12] border border-[#E2E8F0] dark:border-white/10 rounded-[14px] shadow-2xl overflow-hidden z-50 text-slate-900 dark:text-white"
      >
        {renderContent()}
      </PopoverContent>
    </Popover>
  )
}
