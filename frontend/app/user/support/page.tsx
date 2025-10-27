'use client'

import { useEffect, useState } from 'react'
import AuthGuard from '@/components/AuthGuard'

export default function UserSupportPage() {
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData)
        setUser(parsedUser)
      } catch (error) {
        console.error('Error parsing user data:', error)
      }
    }
    setIsLoading(false)
  }, [])

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-500"></div>
      </div>
    )
  }

  return (
    <AuthGuard requireVerification={true} allowedRoles={[1]}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Support
          </h1>
          <p className="text-gray-600">
            Get help and submit support requests for technical assistance.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Support Center</h2>
          <p className="text-gray-600">
            This page will contain support options and contact information for users.
          </p>
        </div>
      </div>
    </AuthGuard>
  )
}
