'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useToast } from '../../lib/context/ToastContext'
import { getBackendUrl } from '../../lib/api'

export default function VerifyPage() {
  const [verifyCode, setVerifyCode] = useState('')
  const [submitLoading, setSubmitLoading] = useState(false)
  const [userInfo, setUserInfo] = useState<any>(null)
  const [resendLoading, setResendLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { showToast } = useToast()
  const backendUrl = getBackendUrl()

  useEffect(() => {
    // Get user ID from URL params or localStorage
    const userId = searchParams.get('id') || localStorage.getItem('pendingUserId')
    const userEmail = searchParams.get('email') || localStorage.getItem('pendingUserEmail')
    
    if (!userId) {
      // No user ID, redirect to home
      router.push('/')
      return
    }

    setUserInfo({ id: userId, email: userEmail })
  }, [searchParams, router])

  const handleVerifySubmit = async () => {
    if (!verifyCode || verifyCode.length !== 6) {
      showToast('error', 'Invalid Code', 'Please enter a 6-digit verification code.')
      return
    }

    if (!userInfo?.id) {
      showToast('error', 'Error', 'User information not found.')
      return
    }

    setSubmitLoading(true)

    try {
      const response = await fetch(`${backendUrl}/api/user/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: userInfo.id,
          verifyCode: verifyCode
        })
      })

      const data = await response.json()

      if (response.ok && data === true) {
        // Verification successful
        showToast('success', 'Verification Successful', 'Your account has been verified! Please sign in.')
        
        // Clear pending user data
        localStorage.removeItem('pendingUserId')
        localStorage.removeItem('pendingUserEmail')
        
        // Redirect to login page
        setTimeout(() => router.push('/'), 1500)
      } else {
        // Verification failed
        showToast('error', 'Verification Failed', 'Invalid verification code. Please try again.')
        setVerifyCode('')
      }
    } catch (error) {
      showToast('error', 'Connection Failed', 'Cannot connect to server. Please try again.')
    } finally {
      setSubmitLoading(false)
    }
  }

  const handleResendCode = async () => {
    if (!userInfo?.id || !userInfo?.email) {
      showToast('error', 'Error', 'User information not found.')
      return
    }

    setResendLoading(true)

    try {
      const response = await fetch(`${backendUrl}/api/user/send/verify-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: userInfo.id,
          email: userInfo.email,
          firstname: 'User', // You might want to store this in localStorage too
          lastname: ''
        })
      })

      const data = await response.json()

      if (response.ok && data.status === 1) {
        showToast('success', 'Code Sent', 'A new verification code has been sent to your email.')
      } else {
        showToast('error', 'Failed to Send', 'Could not send verification code. Please try again.')
      }
    } catch (error) {
      showToast('error', 'Connection Failed', 'Cannot connect to server. Please try again.')
    } finally {
      setResendLoading(false)
    }
  }

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6)
    setVerifyCode(value)
  }

  if (!userInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#b1bcd4' }}>
      <div className="bg-white rounded-lg shadow-2xl overflow-hidden w-full max-w-sm mx-auto">
        <div className="p-6">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
              <img src="/svg/email.svg" alt="Verification" className="w-14 h-14" />
            </div>
          </div>
          <div className="text-center mb-4">           
            <h1 className="text-xl font-bold text-gray-700 mb-2">Verify your Account</h1>
            <p className="text-gray-600 text-sm">
              You received a mail, check your mailbox
            </p>
           
          </div>

          <div className="space-y-3">
            <div>
              <label htmlFor="verifyCode" className="block text-sm font-medium text-gray-700 mb-2">
                VerifyCode
              </label>
              <input
                type="text"
                id="verifyCode"
                name="verifyCode"
                value={verifyCode}
                onChange={handleCodeChange}
                maxLength={6}
                className="w-full  text-md px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-gray-500 transition-colors tracking-widest"
                placeholder="Enter your Verification Code"
              />
              <p className="text-xs text-gray-500 text-center mt-2">
                Enter the 6-digit code sent to your email
              </p>
            </div>

            <button
              onClick={handleVerifySubmit}
              disabled={submitLoading || verifyCode.length !== 6}
              className="w-full bg-gray-800 text-white font-semibold py-2 px-6 rounded-md hover:bg-gray-900 focus:outline-none disabled:opacity-90 disabled:cursor-not-allowed transition-all"
            >
              {submitLoading ? 'Verifying...' : 'Verify'}
            </button>

            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">
                Didn't receive the code?
              </p>
              <button
                onClick={handleResendCode}
                disabled={resendLoading}
                className="text-gray-700 hover:text-gray-800 font-medium text-sm disabled:opacity-50"
              >
                {resendLoading ? 'Sending...' : 'Resend Code'}
              </button>
            </div>

            <div className="text-center">
              <button
                onClick={() => router.push('/')}
                className="text-gray-500 hover:text-gray-700 text-sm"
              >
                Back to Login
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
