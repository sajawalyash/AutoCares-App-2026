'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSessionOrClearToken, supabase } from '@/lib/supabase/client'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Star, MessageSquare, Loader, User } from 'lucide-react'
import { NotificationBell } from '@/components/notifications/notification-bell'

interface Review {
  id: string
  mechanic: string
  rating: number
  comment: string
  date: string
}

export default function Ratings() {
  const router = useRouter()
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const session = await getSessionOrClearToken()
        if (session) {
          setUser(session.user)
        }

        // Query real reviews from service_requests or service_history
        const { data: requestReviews, error } = await supabase
          .from('service_requests')
          .select('id, mechanic_name, feedback, rating, created_at, problem')
          .not('rating', 'is', null)
          .order('created_at', { ascending: false })
          .limit(30)

        if (!error && requestReviews && requestReviews.length > 0) {
          const mapped: Review[] = requestReviews.map((row: any) => ({
            id: String(row.id),
            mechanic: row.mechanic_name || 'Verified Mechanic',
            rating: Number(row.rating) || 5,
            comment: row.feedback || `Service completed for: ${row.problem || 'vehicle issue'}`,
            date: row.created_at ? row.created_at.split('T')[0] : 'Recent',
          }))
          setReviews(mapped)
          return
        }

        // If no request reviews, check service_history
        const { data: historyReviews } = await supabase
          .from('service_history')
          .select('id, mechanic_id, feedback, rating, created_at')
          .not('rating', 'is', null)
          .order('created_at', { ascending: false })
          .limit(30)

        if (historyReviews && historyReviews.length > 0) {
          const mapped: Review[] = historyReviews.map((row: any) => ({
            id: String(row.id),
            mechanic: 'AutoCares Partner Mechanic',
            rating: Number(row.rating) || 5,
            comment: row.feedback || 'Excellent roadside service provided.',
            date: row.created_at ? row.created_at.split('T')[0] : 'Recent',
          }))
          setReviews(mapped)
        } else {
          setReviews([])
        }
      } catch (err) {
        console.error('Error fetching reviews:', err)
        setReviews([])
      } finally {
        setLoading(false)
      }
    }

    fetchReviews()
  }, [])

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
            <h1 className="text-xl font-bold text-gray-900">Ratings & Reviews</h1>
          </div>
          <NotificationBell />
        </div>
      </header>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {reviews.length === 0 ? (
          <Card className="p-12 text-center border-dashed">
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4 text-yellow-600">
              <Star className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">No Reviews Yet</h3>
            <p className="text-sm text-gray-600 max-w-sm mx-auto mb-6">
              Ratings and reviews from real completed service requests will appear here.
            </p>
            <Button
              onClick={() => router.push('/tracking')}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              View Active Services
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <Card key={review.id} className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                      {review.mechanic[0] || 'M'}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{review.mechanic}</h3>
                      <p className="text-xs text-gray-500">{review.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < review.rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <p className="text-sm text-gray-700">{review.comment}</p>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
