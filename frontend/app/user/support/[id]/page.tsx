'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import AuthGuard from '@/components/AuthGuard'
import { useToast } from '@/lib/context/ToastContext'
import { io, Socket } from 'socket.io-client'

interface Message {
  id: number
  ticket_id: number
  user_id: number
  title: string
  content: string
  filename: string | null
  created_at: string
  user: {
    firstname: string
    lastname: string
    role: number
  }
}

interface TicketDetail {
  id: number
  user_id: number
  title: string
  flag: number
  created_at: string
  messages: Message[]
}

export default function TicketDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { showToast } = useToast()
  const ticketId = params?.id

  const [ticket, setTicket] = useState<TicketDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [newMessage, setNewMessage] = useState('')
  const [newFile, setNewFile] = useState<File | null>(null)
  const [isSending, setIsSending] = useState(false)
  const socketRef = useRef<Socket | null>(null)
  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  // Initialize socket connection and join ticket room
  useEffect(() => {
    if (!ticketId) return

    // Connect to socket server
    const socket = io('http://localhost:5001', {
      transports: ['websocket', 'polling']
    })

    socketRef.current = socket

    socket.on('connect', () => {
      console.log('Socket connected:', socket.id)
      // Join the specific ticket room
      socket.emit('join_ticket', { ticket_id: ticketId })
    })

    socket.on('joined_ticket', (data) => {
      console.log('Joined ticket room:', data)
    })

    socket.on('new_message', (data) => {
      console.log('New message received:', data)
      // Only update if it's for this ticket
      if (data.ticket_id === parseInt(ticketId as string)) {
        // Add the new message to the ticket
        setTicket(prevTicket => {
          if (!prevTicket) return null
          return {
            ...prevTicket,
            messages: [...prevTicket.messages, data.message]
          }
        })
        
        // Show toast notification
        showToast('info', 'New Message', `New message from ${data.message.user.firstname} ${data.message.user.lastname}`)
      }
    })

    socket.on('disconnect', () => {
      console.log('Socket disconnected')
    })

    // Cleanup on unmount
    return () => {
      if (socket) {
        socket.emit('leave_ticket', { ticket_id: ticketId })
        socket.disconnect()
      }
    }
  }, [ticketId, showToast])

  useEffect(() => {
    const fetchTicketDetails = async () => {
      if (!ticketId) return
      
      console.log('Fetching ticket details for ID:', ticketId)
      
      try {
        const token = localStorage.getItem('token')
        console.log('Token exists:', !!token)
        
        const response = await fetch(`http://localhost:5001/api/ticket/${ticketId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        console.log('Response status:', response.status)

        if (response.ok) {
          const data = await response.json()
          console.log('Ticket data received:', data)
          setTicket(data)
        } else {
          const errorData = await response.json().catch(() => ({}))
          console.error('Backend error response:', errorData)
          showToast('error', 'Error', errorData.error || 'Failed to fetch ticket details')
          router.push('/user/support')
        }
      } catch (error) {
        console.error('Network or fetch error:', error)
        showToast('error', 'Error', 'Failed to fetch ticket details')
      } finally {
        setIsLoading(false)
      }
    }

    fetchTicketDetails()
  }, [ticketId])

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [ticket?.messages])

  const refreshTicketDetails = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`http://localhost:5001/api/ticket/${ticketId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setTicket(data)
      }
    } catch (error) {
      console.error('Error refreshing ticket details:', error)
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newMessage.trim()) {
      showToast('error', 'Error', 'Message content is required')
      return
    }

    setIsSending(true)

    try {
      const token = localStorage.getItem('token')
      const formData = new FormData()
      formData.append('ticket_id', ticketId as string)
      formData.append('title', ticket?.title || '')
      formData.append('content', newMessage)

      if (newFile) {
        formData.append('file', newFile)
      }

      const response = await fetch('http://localhost:5001/api/support', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      if (response.ok) {
        showToast('success', 'Success', 'Message sent successfully')
        setNewMessage('')
        setNewFile(null)
        refreshTicketDetails() // Refresh messages
      } else {
        const errorData = await response.json()
        showToast('error', 'Error', errorData.error || 'Failed to send message')
      }
    } catch (error) {
      console.error('Error sending message:', error)
      showToast('error', 'Error', 'Failed to send message')
    } finally {
      setIsSending(false)
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString()
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-500"></div>
      </div>
    )
  }

  if (!ticket) {
    return null
  }

  return (
    <AuthGuard requireVerification={true} allowedRoles={[1]}>
      <div className="h-[calc(100vh-180px)] flex flex-col">
        {/* Header */}
        <div className="mb-4">
          <button
            onClick={() => router.push('/user/support')}
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-3"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Support
          </button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Ticket #{ticket.id} - {ticket.title}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Created on {formatDate(ticket.created_at)}
              </p>
            </div>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(ticket.flag)}`}>
              {getStatusText(ticket.flag)}
            </span>
          </div>
        </div>

        {/* Main Content - Responsive Layout */}
        <div className="flex-1 flex flex-col lg:flex-row gap-4 min-h-0">
          {/* Left Side - Conversation History */}
          <div className="flex-1 bg-white rounded-lg shadow-md flex flex-col min-h-[300px] lg:min-h-0">
            <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900">Conversation</h2>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              {ticket.messages && ticket.messages.length > 0 ? (
                ticket.messages.map((message) => {
                  const isSupport = message.user.role === 2
                  return (
                    <div
                      key={message.id}
                      className={`flex ${isSupport ? 'justify-start' : 'justify-end'}`}
                    >
                      <div
                        className={`max-w-full sm:max-w-[85%] lg:max-w-[70%] rounded-lg p-3 sm:p-4 ${
                          isSupport
                            ? 'bg-gray-100 text-gray-900'
                            : 'bg-blue-600 text-white'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs sm:text-sm font-semibold">
                            {message.user.firstname} {message.user.lastname}
                            {isSupport && <span className="ml-2 text-xs font-normal">(Support Team)</span>}
                          </span>
                        </div>
                        
                        <p className="text-sm whitespace-pre-wrap break-words">
                          {message.content}
                        </p>
                        
                        {message.filename && (
                          <div className="mt-3 pt-3 border-t border-gray-300">
                            <button
                              onClick={async (e) => {
                                e.preventDefault()
                                try {
                                  const token = localStorage.getItem('token')
                                  const response = await fetch(`http://localhost:5001/api/support/file/${message.filename}`, {
                                    headers: {
                                      'Authorization': `Bearer ${token}`
                                    }
                                  })
                                  
                                  if (response.ok) {
                                    const blob = await response.blob()
                                    const url = window.URL.createObjectURL(blob)
                                    const a = document.createElement('a')
                                    a.href = url
                                    a.download = message.filename || 'attachment'
                                    document.body.appendChild(a)
                                    a.click()
                                    window.URL.revokeObjectURL(url)
                                    document.body.removeChild(a)
                                    showToast('success', 'Success', 'File downloaded successfully')
                                  } else {
                                    showToast('error', 'Error', 'Failed to download file')
                                  }
                                } catch (error) {
                                  console.error('Error downloading file:', error)
                                  showToast('error', 'Error', 'Failed to download file')
                                }
                              }}
                              className={`inline-flex items-center text-sm cursor-pointer ${
                                isSupport ? 'text-blue-600 hover:text-blue-800' : 'text-blue-100 hover:text-white'
                              }`}
                            >
                              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                              </svg>
                              View Attachment
                            </button>
                          </div>
                        )}
                        
                        <div className={`text-xs mt-2 ${isSupport ? 'text-gray-500' : 'text-blue-100'}`}>
                          {formatDate(message.created_at)}
                        </div>
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="text-center text-gray-500 py-8">
                  No messages yet
                </div>
              )}
              {/* Scroll anchor */}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Right Side - Message Input */}
          <div className="w-full lg:w-96 bg-white rounded-lg shadow-md flex flex-col min-h-[400px] lg:min-h-0">
            <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900">Send Message</h2>
            </div>
            
            <form onSubmit={handleSendMessage} className="flex-1 flex flex-col p-4 sm:p-6">
              <div className="flex-1 flex flex-col space-y-4 min-h-0">
                <div className="flex-1 flex flex-col min-h-[150px]">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="w-full flex-1 px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-md focus:outline-none focus:border-gray-500 bg-white text-sm sm:text-base resize-none"
                    placeholder="Type your message here..."
                    required
                    disabled={ticket.flag === 2 || ticket.flag === 3}
                  />
                </div>
                
                <div className="flex-shrink-0">                 
                  <input
                    type="file"
                    onChange={(e) => setNewFile(e.target.files?.[0] || null)}
                    className="w-full px-2 sm:px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:border-gray-500 bg-white text-xs sm:text-sm file:mr-2 sm:file:mr-4 file:py-1.5 sm:file:py-2 file:px-3 sm:file:px-4 file:rounded-md file:border-0 file:text-xs sm:file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    accept=".txt,.pdf,.png,.jpg,.jpeg,.gif,.doc,.docx"
                    disabled={ticket.flag === 2 || ticket.flag === 3}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    TXT, PDF, PNG, JPG, GIF, DOC, DOCX
                  </p>
                </div>
              </div>
              
              <div className="mt-4 sm:mt-6 pt-4 border-t border-gray-200">
                {ticket.flag === 2 || ticket.flag === 3 ? (
                  <div className="text-xs sm:text-sm text-gray-500 text-center py-2">
                    This ticket is {ticket.flag === 2 ? 'resolved' : 'closed'} and cannot receive new messages
                  </div>
                ) : (
                  <button
                    type="submit"
                    disabled={isSending}
                    className="w-full px-4 sm:px-6 py-2 sm:py-2 text-sm text-white bg-gray-800 border border-transparent rounded-md hover:bg-gray-900 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isSending ? 'Sending...' : 'Send Message'}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}
