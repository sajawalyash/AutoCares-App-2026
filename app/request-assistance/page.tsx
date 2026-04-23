'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { ArrowLeft, MapPin, Upload, Check } from 'lucide-react'

export default function RequestAssistancePage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [latitude, setLatitude] = useState<number | null>(null)
  const [longitude, setLongitude] = useState<number | null>(null)
  const [address, setAddress] = useState('Detecting location...')

  const [formData, setFormData] = useState({
    vehicleType: 'car',
    problemDescription: '',
    imageUrl: null as string | null
  })

  useEffect(() => {
    // Get user's location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          setLatitude(latitude)
          setLongitude(longitude)
          // In a real app, you'd call a reverse geocoding API
          setAddress(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`)
        },
        (error) => {
          console.error('Error getting location:', error)
          setAddress('Unable to get location')
        }
      )
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }

      // In a real app, save to database
      console.log('Service Request:', {
        userId: user.id,
        ...formData,
        latitude,
        longitude,
        address,
        createdAt: new Date()
      })

      setSubmitted(true)
      setTimeout(() => {
        router.push('/track-service')
      }, 2000)
    } catch (error) {
      console.error('Error submitting request:', error)
      alert('Failed to submit request')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-50 flex items-center justify-center px-4">
        <Card className="p-8 max-w-md border-0 shadow-lg text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Request Submitted!</h2>
          <p className="text-gray-600 mb-6">
            Your service request has been sent to nearby mechanics. You'll be notified when one accepts.
          </p>
          <div className="bg-purple-50 p-4 rounded-lg text-sm text-gray-700 mb-6">
            <p className="font-semibold">Estimated arrival: 15-30 minutes</p>
          </div>
          <Button 
            onClick={() => router.push('/track-service')}
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            Track Your Mechanic
          </Button>
        </Card>
      </main>
    )
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
            <h1 className="text-xl font-bold text-gray-900">Request Assistance</h1>
            <p className="text-sm text-gray-600">Help is on the way</p>
          </div>
        </div>
      </header>

      {/* Form */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <Card className="p-6 sm:p-8 border-0 shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Vehicle Type */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                Vehicle Type
              </label>
              <div className="grid grid-cols-3 gap-3">
                {['car', 'bike', 'scooter'].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setFormData({ ...formData, vehicleType: type })}
                    className={`p-3 rounded-lg border-2 transition-all capitalize font-medium ${
                      formData.vehicleType === type
                        ? 'border-purple-600 bg-purple-50 text-purple-600'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Problem Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                Problem Description
              </label>
              <textarea
                value={formData.problemDescription}
                onChange={(e) => setFormData({ ...formData, problemDescription: e.target.value })}
                placeholder="Describe what's wrong with your vehicle (e.g., 'Engine won't start', 'Strange noise from engine', etc.)"
                required
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                <MapPin className="w-4 h-4 inline mr-2" />
                Your Location
              </label>
              <div className="p-4 bg-purple-50 border-2 border-purple-200 rounded-lg">
                <p className="text-gray-900 font-medium">{address}</p>
                <p className="text-sm text-gray-600 mt-1">
                  {latitude && longitude ? `Coordinates: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}` : 'Detecting...'}
                </p>
              </div>
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                <Upload className="w-4 h-4 inline mr-2" />
                Upload Photo (Optional)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-purple-500 transition-colors cursor-pointer">
                <p className="text-gray-600 text-sm">Click to upload or drag and drop</p>
                <p className="text-gray-500 text-xs mt-1">PNG, JPG up to 10MB</p>
                <Input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    // In a real app, handle file upload
                    console.log('File selected:', e.target.files?.[0])
                  }}
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-3">
              <Button
                type="button"
                onClick={() => router.back()}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading || !formData.problemDescription}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
              >
                {loading ? 'Submitting...' : 'Request Help'}
              </Button>
            </div>
          </form>
        </Card>

        {/* Info Box */}
        <Card className="mt-6 p-4 border-0 shadow-md bg-purple-50">
          <p className="text-sm text-gray-700">
            <span className="font-semibold">Response time:</span> Nearby mechanics will be notified immediately. Most arrive within 15-30 minutes.
          </p>
        </Card>
      </div>
    </main>
  )
}
