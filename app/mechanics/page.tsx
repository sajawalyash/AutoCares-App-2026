'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getSessionOrClearToken, supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ArrowLeft, MapPin, Star, Phone, MessageCircle } from 'lucide-react'

interface Mechanic {
  id: string
  name: string
  specialty: string
  distance: number
  rating: number
  reviews: number
  phone: string
  address: string
  image?: string
}

// Mock mechanics data
const MOCK_MECHANICS: Mechanic[] = [
  {
    id: '1',
    name: 'John\'s Auto Repair',
    specialty: 'General Repair & Maintenance',
    distance: 2.3,
    rating: 4.8,
    reviews: 156,
    phone: '+1 (555) 123-4567',
    address: '123 Main St, City',
  },
  {
    id: '2',
    name: 'Quick Fix Garage',
    specialty: 'Emergency Services',
    distance: 1.8,
    rating: 4.6,
    reviews: 89,
    phone: '+1 (555) 234-5678',
    address: '456 Oak Ave, City',
  },
  {
    id: '3',
    name: 'Premium Auto Service',
    specialty: 'Luxury & Performance',
    distance: 4.2,
    rating: 4.9,
    reviews: 203,
    phone: '+1 (555) 345-6789',
    address: '789 Pine Rd, City',
  },
  {
    id: '4',
    name: 'Mobile Mechanic Pro',
    specialty: 'On-Site Service',
    distance: 0.5,
    rating: 4.7,
    reviews: 124,
    phone: '+1 (555) 456-7890',
    address: 'Mobile Service',
  },
  {
    id: '5',
    name: 'Certified Tech Repairs',
    specialty: 'Diagnostic & Repair',
    distance: 3.1,
    rating: 4.5,
    reviews: 98,
    phone: '+1 (555) 567-8901',
    address: '321 Elm St, City',
  },
]

export default function Mechanics() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [mechanics, setMechanics] = useState<Mechanic[]>(MOCK_MECHANICS)
  const [selectedMechanic, setSelectedMechanic] = useState<Mechanic | null>(null)
  const [sortBy, setSortBy] = useState<'distance' | 'rating'>('distance')

  useEffect(() => {
    const checkAuth = async () => {
      const session = await getSessionOrClearToken()
      if (!session) {
        router.push('/auth/login')
      } else {
        setUser(session.user)
      }
    }
    checkAuth()
  }, [router])

  useEffect(() => {
    const sorted = [...mechanics].sort((a, b) => {
      if (sortBy === 'distance') {
        return a.distance - b.distance
      }
      return b.rating - a.rating
    })
    setMechanics(sorted)
  }, [sortBy])

  const handleRequestService = (mechanic: Mechanic) => {
    router.push(`/assistance/request?mechanicId=${mechanic.id}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Find Mechanics</h1>
            <p className="text-sm text-gray-600">Verified mechanics near you</p>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Filter/Sort Bar */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-700 mb-2">Sort by:</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setSortBy('distance')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    sortBy === 'distance'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Nearest
                </button>
                <button
                  onClick={() => setSortBy('rating')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    sortBy === 'rating'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Top Rated
                </button>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              {mechanics.length} mechanics found
            </div>
          </div>
        </div>

        {/* Mechanics Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {mechanics.map((mechanic) => (
            <Card key={mechanic.id} className="p-6 hover:shadow-lg transition-shadow">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{mechanic.name}</h3>
                  <p className="text-sm text-gray-600">{mechanic.specialty}</p>
                </div>
                <div className="bg-purple-100 rounded-lg p-2">
                  <MapPin className="w-5 h-5 text-purple-600" />
                </div>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(mechanic.rating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="font-semibold text-gray-900">{mechanic.rating}</span>
                <span className="text-sm text-gray-600">({mechanic.reviews} reviews)</span>
              </div>

              {/* Info */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span>{mechanic.distance} km away</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span>{mechanic.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span>{mechanic.address}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  onClick={() => handleRequestService(mechanic)}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
                >
                  Request Service
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 border-gray-300"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Chat
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
