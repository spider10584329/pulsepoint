'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import AuthGuard from '@/components/AuthGuard'
import MySubscriptions from '@/components/user/MySubscriptions'
import { AppliedProject } from '@/types/user/software'
import { useToast } from '@/lib/context/ToastContext'

export default function UserDashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [subscriptions, setSubscriptions] = useState<AppliedProject[]>([])
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    trial: 0,
    pending: 0,
    expired: 0
  })
  const router = useRouter()
  const { showToast } = useToast()

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData)
        setUser(parsedUser)
        fetchSubscriptions(parsedUser.id)
      } catch (error) {
        console.error('Error parsing user data:', error)
        setIsLoading(false)
      }
    } else {
      setIsLoading(false)
    }
  }, [])

  const fetchSubscriptions = async (userId: number) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        showToast('error', 'Authentication Error', 'No authentication token found')
        setIsLoading(false)
        return
      }

      const response = await fetch(`http://localhost:5001/api/apply/project/foruser?id=${userId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setSubscriptions(data)
        calculateStats(data)
      } else {
        showToast('error', 'Error', 'Failed to fetch subscriptions')
      }
    } catch (error) {
      console.error('Error fetching subscriptions:', error)
      showToast('error', 'Error', 'Failed to fetch subscriptions')
    } finally {
      setIsLoading(false)
    }
  }

  const calculateStats = (subs: AppliedProject[]) => {
    const today = new Date()
    let active = 0
    let trial = 0
    let pending = 0
    let expired = 0

    subs.forEach(sub => {
      const status = sub.isApply
      
      // Pending Approval (status = 0)
      if (status === 0) {
        pending++
      }
      // Active subscriptions (status = 1)
      else if (status === 1) {
        // Free trial - no periodicity/purchase date
        if (!sub.periodicity && !sub.purchaseDate) {
          trial++
        }
        // Paid subscription - has periodicity and purchase date
        else if (sub.purchaseDate) {
          active++
        }
      }
      // Expired subscriptions (status = 2)
      else if (status === 2) {
        expired++
      }
    })

    setStats({
      total: subs.length,
      active,
      trial,
      pending,
      expired
    })
  }

  const handleRefresh = () => {
    if (user) {
      fetchSubscriptions(user.id)
    }
  }

  if (isLoading || !user) {
    return (
      <div className="  flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <AuthGuard requireVerification={true} allowedRoles={[1]}>
      <div className="">        
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">User Dashboard</h1>
            <p className="text-sm text-gray-600">Welcome, {user?.firstname || 'User'}</p>
          </div>

          {/* Statistics Cards */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Statistics</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {/* Total Subscriptions */}
              <div className="bg-blue-500 rounded-lg p-4 text-white text-center">
                <p className="text-xs sm:text-sm font-medium uppercase mb-1">Total</p>
                <p className="text-2xl sm:text-3xl font-bold">{stats.total}</p>
              </div>

              {/* Active Paid */}
              <div className="bg-green-500 rounded-lg p-4 text-white text-center">
                <p className="text-xs sm:text-sm font-medium uppercase mb-1">Active Paid</p>
                <p className="text-2xl sm:text-3xl font-bold">{stats.active}</p>
              </div>

              {/* Free Trial */}
              <div className="bg-cyan-500 rounded-lg p-4 text-white text-center">
                <p className="text-xs sm:text-sm font-medium uppercase mb-1">Free Trial</p>
                <p className="text-2xl sm:text-3xl font-bold">{stats.trial}</p>
              </div>

              {/* Pending */}
              <div className="bg-yellow-500 rounded-lg p-4 text-white text-center">
                <p className="text-xs sm:text-sm font-medium uppercase mb-1">Pending</p>
                <p className="text-2xl sm:text-3xl font-bold">{stats.pending}</p>
              </div>

              {/* Expired */}
              <div className="bg-red-500 rounded-lg p-4 text-white text-center">
                <p className="text-xs sm:text-sm font-medium uppercase mb-1">Expired</p>
                <p className="text-2xl sm:text-3xl font-bold">{stats.expired}</p>
              </div>
            </div>
          </div>

          {/* Subscriptions Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Subscription Status</h2>
            <MySubscriptions 
              subscriptions={subscriptions}
              onRefresh={handleRefresh}
            />
          </div>
        
      </div>
    </AuthGuard>
  )
}
