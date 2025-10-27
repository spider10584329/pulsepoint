'use client'

import { useEffect, useState } from 'react'
import AuthGuard from '@/components/AuthGuard'

interface User {
  id: number
  email: string
  firstname: string
  lastname: string
  company: string
  hotelname: string
  status: number
  isVerify: number
  role: number
}

interface AppliedProject {
  id: number
  userId: number
  projectId: number
  projectName: string
  isApply: number
  applyDate: string
  purchaseDate?: string
}

export default function AdminUserPage() {
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [users, setUsers] = useState<User[]>([])
  const [appliedProjects, setAppliedProjects] = useState<AppliedProject[]>([])
  const [actionLoading, setActionLoading] = useState<number | null>(null)

  useEffect(() => {
    const userData = localStorage.getItem('user')
    const token = localStorage.getItem('token')
    
    if (userData && token) {
      try {
        const parsedUser = JSON.parse(userData)
        setUser(parsedUser)
        
        // Fetch users and applied projects data
        fetchUsers(token)
        fetchAppliedProjects(token)
      } catch (error) {
        console.error('Error parsing user data:', error)
      }
    }
    setIsLoading(false)
  }, [])

  const fetchUsers = async (token: string) => {
    try {
      const response = await fetch('http://localhost:5001/api/user/allusers', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }

  const fetchAppliedProjects = async (token: string) => {
    try {
      const response = await fetch('http://localhost:5001/api/apply/project/all', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setAppliedProjects(data)
      }
    } catch (error) {
      console.error('Error fetching applied projects:', error)
    }
  }

  const getUserProjectStats = (userId: number) => {
    const userProjects = appliedProjects.filter(project => project.userId === userId)
    const totalApplied = userProjects.length
    const implemented = userProjects.filter(project => project.isApply === 1 && project.purchaseDate).length
    
    return { totalApplied, implemented }
  }

  const handleUserAction = async (userId: number, action: 'activate' | 'deactivate' | 'delete' | 'edit') => {
    setActionLoading(userId)
    try {
      // Note: Based on the backend code, user status management is not fully implemented
      // This is a placeholder for future implementation
      console.log(`Action ${action} for user ${userId}`)
      
      if (action === 'edit') {
        // Handle edit action - could open a modal or navigate to edit page
        console.log(`Editing user ${userId}`)
        // Placeholder for edit functionality
      }
      
      // Refresh users after action
      const token = localStorage.getItem('token')
      if (token) {
        await fetchUsers(token)
      }
    } catch (error) {
      console.error(`Error performing ${action}:`, error)
    } finally {
      setActionLoading(null)
    }
  }

  const getRoleDisplayName = (role: number) => {
    switch (role) {
      case 0: return 'Admin'
      case 1: return 'User'
      case 2: return 'Support'
      default: return 'Unknown'
    }
  }

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-500"></div>
      </div>
    )
  }

  return (
    <AuthGuard requireVerification={true} allowedRoles={[0]}>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              USER Management
            </h1>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2  gap-4">
            <div className="bg-white rounded-lg shadow p-6 h-[calc(100vh-200px)] overflow-hidden flex flex-col">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">User List</h2>
                
                <div className="flex-1 overflow-auto">
                  {isLoading ? (
                    <div className="flex justify-center items-center h-40">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    </div>
                  ) : users.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No users found
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {users.map((userData) => {
                        const stats = getUserProjectStats(userData.id)
                        return (
                          <div key={userData.id} className="border border-gray-200 rounded-lg px-4 py-2 hover:bg-gray-50">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <h3 className="text-sm text-gray-900">{userData.email}</h3>
                              </div>
                              <div className="flex items-center space-x-3">
                                <div className="flex space-x-2">
                                  <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">
                                    {stats.totalApplied}
                                  </div>
                                  <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">
                                   {stats.implemented}
                                  </div>
                                </div>
                                <div className="flex space-x-2">
                                {/* Edit Button */}
                                <button
                                  onClick={() => handleUserAction(userData.id, 'edit')}
                                  disabled={actionLoading === userData.id}
                                  className="p-2 rounded-md bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-blue-600 transition-colors disabled:opacity-50"
                                  title="Edit User"
                                >
                                  {actionLoading === userData.id ? (
                                    <div className="w-4 h-4 animate-spin border-2 border-gray-600 border-t-transparent rounded-full"></div>
                                  ) : (
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                  )}
                                </button>
                                
                                {/* Delete Button */}
                                <button
                                  onClick={() => handleUserAction(userData.id, 'delete')}
                                  disabled={actionLoading === userData.id}
                                  className="p-2 rounded-md bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-red-600 transition-colors disabled:opacity-50"
                                  title="Delete User"
                                >
                                  {actionLoading === userData.id ? (
                                    <div className="w-4 h-4 animate-spin border-2 border-gray-600 border-t-transparent rounded-full"></div>
                                  ) : (
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                  )}
                                </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Applied List</h2>
               
            </div>
          </div>
          
        </div>
    </AuthGuard>
  )
}
