'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSessionOrClearToken, supabase } from '@/lib/supabase/client'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Wrench,
  Clock,
  CheckCircle2,
  DollarSign,
  Star,
  MapPin,
  Settings,
  LogOut,
  Home,
  History,
  User,
} from 'lucide-react'
import { EditProfileModal } from '@/components/edit-profile-modal'
import { IncomingRequestModal, type IncomingRequestData } from '@/components/incoming-request-modal'

type ServiceRequestStatus = 'pending' | 'assigned' | 'on_way' | 'completed'

interface MechanicStats {
  pendingRequests: number
  completedToday: number
  todaysEarnings: number
  avgRating: number
}

interface MechanicProfile {
  businessName: string
  isVerified: boolean | null
  status: string | null
}

export default function MechanicDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<MechanicProfile>({
    businessName: '',
    isVerified: null,
    status: null,
  })
  const [stats, setStats] = useState<MechanicStats>({
    pendingRequests: 0,
    completedToday: 0,
    todaysEarnings: 0,
    avgRating: 0,
  })
  const [dataError, setDataError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [incomingRequest, setIncomingRequest] = useState<IncomingRequestData | null>(null)

  const loadUser = async () => {
    const session = await getSessionOrClearToken()
    if (session) {
      setUser(session.user)
    }
  }

  useEffect(() => {
    const startOfTodayIso = () => {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      return today.toISOString()
    }

    const loadMechanicProfile = async (userId: string) => {
      const byId = await supabase
        .from('mechanics')
        .select('business_name, is_verified, status')
        .eq('id', userId)
        .single()

      if (!byId.error && byId.data) {
        return byId.data
      }

      // Some environments use user_id instead of id
      const byUserId = await supabase
        .from('mechanics')
        .select('business_name, is_verified, status')
        .eq('user_id', userId)
        .single()

      if (!byUserId.error && byUserId.data) {
        return byUserId.data
      }

      return null
    }

    const loadRequestStats = async (userId: string) => {
      const activeStatuses: ServiceRequestStatus[] = ['pending', 'assigned', 'on_way']
      const sinceToday = startOfTodayIso()

      const [pendingResult, completedTodayResult] = await Promise.all([
        supabase
          .from('service_requests')
          .select('id', { count: 'exact', head: true })
          .eq('mechanic_id', userId)
          .in('status', activeStatuses),
        supabase
          .from('service_requests')
          .select('id', { count: 'exact', head: true })
          .eq('mechanic_id', userId)
          .eq('status', 'completed')
          .gte('completed_at', sinceToday),
      ])

      return {
        pending: pendingResult.error ? 0 : pendingResult.count || 0,
        completedToday: completedTodayResult.error ? 0 : completedTodayResult.count || 0,
      }
    }

    const loadEarningsAndRating = async (userId: string, profileRating: number | null) => {
      const sinceToday = startOfTodayIso()

      const [todayServices, ratingRows] = await Promise.all([
        supabase
          .from('service_history')
          .select('cost')
          .eq('mechanic_id', userId)
          .gte('completed_at', sinceToday),
        supabase
          .from('service_history')
          .select('rating')
          .eq('mechanic_id', userId)
          .not('rating', 'is', null),
      ])

      const todaysEarnings = todayServices.error
        ? 0
        : (todayServices.data || []).reduce((total, row) => total + Number(row.cost || 0), 0)

      let avgRating = Number(profileRating || 0)
      if ((!avgRating || avgRating <= 0) && !ratingRows.error && ratingRows.data?.length) {
        const values = ratingRows.data.map((row) => Number(row.rating || 0)).filter((r) => r > 0)
        if (values.length) {
          const sum = values.reduce((a, b) => a + b, 0)
          avgRating = sum / values.length
        }
      }

      return {
        todaysEarnings,
        avgRating,
      }
    }

    const checkAuth = async () => {
      try {
        const session = await getSessionOrClearToken()

        if (!session) {
          router.push('/auth/login')
          return
        }

        const userType = session.user.user_metadata?.user_type
        if (userType && userType !== 'mechanic') {
          router.push('/dashboard')
          return
        }

        setUser(session.user)

        const mechanicProfile = await loadMechanicProfile(session.user.id)
        if (mechanicProfile) {
          setProfile({
            businessName: mechanicProfile.business_name || '',
            isVerified: mechanicProfile.is_verified ?? null,
            status: mechanicProfile.status ?? null,
          })
        }

        const requestStats = await loadRequestStats(session.user.id)
        const earningsAndRating = await loadEarningsAndRating(
          session.user.id,
          mechanicProfile?.rating ? Number(mechanicProfile.rating) : null
        )

        setStats({
          pendingRequests: requestStats.pending,
          completedToday: requestStats.completedToday,
          todaysEarnings: earningsAndRating.todaysEarnings,
          avgRating: earningsAndRating.avgRating,
        })
      } catch (error) {
        console.error('Mechanic auth check error:', error)
        setDataError('Unable to load live dashboard data right now.')
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [router])

  // Set up real-time listener for incoming requests
  useEffect(() => {
    if (!user) return

    const channel = supabase
      .channel('mechanic-incoming-requests')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'service_requests',
          filter: `mechanic_id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.new && payload.new.status === 'pending') {
            setIncomingRequest(payload.new as IncomingRequestData)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  const handleStatusChange = async (newStatus: string) => {
    if (!user) return
    try {
      setProfile(prev => ({ ...prev, status: newStatus }))
      const { error } = await supabase
        .from('mechanics')
        .update({ status: newStatus })
        .eq('id', user.id)
      if (error) {
        await supabase
          .from('mechanics')
          .update({ status: newStatus })
          .eq('user_id', user.id)
      }
    } catch (err) {
      console.error('Failed to update status', err)
    }
  }

  const handleAcceptRequest = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from('service_requests')
        .update({ status: 'assigned' })
        .eq('id', requestId)
      
      if (error) throw error
      
      setIncomingRequest(null)
      // Redirect to the jobs page so mechanic can start working
      router.push('/track-service')
    } catch (error) {
      console.error('Error accepting request:', error)
      setDataError('Failed to accept request. Please try again.')
    }
  }

  const handleRejectRequest = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from('service_requests')
        .update({ status: 'rejected' })
        .eq('id', requestId)
      
      if (error) throw error
      
      setIncomingRequest(null)
    } catch (error) {
      console.error('Error rejecting request:', error)
      setDataError('Failed to reject request. Please try again.')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-purple-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  const firstName = user?.user_metadata?.first_name || 'Mechanic'
  const mechanicTitle = profile.businessName || `${firstName}'s Service`
  const verificationLabel =
    profile.isVerified === true ? 'Verified' : profile.isVerified === false ? 'Pending Verification' : 'Unverified'
  const verificationClass =
    profile.isVerified === true
      ? 'bg-green-100 text-green-700'
      : profile.isVerified === false
        ? 'bg-yellow-100 text-yellow-700'
        : 'bg-gray-100 text-gray-700'

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-50 pb-20">
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
            <div>
              <h1 className="text-2xl font-bold text-gray-900">AutoCares Pro</h1>
              <p className="text-xs text-gray-500">{mechanicTitle}</p>
            </div>
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
                {firstName?.[0]?.toUpperCase() || 'M'}
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Welcome back, {firstName}! 🔧</h2>
          <p className="text-gray-600 mt-2">
            Manage incoming service work and monitor your business performance.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${verificationClass}`}>
              {verificationLabel}
            </span>
            {profile.status && (
              <span className="inline-flex rounded-full px-3 py-1 text-xs font-semibold bg-purple-100 text-purple-700">
                Status: {profile.status}
              </span>
            )}
          </div>
          {dataError && <p className="text-sm text-red-600 mt-3">{dataError}</p>}
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Requests</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingRequests}</p>
              </div>
              <Clock className="w-8 h-8 text-purple-600" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed Today</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completedToday}</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Today's Earnings</p>
                <p className="text-2xl font-bold text-gray-900">Rs {stats.todaysEarnings.toFixed(2)}</p>
              </div>
              <DollarSign className="w-8 h-8 text-purple-600" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Average Rating</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.avgRating > 0 ? stats.avgRating.toFixed(1) : '-'}
                </p>
              </div>
              <Star className="w-8 h-8 text-yellow-600" />
            </div>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Link href="/track-service">
            <Card className="p-6 bg-gradient-to-br from-purple-500 to-purple-600 text-white hover:shadow-lg transition-shadow cursor-pointer h-full">
              <Wrench className="w-12 h-12 mb-4" />
              <h3 className="text-2xl font-bold mb-2">Mechanic Service</h3>
              <p className="text-purple-100">
                View and manage live roadside assistance requests from nearby drivers.
              </p>
              <div className="mt-4 text-sm">Open Service →</div>
            </Card>
          </Link>

          <Link href="/tracking">
            <Card className="p-6 bg-gradient-to-br from-purple-500 to-purple-600 text-white hover:shadow-lg transition-shadow cursor-pointer h-full">
              <MapPin className="w-12 h-12 mb-4" />
              <h3 className="text-2xl font-bold mb-2">Live Job Tracking</h3>
              <p className="text-purple-100">
                Monitor route progress and keep customers informed with real-time updates.
              </p>
              <div className="mt-4 text-sm">Track Jobs →</div>
            </Card>
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Link href="/history">
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <History className="w-8 h-8 text-gray-700 mb-3" />
              <h3 className="font-bold text-gray-900 mb-2">Job History</h3>
              <p className="text-sm text-gray-600 mb-4">
                Review completed jobs, service notes, and payout details.
              </p>
              <div className="text-gray-700 text-sm font-medium">View History →</div>
            </Card>
          </Link>

          <Link href="/ratings">
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <Star className="w-8 h-8 text-yellow-600 mb-3" />
              <h3 className="font-bold text-gray-900 mb-2">Ratings & Feedback</h3>
              <p className="text-sm text-gray-600 mb-4">
                Track customer reviews and improve your service quality.
              </p>
              <div className="text-yellow-600 text-sm font-medium">View Feedback →</div>
            </Card>
          </Link>

          <Card onClick={() => setIsEditModalOpen(true)} className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <User className="w-8 h-8 text-purple-600 mb-3" />
            <h3 className="font-bold text-gray-900 mb-2">Business Profile</h3>
            <p className="text-sm text-gray-600 mb-4">
              Update business details, availability, and contact preferences.
            </p>
            <div className="text-purple-600 text-sm font-medium">Manage Profile →</div>
          </Card>
        </div>

        <Card className="p-6 mt-8 border-purple-200 bg-purple-50">
          <h3 className="font-bold text-gray-900 mb-2">Availability Status</h3>
          <p className="text-sm text-gray-700 mb-4">
            Keep your status updated so drivers can request assistance when you are ready.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button 
              onClick={() => handleStatusChange('Available')}
              className={profile.status === 'Available' ? "bg-green-600 hover:bg-green-700 text-white" : "bg-gray-200 text-gray-700 hover:bg-green-600 hover:text-white border-0"}
            >Set Available</Button>
            <Button 
              onClick={() => handleStatusChange('Busy')}
              className={profile.status === 'Busy' ? "bg-yellow-600 hover:bg-yellow-700 text-white" : "bg-gray-200 text-gray-700 hover:bg-yellow-600 hover:text-white border-0"}
            >Set Busy</Button>
            <Button 
              onClick={() => handleStatusChange('Offline')}
              className={profile.status === 'Offline' ? "bg-red-600 hover:bg-red-700 text-white" : "bg-gray-200 text-gray-700 hover:bg-red-600 hover:text-white border-0"}
            >Set Offline</Button>
          </div>
        </Card>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden">
        <div className="flex items-center justify-around">
          <button
            onClick={() => router.push('/mechanic/dashboard')}
            className="flex-1 py-3 text-center border-b-2 border-purple-600 text-purple-600"
          >
            <Home className="w-5 h-5 mx-auto" />
            <span className="text-xs mt-1 block">Home</span>
          </button>
          <button
            onClick={() => router.push('/track-service')}
            className="flex-1 py-3 text-center text-gray-600"
          >
            <Wrench className="w-5 h-5 mx-auto" />
            <span className="text-xs mt-1 block">Jobs</span>
          </button>
          <button
            onClick={() => router.push('/history')}
            className="flex-1 py-3 text-center text-gray-600"
          >
            <History className="w-5 h-5 mx-auto" />
            <span className="text-xs mt-1 block">History</span>
          </button>
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="flex-1 py-3 text-center text-gray-600"
          >
            <User className="w-5 h-5 mx-auto" />
            <span className="text-xs mt-1 block">Profile</span>
          </button>
        </div>
      </nav>

      {user && (
        <EditProfileModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          user={user}
          userType="mechanic"
          onSuccess={loadUser}
        />
      )}

      <IncomingRequestModal
        request={incomingRequest}
        onAccept={handleAcceptRequest}
        onReject={handleRejectRequest}
      />
    </div>
  )
}
