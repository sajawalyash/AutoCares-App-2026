'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  Volume2,
  VolumeX,
  BellRing,
  Wrench,
  CheckCircle2,
  XCircle,
  Navigation,
  AlertTriangle,
  AlertCircle,
  Info,
  Clock,
  Sparkles,
  ExternalLink,
} from 'lucide-react'
import { useNotifications } from '@/context/notification-context'
import { NotificationItem, NotificationType } from '@/lib/notifications'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'

function formatRelativeTime(dateString: string): string {
  try {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 30) return 'Just now'
    if (diffInSeconds < 60) return `${diffInSeconds}s ago`
    const diffInMinutes = Math.floor(diffInSeconds / 60)
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours}h ago`
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays}d ago`
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  } catch {
    return 'Recent'
  }
}

function getNotificationIcon(type: NotificationType) {
  switch (type) {
    case 'service_request':
      return { icon: Wrench, bg: 'bg-purple-100 text-purple-600 border-purple-200' }
    case 'request_accepted':
      return { icon: CheckCircle2, bg: 'bg-emerald-100 text-emerald-600 border-emerald-200' }
    case 'request_rejected':
      return { icon: XCircle, bg: 'bg-rose-100 text-rose-600 border-rose-200' }
    case 'mechanic_on_way':
      return { icon: Navigation, bg: 'bg-blue-100 text-blue-600 border-blue-200' }
    case 'request_completed':
      return { icon: Sparkles, bg: 'bg-teal-100 text-teal-600 border-teal-200' }
    case 'sos_alert':
      return { icon: AlertTriangle, bg: 'bg-red-100 text-red-600 border-red-200 animate-pulse' }
    case 'obd_alert':
      return { icon: AlertCircle, bg: 'bg-amber-100 text-amber-600 border-amber-200' }
    default:
      return { icon: Info, bg: 'bg-slate-100 text-slate-600 border-slate-200' }
  }
}

interface NotificationBellProps {
  className?: string
}

export function NotificationBell({ className = '' }: NotificationBellProps) {
  const router = useRouter()
  const {
    notifications,
    unreadCount,
    soundEnabled,
    setSoundEnabled,
    browserPermission,
    requestBrowserPermission,
    markAsRead,
    markAllAsRead,
    removeNotification,
    sendNotification,
  } = useNotifications()

  const [isOpen, setIsOpen] = useState(false)
  const [filter, setFilter] = useState<'all' | 'unread'>('all')

  const filteredNotifications = notifications.filter((item) =>
    filter === 'unread' ? !item.is_read : true
  )

  const handleItemClick = (item: NotificationItem) => {
    if (!item.is_read) {
      markAsRead(item.id)
    }
    if (item.link) {
      setIsOpen(false)
      router.push(item.link)
    }
  }

  const handleTestNotification = async () => {
    await sendNotification({
      title: 'Realtime Alert Active! 🚗',
      message: 'Your realtime notification system is connected and functioning properly.',
      type: 'system',
      link: '/dashboard',
    })
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          aria-label="Notifications"
          className={`relative p-2 rounded-full hover:bg-gray-100 transition focus:outline-none focus:ring-2 focus:ring-purple-500/20 text-gray-700 ${className}`}
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-600 px-1 text-[11px] font-bold text-white shadow-sm ring-2 ring-white animate-in zoom-in-50">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-80 sm:w-96 p-0 border border-slate-200 shadow-xl rounded-xl overflow-hidden bg-white z-50"
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-slate-900 text-sm">Notifications</h3>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="bg-purple-100 text-purple-700 text-xs px-2 py-0">
                {unreadCount} new
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-1">
            {/* Sound toggle button */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={soundEnabled ? 'Disable notification sounds' : 'Enable notification sounds'}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 transition text-xs"
            >
              {soundEnabled ? (
                <Volume2 className="w-4 h-4 text-purple-600" />
              ) : (
                <VolumeX className="w-4 h-4 text-slate-400" />
              )}
            </button>

            {/* Browser permission button */}
            {browserPermission !== 'granted' && (
              <button
                onClick={requestBrowserPermission}
                title="Enable browser push notifications"
                className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50 transition"
              >
                <BellRing className="w-4 h-4" />
              </button>
            )}

            {/* Mark all as read */}
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="text-xs h-7 px-2 text-purple-600 hover:text-purple-700 hover:bg-purple-50"
              >
                <CheckCheck className="w-3.5 h-3.5 mr-1" />
                Read all
              </Button>
            )}
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex border-b border-slate-100 px-3 pt-2 bg-white gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`pb-2 px-2 text-xs font-medium border-b-2 transition ${
              filter === 'all'
                ? 'border-purple-600 text-purple-700'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            All ({notifications.length})
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`pb-2 px-2 text-xs font-medium border-b-2 transition ${
              filter === 'unread'
                ? 'border-purple-600 text-purple-700'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Unread ({unreadCount})
          </button>
        </div>

        {/* Notifications List */}
        <ScrollArea className="max-h-[380px] min-h-[140px] overflow-y-auto">
          {filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-2">
                <Bell className="w-5 h-5" />
              </div>
              <p className="text-sm font-medium text-slate-700">No notifications</p>
              <p className="text-xs text-slate-400 mt-1 max-w-[200px]">
                {filter === 'unread'
                  ? 'All caught up! No unread notifications.'
                  : 'You will receive real-time updates when services or alerts occur.'}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={handleTestNotification}
                className="mt-4 text-xs h-7 border-dashed border-purple-300 text-purple-600 hover:bg-purple-50"
              >
                Send Test Alert
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredNotifications.map((item) => {
                const iconInfo = getNotificationIcon(item.type)
                const IconComponent = iconInfo.icon

                return (
                  <div
                    key={item.id}
                    onClick={() => handleItemClick(item)}
                    className={`group relative p-3.5 flex items-start gap-3 transition cursor-pointer hover:bg-slate-50 ${
                      !item.is_read ? 'bg-purple-50/30' : 'bg-white'
                    }`}
                  >
                    {/* Notification Type Icon */}
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center border shrink-0 mt-0.5 ${iconInfo.bg}`}
                    >
                      <IconComponent className="w-4 h-4" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 pr-4">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <p
                          className={`text-xs font-semibold truncate ${
                            !item.is_read ? 'text-slate-900 font-bold' : 'text-slate-700'
                          }`}
                        >
                          {item.title}
                        </p>
                        {!item.is_read && (
                          <span className="w-1.5 h-1.5 rounded-full bg-purple-600 shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {item.message}
                      </p>
                      <div className="flex items-center gap-1 mt-1.5 text-[11px] text-slate-400">
                        <Clock className="w-3 h-3" />
                        <span>{formatRelativeTime(item.created_at)}</span>
                        {item.link && (
                          <span className="flex items-center gap-0.5 ml-2 text-purple-600 font-medium hover:underline">
                            Open <ExternalLink className="w-2.5 h-2.5" />
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action buttons on hover */}
                    <div className="absolute right-2 top-3 opacity-0 group-hover:opacity-100 flex items-center gap-1 transition bg-white/90 p-0.5 rounded shadow-sm border border-slate-200">
                      {!item.is_read && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            markAsRead(item.id)
                          }}
                          title="Mark as read"
                          className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-emerald-600 transition"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          removeNotification(item.id)
                        }}
                        title="Delete notification"
                        className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-rose-600 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        {filteredNotifications.length > 0 && (
          <div className="p-2 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between px-3">
            <span className="text-[11px] text-slate-400">
              {unreadCount} unread
            </span>
            <button
              onClick={handleTestNotification}
              className="text-[11px] text-purple-600 hover:text-purple-700 font-medium hover:underline"
            >
              Test Alert
            </button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
