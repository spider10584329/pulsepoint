'use client'

import { useEffect, useState } from 'react'
import AuthGuard from '@/components/AuthGuard'
import { FAQ } from '@/types/faq'
import { useToast } from '@/lib/context/ToastContext'
import { getBackendUrl } from '@/lib/api'

export default function UserFAQPage() {
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [filteredFaqs, setFilteredFaqs] = useState<FAQ[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [showPDFModal, setShowPDFModal] = useState(false)
  const [selectedFAQ, setSelectedFAQ] = useState<FAQ | null>(null)
  const { showToast } = useToast()
  const backendUrl = getBackendUrl()

 const openPDFModal = (faq: FAQ) => {
    setSelectedFAQ(faq)
    setShowPDFModal(true)
  }

  const closePDFModal = () => {
    setShowPDFModal(false)
    setSelectedFAQ(null)
  }

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData)
        setUser(parsedUser)
        fetchFAQs()
      } catch (error) {
        console.error('Error parsing user data:', error)
      }
    }
    setIsLoading(false)
  }, [])

  useEffect(() => {
    // Filter FAQs based on search query
    if (searchQuery.trim() === '') {
      setFilteredFaqs(faqs)
    } else {
      const filtered = faqs.filter(faq =>
        faq.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredFaqs(filtered)
    }
  }, [searchQuery, faqs])

  const fetchFAQs = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/faq/read`)
      if (response.ok) {
        const data = await response.json()
        setFaqs(data)
        setFilteredFaqs(data)
      } else {
        showToast('error', 'Error', 'Failed to fetch FAQs')
      }
    } catch (error) {
      console.error('Error fetching FAQs:', error)
      showToast('error', 'Error', 'Failed to fetch FAQs')
    }
  }

  const downloadFAQ = (e: React.MouseEvent, filename: string, title: string) => {
    e.stopPropagation()
    const downloadUrl = `${backendUrl}/faq/download?filepath=${encodeURIComponent(filename)}`
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = `${title}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
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
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Frequently Asked Questions
          </h1>
          <p className="text-gray-600 mt-2">
            Find answers to common questions and get help with platform usage.
          </p>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 "
              placeholder="Search FAQs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          {searchQuery && (
            <div className="mt-2 text-sm text-gray-600">
              {filteredFaqs.length} result{filteredFaqs.length !== 1 ? 's' : ''} found
              {filteredFaqs.length !== faqs.length && ` out of ${faqs.length} total FAQs`}
            </div>
          )}
        </div>

        {/* FAQ List */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              FAQ List ({filteredFaqs.length})
            </h2>
          </div>

          {filteredFaqs.length === 0 ? (
            <div className="p-8 text-center">
              {faqs.length === 0 ? (
                <>
                  <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-gray-500 text-lg font-medium mb-2">No FAQs Available</p>
                  <p className="text-gray-400">
                    There are currently no frequently asked questions available. Check back later for helpful resources.
                  </p>
                </>
              ) : (
                <>
                  <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <p className="text-gray-500 text-lg font-medium mb-2">No Results Found</p>
                  <p className="text-gray-400 mb-4">
                    We couldn't find any FAQs matching "{searchQuery}". Try different keywords or browse all FAQs.
                  </p>
                  <button
                    onClick={() => setSearchQuery('')}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-gray-800 rounded-md hover:bg-gray-900"
                  >
                    Clear Search
                  </button>
                </>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto border border-gray-300 mt-4 rounded-md">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      TITLE
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ACTIONS
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredFaqs.map((faq) => (
                    <tr 
                      key={faq.id} 
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => openPDFModal(faq)}
                    >
                      <td className="px-6 py-2 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {faq.title}
                        </div>
                      </td>
                      <td className="px-6 py-2 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={(e) => downloadFAQ(e, faq.filename, faq.title)}
                            className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded transition-colors"
                            title="Download PDF"
                          >
                            <img src="/svg/file.svg" alt="Download" className="w-6 h-6" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>        
      </div>
      {/* PDF Modal */}
        {showPDFModal && selectedFAQ && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white  shadow-xl w-full max-w-4xl h-[90vh] flex flex-col">
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  {selectedFAQ.title}
                </h2>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={closePDFModal}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-hidden">
                <iframe
                  src={`${backendUrl}/faq/view?filepath=${encodeURIComponent(selectedFAQ.filename)}#view=FitH`}
                  className="w-full h-full border-0"
                  title={selectedFAQ.title}
                />
              </div>
            </div>
          </div>
        )}
    </AuthGuard>
  )
}

