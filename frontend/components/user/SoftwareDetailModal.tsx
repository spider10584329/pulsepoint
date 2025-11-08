'use client'

import { useState, useEffect } from 'react'
import { Software, SubscriptionType } from '@/types/user/software'
import { useToast } from '@/lib/context/ToastContext'
import { getBackendUrl } from '@/lib/api'

interface SoftwareDetailModalProps {
  software: Software
  onClose: () => void
  userId: number
  onSubscriptionSuccess: () => void
}

export default function SoftwareDetailModal({ 
  software, 
  onClose, 
  userId,
  onSubscriptionSuccess 
}: SoftwareDetailModalProps) {
  const backendUrl = getBackendUrl()
  const [imageError, setImageError] = useState(false)
  const [selectedType, setSelectedType] = useState<SubscriptionType>('monthly') // Default to monthly
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [subscriptionStatus, setSubscriptionStatus] = useState<{
    exists: boolean
    status: number | null // 0 = Pending, 1 = Active, 2 = Expired
    periodicity: number | null
  }>({ exists: false, status: null, periodicity: null })
  const [isLoadingStatus, setIsLoadingStatus] = useState(true)
  const { showToast } = useToast()

  const formatPrice = (price: string) => {
    return price ? `$${price}` : 'N/A'
  }

  const getSubscriptionStatusInfo = () => {
    if (!subscriptionStatus.exists) return null

    switch (subscriptionStatus.status) {
      case 0: // Pending Approval
        return {
          label: 'Pending Approval',
          color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
          icon: '⏳'
        }
      case 1: // Active
        const hasPayment = subscriptionStatus.periodicity !== null
        return {
          label: hasPayment ? 'Active Subscription' : 'Free Trial Active',
          color: hasPayment ? 'bg-green-100 text-green-800 border-green-300' : 'bg-blue-100 text-blue-800 border-blue-300',
          icon: '✓'
        }
      case 2: // Expired
        return {
          label: 'Subscription Expired',
          color: 'bg-red-100 text-red-800 border-red-300',
          icon: '✗'
        }
      default:
        return null
    }
  }

  const getButtonText = () => {
    if (isSubmitting) return 'Processing...'
    
    if (subscriptionStatus.exists) {
      switch (subscriptionStatus.status) {
        case 0: // Pending
          return 'Pending Approval'
        case 1: // Active
          return 'Already Subscribed'
        case 2: // Expired
          return selectedType === 'trial' 
            ? 'Renew Subscription' 
            : selectedType === 'monthly'
            ? 'Renew Monthly'
            : 'Renew Annually'
      }
    }

    // New user
    return selectedType === 'trial' 
      ? 'Start Free Trial' 
      : selectedType === 'monthly'
      ? 'Subscribe Monthly'
      : 'Subscribe Annually'
  }

  const isButtonDisabled = () => {
    if (isSubmitting || isLoadingStatus) return true
    // Disable if active (status 1) or pending (status 0)
    return subscriptionStatus.exists && (subscriptionStatus.status === 1 || subscriptionStatus.status === 0)
  }

  // Check subscription status on mount
  useEffect(() => {
    const checkSubscriptionStatus = async () => {
      setIsLoadingStatus(true)
      try {
        const token = localStorage.getItem('token')
        if (!token) {
          setIsLoadingStatus(false)
          return
        }

        const response = await fetch(`${backendUrl}/api/apply/project/foruser?id=${userId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        if (response.ok) {
          const subscriptions = await response.json()
          const existing = subscriptions.find((sub: any) => 
            sub.project_id === software.id || sub.projectId === software.id
          )

          if (existing) {
            const status = existing.is_apply ?? existing.isApply
            const periodicity = existing.periodicity
            setSubscriptionStatus({ exists: true, status, periodicity })
            
            // Auto-select the plan based on current subscription
            if (status === 1) { // Active subscription
              if (periodicity === null) {
                setSelectedType('trial')
              } else if (periodicity === 1) {
                setSelectedType('monthly')
              } else if (periodicity === 12) {
                setSelectedType('annual')
              }
            } else if (status === 0 || status === 2) {
              // For pending or expired, default to monthly
              setSelectedType('monthly')
            }
          }
        }
      } catch (error) {
        console.error('Error checking subscription status:', error)
      } finally {
        setIsLoadingStatus(false)
      }
    }

    checkSubscriptionStatus()
  }, [userId, software.id])

  const handleSubscribe = async () => {
    setIsSubmitting(true)

    try {
      const token = localStorage.getItem('token')
      if (!token) {
        showToast('error', 'Authentication Error', 'Please login to continue')
        setIsSubmitting(false)
        return
      }

      // Format current date and time as YYYY-MM-DD H:I:S
      const now = new Date()
      const year = now.getFullYear()
      const month = String(now.getMonth() + 1).padStart(2, '0')
      const day = String(now.getDate()).padStart(2, '0')
      const hours = String(now.getHours()).padStart(2, '0')
      const minutes = String(now.getMinutes()).padStart(2, '0')
      const seconds = String(now.getSeconds()).padStart(2, '0')
      const today = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
      
      // Check if user has existing subscription for this project
      const checkResponse = await fetch(`${backendUrl}/api/apply/project/foruser?id=${userId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!checkResponse.ok) {
        showToast('error', 'Error', 'Failed to check subscription status')
        setIsSubmitting(false)
        return
      }

      const existingSubscriptions = await checkResponse.json()
      const existingSubscription = existingSubscriptions.find((sub: any) => sub.project_id === software.id || sub.projectId === software.id)

      console.log('Existing subscriptions:', existingSubscriptions)
      console.log('Looking for project ID:', software.id)
      console.log('Found subscription:', existingSubscription)

      // Scenario 1: New user - No subscription history (Automatic Free Trial)
      if (!existingSubscription) {
        const requestData = {
          userId: userId,
          projectId: software.id,
          applyDate: today,
          isApply: 1, // 1 = Active (Free Trial)
          userCount: 1
          // Note: periodicity and purchaseDate are intentionally not set (empty/null for free trial)
        }

        const response = await fetch(`${backendUrl}/api/apply/project`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestData)
        })

        const result = await response.json()

        if (response.ok && result.status === 1) {
          showToast('success', 'Free Trial Started', 'Welcome! Your free trial has been activated. Enjoy exploring the software!')
          onSubscriptionSuccess()
          onClose()
        } else if (result.status === 0) {
          showToast('info', 'Already Applied', 'You have already applied for this software')
        } else {
          showToast('error', 'Activation Failed', `Unable to activate your free trial: ${result.message}`)
        }
      }
      // Scenario 2: Active user (is_apply = 1)
      else if (existingSubscription.is_apply === 1 || existingSubscription.isApply === 1) {
        showToast('info', 'Already Active', `You are currently using ${software.name}. Your subscription is active.`)
      }
      // Scenario 3: Expired user (is_apply = 2) - Re-apply for approval (Paid subscription only)
      else if (existingSubscription.is_apply === 2 || existingSubscription.isApply === 2) {
        console.log('Expired user detected, processing re-application...')
        console.log('Subscription object:', JSON.stringify(existingSubscription, null, 2))
        console.log('Selected subscription type:', selectedType)
        
        // Check if user is trying to use free trial again (not allowed)
        if (selectedType === 'trial') {
          showToast('info', 'Free Trial Not Available', 'You have already used your free trial for this software. Please select a paid subscription plan (Monthly or Annual) to continue.')
          setIsSubmitting(false)
          return
        }
        
        // Get the subscription ID - check multiple possible property names
        const subscriptionId = existingSubscription.id || existingSubscription.apply_id || existingSubscription.applyId
        
        if (!subscriptionId) {
          console.error('No subscription ID found in:', existingSubscription)
          showToast('error', 'Update Error', 'Unable to identify subscription record. Please contact support.')
          setIsSubmitting(false)
          return
        }
        
        console.log('Using subscription ID:', subscriptionId)
        
        // Determine periodicity based on selected subscription type
        // monthly = 1, annual = 12
        let periodicity = null
        if (selectedType === 'monthly') {
          periodicity = 1
        } else if (selectedType === 'annual') {
          periodicity = 12
        }
        
        const requestData = {
          applyDate: today, // Update apply date to current date/time
          isApply: 0, // Set to Pending Approval - will be activated by admin with purchase_date
          periodicity: periodicity // Set based on selected plan (1 for monthly, 12 for annual)
          // Note: purchase_date will be set by admin when approving (at approval time)
        }

        console.log('Sending update request with data:', requestData)

        const response = await fetch(`${backendUrl}/api/apply/project/update?id=${subscriptionId}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestData)
        })

        console.log('Update response status:', response.status)

        if (response.ok) {
          const result = await response.json()
          console.log('Update result:', result)
          if (result.status === 1) {
            showToast('success', 'Subscription Request Submitted', 'Your paid subscription request has been submitted and is awaiting administrator approval. You will be notified once approved.')
            onSubscriptionSuccess()
            onClose()
          } else {
            showToast('error', 'Request Failed', result.message || 'Failed to submit your subscription request.')
          }
        } else {
          const errorText = await response.text()
          console.error('Update failed with status:', response.status, 'Error:', errorText)
          showToast('error', 'Update Failed', 'Failed to submit your subscription request. Please try again.')
        }
      }
      // Scenario 4: Pending approval (is_apply = 0)
      else if (existingSubscription.is_apply === 0 || existingSubscription.isApply === 0) {
        showToast('info', 'Application Pending', `Your application for ${software.name} is currently awaiting administrator approval.`)
      }
      // Fallback: Unknown status
      else {
        console.error('Unknown subscription status:', existingSubscription)
        showToast('error', 'Status Error', `Unknown subscription status. Please contact support.`)
      }

    } catch (error) {
      console.error('Subscription error:', error)
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
      showToast('error', 'Error', `An unexpected error occurred: ${errorMessage}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="w-full">
      <div className="bg-white w-full">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-3 sm:px-4 py-2 sm:py-3 flex justify-between items-center">
          <h2 className="text-base sm:text-xl lg:text-2xl font-bold text-gray-900 truncate pr-2">{software.name}</h2>
          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-3 sm:p-4 lg:p-6">
          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mb-4 sm:mb-6 lg:mb-8">
            {/* Left Side - Image and Links */}
            <div className="space-y-3 sm:space-y-4 lg:space-y-6">
              {/* Software Image */}
              <div className="rounded-lg sm:rounded-xl overflow-hidden shadow-lg bg-gradient-to-br from-gray-50 to-gray-100">
                {software.filename && !imageError ? (
                  <img
                    src={`${backendUrl}/project/download?filepath=${software.filename}`}
                    alt={software.name}
                    className="w-full h-48 sm:h-64 lg:h-80 object-cover"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <div className="flex items-center justify-center h-48 sm:h-64 lg:h-80">
                    <div className="w-20 h-20 sm:w-28 sm:h-28 lg:w-32 lg:h-32 rounded-full bg-white flex items-center justify-center">
                      <img 
                        src="/svg/software.svg" 
                        alt="Software"
                        className="w-10 h-10 sm:w-14 sm:h-14 lg:w-16 lg:h-16 opacity-70"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Website Link */}
              {software.websiteLink && (
                <div className="bg-gray-50 border border-gray-300 rounded-lg px-3 sm:px-4 py-2">
                  <div className="flex items-start space-x-2 sm:space-x-3">
                     <img 
                        src="/svg/location.svg" 
                        alt="Location"
                        className="w-5 h-5 sm:w-6 sm:h-6 brightness-0 flex-shrink-0"                   
                      />
                    <div className="flex-1 min-w-0">                      
                      <a
                        href={software.websiteLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-800 hover:text-gray-900 text-xs sm:text-sm break-all"
                      >
                        {software.websiteLink}
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Side - Details and Subscription */}
            <div className="space-y-3 sm:space-y-4 lg:space-y-6">
              {/* Description */}
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3">About this Software</h3>
                <p className="text-sm sm:text-base text-gray-700 leading-relaxed">{software.description}</p>
              </div>

              {/* Subscription Options */}
              <div className="border-t pt-3 sm:pt-4 lg:pt-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Choose Your Plan</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
                  {/* Free Trial Option */}
                  <button
                    onClick={() => setSelectedType('trial')}
                    disabled={subscriptionStatus.status === 1 || subscriptionStatus.status === 0}
                    className={`p-2 sm:p-3 rounded-lg border-2 transition-all text-center relative ${
                      selectedType === 'trial'
                        ? 'border-green-500 bg-green-50 shadow-lg'
                        : subscriptionStatus.status === 1 && subscriptionStatus.periodicity === null
                        ? 'border-blue-400 bg-blue-50'
                        : 'border-gray-200 hover:border-green-300 bg-white'
                    } ${(subscriptionStatus.status === 1 || subscriptionStatus.status === 0) ? 'opacity-60 cursor-not-allowed' : ''}`}
                  >
                    {subscriptionStatus.status === 1 && subscriptionStatus.periodicity === null && (
                      <div className="absolute top-1 right-1 sm:top-2 sm:right-2 w-5 h-5 sm:w-6 sm:h-6">
                        <img src="/svg/success.svg" alt="Active" className="w-full h-full" style={{ filter: 'invert(45%) sepia(89%) saturate(1791%) hue-rotate(193deg) brightness(99%) contrast(101%)' }} />
                      </div>
                    )}
                    <div className="flex flex-col items-center">
                      <h4 className="text-xs sm:text-sm font-bold text-gray-900 mb-1 sm:mb-2">Free Trial</h4>
                      <p className="text-base sm:text-xl font-bold text-green-600 mb-0.5 sm:mb-1">Free</p>
                      <p className="text-[10px] sm:text-xs text-gray-600">7 days trial</p>
                    </div>
                  </button>

                  {/* Monthly Option */}
                  {software.mprice && (
                    <button
                      onClick={() => setSelectedType('monthly')}
                      disabled={subscriptionStatus.status === 1 || subscriptionStatus.status === 0}
                      className={`p-2 sm:p-3 rounded-lg border-2 transition-all text-center relative ${
                        selectedType === 'monthly'
                          ? 'border-blue-500 bg-blue-50 shadow-lg'
                          : subscriptionStatus.status === 1 && subscriptionStatus.periodicity === 1
                          ? 'border-blue-400 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300 bg-white'
                      } ${(subscriptionStatus.status === 1 || subscriptionStatus.status === 0) ? 'opacity-60 cursor-not-allowed' : ''}`}
                    >
                      {subscriptionStatus.status === 1 && subscriptionStatus.periodicity === 1 && (
                        <div className="absolute top-1 right-1 sm:top-2 sm:right-2 w-5 h-5 sm:w-6 sm:h-6">
                          <img src="/svg/success.svg" alt="Active" className="w-full h-full" style={{ filter: 'invert(45%) sepia(89%) saturate(1791%) hue-rotate(193deg) brightness(99%) contrast(101%)' }} />
                        </div>
                      )}
                      <div className="flex flex-col items-center">
                        <h4 className="text-xs sm:text-sm font-bold text-gray-900 mb-1 sm:mb-2">Monthly</h4>
                        <p className="text-base sm:text-xl font-bold text-blue-600 mb-0.5 sm:mb-1">{formatPrice(software.mprice)}</p>
                        <p className="text-[10px] sm:text-xs text-gray-600">Billed monthly</p>
                      </div>
                    </button>
                  )}

                  {/* Annual Option */}
                  {software.price && (
                    <button
                      onClick={() => setSelectedType('annual')}
                      disabled={subscriptionStatus.status === 1 || subscriptionStatus.status === 0}
                      className={`p-2 sm:p-3 rounded-lg border-2 transition-all text-center relative ${
                        selectedType === 'annual'
                          ? 'border-indigo-500 bg-indigo-50 shadow-lg'
                          : subscriptionStatus.status === 1 && subscriptionStatus.periodicity === 12
                          ? 'border-indigo-400 bg-indigo-50'
                          : 'border-gray-200 hover:border-indigo-300 bg-white'
                      } ${(subscriptionStatus.status === 1 || subscriptionStatus.status === 0) ? 'opacity-60 cursor-not-allowed' : ''}`}
                    >                     
                      {subscriptionStatus.status === 1 && subscriptionStatus.periodicity === 12 && (
                        <div className="absolute top-1 right-1 sm:top-2 sm:right-2 w-5 h-5 sm:w-6 sm:h-6">
                          <img src="/svg/success.svg" alt="Active" className="w-full h-full" style={{ filter: 'invert(37%) sepia(66%) saturate(3117%) hue-rotate(231deg) brightness(93%) contrast(92%)' }} />
                        </div>
                      )}
                      <div className="flex flex-col items-center">
                        <h4 className="text-xs sm:text-sm font-bold text-gray-900 mb-1 sm:mb-2">Annual</h4>
                        <p className="text-base sm:text-xl font-bold text-indigo-600 mb-0.5 sm:mb-1">{formatPrice(software.price)}</p>
                        <p className="text-[10px] sm:text-xs text-gray-600">Billed annually</p>
                      </div>
                    </button>
                  )}
                </div>

                {/* Action Button */}
                <button
                  onClick={handleSubscribe}
                  disabled={isButtonDisabled()}
                  className={`w-full py-2 sm:py-2.5 lg:py-3 px-4 text-white text-xs sm:text-sm rounded-md transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed mt-4 sm:mt-6 lg:mt-8 ${
                    isButtonDisabled() ? 'bg-gray-400' : 'bg-gray-800'
                  }`}
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    getButtonText()
                  )}
                </button>

                <p className="text-center text-[10px] sm:text-xs text-gray-500 mt-2 sm:mt-3 px-2">
                  {subscriptionStatus.status === 1 
                    ? 'You already have an active subscription to this software.'
                    : subscriptionStatus.status === 0
                    ? 'Your subscription request is pending administrator approval.'
                    : selectedType === 'trial' 
                    ? 'No credit card required. Cancel anytime during trial period.'
                    : 'Secure payment. Cancel anytime from your account settings.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
