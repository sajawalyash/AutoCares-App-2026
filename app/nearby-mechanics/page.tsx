'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getSessionOrClearToken, supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ArrowLeft, MapPin, Phone, Star, CheckCircle, Loader } from 'lucide-react'
import { CustomGoogleMap } from '@/components/map/google-map'
import { NotificationBell } from '@/components/notifications/notification-bell'

interface RealMechanic {
  id: string
  name: string
  distance: number
  rating: number
  reviews: number
  verified: boolean
  phone: string
  address: string
  specialties: string[]
  lat: number
  lng: number
}

function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return Math.round(R * c * 10) / 10
}

export default function NearbyMechanicsPage() {
  const router = useRouter()
  const [mechanics, setMechanics] = useState<RealMechanic[]>([])
  const [selectedMechanic, setSelectedMechanic] = useState<RealMechanic | null>(null)
  const [loading, setLoading] = useState(true)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number }>({
    lat: 40.7128,
    lng: -74.006,
  })

  useEffect(() => {
    const init = async () => {
      // 1. Get user GPS coordinates if available
      if (typeof window !== 'undefined' && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude }
            setUserLocation(loc)
            fetchMechanics(loc)
          },
          () => {
            fetchMechanics(userLocation)
          },
          { timeout: 4000 }
        )
      } else {
        fetchMechanics(userLocation)
      }
    }

    const fetchMechanics = async (loc: { lat: number; lng: number }) => {
      setLoading(true)
      try {
        const { data, error } = await supabase
          .from('mechanics')
          .select('*')
          .order('rating', { ascending: false })

        if (error) throw error

        if (data && data.length > 0) {
          const mapped: RealMechanic[] = data.map((row: any) => {
            const lat = Number(row.latitude) || loc.lat + (Math.random() - 0.5) * 0.05
            const lng = Number(row.longitude) || loc.lng + (Math.random() - 0.5) * 0.05
            const dist = calculateDistanceKm(loc.lat, loc.lng, lat, lng)

            return {
              id: String(row.id),
              name: row.business_name || 'Mechanic Service',
              distance: dist,
              rating: Number(row.rating) || 4.8,
              reviews: Number(row.total_reviews || row.experience_years * 12 || 15),
              verified: Boolean(row.is_verified ?? true),
              phone: row.phone || 'Available on request',
              address: [row.city, row.state].filter(Boolean).join(', ') || 'Local Workshop',
              specialties: Array.isArray(row.specializations)
                ? row.specializations
                : ['General Repair', 'Diagnostics'],
              lat,
              lng,
            }
          })

          setMechanics(mapped)
          if (mapped.length > 0) {
            setSelectedMechanic(mapped[0])
          }
        } else {
          setMechanics([])
        }
      } catch (err) {
        console.error('Failed to load mechanics:', err)
        setMechanics([])
      } finally {
        setLoading(false)
      }
    }

    init()
  }, [])

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-50 pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => router.back()}
              variant="ghost"
              size="icon"
              className="text-gray-600"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Nearby Mechanics</h1>
              <p className="text-sm text-gray-600">
                {loading ? 'Finding mechanics...' : `${mechanics.length} mechanics available`}
              </p>
            </div>
          </div>
          <NotificationBell />
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader className="w-8 h-8 animate-spin text-purple-600" />
          </div>
        ) : mechanics.length === 0 ? (
          <Card className="p-12 text-center border-dashed">
            <MapPin className="w-12 h-12 text-purple-600 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-gray-900 mb-2">No Mechanics Found Nearby</h3>
            <p className="text-sm text-gray-600 max-w-sm mx-auto mb-6">
              There are currently no registered mechanics in your immediate area.
            </p>
            <Button
              onClick={() => router.push('/assistance/request')}
              className="bg-purple-600 text-white hover:bg-purple-700"
            >
              Post an Open Assistance Request
            </Button>
          </Card>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Mechanics List */}
            <div className="lg:col-span-2 space-y-4">
              {mechanics.map((mechanic) => (
                <Card
                  key={mechanic.id}
                  className={`p-4 sm:p-6 border-0 shadow-md hover:shadow-lg transition-shadow cursor-pointer ${
                    selectedMechanic?.id === mechanic.id ? 'ring-2 ring-purple-600' : ''
                  }`}
                  onClick={() => setSelectedMechanic(mechanic)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold text-gray-900">{mechanic.name}</h3>
                        {mechanic.verified && (
                          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4 text-purple-600" />
                        {mechanic.distance} km away
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 justify-end">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span className="font-semibold text-gray-900">{mechanic.rating.toFixed(1)}</span>
                        <span className="text-sm text-gray-600">({mechanic.reviews})</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3 mb-4">
                    <div>
                      <p className="text-xs text-gray-600 font-semibold uppercase">Location</p>
                      <p className="text-sm text-gray-900">{mechanic.address}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 font-semibold uppercase">Specialties</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {mechanic.specialties.map((spec) => (
                          <span
                            key={spec}
                            className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded capitalize"
                          >
                            {spec.replace('_', ' ')}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    {mechanic.phone !== 'Available on request' && (
                      <Button
                        onClick={(e) => {
                          e.stopPropagation()
                          window.location.href = `tel:${mechanic.phone}`
                        }}
                        variant="outline"
                        className="flex-1 text-purple-600 border-purple-300"
                      >
                        <Phone className="w-4 h-4 mr-2" />
                        Call
                      </Button>
                    )}
                    <Button
                      onClick={(e) => {
                        e.stopPropagation()
                        router.push(`/assistance/request?mechanicId=${mechanic.id}`)
                      }}
                      className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      Request Service
                    </Button>
                  </div>
                </Card>
              ))}
            </div>

            {/* Interactive Google Map */}
            <div className="lg:col-span-1">
              <Card className="p-1 border-0 shadow-lg sticky top-24 h-96">
                <CustomGoogleMap
                  center={
                    selectedMechanic
                      ? { lat: selectedMechanic.lat, lng: selectedMechanic.lng }
                      : userLocation
                  }
                  zoom={selectedMechanic ? 14 : 12}
                  markers={mechanics.map((m) => ({
                    id: m.id,
                    lat: m.lat,
                    lng: m.lng,
                    title: m.name,
                  }))}
                  onMarkerClick={(id) => {
                    const m = mechanics.find((mech) => mech.id === String(id))
                    if (m) setSelectedMechanic(m)
                  }}
                />
              </Card>
            </div>
          </div>
        )}

        {/* Selected Mechanic Details Card */}
        {selectedMechanic && (
          <Card className="mt-8 p-6 border-0 shadow-lg bg-white">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Selected Mechanic Details</h2>
            <div className="grid md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-gray-500 uppercase font-semibold">Business Name</p>
                <p className="text-base font-bold text-gray-900">{selectedMechanic.name}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-semibold">Phone</p>
                <p className="text-base font-bold text-purple-600">{selectedMechanic.phone}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-semibold">Distance</p>
                <p className="text-base font-bold text-gray-900">{selectedMechanic.distance} km</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-semibold">Rating</p>
                <p className="text-base font-bold text-gray-900">
                  {selectedMechanic.rating.toFixed(1)} ⭐ ({selectedMechanic.reviews} reviews)
                </p>
              </div>
            </div>
            <Button
              onClick={() => router.push(`/assistance/request?mechanicId=${selectedMechanic.id}`)}
              className="w-full mt-6 bg-purple-600 hover:bg-purple-700 text-white py-6 text-lg font-semibold"
            >
              Request Service from {selectedMechanic.name}
            </Button>
          </Card>
        )}
      </div>
    </main>
  )
}
