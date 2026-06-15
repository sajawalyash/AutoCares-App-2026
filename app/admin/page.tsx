'use client'

import Image from 'next/image'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getSessionOrClearToken } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Users, Wrench, FileText, BarChart3, Settings, LogOut } from 'lucide-react'

interface AdminMetrics {
  totalUsers: number
  totalMechanics: number
  activeRequests: number
  completedServices: number
  avgRating: number
  totalRevenue: number
}

const MOCK_METRICS: AdminMetrics = {
  totalUsers: 1245,
  totalMechanics: 89,
  activeRequests: 23,
  completedServices: 5432,
  avgRating: 4.7,
  totalRevenue: 125430,
}

export default function AdminDashboard() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'mechanics' | 'requests' | 'chatbot'>('overview')
  const [authChecked, setAuthChecked] = useState(false)

  // ✅ Fix Bug #4: Guard admin page — redirect non-admins to login
  useEffect(() => {
    const checkAdmin = async () => {
      const session = await getSessionOrClearToken()
      if (!session) {
        router.push('/auth/login')
        return
      }
      const userType = session.user.user_metadata?.user_type
      if (userType !== 'admin') {
        // Redirect non-admins to their appropriate dashboard
        router.push(userType === 'mechanic' ? '/mechanic/dashboard' : '/dashboard')
        return
      }
      setAuthChecked(true)
    }
    checkAdmin()
  }, [router])

  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="bg-slate-900/50 backdrop-blur border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/autocares-logo.png"
              alt="AutoCares Logo"
              width={40}
              height={40}
              priority
              className="w-10 h-10 rounded"
            />
            <span className="text-2xl font-bold text-white">Admin Panel</span>
          </div>
          <Button className="bg-red-600 hover:bg-red-700 text-white">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-slate-800/30 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 flex gap-2 overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'users', label: 'Users', icon: Users },
            { id: 'mechanics', label: 'Mechanics', icon: Wrench },
            { id: 'requests', label: 'Requests', icon: FileText },
            { id: 'chatbot', label: 'Chatbot', icon: Settings },
          ].map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-4 text-sm font-medium border-b-2 transition whitespace-nowrap flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'border-purple-400 text-purple-400'
                    : 'border-transparent text-slate-400 hover:text-slate-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            )
          })}
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <h1 className="text-3xl font-bold text-white">Dashboard Overview</h1>

            {/* Key Metrics */}
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="p-6 bg-slate-800/50 border-slate-700">
                <p className="text-slate-400 text-sm mb-2">Total Users</p>
                <p className="text-4xl font-bold text-purple-400">
                  {MOCK_METRICS.totalUsers.toLocaleString()}
                </p>
                <p className="text-xs text-slate-500 mt-2">+12% from last month</p>
              </Card>

              <Card className="p-6 bg-slate-800/50 border-slate-700">
                <p className="text-slate-400 text-sm mb-2">Verified Mechanics</p>
                <p className="text-4xl font-bold text-purple-400">
                  {MOCK_METRICS.totalMechanics}
                </p>
                <p className="text-xs text-slate-500 mt-2">+5 this week</p>
              </Card>

              <Card className="p-6 bg-slate-800/50 border-slate-700">
                <p className="text-slate-400 text-sm mb-2">Active Requests</p>
                <p className="text-4xl font-bold text-green-400">
                  {MOCK_METRICS.activeRequests}
                </p>
                <p className="text-xs text-slate-500 mt-2">Avg response: 8 mins</p>
              </Card>

              <Card className="p-6 bg-slate-800/50 border-slate-700">
                <p className="text-slate-400 text-sm mb-2">Services Completed</p>
                <p className="text-4xl font-bold text-purple-400">
                  {MOCK_METRICS.completedServices.toLocaleString()}
                </p>
                <p className="text-xs text-slate-500 mt-2">All time</p>
              </Card>

              <Card className="p-6 bg-slate-800/50 border-slate-700">
                <p className="text-slate-400 text-sm mb-2">Avg Rating</p>
                <p className="text-4xl font-bold text-yellow-400">
                  {MOCK_METRICS.avgRating}⭐
                </p>
                <p className="text-xs text-slate-500 mt-2">Platform rating</p>
              </Card>

              <Card className="p-6 bg-slate-800/50 border-slate-700">
                <p className="text-slate-400 text-sm mb-2">Total Revenue</p>
                <p className="text-4xl font-bold text-emerald-400">
                  ${MOCK_METRICS.totalRevenue.toLocaleString()}
                </p>
                <p className="text-xs text-slate-500 mt-2">Last 30 days</p>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card className="p-6 bg-slate-800/50 border-slate-700">
              <h2 className="text-xl font-bold text-white mb-4">Recent Activities</h2>
              <div className="space-y-3">
                {[
                  { user: 'John Doe', action: 'Requested roadside assistance', time: '2 mins ago' },
                  { user: 'Sarah Smith', action: 'Completed service with 5-star rating', time: '8 mins ago' },
                  { user: 'Mike Johnson', action: 'Verified as mechanic', time: '15 mins ago' },
                  { user: 'Emily Davis', action: 'Submitted service request', time: '23 mins ago' },
                ].map((activity, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg border border-slate-600/50">
                    <div>
                      <p className="text-white font-medium">{activity.user}</p>
                      <p className="text-xs text-slate-400">{activity.action}</p>
                    </div>
                    <span className="text-xs text-slate-500">{activity.time}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'users' && (
          <div>
            <h1 className="text-3xl font-bold text-white mb-6">User Management</h1>
            <Card className="p-6 bg-slate-800/50 border-slate-700">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-600">
                      <th className="text-left py-3 px-4 text-slate-300">Name</th>
                      <th className="text-left py-3 px-4 text-slate-300">Email</th>
                      <th className="text-left py-3 px-4 text-slate-300">Vehicle</th>
                      <th className="text-left py-3 px-4 text-slate-300">Status</th>
                      <th className="text-left py-3 px-4 text-slate-300">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { name: 'John Doe', email: 'john@example.com', vehicle: 'Car', status: 'Active' },
                      { name: 'Sarah Smith', email: 'sarah@example.com', vehicle: 'Bike', status: 'Active' },
                      { name: 'Mike Johnson', email: 'mike@example.com', vehicle: 'Scooter', status: 'Inactive' },
                    ].map((user, i) => (
                      <tr key={i} className="border-b border-slate-600/50 hover:bg-slate-700/20">
                        <td className="py-3 px-4 text-white">{user.name}</td>
                        <td className="py-3 px-4 text-slate-300">{user.email}</td>
                        <td className="py-3 px-4 text-slate-300">{user.vehicle}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            user.status === 'Active' ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'
                          }`}>
                            {user.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <Button variant="outline" size="sm" className="border-slate-600 text-slate-300">
                            View
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'mechanics' && (
          <div>
            <h1 className="text-3xl font-bold text-white mb-6">Mechanics Management</h1>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                { name: "John's Auto Repair", rating: 4.8, reviews: 156, status: 'Verified' },
                { name: 'Quick Fix Garage', rating: 4.6, reviews: 89, status: 'Verified' },
                { name: 'Premium Auto Service', rating: 4.9, reviews: 203, status: 'Pending' },
              ].map((mechanic, i) => (
                <Card key={i} className="p-6 bg-slate-800/50 border-slate-700">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-white">{mechanic.name}</h3>
                      <p className="text-sm text-slate-400">{mechanic.reviews} reviews</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      mechanic.status === 'Verified' ? 'bg-green-900/30 text-green-400' : 'bg-yellow-900/30 text-yellow-400'
                    }`}>
                      {mechanic.status}
                    </span>
                  </div>
                  <p className="text-xl font-bold text-yellow-400 mb-4">{mechanic.rating}⭐</p>
                  <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                    View Details
                  </Button>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'requests' && (
          <div>
            <h1 className="text-3xl font-bold text-white mb-6">Service Requests</h1>
            <Card className="p-6 bg-slate-800/50 border-slate-700">
              <div className="space-y-3">
                {[
                  { id: '#12345', user: 'John Doe', issue: 'Engine won\'t start', status: 'On the Way', time: '8 mins ago' },
                  { id: '#12346', user: 'Sarah Smith', issue: 'Flat tire', status: 'Completed', time: '2 hours ago' },
                  { id: '#12347', user: 'Mike Johnson', issue: 'Battery issue', status: 'Assigned', time: '15 mins ago' },
                ].map((request, i) => (
                  <div key={i} className="p-4 bg-slate-700/30 rounded-lg border border-slate-600/50 flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">{request.id} - {request.user}</p>
                      <p className="text-sm text-slate-400">{request.issue}</p>
                    </div>
                    <div className="text-right">
                      <span className={`px-3 py-1 rounded text-xs font-medium inline-block mb-2 ${
                        request.status === 'Completed' ? 'bg-green-900/30 text-green-400' :
                        request.status === 'On the Way' ? 'bg-purple-900/30 text-purple-400' :
                        'bg-purple-900/30 text-purple-400'
                      }`}>
                        {request.status}
                      </span>
                      <p className="text-xs text-slate-500">{request.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'chatbot' && (
          <div>
            <h1 className="text-3xl font-bold text-white mb-6">Chatbot Training Data</h1>
            <Card className="p-6 bg-slate-800/50 border-slate-700">
              <div className="space-y-4">
                <div className="p-4 bg-slate-700/30 rounded-lg border border-slate-600/50">
                  <p className="text-white font-medium mb-2">Q: Why does my car not start?</p>
                  <p className="text-slate-300">A: Check battery charge, fuel level, and ignition system.</p>
                </div>
                <div className="p-4 bg-slate-700/30 rounded-lg border border-slate-600/50">
                  <p className="text-white font-medium mb-2">Q: Why did my bike engine stop suddenly?</p>
                  <p className="text-slate-300">A: Check fuel level, battery connection, and spark plug.</p>
                </div>
                <div className="p-4 bg-slate-700/30 rounded-lg border border-slate-600/50">
                  <p className="text-white font-medium mb-2">Q: What should I do if my scooter is overheating?</p>
                  <p className="text-slate-300">A: Stop immediately, let cool down, check coolant and airflow.</p>
                </div>
              </div>
              <Button className="w-full mt-6 bg-purple-600 hover:bg-purple-700 text-white">
                Add New FAQ
              </Button>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}
