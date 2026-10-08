'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSessionOrClearToken, supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ArrowLeft, MapPin, Phone, MessageCircle, CheckCircle, Clock, Loader } from 'lucide-react'

interface ServiceRequest {
  id: string
  status: 'pending' | 'assigned' | 'on_way' | 'completed'
  mechanicName: string
  mechanicPhone: string
  customerName: string
  customerPhone: string
  estimatedTime: number
  location: string
  problem: string
  createdAt: Date
}

// Removed mock data

const statusConfig = {
  pending: { icon: Clock, label: 'Pending', color: 'text-yellow-600', bg: 'bg-yellow-50' },
  assigned: { icon: CheckCircle, label: 'Mechanic Assigned', color: 'text-purple-600', bg: 'bg-purple-50' },
  on_way: { icon: MapPin, label: 'On the Way', color: 'text-purple-600', bg: 'bg-purple-50' },
  completed: { icon: CheckCircle, label: 'Completed', color: 'text-green-600', bg: 'bg-green-50' },
}

export default function Tracking() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [requests, setRequests] = useState<ServiceRequest[]>([])
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const init = async () => {
      const session = await getSessionOrClearToken()
      if (!session) {
        router.push('/auth/login')
        return
      }
      setUser(session.user)

      // ✅ Fix Bug #9: Fetch real service requests from Supabase
      try {
        const userId = session.user.id
        const userType = session.user.user_metadata?.user_type
        const column = userType === 'mechanic' ? 'mechanic_id' : 'customer_id'

        const { data, error } = await supabase
          .from('service_requests')
          .select('*')
          .eq(column, userId)
          .order('created_at', { ascending: false })
          .limit(20)

        if (error) throw error

        if (data && data.length > 0) {
          const mapped: ServiceRequest[] = data.map((row: any) => ({
            id: String(row.id),
            status: row.status || 'pending',
            mechanicName: row.mechanic_name || row.mechanic_id || 'Assigned Mechanic',
            mechanicPhone: row.mechanic_phone || 'N/A',
            customerName: row.customer_name || row.customer_id || 'Customer',
            customerPhone: row.customer_phone || 'N/A',
            estimatedTime: Number(row.estimated_time) || 15,
            location: row.location || 'Location not provided',
            problem: row.problem || 'Vehicle issue',
            createdAt: new Date(row.created_at),
          }))
          setRequests(mapped)
          if (mapped.length > 0) setExpandedId(mapped[0].id)
        } else {
          // No data found, set to empty
          setRequests([])
          setExpandedId(null)
        }
      } catch (err) {
        console.error('Failed to load service requests:', err)
        setRequests([])
        setExpandedId(null)
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [router])

  const getStatusProgress = (status: ServiceRequest['status']): number => {
    return { pending: 25, assigned: 50, on_way: 75, completed: 100 }[status]
  }

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
          <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-lg transition">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              {user?.user_metadata?.user_type === 'mechanic' ? 'Live Job Tracking' : 'Track Service'}
            </h1>
            <p className="text-sm text-gray-600">
              {user?.user_metadata?.user_type === 'mechanic' ? 'Monitor route progress' : 'Monitor your service requests'}
            </p>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {requests.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Active Requests</h3>
            <p className="text-gray-600 mb-6">You don't have any active service requests at the moment.</p>
            {user?.user_metadata?.user_type === 'mechanic' ? (
              <Button onClick={() => router.push('/mechanic/dashboard')} className="bg-purple-600 hover:bg-purple-700">
                Back to Dashboard
              </Button>
            ) : (
              <Button onClick={() => router.push('/assistance/request')} className="bg-purple-600 hover:bg-purple-700">
                Request Roadside Help
              </Button>
            )}
          </Card>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => {
              const config = statusConfig[request.status]
              const StatusIcon = config.icon
              const isExpanded = expandedId === request.id

              return (
                <Card
                  key={request.id}
                  className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => setExpandedId(isExpanded ? null : request.id)}
                >
                  <div className={`p-6 ${config.bg}`}>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <StatusIcon className={`w-6 h-6 ${config.color}`} />
                        <div>
                          <p className="text-sm font-semibold text-gray-600">{config.label}</p>
                          <h3 className="text-lg font-bold text-gray-900">{request.problem}</h3>
                        </div>
                      </div>
                      <span className="text-sm text-gray-600">{request.createdAt.toLocaleDateString()}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-purple-600 to-purple-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${getStatusProgress(request.status)}%` }}
                      />
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="border-t border-gray-200 p-6 space-y-4">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm text-gray-600 mb-2">
                          {user?.user_metadata?.user_type === 'mechanic' ? 'Customer' : 'Assigned Mechanic'}
                        </p>
                        <h4 className="font-bold text-gray-900 mb-2">
                          {user?.user_metadata?.user_type === 'mechanic' ? request.customerName : request.mechanicName}
                        </h4>
                        <div className="flex gap-2">
                          <Button variant="outline" className="flex-1 border-gray-300">
                            <Phone className="w-4 h-4 mr-2" />Call
                          </Button>
                          <Button variant="outline" className="flex-1 border-gray-300">
                            <MessageCircle className="w-4 h-4 mr-2" />Message
                          </Button>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600 mb-1">📍 Location</p>
                          <p className="font-semibold text-gray-900">{request.location}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-1">⏱️ ETA</p>
                          <p className="font-semibold text-gray-900">{request.estimatedTime} minutes</p>
                        </div>
                      </div>

                      {request.status !== 'completed' && (
                        <div className="flex gap-2 pt-4 border-t border-gray-200">
                          <Button variant="outline" className="flex-1 border-red-200 text-red-600 hover:bg-red-50">
                            Cancel Request
                          </Button>
                          <Button className="flex-1 bg-purple-600 hover:bg-purple-700">
                            {user?.user_metadata?.user_type === 'mechanic' ? 'Contact Customer' : 'Contact Mechanic'}
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </Card>
              )
            })}
          </div>
        )}

        <div className="mt-8 text-center">
          {user?.user_metadata?.user_type === 'mechanic' ? (
            <Button onClick={() => router.push('/mechanic/dashboard')} className="bg-purple-600 hover:bg-purple-700">
              Back to Dashboard
            </Button>
          ) : (
            <Button onClick={() => router.push('/assistance/request')} className="bg-purple-600 hover:bg-purple-700">
              Request New Service
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
