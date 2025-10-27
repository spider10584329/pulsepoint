'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface AuthGuardProps {
  children: React.ReactNode
  requireVerification?: boolean
  allowedRoles?: number[]
}

export default function AuthGuard({ children, requireVerification = true, allowedRoles }: AuthGuardProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = () => {
      try {
        const token = localStorage.getItem('token')
        const userData = localStorage.getItem('user')

        if (!token || !userData) {
          // No token or user data, redirect to login
          setIsLoading(false)
          router.push('/')
          return
        }

        const user = JSON.parse(userData)
        
        // Validate user object has required properties
        if (!user || !user.id || !user.email || user.isVerify === undefined) {
          // Invalid user data, clear and redirect
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          localStorage.removeItem('pendingUserId')
          localStorage.removeItem('pendingUserEmail')
          setIsLoading(false)
          router.push('/')
          return
        }
        
        if (requireVerification && user.isVerify !== 1) {
          // User exists but not verified, redirect to verification
          localStorage.setItem('pendingUserId', user.id.toString())
          localStorage.setItem('pendingUserEmail', user.email)
          setIsLoading(false)
          router.push(`/verify?id=${user.id}&email=${encodeURIComponent(user.email)}`)
          return
        }

        // Check role-based access if allowedRoles is specified
        if (allowedRoles && !allowedRoles.includes(user.role)) {
          // User doesn't have the required role, redirect to appropriate page
          setIsLoading(false)
          let redirectPath = '/'
          if (user.role === 0) {
            redirectPath = '/admin/dashboard'
          } else if (user.role === 1) {
            redirectPath = '/user'
          } else if (user.role === 2) {
            redirectPath = '/supportTeam'
          }
          router.push(redirectPath)
          return
        }

        // User is authenticated, verified (if required), and has correct role
        setIsAuthenticated(true)
        setIsLoading(false)
      } catch (error) {
        // Any error in parsing or validation, clear and redirect
        console.error('AuthGuard error:', error)
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        localStorage.removeItem('pendingUserId')
        localStorage.removeItem('pendingUserEmail')
        setIsLoading(false)
        router.push('/')
        return
      }
    }

    // Run immediately
    checkAuth()
    
    // Also run when the component mounts or router changes
  }, [router, requireVerification])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-500"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return <>{children}</>
}
