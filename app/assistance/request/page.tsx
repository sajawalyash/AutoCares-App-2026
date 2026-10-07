'use client'

import { Suspense, useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { getSessionOrClearToken, supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { ArrowLeft, MapPin, Upload, Loader } from 'lucide-react'
import { CustomGoogleMap } from '@/components/map/google-map'

function RequestAssistanceContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const mechanicId = searchParams.get('mechanicId')

  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [showMap, setShowMap] = useState(false)
  const [mapCenter, setMapCenter] = useState({ lat: 40.7128, lng: -74.0060 })
  const [formData, setFormData] = useState({
    problem: '',
    location: 'Current Location',
    vehicleInfo: '',
    additionalNotes: '',
  })

  useEffect(() => {
    const checkAuth = async () => {
      const session = await getSessionOrClearToken()
      if (!session) {
        router.push('/auth/login')
      } else {
        setUser(session.user)
        setFormData((prev) => ({
          ...prev,
          vehicleInfo: `${session.user?.user_metadata?.vehicle_type || 'Car'}`,
        }))
      }
    }
    checkAuth()
  }, [router])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setLoading(true)

    try {
      // ✅ Fix Bug #7: Insert a real service request into Supabase
      const { error } = await supabase.from('service_requests').insert({
        customer_id: user.id,
        problem: formData.problem,
        location: formData.location,
        vehicle_info: formData.vehicleInfo,
        additional_notes: formData.additionalNotes,
        status: 'pending',
        mechanic_id: mechanicId || null,
        created_at: new Date().toISOString(),
      })

      if (error) throw error

      setSubmitted(true)
      setTimeout(() => {
        router.push('/tracking')
      }, 2000)
    } catch (error) {
      console.error('Error submitting request:', JSON.stringify(error, null, 2))
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Request Submitted!</h2>
          <p className="text-gray-600 mb-6">
            Your roadside assistance request has been received. Mechanics are reviewing your request. You'll be notified soon.
          </p>
          <p className="text-sm text-gray-500">Redirecting to tracking...</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Request Roadside Help</h1>
            <p className="text-sm text-gray-600">Describe your vehicle issue</p>
          </div>
        </div>
      </header>

      {/* Form */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Card className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Problem Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                What's the problem with your vehicle? *
              </label>
              <textarea
                name="problem"
                value={formData.problem}
                onChange={handleChange}
                placeholder="Describe the issue you're experiencing..."
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent resize-none h-32"
              />
            </div>

            {/* Vehicle Info */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vehicle Type
              </label>
              <Input
                type="text"
                name="vehicleInfo"
                value={formData.vehicleInfo}
                disabled
                className="w-full bg-gray-100"
              />
              <p className="text-xs text-gray-500 mt-1">From your profile</p>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location *
              </label>
              <div className="flex gap-2">
                <Input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="Your current location"
                  required
                  className="flex-1"
                  readOnly
                  onClick={() => setShowMap(!showMap)}
                />
                <Button
                  type="button"
                  variant="outline"
                  className="border-gray-300"
                  onClick={() => {
                     setShowMap(!showMap);
                     if (navigator.geolocation) {
                       navigator.geolocation.getCurrentPosition(
                         (position) => {
                           const coords = { lat: position.coords.latitude, lng: position.coords.longitude };
                           setMapCenter(coords);
                           setFormData(prev => ({ ...prev, location: `${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}` }));
                         }
                       );
                     }
                  }}
                >
                  <MapPin className="w-4 h-4 text-purple-600" />
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-1 mb-3">📍 Sharing your exact GPS location helps mechanics reach you faster</p>
              
              {showMap && (
                <div className="mt-2 rounded-lg overflow-hidden border border-gray-200 h-64 relative">
                  <CustomGoogleMap
                    center={mapCenter}
                    zoom={14}
                    markers={[{ id: 'user-loc', lat: mapCenter.lat, lng: mapCenter.lng, title: 'Your Location' }]}
                  />
                  <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                     <div className="bg-white/90 backdrop-blur px-4 py-2 rounded-full text-sm font-semibold shadow-md text-purple-700">
                       Location Selected: {formData.location}
                     </div>
                  </div>
                </div>
              )}
            </div>

            {/* Additional Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Notes
              </label>
              <textarea
                name="additionalNotes"
                value={formData.additionalNotes}
                onChange={handleChange}
                placeholder="Any other details about the issue..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent resize-none h-24"
              />
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Photo (Optional)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-purple-600 transition cursor-pointer">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  PNG, JPG up to 5MB
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading || !formData.problem.trim()}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white h-12 text-base"
            >
              {loading ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  Submitting Request...
                </>
              ) : (
                'Submit Request'
              )}
            </Button>
          </form>

          {/* Info Box */}
          <div className="mt-8 bg-purple-50 border border-purple-200 rounded-lg p-4">
            <p className="text-sm text-purple-900">
              <strong>💡 Tip:</strong> Be as detailed as possible about your issue. This helps mechanics come prepared with the right tools and parts.
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default function RequestAssistance() {
  return (
    <Suspense fallback={<LoadingPage />}>
      <RequestAssistanceContent />
    </Suspense>
  )
}

function LoadingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-50">
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <h1 className="text-xl font-bold text-gray-900">Request Roadside Help</h1>
        </div>
      </header>
      <div className="max-w-2xl mx-auto px-4 py-8 flex items-center justify-center h-[60vh]">
        <Loader className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    </div>
  )
}
