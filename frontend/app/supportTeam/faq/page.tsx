'use client'

import { useEffect, useState } from 'react'
import AuthGuard from '@/components/AuthGuard'
import { FAQ } from '@/types/faq'
import { useToast } from '@/lib/context/ToastContext'
import ConfirmDialog from '@/components/ConfirmDialog'
import { getBackendUrl } from '@/lib/api'

export default function SupportTeamFAQPage() {
  const backendUrl = getBackendUrl()
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [showEditForm, setShowEditForm] = useState(false)
  const [editingFAQ, setEditingFAQ] = useState<FAQ | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deletingFAQ, setDeletingFAQ] = useState<FAQ | null>(null)
  
  // Modal states
  const [showPDFModal, setShowPDFModal] = useState(false)
  const [selectedFAQ, setSelectedFAQ] = useState<FAQ | null>(null)
  
  // Form states
  const [title, setTitle] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [editIsDragOver, setEditIsDragOver] = useState(false)
  
  const { showToast } = useToast()

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

  const fetchFAQs = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/faq/read`)
      if (response.ok) {
        const data = await response.json()
        setFaqs(data)
      } else {
        showToast('error', 'Error', 'Failed to fetch FAQs')
      }
    } catch (error) {
      console.error('Error fetching FAQs:', error)
      showToast('error', 'Error', 'Failed to fetch FAQs')
    }
  }

  const handleCreateFAQ = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!title.trim()) {
      showToast('error', 'Validation Error', 'Title is required')
      return
    }
    
    if (!selectedFile) {
      showToast('error', 'Validation Error', 'PDF file is required')
      return
    }
    
    if (!selectedFile.name.toLowerCase().endsWith('.pdf')) {
      showToast('error', 'Validation Error', 'Only PDF files are allowed')
      return
    }

    setIsSubmitting(true)
    
    try {
      const token = localStorage.getItem('token')
      const formData = new FormData()
      formData.append('title', title)
      formData.append('file', selectedFile)

      const response = await fetch(`${backendUrl}/api/faq/create`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData
      })

      const data = await response.json()

      if (response.ok && data.status === 1) {
        showToast('success', 'Success', 'FAQ created successfully')
        setTitle('')
        setSelectedFile(null)
        // Reset the file input
        const fileInput = document.getElementById('file') as HTMLInputElement
        if (fileInput) fileInput.value = ''
        fetchFAQs()
      } else {
        showToast('error', 'Error', data.message || 'Failed to create FAQ')
      }
    } catch (error) {
      console.error('Error creating FAQ:', error)
      showToast('error', 'Error', 'Failed to create FAQ')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditFAQ = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!editingFAQ || !title.trim()) {
      showToast('error', 'Validation Error', 'Title is required')
      return
    }

    setIsSubmitting(true)
    
    try {
      const token = localStorage.getItem('token')
      
      if (selectedFile) {
        // Update with new file
        if (!selectedFile.name.toLowerCase().endsWith('.pdf')) {
          showToast('error', 'Validation Error', 'Only PDF files are allowed')
          setIsSubmitting(false)
          return
        }
        
        const formData = new FormData()
        formData.append('id', editingFAQ.id.toString())
        formData.append('title', title)
        formData.append('file', selectedFile)

        const response = await fetch(`${backendUrl}/api/faq/update`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData
        })

        const data = await response.json()

        if (response.ok && data.status === 1) {
          showToast('success', 'Success', 'FAQ updated successfully')
          setShowEditForm(false)
          setEditingFAQ(null)
          setTitle('')
          setSelectedFile(null)
          fetchFAQs()
        } else {
          showToast('error', 'Error', data.message || 'Failed to update FAQ')
        }
      } else {
        // Update without new file
        const response = await fetch(`${backendUrl}/api/faq/update`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            id: editingFAQ.id,
            title: title
          })
        })

        const data = await response.json()

        if (response.ok && data.status === 1) {
          showToast('success', 'Success', 'FAQ updated successfully')
          setShowEditForm(false)
          setEditingFAQ(null)
          setTitle('')
          setSelectedFile(null)
          fetchFAQs()
        } else {
          showToast('error', 'Error', data.message || 'Failed to update FAQ')
        }
      }
    } catch (error) {
      console.error('Error updating FAQ:', error)
      showToast('error', 'Error', 'Failed to update FAQ')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteFAQ = async () => {
    if (!deletingFAQ) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${backendUrl}/api/faq/delete?id=${deletingFAQ.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      })

      const data = await response.json()

      if (response.ok && data.status === 1) {
        showToast('success', 'Success', 'FAQ deleted successfully')
        fetchFAQs()
      } else {
        showToast('error', 'Error', data.message || 'Failed to delete FAQ')
      }
    } catch (error) {
      console.error('Error deleting FAQ:', error)
      showToast('error', 'Error', 'Failed to delete FAQ')
    } finally {
      setShowDeleteConfirm(false)
      setDeletingFAQ(null)
    }
  }

  const startEdit = (faq: FAQ) => {
    setEditingFAQ(faq)
    setTitle(faq.title)
    setSelectedFile(null)
    setShowEditForm(true)
  }

  const startDelete = (faq: FAQ) => {
    setDeletingFAQ(faq)
    setShowDeleteConfirm(true)
  }

  const cancelForm = () => {
    setShowEditForm(false)
    setEditingFAQ(null)
    setTitle('')
    setSelectedFile(null)
  }

  // Drag and drop handlers for create form
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const files = e.dataTransfer.files
    if (files.length > 0) {
      const file = files[0]
      if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
        setSelectedFile(file)
      } else {
        showToast('error', 'Invalid File', 'Only PDF files are allowed')
      }
    }
  }

  // Drag and drop handlers for edit form
  const handleEditDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setEditIsDragOver(true)
  }

  const handleEditDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setEditIsDragOver(false)
  }

  const handleEditDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setEditIsDragOver(false)
    
    const files = e.dataTransfer.files
    if (files.length > 0) {
      const file = files[0]
      if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
        setSelectedFile(file)
      } else {
        showToast('error', 'Invalid File', 'Only PDF files are allowed')
      }
    }
  }

  const downloadFAQ = (e: React.MouseEvent, filename: string, title: string) => {
    e.stopPropagation() // Prevent row click when clicking download icon
    const downloadUrl = `${backendUrl}/faq/download?filepath=${encodeURIComponent(filename)}`
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = `${title}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const openPDFModal = (faq: FAQ) => {
    setSelectedFAQ(faq)
    setShowPDFModal(true)
  }

  const closePDFModal = () => {
    setShowPDFModal(false)
    setSelectedFAQ(null)
  }

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-500"></div>
      </div>
    )
  }

  return (
    <AuthGuard requireVerification={true} allowedRoles={[2]}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            FAQ Management
          </h1>
          <p className="text-gray-600">
            Create and manage frequently asked questions for users.
          </p>
        </div>

        {/* Add New FAQ Form - Single Line */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <form onSubmit={handleCreateFAQ} className="flex flex-col sm:flex-row gap-3 items-end">
            <div className="flex-1">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Title *
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none "
                placeholder="Enter FAQ title"
                required
                disabled={showEditForm}
              />
            </div>
            
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                PDF File *
              </label>
              <div className="relative">
                <input
                  type="file"
                  id="file"
                  accept=".pdf"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                  required
                  disabled={showEditForm}
                />
                <div 
                  className={`w-full px-4 py-2 border-2 border-dashed rounded-lg transition-all duration-200 ${
                    showEditForm 
                      ? 'border-gray-200 bg-gray-50 cursor-not-allowed' 
                      : isDragOver
                        ? 'border-blue-500 bg-blue-100 scale-[1.02]'
                        : selectedFile 
                          ? 'border-green-300 bg-green-50' 
                          : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50 cursor-pointer'
                  }`}
                  onDragOver={!showEditForm ? handleDragOver : undefined}
                  onDragLeave={!showEditForm ? handleDragLeave : undefined}
                  onDrop={!showEditForm ? handleDrop : undefined}
                >
                  <div className="flex items-center justify-center space-x-2">
                    {selectedFile ? (
                      <>
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-sm text-green-700 font-medium truncate">{selectedFile.name}</span>
                      </>
                    ) : (
                      <>
                        <svg className={`w-5 h-5 ${isDragOver ? 'text-blue-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <span className={`text-sm ${isDragOver ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>
                          {isDragOver ? 'Drop PDF file here' : 'select the pdf file'}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={isSubmitting || showEditForm}
                className="px-4 py-2 text-sm  text-white bg-gray-800 border border-transparent rounded-md hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {isSubmitting ? 'Creating...' : 'Create FAQ'}
              </button>
            </div>
          </form>
         
        </div>

        {/* Edit Form */}
        {showEditForm && editingFAQ && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Edit FAQ</h2>
            <form onSubmit={handleEditFAQ} className="space-y-4">
              <div>
                <label htmlFor="edit-title" className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  id="edit-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none  focus:border-transparent"
                  placeholder="Enter FAQ title"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  PDF File (optional - leave empty to keep existing file)
                </label>
                <div className="relative">
                  <input
                    type="file"
                    id="edit-file"
                    accept=".pdf"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div 
                    className={`w-full px-4 py-3 border-2 border-dashed rounded-lg transition-all duration-200 ${
                      editIsDragOver
                        ? 'border-blue-500 bg-blue-100 scale-[1.02]'
                        : selectedFile 
                          ? 'border-green-300 bg-green-50' 
                          : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50 cursor-pointer'
                    }`}
                    onDragOver={handleEditDragOver}
                    onDragLeave={handleEditDragLeave}
                    onDrop={handleEditDrop}
                  >
                    <div className="flex items-center justify-center space-x-2">
                      {selectedFile ? (
                        <>
                          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-sm text-green-700 font-medium truncate">{selectedFile.name}</span>
                        </>
                      ) : (
                        <>
                          <svg className={`w-5 h-5 ${editIsDragOver ? 'text-blue-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                          <span className={`text-sm ${editIsDragOver ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>
                            {editIsDragOver ? 'Drop PDF file here' : 'Choose new PDF file or drag and drop'}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-gray-500">
                    Current file: <span className="font-medium">{editingFAQ.filename}</span>
                  </p>
                  <p className="text-xs text-gray-400">Only PDF files allowed</p>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={cancelForm}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Updating...' : 'Update FAQ'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* FAQ List */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="px-4 py-2 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              FAQ List ({faqs.length})
            </h2>
          </div>
          
          {faqs.length === 0 ? (
            <div className="p-8 text-center">
              <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-gray-500 text-lg font-medium mb-2">No FAQs Yet</p>
              <p className="text-gray-400">Create your first FAQ using the form above.</p>
            </div>
          ) : (
            <div className="overflow-x-auto border border-gray-300 mt-4 rounded-md">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {faqs.map((faq) => (
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
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              startDelete(faq);
                            }}
                            className="text-red-600 hover:text-red-900"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
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

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onCancel={() => {
          setShowDeleteConfirm(false)
          setDeletingFAQ(null)
        }}
        onConfirm={handleDeleteFAQ}
        title="Delete FAQ"
        message={`Are you sure you want to delete "${deletingFAQ?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        type="danger"
      />
    </AuthGuard>
  )
}
