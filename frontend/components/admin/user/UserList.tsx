'use client'

import { useState } from 'react'

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
  filename?: string
}

interface UserListProps {
  users: User[]
  appliedProjects: AppliedProject[]
  selectedUserId: number | null
  actionLoading: number | null
  isLoading: boolean
  onUserClick: (userId: number) => void
  onUserAction: (userId: number, action: 'edit' | 'delete') => void

}

export default function UserList({ 
  users, 
  appliedProjects, 
  selectedUserId, 
  actionLoading, 
  isLoading,
  onUserClick, 
  onUserAction,
  
}: UserListProps) {
  const getUserProjectStats = (userId: number) => {
    const userProjects = appliedProjects.filter(project => project.userId === userId)
    
    // Yellow/Orange badge: Pending Approval (is_apply = 0)
    const pendingApproval = userProjects.filter(project => project.isApply === 0).length
    
    // Blue badge: Free Trial (is_apply = 1 AND no purchase date/periodicity)
    const freeTrial = userProjects.filter(project => {
      if (project.isApply !== 1) return false
      // No purchase date means it's a free trial
      return !project.purchaseDate || project.purchaseDate === "0" || project.purchaseDate.trim() === ""
    }).length
    
    // Green badge: Active Paid Subscriptions (is_apply = 1 AND has purchase date)
    const activePaid = userProjects.filter(project => {
      if (project.isApply !== 1) return false
      // Must have valid purchase date (not free trial)
      const purchaseDate = project.purchaseDate
      return purchaseDate && purchaseDate !== "0" && purchaseDate.trim() !== ""
    }).length
    
    // Red badge: Expired (is_apply = 2)
    const expired = userProjects.filter(project => project.isApply === 2).length
    
    return { 
      pendingApproval,  // Yellow/Orange badge
      freeTrial,        // Blue badge
      activePaid,       // Green badge
      expired           // Red badge
    }
  }

  return (
    <div className="overflow-hidden flex flex-col">
      <div className="flex-1 overflow-auto">
        {isLoading ? (
          <div className="flex justify-center items-center h-32 sm:h-40">
            <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-6 sm:py-8 text-gray-500">
            <div className="flex flex-col items-center space-y-2">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <p className="text-sm sm:text-base">No users found</p>
            </div>
          </div>
        ) : (
          <div className="space-y-2 sm:space-y-3">
            {users.map((userData) => {
              const stats = getUserProjectStats(userData.id)
              const isRegularUser = userData.role === 1
              
              return (
                <div 
                  key={userData.id} 
                  className={`border border-gray-200 rounded-lg px-3 py-1 sm:px-4 sm:py-1 transition-colors ${
                    isRegularUser ? 'cursor-pointer' : 'cursor-default'
                  } ${
                    selectedUserId === userData.id 
                      ? 'bg-gray-100 border-gray-300' 
                      : isRegularUser ? 'hover:bg-gray-50' : ''
                  }`}
                  onClick={() => isRegularUser && onUserClick(userData.id)}
                >
                  {/* Mobile Layout */}
                  <div className="flex flex-col space-y-2 sm:hidden">
                    <div className="flex items-start justify-between">
                      <h3 className="text-sm text-gray-900 truncate flex-1 mr-2">{userData.email}</h3>
                      <div className="flex space-x-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            onUserAction(userData.id, 'edit')
                          }}
                          disabled={actionLoading === userData.id}
                          className="p-1.5 rounded-md bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-blue-600 transition-colors disabled:opacity-50"
                          title="Edit User"
                        >
                          {actionLoading === userData.id ? (
                            <div className="w-3 h-3 animate-spin border border-gray-600 border-t-transparent rounded-full"></div>
                          ) : (
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          )}
                        </button>
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            onUserAction(userData.id, 'delete')
                          }}
                          disabled={actionLoading === userData.id}
                          className="p-1.5 rounded-md bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-red-600 transition-colors disabled:opacity-50"
                          title="Delete User"
                        >
                          {actionLoading === userData.id ? (
                            <div className="w-3 h-3 animate-spin border border-gray-600 border-t-transparent rounded-full"></div>
                          ) : (
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>
                    {/* Only show badges for regular users, not support team members */}
                    {isRegularUser && (
                      <div className="flex flex-wrap gap-1">
                        {/* Pending Approval */}
                        <div className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                          {stats.pendingApproval}
                        </div>
                        {/* Free Trial */}
                        <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                          {stats.freeTrial}
                        </div>
                        {/* Active Paid */}
                        <div className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                          {stats.activePaid}
                        </div>
                        {/* Expired */}
                        <div className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">
                          {stats.expired}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Desktop Layout */}
                  <div className="hidden sm:flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm text-gray-900 truncate">{userData.email}</h3>
                    </div>
                    <div className="flex items-center space-x-3 flex-shrink-0">
                      {/* Only show badges for regular users, not support team members */}
                      {isRegularUser && (
                        <div className="flex space-x-2">
                          {/* Pending Approval */}
                          <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-medium">
                            {stats.pendingApproval}
                          </div>
                          {/* Free Trial */}
                          <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">
                            {stats.freeTrial}
                          </div>
                          {/* Active Paid */}
                          <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">
                            {stats.activePaid}
                          </div>
                          {/* Expired */}
                          <div className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-medium">
                            {stats.expired}
                          </div>
                        </div>
                      )}
                      <div className="flex space-x-2">
                        {/* Edit Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            onUserAction(userData.id, 'edit')
                          }}
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
                          onClick={(e) => {
                            e.stopPropagation()
                            onUserAction(userData.id, 'delete')
                          }}
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
  )
}
