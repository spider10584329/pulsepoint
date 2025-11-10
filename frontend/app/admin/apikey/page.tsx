'use client'

import { useState, useEffect } from 'react'
import AuthGuard from '@/components/AuthGuard'
import { useToast } from '@/lib/context/ToastContext'
import { getBackendUrl } from '@/lib/api'

export default function APIKeyPage() {
  const [generatedApiKey, setGeneratedApiKey] = useState('')
  const [completeApiUrl, setCompleteApiUrl] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const { showToast } = useToast()
  const backendUrl = getBackendUrl()

  // Load existing API key on component mount
  useEffect(() => {
    fetchExistingApiKey()
  }, [])

  const fetchExistingApiKey = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${backendUrl}/api/apikey/current`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()

      if (response.ok && data.apiKey) {
        setGeneratedApiKey(data.apiKey)
        setCompleteApiUrl(data.apiUrl)
      }
    } catch (error) {
      console.error('Error fetching existing API key:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGenerateKey = async () => {
    setIsGenerating(true)
    
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${backendUrl}/api/apikey/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()

      if (response.ok && data.status === 1) {
        setGeneratedApiKey(data.apiKey)
        setCompleteApiUrl(data.apiUrl)
        showToast('success', 'Success', 'API Key generated successfully')
      } else {
        showToast('error', 'Error', data.message || 'Failed to generate API key')
      }
    } catch (error) {
      console.error('Error generating API key:', error)
      showToast('error', 'Error', 'Failed to generate API key')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      showToast('success', 'Copied', `${label} copied to clipboard`)
    }).catch(() => {
      showToast('error', 'Error', 'Failed to copy to clipboard')
    })
  }

  const handleDownloadCSV = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${backendUrl}/api/subscription/download/csv`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        const data = await response.json()
        showToast('error', 'Error', data.message || 'Failed to download CSV file')
        return
      }

      // Get the blob from response
      const blob = await response.blob()
      
      // Create download link
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      
      // Get filename from Content-Disposition header or use default
      const contentDisposition = response.headers.get('Content-Disposition')
      let filename = `subscription_data_${new Date().toISOString().split('T')[0]}.csv`
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+)"?/)
        if (filenameMatch) {
          filename = filenameMatch[1]
        }
      }
      
      link.setAttribute('download', filename)
      document.body.appendChild(link)
      link.click()
      
      // Cleanup
      link.remove()
      window.URL.revokeObjectURL(url)

      showToast('success', 'Success', 'CSV file downloaded successfully')
    } catch (error) {
      console.error('Error downloading CSV:', error)
      showToast('error', 'Error', 'Failed to download CSV file')
    }
  }

  return (
    <AuthGuard requireVerification={true} allowedRoles={[0]}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">API Key</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Section - Generate API Key */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Generate API Key</h2>
            <p className="text-sm text-gray-600 mb-6">
              Create a new API key for accessing the inventory system.
            </p>

            {/* Generated API Key */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Generated API Key
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={isLoading ? 'Loading...' : generatedApiKey}
                  readOnly
                  className="flex-1 px-3 sm:px-4 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700 text-sm break-all"
                  placeholder={generatedApiKey ? generatedApiKey : ''}
                />
                <button
                  onClick={() => handleCopy(generatedApiKey, 'API Key')}
                  disabled={!generatedApiKey}
                  className="px-4 py-2 bg-emerald-500 text-white rounded-md hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy
                </button>
              </div>
            </div>

            {/* Complete API URL */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Complete API URL
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={isLoading ? 'Loading...' : completeApiUrl}
                  readOnly
                  className="flex-1 px-3 sm:px-4 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700 text-sm break-all"
                  placeholder={completeApiUrl ? completeApiUrl : ''}
                />
                <button
                  onClick={() => handleCopy(completeApiUrl, 'API URL')}
                  disabled={!completeApiUrl}
                  className="px-4 py-2 bg-emerald-500 text-white rounded-md hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy
                </button>
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerateKey}
              disabled={isGenerating}
              className="w-full px-6 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-900 transition-colors  flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
              {isGenerating ? 'Generating...' : 'Generate Key'}
            </button>
          </div>

          {/* Right Section - Export to external file */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Export to external file</h2>
            <p className="text-sm text-gray-600 mb-6">
              Download inventory data in various formats for external use.
            </p>

            {/* Export to CSV Section */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-4">
              <h3 className="text-lg font-semibold text-emerald-800 mb-2">Export to CSV file</h3>
              <p className="text-sm text-emerald-700 mb-4">
                CSV files are plaintext data files separated by commas, so they can be opened directly as Excel sheets and are a very useful file format for exporting and importing data from other programs.
              </p>
              
              <button
                onClick={handleDownloadCSV}
                className="w-full px-6 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors  flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download CSV
              </button>
            </div>

            {/* CSV Structure */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-yellow-800 mb-2">CSV Structure</h3>
              <p className="text-xs text-yellow-700 mb-2">
                The CSV file will contain all subscription fields with resolved names:
              </p>
              <div className="bg-yellow-100 rounded p-2 overflow-x-auto">
                <code className="text-xs text-yellow-900 break-all">
                  customerID,customerEmail,softwareID,softwareName,purchaseDate,period,paymentPrice,expirationDate
                </code>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}
