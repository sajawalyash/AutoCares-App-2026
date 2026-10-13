import { supabase } from '@/lib/supabase/client'

export type NotificationType =
  | 'service_request'
  | 'request_accepted'
  | 'request_rejected'
  | 'mechanic_on_way'
  | 'request_completed'
  | 'sos_alert'
  | 'obd_alert'
  | 'system'

export interface NotificationItem {
  id: string
  user_id: string
  title: string
  message: string
  type: NotificationType
  link?: string | null
  is_read: boolean
  metadata?: Record<string, unknown> | null
  created_at: string
}

export interface CreateNotificationParams {
  userId: string
  title: string
  message: string
  type?: NotificationType
  link?: string | null
  metadata?: Record<string, unknown>
}

/**
 * Inserts a new notification into Supabase and broadcasts via Realtime channel.
 */
export async function sendNotification({
  userId,
  title,
  message,
  type = 'system',
  link = null,
  metadata = {},
}: CreateNotificationParams): Promise<NotificationItem | null> {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        title,
        message,
        type,
        link,
        metadata,
        is_read: false,
      })
      .select()
      .single()

    if (error) {
      console.warn('Could not persist notification in database (table may be pending migration):', error.message)
    }

    // Also broadcast on the user's specific notification channel for instantaneous delivery
    const channel = supabase.channel(`user-notifications:${userId}`)
    await new Promise<void>((resolve) => {
      channel.subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          channel.send({
            type: 'broadcast',
            event: 'notification',
            payload: {
              id: data?.id || `temp-${Date.now()}`,
              user_id: userId,
              title,
              message,
              type,
              link,
              is_read: false,
              metadata,
              created_at: new Date().toISOString(),
            },
          }).then(() => {
            setTimeout(() => {
              supabase.removeChannel(channel)
              resolve()
            }, 300)
          }).catch(() => resolve())
        }
      })
    })

    return (data as NotificationItem) || {
      id: `temp-${Date.now()}`,
      user_id: userId,
      title,
      message,
      type,
      link,
      is_read: false,
      metadata,
      created_at: new Date().toISOString(),
    }
  } catch (err) {
    console.error('Error sending notification:', err)
    return null
  }
}

/**
 * Fetch latest notifications for a specific user.
 */
export async function fetchUserNotifications(userId: string, limit = 40): Promise<NotificationItem[]> {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.warn('Could not fetch notifications:', error.message)
      return []
    }

    return (data || []) as NotificationItem[]
  } catch (err) {
    console.error('Error fetching user notifications:', err)
    return []
  }
}

/**
 * Mark a single notification as read.
 */
export async function markNotificationAsRead(notificationId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId)

    if (error) {
      console.warn('Error marking notification as read:', error.message)
      return false
    }
    return true
  } catch (err) {
    console.error('Error in markNotificationAsRead:', err)
    return false
  }
}

/**
 * Mark all notifications for a user as read.
 */
export async function markAllNotificationsAsRead(userId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false)

    if (error) {
      console.warn('Error marking all notifications as read:', error.message)
      return false
    }
    return true
  } catch (err) {
    console.error('Error in markAllNotificationsAsRead:', err)
    return false
  }
}

/**
 * Delete a notification by ID.
 */
export async function deleteNotification(notificationId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId)

    if (error) {
      console.warn('Error deleting notification:', error.message)
      return false
    }
    return true
  } catch (err) {
    console.error('Error in deleteNotification:', err)
    return false
  }
}
