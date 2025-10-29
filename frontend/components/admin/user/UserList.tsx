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
  onUserAction 
}: UserListProps) {
  const getUserProjectStats = (userId: number) => {
    const userProjects = appliedProjects.filter(project => project.userId === userId)
    
    // Blue badge: Applied but no purchase OR applied after last purchase
    const pendingApplications = userProjects.filter(project => {
      if (!project.applyDate) return false
      
      // No purchase date at all
      if (!project.purchaseDate) return true
      
      // Apply date is greater than purchase date
      const applyDate = new Date(project.applyDate)
      const purchaseDate = new Date(project.purchaseDate)
      return applyDate > purchaseDate
    }).length
    
    // Green badge: Active paid subscriptions (isApply = 1 AND not in free trial)
    const activePaidSubscriptions = userProjects.filter(project => {
      // Must be currently active/approved
      if (project.isApply !== 1) return false
      
      // Must have payment info (not in free trial)
      if (!project.purchaseDate) return false
      
      // Exclude trial indicators: "0", empty strings, or today's date
      const defaultDate = new Date().toISOString().split('T')[0]
      const purchaseDate = project.purchaseDate
      
      return purchaseDate && 
             purchaseDate !== "0" && 
             purchaseDate.trim() !== "" && 
             purchaseDate !== defaultDate
    }).length
    
    return { 
      totalApplied: pendingApplications,    // Blue badge: pending applications
      implemented: activePaidSubscriptions // Green badge: active paid subscriptions (not trials)
    }
  }

  return (
    <div className="overflow-hidden flex flex-col">
      <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">User List</h2>
      
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
              return (
                <div 
                  key={userData.id} 
                  className={`border border-gray-200 rounded-lg px-3 py-1 sm:px-4 sm:py-1 cursor-pointer transition-colors ${
                    selectedUserId === userData.id 
                      ? 'bg-gray-100 border-gray-300' 
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => onUserClick(userData.id)}
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
                    <div className="flex space-x-2">
                      <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                        {stats.totalApplied}
                      </div>
                      <div className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                       {stats.implemented}
                      </div>
                    </div>
                  </div>
                  
                  {/* Desktop Layout */}
                  <div className="hidden sm:flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm text-gray-900 truncate">{userData.email}</h3>
                    </div>
                    <div className="flex items-center space-x-3 flex-shrink-0">
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
