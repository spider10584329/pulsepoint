'use client'

import { useEffect, useState } from 'react'
import AuthGuard from '@/components/AuthGuard'

export default function UserFAQPage() {
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
              Frequently Asked Questions
            </h1>
            <p className="text-gray-600">
              Find answers to common questions and get help with platform usage.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">FAQ</h2>
            <p className="text-gray-600">
              This page will contain frequently asked questions and their answers.
            </p>
          </div>
        </div>
    </AuthGuard>
  )
}
