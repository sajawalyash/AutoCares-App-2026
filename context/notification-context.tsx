'use client'

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  NotificationItem,
  CreateNotificationParams,
  fetchUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  sendNotification as apiSendNotification,
} from '@/lib/notifications'
import { playChimeSound, playAlertSound } from '@/lib/sound'
import { getSessionOrClearToken, supabase } from '@/lib/supabase/client'

interface NotificationContextType {
  notifications: NotificationItem[]
  unreadCount: number
  loading: boolean
  soundEnabled: boolean
  setSoundEnabled: (enabled: boolean) => void
  browserPermission: NotificationPermission
  requestBrowserPermission: () => Promise<boolean>
  markAsRead: (id: string) => Promise<void>
  markAllAsRead: () => Promise<void>
  removeNotification: (id: string) => Promise<void>
  sendNotification: (params: Omit<CreateNotificationParams, 'userId'> & { userId?: string }) => Promise<void>
  refreshNotifications: () => Promise<void>
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

const SOUND_STORAGE_KEY = 'autocares_notification_sound'

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [soundEnabled, setSoundEnabledState] = useState<boolean>(true)
  const [browserPermission, setBrowserPermission] = useState<NotificationPermission>('default')
  
  // Track processed notification IDs to prevent duplicate toasts
  const processedIds = useRef<Set<string>>(new Set())

  // Load sound preference from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(SOUND_STORAGE_KEY)
      if (stored !== null) {
        setSoundEnabledState(stored === 'true')
      }
      if ('Notification' in window) {
        setBrowserPermission(Notification.permission)
      }
    }
  }, [])

  const setSoundEnabled = (enabled: boolean) => {
    setSoundEnabledState(enabled)
    if (typeof window !== 'undefined') {
      localStorage.setItem(SOUND_STORAGE_KEY, String(enabled))
    }
  }

  const requestBrowserPermission = async (): Promise<boolean> => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return false
    }
    try {
      const perm = await Notification.requestPermission()
      setBrowserPermission(perm)
      return perm === 'granted'
    } catch {
      return false
    }
  }

  // Handle incoming notification event (audio, toast, browser push)
  const handleIncomingNotification = useCallback(
    (notification: NotificationItem) => {
      if (processedIds.current.has(notification.id)) {
        return
      }
      processedIds.current.add(notification.id)

      // 1. Update state
      setNotifications((prev) => {
        const exists = prev.some((n) => n.id === notification.id)
        if (exists) return prev
        return [notification, ...prev]
      })

      // 2. Play sound
      if (soundEnabled) {
        if (notification.type === 'sos_alert' || notification.type === 'service_request') {
          playAlertSound()
        } else {
          playChimeSound()
        }
      }

      // 3. Trigger Sonner Toast
      const toastTitle = notification.title
      const toastDesc = notification.message

      const toastOptions = {
        description: toastDesc,
        duration: 7000,
        action: notification.link
          ? {
              label: 'View',
              onClick: () => {
                if (notification.link) {
                  markNotificationAsRead(notification.id)
                  router.push(notification.link)
                }
              },
            }
          : undefined,
      }

      switch (notification.type) {
        case 'sos_alert':
        case 'request_rejected':
          toast.error(toastTitle, toastOptions)
          break
        case 'request_accepted':
        case 'mechanic_on_way':
        case 'request_completed':
          toast.success(toastTitle, toastOptions)
          break
        case 'service_request':
        case 'obd_alert':
          toast.warning(toastTitle, toastOptions)
          break
        default:
          toast.info(toastTitle, toastOptions)
          break
      }

      // 4. Browser Native Notification
      if (
        typeof window !== 'undefined' &&
        'Notification' in window &&
        Notification.permission === 'granted' &&
        document.visibilityState !== 'visible'
      ) {
        try {
          const nativeNotice = new Notification(`AutoCares: ${notification.title}`, {
            body: notification.message,
            icon: '/icon.svg',
          })
          nativeNotice.onclick = () => {
            window.focus()
            if (notification.link) {
              router.push(notification.link)
            }
          }
        } catch {
          // ignore native notification errors
        }
      }
    },
    [router, soundEnabled]
  )

  // Fetch initial notifications
  const loadNotifications = useCallback(async (userId: string) => {
    setLoading(true)
    try {
      const items = await fetchUserNotifications(userId)
      setNotifications(items)
      items.forEach((item) => processedIds.current.add(item.id))
    } finally {
      setLoading(false)
    }
  }, [])

  // Listen to Auth State
  useEffect(() => {
    let isMounted = true

    const checkUser = async () => {
      const session = await getSessionOrClearToken()
      if (isMounted) {
        if (session?.user) {
          setCurrentUser(session.user)
          loadNotifications(session.user.id)
        } else {
          setCurrentUser(null)
          setNotifications([])
          setLoading(false)
        }
      }
    }

    checkUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (isMounted) {
        if (session?.user) {
          setCurrentUser(session.user)
          loadNotifications(session.user.id)
        } else {
          setCurrentUser(null)
          setNotifications([])
        }
      }
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [loadNotifications])

  // Setup Realtime Channels for the logged-in user
  useEffect(() => {
    if (!currentUser?.id) return

    const userId = currentUser.id

    // 1. Channel for database row changes in notifications table
    const dbChannel = supabase
      .channel(`realtime:notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          if (payload.new) {
            handleIncomingNotification(payload.new as NotificationItem)
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          if (payload.new) {
            setNotifications((prev) =>
              prev.map((item) => (item.id === payload.new.id ? (payload.new as NotificationItem) : item))
            )
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          if (payload.old) {
            setNotifications((prev) => prev.filter((item) => item.id !== payload.old.id))
          }
        }
      )
      .subscribe()

    // 2. Instant broadcast channel for direct peer-to-peer / server dispatch
    const broadcastChannel = supabase
      .channel(`user-notifications:${userId}`)
      .on('broadcast', { event: 'notification' }, (event) => {
        if (event.payload) {
          handleIncomingNotification(event.payload as NotificationItem)
        }
      })
      .subscribe()

    // 3. Fallback listener on service_requests table directly
    // This ensures notifications trigger in real-time even if table triggers are not installed in DB yet
    const userType = currentUser.user_metadata?.user_type
    const reqFilter =
      userType === 'mechanic' ? `mechanic_id=eq.${userId}` : `customer_id=eq.${userId}`

    const serviceReqChannel = supabase
      .channel(`realtime:service_requests_notice:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'service_requests',
          filter: reqFilter,
        },
        (payload) => {
          const row = payload.new
          if (!row) return

          if (userType !== 'mechanic') {
            // Customer notifications
            if (row.status === 'assigned') {
              handleIncomingNotification({
                id: `sr-assigned-${row.id}-${Date.now()}`,
                user_id: userId,
                title: 'Mechanic Assigned!',
                message: 'A mechanic accepted your request and is preparing to arrive.',
                type: 'request_accepted',
                link: '/tracking',
                is_read: false,
                metadata: { request_id: row.id },
                created_at: new Date().toISOString(),
              })
            } else if (row.status === 'on_way') {
              handleIncomingNotification({
                id: `sr-onway-${row.id}-${Date.now()}`,
                user_id: userId,
                title: 'Mechanic On The Way!',
                message: 'Your mechanic is en route to your vehicle.',
                type: 'mechanic_on_way',
                link: '/tracking',
                is_read: false,
                metadata: { request_id: row.id },
                created_at: new Date().toISOString(),
              })
            } else if (row.status === 'rejected') {
              handleIncomingNotification({
                id: `sr-rejected-${row.id}-${Date.now()}`,
                user_id: userId,
                title: 'Request Declined',
                message: 'The mechanic was unable to accept. Please choose another nearby mechanic.',
                type: 'request_rejected',
                link: '/mechanics',
                is_read: false,
                metadata: { request_id: row.id },
                created_at: new Date().toISOString(),
              })
            } else if (row.status === 'completed') {
              handleIncomingNotification({
                id: `sr-completed-${row.id}-${Date.now()}`,
                user_id: userId,
                title: 'Service Completed',
                message: 'Your service request has been completed! Leave a review.',
                type: 'request_completed',
                link: '/ratings',
                is_read: false,
                metadata: { request_id: row.id },
                created_at: new Date().toISOString(),
              })
            }
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'service_requests',
          filter: `mechanic_id=eq.${userId}`,
        },
        (payload) => {
          const row = payload.new
          if (row && userType === 'mechanic') {
            handleIncomingNotification({
              id: `sr-new-${row.id}-${Date.now()}`,
              user_id: userId,
              title: 'New Service Request!',
              message: row.problem || 'A driver nearby needs your assistance.',
              type: 'service_request',
              link: '/mechanic/dashboard',
              is_read: false,
              metadata: { request_id: row.id },
              created_at: new Date().toISOString(),
            })
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(dbChannel)
      supabase.removeChannel(broadcastChannel)
      supabase.removeChannel(serviceReqChannel)
    }
  }, [currentUser, handleIncomingNotification])

  const markAsRead = async (id: string) => {
    // Optimistic update
    setNotifications((prev) =>
      prev.map((item) => (item.id === id ? { ...item, is_read: true } : item))
    )
    await markNotificationAsRead(id)
  }

  const markAllAsRead = async () => {
    if (!currentUser?.id) return
    // Optimistic update
    setNotifications((prev) => prev.map((item) => ({ ...item, is_read: true })))
    await markAllNotificationsAsRead(currentUser.id)
  }

  const removeNotification = async (id: string) => {
    // Optimistic update
    setNotifications((prev) => prev.filter((item) => item.id !== id))
    await deleteNotification(id)
  }

  const sendNotification = async (
    params: Omit<CreateNotificationParams, 'userId'> & { userId?: string }
  ) => {
    const targetUserId = params.userId || currentUser?.id || 'current-user'

    // If notifying current user (e.g. Test Alert or local action), render immediately
    if (!params.userId || params.userId === currentUser?.id) {
      handleIncomingNotification({
        id: `notice-${Date.now()}`,
        user_id: targetUserId,
        title: params.title,
        message: params.message,
        type: params.type || 'system',
        link: params.link || null,
        is_read: false,
        metadata: params.metadata || null,
        created_at: new Date().toISOString(),
      })
    }

    if (currentUser?.id) {
      await apiSendNotification({
        ...params,
        userId: targetUserId,
      })
    }
  }

  const refreshNotifications = async () => {
    if (currentUser?.id) {
      await loadNotifications(currentUser.id)
    }
  }

  const unreadCount = notifications.filter((n) => !n.is_read).length

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        soundEnabled,
        setSoundEnabled,
        browserPermission,
        requestBrowserPermission,
        markAsRead,
        markAllAsRead,
        removeNotification,
        sendNotification,
        refreshNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}
