'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ArrowLeft, MapPin, Phone, Star, CheckCircle } from 'lucide-react'
import { CustomGoogleMap } from '@/components/map/google-map'

// Mock mechanic data with coordinates (roughly centered around a city)
const mockMechanics = [
  {
    id: 1,
    name: 'John\'s Auto Repair',
    distance: 1.2,
    rating: 4.8,
    reviews: 234,
    verified: true,
    phone: '+1 (555) 123-4567',
    address: '123 Main St',
    specialties: ['car_repair', 'engine', 'transmission'],
    lat: 40.7128,
    lng: -74.0060
  },
  {
    id: 2,
    name: 'Quick Fix Garage',
    distance: 2.1,
    rating: 4.6,
    reviews: 189,
    verified: true,
    phone: '+1 (555) 234-5678',
    address: '456 Oak Ave',
    specialties: ['bike_repair', 'car_repair'],
    lat: 40.7180,
    lng: -74.0100
  },
  {
    id: 3,
    name: 'Express Mechanics',
    distance: 3.5,
    rating: 4.9,
    reviews: 412,
    verified: true,
    phone: '+1 (555) 345-6789',
    address: '789 Elm St',
    specialties: ['all'],
    lat: 40.7050,
    lng: -73.9980
  },
  {
    id: 4,
    name: 'Two Wheeler Experts',
    distance: 4.2,
    rating: 4.7,
    reviews: 156,
    verified: true,
    phone: '+1 (555) 456-7890',
    address: '321 Pine Rd',
    specialties: ['bike_repair', 'scooter_repair'],
    lat: 40.7250,
    lng: -74.0150
  },
  {
    id: 5,
    name: 'Premium Auto Services',
    distance: 5.1,
    rating: 4.5,
    reviews: 298,
    verified: false,
    phone: '+1 (555) 567-8901',
    address: '654 Maple Dr',
    specialties: ['car_repair', 'detailing'],
    lat: 40.7300,
    lng: -73.9900
  }
]

export default function NearbyMechanicsPage() {
  const router = useRouter()
  const [selectedMechanic, setSelectedMechanic] = useState<typeof mockMechanics[0] | null>(null)

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-50 pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4">
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
            <p className="text-sm text-gray-600">5 mechanics available near you</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Mechanics List */}
          <div className="lg:col-span-2 space-y-4">
            {mockMechanics.map((mechanic) => (
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
                      <MapPin className="w-4 h-4" />
                      {mechanic.distance} km away
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 justify-end">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span className="font-semibold text-gray-900">{mechanic.rating}</span>
                      <span className="text-sm text-gray-600">({mechanic.reviews})</span>
                    </div>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-3 mb-4">
                  <div>
                    <p className="text-xs text-gray-600 font-semibold uppercase">Address</p>
                    <p className="text-sm text-gray-900">{mechanic.address}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 font-semibold uppercase">Specialties</p>
                    <div className="flex flex-wrap gap-1">
                      {mechanic.specialties.map((spec) => (
                        <span key={spec} className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded capitalize">
                          {spec.replace('_', ' ')}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
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
                  <Button
                    onClick={(e) => {
                      e.stopPropagation()
                      router.push('/request-assistance')
                    }}
                    className="flex-1 bg-purple-600 hover:bg-purple-700"
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
                center={selectedMechanic ? { lat: selectedMechanic.lat, lng: selectedMechanic.lng } : { lat: 40.7128, lng: -74.0060 }}
                zoom={selectedMechanic ? 15 : 13}
                markers={mockMechanics.map(m => ({ id: m.id, lat: m.lat, lng: m.lng, title: m.name }))}
                onMarkerClick={(id) => {
                  const m = mockMechanics.find(mech => mech.id === id);
                  if (m) setSelectedMechanic(m);
                }}
              />
            </Card>
          </div>
        </div>

        {/* Selected Mechanic Details */}
        {selectedMechanic && (
          <Card className="mt-8 p-6 border-0 shadow-lg bg-white">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Selected Mechanic</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-600 font-semibold uppercase mb-1">Business Name</p>
                <p className="text-lg font-semibold text-gray-900">{selectedMechanic.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-semibold uppercase mb-1">Phone</p>
                <p className="text-lg font-semibold text-purple-600">{selectedMechanic.phone}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-semibold uppercase mb-1">Distance</p>
                <p className="text-lg font-semibold text-gray-900">{selectedMechanic.distance} km</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-semibold uppercase mb-1">Rating</p>
                <p className="text-lg font-semibold text-gray-900">
                  {selectedMechanic.rating} ⭐ ({selectedMechanic.reviews} reviews)
                </p>
              </div>
            </div>
            <Button
              onClick={() => router.push('/request-assistance')}
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
