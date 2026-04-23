'use client'

import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { ArrowLeft, Star, MessageSquare } from 'lucide-react'

interface Review {
  id: string
  mechanic: string
  rating: number
  comment: string
  date: string
}

const MOCK_REVIEWS: Review[] = [
  {
    id: '1',
    mechanic: "John's Auto Repair",
    rating: 5,
    comment: 'Excellent service! Fixed my car quickly and at a great price.',
    date: '2024-03-08',
  },
  {
    id: '2',
    mechanic: 'Quick Fix Garage',
    rating: 4,
    comment: 'Good service but took longer than expected.',
    date: '2024-02-15',
  },
  {
    id: '3',
    mechanic: 'Premium Auto Service',
    rating: 5,
    comment: 'Professional team, very knowledgeable. Highly recommend!',
    date: '2024-01-28',
  },
]

export default function Ratings() {
  const router = useRouter()

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
          <h1 className="text-xl font-bold text-gray-900">Ratings & Reviews</h1>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-4">
          {MOCK_REVIEWS.map((review) => (
            <Card key={review.id} className="p-6">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-bold text-gray-900">{review.mechanic}</h3>
                  <p className="text-sm text-gray-600">
                    {new Date(review.date).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < review.rating
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <p className="text-gray-700">{review.comment}</p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
