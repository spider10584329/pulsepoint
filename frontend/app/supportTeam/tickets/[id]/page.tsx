'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams } from 'next/navigation'
import AuthGuard from '@/components/AuthGuard'
import { useToast } from '@/lib/context/ToastContext'
import io, { Socket } from 'socket.io-client'
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
  updated_at: string | null
  user?: User
  messages?: Message[]
}

interface Message {
  id: number
  ticket_id: number
  user_id: number
  title: string
  content: string
  filename: string | null
  created_at: string
  user: User & { role?: number }
}

export default function SupportTicketDetailPage() {
  const backendUrl = getBackendUrl()
  const params = useParams()
  const ticketId = params.id as string
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [attachment, setAttachment] = useState<File | null>(null)
  const [socket, setSocket] = useState<Socket | null>(null)
  const [statusUpdating, setStatusUpdating] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { showToast } = useToast()

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData)
        setUser(parsedUser)
        fetchTicketDetails()
      } catch (error) {
        console.error('Error parsing user data:', error)
      }
    }
    setIsLoading(false)
  }, [ticketId])

  // Socket.IO connection
  useEffect(() => {
    if (!user || !ticketId) return

    const newSocket = io(backendUrl, {
      transports: ['websocket'],
      auth: {
        token: localStorage.getItem('token')
      }
    })

    newSocket.on('connect', () => {
      console.log('Socket connected:', newSocket.id)
      newSocket.emit('join_ticket', { ticket_id: parseInt(ticketId) })
    })

    newSocket.on('new_message', (data: { ticket_id: number; message: Message }) => {
      console.log('New message received:', data)
      if (data.ticket_id === parseInt(ticketId)) {
        setMessages(prev => [...prev, data.message])
        setTimeout(scrollToBottom, 100)
        
        // Show blue toast notification if message is from customer (not from support team)
        if (data.message.user_id !== user.id) {
          showToast('info', 'New Message', `New message from ${data.message.user.firstname}`)
        }
      }
    })

    newSocket.on('disconnect', () => {
      console.log('Socket disconnected')
    })

    setSocket(newSocket)

    return () => {
      if (newSocket) {
        newSocket.emit('leave_ticket', { ticket_id: parseInt(ticketId) })
        newSocket.close()
      }
    }
  }, [user, ticketId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const fetchTicketDetails = async () => {
    try {
      const token = localStorage.getItem('token')
      
      // Fetch ticket with messages (backend returns ticket.messages array)
      const ticketResponse = await fetch(`${backendUrl}/api/ticket/${ticketId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!ticketResponse.ok) {
        showToast('error', 'Error', 'Failed to fetch ticket details')
        return
      }

      const ticketData = await ticketResponse.json()
      
      // Backend returns messages in ticket.messages array
      if (ticketData.messages && ticketData.messages.length > 0) {
        setMessages(ticketData.messages)
        
        // Get customer info from the first message (original ticket creator)
        const customerMessage = ticketData.messages.find((msg: Message) => msg.user_id === ticketData.user_id)
        if (customerMessage && customerMessage.user) {
          ticketData.user = customerMessage.user
        }
      }
      
      setTicket(ticketData)
    } catch (error) {
      console.error('Error fetching ticket details:', error)
      showToast('error', 'Error', 'Failed to fetch ticket details')
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newMessage.trim() && !attachment) {
      showToast('error', 'Error', 'Please enter a message or attach a file')
      return
    }

    setIsSending(true)

    try {
      const token = localStorage.getItem('token')
      const formData = new FormData()
      formData.append('ticket_id', ticketId)
      formData.append('title', ticket?.title || 'Response')
      formData.append('content', newMessage)
      if (attachment) {
        formData.append('file', attachment)
      }

      const response = await fetch(`${backendUrl}/api/support`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      if (response.ok) {
        setNewMessage('')
        setAttachment(null)
        
        // Reset file input
        const fileInput = document.getElementById('attachment-input') as HTMLInputElement
        if (fileInput) {
          fileInput.value = ''
        }
        
        // Show green success toast notification
        showToast('success', 'Message Sent', 'Your response has been sent successfully')
      } else {
        showToast('error', 'Error', 'Failed to send message')
      }
    } catch (error) {
      console.error('Error sending message:', error)
      showToast('error', 'Error', 'Failed to send message')
    } finally {
      setIsSending(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAttachment(e.target.files[0])
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

  if (isLoading || !user || !ticket) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-500"></div>
      </div>
    )
  }

  return (
    <AuthGuard requireVerification={true} allowedRoles={[2]}>
      <div className="h-[calc(100vh-180px)] flex flex-col">
        {/* Header */}
        <div className="mb-4">
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-3"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Tickets
          </button>

          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Ticket #{ticket.id} - {ticket.title}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Customer: {ticket.user?.firstname || 'Unknown'} {ticket.user?.lastname || 'User'} ({ticket.user?.email || 'N/A'}) • Created on {new Date(ticket.created_at).toLocaleDateString()} at {new Date(ticket.created_at).toLocaleTimeString()}
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
              {messages && messages.length > 0 ? (
                messages.map((message) => {
                  // Check if message is from support team (role is 2)
                  const isSupportTeam = message.user?.role === 2
                  return (
                    <div
                      key={message.id}
                      className={`flex ${isSupportTeam ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-full sm:max-w-[85%] lg:max-w-[70%] rounded-lg p-3 sm:p-4 ${
                          isSupportTeam
                            ? 'bg-gray-100 text-gray-900'
                            : 'bg-blue-600 text-white'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs sm:text-sm font-semibold">
                            {message.user.firstname} {message.user.lastname}
                            {isSupportTeam && <span className="ml-2 text-xs bg-green-600 text-white px-2 py-0.5 rounded">Support Team</span>}
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
                                  const response = await fetch(`${backendUrl}/api/support/file/${message.filename}`, {
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
                                isSupportTeam ? 'text-blue-600 hover:text-blue-800' : 'text-blue-100 hover:text-white'
                              }`}
                            >
                              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                              </svg>
                              View Attachment
                            </button>
                          </div>
                        )}
                        
                        <div className={`text-xs mt-2 ${isSupportTeam ? 'text-gray-500' : 'text-blue-100'}`}>
                          {new Date(message.created_at).toLocaleDateString()} at {new Date(message.created_at).toLocaleTimeString()}
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

          {/* Right Side - Message Input & Status */}
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
                    placeholder="Type your response..."
                    required
                    disabled={isSending}
                  />
                </div>
                
                <div className="flex-shrink-0">
                  <input
                    type="file"
                    id="attachment-input"
                    onChange={handleFileChange}
                    className="w-full px-2 sm:px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:border-gray-500 bg-white text-xs sm:text-sm file:mr-2 sm:file:mr-4 file:py-1.5 sm:file:py-2 file:px-3 sm:file:px-4 file:rounded-md file:border-0 file:text-xs sm:file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    accept=".txt,.pdf,.png,.jpg,.jpeg,.gif,.doc,.docx"
                    disabled={isSending}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    TXT, PDF, PNG, JPG, GIF, DOC, DOCX
                  </p>
                </div>
              </div>
              
              <div className="mt-4 sm:mt-6 pt-4 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={isSending }
                  className="w-full px-4 sm:px-6 py-2 sm:py-2.5 text-sm text-white bg-gray-800 border border-transparent rounded-md hover:bg-gray-900 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSending ? 'Sending...' : 'Send Response'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}
