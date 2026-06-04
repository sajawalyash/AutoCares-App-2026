'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSessionOrClearToken, supabase } from '@/lib/supabase/client'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  MessageCircle,
  Wrench,
  MapPin,
  Phone,
  AlertCircle,
  LogOut,
  Settings,
  History,
  Star,
  Home,
} from 'lucide-react'
import { OBDDashboardSummary } from '@/components/obd/obd-dashboard-summary'
import { EditProfileModal } from '@/components/edit-profile-modal'

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  const loadUser = async () => {
    const session = await getSessionOrClearToken()
    if (session) {
      setUser(session.user)
    }
  }

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const session = await getSessionOrClearToken()

        if (!session) {
          router.push('/auth/login')
          return
        }

        if (session.user.user_metadata?.user_type === 'mechanic') {
          router.push('/mechanic/dashboard')
          return
        }

        setUser(session.user)
      } catch (error) {
        console.error('Auth check error:', error)
        router.push('/auth/login')
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-purple-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  const firstName = user?.user_metadata?.first_name || 'User'

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-50 pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/autocares-logo.png"
              alt="AutoCares Logo"
              width={40}
              height={40}
              priority
              className="w-10 h-10"
            />
            <h1 className="text-2xl font-bold text-gray-900">AutoCares</h1>
          </div>
          <div className="flex items-center gap-4">
            {user?.user_metadata?.avatar_url ? (
              <img
                src={user.user_metadata.avatar_url}
                alt="Profile"
                className="w-10 h-10 rounded-full object-cover border border-gray-200"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold border border-purple-200">
                {firstName?.[0]?.toUpperCase() || 'U'}
              </div>
            )}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="p-2 hover:bg-gray-100 rounded-lg transition hidden sm:flex items-center gap-2 text-sm font-medium text-gray-600"
              >
                <Settings className="w-5 h-5" />
                Edit Profile
              </button>
            <button
              onClick={handleLogout}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <LogOut className="w-5 h-5 text-gray-600" />
            </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Welcome, {firstName}! 👋</h2>
          <p className="text-gray-600 mt-2">What can we help you with today?</p>
          <div className="mt-4">
            <Button
              onClick={() => router.push('/vehicle/connect')}
              variant="outline"
              className="border-purple-300 text-purple-700 hover:bg-purple-50"
            >
              Connect OBD-II Device
            </Button>
          </div>
        </div>

        {/* Primary Action Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* AI Chatbot Card */}
          <Link href="/chatbot">
            <Card className="p-6 bg-gradient-to-br from-purple-500 to-purple-600 text-white hover:shadow-lg transition-shadow cursor-pointer h-full">
              <MessageCircle className="w-12 h-12 mb-4" />
              <h3 className="text-2xl font-bold mb-2">AI Vehicle Troubleshooting</h3>
              <p className="text-purple-100">
                Get instant answers to vehicle problems with our AI-powered chatbot
              </p>
              <div className="mt-4 flex items-center gap-2 text-sm">
                <span>Start Chat</span>
                <span>→</span>
              </div>
            </Card>
          </Link>

          {/* Roadside Assistance Card */}
          <Link href="/assistance/request">
            <Card className="p-6 bg-gradient-to-br from-purple-500 to-purple-600 text-white hover:shadow-lg transition-shadow cursor-pointer h-full">
              <AlertCircle className="w-12 h-12 mb-4" />
              <h3 className="text-2xl font-bold mb-2">Request Roadside Help</h3>
              <p className="text-purple-100">
                Need immediate assistance? Request help from nearby mechanics
              </p>
              <div className="mt-4 flex items-center gap-2 text-sm">
                <span>Request Help</span>
                <span>→</span>
              </div>
            </Card>
          </Link>
        </div>

        {/* Secondary Features Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          {/* Find Mechanics */}
          <Link href="/mechanics">
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <Wrench className="w-8 h-8 text-purple-600 mb-3" />
              <h3 className="font-bold text-gray-900 mb-2">Find Mechanics</h3>
              <p className="text-sm text-gray-600 mb-4">
                Browse and connect with verified mechanics near you
              </p>
              <div className="text-purple-600 text-sm font-medium">Browse →</div>
            </Card>
          </Link>

          {/* Track Service */}
          <Link href="/tracking">
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <MapPin className="w-8 h-8 text-purple-600 mb-3" />
              <h3 className="font-bold text-gray-900 mb-2">Track Service</h3>
              <p className="text-sm text-gray-600 mb-4">
                Real-time tracking of your service requests
              </p>
              <div className="text-purple-600 text-sm font-medium">View Requests →</div>
            </Card>
          </Link>

          {/* Service History */}
          <Link href="/history">
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <History className="w-8 h-8 text-green-600 mb-3" />
              <h3 className="font-bold text-gray-900 mb-2">Service History</h3>
              <p className="text-sm text-gray-600 mb-4">
                View your past services and mechanic ratings
              </p>
              <div className="text-green-600 text-sm font-medium">View History →</div>
            </Card>
          </Link>

          {/* OBD Dashboard Summary */}
          <OBDDashboardSummary userId={user?.id} />
        </div>

        {/* Emergency & Extra Features */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Emergency SOS */}
          <Card className="p-6 bg-gradient-to-br from-red-500 to-red-600 text-white">
            <Phone className="w-8 h-8 mb-3" />
            <h3 className="font-bold text-lg mb-2">Emergency SOS</h3>
            <p className="text-sm text-red-100 mb-4">
              One-click emergency assistance
            </p>
            <Button className="w-full bg-white text-red-600 hover:bg-red-50 text-sm font-semibold">
              SOS Call
            </Button>
          </Card>

          {/* Ratings & Reviews */}
          <Link href="/ratings">
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <Star className="w-8 h-8 text-yellow-600 mb-3" />
              <h3 className="font-bold text-gray-900 mb-2">Ratings & Reviews</h3>
              <p className="text-sm text-gray-600 mb-4">
                Rate mechanics and share your experience
              </p>
              <div className="text-yellow-600 text-sm font-medium">View Reviews →</div>
            </Card>
          </Link>

          {/* Profile */}
          <Card onClick={() => setIsEditModalOpen(true)} className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <Settings className="w-8 h-8 text-gray-600 mb-3" />
            <h3 className="font-bold text-gray-900 mb-2">My Profile</h3>
            <p className="text-sm text-gray-600 mb-4">
              Manage your account and vehicle info
            </p>
            <div className="text-gray-600 text-sm font-medium">Edit Profile →</div>
          </Card>
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden">
        <div className="flex items-center justify-around">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex-1 py-3 text-center border-b-2 border-purple-600 text-purple-600"
          >
            <Home className="w-5 h-5 mx-auto" />
            <span className="text-xs mt-1 block">Home</span>
          </button>
          <button
            onClick={() => router.push('/chatbot')}
            className="flex-1 py-3 text-center text-gray-600"
          >
            <MessageCircle className="w-5 h-5 mx-auto" />
            <span className="text-xs mt-1 block">Chat</span>
          </button>
          <button
            onClick={() => router.push('/mechanics')}
            className="flex-1 py-3 text-center text-gray-600"
          >
            <MapPin className="w-5 h-5 mx-auto" />
            <span className="text-xs mt-1 block">Mechanics</span>
          </button>
          <button
            onClick={() => router.push('/profile')}
            className="flex-1 py-3 text-center text-gray-600"
          >
            <Settings className="w-5 h-5 mx-auto" />
            <span className="text-xs mt-1 block">Profile</span>
          </button>
        </div>
      </nav>
      
      {user && (
        <EditProfileModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          user={user}
          userType="customer"
          onSuccess={loadUser}
        />
      )}
    </div>
  )
}
