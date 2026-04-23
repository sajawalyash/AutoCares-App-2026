'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ArrowLeft, MapPin, Phone, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import { CustomGoogleMap } from '@/components/map/google-map'

const trackingStages = [
  { stage: 'pending', label: 'Request Sent', icon: AlertCircle, color: 'text-purple-600' },
  { stage: 'assigned', label: 'Mechanic Assigned', icon: CheckCircle, color: 'text-purple-600' },
  { stage: 'on_the_way', label: 'On the Way', icon: MapPin, color: 'text-purple-600' },
  { stage: 'completed', label: 'Service Completed', icon: CheckCircle, color: 'text-green-600' }
]

export default function TrackServicePage() {
  const router = useRouter()
  const [currentStage, setCurrentStage] = useState(1) // on_the_way stage
  const [eta, setEta] = useState(12) // minutes

  // Simulate ETA countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setEta(prev => (prev > 0 ? prev - 1 : 0))
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const mechanic = {
    name: 'John\'s Auto Repair',
    phone: '+1 (555) 123-4567',
    rating: 4.8,
    vehicleInfo: 'White Toyota Camry',
    plateNumber: 'ABC-1234'
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-50 pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4">
          <Button 
            onClick={() => router.back()}
            variant="ghost"
            size="icon"
            className="text-gray-600"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Track Service</h1>
            <p className="text-sm text-gray-600">Real-time mechanic tracking</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* ETA Card */}
        <Card className="p-8 border-0 shadow-lg mb-8 bg-gradient-to-br from-purple-600 to-purple-500 text-white">
          <div className="text-center">
            <p className="text-purple-100 text-sm font-semibold uppercase mb-2">Estimated Arrival</p>
            <div className="text-6xl font-bold mb-2">{eta}</div>
            <p className="text-purple-100">minutes away</p>
          </div>
        </Card>

        {/* Progress Tracker */}
        <Card className="p-6 sm:p-8 border-0 shadow-lg mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-8">Service Progress</h2>
          
          <div className="space-y-4">
            {trackingStages.map((item, index) => {
              const Icon = item.icon
              const isCompleted = index < currentStage
              const isActive = index === currentStage
              
              return (
                <div key={item.stage} className="flex items-start gap-4">
                  {/* Timeline Circle */}
                  <div className="flex flex-col items-center">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold ${
                      isCompleted ? 'bg-green-100 text-green-600' :
                      isActive ? 'bg-purple-100 text-purple-600 ring-2 ring-purple-300' :
                      'bg-gray-100 text-gray-400'
                    }`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    {index < trackingStages.length - 1 && (
                      <div className={`w-1 h-12 mt-2 ${
                        isCompleted ? 'bg-green-300' : 'bg-gray-200'
                      }`} />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 pt-2">
                    <p className={`font-semibold text-lg ${
                      isCompleted ? 'text-green-600' :
                      isActive ? 'text-purple-600' :
                      'text-gray-400'
                    }`}>
                      {item.label}
                    </p>
                    {isActive && (
                      <p className="text-sm text-gray-600 mt-1">
                        Your mechanic is on the way to your location
                      </p>
                    )}
                    {isCompleted && (
                      <p className="text-sm text-gray-600 mt-1">
                        Completed on schedule
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </Card>

        {/* Mechanic Info */}
        <Card className="p-6 sm:p-8 border-0 shadow-lg mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Mechanic Details</h2>
          
          <div className="space-y-4">
            <div className="flex items-start justify-between pb-4 border-b border-gray-200">
              <div>
                <p className="text-sm text-gray-600 font-semibold uppercase mb-1">Business Name</p>
                <p className="text-lg font-semibold text-gray-900">{mechanic.name}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600 font-semibold uppercase mb-1">Rating</p>
                <p className="text-lg font-semibold text-gray-900">{mechanic.rating} ⭐</p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-6 py-4">
              <div>
                <p className="text-sm text-gray-600 font-semibold uppercase mb-2">Contact</p>
                <Button
                  onClick={() => window.location.href = `tel:${mechanic.phone}`}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Call Mechanic
                </Button>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-semibold uppercase mb-2">Message</p>
                <Button
                  variant="outline"
                  className="w-full border-purple-300 text-purple-600"
                >
                  Send Message
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Vehicle Info */}
        <Card className="p-6 sm:p-8 border-0 shadow-lg mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Your Vehicle</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 font-semibold uppercase mb-2">Vehicle</p>
              <p className="text-lg font-semibold text-gray-900">{mechanic.vehicleInfo}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 font-semibold uppercase mb-2">Plate Number</p>
              <p className="text-lg font-semibold text-gray-900 font-mono">{mechanic.plateNumber}</p>
            </div>
          </div>
        </Card>

        {/* Live Google Map Tracking */}
        <Card className="p-1 border-0 shadow-lg h-96">
          <CustomGoogleMap
            center={{ lat: 40.7128, lng: -74.0060 }} // User's broken down vehicle location
            destination={{ lat: 40.7500, lng: -73.9800 }} // Approaching mechanic location
            showDirections={true}
            zoom={13}
          />
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-8">
          <Button
            variant="outline"
            className="flex-1 border-red-300 text-red-600"
          >
            Cancel Request
          </Button>
          <Button
            onClick={() => router.push('/dashboard')}
            className="flex-1 bg-purple-600 hover:bg-purple-700"
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
    </main>
  )
}
