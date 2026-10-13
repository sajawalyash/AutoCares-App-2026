'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { getSessionOrClearToken, supabase } from '@/lib/supabase/client'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Star, Calendar, Loader, History as HistoryIcon, Wrench } from 'lucide-react'
import { NotificationBell } from '@/components/notifications/notification-bell'

interface ServiceRecord {
  id: string
  date: string
  name: string
  service: string
  rating: number
  cost: number
  duration: string
}

export default function History() {
  const router = useRouter()
  const [userType, setUserType] = useState<'customer' | 'mechanic'>('customer')
  const [historyData, setHistoryData] = useState<ServiceRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      const session = await getSessionOrClearToken()
      if (!session) {
        router.push('/auth/login')
        return
      }

      const type: 'customer' | 'mechanic' =
        session.user.user_metadata?.user_type === 'mechanic' ? 'mechanic' : 'customer'
      setUserType(type)

      try {
        const column = type === 'mechanic' ? 'mechanic_id' : 'customer_id'

        // 1. First check service_history table
        const { data: historyRows } = await supabase
          .from('service_history')
          .select('*')
          .eq(column, session.user.id)
          .order('completed_at', { ascending: false })

        if (historyRows && historyRows.length > 0) {
          const mapped: ServiceRecord[] = historyRows.map((row: any) => ({
            id: String(row.id),
            date: row.completed_at ? row.completed_at.split('T')[0] : row.created_at?.split('T')[0] || '',
            name:
              type === 'mechanic'
                ? row.customer_name || 'Customer'
                : row.mechanic_name || row.business_name || 'Mechanic',
            service: row.service || row.service_type || 'Roadside Assistance',
            rating: Number(row.rating) || 0,
            cost: Number(row.cost) || 0,
            duration: row.duration || '-',
          }))
          setHistoryData(mapped)
          return
        }

        // 2. Also check completed service_requests
        const { data: completedRequests } = await supabase
          .from('service_requests')
          .select('*')
          .eq(column, session.user.id)
          .eq('status', 'completed')
          .order('created_at', { ascending: false })

        if (completedRequests && completedRequests.length > 0) {
          const mapped: ServiceRecord[] = completedRequests.map((row: any) => ({
            id: String(row.id),
            date: row.completed_at ? row.completed_at.split('T')[0] : row.created_at?.split('T')[0] || '',
            name:
              type === 'mechanic'
                ? row.customer_name || 'Customer'
                : row.mechanic_name || 'Assigned Mechanic',
            service: row.problem || row.problem_description || 'Vehicle Service',
            rating: Number(row.rating) || 5,
            cost: Number(row.estimated_cost || row.cost || 0),
            duration: '30 mins',
          }))
          setHistoryData(mapped)
        } else {
          setHistoryData([])
        }
      } catch (err) {
        console.error('Failed to load history:', err)
        setHistoryData([])
      } finally {
        setLoading(false)
      }
    }
    checkAuth()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-purple-50">
        <Loader className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <h1 className="text-xl font-bold text-gray-900">
              {userType === 'mechanic' ? 'Job History' : 'Service History'}
            </h1>
          </div>
          <NotificationBell />
        </div>
      </header>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {historyData.length === 0 ? (
          <Card className="p-12 text-center border-dashed">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 text-purple-600">
              <HistoryIcon className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">No Service History Yet</h3>
            <p className="text-sm text-gray-600 max-w-sm mx-auto mb-6">
              {userType === 'mechanic'
                ? 'Your completed jobs and earnings will appear here once you finish service calls.'
                : 'Your completed roadside assistance and maintenance records will be displayed here.'}
            </p>
            <Button
              onClick={() =>
                router.push(userType === 'mechanic' ? '/mechanic/dashboard' : '/assistance/request')
              }
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              {userType === 'mechanic' ? 'View Mechanic Dashboard' : 'Request Assistance'}
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {historyData.map((item) => (
              <Card key={item.id} className="p-6 hover:shadow-md transition">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
                        <Wrench className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">{item.name}</h3>
                        <p className="text-sm text-gray-600">{item.service}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-gray-500 mt-3">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{item.date || 'Recent'}</span>
                      </div>
                      {item.duration !== '-' && <span>Duration: {item.duration}</span>}
                      {item.cost > 0 && <span className="font-semibold text-gray-700">Cost: Rs {item.cost}</span>}
                    </div>
                  </div>

                  {item.rating > 0 && (
                    <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded border border-yellow-200">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs font-bold text-yellow-700">{item.rating}</span>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
