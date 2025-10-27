'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import AuthGuard from '@/components/AuthGuard'

interface User {
  id: number
  firstname: string
  lastname: string
  email: string
  company: string
  hotelname: string
  role?: number
  isVerify: number
  status: number
  created_at?: string
}

export default function AdminPage() {
  const [user, setUser] = useState<any>(null)
  const [pendingUsers, setPendingUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<number | null>(null)
  const router = useRouter()

  useEffect(() => {
    // Check if user is authenticated and is an admin
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    
    if (!token || !userData) {
      router.push('/')
      return
    }

    try {
      const parsedUser = JSON.parse(userData)
      
      // Check if user is admin (role 0)
      if (parsedUser.role !== 0) {
        router.push('/dashboard')
        return
      }
      
      setUser(parsedUser)
      fetchPendingUsers(token)
    } catch (error) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      router.push('/')
      return
    }
  }, [router])

  const fetchPendingUsers = async (token: string) => {
    try {
      const response = await fetch('http://localhost:5001/api/user/allusers', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        // Filter users that need verification (isVerify = 0)
        const unverifiedUsers = data.filter((user: any) => user.isVerify === 0)
        setPendingUsers(unverifiedUsers)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  // Note: Verification and role management features removed as they're not available in current backend

  const getRoleName = (role: number) => {
    switch (role) {
      case 0: return 'Administrator'
      case 1: return 'Regular User'
      case 2: return 'Support Team'
      default: return 'Unknown'
    }
  }

  const getRoleColor = (role: number) => {
    switch (role) {
      case 0: return 'bg-red-100 text-red-800'
      case 1: return 'bg-green-100 text-green-800'
      case 2: return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-500"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <AuthGuard requireVerification={true}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Dashboard
          </h1>
        </div>

        <div className="bg-white rounded-lg shadow p-6 ">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">System Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2  lg:grid-cols-4 gap-4">
            <div className="bg-gray-100 p-6 rounded-lg">
              <div className="text-3xl font-bold mb-2">0</div>
              <div className="text-sm font-medium">Total Users</div>
            </div>
            <div className="bg-gray-100  p-6 rounded-lg">
              <div className="text-3xl font-bold  mb-2">0</div>
              <div className="text-sm font-medium">Total Projects</div>
            </div>
            <div className="bg-gray-100  p-6 rounded-lg">
              <div className="text-3xl font-bold mb-2">0</div>
              <div className="text-sm font-medium">Users of apply</div>
            </div>
            <div className="bg-gray-100 p-6 rounded-lg">
              <div className="text-3xl font-bold mb-2">{pendingUsers.length}</div>
              <div className="text-sm font-medium">Project of apply</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 h-[calc(100vh-420px)]">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Project status</h2>
          <div className="grid grid-cols-1 md:grid-cols-2  lg:grid-cols-4 gap-4">
            <div className="bg-gray-100 p-6 rounded-lg">
              <div className="text-3xl font-bold mb-2">0</div>
              <div className="text-sm font-medium">Total Users</div>
            </div>          
          </div>
        </div>

      </div>
    </AuthGuard>
  )
}
