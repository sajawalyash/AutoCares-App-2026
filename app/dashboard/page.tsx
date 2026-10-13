'use client'

import Image from 'next/image'
import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { getSessionOrClearToken, supabase } from '@/lib/supabase/client'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  BotMessageSquare,
  UserCheck,
  MapPin,
  ShieldAlert,
  AlertCircle,
  LogOut,
  Settings,
  History,
  Star,
  Home,
  MessageCircle,
  Clock,
  CheckCircle2,
  Car,
  ChevronRight,
  Phone,
  Wrench,
} from 'lucide-react'
import { OBDDashboardSummary } from '@/components/obd/obd-dashboard-summary'
import { EditProfileModal } from '@/components/edit-profile-modal'
import { NotificationBell } from '@/components/notifications/notification-bell'

interface ServiceRequestItem {
  id: string
  problem: string
  location: string
  status: 'pending' | 'assigned' | 'on_way' | 'completed' | 'rejected'
  mechanic_name?: string
  mechanic_phone?: string
  created_at: string
}

interface UserProfile {
  vehicle_make?: string
  vehicle_model?: string
  vehicle_year?: number
  vehicle_plate?: string
  vehicle_type?: string
  phone?: string
}

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [activeRequests, setActiveRequests] = useState<ServiceRequestItem[]>([])
  const [completedCount, setCompletedCount] = useState<number>(0)
  const [recentRequests, setRecentRequests] = useState<ServiceRequestItem[]>([])
  const [loading, setLoading] = useState(true)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  const loadDashboardData = useCallback(async (userId: string) => {
    try {
      // 1. Fetch user profile
      const { data: profData } = await supabase
        .from('profiles')
        .select('vehicle_make, vehicle_model, vehicle_year, vehicle_plate, vehicle_type, phone')
        .eq('id', userId)
        .single()

      if (profData) {
        setProfile(profData)
      }

      // 2. Fetch active requests
      const { data: activeData } = await supabase
        .from('service_requests')
        .select('*')
        .or(`customer_id.eq.${userId},user_id.eq.${userId}`)
        .in('status', ['pending', 'assigned', 'on_way'])
        .order('created_at', { ascending: false })

      if (activeData) {
        setActiveRequests(
          activeData.map((row: any) => ({
            id: String(row.id),
            problem: row.problem || row.problem_description || 'Assistance requested',
            location: row.location || 'Current location',
            status: row.status || 'pending',
            mechanic_name: row.mechanic_name,
            mechanic_phone: row.mechanic_phone,
            created_at: row.created_at,
          }))
        )
      } else {
        setActiveRequests([])
      }

      // 3. Fetch completed services count
      const { count } = await supabase
        .from('service_requests')
        .select('id', { count: 'exact', head: true })
        .or(`customer_id.eq.${userId},user_id.eq.${userId}`)
        .eq('status', 'completed')

      setCompletedCount(count || 0)

      // 4. Fetch recent requests (completed or active)
      const { data: recentData } = await supabase
        .from('service_requests')
        .select('*')
        .or(`customer_id.eq.${userId},user_id.eq.${userId}`)
        .order('created_at', { ascending: false })
        .limit(4)

      if (recentData) {
        setRecentRequests(
          recentData.map((row: any) => ({
            id: String(row.id),
            problem: row.problem || row.problem_description || 'Vehicle issue',
            location: row.location || 'Location',
            status: row.status || 'pending',
            mechanic_name: row.mechanic_name,
            mechanic_phone: row.mechanic_phone,
            created_at: row.created_at,
          }))
        )
      } else {
        setRecentRequests([])
      }
    } catch (err) {
      console.error('Error loading dashboard data:', err)
    }
  }, [])

  const loadUser = useCallback(async () => {
    const session = await getSessionOrClearToken()
    if (session) {
      setUser(session.user)
      loadDashboardData(session.user.id)
    }
  }, [loadDashboardData])

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
        await loadDashboardData(session.user.id)
      } catch (error) {
        console.error('Auth check error:', error)
        router.push('/auth/login')
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [router, loadDashboardData])

  // Real-time listener for live customer requests
  useEffect(() => {
    if (!user?.id) return

    const channel = supabase
      .channel(`customer-dashboard-requests-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'service_requests',
        },
        () => {
          // Re-fetch live dashboard state when requests change
          loadDashboardData(user.id)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user, loadDashboardData])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-purple-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  const firstName = user?.user_metadata?.first_name || 'Driver'
  const vehicleName = profile?.vehicle_make
    ? `${profile.vehicle_year || ''} ${profile.vehicle_make} ${profile.vehicle_model || ''}`.trim()
    : user?.user_metadata?.vehicle_type || 'Vehicle Registered'

  const activeRequest = activeRequests.length > 0 ? activeRequests[0] : null

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
              <NotificationBell />
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
                title="Log out"
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
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-900">Welcome, {firstName}! 👋</h2>
          <p className="text-gray-600 mt-1">Here is your live roadside assistance and vehicle status overview.</p>
        </div>

        {/* Live Active Service Alert Banner */}
        {activeRequest && (
          <div className="mb-8 p-5 bg-purple-600 text-white rounded-xl shadow-lg animate-in slide-in-from-top-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-white/20 rounded-lg mt-0.5 animate-pulse">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs uppercase tracking-wider font-bold bg-white/30 px-2 py-0.5 rounded">
                      Live Request Active
                    </span>
                    <span className="text-xs bg-yellow-400 text-yellow-950 font-bold px-2 py-0.5 rounded capitalize">
                      {activeRequest.status === 'pending'
                        ? 'Searching for Mechanic'
                        : activeRequest.status === 'assigned'
                        ? 'Mechanic Assigned'
                        : 'Mechanic on the Way'}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold mt-1">{activeRequest.problem}</h3>
                  <p className="text-xs text-purple-100">Location: {activeRequest.location}</p>
                  {activeRequest.mechanic_name && (
                    <p className="text-xs font-semibold text-yellow-200 mt-0.5">
                      Assigned Mechanic: {activeRequest.mechanic_name}
                    </p>
                  )}
                </div>
              </div>

              <Button
                onClick={() => router.push('/tracking')}
                className="bg-white text-purple-700 hover:bg-purple-50 font-bold shrink-0 self-stretch sm:self-auto"
              >
                Track Live on Map →
              </Button>
            </div>
          </div>
        )}

        {/* Customer Live Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Active Requests */}
          <Card className="p-4 bg-white border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase">Active Requests</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{activeRequests.length}</p>
                <p className="text-xs text-purple-600 mt-1">
                  {activeRequests.length > 0 ? 'Assistance in progress' : 'No active calls'}
                </p>
              </div>
              <div className="p-3 bg-purple-100 text-purple-600 rounded-xl">
                <Clock className="w-6 h-6" />
              </div>
            </div>
          </Card>

          {/* Completed Services */}
          <Card className="p-4 bg-white border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase">Completed Services</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{completedCount}</p>
                <Link href="/history" className="text-xs text-purple-600 hover:underline mt-1 block">
                  View history →
                </Link>
              </div>
              <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            </div>
          </Card>

          {/* Registered Vehicle */}
          <Card className="p-4 bg-white border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase">My Vehicle</p>
                <p className="text-sm font-bold text-gray-900 mt-1 truncate max-w-[150px]">
                  {vehicleName}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {profile?.vehicle_plate ? `Plate: ${profile.vehicle_plate}` : 'Standard Profile'}
                </p>
              </div>
              <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                <Car className="w-6 h-6" />
              </div>
            </div>
          </Card>

          {/* Connect OBD Device */}
          <Card className="p-4 bg-white border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase">Diagnostics</p>
                <p className="text-sm font-bold text-gray-900 mt-1">OBD-II Scanner</p>
                <Link
                  href="/vehicle/connect"
                  className="text-xs text-purple-600 hover:underline mt-1 block font-medium"
                >
                  Pair Bluetooth Device →
                </Link>
              </div>
              <div className="p-3 bg-amber-100 text-amber-600 rounded-xl">
                <Wrench className="w-6 h-6" />
              </div>
            </div>
          </Card>
        </div>

        {/* Primary Action Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* AI Chatbot Card */}
          <Link href="/chatbot">
            <Card className="p-6 bg-gradient-to-br from-purple-500 to-purple-600 text-white hover:shadow-lg transition-shadow cursor-pointer h-full">
              <BotMessageSquare className="w-12 h-12 mb-4" />
              <h3 className="text-2xl font-bold mb-2">AI Vehicle Troubleshooting</h3>
              <p className="text-purple-100">
                Get instant answers to vehicle problems with our AI-powered diagnostic engine.
              </p>
              <div className="mt-4 flex items-center gap-2 text-sm font-semibold">
                <span>Start Chat</span>
                <span>→</span>
              </div>
            </Card>
          </Link>

          {/* Roadside Assistance Card */}
          <Link href="/assistance/request">
            <Card className="p-6 bg-gradient-to-br from-purple-600 to-indigo-700 text-white hover:shadow-lg transition-shadow cursor-pointer h-full">
              <AlertCircle className="w-12 h-12 mb-4" />
              <h3 className="text-2xl font-bold mb-2">Request Roadside Help</h3>
              <p className="text-purple-100">
                Stranded or need repairs? Dispatch a verified mechanic to your exact location.
              </p>
              <div className="mt-4 flex items-center gap-2 text-sm font-semibold">
                <span>Request Help Now</span>
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
              <UserCheck className="w-8 h-8 text-purple-600 mb-3" />
              <h3 className="font-bold text-gray-900 mb-2">Find Mechanics</h3>
              <p className="text-sm text-gray-600 mb-4">
                Browse nearby workshops and verified specialists.
              </p>
              <div className="text-purple-600 text-sm font-medium">Browse Directory →</div>
            </Card>
          </Link>

          {/* Track Service */}
          <Link href="/tracking">
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <MapPin className="w-8 h-8 text-purple-600 mb-3" />
              <h3 className="font-bold text-gray-900 mb-2">Live Tracking</h3>
              <p className="text-sm text-gray-600 mb-4">
                Real-time map tracking of mechanics and ETA.
              </p>
              <div className="text-purple-600 text-sm font-medium">Open Tracker →</div>
            </Card>
          </Link>

          {/* Service History */}
          <Link href="/history">
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <History className="w-8 h-8 text-green-600 mb-3" />
              <h3 className="font-bold text-gray-900 mb-2">Service History</h3>
              <p className="text-sm text-gray-600 mb-4">
                View your complete vehicle maintenance log.
              </p>
              <div className="text-green-600 text-sm font-medium">View History →</div>
            </Card>
          </Link>

          {/* OBD Dashboard Summary */}
          <OBDDashboardSummary userId={user?.id} />
        </div>

        {/* Real Recent Service Activity List */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">Recent Service Activity</h3>
            <Link href="/tracking" className="text-sm text-purple-600 hover:underline font-medium">
              View All ({recentRequests.length})
            </Link>
          </div>

          {recentRequests.length === 0 ? (
            <Card className="p-8 text-center border-dashed">
              <p className="text-sm text-gray-500">No roadside service requests submitted yet.</p>
              <Button
                onClick={() => router.push('/assistance/request')}
                className="mt-3 bg-purple-600 hover:bg-purple-700 text-white text-xs"
              >
                Request Assistance
              </Button>
            </Card>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {recentRequests.map((req) => (
                <Card
                  key={req.id}
                  onClick={() => router.push('/tracking')}
                  className="p-4 hover:shadow-md transition cursor-pointer border border-slate-200"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                            req.status === 'completed'
                              ? 'bg-green-100 text-green-700'
                              : req.status === 'rejected'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-purple-100 text-purple-700'
                          }`}
                        >
                          {req.status}
                        </span>
                        <span className="text-xs text-gray-400">
                          {req.created_at ? new Date(req.created_at).toLocaleDateString() : 'Recent'}
                        </span>
                      </div>
                      <h4 className="font-bold text-gray-900 text-sm mt-1">{req.problem}</h4>
                      <p className="text-xs text-gray-500 mt-0.5">{req.location}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Emergency & Extra Features */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Emergency SOS */}
          <Card className="p-6 bg-gradient-to-br from-red-500 to-red-600 text-white">
            <ShieldAlert className="w-8 h-8 mb-3" />
            <h3 className="font-bold text-lg mb-2">Emergency SOS</h3>
            <p className="text-sm text-red-100 mb-4">
              Instant one-click emergency broadcast to responders.
            </p>
            <Button
              onClick={() => router.push('/sos')}
              className="w-full bg-white text-red-600 hover:bg-red-50 text-sm font-semibold"
            >
              Activate Emergency SOS
            </Button>
          </Card>

          {/* Ratings & Reviews */}
          <Link href="/ratings">
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <Star className="w-8 h-8 text-yellow-600 mb-3" />
              <h3 className="font-bold text-gray-900 mb-2">Ratings & Reviews</h3>
              <p className="text-sm text-gray-600 mb-4">
                Rate mechanics and view verified community feedback.
              </p>
              <div className="text-yellow-600 text-sm font-medium">View Reviews →</div>
            </Card>
          </Link>

          {/* Profile */}
          <Card
            onClick={() => setIsEditModalOpen(true)}
            className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
          >
            <Settings className="w-8 h-8 text-gray-600 mb-3" />
            <h3 className="font-bold text-gray-900 mb-2">My Profile</h3>
            <p className="text-sm text-gray-600 mb-4">
              Manage your personal info and vehicle registration details.
            </p>
            <div className="text-gray-600 text-sm font-medium">Edit Profile →</div>
          </Card>
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden z-30">
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
            onClick={() => setIsEditModalOpen(true)}
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
