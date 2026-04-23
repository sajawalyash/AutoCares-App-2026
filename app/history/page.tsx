'use client'

import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { ArrowLeft, MapPin, Star, Calendar } from 'lucide-react'

interface ServiceRecord {
  id: string
  date: string
  mechanic: string
  service: string
  rating: number
  cost: number
  duration: string
}

const MOCK_HISTORY: ServiceRecord[] = [
  {
    id: '1',
    date: '2024-03-08',
    mechanic: "John's Auto Repair",
    service: 'Engine diagnostics',
    rating: 5,
    cost: 85,
    duration: '1 hour',
  },
  {
    id: '2',
    date: '2024-02-15',
    mechanic: 'Quick Fix Garage',
    service: 'Battery replacement',
    rating: 4,
    cost: 120,
    duration: '45 mins',
  },
  {
    id: '3',
    date: '2024-01-28',
    mechanic: 'Premium Auto Service',
    service: 'Oil change & filter',
    rating: 5,
    cost: 65,
    duration: '30 mins',
  },
]

export default function History() {
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
          <h1 className="text-xl font-bold text-gray-900">Service History</h1>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-4">
          {MOCK_HISTORY.map((record) => (
            <Card key={record.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-bold text-gray-900">{record.mechanic}</h3>
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
                  <p className="font-semibold text-gray-900">${record.cost}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {new Date(record.date).toLocaleDateString()}
                </div>
                <div>{record.duration}</div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
