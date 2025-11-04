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
    <div className="overflow-x-auto border border-gray-200 rounded-lg">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Software
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Applied
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Purchased
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Period
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Expires
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {subscriptions.map((subscription) => {
            const status = getStatusBadge(subscription)
            const expirationDate = subscription.purchaseDate && subscription.periodicity
              ? (() => {
                  const purchase = new Date(subscription.purchaseDate)
                  const expiry = new Date(purchase)
                  expiry.setMonth(expiry.getMonth() + subscription.periodicity)
                  return formatDate(expiry.toISOString())
                })()
              : 'N/A'
            
            return (
              <tr key={subscription.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      {subscription.filename && !imageErrors[subscription.id] ? (
                        <img
                          src={`http://localhost:5001/project/download?filepath=${subscription.filename}`}
                          alt={subscription.projectName}
                          className="h-10 w-10 rounded-lg object-cover"
                          onError={() => handleImageError(subscription.id)}
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center">
                          <img 
                            src="/svg/software.svg" 
                            alt="Software"
                            className="w-6 h-6 opacity-50"
                          />
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{subscription.projectName}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{formatDate(subscription.applyDate)}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{formatDate(subscription.purchaseDate)}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {subscription.periodicity === 12 ? '12 months' : subscription.periodicity === 1 ? '1 month' : 'N/A'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{expirationDate}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${status.className}`}>
                    {status.text}
                  </span>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
