'use client'

import { useEffect, useState } from 'react'
import AuthGuard from '@/components/AuthGuard'
import SoftwareCard from '@/components/user/SoftwareCard'
import SoftwareDetailModal from '@/components/user/SoftwareDetailModal'
import { Software } from '@/types/user/software'
import { useToast } from '@/lib/context/ToastContext'
import { getBackendUrl } from '@/lib/api'

export default function UserSoftwarePage() {
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [software, setSoftware] = useState<Software[]>([])
  const [selectedSoftware, setSelectedSoftware] = useState<Software | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const { showToast } = useToast()
  const backendUrl = getBackendUrl()

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData)
        setUser(parsedUser)
      } catch (error) {
        console.error('Error parsing user data:', error)
      }
    }
    fetchSoftware()
  }, [])

  const fetchSoftware = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        showToast('error', 'Authentication Error', 'No authentication token found')
        setIsLoading(false)
        return
      }

      const response = await fetch(`${backendUrl}/api/project/read`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setSoftware(data)
      } else {
        showToast('error', 'Error', 'Failed to fetch software')
      }
    } catch (error) {
      console.error('Error fetching software:', error)
      showToast('error', 'Error', 'Failed to fetch software')
    } finally {
      setIsLoading(false)
    }
  }

  const handleViewDetails = (software: Software) => {
    setSelectedSoftware(software)
  }

  const handleCloseModal = () => {
    setSelectedSoftware(null)
  }

  const handleSubscriptionSuccess = () => {
    fetchSoftware()
  }

  const filteredSoftware = software.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <AuthGuard requireVerification={true} allowedRoles={[1]}>
      <div className="bg-white py-3 sm:py-6 px-2 sm:px-4 lg:px-8 rounded-lg border border-gray-200">
        <div className="max-w-7xl mx-auto h-[calc(100vh-120px)] sm:h-[calc(100vh-180px)] overflow-y-auto">
          {!selectedSoftware ? (
            <>
              {/* Header Section */}
              <div className="text-center mb-4 sm:mb-5 pt-2 sm:pt-5 px-2">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
                  Software Marketplace
                </h1>
                <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto px-4">
                  Discover and subscribe to powerful software solutions. Start with a 7-day free trial!
                </p>
              </div>

              {/* Search Bar */}
              <div className="max-w-2xl mx-auto mb-4 sm:mb-6 px-2">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search software..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 sm:px-6 py-2 pl-10 sm:pl-12 rounded-md border border-gray-300 focus:outline-none focus:border-gray-500 text-gray-900 text-sm sm:text-base"
                  />
                  <svg 
                    className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400"
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>

              {/* Software Grid */}
              {filteredSoftware.length === 0 ? (
                <div className="text-center py-8 sm:py-16 px-4">
                  <div className="flex flex-col items-center space-y-3 sm:space-y-4">
                    <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gray-100 rounded-full flex items-center justify-center">
                      <img 
                        src="/svg/software.svg" 
                        alt="No software"
                        className="w-8 h-8 sm:w-12 sm:h-12 opacity-50"
                      />
                    </div>
                    <p className="text-base sm:text-xl text-gray-600">
                      {searchQuery ? 'No software found matching your search' : 'No software available at the moment'}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 px-2">
                  {filteredSoftware.map((item) => (
                    <SoftwareCard
                      key={item.id}
                      software={item}
                      onViewDetails={handleViewDetails}
                    />
                  ))}
                </div>
              )}
            </>
          ) : (
            /* Software Detail View */
            <div className="h-full overflow-y-auto">
              <SoftwareDetailModal
                software={selectedSoftware}
                onClose={handleCloseModal}
                userId={user.id}
                onSubscriptionSuccess={handleSubscriptionSuccess}
              />
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  )
}
