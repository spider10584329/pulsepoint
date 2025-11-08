'use client'

import { useEffect, useState } from 'react'
import AuthGuard from '@/components/AuthGuard'
import { useToast } from '@/lib/context/ToastContext'
import { getBackendUrl } from '@/lib/api'

interface User {
  firstname: string
  lastname: string
  email: string
}

interface Ticket {
  id: number
  user_id: number
  title: string
  flag: number
  created_at: string
  user?: User
  message_count: number
  latest_message: string
}

export default function SupportTicketsPage() {
  const backendUrl = getBackendUrl()
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [filterStatus, setFilterStatus] = useState<number | 'all'>('all')
  const { showToast } = useToast()

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData)
        setUser(parsedUser)
        fetchAllTickets()
      } catch (error) {
        console.error('Error parsing user data:', error)
      }
    }
    setIsLoading(false)
  }, [])

  const fetchAllTickets = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${backendUrl}/api/tickets/all`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        console.log('Received tickets data:', data)
        
        // Ensure each ticket has a user object (even if empty)
        const ticketsWithUsers = data.map((ticket: Ticket) => ({
          ...ticket,
          user: ticket.user || {
            firstname: 'Unknown',
            lastname: 'User',
            email: 'N/A'
          }
        }))
        
        setTickets(ticketsWithUsers)
      } else {
        const errorText = await response.text()
        console.error('Failed to fetch tickets:', response.status, errorText)
        showToast('error', 'Error', 'Failed to fetch tickets')
      }
    } catch (error) {
      console.error('Error fetching tickets:', error)
      showToast('error', 'Error', 'Failed to fetch tickets')
    }
  }

  const getStatusText = (flag: number) => {
    switch (flag) {
      case 0: return 'Open'
      case 1: return 'In Progress'
      case 2: return 'Resolved'
      case 3: return 'Closed'
      default: return 'Unknown'
    }
  }

  const getStatusColor = (flag: number) => {
    switch (flag) {
      case 0: return 'bg-blue-100 text-blue-800'
      case 1: return 'bg-yellow-100 text-yellow-800'
      case 2: return 'bg-green-100 text-green-800'
      case 3: return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredTickets = filterStatus === 'all' 
    ? tickets 
    : tickets.filter(ticket => ticket.flag === filterStatus)

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-500"></div>
      </div>
    )
  }

  return (
    <AuthGuard requireVerification={true} allowedRoles={[2]}>
      <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
              Support Tickets
            </h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">
              Manage and respond to customer support requests.
            </p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="grid grid-cols-2 sm:flex gap-2">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 sm:px-4 py-2 text-xs sm:text-sm rounded-md transition-colors text-center ${
              filterStatus === 'all'
                ? 'bg-gray-800 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All ({tickets.length})
          </button>
          <button
            onClick={() => setFilterStatus(0)}
            className={`px-3 sm:px-4 py-2 text-xs sm:text-sm rounded-md transition-colors text-center ${
              filterStatus === 0
                ? 'bg-blue-600 text-white'
                : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
            }`}
          >
            Open ({tickets.filter(t => t.flag === 0).length})
          </button>
          <button
            onClick={() => setFilterStatus(1)}
            className={`px-3 sm:px-4 py-2 text-xs sm:text-sm rounded-md transition-colors text-center ${
              filterStatus === 1
                ? 'bg-yellow-600 text-white'
                : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
            }`}
          >
            In Progress ({tickets.filter(t => t.flag === 1).length})
          </button>
          <button
            onClick={() => setFilterStatus(2)}
            className={`px-3 sm:px-4 py-2 text-xs sm:text-sm rounded-md transition-colors text-center ${
              filterStatus === 2
                ? 'bg-green-600 text-white'
                : 'bg-green-100 text-green-700 hover:bg-green-200'
            }`}
          >
            Resolved ({tickets.filter(t => t.flag === 2).length})
          </button>
        </div>

        {/* Tickets List */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
              All Customer Tickets ({filteredTickets.length})
            </h2>
          </div>

          {filteredTickets.length === 0 ? (
            <div className="p-6 sm:p-8 text-center">
              <svg className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-3 sm:mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p className="text-gray-500 text-base sm:text-lg font-medium mb-2">No Tickets</p>
              <p className="text-sm sm:text-base text-gray-400 px-4">
                No tickets match the selected filter.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredTickets.map((ticket) => (
                <div 
                  key={ticket.id} 
                  className="px-3 sm:px-4 py-3 sm:py-4 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => window.location.href = `/supportTeam/tickets/${ticket.id}`}
                >
                  {/* Mobile Layout */}
                  <div className="block sm:hidden space-y-2">
                    {/* Ticket Title and Status */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-gray-900 break-words">
                          #{ticket.id} - {ticket.title}
                        </h3>
                      </div>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(ticket.flag)} whitespace-nowrap flex-shrink-0`}>
                        {getStatusText(ticket.flag)}
                      </span>
                    </div>
                    
                    {/* Customer Info */}
                    <p className="text-xs text-gray-600 break-words">
                      Customer: {ticket.user?.firstname || 'Unknown'} {ticket.user?.lastname || 'User'} ({ticket.user?.email || 'N/A'})
                    </p>
                    
                    {/* Date and Message Count */}
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs text-gray-500">
                        {new Date(ticket.created_at).toLocaleDateString()} at {new Date(ticket.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      {ticket.message_count > 0 && (
                        <div className="flex items-center gap-1.5 bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                          <span className="text-xs font-semibold">{ticket.message_count}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Tablet Layout (640px - 1024px) */}
                  <div className="hidden sm:block lg:hidden">
                    <div className="space-y-2">
                      {/* Title and Status */}
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-sm font-semibold text-gray-900 flex-1 break-words">
                          #{ticket.id} - {ticket.title}
                        </h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(ticket.flag)} whitespace-nowrap flex-shrink-0`}>
                          {getStatusText(ticket.flag)}
                        </span>
                      </div>
                      
                      {/* Customer and Date */}
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs text-gray-600 truncate">
                          Customer: {ticket.user?.firstname || 'Unknown'} {ticket.user?.lastname || 'User'} ({ticket.user?.email || 'N/A'})
                        </p>
                        {ticket.message_count > 0 && (
                          <div className="flex items-center gap-1.5 bg-blue-100 text-blue-800 px-2.5 py-1 rounded-full flex-shrink-0">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            <span className="text-xs font-semibold">{ticket.message_count}</span>
                          </div>
                        )}
                      </div>
                      
                      <p className="text-xs text-gray-500">
                        {new Date(ticket.created_at).toLocaleDateString()} at {new Date(ticket.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>

                  {/* Desktop Layout (> 1024px) */}
                  <div className="hidden lg:flex items-center justify-between gap-4">
                    {/* Left side - Ticket info */}
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-semibold text-gray-900 truncate">
                            #{ticket.id} - {ticket.title}
                          </h3>
                          <p className="text-xs text-gray-600 mt-1 truncate">
                            Customer: {ticket.user?.firstname || 'Unknown'} {ticket.user?.lastname || 'User'} ({ticket.user?.email || 'N/A'})
                          </p>
                        </div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(ticket.flag)} whitespace-nowrap flex-shrink-0`}>
                          {getStatusText(ticket.flag)}
                        </span>
                      </div>
                    </div>

                    {/* Right side - Metadata and badge */}
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <p className="text-xs text-gray-500 whitespace-nowrap">
                        {new Date(ticket.created_at).toLocaleDateString()} at {new Date(ticket.created_at).toLocaleTimeString()}
                      </p>
                      
                      {/* Message count badge */}
                      {ticket.message_count > 0 && (
                        <div className="flex items-center gap-1.5 bg-blue-100 text-blue-800 px-2.5 py-1 rounded-full">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                          <span className="text-xs font-semibold">{ticket.message_count}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  )
}
