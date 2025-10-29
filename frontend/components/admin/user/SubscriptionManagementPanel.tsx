'use client'

import { useState, useEffect } from 'react'
import { useToast } from '@/lib/context/ToastContext'
import CustomSelect from '@/components/CustomSelect'

interface User {
  id: number
  email: string
  firstname: string
  lastname: string
}

interface ProjectSubscriber {
  userId: number
  applyDate: string
  isApply: number
  periodicity?: number
  purchaseDate?: string
  purchase_date?: string  // Alternative field name from backend
  [key: string]: any      // Allow additional fields from backend
}

interface SubscriptionManagementPanelProps {
  projectId: number
  projectName: string
  selectedUserId?: number | null
  subscribers: ProjectSubscriber[]
  users: User[]
  onStatusUpdate: () => void
  onBack: () => void
}

export default function SubscriptionManagementPanel({
  projectId,
  projectName,
  selectedUserId,
  subscribers,
  users,
  onStatusUpdate,
  onBack
}: SubscriptionManagementPanelProps) {
  const [loading, setLoading] = useState(false)
  const [statuses, setStatuses] = useState<{ [userId: number]: number }>({})
  const [subscriptionData, setSubscriptionData] = useState<{ 
    [userId: number]: { 
      periodicity: number
      purchaseDate: string 
    } 
  }>({})
  const { showToast } = useToast()

  useEffect(() => {
    if (subscribers.length > 0) {
      // Initialize statuses and subscription data from current subscriber data
      const initialStatuses: { [userId: number]: number } = {}
      const initialSubscriptionData: { [userId: number]: { periodicity: number; purchaseDate: string } } = {}
      
      subscribers.forEach(subscriber => {
        initialStatuses[subscriber.userId] = subscriber.isApply
        let purchaseDate = subscriber.purchaseDate || subscriber.purchase_date || new Date().toISOString().split('T')[0]
        
        // Extract only the date part (yyyy-mm-dd) if it contains time information
        if (purchaseDate && purchaseDate.includes(' ')) {
          purchaseDate = purchaseDate.split(' ')[0]
        }
        
        initialSubscriptionData[subscriber.userId] = {
          periodicity: subscriber.periodicity || 1,
          purchaseDate: purchaseDate
        }
      })
      
      setStatuses(initialStatuses)
      setSubscriptionData(initialSubscriptionData)
    }
  }, [subscribers])

  const handleStatusChange = (userId: number, newStatus: number) => {
    setStatuses(prev => ({
      ...prev,
      [userId]: newStatus
    }))
  }

  const handleSubscriptionDataChange = (userId: number, field: 'periodicity' | 'purchaseDate', value: string | number) => {
    setSubscriptionData(prev => ({
      ...prev,
      [userId]: {
        ...prev[userId],
        [field]: value
      }
    }))
  }

  const getSubscriptionStatus = (subscriber: ProjectSubscriber) => {
    const purchaseDate = subscriber.purchaseDate || subscriber.purchase_date
    const hasPaymentInfo = subscriber.periodicity && subscriber.periodicity > 0 && purchaseDate && purchaseDate !== new Date().toISOString().split('T')[0]
    
    if (subscriber.isApply === 1) {
      if (hasPaymentInfo) {
        return { type: 'paid', label: 'Active Subscription', color: 'bg-green-100 text-green-800' }
      } else {
        return { type: 'trial', label: 'Free Trial', color: 'bg-blue-100 text-blue-800' }
      }
    } else {
      // Check if user has requested to reapply (apply_date > purchase_date)
      if (subscriber.applyDate && purchaseDate) {
        const applyDate = new Date(subscriber.applyDate)
        const purchaseDateObj = new Date(purchaseDate)
        
        if (applyDate > purchaseDateObj) {
          return { type: 'reapply', label: 'Re apply', color: 'bg-yellow-100 text-yellow-800' }
        }
      }
      
      if (hasPaymentInfo) {
        return { type: 'expired', label: 'Subscription Expired', color: 'bg-red-100 text-red-800' }
      } else {
        return { type: 'trial_expired', label: 'Trial Expired', color: 'bg-yellow-100 text-yellow-800' }
      }
    }
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        showToast('error', 'Authentication Error', 'No authentication token found')
        return
      }

      // Update each subscriber with current form values
      const updatePromises = Object.entries(statuses).map(async ([userIdStr, status]) => {
        const userId = parseInt(userIdStr)
        const currentSubscriptionData = subscriptionData[userId]
        
        if (!currentSubscriptionData) return

        // Format purchase date to match database format (yyyy-mm-dd HH:mm:ss)
        const formattedPurchaseDate = currentSubscriptionData.purchaseDate 
          ? `${currentSubscriptionData.purchaseDate} 00:00:00`
          : null

        const requestData = {
          isApply: status,
          purchaseDate: formattedPurchaseDate,
          periodicity: currentSubscriptionData.periodicity
        }

        // Find the applied project record for this user
        const subscriber = subscribers.find(s => s.userId === userId)
        if (!subscriber) {
          console.error(`No subscriber found for userId ${userId}`)
          return
        }

        const response = await fetch(`http://localhost:5001/api/apply/project/update?id=${subscriber.id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestData)
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(`Failed to update subscription for user ${userId}: ${errorData.message || 'Unknown error'}`)
        }
        
        const result = await response.json()
        if (result.status !== 1) {
          throw new Error(`Update failed: ${result.message || 'Unknown error'}`)
        }
      })

      await Promise.all(updatePromises)
      
      showToast('success', 'Subscription Updated', 'Subscription information has been updated successfully!')
      onStatusUpdate()
      onBack()
    } catch (error) {
      console.error('Error updating subscription:', error)
      showToast('error', 'Update Failed', error instanceof Error ? error.message : 'Failed to update subscription information')
    } finally {
      setLoading(false)
    }
  }

  const relevantSubscribers = selectedUserId 
    ? subscribers.filter(s => s.userId === selectedUserId)
    : subscribers

  return (
    <div className="flex flex-col h-full max-h-full min-h-0">
      {/* Header */}
      <div className="flex items-start sm:items-center justify-between mb-4 sm:mb-6 pb-4 border-b border-gray-200 gap-3 flex-shrink-0">
        <div className="flex items-start sm:items-center space-x-3 min-w-0 flex-1">
          <button
            onClick={onBack}
            className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-md transition-colors flex-shrink-0 mt-0.5 sm:mt-0"
            title="Back to projects"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="min-w-0 flex-1">
            <h2 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900 truncate">
              {projectName}
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
              {selectedUserId ? 'Edit Subscription Status' : 'Project Subscribers List'}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="px-1 sm:px-0 pr-2">
          {relevantSubscribers.length === 0 ? (
          <div className="text-center py-8 sm:py-12 text-gray-500">
            <div className="flex flex-col items-center space-y-3">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <p className="text-sm sm:text-base">No subscribers found</p>
            </div>
          </div>
        ) : selectedUserId ? (
          // Single user editing mode - show editable interface
          <div className="space-y-3 sm:space-y-4 pb-4 sm:pb-4">
            {relevantSubscribers.map((subscriber) => {
              const user = users.find(u => u.id === subscriber.userId)
              if (!user) return null

              const status = getSubscriptionStatus(subscriber)
              
              const currentSubscriptionData = subscriptionData[subscriber.userId] || (() => {
                let purchaseDate = subscriber.purchaseDate || subscriber.purchase_date || new Date().toISOString().split('T')[0]
                
                // Extract only the date part (yyyy-mm-dd) if it contains time information
                if (purchaseDate && purchaseDate.includes(' ')) {
                  purchaseDate = purchaseDate.split(' ')[0]
                }
                
                return {
                  periodicity: subscriber.periodicity || 1,
                  purchaseDate: purchaseDate
                }
              })()

              return (
                <div key={subscriber.userId} className="border border-gray-200 rounded-lg p-3 sm:p-4 lg:p-4 bg-white shadow-sm">
                  {/* User Info Header */}
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4 pb-3 border-b border-gray-200 gap-3 sm:gap-4">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 text-base sm:text-lg truncate">{user.email}</h4>
                      <div className="text-sm text-gray-500 mt-1 space-y-1">
                        <p className="text-xs sm:text-sm">Applied: {new Date(subscriber.applyDate).toLocaleDateString()}</p>
                        {(() => {
                          const purchaseDate = subscriber.purchaseDate || subscriber.purchase_date || currentSubscriptionData.purchaseDate
                          const isDefaultDate = purchaseDate === new Date().toISOString().split('T')[0]
                          
                          if (purchaseDate && !isDefaultDate) {
                            return <p className="text-xs sm:text-sm">Purchase Date: {new Date(purchaseDate).toLocaleDateString()}</p>
                          }
                          return null
                        })()}
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${status.color} whitespace-nowrap`}>
                        {status.label}
                      </span>
                    </div>
                  </div>

                  {/* Subscription Form */}
                  <div className="space-y-4 sm:space-y-5">
                    {/* Status Control - Full width on mobile, half on tablet+ */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Subscription Status
                        </label>
                        <CustomSelect
                          value={statuses[subscriber.userId] ?? subscriber.isApply}
                          onChange={(value) => handleStatusChange(subscriber.userId, parseInt(value.toString()))}
                          options={[
                            { value: 0, label: 'Suspended' },
                            { value: 1, label: 'Active' }
                          ]}
                          placeholder="Select status"
                        />
                      </div>
                    </div>

                    {/* Payment Information */}
                    <div className="bg-gray-50 rounded-lg p-3 sm:p-4 space-y-4">
                      <h5 className="font-medium text-gray-900 text-sm mb-3">Payment Information</h5>
                      
                      {/* Form Fields - Stack on mobile, side by side on tablet+ */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Period 
                          </label>
                          <CustomSelect
                            value={currentSubscriptionData.periodicity}
                            onChange={(value) => handleSubscriptionDataChange(subscriber.userId, 'periodicity', parseInt(value.toString()))}
                            options={[
                              { value: 1, label: '1 Month' },
                              { value: 3, label: '3 Months' },
                              { value: 6, label: '6 Months' },
                              { value: 12, label: '12 Months' }
                            ]}
                            placeholder="Select period"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Purchase Date
                          </label>
                          <input
                            type="date"
                            value={currentSubscriptionData.purchaseDate}
                            onChange={(e) => handleSubscriptionDataChange(subscriber.userId, 'purchaseDate', e.target.value)}
                            className="w-full rounded-md border border-gray-300 bg-white px-3 py-1 text-sm  focus:outline-none  min-h-[35px]"
                          />
                        </div>
                      </div>

                      {/* Subscription Info */}


                      {/* Current Subscription Info */}
                      {subscriber.purchaseDate && subscriber.periodicity && (
                        <div className="text-sm text-gray-600 bg-white rounded-lg p-3 sm:p-4 border border-gray-200 shadow-sm">
                          <h6 className="font-medium text-gray-800 mb-3 text-xs uppercase tracking-wide">Current Subscription Details</h6>
                          
                          <div className="space-y-2">
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-0">
                              <span className="text-gray-600 text-xs sm:text-sm">Subscription Period:</span>
                              <span className="font-medium text-gray-800 text-xs">
                                {subscriber.periodicity} month{subscriber.periodicity > 1 ? 's' : ''}
                              </span>
                            </div>
                            
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-0">
                              <span className="text-gray-600 text-xs sm:text-sm">Purchase Date:</span>
                              <span className="font-medium text-gray-800 text-xs">
                                {new Date(subscriber.purchaseDate).toLocaleDateString()}
                              </span>
                            </div>
                            
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-0">
                              <span className="text-gray-600 text-xs sm:text-sm">Expires:</span>
                              <span className="font-medium text-gray-800 text-xs">
                                {new Date(new Date(subscriber.purchaseDate).setMonth(
                                  new Date(subscriber.purchaseDate).getMonth() + subscriber.periodicity
                                )).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                  </div>

                  {/* Save Button */}
                  <div className="flex flex-col sm:flex-row justify-end border-gray-200  gap-3 sm:gap-0">
                    <button
                      onClick={handleSave}
                      disabled={loading}
                      className="w-full sm:w-auto px-4 py-2.5 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                    >
                      {loading ? (
                        <div className="flex items-center justify-center">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          <span>Saving...</span>
                        </div>
                      ) : (
                        'Save Changes'
                      )}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          // Multiple users view mode - show read-only list
          <div className="space-y-3 sm:space-y-4 pb-6 sm:pb-8">
            {relevantSubscribers.map((subscriber) => {
              const user = users.find(u => u.id === subscriber.userId)
              if (!user) return null

              const status = getSubscriptionStatus(subscriber)

              return (
                <div key={subscriber.userId} className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 text-sm sm:text-base">{user.email}</h4>
                      <div className="text-xs sm:text-sm text-gray-500 space-y-1 mt-2">
                        <div className="flex items-center space-x-4">
                          <span>Applied: {new Date(subscriber.applyDate).toLocaleDateString()}</span>
                        </div>
                        
                        {subscriber.periodicity && subscriber.periodicity > 0 && subscriber.purchaseDate && subscriber.purchaseDate !== new Date().toISOString().split('T')[0] ? (
                          <div className="bg-gray-50 rounded p-2 mt-2 text-xs">
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <span className="font-medium">Subscription:</span>
                                <div>{subscriber.periodicity} month{subscriber.periodicity > 1 ? 's' : ''}</div>
                              </div>
                              <div>
                                <span className="font-medium">Purchase Date:</span>
                                <div>{new Date(subscriber.purchaseDate).toLocaleDateString()}</div>
                              </div>
                              <div className="col-span-2">
                                <span className="font-medium">Expires:</span>
                                <div>
                                  {new Date(new Date(subscriber.purchaseDate).setMonth(
                                    new Date(subscriber.purchaseDate).getMonth() + subscriber.periodicity
                                  )).toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="text-xs text-gray-400 italic mt-2">
                            No payment information - Trial subscription
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex-shrink-0 ml-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${status.color}`}>
                        {status.label}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
        </div>
      </div>
    </div>
  )
}
