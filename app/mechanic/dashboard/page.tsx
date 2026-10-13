'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState, useCallback } from 'react'
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
  Phone,
  Check,
  X,
  Navigation,
  Car,
  ChevronRight,
} from 'lucide-react'
import { EditProfileModal } from '@/components/edit-profile-modal'
import { IncomingRequestModal, type IncomingRequestData } from '@/components/incoming-request-modal'
import { NotificationBell } from '@/components/notifications/notification-bell'
import { sendNotification } from '@/lib/notifications'
import { toast } from 'sonner'

type ServiceRequestStatus = 'pending' | 'assigned' | 'on_way' | 'completed' | 'rejected'

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
  phone?: string
  licenseNumber?: string
  experienceYears?: number
}

interface ActiveJob {
  id: string
  customer_id: string
  customer_name?: string
  customer_phone?: string
  problem: string
  location: string
  vehicle_info?: string
  additional_notes?: string
  status: ServiceRequestStatus
  created_at: string
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
  const [activeJobs, setActiveJobs] = useState<ActiveJob[]>([])
  const [completedJobs, setCompletedJobs] = useState<ActiveJob[]>([])
  const [dataError, setDataError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [incomingRequest, setIncomingRequest] = useState<IncomingRequestData | null>(null)

  const startOfTodayIso = () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return today.toISOString()
  }

  const loadMechanicData = useCallback(async (userId: string) => {
    try {
      const sinceToday = startOfTodayIso()

      // 1. Load Profile
      const { data: mechData } = await supabase
        .from('mechanics')
        .select('*')
        .or(`id.eq.${userId},user_id.eq.${userId}`)
        .single()

      if (mechData) {
        setProfile({
          businessName: mechData.business_name || '',
          isVerified: mechData.is_verified ?? null,
          status: mechData.status ?? 'Available',
          phone: mechData.phone,
          licenseNumber: mechData.license_number,
          experienceYears: mechData.experience_years,
        })
      }

      // 2. Load Active Jobs
      const { data: jobsData } = await supabase
        .from('service_requests')
        .select('*')
        .eq('mechanic_id', userId)
        .in('status', ['pending', 'assigned', 'on_way'])
        .order('created_at', { ascending: false })

      if (jobsData) {
        setActiveJobs(
          jobsData.map((row: any) => ({
            id: String(row.id),
            customer_id: row.customer_id || row.user_id,
            customer_name: row.customer_name || 'Driver in need',
            customer_phone: row.customer_phone || row.phone || 'Available on accept',
            problem: row.problem || row.problem_description || 'Vehicle issue',
            location: row.location || row.address || 'Location provided',
            vehicle_info: row.vehicle_info || row.vehicle_type || 'Vehicle',
            additional_notes: row.additional_notes,
            status: row.status as ServiceRequestStatus,
            created_at: row.created_at,
          }))
        )
      } else {
        setActiveJobs([])
      }

      // 3. Load Completed Jobs
      const { data: completedData } = await supabase
        .from('service_requests')
        .select('*')
        .eq('mechanic_id', userId)
        .eq('status', 'completed')
        .order('created_at', { ascending: false })
        .limit(5)

      if (completedData) {
        setCompletedJobs(
          completedData.map((row: any) => ({
            id: String(row.id),
            customer_id: row.customer_id || row.user_id,
            customer_name: row.customer_name || 'Driver',
            customer_phone: row.customer_phone || 'N/A',
            problem: row.problem || row.problem_description || 'Completed service',
            location: row.location || 'Location',
            status: 'completed',
            created_at: row.created_at,
          }))
        )
      } else {
        setCompletedJobs([])
      }

      // 4. Load Stats
      const [pendingCount, completedTodayCount, todayServices, ratingRows] = await Promise.all([
        supabase
          .from('service_requests')
          .select('id', { count: 'exact', head: true })
          .eq('mechanic_id', userId)
          .in('status', ['pending', 'assigned', 'on_way']),
        supabase
          .from('service_requests')
          .select('id', { count: 'exact', head: true })
          .eq('mechanic_id', userId)
          .eq('status', 'completed')
          .gte('created_at', sinceToday),
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
        : (todayServices.data || []).reduce((sum, row) => sum + Number(row.cost || 0), 0)

      let avgRating = Number(mechData?.rating || 0)
      if ((!avgRating || avgRating <= 0) && ratingRows.data?.length) {
        const values = ratingRows.data.map((r) => Number(r.rating || 0)).filter((r) => r > 0)
        if (values.length) {
          avgRating = values.reduce((a, b) => a + b, 0) / values.length
        }
      }

      setStats({
        pendingRequests: pendingCount.count || 0,
        completedToday: completedTodayCount.count || 0,
        todaysEarnings,
        avgRating,
      })
    } catch (err) {
      console.error('Error loading mechanic data:', err)
      setDataError('Could not sync live mechanic records.')
    }
  }, [])

  const loadUser = useCallback(async () => {
    const session = await getSessionOrClearToken()
    if (session) {
      setUser(session.user)
      loadMechanicData(session.user.id)
    }
  }, [loadMechanicData])

  useEffect(() => {
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
        await loadMechanicData(session.user.id)
      } catch (error) {
        console.error('Mechanic auth check error:', error)
        setDataError('Unable to load live dashboard data right now.')
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [router, loadMechanicData])

  // Real-time listener for incoming and updated requests
  useEffect(() => {
    if (!user?.id) return

    const channel = supabase
      .channel(`mechanic-requests-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'service_requests',
          filter: `mechanic_id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT' && payload.new?.status === 'pending') {
            setIncomingRequest(payload.new as IncomingRequestData)
          }
          // Refresh active list and stats
          loadMechanicData(user.id)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user, loadMechanicData])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  const handleStatusChange = async (newStatus: string) => {
    if (!user) return
    try {
      setProfile((prev) => ({ ...prev, status: newStatus }))
      const { error } = await supabase
        .from('mechanics')
        .update({ status: newStatus })
        .or(`id.eq.${user.id},user_id.eq.${user.id}`)

      if (error) throw error
      toast.success(`Availability updated to ${newStatus}`)
    } catch (err) {
      console.error('Failed to update status', err)
      toast.error('Failed to update status')
    }
  }

  const handleAcceptRequest = async (requestId: string) => {
    try {
      const { data: requestData } = await supabase
        .from('service_requests')
        .select('*')
        .eq('id', requestId)
        .single()

      const { error } = await supabase
        .from('service_requests')
        .update({ status: 'assigned' })
        .eq('id', requestId)

      if (error) throw error

      const targetUserId = requestData?.customer_id || requestData?.user_id
      if (targetUserId) {
        await sendNotification({
          userId: targetUserId,
          title: 'Mechanic Accepted Your Request!',
          message: `${profile.businessName || 'Your mechanic'} has accepted your roadside assistance request and is on their way.`,
          type: 'request_accepted',
          link: '/tracking',
          metadata: { requestId },
        })
      }

      setIncomingRequest(null)
      toast.success('Request accepted! Route tracking initialized.')
      if (user?.id) loadMechanicData(user.id)
      router.push('/tracking')
    } catch (error) {
      console.error('Error accepting request:', error)
      toast.error('Failed to accept request. Please try again.')
    }
  }

  const handleRejectRequest = async (requestId: string) => {
    try {
      const { data: requestData } = await supabase
        .from('service_requests')
        .select('*')
        .eq('id', requestId)
        .single()

      const { error } = await supabase
        .from('service_requests')
        .update({ status: 'rejected' })
        .eq('id', requestId)

      if (error) throw error

      const targetUserId = requestData?.customer_id || requestData?.user_id
      if (targetUserId) {
        await sendNotification({
          userId: targetUserId,
          title: 'Request Declined',
          message: 'The mechanic was unable to accept this request. Please request another mechanic nearby.',
          type: 'request_rejected',
          link: '/mechanics',
          metadata: { requestId },
        })
      }

      setIncomingRequest(null)
      toast.info('Request declined.')
      if (user?.id) loadMechanicData(user.id)
    } catch (error) {
      console.error('Error rejecting request:', error)
      toast.error('Failed to reject request.')
    }
  }

  const handleUpdateJobProgress = async (requestId: string, newStatus: 'on_way' | 'completed') => {
    try {
      const { data: requestData } = await supabase
        .from('service_requests')
        .select('*')
        .eq('id', requestId)
        .single()

      const updatePayload: any = { status: newStatus }
      if (newStatus === 'completed') {
        updatePayload.completed_at = new Date().toISOString()
      }

      const { error } = await supabase
        .from('service_requests')
        .update(updatePayload)
        .eq('id', requestId)

      if (error) throw error

      const targetUserId = requestData?.customer_id || requestData?.user_id
      if (targetUserId) {
        if (newStatus === 'on_way') {
          await sendNotification({
            userId: targetUserId,
            title: 'Mechanic is On The Way!',
            message: 'Your mechanic is driving to your location.',
            type: 'mechanic_on_way',
            link: '/tracking',
          })
        } else if (newStatus === 'completed') {
          await sendNotification({
            userId: targetUserId,
            title: 'Service Completed',
            message: 'Your vehicle service has been completed! Please rate your mechanic.',
            type: 'request_completed',
            link: '/ratings',
          })
        }
      }

      toast.success(
        newStatus === 'on_way' ? 'Updated: You are on the way!' : 'Job marked as completed!'
      )
      if (user?.id) loadMechanicData(user.id)
    } catch (err) {
      console.error('Failed to update job status:', err)
      toast.error('Failed to update job status.')
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
    profile.isVerified === true
      ? 'Verified Professional'
      : profile.isVerified === false
      ? 'Pending Verification'
      : 'Unverified'
  const verificationClass =
    profile.isVerified === true
      ? 'bg-green-100 text-green-700'
      : profile.isVerified === false
      ? 'bg-yellow-100 text-yellow-700'
      : 'bg-gray-100 text-gray-700'

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
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Welcome back, {firstName}! 🔧</h2>
          <p className="text-gray-600 mt-2">
            Real-time workshop dashboard. Manage incoming requests, live routes, and revenue.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${verificationClass}`}
            >
              {verificationLabel}
            </span>
            <span className="inline-flex rounded-full px-3 py-1 text-xs font-semibold bg-purple-100 text-purple-700">
              Status: {profile.status || 'Available'}
            </span>
            {profile.phone && (
              <span className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium bg-slate-100 text-slate-700">
                <Phone className="w-3 h-3" /> {profile.phone}
              </span>
            )}
          </div>
          {dataError && <p className="text-sm text-red-600 mt-3">{dataError}</p>}
        </div>

        {/* Real Metrics Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="p-4 bg-white border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase">Active / Pending Jobs</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{activeJobs.length}</p>
                <p className="text-xs text-purple-600 mt-1">Live requests waiting</p>
              </div>
              <div className="p-3 bg-purple-100 text-purple-600 rounded-xl">
                <Clock className="w-6 h-6" />
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-white border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase">Completed Today</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.completedToday}</p>
                <p className="text-xs text-green-600 mt-1">Confirmed service calls</p>
              </div>
              <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-white border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase">Today's Earnings</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  Rs {stats.todaysEarnings.toFixed(2)}
                </p>
                <p className="text-xs text-purple-600 mt-1">From completed orders</p>
              </div>
              <div className="p-3 bg-purple-100 text-purple-600 rounded-xl">
                <DollarSign className="w-6 h-6" />
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-white border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase">Average Rating</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stats.avgRating > 0 ? stats.avgRating.toFixed(1) : '5.0'} ⭐
                </p>
                <p className="text-xs text-yellow-600 mt-1">Customer verified score</p>
              </div>
              <div className="p-3 bg-yellow-100 text-yellow-600 rounded-xl">
                <Star className="w-6 h-6" />
              </div>
            </div>
          </Card>
        </div>

        {/* Real Live Active Job Queue */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Live Active Jobs Queue</h3>
              <p className="text-xs text-gray-500">Service requests currently assigned or pending your action</p>
            </div>
            <Link href="/tracking" className="text-xs font-semibold text-purple-600 hover:underline">
              Open Full Tracker →
            </Link>
          </div>

          {activeJobs.length === 0 ? (
            <Card className="p-8 text-center border-dashed bg-white">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3 text-purple-600">
                <Wrench className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-gray-900 mb-1">No Active Jobs Right Now</h4>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                You are marked as {profile.status || 'Available'}. When drivers in your area request roadside help, their request will appear here instantly.
              </p>
            </Card>
          ) : (
            <div className="space-y-4">
              {activeJobs.map((job) => (
                <Card key={job.id} className="p-5 border-l-4 border-l-purple-600 shadow-sm bg-white">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded capitalize ${
                            job.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : job.status === 'assigned'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-purple-100 text-purple-800'
                          }`}
                        >
                          {job.status === 'pending'
                            ? 'Awaiting Your Acceptance'
                            : job.status === 'assigned'
                            ? 'Accepted - Preparing'
                            : 'En Route to Driver'}
                        </span>
                        <span className="text-xs text-gray-400">
                          {new Date(job.created_at).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>

                      <h4 className="text-base font-bold text-gray-900 mt-1">{job.problem}</h4>
                      <p className="text-xs text-gray-600 flex items-center gap-1 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                        {job.location}
                      </p>
                      {job.vehicle_info && (
                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                          <Car className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          {job.vehicle_info}
                        </p>
                      )}
                    </div>

                    {/* Interactive Action Buttons */}
                    <div className="flex items-center gap-2 w-full md:w-auto">
                      {job.status === 'pending' ? (
                        <>
                          <Button
                            onClick={() => handleAcceptRequest(job.id)}
                            className="bg-purple-600 hover:bg-purple-700 text-white text-xs flex-1 md:flex-none"
                          >
                            <Check className="w-3.5 h-3.5 mr-1" /> Accept Job
                          </Button>
                          <Button
                            onClick={() => handleRejectRequest(job.id)}
                            variant="outline"
                            className="text-red-600 border-red-300 hover:bg-red-50 text-xs flex-1 md:flex-none"
                          >
                            <X className="w-3.5 h-3.5 mr-1" /> Decline
                          </Button>
                        </>
                      ) : job.status === 'assigned' ? (
                        <>
                          <Button
                            onClick={() => handleUpdateJobProgress(job.id, 'on_way')}
                            className="bg-blue-600 hover:bg-blue-700 text-white text-xs flex-1 md:flex-none"
                          >
                            <Navigation className="w-3.5 h-3.5 mr-1" /> Mark On The Way
                          </Button>
                          <Button
                            onClick={() => router.push('/tracking')}
                            variant="outline"
                            className="text-xs border-purple-300 text-purple-700"
                          >
                            Live Map
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            onClick={() => handleUpdateJobProgress(job.id, 'completed')}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs flex-1 md:flex-none"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Complete Job
                          </Button>
                          <Button
                            onClick={() => router.push('/tracking')}
                            variant="outline"
                            className="text-xs border-purple-300 text-purple-700"
                          >
                            Live Map
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Feature Cards Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Link href="/tracking">
            <Card className="p-6 bg-gradient-to-br from-purple-500 to-purple-600 text-white hover:shadow-lg transition-shadow cursor-pointer h-full">
              <MapPin className="w-10 h-10 mb-3" />
              <h3 className="text-xl font-bold mb-1">Live Job Tracking</h3>
              <p className="text-xs text-purple-100 mb-4">
                Monitor route progress and dispatch ETA updates to waiting customers.
              </p>
              <div className="text-xs font-semibold">Track Live Route →</div>
            </Card>
          </Link>

          <Link href="/history">
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer bg-white">
              <History className="w-10 h-10 text-gray-700 mb-3" />
              <h3 className="text-xl font-bold text-gray-900 mb-1">Job History</h3>
              <p className="text-xs text-gray-500 mb-4">
                Review completed service calls, repair notes, and historical earnings.
              </p>
              <div className="text-xs text-purple-600 font-medium">View History →</div>
            </Card>
          </Link>

          <Link href="/ratings">
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer bg-white">
              <Star className="w-10 h-10 text-yellow-500 mb-3" />
              <h3 className="text-xl font-bold text-gray-900 mb-1">Customer Reviews</h3>
              <p className="text-xs text-gray-500 mb-4">
                Track customer ratings, review feedback, and build your reputation.
              </p>
              <div className="text-xs text-purple-600 font-medium">View Feedback →</div>
            </Card>
          </Link>
        </div>

        {/* Real Completed Jobs Preview */}
        {completedJobs.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-bold text-gray-900 mb-3">Recently Completed Jobs</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {completedJobs.map((job) => (
                <Card key={job.id} className="p-4 border border-slate-200 bg-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded uppercase">
                        Completed
                      </span>
                      <h4 className="font-bold text-gray-900 text-sm mt-1">{job.problem}</h4>
                      <p className="text-xs text-gray-500">{job.location}</p>
                    </div>
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Availability Toggle Section */}
        <Card className="p-6 border-purple-200 bg-white">
          <h3 className="font-bold text-gray-900 mb-1">Workshop Availability Status</h3>
          <p className="text-xs text-gray-600 mb-4">
            Toggle your availability so nearby drivers know when you are open to take roadside calls.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => handleStatusChange('Available')}
              className={`text-xs ${
                profile.status === 'Available'
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              🟢 Available (Accepting Jobs)
            </Button>
            <Button
              onClick={() => handleStatusChange('Busy')}
              className={`text-xs ${
                profile.status === 'Busy'
                  ? 'bg-amber-600 text-white hover:bg-amber-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              🟡 Busy (Working on Job)
            </Button>
            <Button
              onClick={() => handleStatusChange('Offline')}
              className={`text-xs ${
                profile.status === 'Offline'
                  ? 'bg-gray-800 text-white hover:bg-gray-900'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              ⚪ Offline
            </Button>
          </div>
        </Card>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden z-30">
        <div className="flex items-center justify-around">
          <button
            onClick={() => router.push('/mechanic/dashboard')}
            className="flex-1 py-3 text-center border-b-2 border-purple-600 text-purple-600"
          >
            <Home className="w-5 h-5 mx-auto" />
            <span className="text-xs mt-1 block">Home</span>
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
