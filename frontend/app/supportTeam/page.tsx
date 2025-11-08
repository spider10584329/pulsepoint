'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import AuthGuard from '@/components/AuthGuard'
import { useToast } from '@/lib/context/ToastContext'
import { getBackendUrl } from '@/lib/api'

interface Ticket {
  id: number
  user_id: number
  title: string
  flag: number
  created_at: string
  message_count: number
  user?: {
    firstname: string
    lastname: string
    email: string
  }
}

interface FAQ {
  id: number
  title: string
  filename: string
}

interface TicketStats {
  total: number
  open: number
  inProgress: number
  resolved: number
  todayTickets: number
}

export default function SupportTeamDashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [stats, setStats] = useState<TicketStats>({
    total: 0,
    open: 0,
    inProgress: 0,
    resolved: 0,
    todayTickets: 0
  })
  const router = useRouter()
  const { showToast } = useToast()
  const backendUrl = getBackendUrl()

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData)
        setUser(parsedUser)
        fetchDashboardData()
      } catch (error) {
        router.push('/')
      }
    }
    setIsLoading(false)
  }, [])

  const fetchDashboardData = async () => {
    await Promise.all([fetchTickets(), fetchFAQs()])
  }

  const fetchTickets = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${backendUrl}/api/tickets/all`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setTickets(data)
        calculateStats(data)
      } else if (response.status === 401 || response.status === 403) {
        const userData = localStorage.getItem('user')
        if (userData) {
          const user = JSON.parse(userData)
          localStorage.setItem('pendingUserId', user.id.toString())
          localStorage.setItem('pendingUserEmail', user.email)
          router.push(`/verify?id=${user.id}&email=${encodeURIComponent(user.email)}`)
        } else {
          router.push('/')
        }
      }
    } catch (error) {
      console.error('Error fetching tickets:', error)
    }
  }

  const fetchFAQs = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/faq/read`)
      if (response.ok) {
        const data = await response.json()
        setFaqs(data)
      }
    } catch (error) {
      console.error('Error fetching FAQs:', error)
    }
  }

  const calculateStats = (ticketData: Ticket[]) => {
    const today = new Date().toISOString().split('T')[0]
    
    const open = ticketData.filter(t => t.flag === 0).length
    const inProgress = ticketData.filter(t => t.flag === 1).length
    const resolved = ticketData.filter(t => t.flag === 2).length
    const todayTickets = ticketData.filter(t => 
      t.created_at && t.created_at.startsWith(today)
    ).length

    setStats({
      total: ticketData.length,
      open,
      inProgress,
      resolved,
      todayTickets
    })
  }

  const getRecentTickets = () => {
    return tickets
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5)
  }

  const getPriorityTickets = () => {
    return tickets
      .filter(t => t.flag === 0) // Open tickets only
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      .slice(0, 5)
  }

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-500"></div>
      </div>
    )
  }

  const recentTickets = getRecentTickets()
  const priorityTickets = getPriorityTickets()

  return (
    <AuthGuard requireVerification={true} allowedRoles={[2]}>
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <div className="text-xs sm:text-sm text-gray-500">Welcome, {user.firstname} {user.lastname}</div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
          {/* Total Tickets */}
          <div className="bg-blue-500 rounded-lg shadow-md p-4 sm:p-6 text-center">
            <p className="text-xs sm:text-sm font-medium text-white uppercase mb-1">Total Tickets</p>
            <p className="text-2xl sm:text-3xl font-bold text-white">{stats.total}</p>
          </div>

          {/* Open Tickets */}
          <div className="bg-orange-500 rounded-lg shadow-md p-4 sm:p-6 text-center">
            <p className="text-xs sm:text-sm font-medium text-white uppercase mb-1">Open</p>
            <p className="text-2xl sm:text-3xl font-bold text-white">{stats.open}</p>
          </div>

          {/* In Progress */}
          <div className="bg-yellow-500 rounded-lg shadow-md p-4 sm:p-6 text-center">
            <p className="text-xs sm:text-sm font-medium text-white uppercase mb-1">In Progress</p>
            <p className="text-2xl sm:text-3xl font-bold text-white">{stats.inProgress}</p>
          </div>

          {/* Resolved */}
          <div className="bg-green-500 rounded-lg shadow-md p-4 sm:p-6 text-center">
            <p className="text-xs sm:text-sm font-medium text-white uppercase mb-1">Resolved</p>
            <p className="text-2xl sm:text-3xl font-bold text-white">{stats.resolved}</p>
          </div>

          {/* Today's Tickets */}
          <div className="bg-purple-500 rounded-lg shadow-md p-4 sm:p-6 text-center">
            <p className="text-xs sm:text-sm font-medium text-white uppercase mb-1">Today</p>
            <p className="text-2xl sm:text-3xl font-bold text-white">{stats.todayTickets}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Priority Tickets - Oldest Open Tickets */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4">
              <h2 className="text-lg font-bold  flex items-center gap-2">
                Priority Tickets
              </h2>             
            </div>
            <div className="px-4 pb-4">
              {priorityTickets.length === 0 ? (
                <div className="text-center py-8">
                  <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-gray-500 font-medium">No open tickets</p>
                  <p className="text-gray-400 text-sm">All tickets are being handled</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {priorityTickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      onClick={() => router.push(`/supportTeam/tickets/${ticket.id}`)}
                      className="p-3 border border-gray-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-all cursor-pointer group"
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="text-sm font-semibold text-gray-900 group-hover:text-orange-600 line-clamp-1">
                          #{ticket.id} - {ticket.title}
                        </h3>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 whitespace-nowrap flex-shrink-0">
                          Open
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span className="truncate">
                          {ticket.user?.firstname} {ticket.user?.lastname}
                        </span>
                        <span className="whitespace-nowrap ml-2">
                          {new Date(ticket.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Recent Tickets */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4">
              <h2 className="text-lg font-bold  flex items-center gap-2">
                Recent Activity
              </h2>
            </div>
            <div className="px-4 pb-4">
              {recentTickets.length === 0 ? (
                <div className="text-center py-8">
                  <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                  <p className="text-gray-500 font-medium">No tickets yet</p>
                  <p className="text-gray-400 text-sm">New tickets will appear here</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentTickets.map((ticket) => {
                    const statusColors = {
                      0: 'bg-blue-100 text-blue-800',
                      1: 'bg-yellow-100 text-yellow-800',
                      2: 'bg-green-100 text-green-800',
                      3: 'bg-gray-100 text-gray-800'
                    }
                    const statusText = {
                      0: 'Open',
                      1: 'In Progress',
                      2: 'Resolved',
                      3: 'Closed'
                    }
                    
                    return (
                      <div
                        key={ticket.id}
                        onClick={() => router.push(`/supportTeam/tickets/${ticket.id}`)}
                        className="p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all cursor-pointer group"
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h3 className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 line-clamp-1">
                            #{ticket.id} - {ticket.title}
                          </h3>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap flex-shrink-0 ${statusColors[ticket.flag as keyof typeof statusColors]}`}>
                            {statusText[ticket.flag as keyof typeof statusText]}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span className="truncate">
                            {ticket.user?.firstname} {ticket.user?.lastname}
                          </span>
                          <span className="whitespace-nowrap ml-2">
                            {new Date(ticket.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* FAQ Summary Section */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4">
            <div>
              <h2 className="text-lg font-bold ">
                Knowledge Base
              </h2>
            </div>
          </div>
          <div className="px-6 pb-6">
            {faqs.length > 0 && (
              <div >
                <p className="text-sm font-medium text-gray-700">Recent FAQs:</p>
                <div className="space-y-2">
                  {faqs.slice(0, 3).map((faq) => (
                    <div
                      key={faq.id}
                      className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-2 rounded"
                    >
                      <svg className="w-4 h-4 text-emerald-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span className="truncate">{faq.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}
