'use client'

import { useState } from 'react'
import { AppliedProject } from '@/types/user/software'

interface MySubscriptionsProps {
  subscriptions: AppliedProject[]
  onRefresh: () => void
}

export default function MySubscriptions({ subscriptions, onRefresh }: MySubscriptionsProps) {
  const [imageErrors, setImageErrors] = useState<{ [key: number]: boolean }>({})

  const handleImageError = (id: number) => {
    setImageErrors(prev => ({ ...prev, [id]: true }))
  }

  const getStatusBadge = (subscription: AppliedProject) => {
    const today = new Date()
    
    // is_apply = 0: Applying (awaiting admin approval)
    if (subscription.isApply === 0) {
      return {
        text: 'Pending Approval',
        className: 'bg-yellow-100 text-yellow-800 border-yellow-200'
      }
    }
    
    // is_apply = 1: In Use (active subscription)
    if (subscription.isApply === 1) {
      if (subscription.purchaseDate) {
        const purchaseDate = new Date(subscription.purchaseDate)
        const expirationDate = new Date(purchaseDate)
        
        // Add months based on periodicity
        expirationDate.setMonth(expirationDate.getMonth() + (subscription.periodicity || 1))
        
        if (today <= expirationDate) {
          return {
            text: subscription.periodicity === 12 ? 'Active - Annual' : 'Active - Monthly',
            className: 'bg-green-100 text-green-800 border-green-200'
          }
        }
      }
      
      // Free trial or no purchase date - just show as active
      return {
        text: 'Active',
        className: 'bg-green-100 text-green-800 border-green-200'
      }
    }
    
    // is_apply = 2: Expired
    if (subscription.isApply === 2) {
      return {
        text: 'Expired',
        className: 'bg-red-100 text-red-800 border-red-200'
      }
    }
    
    return {
      text: 'Unknown Status',
      className: 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  if (subscriptions.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
            <img 
              src="/svg/software.svg" 
              alt="No subscriptions"
              className="w-10 h-10 opacity-50"
            />
          </div>
          <div>
            <p className="text-lg text-gray-600 mb-2">No subscriptions yet</p>
            <p className="text-sm text-gray-500">Browse our software marketplace to get started</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {subscriptions.map((subscription) => {
        const status = getStatusBadge(subscription)
        
        return (
          <div key={subscription.id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden border border-gray-200">
            {/* Image Section */}
            <div className="relative h-40 bg-gradient-to-br from-gray-50 to-gray-100">
              {subscription.filename && !imageErrors[subscription.id] ? (
                <img
                  src={`http://localhost:5001/project/download?filepath=${subscription.filename}`}
                  alt={subscription.projectName}
                  className="w-full h-full object-cover"
                  onError={() => handleImageError(subscription.id)}
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                    <img 
                      src="/svg/software.svg" 
                      alt="Software"
                      className="w-8 h-8 opacity-70"
                    />
                  </div>
                </div>
              )}
              
              {/* Status Badge */}
              <div className="absolute top-3 right-3">
                <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${status.className}`}>
                  {status.text}
                </span>
              </div>
            </div>

            {/* Content Section */}
            <div className="p-5">
              <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-1">
                {subscription.projectName}
              </h3>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Subscribed on:</span>
                  <span className="font-medium text-gray-900">{formatDate(subscription.applyDate)}</span>
                </div>
                
                {subscription.purchaseDate && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Purchase Date:</span>
                    <span className="font-medium text-gray-900">{formatDate(subscription.purchaseDate)}</span>
                  </div>
                )}
                
                {subscription.periodicity && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Plan Type:</span>
                    <span className="font-medium text-gray-900">
                      {subscription.periodicity === 12 ? 'Annual' : 'Monthly'}
                    </span>
                  </div>
                )}
              </div>

              {/* Action Button */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <button className="w-full py-2 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200">
                  Manage Subscription
                </button>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
