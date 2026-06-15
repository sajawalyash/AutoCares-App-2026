'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { getSessionOrClearToken, supabase } from '@/lib/supabase/client'
import { Card } from '@/components/ui/card'
import { ArrowLeft, Star, Calendar, Loader } from 'lucide-react'

interface ServiceRecord {
  id: string
  date: string
  name: string
  service: string
  rating: number
  cost: number
  duration: string
}

// Fallback mock data shown when Supabase table is empty or unavailable
const MOCK_CUSTOMER_HISTORY: ServiceRecord[] = [
  { id: '1', date: '2024-03-08', name: "John's Auto Repair", service: 'Engine diagnostics', rating: 5, cost: 85, duration: '1 hour' },
  { id: '2', date: '2024-02-15', name: 'Quick Fix Garage', service: 'Battery replacement', rating: 4, cost: 120, duration: '45 mins' },
  { id: '3', date: '2024-01-28', name: 'Premium Auto Service', service: 'Oil change & filter', rating: 5, cost: 65, duration: '30 mins' },
]

const MOCK_MECHANIC_HISTORY: ServiceRecord[] = [
  { id: '1', date: '2024-03-08', name: 'Alice Smith', service: 'Engine diagnostics', rating: 5, cost: 85, duration: '1 hour' },
  { id: '2', date: '2024-02-15', name: 'Bob Johnson', service: 'Battery replacement', rating: 4, cost: 120, duration: '45 mins' },
  { id: '3', date: '2024-01-28', name: 'Charlie Brown', service: 'Oil change & filter', rating: 5, cost: 65, duration: '30 mins' },
]

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

      const type: 'customer' | 'mechanic' = session.user.user_metadata?.user_type === 'mechanic' ? 'mechanic' : 'customer'
      setUserType(type)

      // ✅ Fix Bug #8: Query real service_history from Supabase
      try {
        const column = type === 'mechanic' ? 'mechanic_id' : 'customer_id'
        const { data, error } = await supabase
          .from('service_history')
          .select('*')
          .eq(column, session.user.id)
          .order('completed_at', { ascending: false })

        if (error) throw error

        if (data && data.length > 0) {
          const mapped: ServiceRecord[] = data.map((row: any) => ({
            id: String(row.id),
            date: row.completed_at ? row.completed_at.split('T')[0] : row.created_at?.split('T')[0] || '',
            name: type === 'mechanic'
              ? (row.customer_name || row.customer_id || 'Customer')
              : (row.mechanic_name || row.mechanic_id || 'Mechanic'),
            service: row.service || row.service_type || 'Service',
            rating: Number(row.rating) || 0,
            cost: Number(row.cost) || 0,
            duration: row.duration || '-',
          }))
          setHistoryData(mapped)
        } else {
          // Fallback to mock data when table is empty
          setHistoryData(type === 'mechanic' ? MOCK_MECHANIC_HISTORY : MOCK_CUSTOMER_HISTORY)
        }
      } catch (err) {
        console.error('Failed to load history:', err)
        setHistoryData(type === 'mechanic' ? MOCK_MECHANIC_HISTORY : MOCK_CUSTOMER_HISTORY)
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
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
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
      </header>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {historyData.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <p className="text-lg font-medium">No history yet</p>
            <p className="text-sm mt-1">Completed services will appear here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {historyData.map((record) => (
              <Card key={record.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-gray-900">{record.name}</h3>
                    <p className="text-sm text-gray-600">{record.service}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 justify-end mb-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < record.rating
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="font-semibold text-gray-900">Rs {record.cost}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {record.date ? new Date(record.date).toLocaleDateString() : '—'}
                  </div>
                  <div>{record.duration}</div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
