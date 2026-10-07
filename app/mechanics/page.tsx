'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getSessionOrClearToken, supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ArrowLeft, MapPin, Star, Phone, MessageCircle, Loader } from 'lucide-react'

interface Mechanic {
  id: string
  name: string
  specialty: string
  rating: number
  reviews: number
  phone: string
  address: string
  isVerified: boolean
  distance_km?: number
}

// Fallback mock data shown when Supabase table is empty or unavailable
const MOCK_MECHANICS: Mechanic[] = [
  {
    id: 'm1',
    name: "John's Auto Repair",
    specialty: 'General Repair & Maintenance',
    rating: 4.8,
    reviews: 156,
    phone: '+1 (555) 123-4567',
    address: '123 Main St, City',
    isVerified: true,
  },
  {
    id: 'm2',
    name: 'Quick Fix Garage',
    specialty: 'Emergency Services',
    rating: 4.6,
    reviews: 89,
    phone: '+1 (555) 234-5678',
    address: '456 Oak Ave, City',
    isVerified: true,
  },
  {
    id: 'm3',
    name: 'Premium Auto Service',
    specialty: 'Luxury & Performance',
    rating: 4.9,
    reviews: 203,
    phone: '+1 (555) 345-6789',
    address: '789 Pine Rd, City',
    isVerified: true,
  },
]

export default function Mechanics() {
  const router = useRouter()
  const [mechanics, setMechanics] = useState<Mechanic[]>([])
  const [sortBy, setSortBy] = useState<'rating' | 'name' | 'distance'>('distance')
  const [loadingData, setLoadingData] = useState(true)
  const [userLocation, setUserLocation] = useState<{ lat: number, lng: number } | null>(null)

  useEffect(() => {
    const init = async () => {
      const session = await getSessionOrClearToken()
      if (!session) {
        router.push('/auth/login')
        return
      }
      
      // Try to get location first
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude }
            setUserLocation(loc)
            fetchMechanics(loc)
          },
          (err) => {
            console.error('Location error:', err)
            // Fallback to non-location fetch
            setSortBy('rating')
            fetchMechanics(null)
          },
          { timeout: 5000 }
        )
      } else {
        setSortBy('rating')
        fetchMechanics(null)
      }
    }
    init()
  }, [router])

  // ✅ Fetch live data, using RPC if location is available and sortBy distance
  const fetchMechanics = async (loc: { lat: number, lng: number } | null) => {
    setLoadingData(true)
    try {
      let data, error

      if (loc && sortBy === 'distance') {
        const response = await supabase.rpc('get_nearest_mechanics', {
          user_lat: loc.lat,
          user_lon: loc.lng,
        })
        data = response.data
        error = response.error
      } else {
        const response = await supabase
          .from('mechanics')
          .select('id, business_name, phone, rating, total_reviews, city, state, status, is_verified, specializations')
          .in('status', ['Available', 'Busy', 'pending'])
          .order('rating', { ascending: false })
        data = response.data
        error = response.error
      }

      if (error) throw error

      if (data && data.length > 0) {
        const mapped: Mechanic[] = data.map((row: any) => ({
          id: row.id,
          name: row.business_name || 'Mechanic',
          specialty: Array.isArray(row.specializations) && row.specializations.length > 0
            ? row.specializations[0]
            : 'General Repair',
          rating: Number(row.rating) || 0,
          reviews: Number(row.total_reviews) || 0,
          phone: row.phone || 'N/A',
          address: [row.city, row.state].filter(Boolean).join(', ') || 'Location not provided',
          isVerified: row.is_verified ?? false,
          distance_km: row.distance_km ? Number(row.distance_km) : undefined,
        }))
        setMechanics(mapped)
      } else {
        setMechanics(MOCK_MECHANICS)
      }
    } catch (err) {
      console.error('Failed to fetch mechanics:', JSON.stringify(err, null, 2))
      setMechanics(MOCK_MECHANICS)
    } finally {
      setLoadingData(false)
    }
  }

  // Effect to re-fetch when sort changes to/from distance if location is available
  useEffect(() => {
    if (!loadingData) {
      if (sortBy === 'distance' && !userLocation) {
        setSortBy('rating')
        alert("Location is required to sort by Nearest")
        return
      }
      fetchMechanics(userLocation)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortBy])

  // ✅ Fix M4: Stale closure bug — sort a snapshot of current mechanics state
  const sortedMechanics = [...mechanics].sort((a, b) => {
    if (sortBy === 'distance') return 0 // Already sorted by RPC
    if (sortBy === 'rating') return b.rating - a.rating
    return a.name.localeCompare(b.name)
  })

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
                <button
                  onClick={() => setSortBy('name')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    sortBy === 'name'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Name A–Z
                </button>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              {loadingData ? 'Loading...' : `${sortedMechanics.length} mechanics found`}
            </div>
          </div>
        </div>

        {loadingData ? (
          <div className="flex items-center justify-center py-20">
            <Loader className="w-8 h-8 animate-spin text-purple-600" />
          </div>
        ) : (
          /* Mechanics Grid */
          <div className="grid md:grid-cols-2 gap-6">
            {sortedMechanics.map((mechanic) => (
              <Card key={mechanic.id} className="p-6 hover:shadow-lg transition-shadow">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-gray-900">{mechanic.name}</h3>
                      {mechanic.isVerified && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                          Verified
                        </span>
                      )}
                    </div>
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
                  <span className="font-semibold text-gray-900">{mechanic.rating.toFixed(1)}</span>
                  <span className="text-sm text-gray-600">({mechanic.reviews} reviews)</span>
                </div>

                {/* Info */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span>{mechanic.phone}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span>{mechanic.address}</span>
                    </div>
                    {mechanic.distance_km !== undefined && (
                      <span className="text-sm font-semibold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
                        {mechanic.distance_km.toFixed(1)} km away
                      </span>
                    )}
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
        )}
      </div>
    </div>
  )
}
