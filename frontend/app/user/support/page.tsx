'use client'

import { useEffect, useState } from 'react'
import AuthGuard from '@/components/AuthGuard'
import ConfirmDialog from '@/components/ConfirmDialog'
import { Ticket } from '@/types/ticket'
import { useToast } from '@/lib/context/ToastContext'
import { getBackendUrl } from '@/lib/api'

export default function UserSupportPage() {
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [ticketToDelete, setTicketToDelete] = useState<{ id: number; flag: number } | null>(null)
  const { showToast } = useToast()
  const backendUrl = getBackendUrl()

  // Form states
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [file, setFile] = useState<File | null>(null)

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData)
        setUser(parsedUser)
        fetchTickets()
      } catch (error) {
        console.error('Error parsing user data:', error)
      }
    }
    setIsLoading(false)
  }, [])

  const fetchTickets = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${backendUrl}/api/ticket`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setTickets(data)
      } else {
        showToast('error', 'Error', 'Failed to fetch tickets')
      }
    } catch (error) {
      console.error('Error fetching tickets:', error)
      showToast('error', 'Error', 'Failed to fetch tickets')
    }
  }

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!title.trim() || !content.trim()) {
      showToast('error', 'Error', 'Title and content are required')
      return
    }

    setIsSubmitting(true)

    try {
      const token = localStorage.getItem('token')
      const formData = new FormData()
      formData.append('title', title)
      formData.append('content', content)
      
      if (file) {
        formData.append('file', file)
      }

      const response = await fetch(`${backendUrl}/api/ticket`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      if (response.ok) {
        showToast('success', 'Success', 'Ticket created successfully')
        setShowCreateModal(false)
        setTitle('')
        setContent('')
        setFile(null)
        fetchTickets() // Refresh the tickets list
      } else {
        const errorData = await response.json()
        showToast('error', 'Error', errorData.error || 'Failed to create ticket')
      }
    } catch (error) {
      console.error('Error creating ticket:', error)
      showToast('error', 'Error', 'Failed to create ticket')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleConfirmCompletion = async (ticketId: number) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${backendUrl}/api/ticket/${ticketId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ flag: 2 }) // 2 = Resolved
      })

      if (response.ok) {
        showToast('success', 'Success', 'Ticket marked as resolved')
        fetchTickets()
      } else {
        showToast('error', 'Error', 'Failed to update ticket')
      }
    } catch (error) {
      console.error('Error updating ticket:', error)
      showToast('error', 'Error', 'Failed to update ticket')
    }
  }

  const handleDeleteTicket = (ticketId: number, ticketFlag: number) => {
    // Only allow deletion if ticket is resolved (flag = 2)
    if (ticketFlag !== 2) {
      showToast('error', 'Error', 'You can only delete resolved tickets')
      return
    }

    // Show confirmation dialog
    setTicketToDelete({ id: ticketId, flag: ticketFlag })
    setShowDeleteConfirm(true)
  }

  const confirmDeleteTicket = async () => {
    if (!ticketToDelete) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${backendUrl}/api/ticket/${ticketToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        showToast('success', 'Success', 'Ticket deleted successfully')
        fetchTickets()
      } else {
        showToast('error', 'Error', 'Failed to delete ticket')
      }
    } catch (error) {
      console.error('Error deleting ticket:', error)
      showToast('error', 'Error', 'Failed to delete ticket')
    } finally {
      setShowDeleteConfirm(false)
      setTicketToDelete(null)
    }
  }

  const cancelDeleteTicket = () => {
    setShowDeleteConfirm(false)
    setTicketToDelete(null)
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

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-500"></div>
      </div>
    )
  }

  return (
    <AuthGuard requireVerification={true} allowedRoles={[1]}>
      <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
              Support Center
            </h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">
              Get help and submit support requests for technical assistance.
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gray-800 hover:bg-gray-900 focus:outline-none whitespace-nowrap self-start sm:self-auto"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Ticket
          </button>
        </div>

        {/* Tickets List */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
            <h2 className="text-sm sm:text-sm md:text-lg font-semibold text-gray-900">
              My Support Tickets ({tickets.length})
            </h2>
          </div>

          {tickets.length === 0 ? (
            <div className="p-6 sm:p-8 text-center">
              <svg className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-3 sm:mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p className="text-gray-500 text-base sm:text-lg font-medium mb-2">No Support Tickets</p>
              <p className="text-sm sm:text-base text-gray-400 mb-4 px-4">
                You haven't created any support tickets yet. Click "Create Ticket" to get started.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {tickets.map((ticket) => (
                <div 
                  key={ticket.id} 
                  className="px-3 sm:px-4 py-3 sm:py-4 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => window.location.href = `/user/support/${ticket.id}`}
                >
                  {/* Mobile Layout */}
                  <div className="block sm:hidden space-y-3">
                    {/* Ticket Title and Status */}
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm  text-gray-900 flex-1 break-words">
                        #{ticket.id} - {ticket.title}
                      </h3>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(ticket.flag)} whitespace-nowrap flex-shrink-0`}>
                        {getStatusText(ticket.flag)}
                      </span>
                    </div>
                    
                    {/* Date */}
                    <p className="text-xs text-gray-500">
                      {new Date(ticket.created_at).toLocaleDateString()} at {new Date(ticket.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    
                    {/* Action Buttons */}
                    <div className="flex items-center gap-2">
                      {ticket.flag !== 2 && ticket.flag !== 3 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleConfirmCompletion(ticket.id)
                          }}
                          className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 border border-green-300 text-green-600 bg-white hover:bg-green-50 rounded-md transition-colors text-sm font-medium"
                          title="Mark as Resolved"
                        >
                          <img src="/svg/success.svg" alt="Check Icon" className="w-4 h-4" />
                          <span>Resolve</span>
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteTicket(ticket.id, ticket.flag)
                        }}
                        disabled={ticket.flag !== 2}
                        className={`flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 border rounded-md transition-colors text-sm font-medium ${
                          ticket.flag === 2
                            ? 'border-red-300 text-red-600 bg-white hover:bg-red-50'
                            : 'border-gray-200 text-gray-400 bg-gray-50 cursor-not-allowed'
                        }`}
                        title={ticket.flag === 2 ? 'Delete Ticket' : 'Can only delete resolved tickets'}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>

                  {/* Desktop/Tablet Layout */}
                  <div className="hidden sm:flex items-center justify-between gap-4">
                    {/* Left side - Ticket info */}
                    <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
                      <h3 className="text-sm md:text-base text-gray-900 truncate">
                        #{ticket.id} - {ticket.title}
                      </h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(ticket.flag)} whitespace-nowrap flex-shrink-0`}>
                        {getStatusText(ticket.flag)}
                      </span>
                    </div>

                    {/* Right side - Date and Action buttons */}
                    <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
                      <p className="hidden lg:block text-sm text-gray-500 whitespace-nowrap">
                        Created on {new Date(ticket.created_at).toLocaleDateString()} at {new Date(ticket.created_at).toLocaleTimeString()}
                      </p>
                      <p className="lg:hidden text-xs text-gray-500 whitespace-nowrap">
                        {new Date(ticket.created_at).toLocaleDateString()}
                      </p>
                      
                      {ticket.flag !== 2 && ticket.flag !== 3 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleConfirmCompletion(ticket.id)
                          }}
                          className="inline-flex items-center justify-center p-2 border border-green-300 text-green-600 bg-white hover:bg-green-50 rounded-md transition-colors"
                          title="Mark as Resolved"
                        >
                          <img src="/svg/success.svg" alt="Check Icon" className="w-4 h-4" />
                        </button>
                      )}

                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteTicket(ticket.id, ticket.flag)
                        }}
                        disabled={ticket.flag !== 2}
                        className={`inline-flex items-center justify-center p-2 border rounded-md transition-colors ${
                          ticket.flag === 2
                            ? 'border-red-300 text-red-600 bg-white hover:bg-red-50'
                            : 'border-gray-200 text-gray-400 bg-gray-50 cursor-not-allowed'
                        }`}
                        title={ticket.flag === 2 ? 'Delete Ticket' : 'Can only delete resolved tickets'}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>       
      </div>
       {/* Create Ticket Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">
              <div className="sticky top-0 flex justify-between items-center p-4 sm:p-6 border-b border-gray-200 bg-white rounded-t-lg z-10">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">Create Support Ticket</h3>
                <button
                  onClick={() => {
                    setShowCreateModal(false)
                    setTitle('')
                    setContent('')
                    setFile(null)
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
                >
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <form onSubmit={handleCreateTicket} className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-5 bg-white rounded-b-lg">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-gray-500 bg-white text-sm sm:text-base"
                    placeholder="Brief description of your issue"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={4}
                    className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-gray-500 bg-white text-sm sm:text-base resize-y min-h-[100px]"
                    placeholder="Detailed description of your issue..."
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Attachment (Optional)
                  </label>
                  <input
                    type="file"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="w-full px-3 sm:px-4 py-1 border border-gray-300 rounded-md focus:outline-none focus:border-gray-500 bg-white text-sm file:mr-2 sm:file:mr-4 file:py-1.5 sm:file:py-2 file:px-3 sm:file:px-4 file:rounded-md file:border-0 file:text-xs sm:file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    accept=".txt,.pdf,.png,.jpg,.jpeg,.gif,.doc,.docx"
                  />
                  <p className="text-xs sm:text-sm text-gray-500 mt-2">
                    Supported formats: TXT, PDF, PNG, JPG, GIF, DOC, DOCX
                  </p>
                  {file && (
                    <p className="text-xs sm:text-sm text-green-600 mt-2 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {file.name}
                    </p>
                  )}
                </div>
                
                <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-3 pt-4 sm:pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false)
                      setTitle('')
                      setContent('')
                      setFile(null)
                    }}
                    className="w-full sm:w-auto px-4 sm:px-6 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto px-4 sm:px-6 py-2 text-sm text-white bg-gray-800 border border-transparent rounded-md hover:bg-gray-900 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isSubmitting ? 'Creating...' : 'Create Ticket'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        <ConfirmDialog
          isOpen={showDeleteConfirm}
          title="Delete Ticket"
          message="Are you sure you want to delete this ticket? This action cannot be undone."
          confirmText="Delete"
          cancelText="Cancel"
          onConfirm={confirmDeleteTicket}
          onCancel={cancelDeleteTicket}
          type="danger"
        />
    </AuthGuard>
  )
}
