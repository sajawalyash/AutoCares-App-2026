'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Phone, AlertTriangle, MapPin, Clock, CheckCircle, Zap } from 'lucide-react'

export default function SOSPage() {
  const router = useRouter()
  const [isActive, setIsActive] = useState(false)
  const [countdown, setCountdown] = useState(5)
  const [callActive, setCallActive] = useState(false)

  useEffect(() => {
    if (isActive && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    } else if (isActive && countdown === 0) {
      setCallActive(true)
    }
  }, [isActive, countdown])

  const handleSOSPress = () => {
    setIsActive(true)
    setCountdown(5)
  }

  const handleCancel = () => {
    setIsActive(false)
    setCountdown(5)
    setCallActive(false)
  }

  if (callActive) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-red-900 to-red-700 flex items-center justify-center p-4">
        <Card className="p-8 border-0 shadow-2xl max-w-md w-full bg-white text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Emergency Call Active</h2>
          <p className="text-gray-600 mb-6">
            Emergency services have been notified and nearby mechanics are being dispatched to your location.
          </p>

          <div className="space-y-4 mb-8">
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <Phone className="w-5 h-5 text-green-600 flex-shrink-0" />
              <div className="text-left">
                <p className="text-sm font-semibold text-gray-900">Emergency Line Active</p>
                <p className="text-xs text-gray-600">Do not hang up</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
              <MapPin className="w-5 h-5 text-purple-600 flex-shrink-0" />
              <div className="text-left">
                <p className="text-sm font-semibold text-gray-900">Location Shared</p>
                <p className="text-xs text-gray-600">Real-time tracking enabled</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
              <Zap className="w-5 h-5 text-purple-600 flex-shrink-0" />
              <div className="text-left">
                <p className="text-sm font-semibold text-gray-900">Mechanics Dispatched</p>
                <p className="text-xs text-gray-600">ETA 8-12 minutes</p>
              </div>
            </div>
          </div>

          <div className="text-sm text-gray-600 mb-6">
            <Clock className="w-4 h-4 inline mr-2" />
            Time elapsed: <span className="font-semibold text-gray-900">2:34</span>
          </div>

          <Button
            onClick={() => {
              setCallActive(false)
              router.push('/track-service')
            }}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-6"
          >
            Track Your Mechanic
          </Button>
        </Card>
      </main>
    )
  }

  return (
    <main className={`min-h-screen flex items-center justify-center p-4 transition-colors ${
      isActive ? 'bg-gradient-to-br from-red-900 to-red-700' : 'bg-gradient-to-br from-purple-50 to-purple-50'
    }`}>
      <Card className={`p-8 border-0 shadow-2xl max-w-md w-full ${
        isActive ? 'bg-white' : 'bg-white'
      }`}>
        <div className="text-center">
          {!isActive ? (
            <>
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertTriangle className="w-10 h-10 text-red-600" />
              </div>

              <h1 className="text-3xl font-bold text-gray-900 mb-2">Emergency SOS</h1>
              <p className="text-gray-600 mb-8">
                Tap the button below to activate emergency roadside assistance. Help will be dispatched immediately to your location.
              </p>

              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                  <Phone className="w-5 h-5 text-purple-600" />
                  <p className="text-sm text-gray-700">Direct hotline to nearest mechanic</p>
                </div>
                <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                  <MapPin className="w-5 h-5 text-purple-600" />
                  <p className="text-sm text-gray-700">Automatic location sharing enabled</p>
                </div>
                <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                  <Zap className="w-5 h-5 text-purple-600" />
                  <p className="text-sm text-gray-700">Priority dispatch & tracking</p>
                </div>
              </div>

              <Button
                onClick={handleSOSPress}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-8 text-xl font-bold rounded-lg mb-4"
              >
                🚨 ACTIVATE SOS
              </Button>

              <Button
                onClick={() => router.back()}
                variant="outline"
                className="w-full"
              >
                Cancel
              </Button>
            </>
          ) : (
            <>
              <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse ${
                countdown > 0 ? 'bg-red-100' : 'bg-green-100'
              }`}>
                {countdown > 0 ? (
                  <AlertTriangle className="w-12 h-12 text-red-600" />
                ) : (
                  <Phone className="w-12 h-12 text-green-600" />
                )}
              </div>

              {countdown > 0 ? (
                <>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Activating Emergency Call
                  </h2>
                  <div className="text-5xl font-bold text-red-600 mb-6">{countdown}</div>
                  <p className="text-gray-600 mb-8">
                    Hang on! We're connecting you to the nearest mechanic.
                  </p>
                  <Button
                    onClick={handleCancel}
                    variant="outline"
                    className="w-full border-red-300 text-red-600"
                  >
                    Cancel
                  </Button>
                </>
              ) : null}
            </>
          )}
        </div>
      </Card>
    </main>
  )
}
